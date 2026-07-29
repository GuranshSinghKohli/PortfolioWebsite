import { handleTilt, resetTilt } from '../hooks/useTilt';

const projects = [
  {
    title: 'ChurnLens: Customer Churn & Revenue Analytics',
    link: 'https://github.com/GuranshSinghKohli/CHURN-LENS',
    skills: 'SQL, Python, Tableau, Plotly',
    desc: 'Analyzed 80k+ records to identify churn drivers. Built SQL pipelines (CTEs, JOINs), retention KPIs, and Tableau/Plotly dashboards to segment high-risk users and support data-driven retention strategies.',
  },
  {
    title: 'RoadSafe AI: Accident Severity Predictor',
    link: 'https://github.com/GuranshSinghKohli/Accident_Severity_-Predictor_USA',
    skills: 'Python, scikit-learn, K-Means, Pandas',
    desc: 'Analyzed 50k+ accident records, engineered features, and built a supervised learning pipeline achieving 80% prediction accuracy with high-risk pattern identification.',
  },
  {
    title: 'QuantPilot: Multi-Agent AI Research Platform',
    link: 'https://github.com/GuranshSinghKohli/quantpilot',
    skills: 'Python, FastAPI, LangGraph, CrewAI, OpenAI Agents SDK, MCP',
    desc: 'Architected a 6-agent financial research platform to autonomously analyze market news, SEC filings, and financial metrics, with a FastAPI backend, ChromaDB memory, and a Next.js frontend for real-time equity research.',
  },
  {
    title: 'CareVoice: Audio Coach for Refugees',
    link: 'https://github.com/allenabraham106/AIForGood',
    skills: 'Next.js, TypeScript, Tailwind CSS, Gemini API, Web Speech API',
    desc: 'AI-powered language learning platform delivering adaptive, voice-guided lessons for low-literacy Rohingya refugees, built with the Google Gemini API and an accessible Web Speech API frontend.',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="projects">
      <div className="section">
        <span className="section-label">Featured work</span>
        <h2>Projects</h2>
        <div className="projects-grid">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card"
              data-reveal
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
            >
              <h3>{project.title}</h3>
              <em className="project-skills">{project.skills}</em>
              <p>{project.desc}</p>
              <span className="project-link">View project ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
