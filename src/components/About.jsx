const skillGroups = [
  {
    label: 'Languages',
    items: ['Python', 'Go', 'C', 'JavaScript', 'TypeScript', 'SQL', 'Bash'],
  },
  {
    label: 'AI Engineering',
    items: ['LangGraph', 'CrewAI', 'OpenAI Agents SDK', 'MCP', 'Autogen', 'RAG'],
  },
  {
    label: 'Backend & Web',
    items: ['FastAPI', 'Express.js', 'Node.js', 'Next.js', 'React.js', 'REST APIs', 'MySQL', 'Supabase'],
  },
  {
    label: 'Tools',
    items: ['Docker', 'Git', 'GitHub', 'Postman', 'Railway', 'Vercel'],
  },
];

const interests = [
  {
    title: 'Sports & Athletics',
    desc: 'Soccer striker, competitive swimmer, and cricket enthusiast with medals from inter-university competition.',
  },
  {
    title: 'Music Production',
    desc: 'Electronic music producer blending ambient textures with rhythmic beats.',
    link: 'https://www.youtube.com/@lamelovaus',
  },
  {
    title: 'Strategic Games',
    desc: 'Chess player drawn to positional play, calculation, and long-term planning.',
  },
  {
    title: 'Community Service',
    desc: 'Volunteer with STEM education programs and local community initiatives.',
  },
];

export default function About() {
  return (
    <section id="about" className="about">
      <div className="section">
        <div className="about-grid reveal">
          <div className="about-main">
            <span className="section-label">About Me</span>
            <h2>AI engineer and full-stack builder with a math foundation</h2>
            <p>
              I design and ship intelligent systems, from multi-agent research platforms to production
              APIs and campus products. My work sits at the intersection of machine learning, backend
              engineering, and product thinking.
            </p>
            {skillGroups.map(({ label, items }) => (
              <div key={label} className="skills-block">
                <h4>{label}</h4>
                <div className="skills-wrap">
                  {items.map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="about-photo">
            <img src="/images/photo-winter.png" alt="Guransh Kohli" className="photo-single" />
          </div>
        </div>

        <div className="education-grid reveal">
          <div className="edu-card">
            <h3>Education</h3>
            <p>
              <strong>Bachelor of Mathematics, Co-op</strong>, University of Waterloo
            </p>
            <p>
              Double Major: Applied Math in Machine Learning and Statistics · Computing minor
            </p>
            <p className="edu-meta">Expected 2030</p>
          </div>
          <div className="cert-card">
            <h3>Certifications</h3>
            <ul>
              <li>AWS Certified Cloud Practitioner</li>
              <li>AWS AI Practitioner</li>
              <li>Google Gen AI Leader</li>
            </ul>
          </div>
        </div>

        <div className="interests-grid reveal">
          {interests.map(({ title, desc, link }) => (
            <div key={title} className="interest-card">
              <h4>{title}</h4>
              <p>{desc}</p>
              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="interest-link">
                  Visit YouTube channel →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
