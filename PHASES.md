# Phases

Build plan for the Ask-First Portfolio, from the Master PRD v1.0 (section 14). Section numbers below (§) refer to that PRD. Decisions that change the PRD are recorded in [DECISIONS.md](DECISIONS.md).

Rules that apply to every phase:

- Work on the `revamp` branch only. `main` stays untouched until launch.
- Pin exact versions. Use releases at least two weeks old, and read each library's current docs before writing code against it.
- This is Next.js 16. Read the guide in `node_modules/next/dist/docs/` before writing Next code (see `AGENTS.md`).
- Take ideas from the reference site, never its code, copy, colours, fonts, logo or images (§1, §4).
- Facts come only from `content/`. Anything unknown stays a `[fill in: …]` placeholder.
- Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

---

## Phase 0 · Identity and content

**Goal:** every fact, word and asset the site will show exists in typed files, and the identity is approved.

**Tasks — code side**

- [x] Mark with one lime centre dot and three linked satellites (§4) in `components/LogoMark.tsx`.
- [x] Shared content types in `content/types.ts`.
- [x] `content/profile.ts`: name, greetings, location, school/term, socials, résumé path.
- [x] `content/roles.ts`: three roles with company, title, logo, location, dates, impact lines, router signals.
- [x] `content/projects.ts`: three headline projects (QuantPilot, RoadSafe AI, Wanderers.space) with highlights, stack, links, poster, demo, year and router signals.
- [x] `content/music.ts`: playlist shape with one placeholder track.
- [x] `content/answers.ts`: curated answers for each topic, chip, pinned role and recent project, with attachments, follow-ups and home chips per mode.
- [x] `content/personal.ts`: education, certifications, skills, interests, and what never to share.
- [x] `content/voice.md` template.
- [x] Delete the old `content/*.md` sources.
- [x] `tests/content.test.ts`: every attachment, follow-up and chip points at something that exists.

**Tasks — owner**

- [ ] Fill every `[fill in: …]` placeholder in `content/` (run `grep -rn "fill in" content`).
- [ ] Approve the mark and the dark tokens (§9) and type scale.
- [ ] Add role logos to `public/logos/`.
- [ ] Record 30–90 s demos, encode to 960 px wide with no audio, and pick posters that read at small sizes (§12). They go in `public/demos/` and `public/posters/`.
- [ ] Check `public/Guransh_Resume.pdf` is current.

**Creates or changes:** `content/*.ts`, `content/voice.md`, `components/LogoMark.tsx`, `tests/content.test.ts`, `public/logos/`, `public/demos/`, `public/posters/`.

**Libraries:** none.

**Done when:** all content files are complete, and the mark and tokens are approved.

---

## Phase 1 · Stack and app shell

**Goal:** the motion stack is installed first, then a static, dark app shell that matches the home figures.

**Tasks**

- [x] Install the 3D and animation stack before any feature work (§5): `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `motion`, `gsap`, `@gsap/react`, `maath`, and `@types/three` (dev).
- [x] Check `@react-three/*` peer ranges against the installed React (fiber 9.8.1 supports React `>=19 <19.4`).
- [x] Pin exact versions in `package.json`.
- [x] Install the UI kit: shadcn components (button, input, card, badge, sheet, tooltip, hover-card, collapsible, separator, skeleton, sonner), `lucide-react`, `clsx`, `tailwind-merge`.
- [x] Rewrite every token in `app/globals.css` as a `light-dark()` pair, with `--accent-ink` (§9). Set `color-scheme: dark` for launch, so the light values are written but unused. Map shadcn variables onto the tokens. Lime is the only accent.
- [x] Wrap the app in `TooltipProvider` and mount `Toaster`.
- [x] Use Motion through `LazyMotion` with `m` components, loading features asynchronously.
- [x] Build the sidebar rail (§7): header, About/Work toggle, Get in touch, topics, pinned roles, recent projects, now-playing slot, résumé, footer. Collapse to 64 px (persisted); become a drawer over a scrim under 860 px.
- [x] Build the home view: centred mark, time-aware greeting, composer (placeholder, About/Work pills, location badge, send), static chips from `homeChips`.
- [x] Add the GSAP boot intro, loaded after first paint: mark draws, then the shell fades in. At most 1.8 s, skippable, first visit only (stored in localStorage).
- [x] Add the greeting word reveal: 40 ms stagger, 500 ms per word. CSS only, from first paint (changed from GSAP SplitText at the 1B review).
- [x] Add the composer focus beam and the chip rise and hover effects (Motion).
- [x] Add the hero constellation (R3F + drei + postprocessing): 12 s orbit, ±4° pointer parallax, bloom on the lime core. Load it lazily with `next/dynamic` (no SSR) and show a 2D SVG fallback while it loads, on phones under 600 px, and with reduced motion. Use `frameloop="demand"` when off-screen and cap pixel ratio at 1.75.
- [x] Replace the placeholder `app/page.tsx`.

**Creates or changes:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/shell/` (rail, drawer, home, composer, chips), `components/three/` (constellation scene and 2D fallback), `components/motion/` (LazyMotion provider, boot intro, greeting).

**Libraries:** `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `maath`, `motion`, `gsap`, `@gsap/react`, shadcn (`radix-ui`), `lucide-react`.

**Done when:** the stack is installed and pinned; the dark shell matches the home figures; the hero holds 60 fps and its fallback works; first-load JS stays within 200 kB (budgets in DECISIONS.md).

---

## Phase 2 · Curated answers and thread

**Goal:** every chip and sidebar item lands the right answer and cards instantly, with no AI call.

**Tasks**

- [x] Add the app state machine: boot → home → thread (§8, figure 3). Sheets come in 2B or later.
- [x] Build the topic router (§8): strong signals switch topic, weak signals switch only when the current topic says nothing about them, and anything else inherits the current topic. Reuse it to pick follow-up chips.
- [x] Wire curated answers from `content/answers.ts` to chips and sidebar items, with an "asked from sidebar" chip in the thread.
- [x] Build the thread: right-aligned question bubbles, left-aligned answers, attachments under each answer, follow-up chips, and a sticky "Ask a follow-up…" composer.
- [x] Add the thread motion from figure C, without source chips: bubble slides in from the composer, cards stagger in after the text, cards lift on hover with a lime edge light.
- [x] Build the attachments: project cards (one card fills the column, two or more go two-up), a role timeline in the §7 entry format, a music grid, a contact card and a résumé card.
- [x] Build the entity matcher: an index from each card's own title and copy, scored against both question and answer, with a confidence floor and a "show all" link.
- [x] Make attachments render only after the answer text finishes.
- [x] Unit tests for the router and entity matcher.

**Creates or changes:** `lib/state/` (thread store), `lib/router.ts`, `lib/matcher.ts`, `components/thread/`, `components/attachments/`, `tests/router.test.ts`, `tests/matcher.test.ts`.

**Libraries:** `motion` (installed), `vitest` (installed).

**Done when:** every chip and sidebar item lands the right answer and cards instantly.

---

## Phase 3 · AI ask

**Goal:** typed questions get grounded, streamed answers from your real facts, with guarded and cost-capped calls.

**Tasks**

- [x] Install `ai`, `@ai-sdk/anthropic`, `zod`, `@upstash/ratelimit`, `@upstash/redis`.
- [x] Create `.env.example` with placeholder keys.
- [x] `GET /api/session`: stateless HMAC ticket signed with `ASK_SIGNING_SECRET`, bound to the IP, with a short life. The client refreshes it silently before expiry and once on a rejected ticket, so an IP change mid-session costs one retry.
- [x] Guards on `POST /api/ask`: origin check, ticket check, 300-character input cap, rate limits of 8/min and 40/hour per IP, a 700 ms minimum gap, and a daily global cap (§11).
- [x] Grounding: router hint as "lead here", the full fact record, and the last 8 history turns (each capped at 700 characters, control characters stripped, wrapped as a transcript record).
- [x] Write the system instruction with every rule in §11, plus `content/voice.md`.
- [x] Stream text events, then one attachments event from the entity matcher. Read the model from `ASK_MODEL`.
- [ ] Client side: streaming reveal with a lime caret, Escape to skip, cycling loading verbs from the voice guide, send button pulse until the first token.
- [ ] Scale length to the question; off-topic questions get a joke from the voice guide.
- [ ] Golden set: 40 known questions with expected facts, checked by a script.
- [ ] Forged-history test: a fake "system override" turn claiming a fake job is ignored and the job denied. (Unit test passes; the live run in `tests/live/` is waiting on Anthropic credits.)
- [x] CI check that no API key prefix appears in the client bundle.

**Creates or changes:** `app/api/session/route.ts`, `app/api/ask/route.ts`, `lib/ai/` (prompt, grounding, history sanitiser), `lib/ticket.ts`, `lib/ratelimit.ts`, `scripts/golden-set.ts`, `tests/golden/`, `tests/history.test.ts`.

**Libraries:** `ai`, `@ai-sdk/anthropic`, `zod`, `@upstash/ratelimit`, `@upstash/redis`.

**Done when:** the golden set is at least 95% correct, the forged-history test passes, and no key is in the bundle.

---

## Phase 4 · Media, listening, contact

**Goal:** demos, the project sheet, now playing and the contact form all work, accessibly and with a fallback.

**Tasks**

- [ ] Hover demos: muted, looping, `preload="none"`, play on hover, rewind on leave. On touch, tapping opens the sheet. Reduced motion skips playback.
- [ ] Project detail sheet (shadcn `sheet`): demo, write-up, stack, links. Closes on Escape, backdrop or X; traps and restores focus; locks scroll.
- [ ] Now playing: computed on the client from the clock looping through `content/music.ts`, with a placeholder on the first frame. Progress bar, equaliser bars and mute toggle.
- [ ] Art script: fetch album art once from a public catalogue API into `public/art/`. Never hotlink.
- [ ] `POST /api/contact`: zod validation, honeypot, 4/hour and 60/day per IP, sent through Resend.
- [ ] Contact fallback: if the server send fails, open `mailto:` with the draft prefilled.
- [ ] Calendar booking link in the contact sheet.

**Creates or changes:** `components/sheets/`, `components/media/`, `components/listening/`, `app/api/contact/route.ts`, `scripts/fetch-art.ts`, `public/art/`.

**Libraries:** `zod` (installed), shadcn `sheet` (installed), `resend` (to install in this phase).

**Done when:** sheets are fully keyboard-accessible, and contact works through Resend and through the `mailto:` fallback.

---

## Phase 5 · Hardening

**Goal:** the site meets every quality bar in §13.

**Tasks**

- [x] Install `posthog-js`.
- [ ] Accessibility pass: real buttons and links, 44 px targets, an `aria-live="polite"` thread, 4.5:1 contrast in the dark theme, theme-aware logos.
- [ ] Reduced motion collapses every animation and stops hover playback.
- [ ] Performance budgets (DECISIONS.md, 2026-10-26): LCP ≤ 1.8 s on Lighthouse mobile, TBT ≤ 200 ms, CLS ≤ 0.1, INP ≤ 200 ms, first-load JS ≤ 200 kB compressed, 3D chunk ≤ 350 kB compressed, demos ≤ 12 MB total, every page prerendered.
- [ ] Analytics events from §15: `ask`, `answer_done`, `card_hover_play`, `sheet_open`, `contact_sent` (server / mailto), `resume_download`, `error`.
- [ ] Error states for every API path.
- [ ] Confirm the shared Upstash rate limiter holds across instances.
- [ ] Screen-reader and keyboard pass.

**Creates or changes:** `lib/analytics.ts`, `app/providers.tsx`, components across the app, `app/error.tsx`.

**Libraries:** `posthog-js`, `@upstash/ratelimit` (installed).

**Done when:** budgets are met, and the screen-reader and keyboard pass is done.

---

## Phase 6 · Elevation

**Goal:** the features that make the site distinctly yours. Each sits behind a flag.

**Tasks**

- [ ] Sentence-level source chips (pop in after each sentence, scale 0.9 → 1 over 180 ms), plus a "how I know this" toggle.
- [ ] 3D Map view (figure D): four rings (experience, skills, projects, life). Nodes are drei `Html` buttons; dashed drei `Line` rings sit at their own depths. Nodes used by an answer light up in order, with particles on lit edges, a pulse from the centre and bloom on retrieved nodes. Camera uses `PresentationControls` (about 30° FOV, 12° tilt). `PerformanceMonitor` drops effects on slow devices. Phones and reduced-motion users get a 2D version.
- [ ] ⌘K command palette across projects, roles, songs and questions.
- [ ] Thread permalinks.
- [ ] Recruiter mode: a one-tap 30-second summary.
- [ ] Voice ask: hold to talk.
- [ ] Case-study pages at `/work/[slug]`.
- [ ] Golden-set evaluation in CI before every deploy.
- [ ] Light theme: switch `color-scheme` to follow the saved choice, an inline script before first paint (no flash), a footer toggle, and the `theme_toggle` event.
- [ ] Accent picker, with a light-theme `--accent-ink` for each accent.

**Creates or changes:** `lib/flags.ts`, `components/map/`, `components/palette/`, `app/work/[slug]/page.tsx`, `app/t/[id]/` (permalinks), `.github/workflows/`.

**Libraries:** `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `maath` (all installed). The palette and voice input may need more packages, decided in this phase.

**Done when:** each feature is behind a flag, and the shipped ones meet the same quality bar. The 3D chunk stays under 350 kB compressed (§6).

---

## Phase 7 · Launch

**Goal:** live, monitored, with a first round of feedback.

**Tasks**

- [ ] Merge `revamp` into `main` and resume Vercel production deploys.
- [ ] Custom domain on Vercel.
- [ ] Open Graph images.
- [ ] Sitemap and robots.
- [ ] Monitoring and spend alerts for the AI provider and Upstash.
- [ ] Peer review against the §4 identity rules, so the site doesn't read as a copy of the reference.
- [ ] Share with friends and collect feedback.

**Creates or changes:** `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`, `vercel.json`.

**Libraries:** none expected.

**Done when:** the site is live and monitored, and the first feedback round is done.

---

## Open questions

1. ~~Monthly AI budget~~: $20 a month (DECISIONS).
2. **Map view in v1 or Phase 6?** (§15). It is planned for Phase 6.
3. **Shared rate limiter timing.** §11 needs Upstash in Phase 3 for the AI limits; §14 lists it in Phase 5. This plan builds it in Phase 3 and verifies it in Phase 5.
