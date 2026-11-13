import celvsImage from '../assets/celvs.jpg'
import ryleeImage from '../assets/rylee.jpg'
import nardImage from '../assets/nard.jpg'

const testimonials = [
  {
    name: 'Celvin James B.',
    role: 'BSIT 3E-G1',
    image: celvsImage,
    quote:
      'The final product was clean, responsive, and easy to navigate. The attention to detail made a huge difference.',
  },
  {
    name: 'Rylee Alyxiz C.',
    role: 'BSIT 3A-G1',
    image: ryleeImage,
    quote:
      'They translated a simple brief into a polished interface with a strong user experience and thoughtful design decisions.',
  },
  {
    name: 'Lenard M.',
    role: 'BSIT 3F-G1',
    image: nardImage,
    quote:
      'The website felt modern and professional from the first click. It immediately reflected the brand in a credible way.',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="section testimonial-section">
      <div className="section-heading">
        <p className="eyebrow">Testimonials</p>
        <h2>What people say.</h2>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((person) => (
          <article key={person.name} className="testimonial-card">
            <p className="quote">“{person.quote}”</p>
            <div className="person-details">
              <img className="avatar" src={person.image} alt={`${person.name} portrait`} />
              <div>
                <strong>{person.name}</strong>
                <span>{person.role}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
