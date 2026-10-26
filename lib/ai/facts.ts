import { tracks } from "@/content/music";
import { personal } from "@/content/personal";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { roles } from "@/content/roles";
import type { DateRange } from "@/content/types";
import { isFilled } from "@/lib/content";

/**
 * The full fact record sent with every typed question (PRD §11). Built only
 * from content/, skipping anything still marked "[fill in", so the model
 * can't repeat a placeholder or treat it as a fact. Static, so it caches.
 */
const range = ({ start, end }: DateRange) => `${start} to ${end ?? "present"}`;
const list = (items: string[]) => items.filter(isFilled).join(", ");
const line = (label: string, value: string | undefined) => (isFilled(value) ? `${label}: ${value}` : null);
const block = (lines: (string | null)[]) => lines.filter(Boolean).join("\n");

function profileFacts() {
  return block([
    `Name: ${profile.name} (goes by ${profile.shortName})`,
    line("Location", profile.location),
    line("School", profile.school),
    line("Current term", profile.term),
    `Email: ${profile.socials.email}`,
    `GitHub: ${profile.socials.github}`,
    `LinkedIn: ${profile.socials.linkedin}`,
    `Résumé: downloadable on this site (${profile.resumePath})`,
  ]);
}

function educationFacts() {
  const e = personal.education;
  return block([
    `${e.degree}, ${e.school}`,
    `Majors: ${e.majors.join(" and ")}; minor: ${e.minor}`,
    `Dates: ${range(e.dates)}${e.expected ? " (graduation expected)" : ""}`,
    `Coursework: ${list(e.coursework)}`,
    `Certifications: ${list(personal.certifications)}`,
    `Skills (languages): ${list(personal.skills.languages)}`,
    `Skills (backend and web): ${list(personal.skills.backendAndWeb)}`,
    `Skills (AI and ML): ${list(personal.skills.aiAndMl)}`,
    `Tools: ${list(personal.skills.tools)}`,
  ]);
}

function roleFacts() {
  return roles
    .map((role) =>
      block([
        `## ${role.title} at ${role.company}${role.team ? ` (${role.team})` : ""}`,
        `Location: ${role.location}`,
        `Dates: ${range(role.dates)}${role.kind ? ` (${role.kind})` : ""}`,
        ...role.impact.map((item) => `- ${item}`),
        `Stack: ${list(role.stack)}`,
      ]),
    )
    .join("\n\n");
}

function projectFacts() {
  return projects
    .map((project) =>
      block([
        `## ${project.title}`,
        project.blurb,
        line("Year", project.year),
        line("Status", project.status),
        project.role ? `Role: ${project.role.title}, ${project.role.location}, ${range(project.role.dates)}` : null,
        line("Award", project.award),
        ...project.highlights.map((item) => `- ${item}`),
        isFilled(project.writeUp) ? project.writeUp : null,
        `Stack: ${list(project.stack)}`,
        line("Live", project.links.live),
        line("Code", project.links.code),
        line("Demo", project.links.demo),
      ]),
    )
    .join("\n\n");
}

function personalFacts() {
  const interests = personal.interests.filter(isFilled);
  const music = tracks.filter((track) => isFilled(track.title));
  return block([
    interests.length ? `Interests outside work: ${interests.join(", ")}` : "Interests outside work: not shared.",
    music.length
      ? `On the site's playlist: ${music.map((track) => `${track.title} by ${track.artist}`).join("; ")}`
      : "Music: the playlist isn't up yet.",
    `Never share or guess: ${personal.doNotShare.join(", ")}.`,
  ]);
}

export const factRecord = [
  "# Profile",
  profileFacts(),
  "# Education and skills",
  educationFacts(),
  "# Roles (newest first)",
  roleFacts(),
  "# Projects",
  projectFacts(),
  "# Personal",
  personalFacts(),
].join("\n\n");
