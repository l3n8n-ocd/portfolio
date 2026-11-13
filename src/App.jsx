import { useEffect, useState } from 'react'
import './App.css'
import Scanner from './Scanner'
import Navbar from './components/Navbar'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio-theme') || 'dark')

  useEffect(() => {
    document.body.style.background = theme === 'dark' ? '#050816' : '#edf2ff'
    document.body.style.color = theme === 'dark' ? '#e2e8f0' : '#0f172a'
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  return (
    <div className={`portfolio-page theme-${theme}`}>
      <div className="site-background" aria-hidden="true">
        <Scanner
          color1="#5227FF"
          color2="#FF9FFC"
          color3="#FFFFFF"
          speed={0.55}
          sweepSpeed={0.25}
          sweepWidth={1.4}
          sweepFalloff={6}
          scale={1.5}
          frequency={2.2}
          ripple={0.22}
          bandDensity={11}
          lineSharpness={5.5}
          glow={0.26}
          scanDirection="vertical"
          colorSpread={0.7}
          brightness={1.15}
          contrast={1.18}
          softness={1.2}
          vignette={0.48}
          scanline={true}
          grain={true}
          grainIntensity={0.04}
          opacity={0.95}
          mouseInteraction={false}
          className="scanner-canvas"
        />
      </div>

      <div className="content-shell">
        <Navbar theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />

        <main>
          <section id="home" className="section hero-section">
            <div className="hero-copy">
              <p className="eyebrow">Cloud | DevOps | Security</p>
              <h1>
                Building <span>digital experiences</span> that are human and efficient.
              </h1>
              <p className="hero-text">
                While my academic specialization is in software development, I am building
                my expertise toward becoming a Cloud Security Engineer with a focus on
                securing cloud infrastructure and AI-powered systems.
              </p>

              <div className="hero-actions">
                <a href="#projects" className="primary-button">
                  View Projects
                </a>
                <a href="#about" className="secondary-button">
                  About Me
                </a>
              </div>

              <div className="hero-stats" aria-label="Key statistics">
                <div>
                  <strong>2+</strong>
                  <span>Years experience</span>
                </div>
                <div>
                  <strong>3+</strong>
                  <span>Projects created</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>Security-focus</span>
                </div>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="orb orb-one" />
              <div className="orb orb-two" />
              <div className="mockup-window">
                <div className="window-bar">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="window-content">
                  <div className="content-top">
                    <div className="mini-card accent-card" />
                    <div className="mini-card" />
                  </div>
                  <div className="content-middle">
                    <div className="chart-card">
                      <span className="chart-bar bar-one" />
                      <span className="chart-bar bar-two" />
                      <span className="chart-bar bar-three" />
                      <span className="chart-bar bar-four" />
                    </div>
                    <div className="stats-panel">
                      <span>UI Design</span>
                      <strong>92%</strong>
                    </div>
                  </div>
                  <div className="content-bottom">
                    <div className="task-item" />
                    <div className="task-item light" />
                    <div className="task-item short" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <About />
          <Projects />
          <Skills theme={theme} />
          <Testimonials />
          <Contact />
        </main>

        <footer className="site-footer">
          <div className="section footer-inner">
            <span>© 2026 | Lenon Adriano</span>
            <span>Built with React and Tailwind CSS</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
