# Phases

Build plan for the Ask-First Portfolio, from the Master PRD v1.0 (section 14). Section numbers below (§) refer to that PRD.

Rules that apply to every phase:

- Pin exact versions. Use releases at least two weeks old, and read each library's current docs before writing code against it.
- This is Next.js 16. Read the guide in `node_modules/next/dist/docs/` before writing Next code (see `AGENTS.md`).
- Take ideas from the reference site, never its code, copy, colours, fonts, logo or images (§1, §4).
- Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

---

## Phase 0 · Identity and content

**Goal:** every fact, word and asset the site will show exists in typed files, and the identity is approved.

**Tasks**

- [ ] Confirm the mark: one lime centre dot with three linked satellites (§4). `components/LogoMark.tsx` currently has four.
- [ ] Approve the dark and light tokens (§9) and type scale.
- [ ] Write greeting lines for morning, afternoon, evening and late night, plus rotating sub-lines.
- [ ] Write `content/voice.md`: tone, phrases you use, what you never say, five joke answers, off-topic and length rules.
- [ ] Move facts from `content/about.md`, `content/roles/*.md` and `content/projects/*.md` into the typed files below, then delete the `.md` sources.
- [ ] `content/profile.ts`: name, greeting lines, location, school/term, socials, résumé path.
- [ ] `content/roles.ts`: 3–4 roles with company, title, logo (with mono flag), location, dates, impact lines, router signals.
- [ ] `content/projects.ts`: 4 headline projects with title, slug, blurb, long write-up, stack, links, poster, demo, year, award, router signals.
- [ ] `content/music.ts`: 10–20 tracks with title, artist, duration and art path.
- [ ] `content/answers.ts`: curated answers for each chip and sidebar topic, each listing the cards to attach.
- [ ] `content/personal.ts`: the only personal facts the AI may use.
- [ ] Record 30–90 s demos, encode to 960 px wide with no audio, and pick posters that read at small sizes (§12).
- [ ] Check `public/Guransh_Resume.pdf` is current.

**Creates or changes:** `content/*.ts`, `content/voice.md`, `public/demos/`, `public/posters/`, `components/LogoMark.tsx`, `DECISIONS.md`.

**Libraries:** none.

**Done when:** all content files are complete, and the mark and tokens are approved.

---

## Phase 1 · Stack and app shell

**Goal:** the motion stack is installed first, then a static app shell that matches the home figures in both themes.

**Tasks**

- [x] Install the 3D and animation stack before any feature work (§5): `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `motion`, `gsap`, `@gsap/react`, `maath`, and `@types/three` (dev).
- [x] Check `@react-three/*` peer ranges against the installed React (fiber 9.8.1 supports React `>=19 <19.4`).
- [x] Pin exact versions in `package.json`.
- [x] Install the UI kit: shadcn components (button, input, card, badge, sheet, tooltip, hover-card, collapsible, separator, skeleton, sonner), `lucide-react`, `clsx`, `tailwind-merge`.
- [ ] Rewrite tokens in `app/globals.css` as `light-dark()` pairs behind one `color-scheme` switch, including `--accent-ink` (§9). Map shadcn variables onto them.
- [ ] Apply the saved theme with an inline script before first paint, so there is no flash.
- [ ] Wrap the app in `TooltipProvider` and mount `Toaster`.
- [ ] Build the sidebar rail (§7): header, Home/Work toggle, Get in touch, topics, pinned roles, recent projects, now-playing slot, résumé, footer. Collapse to 64 px (persisted); become a drawer over a scrim under 860 px.
- [ ] Build the home view: centred mark, time-aware greeting, composer (placeholder, mode pills, location badge, send), static chips.
- [ ] Add the GSAP boot intro: mark draws, then the shell fades in. At most 1.8 s, skippable, first visit only (stored in localStorage).
- [ ] Add the greeting word reveal: GSAP SplitText, 40 ms stagger, 500 ms per word.
- [ ] Add the composer focus beam and the chip rise and hover effects (Motion).
- [ ] Add the hero constellation (R3F + drei + postprocessing): 12 s orbit, ±4° pointer parallax, bloom on the lime core. Load it lazily with `next/dynamic` (no SSR) and show a 2D SVG fallback while it loads, on phones under 600 px, and with reduced motion. Use `frameloop="demand"` when off-screen and cap pixel ratio at 1.75.
- [ ] Replace the placeholder `app/page.tsx`.

**Creates or changes:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/shell/` (rail, drawer, home, composer, chips), `components/three/` (constellation scene and 2D fallback), `components/motion/` (boot intro, greeting), `lib/theme.ts`.

**Libraries:** `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `maath`, `motion`, `gsap`, `@gsap/react`, `next-themes`, shadcn (`radix-ui`), `lucide-react`.

**Done when:** the stack is installed and pinned; the shell matches the home figures in both themes; the hero holds 60 fps and its fallback works.

---

## Phase 2 · Curated answers and thread

**Goal:** every chip and sidebar item lands the right answer and cards instantly, with no AI call.

**Tasks**

- [ ] Add the app state machine: boot → home → thread, with sheets opening over any state (§8, figure 3).
- [ ] Build the topic router (§8): strong signals switch topic, weak signals switch only when the current topic says nothing about them, and anything else inherits the current topic. Reuse it to pick follow-up chips.
- [ ] Wire curated answers from `content/answers.ts` to chips and sidebar items, with an "asked from sidebar" chip in the thread.
- [ ] Build the thread: right-aligned question bubbles, left-aligned answers, attachments under each answer, follow-up chips, and a sticky "Ask a follow-up…" composer.
- [ ] Add the thread motion from figure C: bubble slides in from the composer, cards stagger in after the text, cards lift on hover with a lime edge light.
- [ ] Build the attachments: project cards (one card fills the column, two or more go two-up), a role timeline in the §7 entry format, a music grid, and a contact card.
- [ ] Build the entity matcher: an index from each card's own title and copy, scored against both question and answer, with a confidence floor and a "show all" link.
- [ ] Make attachments render only after the answer text finishes.
- [ ] Unit tests for the router and entity matcher.

**Creates or changes:** `lib/state/` (thread store), `lib/router.ts`, `lib/matcher.ts`, `components/thread/`, `components/attachments/`, `tests/router.test.ts`, `tests/matcher.test.ts`.

**Libraries:** `motion` (installed), `vitest` (installed).

**Done when:** every chip and sidebar item lands the right answer and cards instantly.

---

## Phase 3 · AI ask

**Goal:** typed questions get grounded, streamed answers from your real facts, with guarded and cost-capped calls.

**Tasks**

- [x] Install `ai`, `@ai-sdk/anthropic`, `zod`, `@upstash/ratelimit`, `@upstash/redis`.
- [x] Create `.env.example` with placeholder keys.
- [ ] `GET /api/session`: stateless HMAC ticket, short-lived and bound to the IP, signed with `ASK_SIGNING_SECRET`.
- [ ] Guards on `POST /api/ask`: origin check, ticket check, 300-character input cap, rate limits of 8/min and 40/hour per IP, a 700 ms minimum gap, and a daily global cap (§11).
- [ ] Grounding: router hint as "lead here", the full fact record, and the last 8 history turns (each capped at 700 characters, control characters stripped, wrapped as a transcript record).
- [ ] Write the system instruction with every rule in §11.
- [ ] Stream text events, then one attachments event from the entity matcher. Read the model from `ASK_MODEL`.
- [ ] Client side: streaming reveal with a lime caret, Escape to skip, cycling loading verbs, send button pulse until the first token.
- [ ] Scale length to the question; off-topic questions get a joke from the voice guide.
- [ ] Golden set: 40 known questions with expected facts, checked by a script.
- [ ] Forged-history test: a fake "system override" turn claiming a fake job is ignored and the job denied.
- [ ] CI check that no API key prefix appears in the client bundle.

**Creates or changes:** `app/api/session/route.ts`, `app/api/ask/route.ts`, `lib/ai/` (prompt, grounding, history sanitiser), `lib/ticket.ts`, `lib/ratelimit.ts`, `scripts/golden-set.ts`, `tests/golden/`, `tests/history.test.ts`, `.env.example`.

**Libraries:** `ai`, `@ai-sdk/anthropic`, `zod`, `@upstash/ratelimit`, `@upstash/redis`.

**Done when:** the golden set is at least 95% correct, the forged-history test passes, and no key is in the bundle.

---

## Phase 4 · Media, listening, contact

**Goal:** demos, the project sheet, now playing and the contact form all work, accessibly and with fallbacks.

**Tasks**

- [ ] Hover demos: muted, looping, `preload="none"`, play on hover, rewind on leave. On touch, tapping opens the sheet. Reduced motion skips playback.
- [ ] Project detail sheet (shadcn `sheet`): demo, write-up, stack, links. Closes on Escape, backdrop or X; traps and restores focus; locks scroll.
- [ ] Now playing: computed on the client from the clock looping through `content/music.ts`, with a placeholder on the first frame. Progress bar, equaliser bars and mute toggle.
- [ ] Art script: fetch album art once from a public catalogue API into `public/art/`. Never hotlink.
- [ ] `POST /api/contact`: zod validation, honeypot, 4/hour and 60/day per IP.
- [ ] Contact fallbacks: server email service, then browser send with the public key, then `mailto:` with the draft prefilled.
- [ ] Calendar booking link in the contact sheet.

**Creates or changes:** `components/sheets/`, `components/media/`, `components/listening/`, `app/api/contact/route.ts`, `scripts/fetch-art.ts`, `public/art/`, `public/demos/`.

**Libraries:** `zod` (installed), shadcn `sheet` (installed). The contact email service is not chosen yet.

**Done when:** sheets are fully keyboard-accessible, and contact works in all three fallback modes.

---

## Phase 5 · Hardening

**Goal:** the site meets every quality bar in §13.

**Tasks**

- [x] Install `posthog-js`.
- [ ] Accessibility pass: real buttons and links, 44 px targets, an `aria-live="polite"` thread, 4.5:1 contrast in both themes, theme-aware logos.
- [ ] Reduced motion collapses every animation and stops hover playback.
- [ ] Performance budgets: LCP ≤ 1.8 s, first-load JS ≤ 130 kB compressed, INP ≤ 100 ms, demos ≤ 12 MB total, every page prerendered.
- [ ] Analytics events from §15: `ask`, `answer_done`, `card_hover_play`, `sheet_open`, `contact_sent`, `resume_download`, `theme_toggle`, `error`.
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

- [ ] Sentence-level source chips, plus a "how I know this" toggle.
- [ ] 3D Map view (figure D): four rings (experience, skills, projects, life). Nodes are drei `Html` buttons; dashed drei `Line` rings sit at their own depths. Nodes used by an answer light up in order, with particles on lit edges, a pulse from the centre and bloom on retrieved nodes. Camera uses `PresentationControls` (about 30° FOV, 12° tilt). `PerformanceMonitor` drops effects on slow devices. Phones and reduced-motion users get a 2D version.
- [ ] ⌘K command palette across projects, roles, songs and questions.
- [ ] Thread permalinks.
- [ ] Recruiter mode: a one-tap 30-second summary.
- [ ] Voice ask: hold to talk.
- [ ] Case-study pages at `/work/[slug]`.
- [ ] Golden-set evaluation in CI before every deploy.
- [ ] Accent picker.

**Creates or changes:** `lib/flags.ts`, `components/map/`, `components/palette/`, `app/work/[slug]/page.tsx`, `app/t/[id]/` (permalinks), `.github/workflows/`.

**Libraries:** `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `maath` (all installed). The palette and voice input may need more packages, decided in this phase.

**Done when:** each feature is behind a flag, and the shipped ones meet the same quality bar. The 3D chunk stays under 350 kB compressed (§6).

---

## Phase 7 · Launch

**Goal:** live, monitored, with a first round of feedback.

**Tasks**

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

## Open questions and PRD conflicts

1. **Monthly AI budget** (§15). The provider is Anthropic; the model is set by `ASK_MODEL`.
2. **Which four projects lead the Projects answer?** The résumé has three (QuantPilot, RoadSafe AI, Wanderers.space), and Wanderers is also a role.
3. **Map view in v1 or Phase 6?** (§15).
4. **Light theme at launch?** §9 specifies it and the Phase 1 exit says "both themes", but §15 asks whether it can follow.
5. **Mark.** §4 says three satellites; the existing `LogoMark` has four.
6. **Source chips timing.** Figure C (Phase 2 thread) shows source chips popping in per sentence, but §4 and §14 put them in Phase 6.
7. **Shared rate limiter timing.** §11 needs Upstash in Phase 3 for the AI limits; §14 lists "shared rate limiter" in Phase 5. This plan builds it in Phase 3 and verifies it in Phase 5.
8. **First-load budget.** GSAP, SplitText and Motion on the home page (Phase 1), plus React and Next, may not fit in 130 kB. The boot intro may need to load after first paint.
9. **Toggle names.** The sidebar uses Home/Work; the composer pills use About/Work.
10. **IP-bound tickets** break when a mobile visitor's IP changes mid-session. A short ticket life with a silent refresh would cover it.
11. **Contact email service** isn't named. The "browser sends with the public key" fallback implies a service with a client SDK.
12. **Accent picker vs `--accent-ink`.** Each alternative accent needs its own light-theme ink colour.
