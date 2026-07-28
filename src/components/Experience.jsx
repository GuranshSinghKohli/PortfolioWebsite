const experiences = [
  {
    title: 'AI Engineer',
    company: 'Windscribe',
    location: 'Toronto, Canada',
    dates: 'May 2026 - Dec 2026',
    bullets: [
      'Developed an internal dispute management dashboard integrating LLM-powered case summarization and automated decision logic for Stripe payment disputes, reducing the support team’s manual workload by <strong>20%</strong>.',
      'Engineered an internal reporting system that analyzed dispute dashboard activity to automatically generate weekly operational reports, summarize dispute trends, and eliminate manual reporting for the support team.',
    ],
  },
  {
    title: 'Software Developer',
    company: 'Savi Finance',
    location: 'Toronto, Canada',
    dates: 'Nov 2025 - May 2026',
    bullets: [
      'Developed RESTful APIs in <strong>Go</strong> backed by <strong>MySQL</strong>, implementing request validation, optimized data persistence, and backend business logic for trip logging and expense tracking, supporting financial reporting for <strong>1.5k+ users</strong>.',
      'Engineered scalable backend services by designing database schemas, strengthening API validation, optimizing query performance, and debugging complex edge cases to improve production reliability.',
    ],
  },
  {
    title: 'Founding Engineer',
    company: 'Wanderers.ai',
    location: 'Waterloo, Canada',
    dates: 'Jan 2026 - Present',
    bullets: [
      'Built a full-stack campus social platform for the University of Waterloo using <strong>Next.js</strong>, <strong>Supabase</strong>, and the <strong>Google Maps API</strong>, enabling students to discover and join real-time location-based campus activities.',
    ],
    link: 'https://devpost.com/software/wanderers-5ctnj7',
  },
  {
    title: 'At Large Member, Ownership Consulting Committee',
    company: 'Waterloo Undergraduate Student Association (WUSA)',
    location: 'Canada',
    dates: 'July 2025 - Present',
    bullets: [
      'Represent undergraduate students at-large by voicing campus-wide concerns in board-level discussions.',
      'Collaborated with multiple committees to evaluate and improve student services across campus.',
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="experience">
      <div className="section">
        <span className="section-label">Experience</span>
        <h2>Where I’ve built</h2>
        <p className="experience-intro">
          Roles spanning AI product engineering, production backend systems, and founding work on campus software.
        </p>
        <div className="experience-list">
          {experiences.map((exp) => (
            <article key={`${exp.company}-${exp.title}`} className="exp-card reveal">
              <div className="exp-side">
                <span className="exp-dates">{exp.dates}</span>
                <span className="exp-location">{exp.location}</span>
              </div>
              <div className="exp-body">
                <h3>{exp.title}</h3>
                <p className="exp-company">
                  {exp.link ? (
                    <a href={exp.link} target="_blank" rel="noopener noreferrer">
                      {exp.company} ↗
                    </a>
                  ) : (
                    exp.company
                  )}
                </p>
                <ul>
                  {exp.bullets.map((bullet) => (
                    <li key={bullet} dangerouslySetInnerHTML={{ __html: bullet }} />
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
