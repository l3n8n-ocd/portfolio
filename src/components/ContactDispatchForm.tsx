/// <reference types="vite/client" />
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'

/*
 * ContactDispatchForm: the portfolio's one dynamic feature.
 *
 * A static site on GitHub Pages has no server of its own, so this form sends a
 * JSON POST to a free-tier form relay (FormSubmit.co by default, Web3Forms when
 * VITE_WEB3FORMS_ACCESS_KEY is set at build time). The relay emails the message
 * to RECIPIENT and answers with JSON, and the UI shows exactly what was sent
 * and what came back. Plain-words walkthrough: docs/MAKE_IT_DO_SOMETHING.md
 */

const RECIPIENT = 'ladriano0209@gmail.com'
const SUBJECT = '[Portfolio Dispatch] New Walkthrough Request'
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${RECIPIENT}`
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim() || ''
const REQUEST_TIMEOUT_MS = 20_000

const TOPICS = [
  'MicroCredit API State Machine & Ledger',
  'Node2Shell CVE-2026-111497 Research',
  'Cloud Security & DevSecOps Internship/Role',
  'General Inquiry',
] as const

type Topic = (typeof TOPICS)[number]
type Status = 'idle' | 'submitting' | 'succeeded' | 'error'
type Provider = 'FormSubmit.co' | 'Web3Forms'

interface FormFields {
  name: string
  email: string
  walkthroughTopic: Topic | ''
  message: string
  _honey: string
}

type FieldName = 'name' | 'email' | 'walkthroughTopic' | 'message'
type FieldErrors = Partial<Record<FieldName, string>>

interface Telemetry {
  provider: Provider
  method: 'POST'
  endpoint: string
  requestHeaders: Record<string, string>
  payload: Record<string, unknown>
  requestId: string
  sentAtUtc: string
  durationMs: number
  httpStatus: number | null
  httpStatusText: string
  responseBody: unknown
}

interface Receipt {
  requestId: string
  deliveredAtUtc: string
  name: string
  email: string
  topic: Topic
}

const EMPTY_FIELDS: FormFields = { name: '', email: '', walkthroughTopic: '', message: '', _honey: '' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  403: 'Forbidden',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
}

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {}
  const name = fields.name.trim()
  const email = fields.email.trim()
  const message = fields.message.trim()

  if (!name) errors.name = 'Please enter your name or organization.'
  else if (name.length > 100) errors.name = 'Please keep this under 100 characters.'

  if (!email) errors.email = 'Please enter a reply-to email address.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.'

  if (!fields.walkthroughTopic) errors.walkthroughTopic = 'Please choose a topic.'

  if (!message) errors.message = 'Please enter a message or a preferred 15-minute time window.'
  else if (message.length < 10) errors.message = 'Please enter at least 10 characters.'
  else if (message.length > 3000) errors.message = 'Please keep this under 3,000 characters.'

  return errors
}

/* Same fields in, same key out: it identifies one message, not one click. */
async function deriveRequestId(fields: FormFields): Promise<string> {
  const canonical = [
    fields.name.trim(),
    fields.email.trim().toLowerCase(),
    fields.walkthroughTopic,
    fields.message.trim(),
  ].join('␟')

  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
    const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
    return `req_${hex.slice(0, 16)}`
  }

  // Fallback for non-secure contexts: two FNV-1a 32-bit passes.
  let a = 0x811c9dc5
  let b = 0x01000193
  for (let i = 0; i < canonical.length; i += 1) {
    a = Math.imul(a ^ canonical.charCodeAt(i), 0x01000193) >>> 0
    b = Math.imul(b ^ canonical.charCodeAt(canonical.length - 1 - i), 0x811c9dc5) >>> 0
  }
  return `req_${a.toString(16).padStart(8, '0')}${b.toString(16).padStart(8, '0')}`
}

function toUtcStamp(date: Date): string {
  return `${date.toISOString().slice(0, 19).replace('T', ' ')} UTC`
}

function buildRequest(fields: FormFields, requestId: string) {
  const common = {
    name: fields.name.trim(),
    email: fields.email.trim(),
    walkthroughTopic: fields.walkthroughTopic,
    message: fields.message.trim(),
    request_id: requestId,
  }

  if (WEB3FORMS_ACCESS_KEY) {
    return {
      provider: 'Web3Forms' as Provider,
      endpoint: WEB3FORMS_ENDPOINT,
      body: { access_key: WEB3FORMS_ACCESS_KEY, subject: SUBJECT, from_name: 'Portfolio Dispatch', ...common },
    }
  }

  return {
    provider: 'FormSubmit.co' as Provider,
    endpoint: FORMSUBMIT_ENDPOINT,
    body: { ...common, _subject: SUBJECT, _replyto: common.email, _template: 'table', _honey: fields._honey },
  }
}

/* What the telemetry drawer shows: no spam-trap field, access key masked. */
function sanitizeForDisplay(body: Record<string, unknown>): Record<string, unknown> {
  const { _honey: _ignored, ...rest } = body
  void _ignored
  if (typeof rest.access_key === 'string') {
    rest.access_key = `••••••••${rest.access_key.slice(-4)}`
  }
  return rest
}

function isRelaySuccess(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const flag = (body as { success?: unknown }).success
  return flag === true || flag === 'true'
}

function relayMessage(body: unknown): string {
  if (body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string') {
    return (body as { message: string }).message
  }
  return ''
}

export default function ContactDispatchForm() {
  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [requestId, setRequestId] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const inFlight = useRef(false)
  const delivered = useRef(new Set<string>())

  useEffect(() => {
    let cancelled = false
    deriveRequestId(fields).then((id) => {
      if (!cancelled) setRequestId(id)
    })
    return () => {
      cancelled = true
    }
  }, [fields])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    if (status === 'error') {
      setStatus('idle')
      setErrorMessage('')
    }
  }

  const resetForm = () => {
    setFields(EMPTY_FIELDS)
    setErrors({})
    setStatus('idle')
    setErrorMessage('')
    setReceipt(null)
    setTelemetry(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inFlight.current) return

    const nextErrors = validate(fields)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    // Spam trap: people never see this field, so anything in it came from a bot.
    if (fields._honey) {
      setStatus('error')
      setErrorMessage('Submission rejected.')
      return
    }

    inFlight.current = true
    setStatus('submitting')
    setErrorMessage('')

    const id = await deriveRequestId(fields)
    if (delivered.current.has(id)) {
      inFlight.current = false
      setStatus('error')
      setErrorMessage(`This exact message was already delivered (${id}). Change something to send it again.`)
      return
    }

    const request = buildRequest(fields, id)
    const requestHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' }
    const startedAt = new Date()
    const startedPerf = performance.now()
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const record = (httpStatus: number | null, httpStatusText: string, responseBody: unknown) =>
      setTelemetry({
        provider: request.provider,
        method: 'POST',
        endpoint: request.endpoint,
        requestHeaders,
        payload: sanitizeForDisplay(request.body),
        requestId: id,
        sentAtUtc: toUtcStamp(startedAt),
        durationMs: Math.round(performance.now() - startedPerf),
        httpStatus,
        httpStatusText,
        responseBody,
      })

    try {
      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(request.body),
        signal: controller.signal,
      })

      const raw = await response.text()
      let body: unknown = raw
      try {
        body = raw ? JSON.parse(raw) : null
      } catch {
        // Not JSON: keep the raw text for the telemetry drawer.
      }

      const statusText = response.statusText || STATUS_TEXT[response.status] || ''
      record(response.status, statusText, body)

      if (response.ok && isRelaySuccess(body)) {
        delivered.current.add(id)
        setReceipt({
          requestId: id,
          deliveredAtUtc: toUtcStamp(new Date()),
          name: fields.name.trim(),
          email: fields.email.trim(),
          topic: fields.walkthroughTopic as Topic,
        })
        setStatus('succeeded')
        return
      }

      const detail = relayMessage(body)
      const needsActivation = /activat/i.test(detail)
      setStatus('error')
      setErrorMessage(
        needsActivation
          ? `The form relay needs a one-time activation. The site owner has to confirm it from the activation email sent to ${RECIPIENT}. (${detail})`
          : `The relay did not accept the message (HTTP ${response.status}${statusText ? ` ${statusText}` : ''}).${detail ? ` ${detail}` : ''} You can also email ${RECIPIENT} directly.`,
      )
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError'
      record(null, timedOut ? 'Timed out' : 'Network error', String(error))
      setStatus('error')
      setErrorMessage(
        timedOut
          ? `No response after ${REQUEST_TIMEOUT_MS / 1000} seconds. Please try again, or email ${RECIPIENT} directly.`
          : `The request could not reach the relay (network error or blocked request). Please try again, or email ${RECIPIENT} directly.`,
      )
    } finally {
      window.clearTimeout(timer)
      inFlight.current = false
    }
  }

  const submitting = status === 'submitting'

  if (status === 'succeeded' && receipt) {
    return (
      <div className="contact-form dispatch-panel">
        <div className="dispatch-receipt" role="status" aria-live="polite">
          <p className="dispatch-receipt-title">
            <span aria-hidden="true">✓</span> Delivery Confirmed
          </p>
          <dl className="dispatch-receipt-grid">
            <dt>Delivered</dt>
            <dd className="dispatch-mono">{receipt.deliveredAtUtc}</dd>
            <dt>Request ID</dt>
            <dd className="dispatch-mono">{receipt.requestId}</dd>
            <dt>From</dt>
            <dd>
              {receipt.name} &lt;{receipt.email}&gt;
            </dd>
            <dt>Topic</dt>
            <dd>{receipt.topic}</dd>
          </dl>
          <p className="dispatch-receipt-note">
            Your message is on its way to my inbox. I'll reply to {receipt.email}.
          </p>
        </div>

        {telemetry && <TelemetryDrawer telemetry={telemetry} succeeded />}

        <button type="button" className="secondary-button dispatch-reset" onClick={resetForm}>
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form dispatch-panel" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <div className="dispatch-header">
        <span className="dispatch-tag">POST /dispatch</span>
        <span className="dispatch-badge" title="Derived from the message contents: the same message always gets the same key">
          <span className="dispatch-badge-label">X-Idempotency-Key</span>
          <span className="dispatch-mono">{requestId || 'computing…'}</span>
        </span>
      </div>

      <fieldset className="dispatch-fields" disabled={submitting}>
        <label>
          Name / Organization
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your name or company"
            value={fields.name}
            onChange={handleChange}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'dispatch-name-error' : undefined}
          />
          {errors.name && <span id="dispatch-name-error" className="field-error">{errors.name}</span>}
        </label>

        <label>
          Reply-To Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={fields.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'dispatch-email-error' : undefined}
          />
          {errors.email && <span id="dispatch-email-error" className="field-error">{errors.email}</span>}
        </label>

        <label>
          Walkthrough Topic
          <select
            name="walkthroughTopic"
            value={fields.walkthroughTopic}
            onChange={handleChange}
            aria-invalid={Boolean(errors.walkthroughTopic)}
            aria-describedby={errors.walkthroughTopic ? 'dispatch-topic-error' : undefined}
          >
            <option value="" disabled>
              Choose a 15-minute walkthrough topic
            </option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.walkthroughTopic && (
            <span id="dispatch-topic-error" className="field-error">{errors.walkthroughTopic}</span>
          )}
        </label>

        <label>
          Message / Preferred 15-Min Time Window
          <textarea
            name="message"
            rows={5}
            placeholder="What you'd like to cover, plus a time window that works for you (with time zone)"
            value={fields.message}
            onChange={handleChange}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'dispatch-message-error' : undefined}
          />
          {errors.message && <span id="dispatch-message-error" className="field-error">{errors.message}</span>}
        </label>

        <div className="dispatch-honeypot" aria-hidden="true">
          <label>
            Leave this field empty
            <input type="text" name="_honey" tabIndex={-1} autoComplete="off" value={fields._honey} onChange={handleChange} />
          </label>
        </div>
      </fieldset>

      <button type="submit" className="primary-button submit-button" disabled={submitting}>
        {submitting ? 'Dispatching over HTTPS...' : 'Send Message'}
      </button>

      {status === 'error' && errorMessage && (
        <p className="dispatch-error" role="alert">
          {errorMessage}
        </p>
      )}

      {status === 'error' && telemetry && <TelemetryDrawer telemetry={telemetry} succeeded={false} />}
    </form>
  )
}

function TelemetryDrawer({ telemetry, succeeded }: { telemetry: Telemetry; succeeded: boolean }) {
  const statusLine =
    telemetry.httpStatus === null ? telemetry.httpStatusText : `${telemetry.httpStatus} ${telemetry.httpStatusText}`.trim()

  const steps = [
    'Browser form state: React held the four fields in component state.',
    'Validation: required fields, email format and the spam-trap field checked in the browser.',
    `JSON serialization: fields packed into a JSON body tagged ${telemetry.requestId}.`,
    `HTTPS POST: sent to ${telemetry.provider}, a free-tier form relay running on its own server.`,
    `SMTP delivery: the relay emails the message to ${RECIPIENT}.`,
    `JSON response: the relay answered ${statusLine} in ${telemetry.durationMs} ms and the UI updated.`,
  ]

  return (
    <details className="dispatch-telemetry">
      <summary>How This Data Just Flowed (Frontend → Backend → Inbox)</summary>

      <ol className="dispatch-steps">
        {steps.map((step, index) => (
          <li key={step} className={!succeeded && index >= 4 ? 'is-pending' : undefined}>
            {step}
          </li>
        ))}
      </ol>

      <div className="dispatch-wire">
        <p className="dispatch-wire-label">Request · {telemetry.sentAtUtc}</p>
        <pre className="dispatch-code">
          {`${telemetry.method} ${telemetry.endpoint}\n${Object.entries(telemetry.requestHeaders)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}\n\n${JSON.stringify(telemetry.payload, null, 2)}`}
        </pre>

        <p className="dispatch-wire-label">
          Response ·{' '}
          <span className={telemetry.httpStatus && telemetry.httpStatus < 300 ? 'dispatch-ok' : 'dispatch-fail'}>
            {statusLine}
          </span>{' '}
          · {telemetry.durationMs} ms
        </p>
        <pre className="dispatch-code">
          {typeof telemetry.responseBody === 'string'
            ? telemetry.responseBody
            : JSON.stringify(telemetry.responseBody, null, 2)}
        </pre>
      </div>
    </details>
  )
}
