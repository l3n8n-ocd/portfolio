import './App.css'
import Scanner from './Scanner'
import Navbar from './components/Navbar'
import About from './components/About'
import Hero from './components/Hero'
import CapstoneAndProjects from './components/CapstoneAndProjects'
import Skills from './components/Skills'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import { useTheme } from './hooks/useTheme'
import { useHashScrollOnLoad } from './hooks/useHashScrollOnLoad'

function App() {
  const { theme, toggleTheme } = useTheme()
  useHashScrollOnLoad()

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
        <Navbar theme={theme} onToggleTheme={toggleTheme} />

        <main>
          <Hero />

          <CapstoneAndProjects />
          <About />
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
