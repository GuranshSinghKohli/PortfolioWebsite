import { Header } from "@/components/Header";
import { nodes } from "@/content/graph";

const owner = nodes.find((node) => node.id === "me");

const experience = [
  {
    title: "AI Engineer, Windscribe",
    meta: "Toronto · May 2026 – Dec 2026",
    points: [
      "Revamped Garry, an OpenClaw-based chatbot, across 15+ intents, reducing human support escalations by 90%.",
      "Rewrote an internal LLM support tool’s prompt and generation pipeline, cutting API token usage by 65%.",
      "Built a Stripe dispute analyst integrating Stripe APIs with agentic workflows, projected to save $32K annually.",
      "Built LLM-powered Stripe Radar triage that scores flagged payments against fraud signals, cutting manual work by 20%.",
    ],
  },
  {
    title: "Data Science Engineer, Wat.ai",
    meta: "Offball XI, Waterloo · Sept 2026 – Present",
    points: [
      "Building a Python pipeline to ingest and process 100k+ tracking records from 2022 FIFA World Cup data.",
      "Standardizing data across 64 matches and 800+ player-tracking fields to align World Cup data with GRF.",
      "Engineering 7+ spatial features with Pandas and NumPy for machine learning experiments.",
      "Automating validation and transformation across 8 processing steps for counterfactual run-value modelling.",
    ],
  },
  {
    title: "Founding Engineer, Wanderers.space",
    meta: "Waterloo · Jan 2026 – Present",
    points: [
      "Built a Next.js campus social platform serving 46 monthly active verified Waterloo students.",
      "Architected REST APIs, realtime pub/sub, and live chat for activity matching and group interactions.",
      "Integrated Gemini, Google Maps, and K-means clustering for activity creation and recommendations.",
      "Pitched at Velocity and received mentorship from 2 Velocity UW incubator mentors.",
    ],
  },
  {
    title: "Software Developer, Savi Finance",
    meta: "Toronto · Nov 2025 – May 2026",
    points: [
      "Built REST APIs in Go with MySQL for trip-logging and expense-tracking workflows used by 1.5K+ people.",
      "Redesigned schemas and queries, taking a core expense-tracking query from 2s to 400ms.",
      "Resolved recurring data-integrity issues through stronger request validation in production.",
    ],
  },
];

const projects = [
  {
    title: "QuantPilot",
    meta: "LangGraph, Kafka, PySpark, FastAPI, PostgreSQL",
    href: "https://github.com/GuranshSinghKohli/quantpilot",
    points: [
      "Event-driven research platform for market events, technology trends, and second-order impact.",
      "Kafka and PySpark pipelines for financial, news, and research data.",
      "Neo4j graph of companies, technologies, investments, and partnerships.",
      "Multi-agent research workflows with source verification, stored in PostgreSQL.",
    ],
  },
  {
    title: "RoadSafe AI",
    meta: "Python, PostgreSQL, dbt, Docker, Pandas, NumPy, scikit-learn, Tableau",
    points: [
      "Modeled 100K US crash records into a dbt and Postgres star schema, with no imputation in the raw load.",
      "Showed the national rain-versus-clear severity gap is state composition, not weather.",
      "Isolated junction proximity at about 27.9% severe across three baselines.",
      "Set an 80.55% majority-class floor that weather and time features failed to beat. Findings are in a Tableau dashboard.",
    ],
  },
];

export default function ResumePage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
        <header className="flex flex-col gap-4">
          <h1 className="text-[36px] leading-[1.1] font-medium tracking-[-0.02em]">
            Guransh Singh Kohli
          </h1>
          <p className="max-w-xl text-[16px] leading-[1.7] text-body">
            {owner?.summary}
          </p>
          <p className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
            <a className="hover:text-text" href="mailto:g4kohli@uwaterloo.ca">
              g4kohli@uwaterloo.ca
            </a>
            <span aria-hidden="true"> · </span>
            <a
              className="hover:text-text"
              href="https://github.com/GuranshSinghKohli"
            >
              GitHub
            </a>
            <span aria-hidden="true"> · </span>
            <a
              className="hover:text-text"
              href="https://www.linkedin.com/in/guransh-singh-kohli-759a86226"
            >
              LinkedIn
            </a>
          </p>
          <a
            href="/Guransh_Resume.pdf"
            download
            className="inline-flex h-12 w-fit items-center rounded-[12px] bg-accent px-4 text-[15px] font-medium text-bg"
          >
            Download résumé
          </a>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
            Experience
          </h2>
          {experience.map((role) => (
            <article key={role.title} className="flex flex-col gap-2">
              <h3 className="text-[20px] font-medium">{role.title}</h3>
              <p className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
                {role.meta}
              </p>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[16px] leading-[1.7] text-body">
                {role.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
            Projects
          </h2>
          {projects.map((project) => (
            <article key={project.title} className="flex flex-col gap-2">
              <h3 className="text-[20px] font-medium">
                {project.href ? (
                  <a className="hover:text-accent" href={project.href}>
                    {project.title}
                  </a>
                ) : (
                  project.title
                )}
              </h3>
              <p className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
                {project.meta}
              </p>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[16px] leading-[1.7] text-body">
                {project.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
            Certifications
          </h2>
          <ul className="flex flex-col gap-2 text-[16px] leading-[1.7] text-body">
            <li>
              <a
                className="hover:text-accent"
                href="/certificates/AWS_Certified_Cloud_Practitioner.pdf"
              >
                AWS Certified Cloud Practitioner
              </a>
            </li>
            <li>
              <a
                className="hover:text-accent"
                href="/certificates/AWS_Certified_AI_Practitioner.pdf"
              >
                AWS Certified AI Practitioner
              </a>
            </li>
            <li>Google Cloud Gen AI</li>
            <li>Databricks AI Agent Fundamentals</li>
          </ul>
        </section>
      </main>
    </>
  );
}
