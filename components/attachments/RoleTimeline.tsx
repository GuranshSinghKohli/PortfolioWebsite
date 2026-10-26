"use client";

import * as m from "motion/react-m";
import Image from "next/image";
import { useState } from "react";

import { roles } from "@/content/roles";
import type { Role } from "@/content/types";
import { isFilled } from "@/lib/content";
import { cn } from "@/lib/utils";
import { card, cardRise, formatRange, monoLabel, monogram, ShowAll } from "./shared";

/** Logo, or monogram initials while there isn't one. Mono line-art logos invert in dark mode. */
function Logo({ role }: { role: Role }) {
  return (
    <span className="relative z-10 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
      {isFilled(role.logo.src) ? (
        <Image
          src={role.logo.src}
          alt=""
          width={24}
          height={24}
          className={cn("size-6 object-contain", role.logo.mono && "dark:invert")}
        />
      ) : (
        <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.04em] text-text">
          {monogram(role.company)}
        </span>
      )}
    </span>
  );
}

/**
 * Roles in the PRD §7 entry format, newest first, joined by a thin line:
 * logo, company, title, mono location and dates, impact lines. A single role
 * shows every impact line; a list shows the first two.
 */
export function RoleTimeline({ ids, start }: { ids: string[]; start: number }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? roles : roles.filter((role) => ids.includes(role.id));
  const lines = shown.length === 1 ? Infinity : 2;

  return (
    <div className="flex flex-col gap-2">
      <m.div custom={start} variants={cardRise} className={cn(card, "p-4 sm:p-5")}>
        <ol className="relative flex flex-col gap-6">
          {shown.length > 1 && (
            <span aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-px -translate-x-1/2 bg-line" />
          )}
          {shown.map((role, i) => (
            <m.li key={role.id} custom={start + i} variants={cardRise} className="flex gap-4">
              <Logo role={role} />
              <div className="flex min-w-0 flex-col gap-1.5 pt-0.5">
                <div>
                  <h3 className="text-[15px] leading-snug font-medium text-text">
                    {role.company}
                    {role.team && <span className="font-normal text-muted-foreground"> · {role.team}</span>}
                  </h3>
                  <p className="text-[14px] text-body">{role.title}</p>
                </div>
                <p className={monoLabel}>
                  {role.location} · {formatRange(role.dates)}
                </p>
                <ul className="mt-1 flex flex-col gap-1.5">
                  {role.impact.slice(0, lines).map((line) => (
                    <li key={line} className="flex gap-2.5 text-[14px] leading-[1.55] text-pretty text-body">
                      <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 rounded-full bg-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </m.li>
          ))}
        </ol>
      </m.div>
      {!showAll && shown.length < roles.length && (
        <ShowAll count={roles.length} noun="roles" onClick={() => setShowAll(true)} />
      )}
    </div>
  );
}
