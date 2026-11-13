import ContactDispatchForm from './ContactDispatchForm'

export default function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="contact-copy">
        <div className="section-heading">
          <p className="eyebrow">Contact</p>
          <h2>Let's build something useful.</h2>
        </div>
        <p>
          I'm always open to connecting with students, cloud engineers, recruiters,
          and technology enthusiasts to exchange knowledge, collaborate on meaningful
          projects, and explore internship and career opportunities in Cloud Security,
          AI Security, and Cybersecurity.
        </p>
        <p>
          Want a 15-minute technical walkthrough of one of my projects? Pick a topic
          and a time window in the form. It goes straight to my inbox.
        </p>
        <div className="contact-meta">
          <span>Email: ladriano0209@gmail.com</span>
          <span>Location: Remote / Hybrid</span>
        </div>
      </div>

      <ContactDispatchForm />
    </section>
  )
}
