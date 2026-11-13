import lenlenImage from '../assets/lenlen.jpg'

export default function About() {
  return (
    <section id="about" className="section about-section">
      <div className="section-heading">
        <p className="eyebrow">About</p>
        <h2>Security-focused problem-solver with a strong frontend foundation.</h2>
      </div>

      <div className="about-stack">
        <div className="about-visual">
          <div className="portrait-frame">
            <img src={lenlenImage} alt="Lenon Adriano portrait" />
          </div>

          <ul className="feature-list">
            <li>Cloud Security</li>
            <li>Cybersecurity</li>
            <li>AI Security</li>
            <li>Project Management</li>
            <li>Quality Management</li>
          </ul>
        </div>

        <div className="about-copy">
          <p>
            Hello! I'm Lenon Adriano, a third-year Bachelor of Science in Information
            Technology (BSIT) student specializing in Web and Mobile Application
            Development (WMAD) at Bulacan State University.
          </p>
          <p>
            My passion lies at the intersection of Cloud Computing, Cybersecurity,
            and Artificial Intelligence Security.
          </p>
          <p>
            I believe cloud security is a lifelong learning journey. I am committed to
            continuously developing my technical skills, gaining practical experience
            through projects and certifications, and staying current with emerging
            technologies in cloud security and AI.
          </p>
        </div>
      </div>
    </section>
  )
}
