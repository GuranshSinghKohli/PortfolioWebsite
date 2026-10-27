"use client";

import { ArrowUpRight, CalendarDays, Check, Play, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";

import { contactCopy } from "@/content/answers";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import type { Project } from "@/content/types";
import { actionClass, ExternalLink, formatRange, monoLabel } from "@/components/attachments/shared";
import { GitHubIcon } from "@/components/icons";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { contactErrors, MESSAGE_MAX, mailtoDraft, type ContactDraft, type ContactField } from "@/lib/contact";
import { track } from "@/lib/analytics";
import { isFilled } from "@/lib/content";
import { useMediaQuery } from "@/lib/media";
import { closeSheet, useSheet } from "@/lib/sheets";
import { cn } from "@/lib/utils";

/**
 * The project and contact sheets (PRD §8, §12), one shell for both. Radix
 * Dialog closes on Escape, the backdrop or X, traps focus and locks page
 * scroll; focus goes back to the card or button that opened the sheet.
 * Its own chunk, fetched on intent.
 */
export function Sheets() {
  const { open, request, opener } = useSheet();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const project = request?.kind === "project" ? projects.find((entry) => entry.slug === request.slug) : undefined;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && closeSheet()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-black/50 data-open:duration-[280ms] data-closed:duration-[280ms]"
        onCloseAutoFocus={(event) => {
          if (!opener?.isConnected) return;
          event.preventDefault();
          opener.focus({ preventScroll: true });
        }}
        className="gap-0 border-line bg-raised p-0 data-open:duration-[280ms] data-closed:duration-[280ms] data-[side=right]:w-full data-[side=right]:max-w-none sm:rounded-l-[20px] data-[side=right]:sm:max-w-[560px]"
      >
        <div className="flex h-full flex-col overflow-y-auto overscroll-contain">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-raised/85 px-6 pt-4 pb-2 backdrop-blur-md">
            <p className={monoLabel}>
              {project ? `Project ${String(projects.indexOf(project) + 1).padStart(2, "0")}` : "Contact"}
            </p>
            <SheetClose
              aria-label="Close"
              className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </SheetClose>
          </div>
          {project ? <ProjectSheet project={project} reduced={reduced} /> : <ContactSheet />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className={monoLabel}>{title}</h3>
      {children}
    </section>
  );
}

/** Demo, then poster, then nothing: the sheet never shows an empty frame. */
function ProjectMedia({ project, reduced }: { project: Project; reduced: boolean }) {
  const poster = isFilled(project.poster) ? project.poster : undefined;
  const frame = "relative aspect-video overflow-hidden rounded-[14px] border border-line-soft bg-surface";

  if (isFilled(project.demo)) {
    return (
      <video
        src={project.demo}
        poster={poster}
        controls
        muted
        loop
        playsInline
        autoPlay={!reduced}
        preload={reduced ? "none" : "metadata"}
        aria-label={`${project.title} demo`}
        className={cn(frame, "w-full object-cover")}
      />
    );
  }
  if (poster) {
    return (
      <div className={frame}>
        <Image src={poster} alt="" fill sizes="(min-width: 640px) 512px, 100vw" className="object-cover" />
      </div>
    );
  }
  return null;
}

function ProjectSheet({ project, reduced }: { project: Project; reduced: boolean }) {
  const { live, demo, code } = project.links;
  const meta = [project.year, project.status].filter(isFilled);

  return (
    <div className="flex flex-col gap-8 px-6 pt-2 pb-10">
      <header className="flex flex-col gap-2">
        <SheetTitle className="text-[28px] leading-[1.1] font-medium tracking-[-0.02em] text-text">
          {project.title}
        </SheetTitle>
        <SheetDescription className="text-[15px] leading-[1.6] text-pretty text-body">{project.blurb}</SheetDescription>
        {meta.length > 0 && <p className={monoLabel}>{meta.join(" · ")}</p>}
      </header>

      <ProjectMedia project={project} reduced={reduced} />

      {project.role && (
        <p className="text-[14px] text-body">
          <span className="text-text">{project.role.title}</span> · {project.role.location} ·{" "}
          {formatRange(project.role.dates)}
        </p>
      )}
      {project.award && isFilled(project.award) && <p className="text-[14px] text-accent-ink">{project.award}</p>}

      {isFilled(project.writeUp) && (
        <div className="flex max-w-[60ch] flex-col gap-4 text-[15px] leading-[1.7] text-pretty text-body">
          {project.writeUp.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

      <Section title="What I did">
        <ul className="flex flex-col gap-3">
          {project.highlights.map((line) => (
            <li key={line} className="flex gap-3 text-[15px] leading-[1.6] text-pretty text-body">
              <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 rounded-full bg-accent" />
              {line}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Stack">
        <ul className="flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <li key={item} className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {(isFilled(live) || isFilled(demo) || isFilled(code)) && (
        <div className="flex flex-wrap gap-2">
          {isFilled(live) && (
            <ExternalLink href={live} className={actionClass(true)}>
              <ArrowUpRight strokeWidth={1.75} aria-hidden="true" />
              Live site
            </ExternalLink>
          )}
          {isFilled(demo) && (
            <ExternalLink href={demo} className={actionClass()}>
              <Play strokeWidth={1.5} aria-hidden="true" />
              Demo
            </ExternalLink>
          )}
          {isFilled(code) && (
            <ExternalLink href={code} className={actionClass()}>
              <GitHubIcon />
              Code
            </ExternalLink>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact

/** Survives an accidental close; cleared once a message is sent. */
let savedDraft: ContactDraft = { name: "", email: "", message: "" };

type Status = "idle" | "sending" | "sent" | "failed" | "rateLimited";

const fieldClass =
  "w-full rounded-[12px] border border-line bg-surface px-3.5 text-[15px] text-text outline-none transition-colors placeholder:text-dim hover:border-line-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] text-text">
          {label}
        </label>
        {hint}
      </div>
      {children}
      <p id={`${id}-error`} className="min-h-[1.25rem] text-[13px] text-destructive" aria-live="polite">
        {error}
      </p>
    </div>
  );
}

function ContactSheet() {
  const id = useId();
  const [draft, setDraft] = useState<ContactDraft>(savedDraft);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const form = useRef<HTMLFormElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const calendar = profile.socials.calendar;

  const update = (field: ContactField, value: string) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    savedDraft = next;
    // Once a field shows an error, it clears as soon as it's fixed.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: contactErrors(next)[field] }));
  };

  const check = (field: ContactField) => {
    if (!draft[field].trim()) return; // Don't scold an empty field the visitor just tabbed through.
    setErrors((current) => ({ ...current, [field]: contactErrors(draft)[field] }));
  };

  const handOff = (next: Status, kind: string) => {
    track("error", { source: "contact", kind });
    track("contact_sent", { result: "mailto" });
    setStatus(next);
    window.location.href = mailtoDraft(draft);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    const found = contactErrors(draft);
    setErrors(found);
    const first = (["name", "email", "message"] as const).find((field) => found[field]);
    if (first) {
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, website: honeypot.current?.value ?? "" }),
      });
      if (response.ok) {
        savedDraft = { name: "", email: "", message: "" };
        track("contact_sent", { result: "server" });
        setStatus("sent");
        return;
      }
      if (response.status === 400) {
        const body = (await response.json().catch(() => ({}))) as { fields?: Partial<Record<ContactField, string[]>> };
        if (body.fields) {
          setErrors(Object.fromEntries(Object.entries(body.fields).map(([field, messages]) => [field, messages?.[0]])));
          setStatus("idle");
          return;
        }
      }
      handOff(response.status === 429 ? "rateLimited" : "failed", String(response.status));
    } catch {
      handOff("failed", "network");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-5 px-6 pt-6 pb-10">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <SheetTitle className="text-[28px] leading-[1.1] font-medium tracking-[-0.02em] text-text">
          Message sent
        </SheetTitle>
        <SheetDescription role="status" className="max-w-[44ch] text-[15px] leading-[1.6] text-pretty text-body">
          {contactCopy.sent.replace("{email}", draft.email.trim())}
        </SheetDescription>
        <SheetClose className={cn(actionClass(), "cursor-pointer")}>Close</SheetClose>
      </div>
    );
  }

  const handedOff = status === "failed" || status === "rateLimited";

  return (
    <div className="flex flex-col gap-6 px-6 pt-2 pb-10">
      <header className="flex flex-col gap-2">
        <SheetTitle className="text-[28px] leading-[1.1] font-medium tracking-[-0.02em] text-text">
          Send me a message
        </SheetTitle>
        <SheetDescription className="text-[15px] leading-[1.6] text-pretty text-body">
          It goes straight to my inbox, and my reply goes to the email you give.
        </SheetDescription>
      </header>

      {handedOff && (
        <div role="alert" className="flex flex-col gap-2 rounded-[14px] border border-line bg-surface p-4">
          <p className="text-[15px] leading-[1.6] text-pretty text-body">{contactCopy[status]}</p>
          <p className="text-[13px] text-muted-foreground">
            {contactCopy.mailtoHint}{" "}
            <a href={mailtoDraft(draft)} className="text-accent-ink underline-offset-4 outline-none hover:underline focus-visible:underline">
              Open it in your mail app
            </a>
            , or email {profile.socials.email}.
          </p>
        </div>
      )}

      <form ref={form} noValidate onSubmit={submit} className="flex flex-col gap-2">
        <Field id={`${id}-name`} label="Name" error={errors.name}>
          <Input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            value={draft.name}
            error={errors.name}
            onChange={(event) => update("name", event.target.value)}
            onBlur={() => check("name")}
            className={cn(fieldClass, "h-11")}
          />
        </Field>
        <Field id={`${id}-email`} label="Email" error={errors.email}>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={draft.email}
            error={errors.email}
            onChange={(event) => update("email", event.target.value)}
            onBlur={() => check("email")}
            className={cn(fieldClass, "h-11")}
          />
        </Field>
        <Field
          id={`${id}-message`}
          label="Message"
          error={errors.message}
          hint={
            <span
              className={cn(
                "font-mono text-[11px] tabular-nums",
                draft.message.length > MESSAGE_MAX ? "text-destructive" : "text-dim",
              )}
            >
              {draft.message.length.toLocaleString("en-US")} / {MESSAGE_MAX.toLocaleString("en-US")}
            </span>
          }
        >
          <textarea
            id={`${id}-message`}
            name="message"
            rows={6}
            value={draft.message}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={`${id}-message-error`}
            onChange={(event) => update("message", event.target.value)}
            onBlur={() => check("message")}
            placeholder="What are you working on?"
            className={cn(fieldClass, "min-h-36 resize-y py-3 leading-[1.55]")}
          />
        </Field>

        {/* Honeypot: off-screen and skipped by keyboard and screen readers. People never fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label htmlFor={`${id}-website`}>Website</label>
          <input ref={honeypot} id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={status === "sending"}
            className={cn(actionClass(true), "cursor-pointer px-5 disabled:cursor-wait disabled:opacity-70")}
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
          {isFilled(calendar) && (
            <ExternalLink href={calendar} className={actionClass()}>
              <CalendarDays strokeWidth={1.5} aria-hidden="true" />
              Book a call
            </ExternalLink>
          )}
        </div>
      </form>
    </div>
  );
}

function Input({ error, ...props }: ComponentProps<"input"> & { error?: string }) {
  return <input aria-invalid={Boolean(error)} aria-describedby={`${props.id}-error`} {...props} />;
}
