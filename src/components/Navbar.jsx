import { useState } from 'react'
import lenlenAvatar from '../assets/optimized/lenlen-avatar.webp'
import GooeyNav from '../GooeyNav'

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ theme, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="topbar">
      <div className="section topbar-inner">
        <div className="brand-block">
          <img src={lenlenAvatar} alt="Lenon Adriano" className="brand-mark" width="42" height="42" decoding="async" />
          <span className="brand-text">
            Lenon Adriano
            <small>Cloud | DevOps | Security Engineer</small>
          </span>
        </div>

        <div className="desktop-nav-shell">
          <GooeyNav
            items={navItems}
            initialActiveIndex={0}
            particleCount={18}
            particleDistances={[90, 18]}
            particleR={120}
            animationTime={520}
            colors={[1, 2, 3, 4, 5, 6]}
          />
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className={`theme-toggle ${theme === 'light' ? 'is-light' : ''}`}
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">{theme === 'dark' ? '☾' : '☀'}</span>
            </span>
          </button>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <a href="#contact" className="primary-button small-button">
            Hire Me
          </a>
        </div>
      </div>

      <div id="mobile-nav-panel" className={`mobile-nav-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
