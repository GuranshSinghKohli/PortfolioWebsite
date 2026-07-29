import { handleTilt, resetTilt } from '../hooks/useTilt';

const experiences = [
  {
    title: 'AI Engineer',
    company: 'Windscribe',
    location: 'Toronto, Canada',
    dates: 'May 2026 - Dec 2026',
    bullets: [
      "Developed an internal dispute management dashboard integrating LLM-powered case summarization and automated decision logic for Stripe payment disputes, reducing the support team's manual workload by 20%.",
      'Engineered an internal reporting system that analyzed dispute dashboard activity to automatically generate weekly operational reports, summarize dispute trends, and eliminate manual reporting for the support team.',
    ],
  },
  {
    title: 'Computer Vision Engineer',
    company: 'Learncapes Consulting',
    location: 'Remote, Canada',
    dates: '2026',
    bullets: [
      'Developed a real-time human body landmark detection module using React, TypeScript, and MediaPipe for live webcam tracking.',
      'Implemented face and pose tracking with stable landmark detection using real-time smoothing techniques.',
      'Built a modular body landmark API to support downstream virtual garment and jewelry try-on features.',
    ],
  },
  {
    title: 'Founding Engineer',
    company: 'Wanderers.ai',
    location: 'Waterloo, Canada',
    dates: 'Jan 2026 - Present',
    bullets: [
      'Designed and deployed a Supabase PostgreSQL database with 8 relational tables, 22 RLS policies, and optimized indexing for a real-time campus networking platform.',
      'Implemented Supabase Realtime, automated workflows with pg_cron, and seeded campus event data to support live meetups and messaging.',
      'Built the backend data infrastructure powering secure APIs, real-time chat, bubble creation, and location-based campus events.',
    ],
  },
  {
    title: 'Software Developer',
    company: 'Savi Finance',
    location: 'Toronto, Canada',
    dates: 'Nov 2025 - May 2026',
    bullets: [
      'Developed RESTful APIs in Go backed by MySQL, implementing request validation, optimized data persistence, and backend business logic for trip logging and expense tracking, supporting financial reporting for 1.5k+ users.',
      'Engineered scalable backend services by designing database schemas, strengthening API validation, optimizing query performance, and debugging complex edge cases to improve the reliability of production systems.',
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="experience">
      <div className="section">
        <span className="section-label">What I've done so far</span>
        <h2>Work Experience</h2>
        <div className="experience-list">
          {experiences.map((exp) => (
            <article
              key={`${exp.company}-${exp.title}`}
              className="exp-card"
              data-reveal
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
            >
              <h3>{exp.title}</h3>
              <p className="exp-meta">
                {exp.company}, {exp.location} · {exp.dates}
              </p>
              <ul>
                {exp.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
