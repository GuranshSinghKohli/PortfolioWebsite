const projects = [
  { title: 'ChurnLens — Customer Churn & Revenue Analytics', link: 'https://github.com/GuranshSinghKohli/CHURN-LENS', skills: 'SQL, Python, Tableau, Plotly', desc: 'Analyzed 80k+ records to identify churn drivers. Built SQL pipelines (CTEs, JOINs), retention KPIs, and Tableau/Plotly dashboards to segment high-risk users and support data-driven retention strategies.' },
  { title: 'VectorMate — Neural-Network Chess Engine', link: 'https://github.com/Kapil-Iyer/VectorMate', skills: 'Python, PyTorch, Flask, Vercel', desc: 'Training a CNN policy network on 20k+ Lichess games, targeting 1000+ ELO and 30%+ top-1 move prediction accuracy with Minimax and Alpha-Beta pruning.' },
  { title: 'RoadSafe AI — Accident Severity Predictor', link: 'https://github.com/GuranshSinghKohli', skills: 'Python, scikit-learn, K-Means, Pandas', desc: 'Analyzed 50k+ accident records, engineered features, and built a supervised learning pipeline achieving 80% prediction accuracy with high-risk pattern identification.' },
  { title: 'Portfolio Website', link: '#', skills: 'React, Vite, CSS', desc: 'Fully responsive portfolio to showcase work and skills.' },
  { title: 'Flashy — Study Tool', link: 'https://github.com/GuranshSinghKohli', skills: 'Java, NetBeans', desc: 'Dynamic study tool to enhance student productivity and time management.' },
  { title: 'TRIPLE THRILL: Flip, Roll & Signal', link: 'https://docs.google.com/document/d/1r6tvLJ84iMlvLvLokRyEFWqvMrWXFbreqrSYPGErfpA/edit?tab=t.0', skills: 'Data Analysis, Excel, Probability', desc: 'Probability-based card and dice game with statistical analysis and balance optimization.' },
];

export default function Projects() {
  return (
    <section id="projects" className="projects">
      <div className="section">
        <span className="section-label">Featured work</span>
        <h2>Projects</h2>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <a key={i} href={p.link} target="_blank" rel="noopener noreferrer" className="project-card">
              <h3>{p.title}</h3>
              <em>{p.skills}</em>
              <p>{p.desc}</p>
              <span className="project-link">View project ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
