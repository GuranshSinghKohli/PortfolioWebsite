const projects = [
  {
    title: 'QuantPilot',
    subtitle: 'Multi-Agent AI Research Platform',
    link: 'https://github.com/GuranshSinghKohli/QuantPilot',
    skills: 'Python, FastAPI, LangGraph, CrewAI, OpenAI Agents SDK, MCP, ChromaDB, Next.js',
    desc: 'Architected a 6-agent financial research platform using LangGraph, CrewAI, and the OpenAI Agents SDK to autonomously analyze market news, SEC filings, and financial metrics and generate research reports. Built a FastAPI backend with MCP tool integrations, ChromaDB memory, and a Next.js frontend for real-time AI-assisted equity research.',
    featured: true,
  },
  {
    title: 'CareVoice',
    subtitle: 'Audio Coach for Refugees',
    link: 'https://github.com/GuranshSinghKohli',
    skills: 'Next.js, TypeScript, Tailwind CSS, Google Gemini API, Web Speech API, Node.js',
    desc: 'Built an AI-powered language learning platform by integrating the Google Gemini API with a Next.js/Node.js application, delivering adaptive, personalized lessons for low-literacy Rohingya refugees. Engineered an accessible frontend with the Web Speech API, branching lesson flows, and voice-guided interactions.',
    featured: true,
  },
  {
    title: 'RoadSafe AI',
    subtitle: 'Car Accident Severity Predictor',
    link: 'https://github.com/GuranshSinghKohli/Accident_Severity_-Predictor_USA',
    skills: 'Python, scikit-learn, Pandas, NumPy, Matplotlib',
    desc: 'Developed a machine learning pipeline to analyze 50k+ traffic accident records, performing feature engineering and EDA to identify factors influencing severity. Trained supervised models achieving 80% prediction accuracy and surfaced high-risk accident patterns.',
    featured: false,
  },
  {
    title: 'ChurnLens',
    subtitle: 'Customer Churn & Revenue Analytics',
    link: 'https://github.com/GuranshSinghKohli/CHURN-LENS',
    skills: 'SQL, Python, Tableau, Plotly',
    desc: 'Analyzed 80k+ records to identify churn drivers. Built SQL pipelines, retention KPIs, and Tableau/Plotly dashboards to segment high-risk users and support data-driven retention strategies.',
    featured: false,
  },
  {
    title: 'VectorMate',
    subtitle: 'Neural-Network Chess Engine',
    link: 'https://github.com/Kapil-Iyer/VectorMate',
    skills: 'Python, PyTorch, Flask, Vercel',
    desc: 'Training a CNN policy network on 20k+ Lichess games, targeting stronger move prediction with Minimax and Alpha-Beta pruning.',
    featured: false,
  },
  {
    title: 'Wanderers.ai',
    subtitle: 'Campus Social Platform',
    link: 'https://devpost.com/software/wanderers-5ctnj7',
    skills: 'Next.js, Supabase, Google Maps API',
    desc: 'Full-stack campus social platform enabling University of Waterloo students to discover and join real-time, location-based activities on a live map.',
    featured: false,
  },
];

export default function Projects() {
  return (
    <section id="projects" className="projects">
      <div className="section">
        <span className="section-label">Featured work</span>
        <h2>Projects</h2>
        <p className="projects-intro">
          Selected builds across multi-agent AI, accessible education tools, and applied machine learning.
        </p>
        <div className="projects-grid">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`project-card reveal${project.featured ? ' featured' : ''}`}
            >
              <div className="project-top">
                <h3>
                  {project.title}
                  {project.subtitle ? `: ${project.subtitle}` : ''}
                </h3>
                {project.featured && <span className="project-badge">Featured</span>}
              </div>
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
