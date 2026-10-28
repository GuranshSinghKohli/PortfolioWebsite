"use client";

import * as m from "motion/react-m";

import type { Attachment } from "@/content/types";
import { CertificationsCard, ContactCard, MusicGrid, ResumeCard } from "./OtherCards";
import { ProjectCards } from "./ProjectCards";
import { RoleTimeline } from "./RoleTimeline";

/** How many staggered items each attachment adds, so the 70 ms stagger runs across all of them. */
function size(attachment: Attachment) {
  if (attachment.kind === "projects") return attachment.slugs.length;
  if (attachment.kind === "roles") return attachment.ids.length + 1;
  return 1;
}

/**
 * The cards under an answer (PRD §8). ThreadView mounts this only after the
 * answer text has finished. Reduced motion shows the cards still.
 */
export function Attachments({ items, reduced }: { items: Attachment[]; reduced: boolean }) {
  // Where each attachment's stagger starts: the sizes of the ones before it.
  const starts = items.map((_, i) => items.slice(0, i).reduce((sum, item) => sum + size(item), 0));

  return (
    <m.div initial={reduced ? false : "hidden"} animate="shown" className="flex flex-col gap-4">
      {items.map((attachment, i) => {
        const at = starts[i];
        switch (attachment.kind) {
          case "projects":
            return <ProjectCards key="projects" slugs={attachment.slugs} start={at} reduced={reduced} />;
          case "roles":
            return <RoleTimeline key="roles" ids={attachment.ids} start={at} />;
          case "music":
            return <MusicGrid key="music" start={at} />;
          case "contact":
            return <ContactCard key="contact" start={at} />;
          case "resume":
            return <ResumeCard key="resume" start={at} />;
          case "certifications":
            return <CertificationsCard key="certifications" start={at} />;
        }
      })}
    </m.div>
  );
}
