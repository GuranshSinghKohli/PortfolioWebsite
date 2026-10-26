"use client";

import { ArrowUpRight, Download, ExternalLink as OpenIcon, Mail, Music, Send } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import type { ReactNode } from "react";

import { tracks } from "@/content/music";
import { profile } from "@/content/profile";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { isFilled } from "@/lib/content";
import { cn } from "@/lib/utils";
import { actionClass, card, cardRise, ExternalLink, monoLabel } from "./shared";

/** Tracks from content/music.ts. Renders nothing while the playlist is a placeholder. */
export function MusicGrid({ start }: { start: number }) {
  const filled = tracks.filter((track) => isFilled(track.title));
  if (!filled.length) return null;

  return (
    <ul aria-label="Playlist" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {filled.map((track, i) => (
        <m.li key={`${track.artist}-${track.title}`} custom={start + i} variants={cardRise} className={cn(card, "p-2")}>
          <div className="relative aspect-square overflow-hidden rounded-[10px] bg-surface">
            {isFilled(track.art) ? (
              <Image src={track.art} alt="" fill sizes="200px" className="object-cover" />
            ) : (
              <Music className="absolute inset-0 m-auto size-6 text-dim" strokeWidth={1.5} aria-hidden="true" />
            )}
          </div>
          <p className="mt-2 truncate px-1 text-[13px] text-text">{track.title}</p>
          <p className="truncate px-1 pb-1 text-[12px] text-muted-foreground">{track.artist}</p>
        </m.li>
      ))}
    </ul>
  );
}

function ContactRow({ href, icon, label, value }: { href: string; icon: ReactNode; label: string; value: string }) {
  return (
    <li>
      <ExternalLink
        href={href}
        className="group flex h-11 items-center gap-3 rounded-lg px-2 text-[14px] outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <span className="text-muted-foreground group-hover:text-text">{icon}</span>
        <span className="text-text">{label}</span>
        <span className="min-w-0 flex-1 truncate text-right text-muted-foreground">{value}</span>
        <ArrowUpRight className="text-dim" strokeWidth={1.5} aria-hidden="true" />
      </ExternalLink>
    </li>
  );
}

/** Contact card. "Send a message" opens the mail app until the Phase 4 form. */
export function ContactCard({ start }: { start: number }) {
  const { email, linkedin, github } = profile.socials;
  const mailto = `mailto:${email}?subject=${encodeURIComponent("Hello from your portfolio")}`;

  return (
    <m.div custom={start} variants={cardRise} className={cn(card, "flex flex-col gap-3 p-4 sm:p-5")}>
      <p className={monoLabel}>Get in touch</p>
      <ul className="-mx-2 flex flex-col">
        <ContactRow href={`mailto:${email}`} icon={<Mail strokeWidth={1.5} aria-hidden="true" />} label="Email" value={email} />
        <ContactRow href={linkedin} icon={<LinkedInIcon />} label="LinkedIn" value={linkedin.replace(/^https?:\/\/(www\.)?/, "")} />
        <ContactRow href={github} icon={<GitHubIcon />} label="GitHub" value={github.replace(/^https?:\/\/(www\.)?/, "")} />
      </ul>
      <a href={mailto} className={cn(actionClass(true), "self-start")}>
        <Send strokeWidth={1.75} aria-hidden="true" />
        Send a message
      </a>
    </m.div>
  );
}

/** Résumé card: a paper tile standing in for the PDF's first page, with Download and Open. */
export function ResumeCard({ start }: { start: number }) {
  const file = profile.resumePath.split("/").pop();

  return (
    <m.div custom={start} variants={cardRise} className={cn(card, "flex items-center gap-4 p-4 sm:gap-5 sm:p-5")}>
      <div
        aria-hidden="true"
        className="flex aspect-[8.5/11] w-[72px] shrink-0 flex-col gap-1 rounded-[6px] bg-text p-2 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)] sm:w-[84px]"
      >
        <span className="text-[6px] leading-tight font-medium text-bg">{profile.name}</span>
        <span className="h-px bg-bg/30" />
        {[90, 70, 80, 55, 75, 60, 85, 50].map((width, i) => (
          <span key={i} className="h-[2px] rounded-full bg-bg/20" style={{ width: `${width}%` }} />
        ))}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <h3 className="text-[15px] font-medium text-text">Résumé</h3>
          <p className={cn(monoLabel, "truncate normal-case")}>PDF · {file}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={profile.resumePath} download className={actionClass(true)}>
            <Download strokeWidth={1.75} aria-hidden="true" />
            Download
          </a>
          <a href={profile.resumePath} target="_blank" rel="noreferrer" className={actionClass()}>
            <OpenIcon strokeWidth={1.5} aria-hidden="true" />
            Open
          </a>
        </div>
      </div>
    </m.div>
  );
}
