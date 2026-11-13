import { useState } from 'react'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({ ...currentData, [name]: value }))
    setSubmitted(false)
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    const name = formData.name.trim()
    const email = formData.email.trim()
    const message = formData.message.trim()

    if (!name) {
      nextErrors.name = 'Please enter your name.'
    }

    if (!email) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!message) {
      nextErrors.message = 'Please enter a message.'
    } else if (message.length < 10) {
      nextErrors.message = 'Please enter at least 10 characters.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setSubmitted(false)
      return
    }

    setErrors({})
    setSubmitted(true)
  }

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
        <div className="contact-meta">
          <span>Email: ladriano0209@gmail.com</span>
          <span>Location: Remote / Hybrid</span>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <label>
          Name
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && <span id="name-error" className="field-error">{errors.name}</span>}
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
        </label>
        <label>
          Message
          <textarea
            name="message"
            rows="5"
            placeholder="Tell me about your project"
            value={formData.message}
            onChange={handleChange}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && <span id="message-error" className="field-error">{errors.message}</span>}
        </label>
        <button type="submit" className="primary-button submit-button">
          Send Message
        </button>

        {submitted && (
          <p className="success-message" role="status" aria-live="polite">
            Your message has been sent successfully.
          </p>
        )}
      </form>
    </section>
  )
}
