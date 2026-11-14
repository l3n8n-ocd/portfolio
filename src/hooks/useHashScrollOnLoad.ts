import { useEffect } from 'react'

/*
 * A shared link like /portfolio/#contact used to open at the top of the page:
 * the browser looks for the anchor while the HTML is parsed, before React has
 * rendered the section, and doesn't look again. Once the app has mounted,
 * jump to the anchor ourselves.
 */
export function useHashScrollOnLoad(): void {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])
}
