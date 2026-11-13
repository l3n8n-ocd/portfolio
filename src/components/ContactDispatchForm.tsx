/// <reference types="vite/client" />
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'

/*
 * ContactDispatchForm: the portfolio's one dynamic feature.
 *
 * A static site on GitHub Pages has no server of its own, so this form sends a
 * JSON POST to a free-tier form relay (FormSubmit.co by default, Web3Forms when
 * VITE_WEB3FORMS_ACCESS_KEY is set at build time), which emails the message to
 * my inbox. Plain-words walkthrough: docs/MAKE_IT_DO_SOMETHING.md
 */

const RECIPIENT = 'ladriano0209@gmail.com'
// FormSubmit alias for RECIPIENT (from the activation email), so the address isn't in the request URL.
const FORMSUBMIT_ALIAS = 'cae75c4e129755785e3fe37c2f283c55'
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${FORMSUBMIT_ALIAS}`
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim() || ''
const SUBJECT_PREFIX = '[Portfolio Dispatch] New Walkthrough Request'
const REQUEST_TIMEOUT_MS = 45_000

const TOPICS = [
  'MicroCredit API State Machine & Ledger',
  'Node2Shell CVE-2026-111497 Research',
  'Cloud Security & DevSecOps Internship/Role',
  'General Inquiry',
] as const

type Topic = (typeof TOPICS)[number]
type Status = 'idle' | 'submitting' | 'succeeded' | 'error'

interface FormFields {
  name: string
  email: string
  walkthroughTopic: Topic | ''
  message: string
  _honey: string
}

type FieldName = 'name' | 'email' | 'walkthroughTopic' | 'message'
type FieldErrors = Partial<Record<FieldName, string>>

const EMPTY_FIELDS: FormFields = { name: '', email: '', walkthroughTopic: '', message: '', _honey: '' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

/*
 * The email arrives as a table whose row labels are these keys, so they are
 * written as the labels the recipient should read.
 */
function buildRequest(fields: FormFields) {
  const name = fields.name.trim()
  const email = fields.email.trim()
  const subject = `${SUBJECT_PREFIX}: ${fields.walkthroughTopic} (${name})`
  const emailRows = {
    'Name / Organization': name,
    'Reply-To Email': email,
    'Walkthrough Topic': fields.walkthroughTopic,
    'Message / Preferred Time Window': fields.message.trim(),
    'Submitted (UTC)': `${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`,
  }

  if (WEB3FORMS_ACCESS_KEY) {
    return {
      endpoint: WEB3FORMS_ENDPOINT,
      body: { access_key: WEB3FORMS_ACCESS_KEY, subject, from_name: name, replyto: email, ...emailRows },
    }
  }

  return {
    endpoint: FORMSUBMIT_ENDPOINT,
    body: { ...emailRows, _subject: subject, _replyto: email, _template: 'table', _captcha: 'false', _honey: fields._honey },
  }
}

function isRelaySuccess(body: unknown): boolean {
  const flag = (body as { success?: unknown } | null)?.success
  return flag === true || flag === 'true'
}

export default function ContactDispatchForm() {
  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [sentTo, setSentTo] = useState('')
  const inFlight = useRef(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    if (status === 'error') {
      setStatus('idle')
      setErrorMessage('')
    }
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

    const request = buildRequest(fields)
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(request.body),
        signal: controller.signal,
      })

      let body: unknown = null
      try {
        body = await response.json()
      } catch {
        // Not JSON: treated as a failure below.
      }

      if (response.ok && isRelaySuccess(body)) {
        setSentTo(fields.email.trim())
        setFields(EMPTY_FIELDS)
        setStatus('succeeded')
        return
      }

      const detail = (body as { message?: unknown } | null)?.message
      const needsActivation = typeof detail === 'string' && /activat/i.test(detail)
      setStatus('error')
      setErrorMessage(
        needsActivation
          ? `The contact form isn't activated yet. Please email me directly at ${RECIPIENT}.`
          : `Your message couldn't be sent. Please try again, or email me directly at ${RECIPIENT}.`,
      )
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError'
      setStatus('error')
      setErrorMessage(
        timedOut
          ? `This is taking longer than expected, and your message may still arrive. Please wait a few minutes before sending it again, or email me directly at ${RECIPIENT}.`
          : `Your message couldn't be sent. Please check your connection and try again, or email me directly at ${RECIPIENT}.`,
      )
    } finally {
      window.clearTimeout(timer)
      inFlight.current = false
    }
  }

  const submitting = status === 'submitting'

  if (status === 'succeeded') {
    return (
      <div className="contact-form dispatch-panel">
        <div className="dispatch-success" role="status" aria-live="polite">
          <p className="dispatch-success-title">
            <span aria-hidden="true">✓</span> Message sent successfully
          </p>
          <p>Thanks for reaching out. I'll reply to {sentTo} soon.</p>
        </div>
        <button type="button" className="secondary-button dispatch-reset" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form dispatch-panel" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
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
        {submitting ? 'Sending...' : 'Send Message'}
      </button>

      {status === 'error' && errorMessage && (
        <p className="dispatch-error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  )
}
