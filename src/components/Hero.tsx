import { useRef, useState } from 'react'

/*
 * Hero: one positioning line, one bridge sentence, one primary action, and a
 * 10-second proof of the MicroCredit API's duplicate-payout guard.
 *
 * The proof runs in the browser. Its responses mirror the real API in
 * l3n8n-ocd/microcredit-api (src/features/disbursement/disbursementServer.ts):
 * a same-key retry is replayed with the original receipt (201), and a stale
 * If-Match from a second admin is rejected with 409 VERSION_MISMATCH.
 */

const SANDBOX_URL = 'https://microcredit-api-beta.vercel.app'
const GITHUB_URL = 'https://github.com/l3n8n-ocd'
const LINKEDIN_URL = 'https://www.linkedin.com/in/cyberlens'
const STEP_DELAY_MS = 450

type Tone = 'ok' | 'replay' | 'blocked'

interface ProofStep {
  request: string
  status: string
  detail: string
  tone: Tone
}

function shortKey(): string {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)
  return `${id.slice(0, 8)}…`
}

function buildSteps(key: string): ProofStep[] {
  return [
    {
      request: `POST /disburse · Idempotency-Key: ${key} · If-Match: "3"`,
      status: '201 Created',
      detail: '₱5,000.00 (500,000 centavos) to GCash 0917•••4567',
      tone: 'ok',
    },
    {
      request: `Retry, same Idempotency-Key: ${key}`,
      status: '201 Idempotent replay',
      detail: 'Original receipt returned. No second payout.',
      tone: 'replay',
    },
    {
      request: 'Second admin, new key, stale If-Match: "3"',
      status: '409 VERSION_MISMATCH',
      detail: 'Rejected. The loan is already at version 4.',
      tone: 'blocked',
    },
  ]
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

function ProofWidget() {
  const [steps, setSteps] = useState<ProofStep[]>([])
  const [running, setRunning] = useState(false)
  const runId = useRef(0)
  const done = steps.length === 3 && !running

  const run = async () => {
    const id = ++runId.current
    const all = buildSteps(shortKey())
    setRunning(true)
    setSteps([])
    for (const step of all) {
      await wait(STEP_DELAY_MS)
      if (runId.current !== id) return
      setSteps((current) => [...current, step])
    }
    setRunning(false)
  }

  return (
    <aside className="proof-widget" aria-labelledby="proof-title">
      <p className="proof-kicker">10-second proof</p>
      <h2 id="proof-title" className="proof-title">
        Try to pay a borrower twice
      </h2>
      <p className="proof-intro">
        One ₱5,000 GCash payout, then the two usual ways it gets duplicated: a network retry and a second
        admin clicking at the same time.
      </p>

      <button type="button" className="proof-run" onClick={run} disabled={running}>
        {running ? 'Sending…' : steps.length ? 'Run it again' : 'Fire a duplicate payout'}
      </button>

      <ol className="proof-log" aria-live="polite">
        {steps.map((step) => (
          <li key={step.status} className={`proof-step is-${step.tone}`}>
            <span className="proof-request">{step.request}</span>
            <span className="proof-status">{step.status}</span>
            <span className="proof-detail">{step.detail}</span>
          </li>
        ))}
        {!steps.length && !running && <li className="proof-empty">Press the button to send 3 requests.</li>}
      </ol>

      <p className={`proof-ledger ${done ? 'is-visible' : ''}`} aria-hidden={!done}>
        Paid to borrower: <strong>₱5,000.00</strong> · Paid twice: <strong>₱0.00</strong>
      </p>

      <p className="proof-footnote">
        Simulated here with the real API's responses.{' '}
        <a href={SANDBOX_URL} target="_blank" rel="noopener noreferrer">
          Break the live sandbox yourself ↗
        </a>
      </p>
    </aside>
  )
}

export default function Hero() {
  return (
    <section id="home" className="section hero-section">
      <div className="hero-copy">
        <p className="hero-pill">Full-stack &amp; cloud security engineer · fintech and cloud systems</p>
        <h1>
          I build payment flows that <span>can't pay a borrower twice</span>.
        </h1>
        <p className="hero-text">
          Two layers, one habit. The payout API rejects duplicate and out-of-order requests, and the
          runtime and cloud underneath get patched and locked down. A retry, a race or an unpatched
          Node.js shouldn't be able to move money.
        </p>

        <div className="hero-actions">
          <a href="#contact" className="cta-primary">
            Book a 15-min walkthrough
          </a>
        </div>

        <p className="credential-strip">
          <span>Or check the work:</span>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
          <a href="#projects">Case studies ↓</a>
        </p>
      </div>

      <ProofWidget />

      <div className="hero-stats" aria-label="Proof in numbers">
        <div>
          <strong>461</strong>
          <span>Tests on the MicroCredit payout API</span>
        </div>
        <div>
          <strong>39/39</strong>
          <span>RoadWatch API checks at feature freeze</span>
        </div>
        <div>
          <strong>1 CVE</strong>
          <span>Node.js bug analysed with a safe PoC</span>
        </div>
      </div>
    </section>
  )
}
