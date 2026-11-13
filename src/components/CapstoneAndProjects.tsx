/*
 * Case studies, strongest first. Facts come from l3n8n-ocd/microcredit-api
 * docs/FRAME_IT_AS_CASES.md; each card opens with a plain-English line so a
 * fast reader gets the outcome before the technical detail.
 */

interface CaseLink {
  label: string
  href: string
}

interface CaseStudy {
  index: string
  category: string
  title: string
  impact: string
  facts: string[]
  note?: string
  tags: string[]
  links: CaseLink[]
}

const CASES: CaseStudy[] = [
  {
    index: '01',
    category: 'Flagship · Fintech backend',
    title: 'MicroCredit API',
    impact: 'A loan payout goes out once, even if someone double-clicks or the network retries.',
    facts: [
      'Every payout carries an Idempotency-Key (a unique ID per payout). The server checks it first, so a retry gets the original receipt instead of a second payout.',
      'If-Match (a version check) rejects a second admin working from a stale copy with 409. Illegal jumps, like disbursing twice, return a typed 409.',
      'Money is stored as whole centavos (₱1.00 = 100), never floating point, so no centavo is lost to rounding. Every payout posts a balanced debit/credit journal entry.',
      '461 Vitest tests. CI fails the build if the double-click demo drops below the first screen.',
    ],
    tags: ['TypeScript', 'Next.js', 'Vitest', 'Idempotency'],
    links: [
      { label: 'Live sandbox ↗', href: 'https://microcredit-api-beta.vercel.app' },
      { label: 'Code ↗', href: 'https://github.com/l3n8n-ocd/microcredit-api' },
    ],
  },
  {
    index: '02',
    category: 'Security research · VulnTech internship',
    title: 'Node2Shell (CVE-2026-111497)',
    impact:
      'Showed teams how to check whether their Node.js servers are exposed to a memory bug, and how to fix it, without handing out a working exploit.',
    facts: [
      'Root cause: an out-of-bounds write in the Brotli decoder built into Node.js (CWE-787), reachable through br-compressed request bodies and fetch().',
      'Built an isolated Docker lab and a sanitized side-by-side PoC: Node 24.22.0 corrupts memory, the patched 24.22.1 answers HTTP 400.',
      'Remediation in priority order: upgrade the runtime, reject Content-Encoding: br as a stopgap, detect with Suricata and Sigma rules.',
    ],
    note: 'Analysis and safe PoC published under my pen name, Exemprium. Discovery credit belongs to other researchers.',
    tags: ['Node.js', 'Docker', 'CWE-787', 'Remediation'],
    links: [
      {
        label: 'Advisory ↗',
        href: 'https://docs.google.com/document/d/1tzEqUoyXrR5_RpeszSFKZX4LhVh_PnoSsjsf9wpNtJo/view',
      },
      { label: 'LinkedIn post ↗', href: 'https://lnkd.in/p/g_V3bkhS' },
    ],
  },
  {
    index: '03',
    category: 'BSIT capstone · Team lead',
    title: 'RoadWatch',
    impact: 'Road accident reports that are pinned to a location, verified, and closed by an accountable authority.',
    facts: [
      'Project lead of a 4-person team. I built the Flutter Android app and run the repo, CI and releases.',
      'A report follows a fixed workflow: Submitted → Under Review → Verified → Assigned → In Progress → Resolved. Only an Administrator can verify.',
      'Role and platform lockdown: sign-up can only create a Reporter. Reporters sign in on mobile only, Administrators on the web only.',
      'At feature freeze: API 39/39, flutter analyze clean, 58 widget tests.',
    ],
    note: 'Web dashboard and QA by Pauline Lapuz; API and database by Carl Ernest Santos.',
    tags: ['Flutter', 'Android', 'Role-based access', 'CI'],
    links: [
      { label: 'Live site ↗', href: 'https://www.roadwatch-ph.me' },
      { label: 'Code ↗', href: 'https://github.com/l3n8n-ocd/roadwatch' },
    ],
  },
]

const CLOUD_LABS: CaseLink[] = [
  {
    label: 'Website hosting on Amazon S3',
    href: 'https://nextwork.ai/fulfilled_blue_joyful_clownfish/docs/aws-host-a-website-on-s3',
  },
  {
    label: 'Cloud security with AWS IAM',
    href: 'https://nextwork.ai/fulfilled_blue_joyful_clownfish/docs/aws-security-iam',
  },
  {
    label: 'Building a VPC',
    href: 'https://nextwork.ai/fulfilled_blue_joyful_clownfish/docs/aws-networks-vpc',
  },
]

export default function CapstoneAndProjects() {
  return (
    <section id="projects" className="section project-section">
      <div className="section-heading">
        <p className="eyebrow">Case studies</p>
        <h2>Three things I shipped, and what each one proves.</h2>
      </div>

      <div className="case-grid">
        {CASES.map((item) => (
          <article key={item.title} className="project-card case-card">
            <div className="case-head">
              <span className="case-index">{item.index}</span>
              <span className="project-category">{item.category}</span>
            </div>
            <h3>{item.title}</h3>

            <p className="case-impact">
              <span className="case-impact-label">Plain-English impact</span>
              {item.impact}
            </p>

            <ul className="case-facts">
              {item.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>

            {item.note && <p className="case-note">{item.note}</p>}

            <div className="tag-row">
              {item.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="project-action-row">
              {item.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link-button"
                  aria-label={`${item.title}: ${link.label.replace(' ↗', '')} (opens in a new tab)`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="cloud-labs">
        <p className="cloud-labs-title">Also: guided AWS cloud labs (NextWork)</p>
        <ul>
          {CLOUD_LABS.map((lab) => (
            <li key={lab.href}>
              <a href={lab.href} target="_blank" rel="noopener noreferrer">
                {lab.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
