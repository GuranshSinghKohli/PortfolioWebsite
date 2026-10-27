"use client";

import {
  Briefcase,
  FileDown,
  FolderGit2,
  Headphones,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentProps, ReactNode } from "react";

import { hiddenTopics } from "@/content/chips";
import { hasTracks } from "@/content/music";
import { profile } from "@/content/profile";
import type { DateRange } from "@/content/types";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { NowPlayingPlaceholder } from "@/components/listening/NowPlayingPlaceholder";
import { LogoMark } from "@/components/LogoMark";
import { SheetClose } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isFilled } from "@/lib/content";
import type { RailNav } from "@/lib/nav";
import { setRailCollapsed } from "@/lib/rail";
import { ask, goHome, prefetchOnIntent } from "@/lib/thread/store";
import { cn } from "@/lib/utils";
import { ModeToggle, useMode } from "./mode";

/** The live card reads the clock, so it renders on the client only, as its own chunk. */
const NowPlaying = dynamic(() => import("@/components/listening/NowPlaying").then((mod) => mod.NowPlaying), {
  ssr: false,
  loading: () => <NowPlayingPlaceholder />,
});

/** Analytics stays out of the first load, so the rail imports it on click. */
const trackRailDownload = () =>
  void import("@/lib/analytics").then((mod) => mod.track("resume_download", { from: "rail" }));

const topics: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "about", label: "About", icon: User },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "experience", label: "Experience", icon: Briefcase },
].filter((topic) => !hiddenTopics.includes(topic.id));

const label = "font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase";

const row =
  "flex h-11 w-full min-w-0 items-center gap-3 rounded-lg px-3 text-left text-[14px] text-body outline-none transition-colors hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring collapsed:justify-center collapsed:px-0";

/** "Now" for a current role, otherwise the year it ended. */
function roleYear(dates: DateRange) {
  return dates.end ? dates.end.slice(0, 4) : "Now";
}

const nameParts = profile.name.split(" ");
/** First and last name, so the rail header fits 248px. */
const displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
const initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;

/** Shows the label as a tooltip only while the rail is collapsed to icons. */
function WithTooltip({ collapsed, text, children }: { collapsed: boolean; text: string; children: ReactNode }) {
  if (!collapsed) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{text}</TooltipContent>
    </Tooltip>
  );
}

function RailButton({
  icon: Icon,
  text,
  collapsed,
  className,
  ...props
}: { icon: LucideIcon; text: string; collapsed: boolean } & ComponentProps<"button">) {
  return (
    <WithTooltip collapsed={collapsed} text={text}>
      <button type="button" className={cn(row, className)} {...prefetchOnIntent} {...props}>
        <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span className="truncate collapsed:sr-only">{text}</span>
      </button>
    </WithTooltip>
  );
}

/** Icon-only link. A tooltip, not `title`, shows the name: `title` made screen readers say it twice. */
function SocialLink({ href, text, children }: { href: string; text: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          aria-label={text}
          {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          className="flex size-11 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
        >
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Everything in the sidebar (PRD §7). Rendered twice: as the desktop rail,
 * which can collapse to 64px, and inside the mobile drawer, which can't.
 * Every item asks its curated question in the thread; `onAsk` lets the
 * drawer close afterwards.
 */
export function Rail({
  variant,
  nav,
  collapsed = false,
  onAsk,
}: {
  variant: "rail" | "drawer";
  nav: RailNav;
  collapsed?: boolean;
  onAsk?: () => void;
}) {
  const { roles, projects } = nav;
  const isRail = variant === "rail";
  const meta = [profile.school, profile.term].filter(isFilled).join(" · ");
  const { mode } = useMode();
  const askFor = (id: string) => () => {
    void ask({ kind: "answer", id, from: "sidebar" }, mode);
    onAsk?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-3 pt-2 collapsed:flex-col collapsed:gap-1">
        <WithTooltip collapsed={collapsed} text="Home">
          <button
            type="button"
            onClick={() => {
              goHome();
              onAsk?.();
            }}
            aria-label={`${displayName}, home`}
            className="flex h-11 min-w-0 items-center gap-2.5 rounded-lg px-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring collapsed:w-11 collapsed:justify-center collapsed:px-0"
          >
            <LogoMark className="shrink-0 text-text" />
            <span className="truncate text-[15px] font-medium text-text collapsed:sr-only">{displayName}</span>
          </button>
        </WithTooltip>
        {isRail ? (
          <WithTooltip collapsed={collapsed} text="Expand sidebar">
            <button
              type="button"
              onClick={() => setRailCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
            >
              <PanelLeftClose className="size-4 collapsed:hidden" strokeWidth={1.5} aria-hidden="true" />
              <PanelLeftOpen className="hidden size-4 collapsed:block" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </WithTooltip>
        ) : (
          <SheetClose
            aria-label="Close menu"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </SheetClose>
        )}
      </div>

      <div className="flex flex-col gap-2 px-3 pt-2">
        <ModeToggle className="rounded-full bg-muted/60 px-1 collapsed:hidden" />
        <RailButton
          icon={Plus}
          text="Get in touch"
          collapsed={collapsed}
          onClick={askFor("contact")}
          className="border border-line text-text hover:border-line-muted collapsed:border-transparent"
        />
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-24px),transparent)]">
        <nav aria-label="Topics" className="flex flex-col">
          {topics.map((topic) => (
            <RailButton
              key={topic.id}
              icon={topic.icon}
              text={topic.label}
              collapsed={collapsed}
              onClick={askFor(topic.id)}
            />
          ))}
        </nav>

        <section aria-labelledby={`${variant}-pinned`} className="flex flex-col collapsed:hidden">
          <h2 id={`${variant}-pinned`} className={cn(label, "px-3 pb-1")}>
            Pinned
          </h2>
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              className={row}
              onClick={askFor(`role:${role.id}`)}
              {...prefetchOnIntent}
            >
              <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{role.company}</span>
              <span className="font-mono text-[10px] tracking-[0.08em] text-dim">{roleYear(role.dates)}</span>
            </button>
          ))}
        </section>

        <section aria-labelledby={`${variant}-recent`} className="flex flex-col collapsed:hidden">
          <h2 id={`${variant}-recent`} className={cn(label, "px-3 pb-1")}>
            Recent
          </h2>
          {projects.map((project) => (
            <button
              key={project.slug}
              type="button"
              className={row}
              onClick={askFor(`project:${project.slug}`)}
              {...prefetchOnIntent}
            >
              <span className="truncate">{project.title}</span>
            </button>
          ))}
        </section>

        {/* Hidden until content/music.ts has songs. */}
        {hasTracks && (
          <div className="collapsed:hidden">
            <NowPlaying />
          </div>
        )}
      </div>

      <div className="flex flex-col border-t border-line-soft px-3 py-2">
        <WithTooltip collapsed={collapsed} text="Résumé (PDF)">
          <a href={profile.resumePath} download onClick={trackRailDownload} className={row}>
            <FileDown className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="flex-1 collapsed:sr-only">Résumé</span>
            <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground collapsed:hidden">
              PDF
            </span>
          </a>
        </WithTooltip>

        <div className="flex items-center gap-1 collapsed:flex-col">
          <SocialLink href={profile.socials.github} text="GitHub">
            <GitHubIcon />
          </SocialLink>
          <SocialLink href={profile.socials.linkedin} text="LinkedIn">
            <LinkedInIcon />
          </SocialLink>
          <SocialLink href={`mailto:${profile.socials.email}`} text={`Email ${profile.socials.email}`}>
            <Mail strokeWidth={1.5} aria-hidden="true" />
          </SocialLink>
        </div>

        <div className="flex items-center gap-3 px-1 pt-1 collapsed:justify-center collapsed:px-0">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-mono text-[11px] text-text"
            aria-hidden="true"
          >
            {initials}
          </span>
          <div className="min-w-0 collapsed:sr-only">
            <p className="truncate text-[13px] text-text">{profile.name}</p>
            <p className="truncate text-[12px] text-muted-foreground">{meta}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
