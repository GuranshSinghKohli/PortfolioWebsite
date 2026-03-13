export default function About() {
  const skills = ['Python', 'SQL', 'JavaScript', 'Data Analysis', 'ML/AI', 'Scikit-learn', 'Pandas', 'MySQL'];
  const interests = [
    { icon: '⚽', title: 'Sports & Athletics', desc: 'Soccer striker, competitive swimmer, cricket enthusiast. Multiple medals in inter-university competitions.' },
    { icon: '🎵', title: 'Music Production', desc: 'Electronic music producer blending ambient textures with rhythmic beats.', link: 'https://www.youtube.com/@lamelovaus' },
    { icon: '♟️', title: 'Strategic Games', desc: 'Chess player with a love for positional play and calculated risk.' },
    { icon: '🤝', title: 'Community Service', desc: 'Regular volunteer at STEM education programs and local shelters.' },
  ];

  return (
    <section id="about" className="about">
      <div className="section">
        <div className="about-grid">
          <div className="about-main">
            <span className="section-label">About Me</span>
            <h2>Aspiring Data Scientist and Software Developer</h2>
            <p>AI and machine learning enthusiast with a strong foundation in mathematics and computer science. I enjoy building intelligent systems, extracting insights from data, and developing scalable, well-designed software applications.</p>
            <div className="skills-wrap">
              {skills.map(s => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
            </div>
          </div>
          <div className="about-photo">
            <img src="/images/photo-winter.png" alt="Guransh" className="photo-single" />
          </div>
        </div>
        <div className="education-card">
          <h3>Education</h3>
          <p><strong>Applied Math with Statistics & Sci ML Co-op</strong> — University of Waterloo, 2025–2029</p>
          <p><strong>High School Diploma</strong> — Bill Hogarth Secondary School, 2022–2024</p>
          <p className="certs">Ontario Scholar · Python in Data Science & ML Bootcamp · Google Cloud Gen AI Leadership</p>
        </div>
        <div className="interests-grid">
          {interests.map(({ icon, title, desc, link }) => (
            <div key={title} className="interest-card">
              <span className="interest-icon">{icon}</span>
              <h4>{title}</h4>
              <p>{desc}</p>
              {link && <a href={link} target="_blank" rel="noopener noreferrer" className="interest-link">Visit YouTube channel →</a>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
