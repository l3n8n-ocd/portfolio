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

// FormSubmit alias for my inbox (from its activation email). The site never shows an email address.
const FORMSUBMIT_ALIAS = 'cae75c4e129755785e3fe37c2f283c55'
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${FORMSUBMIT_ALIAS}`
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim() || ''
const SUBJECT_PREFIX = '[Portfolio Dispatch] New Walkthrough Request'
// A relay that hasn't answered in 10 s is treated as blocked or down, and the
// visitor gets the copy-and-send fallback instead of a spinner.
const REQUEST_TIMEOUT_MS = 10_000
const NAME_MAX = 100
const EMAIL_MAX = 254
const MESSAGE_MIN = 10
const MESSAGE_MAX = 1500
const LINKEDIN_URL = 'https://www.linkedin.com/in/cyberlens'
const GITHUB_URL = 'https://github.com/l3n8n-ocd'

const TOPICS = [
  'MicroCredit API State Machine & Ledger',
  'Node2Shell CVE-2026-111497 Research',
  'Cloud Security & DevSecOps Internship/Role',
  'General Inquiry',
] as const

type Topic = (typeof TOPICS)[number]
type Status = 'idle' | 'submitting' | 'succeeded' | 'error'
type CopyState = 'idle' | 'copied' | 'manual'

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
// local@domain.tld with a letters-only TLD of 2+ characters: rejects test@a,
// user@localhost and a@b.c, which the browser's type="email" check lets through.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/
const formatCount = (n: number) => n.toLocaleString('en-US')

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {}
  const name = fields.name.trim()
  const email = fields.email.trim()
  const message = fields.message.trim()

  if (!name) errors.name = 'Please enter your name or organization.'
  else if (name.length > NAME_MAX) errors.name = `Please keep this under ${NAME_MAX} characters.`

  if (!email) errors.email = 'Please enter a reply-to email address.'
  else if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a full email address, like name@company.com.'
  }

  if (!fields.walkthroughTopic) errors.walkthroughTopic = 'Please choose a topic.'

  if (!message) errors.message = 'Please enter a message or a preferred 15-minute time window.'
  else if (message.length < MESSAGE_MIN) errors.message = `Please enter at least ${MESSAGE_MIN} characters.`
  else if (message.length > MESSAGE_MAX) {
    errors.message = `Please keep this under ${formatCount(MESSAGE_MAX)} characters.`
  }

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

/* The same message as plain text, for the copy-and-send fallback. */
function formatForCopy(fields: FormFields): string {
  const name = fields.name.trim()
  return [
    `${SUBJECT_PREFIX}: ${fields.walkthroughTopic} (${name})`,
    '',
    `Name / Organization: ${name}`,
    `Reply-To Email: ${fields.email.trim()}`,
    `Walkthrough Topic: ${fields.walkthroughTopic}`,
    '',
    fields.message.trim(),
  ].join('\n')
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
  const [recoveryText, setRecoveryText] = useState('')
  const [copyState, setCopyState] = useState<CopyState>('idle')
  // Synchronous lock: blocks a second submit fired before React re-renders
  // with status 'submitting' (double-click, Enter spam, two requestSubmit calls).
  const isSubmittingRef = useRef(false)
  const recoveryRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    if (status === 'error') {
      setStatus('idle')
      setErrorMessage('')
      setRecoveryText('')
    }
  }

  const fail = (message: string) => {
    setStatus('error')
    setErrorMessage(message)
    setRecoveryText(formatForCopy(fields))
    setCopyState('idle')
  }

  const copyRecovery = async () => {
    try {
      await navigator.clipboard.writeText(recoveryText)
      setCopyState('copied')
      return
    } catch {
      // Clipboard API blocked (permissions, older browser): fall back below.
    }
    const box = recoveryRef.current
    box?.focus()
    box?.select()
    let copied = false
    try {
      copied = document.execCommand('copy')
    } catch {
      copied = false
    }
    setCopyState(copied ? 'copied' : 'manual')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmittingRef.current) return

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

    isSubmittingRef.current = true
    setStatus('submitting')
    setErrorMessage('')
    setRecoveryText('')

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
      fail(
        needsActivation
          ? "The contact form isn't switched on yet, so your message wasn't sent."
          : "The form relay didn't accept your message, so it wasn't sent.",
      )
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError'
      fail(
        timedOut
          ? "The form relay didn't answer within 10 seconds. It may still deliver your message, so give it a minute before sending it another way."
          : "Your browser or network blocked the form relay (an ad blocker or a work firewall can do this), so your message wasn't sent.",
      )
    } finally {
      window.clearTimeout(timer)
      isSubmittingRef.current = false
    }
  }

  const submitting = status === 'submitting'
  const atMessageLimit = fields.message.length >= MESSAGE_MAX

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
            maxLength={NAME_MAX}
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
            maxLength={EMAIL_MAX}
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
            maxLength={MESSAGE_MAX}
            value={fields.message}
            onChange={handleChange}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'dispatch-message-count dispatch-message-error' : 'dispatch-message-count'}
          />
          <span
            id="dispatch-message-count"
            className={`dispatch-count ${atMessageLimit ? 'is-limit' : ''}`}
          >
            {formatCount(fields.message.length)} / {formatCount(MESSAGE_MAX)} characters
            {atMessageLimit && ' · limit reached'}
          </span>
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

      {status === 'error' && recoveryText && (
        <div className="dispatch-recovery">
          <p className="dispatch-recovery-title">Send it another way</p>
          <p>Your message is below. Copy it and send it to me on LinkedIn or GitHub.</p>
          <textarea
            ref={recoveryRef}
            className="dispatch-recovery-text"
            readOnly
            rows={6}
            value={recoveryText}
            aria-label="Your message, ready to copy"
          />
          <div className="dispatch-recovery-actions">
            <button type="button" className="secondary-button" onClick={copyRecovery}>
              {copyState === 'copied' ? 'Copied ✓' : 'Copy message'}
            </button>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </div>
          <p className="dispatch-recovery-status" role="status">
            {copyState === 'copied' && 'Copied to your clipboard.'}
            {copyState === 'manual' && "Your browser blocked copying. The text above is selected: press Ctrl+C (or ⌘C)."}
          </p>
        </div>
      )}
    </form>
  )
}
