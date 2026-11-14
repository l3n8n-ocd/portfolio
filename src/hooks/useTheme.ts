import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'portfolio-theme'

/*
 * Browsers with "Block all cookies and site data" (and some embedded
 * webviews) throw a SecurityError the moment `window.localStorage` is
 * touched. Before this, that error was thrown during the first render and
 * left the page blank. Every access is now guarded; without storage the
 * theme still works, it just isn't remembered.
 */
function readStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage blocked or full: keep the theme for this visit only.
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    document.body.style.background = theme === 'dark' ? '#050816' : '#edf2ff'
    document.body.style.color = theme === 'dark' ? '#e2e8f0' : '#0f172a'
    storeTheme(theme)
  }, [theme])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return { theme, toggleTheme }
}
