"use client";

import { ArrowUpRight, Play } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useState, type PointerEvent, type ReactNode } from "react";

import { projects } from "@/content/projects";
import type { Project } from "@/content/types";
import { GitHubIcon } from "@/components/icons";
import { DemoVideo, useHoverDemo } from "@/components/media/HoverDemo";
import { isFilled } from "@/lib/content";
import { openSheet, prefetchSheetsOnIntent } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import { actionClass, card, cardRise, ExternalLink, ShowAll } from "./shared";

/** Lime edge light follows the pointer (PRD figure C, effect 4). Set on the element, no re-render. */
function trackPointer(event: PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - box.top}px`);
}

/**
 * Poster, or a typographic stand-in from the title and stack while there
 * isn't one: shorter, and in dim type, so it reads as artwork rather than a
 * second heading. A demo, when there is one, plays over it.
 */
function Poster({ project, number, children }: { project: Project; number: string; children?: ReactNode }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-line-soft bg-surface",
        isFilled(project.poster) || children ? "aspect-[16/9]" : "aspect-[16/7]",
      )}
    >
      {isFilled(project.poster) ? (
        <Image src={project.poster} alt="" fill sizes="(min-width: 640px) 360px, 100vw" className="object-cover" />
      ) : (
        <div aria-hidden="true" className="flex h-full flex-col justify-between p-4">
          <span className="size-1.5 self-end rounded-full bg-accent" />
          <div className="flex flex-col gap-2">
            <span className="text-[clamp(1.5rem,4vw,2rem)] leading-none font-medium tracking-[-0.02em] text-dim">
              {project.title}
            </span>
            <span className="line-clamp-1 font-mono text-[10.5px] tracking-[0.08em] text-dim uppercase">
              {project.stack.join(" · ")}
            </span>
          </div>
        </div>
      )}
      {children}
      <span className="absolute top-3 left-4 font-mono text-[11px] tracking-[0.08em] text-muted-foreground">{number}</span>
    </div>
  );
}

function ProjectCard({
  project,
  number,
  index,
  reduced,
}: {
  project: Project;
  number: string;
  index: number;
  reduced: boolean;
}) {
  const { live, demo, code } = project.links;
  const hasDemo = isFilled(project.demo);
  const hover = useHoverDemo(hasDemo && !reduced);

  return (
    <m.article
      custom={index}
      variants={cardRise}
      whileHover={reduced ? undefined : { y: -3, transition: { duration: 0.18 } }}
      onPointerMove={trackPointer}
      {...hover.handlers}
      className={cn(card, "group flex flex-col has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-ring")}
    >
      <span aria-hidden="true" className="edge-light pointer-events-none absolute inset-0 z-10 rounded-[14px] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <Poster project={project} number={number}>
        {hasDemo && (
          <DemoVideo
            src={project.demo}
            poster={isFilled(project.poster) ? project.poster : undefined}
            video={hover.video}
            playing={hover.playing}
          />
        )}
      </Poster>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[17px] leading-tight font-medium text-text">
            {/* The whole card opens the detail sheet; the links below sit above this. */}
            <button
              type="button"
              onClick={(event) => openSheet({ kind: "project", slug: project.slug }, event.currentTarget)}
              {...prefetchSheetsOnIntent}
              className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:z-0 after:content-['']"
            >
              {project.title}
              <span className="sr-only">: open details</span>
            </button>
          </h3>
          <p className="text-[14px] leading-[1.55] text-pretty text-body">{project.blurb}</p>
        </div>
        <ul aria-label="Stack" className="flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line-soft px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
        {(isFilled(live) || isFilled(demo) || isFilled(code)) && (
          <div className="relative z-20 mt-auto flex flex-wrap gap-2 pt-1">
            {isFilled(live) && (
              <ExternalLink href={live} className={actionClass()} aria-label={`${project.title} live site`}>
                <ArrowUpRight strokeWidth={1.5} aria-hidden="true" />
                Live
              </ExternalLink>
            )}
            {isFilled(demo) && (
              <ExternalLink href={demo} className={actionClass()} aria-label={`${project.title} demo`}>
                <Play strokeWidth={1.5} aria-hidden="true" />
                Demo
              </ExternalLink>
            )}
            {isFilled(code) && (
              <ExternalLink href={code} className={actionClass()} aria-label={`${project.title} code on GitHub`}>
                <GitHubIcon />
                Code
              </ExternalLink>
            )}
          </div>
        )}
      </div>
    </m.article>
  );
}

/**
 * Project cards: one fills the column, two or more go two-up, one-up on phones.
 * Hover lifts a card 3px; reduced motion keeps it still.
 */
export function ProjectCards({ slugs, start, reduced }: { slugs: string[]; start: number; reduced: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? projects : projects.filter((project) => slugs.includes(project.slug));
  // Keep the matcher's order when narrowed.
  if (!showAll) shown.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("grid gap-3", shown.length > 1 && "sm:grid-cols-2")}>
        {shown.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            number={String(projects.indexOf(project) + 1).padStart(2, "0")}
            index={start + i}
            reduced={reduced}
          />
        ))}
      </div>
      {!showAll && shown.length < projects.length && (
        <ShowAll count={projects.length} noun="projects" onClick={() => setShowAll(true)} />
      )}
    </div>
  );
}
