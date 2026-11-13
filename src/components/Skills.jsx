import LogoLoop from '../LogoLoop'

const logos = [
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', alt: 'React', title: 'React' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', alt: 'JavaScript', title: 'JavaScript' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', alt: 'CSS3', title: 'CSS3' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', alt: 'HTML5', title: 'HTML5' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', alt: 'Tailwind CSS', title: 'Tailwind CSS' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', alt: 'Git', title: 'Git' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', alt: 'GitHub', title: 'GitHub' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', alt: 'VS Code', title: 'VS Code' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg', alt: 'npm', title: 'npm' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', alt: 'Node.js', title: 'Node.js' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg', alt: 'Firebase', title: 'Firebase' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', alt: 'Figma', title: 'Figma' },
]

export default function Skills({ theme = 'dark' }) {
  return (
    <section id="skills" className="section skill-section">
      <div className="section-heading">
        <p className="eyebrow">Skills</p>
        <h2>Tools and strengths.</h2>
      </div>

      <div className="skills-marquee-wrap">
        <LogoLoop
          logos={logos}
          speed={120}
          direction="left"
          logoHeight={54}
          gap={28}
          pauseOnHover={false}
          fadeOut={theme === 'dark'}
          fadeOutColor={theme === 'dark' ? '#050816' : 'transparent'}
          scaleOnHover={true}
          ariaLabel="Technology skills marquee"
          className="skills-marquee"
          style={{ width: '100%' }}
        />
      </div>
    </section>
  )
}
