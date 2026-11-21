import { useEffect, useRef, useState } from 'react'

/*
 * AnalyticsBeacon: the footer's privacy-safe telemetry readout.
 *
 * Two layers, both cookie-free:
 *   1. GoatCounter (index.html loads https://gc.zgo.at/count.js) counts page views for the site owner.
 *      It sets no cookies and stores no personal data. Section jumps and theme toggles are sent to
 *      it as events. GoatCounter skips localhost, so local previews are never counted.
 *   2. A local counter for the visitor: page views and visits on this device, kept in
 *      sessionStorage / localStorage. It never leaves the browser.
 *
 * Every value shown is read live: the script's real state, document.cookie, location.protocol.
 * Nothing here claims more than the browser can check.
 */

type GoatCounterState = 'loading' | 'loaded' | 'blocked'

interface GoatCounterApi {
  count?: (vars: { path: string; title?: string; event?: boolean }) => void
}

declare global {
  interface Window {
    goatcounter?: GoatCounterApi
  }
}

interface Counts {
  sessionViews: number
  deviceVisits: number
}

const SESSION_VIEWS = 'portfolio-telemetry:session-views'
const SESSION_STARTED = 'portfolio-telemetry:session-started'
const DEVICE_VISITS = 'portfolio-telemetry:device-visits'
const SCRIPT_TIMEOUT_MS = 5000

// One count per page load, even when React StrictMode runs effects twice in development.
let countedThisLoad: Counts | null = null

function bump(storage: Storage, key: string): number {
  const next = (Number.parseInt(storage.getItem(key) ?? '0', 10) || 0) + 1
  storage.setItem(key, String(next))
  return next
}

/*
 * Storage can throw (blocked site data, some webviews). Then the counters read 0 and the
 * page still works.
 */
function countPageLoad(): Counts {
  if (countedThisLoad !== null) return countedThisLoad
  let sessionViews = 0
  let deviceVisits = 0
  try {
    sessionViews = bump(window.sessionStorage, SESSION_VIEWS)
    const firstInSession = window.sessionStorage.getItem(SESSION_STARTED) === null
    if (firstInSession) window.sessionStorage.setItem(SESSION_STARTED, '1')
    deviceVisits = firstInSession
      ? bump(window.localStorage, DEVICE_VISITS)
      : Number.parseInt(window.localStorage.getItem(DEVICE_VISITS) ?? '0', 10) || 0
  } catch {
    // Storage blocked: keep zeros.
  }
  countedThisLoad = { sessionViews, deviceVisits }
  return countedThisLoad
}

function sendEvent(path: string, title: string): void {
  window.goatcounter?.count?.({ path, title, event: true })
}

function cookieCount(): number {
  return document.cookie === '' ? 0 : document.cookie.split(';').length
}

function useGoatCounterState(): GoatCounterState {
  const [state, setState] = useState<GoatCounterState>(() =>
    typeof window.goatcounter?.count === 'function' ? 'loaded' : 'loading',
  )

  useEffect(() => {
    if (state !== 'loading') return undefined
    const script = document.getElementById('goatcounter-script')
    const settle = () => setState(typeof window.goatcounter?.count === 'function' ? 'loaded' : 'blocked')
    // An ad blocker usually fails the request (error); a slow network gets 5 s before "blocked".
    const timer = window.setTimeout(settle, SCRIPT_TIMEOUT_MS)
    script?.addEventListener('load', settle)
    script?.addEventListener('error', settle)
    if (script === null) settle()
    return () => {
      window.clearTimeout(timer)
      script?.removeEventListener('load', settle)
      script?.removeEventListener('error', settle)
    }
  }, [state])

  return state
}

const STATE_LABEL: Record<GoatCounterState, string> = {
  loading: 'GoatCounter loading…',
  loaded: 'GoatCounter loaded',
  blocked: 'GoatCounter blocked by this browser',
}

export default function AnalyticsBeacon({ theme }: { theme: string }) {
  const goat = useGoatCounterState()
  const [counts] = useState<Counts>(countPageLoad)
  const [sectionJumps, setSectionJumps] = useState(0)
  const [themeToggles, setThemeToggles] = useState(0)
  const [cookies, setCookies] = useState(0)
  const [secure, setSecure] = useState(true)
  const firstTheme = useRef(theme)

  useEffect(() => {
    setCookies(cookieCount())
    setSecure(window.location.protocol === 'https:')
    const onHashChange = () => {
      setSectionJumps((n) => n + 1)
      sendEvent(`section/${window.location.hash.slice(1) || 'home'}`, 'Section jump')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (theme === firstTheme.current) return
    firstTheme.current = theme
    setThemeToggles((n) => n + 1)
    sendEvent(`theme/${theme}`, 'Theme toggle')
  }, [theme])

  // "Loaded" is what the page can check. Whether GoatCounter accepts the hit is visible only on the
  // GoatCounter dashboard (docs/PLANT_YOUR_FLAG.md §2).
  const summary = `Analytics: ${STATE_LABEL[goat]} · Cookie-free (${cookies} ${cookies === 1 ? 'cookie' : 'cookies'}) · ${secure ? 'HTTPS' : 'HTTP (local preview)'}`

  return (
    <section className="telemetry-bar" aria-label="Privacy-safe analytics status">
      <p className="telemetry-summary">
        <span className={`telemetry-dot telemetry-dot--${goat}`} aria-hidden="true" />
        {summary}
      </p>
      <dl className="telemetry-grid">
        <div>
          <dt>This session</dt>
          <dd>
            {counts.sessionViews} page {counts.sessionViews === 1 ? 'view' : 'views'} · {sectionJumps} section{' '}
            {sectionJumps === 1 ? 'jump' : 'jumps'} · {themeToggles} theme {themeToggles === 1 ? 'toggle' : 'toggles'}
          </dd>
        </div>
        <div>
          <dt>This device</dt>
          <dd>
            {counts.deviceVisits} {counts.deviceVisits === 1 ? 'visit' : 'visits'}, stored in your browser only
          </dd>
        </div>
      </dl>
    </section>
  )
}
