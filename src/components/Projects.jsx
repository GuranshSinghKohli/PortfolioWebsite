import { handleTilt, resetTilt } from '../hooks/useTilt';

const projects = [
  {
    title: 'QuantPilot: Multi-Agent AI Research Platform',
    link: 'https://github.com/GuranshSinghKohli/quantpilot',
    demo: 'https://quantpilot-qhg4.vercel.app/',
    skills: 'Python, FastAPI, LangGraph, Next.js, ChromaDB, MCP',
    desc: 'Production-style equity research copilot. LangGraph multi-agent pipeline pulls market data, SEC filings, and news via MCP tools, then delivers structured reports with confidence scoring and vector memory.',
  },
  {
    title: 'Wanderers: Campus Social Platform',
    link: 'https://github.com/Kapil-Iyer/Wanderers',
    demo: 'https://fahh-sage.vercel.app',
    skills: 'Next.js, TypeScript, Supabase, Gemini, Google Maps',
    desc: 'Campus social app for discovering and joining real-time activities. Built interest-based matching, group chat, auth, and optional K-means recommendations for scalable community growth.',
  },
  {
    title: 'CareVoice: Audio Coach for Refugees',
    link: 'https://github.com/allenabraham106/AIForGood',
    demo: 'https://ai-for-good-inky.vercel.app/',
    skills: 'Next.js, TypeScript, Gemini API, Web Speech API',
    desc: 'AI-powered language learning platform for low-literacy Rohingya refugees. Adaptive voice-guided lessons with scenario-based content, icon-driven UI, and Gemini-generated reflection questions.',
  },
  {
    title: 'ChurnLens: Customer Churn & Revenue Analytics',
    link: 'https://github.com/GuranshSinghKohli/CHURN-LENS',
    skills: 'SQL, Python, Tableau, Power BI, Plotly',
    desc: 'End-to-end churn analytics platform. Modular SQL pipelines compute churn rate, LTV, and revenue loss, with BI dashboards to segment high-risk users and support retention strategy.',
  },
  {
    title: 'Accident Severity Predictor',
    link: 'https://github.com/GuranshSinghKohli/Accident_Severity_-Predictor_USA',
    skills: 'Python, scikit-learn, K-Means, Pandas',
    desc: 'End-to-end ML workflow on USA traffic accident data. Feature engineering, K-Means pattern discovery, and a supervised model achieving ~80% accuracy for severity prediction.',
  },
  {
    title: 'DesignIt',
    link: 'https://github.com/lavnalla/designit2',
    demo: 'https://designit2-lavnallas-projects.vercel.app',
    skills: 'Next.js, TypeScript, React',
    desc: 'Collaborative design web app built with Next.js and TypeScript.',
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
              href={project.demo || project.link}
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
              <span className="project-link">
                {project.demo ? 'View live ↗' : 'View project ↗'}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
