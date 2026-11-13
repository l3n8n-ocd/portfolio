import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const defaultItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]

export default function PillNav({ items = defaultItems, className = '' }) {
  const navRef = useRef(null)
  const indicatorRef = useRef(null)
  const linksRef = useRef([])
  const [active, setActive] = useState('#home')

  useEffect(() => {
    const syncActiveFromHash = () => {
      const nextHash = window.location.hash || '#home'
      setActive(nextHash)
    }

    syncActiveFromHash()
    window.addEventListener('hashchange', syncActiveFromHash)
    return () => window.removeEventListener('hashchange', syncActiveFromHash)
  }, [])

  useEffect(() => {
    const nav = navRef.current
    const indicator = indicatorRef.current
    if (!nav || !indicator) return

    const activeLink = linksRef.current.find((link) => link?.dataset.href === active)
    if (!activeLink) return

    const navRect = nav.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()

    gsap.to(indicator, {
      x: linkRect.left - navRect.left + (nav.scrollLeft || 0),
      width: linkRect.width,
      duration: 0.42,
      ease: 'power2.out',
    })
  }, [active, items])

  return (
    <nav ref={navRef} className={`pill-nav ${className}`.trim()} aria-label="Main navigation">
      <span className="pill-nav-indicator" ref={indicatorRef} aria-hidden="true" />

      {items.map((item) => (
        <a
          key={item.href}
          ref={(el) => {
            linksRef.current[item.href] = el
          }}
          href={item.href}
          data-href={item.href}
          className={active === item.href ? 'pill-nav-link active' : 'pill-nav-link'}
          onClick={() => setActive(item.href)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
