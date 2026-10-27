/**
 * Shared shapes for everything in `content/`. Curated answers and the AI
 * prompt both read these files, so they cannot drift apart (PRD section 10).
 *
 * Any string that starts with "[fill in" is a placeholder the owner still has
 * to write. Never replace one with an invented fact.
 */

/** Year and month, e.g. "2026-05". */
export type YearMonth = `${number}-${string}`;

export type DateRange = {
  start: YearMonth;
  /** `null` means "Present". */
  end: YearMonth | null;
};

/** Router words for one entity (PRD section 8). */
export type Signals = {
  /** Names that switch topic on their own: companies, projects, products. */
  strong: string[];
  /** Topic words that switch only when the current topic says nothing about them. */
  weak: string[];
};

export type Profile = {
  name: string;
  shortName: string;
  /** Badge in the composer. */
  location: string;
  school: string;
  /** Shown in the sidebar profile row, e.g. "2B". */
  term: string;
  greetings: {
    morning: string;
    afternoon: string;
    evening: string;
    lateNight: string;
  };
  /** Rotating line under the greeting. */
  subLines: string[];
  socials: {
    email: string;
    github: string;
    linkedin: string;
    /** Booking link shown in the contact sheet. */
    calendar?: string;
  };
  resumePath: string;
};

export type Role = {
  id: string;
  company: string;
  /** Extra detail after the company, e.g. a team name. */
  team?: string;
  title: string;
  /** Path under `public/`. `mono` marks black line-art logos that invert in dark mode. */
  logo: { src: string; mono: boolean };
  location: string;
  dates: DateRange;
  /** Employment type or length, e.g. "8-month co-op". */
  kind?: string;
  /** The one line that leads the role in timelines. */
  headline: string;
  impact: string[];
  stack: string[];
  signals: Signals;
};

export type ProjectLinks = {
  live?: string;
  demo?: string;
  code?: string;
};

export type Project = {
  slug: string;
  title: string;
  /** One line under the card title. */
  blurb: string;
  /** Long write-up for the detail sheet and `/work/[slug]`. */
  writeUp: string;
  highlights: string[];
  stack: string[];
  links: ProjectLinks;
  /** Paths under `public/`. */
  poster: string;
  demo: string;
  year: string;
  status?: string;
  /** For projects that were also a role. */
  role?: { title: string; location: string; dates: DateRange };
  /** Hackathon placement or award, when there is one. */
  award?: string;
  signals: Signals;
};

export type Track = {
  title: string;
  artist: string;
  durationSeconds: number;
  /** Path under `public/art/`, fetched once at build time. */
  art: string;
};

export type Attachment =
  | { kind: "projects"; slugs: string[] }
  | { kind: "roles"; ids: string[] }
  | { kind: "music" }
  | { kind: "contact" }
  | { kind: "resume" };

export type CuratedAnswer = {
  id: string;
  /** Text shown in the visitor's question bubble. */
  question: string;
  answer: string;
  attachments: Attachment[];
  /** Chips shown after this answer. Each is the id of another curated answer. */
  followUps: string[];
};

export type Personal = {
  education: {
    school: string;
    degree: string;
    majors: string[];
    minor: string;
    dates: DateRange;
    /** True while `dates.end` is an expected date. */
    expected: boolean;
    coursework: string[];
  };
  certifications: string[];
  skills: {
    languages: string[];
    backendAndWeb: string[];
    aiAndMl: string[];
    tools: string[];
  };
  interests: string[];
  /** Facts the AI must never state or guess. */
  doNotShare: string[];
};
