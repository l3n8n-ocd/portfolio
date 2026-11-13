import s3Image from '../assets/Amazon-S3-Diagram.jpg'
import iamImage from '../assets/AWS-IAM-Diagram.jpg'
import vpcImage from '../assets/VPC-Diagram.jpg'

const projects = [
  {
    title: 'Website Hosting on Amazon S3',
    category: 'Cloud Object Storage',
    description:
      'A static website hosted on Amazon S3, demonstrating the use of cloud object storage for scalable and reliable web hosting.',
    tags: ['AWS', 'S3', 'Static Website'],
    image: s3Image,
    url: 'https://nextwork.ai/fulfilled_blue_joyful_clownfish/docs/aws-host-a-website-on-s3',
  },
  {
    title: 'Cloud Security with AWS IAM',
    category: 'Cloud Security',
    description:
      'A comprehensive guide to implementing robust security measures using AWS IAM for access control and identity management.',
    tags: ['AWS', 'IAM', 'Security'],
    image: iamImage,
    url: 'https://nextwork.ai/fulfilled_blue_joyful_clownfish/docs/aws-security-iam',
  },
  {
    title: 'Building a Virtual Private Cloud (VPC)',
    category: 'Cloud Networking',
    description:
      'A step-by-step guide to creating a secure and isolated network environment using AWS VPC.',
    tags: ['AWS', 'VPC', 'Networking'],
    image: vpcImage,
    url: 'https://nextwork.ai/fulfilled_blue_joyful_clownfish/docs/aws-networks-vpc',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="section project-section">
      <div className="section-heading">
        <p className="eyebrow">Projects</p>
        <h2>These projects are solely chosen for their technical merit and impact.</h2>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <article key={project.title} className="project-card project-card-link">
            <div className="project-image">
              <img src={project.image} alt={project.title} />
            </div>
            <div className="project-body">
              <span className="project-category">{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="project-action-row">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link-button"
                  aria-label={`Open ${project.title}`}
                >
                  Open Project
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
