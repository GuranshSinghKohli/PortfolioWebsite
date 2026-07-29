import { handleTilt, resetTilt } from '../hooks/useTilt';

const skills = [
  'Python', 'Go', 'TypeScript', 'SQL', 'FastAPI', 'Next.js', 'LangGraph',
  'CrewAI', 'MCP', 'RAG', 'Scikit-learn', 'Pandas', 'MySQL', 'Docker',
];

const interests = [
  {
    icon: '⚽',
    title: 'Sports & Athletics',
    desc: 'Soccer striker, competitive swimmer, cricket enthusiast. Multiple medals in inter-university competitions.',
  },
  {
    icon: '🎵',
    title: 'Music Production',
    desc: 'Electronic music producer blending ambient textures with rhythmic beats.',
    link: 'https://www.youtube.com/@lamelovaus',
  },
  {
    icon: '♟️',
    title: 'Strategic Games',
    desc: 'Chess player with a love for positional play and calculated risk.',
  },
  {
    icon: '🤝',
    title: 'Community Service',
    desc: 'Regular volunteer at STEM education programs and local shelters.',
  },
];

export default function About() {
  return (
    <section id="about" className="about">
      <div className="section">
        <div className="about-grid">
          <div className="about-main" data-reveal>
            <span className="section-label">About Me</span>
            <h2>Aspiring data scientist and software developer</h2>
            <p>
              AI and machine learning enthusiast with a strong foundation in mathematics and computer
              science. I enjoy building intelligent systems, extracting insights from data, and
              developing scalable, well-designed software applications.
            </p>
            <div className="skills-wrap">
              {skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          <div className="edu-card" data-reveal onMouseMove={handleTilt} onMouseLeave={resetTilt}>
            <h3>Education</h3>
            <div className="edu-item">
              <strong>Applied Math with Statistics &amp; Sci ML Co-op</strong>
              <span>University of Waterloo, 2025-2030</span>
            </div>
            <div className="edu-item">
              <strong>High School Diploma</strong>
              <span>Bill Hogarth Secondary School, 2022-2024</span>
            </div>
            <p className="edu-certs">
              AWS Certified Cloud Practitioner · AWS AI Practitioner · Google Gen AI Leader · Ontario Scholar
            </p>
          </div>
        </div>

        <div className="interests-grid">
          {interests.map((item) => (
            <div
              key={item.title}
              className="interest-card"
              data-reveal
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
            >
              <span className="interest-icon">{item.icon}</span>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="interest-link">
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
