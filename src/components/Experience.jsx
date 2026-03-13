const experiences = [
  { title: 'AI & Software Developer', company: 'Savi Finance', location: 'Waterloo, Canada', dates: 'Dec 2025 – Present', bullets: ['Built and integrated backend services and automation components to streamline internal workflows.', 'Prototyped, tested, and debugged production-facing features supporting <strong>1.5k+ active users</strong>.', 'Collaborated with cross-functional teams to improve system reliability in an early-stage fintech environment.'] },
  { title: 'Co-Founder & Software Developer', company: 'Wanderers — Community for Explorers', location: 'Waterloo, Canada', dates: 'Jan 2025 – Present', bullets: ['Co-founded and engineered a community platform enabling interest-based user discovery and group formation.', 'Implemented core backend features including user profiles, tagging, and matching logic.', 'Designed scalable system architecture to support future personalization and recommendation features.'] },
  { title: 'AI Growth Strategy Intern Lead', company: 'EdVisingU (Riipen Labs)', location: 'Remote, Canada', dates: 'Jan 2026 – Present', bullets: ['Analyzed onboarding and acquisition funnels using <strong>Python (Pandas)</strong> and <strong>SQL</strong>, tracking CTR, activation, and retention to identify drop-offs and propose A/B growth experiments improving <strong>user conversion by 18%</strong>.', 'Performed <strong>LLM-assisted analysis</strong> using the <strong>OpenAI API</strong> and web-scraped datasets, synthesizing user feedback and product usage logs to guide AI feature prioritization, pricing strategy, and roadmap decisions.'] },
  { title: 'At Large Member, Ownership Consulting Committee', company: 'Waterloo Undergraduate Student Association (WUSA)', location: 'Canada', dates: 'July 2025 – Present', bullets: ['Represent undergraduate students at-large by voicing campus-wide concerns in board-level discussions.', 'Collaborated with multiple committees to evaluate and improve student services across campus.'] },
  { title: 'Summer Camp Chess Program Assistant', company: 'City of Markham', location: 'Canada', dates: 'Jun 2024 – Aug 2024', bullets: ['Facilitated instructional chess sessions and supported student learning.', 'Assisted with setup, coordination, and management of program materials.'] },
  { title: 'Tutoring Assistant', company: 'U+ Education', location: 'Markham, Canada', dates: 'Aug 2023 – Sept 2023', bullets: ['Assisted in teaching math concepts to students aged 8–12.', 'Maintained student engagement and supported individualized learning.'] },
];

export default function Experience() {
  return (
    <section id="experience" className="experience">
      <div className="section">
        <span className="section-label">What I've done so far</span>
        <h2>Work Experience</h2>
        <div className="experience-list">
          {experiences.map((exp, i) => (
            <div key={i} className="exp-card">
              <h3>{exp.title}</h3>
              <p className="exp-meta">{exp.company}, {exp.location} · {exp.dates}</p>
              <ul>
                {exp.bullets.map((b, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: b }} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
