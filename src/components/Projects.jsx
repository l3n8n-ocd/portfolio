import s3Small from '../assets/optimized/s3-diagram-640.webp'
import s3Large from '../assets/optimized/s3-diagram-1200.webp'
import iamSmall from '../assets/optimized/iam-diagram-640.webp'
import iamLarge from '../assets/optimized/iam-diagram-1200.webp'
import vpcSmall from '../assets/optimized/vpc-diagram-640.webp'
import vpcLarge from '../assets/optimized/vpc-diagram-989.webp'

// Each card image ships a 640w and a full-size WebP; the browser picks one
// from the slot width below and the screen's pixel density.
const IMAGE_SIZES = '(max-width: 960px) calc(100vw - 32px), 380px'

const projects = [
  {
    title: 'Website Hosting on Amazon S3',
    category: 'Cloud Object Storage',
    description:
      'A static website hosted on Amazon S3, demonstrating the use of cloud object storage for scalable and reliable web hosting.',
    tags: ['AWS', 'S3', 'Static Website'],
    image: { src: s3Small, srcSet: `${s3Small} 640w, ${s3Large} 1200w`, width: 1200, height: 560 },
    url: 'https://nextwork.ai/fulfilled_blue_joyful_clownfish/docs/aws-host-a-website-on-s3',
  },
  {
    title: 'Cloud Security with AWS IAM',
    category: 'Cloud Security',
    description:
      'A comprehensive guide to implementing robust security measures using AWS IAM for access control and identity management.',
    tags: ['AWS', 'IAM', 'Security'],
    image: { src: iamSmall, srcSet: `${iamSmall} 640w, ${iamLarge} 1200w`, width: 1200, height: 927 },
    url: 'https://nextwork.ai/fulfilled_blue_joyful_clownfish/docs/aws-security-iam',
  },
  {
    title: 'Building a Virtual Private Cloud (VPC)',
    category: 'Cloud Networking',
    description:
      'A step-by-step guide to creating a secure and isolated network environment using AWS VPC.',
    tags: ['AWS', 'VPC', 'Networking'],
    image: { src: vpcSmall, srcSet: `${vpcSmall} 640w, ${vpcLarge} 989w`, width: 989, height: 811 },
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
              <img
                src={project.image.src}
                srcSet={project.image.srcSet}
                sizes={IMAGE_SIZES}
                width={project.image.width}
                height={project.image.height}
                alt={project.title}
                loading="lazy"
                decoding="async"
              />
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
                  rel="noopener noreferrer"
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
