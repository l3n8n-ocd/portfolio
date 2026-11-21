import AnalyticsBeacon from './AnalyticsBeacon'
import FlyRankBadge, { CREDENTIAL_ID, CREDENTIAL_VERIFY_URL } from './FlyRankBadge'

/*
 * Footer: the FlyRank AI Internship credential, the privacy-safe analytics readout, and the credits.
 *
 * FlyRankBadge is FlyRank's own embed, a link to FlyRank's verifier. That verifier confirms
 * reference FR-D11-7F2E2-34A8A for Lenon Adriano (Front-end AI Engineering, July 2026 cohort).
 * A link cannot sit inside another link, so the caption beside it carries its own outline
 * "Verify Credential" link to the same verifier. It is not a filled button: the page keeps one
 * primary button, "Book a 15-min walkthrough".
 */
export default function Footer({ theme }: { theme: string }) {
  return (
    <footer className="site-footer">
      <div className="section footer-credential">
        <div className="credential">
          <FlyRankBadge />
          <div className="credential-caption">
            <span className="credential-title">FlyRank AI Internship · Front-end AI Engineering</span>
            <span className="credential-meta">July 2026 Cohort · Verified</span>
            <span className="credential-id">
              Credential ID <code>{CREDENTIAL_ID}</code>
            </span>
            <a className="credential-verify" href={CREDENTIAL_VERIFY_URL} target="_blank" rel="noopener noreferrer">
              Verify Credential ↗
            </a>
          </div>
        </div>
        <AnalyticsBeacon theme={theme} />
      </div>
      <div className="section footer-inner">
        <span>© 2026 | Lenon Adriano</span>
        <span>Built with React and Tailwind CSS</span>
      </div>
    </footer>
  )
}
