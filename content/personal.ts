import type { Personal } from "./types";

/** The only personal facts the AI may use. Anything not here, it says it doesn't know. */
export const personal: Personal = {
  education: {
    school: "University of Waterloo",
    degree: "Bachelor of Mathematics, Co-op",
    majors: ["Applied Mathematics in Machine Learning", "Statistics"],
    minor: "Computing",
    dates: { start: "2025-09", end: "2029-12" },
    expected: true,
    coursework: [
      "Functional Programming",
      "Data Structures & Algorithms",
      "Object Oriented Programming",
      "Calculus",
      "Algebra",
    ],
  },
  certifications: [
    "AWS Certified Cloud Practitioner",
    "AWS Certified AI Practitioner",
    "Google Cloud Gen AI",
    "Databricks AI Agent Fundamentals",
  ],
  skills: {
    languages: ["Python", "Go", "C++", "C", "JavaScript", "TypeScript", "SQL", "Racket"],
    backendAndWeb: [
      "FastAPI",
      "REST APIs",
      "GraphQL",
      "Next.js",
      "React",
      "PostgreSQL",
      "Redis",
      "Supabase",
      "Docker",
      "System Design",
    ],
    aiAndMl: [
      "PyTorch",
      "scikit-learn",
      "NumPy",
      "Pandas",
      "LangGraph",
      "MCP",
      "RAG",
      "XGBoost",
      "Statistical Analysis",
    ],
    tools: ["Git", "GitHub", "OpenClaw", "CrewAI", "Redis", "Linux"],
  },
  interests: ["[fill in: hobbies and interests outside code. Leave empty if none should be shared.]"],
  doNotShare: ["Phone number", "Home address", "Anything not written in content/"],
};
