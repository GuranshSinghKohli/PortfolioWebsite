export type RingName = "experience" | "skills" | "projects" | "life";

export type NodeRing = "centre" | RingName;

export type GraphNode = {
  id: string;
  label: string;
  /** Pill text when `label` is longer than 16 characters. */
  displayLabel?: string;
  ring: NodeRing;
  /** Degrees. 0 points right, 90 points down. Omitted on the centre node. */
  angle?: number;
  fullName: string;
  summary: string;
  links: { live?: string; code?: string; email?: string; linkedin?: string };
  year: string;
  /** Empty on the owner. Tapping that node clears the answer. */
  askQuestion: string;
};

export const rings = {
  experience: { id: "experience", label: "Experience", index: 1, rx: 18.06, ry: 20.23 },
  skills: { id: "skills", label: "Skills", index: 2, rx: 27.42, ry: 30.71 },
  projects: { id: "projects", label: "Projects", index: 3, rx: 35.48, ry: 39.74 },
  life: { id: "life", label: "Life", index: 4, rx: 40.32, ry: 45.16 },
} as const satisfies Record<
  RingName,
  { id: RingName; label: string; index: number; rx: number; ry: number }
>;

const unstated = "[Placeholder]";

export const nodes: GraphNode[] = [
  {
    id: "me",
    label: "Guransh Kohli",
    ring: "centre",
    fullName: "Guransh Singh Kohli",
    summary:
      "Bachelor of Mathematics (Co-op) at the University of Waterloo. Double major in Applied Mathematics in Machine Learning and Statistics, Computing minor. Expected December 2029.",
    links: {
      email: "g4kohli@uwaterloo.ca",
      code: "https://github.com/GuranshSinghKohli",
      linkedin: "https://www.linkedin.com/in/guransh-singh-kohli-759a86226",
    },
    year: "2025–2029",
    askQuestion: "",
  },
  {
    id: "r1",
    label: "Windscribe",
    ring: "experience",
    angle: -90,
    fullName: "AI Engineer, Windscribe",
    summary:
      "Eight-month co-op in Toronto. Revamped Garry, an OpenClaw-based chatbot, across 15+ intents and cut human support escalations by 90%.",
    links: {},
    year: "May 2026 – Dec 2026",
    askQuestion: "What did you build at Windscribe?",
  },
  {
    id: "r2",
    label: "Wat.ai",
    ring: "experience",
    angle: 140,
    fullName: "Data Science Engineer, Wat.ai",
    summary:
      "Offball XI at Waterloo. Building a Python pipeline for 100k+ FIFA World Cup tracking records and spatial features for machine learning.",
    links: {},
    year: "Sept 2026 – Present",
    askQuestion: "What are you building at Wat.ai?",
  },
  {
    id: "r3",
    label: "Savi Finance",
    ring: "experience",
    angle: 40,
    fullName: "Software Developer, Savi Finance",
    summary:
      "Built Go and MySQL APIs for trip logging and expense tracking used by 1.5K+ people, and cut a core query from 2s to 400ms.",
    links: {},
    year: "Nov 2025 – May 2026",
    askQuestion: "What did you ship at Savi Finance?",
  },
  {
    id: "py",
    label: "Python",
    ring: "skills",
    angle: -130,
    fullName: "Python",
    summary:
      "Wat.ai tracking pipeline, with Pandas and NumPy, and the RoadSafe AI crash analysis.",
    links: {},
    year: "2026",
    askQuestion: "Where have you used Python?",
  },
  {
    id: "go",
    label: "Go",
    ring: "skills",
    angle: -50,
    fullName: "Go",
    summary: "REST APIs with MySQL at Savi Finance for trip logging and expense tracking.",
    links: {},
    year: "2025",
    askQuestion: "Where have you used Go?",
  },
  {
    id: "agents",
    label: "Agents",
    ring: "skills",
    angle: -10,
    fullName: "Agents",
    summary:
      "Agentic workflows at Windscribe, and multi-agent research on QuantPilot with LangGraph.",
    links: {},
    year: "2026",
    askQuestion: "What have you built with AI agents?",
  },
  {
    id: "pg",
    label: "PostgreSQL",
    ring: "skills",
    angle: 62,
    fullName: "PostgreSQL",
    summary: "QuantPilot’s research store, and the RoadSafe AI dbt warehouse of US crash records.",
    links: {},
    year: "2026",
    askQuestion: "Where have you used PostgreSQL?",
  },
  {
    id: "next",
    label: "Next.js",
    ring: "skills",
    angle: 118,
    fullName: "Next.js",
    summary: "Wanderers, a campus social platform for verified University of Waterloo students.",
    links: {},
    year: "2026",
    askQuestion: "What have you built with Next.js?",
  },
  {
    id: "p1",
    label: "Wanderers",
    ring: "projects",
    angle: -25,
    fullName: "Wanderers.space",
    summary:
      "Founding engineer. Next.js campus social platform with 46 monthly active verified Waterloo students, realtime chat, and Gemini-backed recommendations.",
    links: { code: "https://github.com/Kapil-Iyer/Wanderers" },
    year: "2026",
    askQuestion: "What is Wanderers?",
  },
  {
    id: "p2",
    label: "QuantPilot",
    ring: "projects",
    angle: 12,
    fullName: "QuantPilot",
    summary:
      "Event-driven research platform for market events and second-order impact, using Kafka, PySpark, Neo4j, and multi-agent workflows.",
    links: { code: "https://github.com/GuranshSinghKohli/quantpilot" },
    year: "2026",
    askQuestion: "What is QuantPilot?",
  },
  {
    id: "p3",
    label: "RoadSafe AI",
    ring: "projects",
    angle: -158,
    fullName: "RoadSafe AI",
    summary:
      "Modeled 100K US crash records in a dbt and Postgres star schema. The national rain-versus-clear severity gap was state composition, not weather.",
    links: {},
    year: "2026",
    askQuestion: "What did RoadSafe AI find?",
  },
  {
    id: "interest",
    label: "[Interest]",
    ring: "life",
    angle: 72,
    fullName: unstated,
    summary: unstated,
    links: {},
    year: unstated,
    askQuestion: unstated,
  },
  {
    id: "hobby",
    label: "[Hobby]",
    ring: "life",
    angle: 108,
    fullName: unstated,
    summary: unstated,
    links: {},
    year: unstated,
    askQuestion: unstated,
  },
];

export const edges: [string, string][] = [
  ["me", "r1"],
  ["me", "r2"],
  ["me", "r3"],
  ["me", "interest"],
  ["me", "hobby"],
  ["r1", "agents"],
  ["r2", "py"],
  ["r3", "go"],
  ["p1", "next"],
  ["p2", "agents"],
  ["p2", "pg"],
  ["p3", "py"],
  ["p3", "pg"],
];

export function nodeById(id: string) {
  const node = nodes.find((item) => item.id === id);
  if (!node) throw new Error(`Unknown node: ${id}`);
  return node;
}
