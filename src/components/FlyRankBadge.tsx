/*
 * FlyRankBadge: the FlyRank AI Internship graduate badge, 164×164, as inline SVG.
 *
 * Built from the brief's spec: a #051F21 circle with #54E399 rings and text, reading
 * "FlyRank AI Internship · July 2026 Cohort · Verified · Front-end AI Engineering" and the
 * credential ID. FlyRank's public verifier page does not publish badge artwork to copy, so this
 * is not the official file. To use FlyRank's own SVG, replace the <svg> below with it, keeping
 * the camelCase JSX attributes (strokeWidth, textAnchor, fontFamily, fontSize, fontWeight,
 * letterSpacing).
 *
 * The badge is decorative inside its link: the <a> in Footer.tsx carries the accessible name.
 * The credential itself is checked by FlyRank at CREDENTIAL_VERIFY_URL.
 */

export const CREDENTIAL_ID = 'FR-D11-7F2E2-34A8A'
export const CREDENTIAL_VERIFY_URL = `https://internship.flyrank.ai/verify?id=${CREDENTIAL_ID}&first_name=Lenon`

const INK = '#051F21'
const MINT = '#54E399'
const MINT_SOFT = '#BDF5DA'
const SANS = "Inter, 'Segoe UI', system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, monospace"

export default function FlyRankBadge() {
  return (
    <svg
      width="164"
      height="164"
      viewBox="0 0 164 164"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="flyrank-badge"
    >
      <circle cx="82" cy="82" r="80" fill={INK} stroke={MINT} strokeWidth="2.5" />
      <circle cx="82" cy="82" r="71" fill="none" stroke={MINT} strokeWidth="1" strokeOpacity="0.45" strokeDasharray="3 4" />

      <text x="82" y="38" textAnchor="middle" fontFamily={SANS} fontSize="9.5" fontWeight="700" letterSpacing="1.6" fill={MINT}>
        FLYRANK
      </text>
      <text x="82" y="50" textAnchor="middle" fontFamily={SANS} fontSize="7.5" fontWeight="600" letterSpacing="1.2" fill={MINT_SOFT}>
        AI INTERNSHIP
      </text>

      {/* The check mark: a ring with a tick, centred above "VERIFIED". */}
      <circle cx="82" cy="70" r="9" fill="none" stroke={MINT} strokeWidth="2" />
      <path d="M77.5 70.2 L80.8 73.4 L86.8 66.8" fill="none" stroke={MINT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      <text x="82" y="96" textAnchor="middle" fontFamily={SANS} fontSize="15" fontWeight="800" letterSpacing="2" fill={MINT}>
        VERIFIED
      </text>
      <text x="82" y="110" textAnchor="middle" fontFamily={SANS} fontSize="8" fontWeight="600" fill={MINT_SOFT}>
        Front-end AI Engineering
      </text>
      <text x="82" y="123" textAnchor="middle" fontFamily={SANS} fontSize="7.5" fontWeight="700" letterSpacing="1.4" fill={MINT}>
        JULY 2026 COHORT
      </text>
      <text x="82" y="137" textAnchor="middle" fontFamily={MONO} fontSize="6.6" fontWeight="500" letterSpacing="0.3" fill={MINT_SOFT}>
        {CREDENTIAL_ID}
      </text>
    </svg>
  )
}
