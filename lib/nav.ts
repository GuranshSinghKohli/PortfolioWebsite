import { projects } from "@/content/projects";
import { roles } from "@/content/roles";
import type { DateRange } from "@/content/types";

/**
 * Just what the sidebar shows: names, ids and dates. Built on the server and
 * passed down as props, so the full role and project copy stays out of the
 * first load (it arrives with the thread chunk when someone asks).
 */
export type RailNav = {
  roles: { id: string; company: string; dates: DateRange }[];
  projects: { slug: string; title: string }[];
};

export function railNav(): RailNav {
  return {
    roles: roles.map(({ id, company, dates }) => ({ id, company, dates })),
    projects: projects.map(({ slug, title }) => ({ slug, title })),
  };
}
