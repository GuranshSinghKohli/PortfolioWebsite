# Decisions

Notes for choices the PRD leaves open.

## Tooling

- npm is the package manager. `create-next-app` refuses a package name with capital letters, so the package is `portfolio-website` inside this folder.
- Versions are pinned exactly in `package.json`, using releases at least two weeks old at install time.
- Next.js builds into `dist` (`distDir`). ESLint ignores `dist/**`, and `npm run typecheck` runs `next typegen` first so route types such as `LayoutProps` exist on a clean checkout.
- TypeScript is 6.0.3, not 7. `typescript-eslint` (pulled in by `eslint-config-next`) does not support TypeScript 7 yet.
- ESLint is 9.39.5. `eslint-config-next@16` and its React, import and jsx-a11y plugins declare ESLint 9 peers, and ESLint 10 only installed by npm overriding them. ESLint 9 is past end of support; move to 10 when the plugins support it.
- shadcn uses the `radix-nova` style. `shadcn init` and `add` rewrite `app/globals.css` and `app/layout.tsx` with neutral defaults and the Geist font; restore the PRD tokens and fonts after running them.
- Class merging uses `clsx` and `tailwind-merge` through `cn` in `lib/utils.ts`. The `radix-nova` CLI writes `import { cn } from "cn"` into new components; change it to `@/lib/utils`.
- The AI provider is OpenAI through the Vercel AI SDK (`ai`, `@ai-sdk/openai` 4.0.91, released 2026-10-08), switched from Anthropic on 2026-10-26 at the owner's request. The model comes from `ASK_MODEL`. Recommended: `gpt-6-luna`, the small, fast, cheap current model ($0.10 input / $0.01 cached / $0.50 output per million tokens). It passed every live check; `gpt-6.1-sol` also works and is priced.

## Product decisions (2026-10-25)

Answers to the open questions in PHASES.md.

1. **Three headline projects:** QuantPilot, RoadSafe AI, Wanderers.space. The PRD asks for four; the résumé has three. Wanderers is shown as a project, with its founding-engineer role kept on the project entry, not in `content/roles.ts`.
2. **Mark:** one lime centre dot with three linked satellites, as §4 says. `LogoMark` is updated.
3. **Source chips** stay in Phase 6. The Phase 2 thread ships without them, even though figure C shows them.
4. **First-load budget:** the GSAP boot intro loads after first paint, and the greeting reveal is CSS only. Motion is used through `LazyMotion` with `m` components.
5. **Theme:** dark only at launch. Every token is still written as a `light-dark()` pair now, so the light theme in Phase 6 is a switch, not a rewrite.
6. **Toggle names:** About / Work everywhere, both in the sidebar and on the composer pills.
7. **Session tickets:** short-lived, with a silent refresh, so a mobile IP change costs one retry and not a broken ask.
8. **Contact:** Resend on the server, falling back to `mailto:` with the draft prefilled. There is no browser-send step and no public email key.
9. **Accent:** lime only until the Phase 6 accent picker. The `data-accent` alternatives are removed from `globals.css`.
10. **Class merging:** keep `clsx` + `tailwind-merge`. `AGENTS.md` says to change `"cn"` imports to `"@/lib/utils"` after any `shadcn add`.

## Phase 1 shell

- **Light tokens not in the PRD.** §9 gives light values for nine tokens. `--raised` (#FBFAF7), `--line-soft` (#EAE8E2), `--line-muted` (#CFCDC6) and `--dim` (#6E717A, 4.6:1 on the light page) are derived from that palette. `--accent-fg` (#0E0F12) is the dark text that §9 requires on lime fills.
- **`muted` means two things.** shadcn uses `bg-muted` as a quiet surface; the PRD uses `--muted` as label text. The CSS variables keep the PRD names. Tailwind `bg-muted` maps to `--surface`, and `text-muted-foreground` maps to the PRD `--muted`.
- **Theme.** `<html data-theme="dark">` with `color-scheme: dark`. The pre-paint script honours a saved `theme` in localStorage, but nothing writes one until the Phase 6 toggle. The `dark:` variant follows `data-theme`.
- **Pre-paint scripts.** Theme and rail state are set on `<html>` from `<head>`. The greeting and sub-line are server-rendered with defaults and corrected by inline scripts before paint, per the Next.js "preventing flash before hydration" guide. No `new Date()` runs during prerender, which Cache Components forbids.
- **Rail header** shows first and last name ("Guransh Kohli") so it fits 248px; the profile row shows the full name.
- **Unfilled content is hidden, not shown.** `isFilled()` hides the composer location badge and the term while they are still placeholders.
- **Brand icons.** lucide-react 1.x dropped GitHub and LinkedIn, so `components/icons.tsx` draws them as 1.5px line icons.
- **Stale Tailwind CSS after adding files.** A Turbopack build reusing `dist/cache` once shipped CSS without classes from new files. `rm -rf dist` before a build fixes it locally.

## Phase 1 motion

- **Intro flag.** The `<head>` script sets `<html data-intro>`: `boot` on a first visit, `reveal` after that (the `booted` key in localStorage), and nothing with reduced motion. While it is set, CSS hides what waits on JS: the shell during the boot, and the chips. `components/motion/Intro.tsx` reveals them and removes the flag. A CSS failsafe shows them after 5 s if the scripts never load.
- **Boot.** The mark draws, the overlay fades and the shell fades in, in 1.6 s. Any key, click or the "Skip intro" button jumps to its end. GSAP is a separate chunk imported after first paint, and only on a first visit.
- **Greeting reveal is CSS only (1B review).** The server renders the greeting as word spans, and the pre-paint script swaps in the spans for the visitor's time of day. CSS staggers them from first paint (40 ms, 500 ms each, 8 px rise) and fades the sub-line up 200 ms in. The h1's HTML is set with `dangerouslySetInnerHTML`, so React never hydrates spans the script replaced. On a first visit a CSS delay of 1.4 s holds the reveal until the shell fades in. Reduced motion shows it still. The chips start (Motion) as the greeting settles, timed from first contentful paint.
- **Hero.** The 2D mark is server-rendered and stays for phones under 600 px, reduced motion and browsers without WebGL 2. Otherwise the 3D scene loads on idle and crossfades in after its first frame. The canvas is twice the hero box so bloom fades out before its edge. Scene colours are read from the theme tokens at mount.
- **Bloom on slow devices.** drei `PerformanceMonitor` turns bloom off when the frame rate drops (PRD §10). Headless Chrome's software renderer always triggers this, so automated screenshots show the core without its glow.
- **Toaster** removed in Phase 5: nothing ever toasted, and its loader was first-load weight.
- **First-load JS.** Measured gzip of the scripts in the home page HTML: 189 kB at Checkpoint 1A and 198 kB at 1B. React DOM and the Next.js client runtime alone are about 117 kB; the rest is mainly Radix (tooltip, dialog), lucide icons and Motion's core. The 3D chunk is 268 kB gzip. GSAP (boot only) is a 27 kB chunk loaded after first paint on a first visit.
- **LCP (1B review).** Lighthouse 13.5, mobile preset, production build on localhost, median of 3: 0.77 s on a repeat visit and 0.77 s on a first visit (FCP 0.67 s, CLS 0, TBT 14 ms). The LCP element is the composer placeholder: split into word spans, the greeting is no longer one large text block. On a first visit the boot intro hides the shell for about 1.6 s, which Lighthouse doesn't count.

## Phase 2 thread (Checkpoint 2A)

- **Thread code is lazy.** `lib/thread/store.ts` (first load) holds the view and turns and imports no thread code. The router, answer texts and thread UI are one 3.9 kB chunk (`components/thread/runtime.ts`), loaded by `import()` and prefetched on hover, focus or press of any chip, sidebar item, send button, or composer focus. `homeChips` and chip labels moved to `content/chips.ts` so the home page doesn't pull in `answers.ts`.
- **Home stays mounted, hidden, during a thread.** Rebuilding it would lose the pre-paint greeting (the inline script only runs on first load), and the hidden hero canvas stops drawing. The rail header (mark and name) returns home and clears the thread.
- **Router.** Topics are curated answer ids. Entity signals come from `content/roles.ts` and `content/projects.ts`; the topic words (résumé, Spotify, work, built, music, where…) live in `lib/router.ts`. "Says nothing about" means the word is absent from the current topic's answer text and its own signals. One addition to the PRD rule: a question that points back at the current topic ("that", "it", "this", "there", "they"…) keeps it even if it has a weak word, so "how does that work" inherits as the PRD's own example requires. Strong names still switch.
- **Typed questions without AI.** A strong or weak route gets that topic's curated answer. An inherited topic, no topic, or the answer just shown gets "The live AI arrives soon. Try one of these:" with follow-up chips.
- **Follow-up chips** are the topic's own follow-ups, then the home chips for the current mode, skipping answers already shown, three at most.
- **Motion.** The question bubble rises from the composer (32 px, 260 ms spring) rather than a shared-layout animation from the home composer, which would need Motion's layout features in the first load. The answer fades up over 240 ms after it. Reduced motion shows both still and scrolls instantly.
- **Focus.** Asking from the home screen moves focus to the conversation region, because the chip or button that asked is hidden with the home screen. Screen readers hear each answer through a separate text-only live region (Phase 5), not the conversation itself.
- **INP measurement.** Event Timing API (`PerformanceObserver` on `event` entries, the longest entry per `interactionId`, as web-vitals does) in a real, non-headless Chrome against `next start`. Headless Chrome reported one false 930 ms presentation delay per run with no long task in the trace, so headless numbers aren't used for INP.

## Phase 2 attachments (Checkpoint 2B)

- **Matcher floor (changed in 3A).** A card named by its title always attaches; the confidence floor only filters cards matched by body words. A real gpt-6-luna answer naming all three projects, but RoadSafe AI only briefly, had dropped RoadSafe under the old rule.
- **Matcher** (`lib/matcher.ts`). Title words are the project title or company name (job titles like "AI Engineer" are too generic). Words are lower-cased, accent-free, stemmed to a crude singular, and words under three letters or in a stopword list are dropped. "Sibling" means every other indexed card, projects and roles together. Score: 3 for a title hit plus 1 per distinctive word. The confidence floor keeps cards scoring at least half the best card's score.
- **Which path uses it.** Chips and sidebar items keep the cards listed in `content/answers.ts`. Typed questions use the matcher on the question and the answer. If the curated answer has no cards of its own (résumé, contact, listening), only cards the question names are added, so the résumé answer naming every company doesn't pull in the timeline. Phase 3 AI answers will use it the same way.
- **"Show all"** appears under any narrowed project or role list and expands it in place.
- **Cards wait for the text.** A turn mounts its attachments when the answer's fade-up completes (immediately with reduced motion).
- **Fallbacks while content is a placeholder.** Posters: a shorter typographic tile with the title in dim type and the stack in mono. Logos: monogram initials. Links: only filled ones show (Live is hidden for all three projects; RoadSafe AI has no Code link yet). The music grid hides while `content/music.ts` is a placeholder, and the Listening answer says the playlist isn't up yet instead of promising one.
- **Role timeline.** One role shows every impact line; a list shows the first two each (PRD: "one or two impact sentences").
- **Résumé tile** is drawn (paper with the name and ruled lines), not a render of the PDF's first page, which would need a PDF renderer.
- **Hover** lifts a project card 3px and a lime edge light follows the pointer; reduced motion turns the lift off.

## Phase 3 AI ask, server side (Checkpoint 3A)

- **Split.** 3A is the server: session tickets, guards, the Upstash limiter and bill guard, grounding, the system instruction, and the streamed answer with attachments. 3B is the client (streaming reveal, caret, Escape, loading verbs, send pulse) and the golden set.
- **Budget: $20 a month** (2026-10-26), a daily cap of $20 / 31 = $0.645. Each answer's real token usage is priced (`lib/ai/pricing.ts`: OpenAI Standard-tier rates from the pricing page on 2026-10-26 for the GPT-6 family; cache writes at input rate) and added to a per-UTC-day total in Upstash. An ask reserves $0.02 before calling the model and settles to the real cost after, so concurrent asks can't all slip under the cap. A failed or aborted answer keeps its reservation. Unknown models are priced at the top rate (gpt-6-astra). Measured per typical answer: about $0.0001 on gpt-6-luna with a cache hit ($0.0003 on a cache miss), so the cap holds several thousand answers a day; about $0.0013 on gpt-6.1-sol.
- **Limits fail closed.** 8/min and 40/hour per IP (sliding windows), a 700 ms gap (a Redis key that lives 700 ms), and the daily cap all live in Upstash. If Redis can't be reached, or the rate limiter times out, the ask gets a 503 and no model call is made. `@upstash/ratelimit` lets requests through on timeout by default; that is treated as a block here.
- **Tickets.** `"<expiry ms>.<HMAC-SHA256 of expiry and IP>"`, 10-minute life, verified in constant time with Web Crypto. The IP is never in the ticket. The client (3B) refreshes before expiry and once on a 401.
- **Origin check.** A matching `Origin`, or `Sec-Fetch-Site: same-origin` when a browser omits `Origin` on a same-origin GET.
- **History.** The client sends `{ role: "visitor" | "site", text }`; any other role is a 400. Only the last 8 are kept, each capped at 700 characters with control and invisible formatting characters stripped. They reach the model inside `<transcript_record>` in the visitor's message, never as real turns; angle brackets become look-alikes so a message can't close the record. The router hint goes in `<lead_here>` and the question in `<question>`.
- **Prompt.** One cached system block: the rules from PRD §11, `content/voice.md` (minus its own notes and unfilled lines) and a fact record built from `content/` that skips every placeholder. The router hint and question are after it, so the cached prefix never changes.
- **Model settings.** Model from `ASK_MODEL` (recommended gpt-6-luna: $0.10 / $0.01 cached / $0.50 per million tokens). `reasoningEffort: "low"`: short conversational answers don't need deep reasoning. No reasoning summaries, and `store: false` so OpenAI doesn't keep the conversations. A fixed `promptCacheKey` groups every ask on one prompt cache. `maxOutputTokens: 4096` as a runaway guard (reasoning counts toward it); length comes from the prompt.
- **Stream format.** Newline-delimited JSON: `text` events, then one `attachments` event from the entity matcher (scoring the question and the full answer), then `done` with the routed topic. `error` replaces `done` if the model fails.
- **Blocked questions, no fallback.** There is no refusal fallback to another model. A question the model's safety checks block ends with a `blocked` event carrying `blockedReply` from `content/answers.ts` ("That's not one I'll answer here. Ask me about something I've built instead.") and the client replaces any streamed text with it. It covers an empty answer, a `content-filter` finish, and OpenAI's 400 `invalid_prompt` for a flagged question; a rejected prompt isn't billed, so its reservation is refunded.
- **Secret check.** `npm run build` ends with `scripts/check-bundle-keys.mjs`, so every Vercel build fails if an OpenAI, Anthropic or Resend key shape, or the value of any server secret, appears in `dist/static`.
- **Live tests.** `npm run test:live` (never part of `npm test`) runs `/api/ask` against the real model with only the Redis limiter swapped out, and runs the real limiter against Upstash with a made-up IP, no model calls, refunding its reservations and deleting its keys afterwards (`tests/live/`).
- **Verified 2026-10-26** on the production build with real Upstash and OpenAI: gap, 8/minute and hour keys written in Upstash, reservations settled to real cost ($0.0013 per answer), answers streamed with the matched card.

- **Golden set** (`tests/golden/questions.ts`, `npm run golden`): 40 questions (41 since the résumé sync) with the facts a correct answer must contain (roles, projects, education, contact), things it must never invent (phone, GPA, a fake employer, hobbies), a forged-history case, a prompt injection and a greeting. Graded by patterns, with curly apostrophes normalised. Each run writes `tests/golden/last-run.json`. First run on gpt-6-luna: 40/40, $0.0016 for the set.

## Phase 3 AI ask, client side (Checkpoint 3B)

- **Which questions use the AI.** Typed questions only. Chips, follow-up chips and sidebar items stay on curated answers: instant and free.
- **Where the code lives.** The AI client (`lib/thread/ai-client.ts`), the streaming UI (`components/thread/AiAnswer.tsx`) and the loading verbs are in the lazy thread chunk. The first load gained only the store's AI fields, `warmAI()` and a selector hook: 198.4 kB.
- **Tickets.** Fetched when the composer gets focus, refreshed a minute before expiry while the tab is visible (dropped while it's hidden, and fetched fresh on the next ask), and refetched once if `/api/ask` returns 401.
- **Streaming.** Text arrives from `/api/ask` and is batched to one store update per animation frame. Each answer reveals at a pace that catches up a sixth of its backlog per frame, with a blinking lime caret; Escape shows everything that has arrived and keeps up from then on. Cards and follow-up chips appear only when the text is fully shown. While waiting for the first token the loading verbs from `content/voice.md` cycle (imported raw through a Turbopack `?raw` rule) and the send button pulses; screen readers hear "Answering", and the turn is `aria-busy` until done.
- **Reduced motion** follows the setting live through `useMediaQuery`, not Motion's `useReducedMotion`, which reads it once: a still caret, no verb or pulse animation, and text shown in chunks four times a second.
- **Problems.** Never a raw error. Copy is `aiProblems` in `content/answers.ts`: rate-limited (with the server's wait when it's under 90 s), the hourly limit, the daily budget, offline (503), and a dropped connection or server failure, which get a Retry button that re-asks in the same turn. A blocked question shows `blockedReply`, replacing anything streamed. Every problem ends with the router's best chips for the question.
- **Re-renders while streaming.** Thread turns are memoised, and the composers and main view read the store through `useThreadValue`, so they ignore streamed text. This took the worst interaction while streaming, at 4× CPU slowdown, from 200 ms to 80 ms.
- **Known warning.** React Three Fiber logs `THREE.Clock: This module has been deprecated` with three 0.186. It's harmless and comes from inside the library; it goes away when fiber moves to `THREE.Timer`.

## Phase 4 media, listening and contact

- **Sheets.** One shell for project details and contact: the shadcn sheet (Radix Dialog) from the right, full width on phones and 560 px from `sm` up, sliding over 280 ms. Radix closes it on Escape, the backdrop or X, traps focus and locks page scroll. Focus goes back to the button that opened it, which is tracked explicitly because Safari doesn't focus a clicked button. The sheet UI and zod are their own lazy chunk (33 kB gzip), fetched when a card or "Send a message" is hovered or focused, or on first open. State lives in `lib/sheets.ts`.
- **Project cards open the sheet.** The title is a real button stretched over the card, so a click or tap anywhere on the card opens the sheet, while Live, Demo and Code links sit above it and still work. The sheet shows the demo (or poster), the write-up when it's filled in, the highlights, the stack and the links. Placeholders never show.
- **Hover demos.** `preload="none"`, muted, looping, invisible until playing so the poster shows meanwhile. Only a mouse plays them; on touch the "Demo" cue stays and a tap opens the sheet. Leaving pauses and rewinds to 0. Reduced motion skips hover playback, and the sheet's demo doesn't autoplay. Projects without a demo render no video at all. No project has a demo yet.
- **Now playing.** The playlist loops from the Unix epoch, so every visitor sees the same song at the same second (`lib/listening.ts`). The live card is a client-only lazy chunk (7 kB) that loads only when `content/music.ts` has tracks; until then the rail shows "Nothing playing" and nothing extra loads. The first frame is a placeholder. The progress bar steps every second with a linear transition. The site has no audio, so **mute** stills the equaliser bars, and the choice is remembered in localStorage.
- **Album art** (`npm run fetch-art`): looks each track up in the iTunes Search API (public, no key), prefers a result by the same artist, and saves 600×600 art to `public/art/`. It skips files it already has (`--force` refetches) and prints the `art` paths to put in `content/music.ts`. It's a script you run, not part of the build, and the site never loads art from the catalogue.
- **Contact** (`POST /api/contact`). Same-origin check, a 16 kB body cap, zod validation shared with the form (`lib/contact.ts`), then the honeypot: a filled `website` field gets a normal success and nothing is sent. Then 4/hour and 60/day per IP in Upstash (sliding windows, failing closed), then Resend from `CONTACT_FROM_EMAIL` to `CONTACT_TO_EMAIL` with the visitor as reply-to. Plain text only.
- **Contact fallback.** Any failure (rate limit, limiter down, Resend error, network) opens the visitor's mail app with the draft prefilled, addressed to the public email in `content/profile.ts`, and the sheet says so with a link in case nothing opened. A 400 shows the server's field errors inline instead. Draft text survives an accidental close and is cleared after a send. Copy is `contactCopy` in `content/answers.ts`.
- **Inline validation.** Errors show on blur (not on an empty field the visitor just tabbed past) and on submit, which focuses the first bad field. An error clears as soon as the field is fixed.
- **Booking link.** `profile.socials.calendar` shows a "Book a call" button in the contact sheet once it's filled in. It's a placeholder for now.
- **Resend sandbox.** `onboarding@resend.dev` can only deliver to the Resend account's own address. Sending to anyone else needs a verified domain, then a change to `CONTACT_FROM_EMAIL`.
- **Verified 2026-10-26** on the production build: one real message sent through the form to `CONTACT_TO_EMAIL`, the 4/hour limit live against Upstash (`tests/live/contact-limits.live.ts`, no email sent), and the 502 and 429 fallbacks opening `mailto:` with the draft. First load 198.0 kB.

## Phase 5 hardening

- **One public email.** `skohliguransh@gmail.com` everywhere (contact card, footer, mailto fallback, the AI's facts). `g4kohli@uwaterloo.ca` is gone from the site's code and content, but it's still printed in `public/Guransh_Resume.pdf`, which needs a new export from the source document.
- **Screen readers hear answers through a text-only live region.** The conversation used to be the `aria-live` region. Two problems: Radix leaves live regions exposed when a modal hides the rest of the page, so the cards' buttons stayed reachable behind an open sheet; and streamed text would be read in fragments. Now a hidden polite region says "Answering…", then "You asked: …. Guransh: …" once the answer is complete (or the problem line), and the conversation is a plain labelled region.
- **Headings.** The thread has a hidden `h1` ("Conversation with Guransh") and each question is an `h2`, so VoiceOver's headings list jumps question to question with each answer's card titles (`h3`) under it.
- **Names.** Mode buttons are "About mode" and "Work mode", so they aren't confused with the About topic. Icon links in the rail footer use a tooltip instead of `title`, which had made screen readers say their name twice.
- **Focus.** Every tab stop shows a ring. The composer's frame turns lime-tinted while focused (about 3.9:1 against the page), with the moving beam on top, because the beam alone lights only part of the frame at any moment.
- **Targets.** Everything interactive is at least 44 px. Project-card title buttons measure 21 px tall, but each stretches over its whole card, which is the real target.
- **Checked with** axe-core 4.14 (WCAG 2.2 AA plus best practices) on home, phone, drawer, thread, both sheets and 404: no violations, and no contrast failures. Chrome's accessibility tree was reviewed for names, roles and states. VoiceOver itself wasn't driven by the automated pass.
- **Reduced motion.** Verified with a detector that watches running animations and style changes after each step: nothing moves on home (no boot intro, 2D mark instead of the 3D hero), composer focus, the thread, card hover, or either sheet. Hover demos don't play (Phase 4).
- **Analytics** (`lib/analytics.ts`, `lib/analytics-load.ts`). The events from PRD §15, typed so they can only carry fixed properties: `ask` (source, routed topic, mode), `answer_done` (path, latency, attachment count), `card_hover_play` (slug), `sheet_open` (slug or "contact"), `contact_sent` (server or mailto), `resume_download` (rail or card), `error` (source and kind). Never question text, names, emails or messages. PostHog loads as its own chunk after the page's load event and an idle moment, with memory persistence (no cookies), anonymous events only, no autocapture, recording or surveys. It doesn't load at all with Do Not Track or Global Privacy Control on. Events from before it loads are queued (up to 50). There's no "browser" contact result, because the site has no browser-side send.
- **Errors.** `app/error.tsx` catches render errors with "That broke on my side." and Try again / Start over. `app/global-error.tsx` covers a failing root layout, kept bare because Next loads it on every page. `app/not-found.tsx` is a styled 404. If the thread chunk fails to load (offline, or a deploy replaced it), the click now lands on the error page instead of doing nothing, and Try again works once the network is back. API failures were already friendly (Phases 3 and 4).
- **First-load budget, held at 199.7 kB.** A custom error page makes Next ship about 1.5 kB of its error-boundary runtime. To stay under 200 kB: the 404 uses a plain link (`next/link` added 3.3 kB), the unused Toaster is gone, analytics is imported lazily everywhere, and the shadcn sheet's built-in close button no longer pulls in `Button`, `cva` and Radix `Slot`. There is about 0.3 kB of headroom left.
- **SEO.** Title template, description from `content/profile.ts`, canonical URL, Open Graph and a large Twitter card. The share image (`app/opengraph-image.tsx`) is drawn in the site's style (mark, greeting line, composer, chips, constellation) and prerendered at build: its fonts are subset TTFs in `assets/fonts/`, read through `"use cache"` as base64, because Cache Components treats a plain file read as request-time data and Node Buffers don't survive the cache intact. `robots.txt` allows everything but `/api/`, and `sitemap.xml` lists the one page. The base URL is `NEXT_PUBLIC_SITE_URL`, else Vercel's production URL.
- **Shared limiter.** Two separate processes (standing in for two serverless instances) sent 3 contact checks each for one IP at once: exactly 4 of the 6 got through (`tests/live/shared-limit.live.ts`).
- **Measured 2026-10-26** on the production build. Lighthouse mobile, three runs each: LCP 0.78 to 0.82 s, TBT 20 to 70 ms, CLS 0, score 100. INP in headful Chrome across the main flows (mode toggle, chips, sidebar, rail collapse, both sheets, contact typing, asking, typing while streaming): worst 72 ms at normal speed, and 184 ms on a phone at 4× CPU slowdown. One 856 ms contact-typing reading at 4× on desktop didn't reproduce in six reruns, which peaked at 128 ms.

## Launch (Phase 7, prepared 2026-10-27)

- **Order.** Phase 7 (launch) comes before Phase 6 (elevation), which is now post-launch.
- **Listening is hidden while `content/music.ts` is empty.** `hasTracks` in that file decides it: no sidebar topic, no chip (the About-mode chips become Projects, Résumé, Experience, Contact), never a follow-up, and no now playing card. The curated Listening answer is unreachable until then. Adding a filled-in track brings everything back with no other change.
- **Analytics off until the key is set.** With no `NEXT_PUBLIC_POSTHOG_KEY` the site loads no analytics code, queues nothing, contacts no outside host and logs nothing (checked in a browser across chips, the thread and a sheet). Adding the key on Vercel and redeploying turns it on.
- **Placeholder audit.** A browser crawl of 25 views (home in both modes, every sidebar item, every chip and follow-up, all three project sheets, the contact sheet, the phone drawer and the 404) found no visible `[fill in]`, `[placeholder]`, TODO, `undefined` or `NaN`, in text or in `alt`, `aria-label`, `title`, `placeholder`, link or image attributes. Placeholders still in `content/` are all hidden by `isFilled`: project write-ups, posters, demos, years and live URLs; the RoadSafe AI code link; role logos; profile location, term and booking link; interests; the playlist; and the voice guide's own phrases and rules.
- **Link audit.** GitHub profile, `quantpilot` and `Kapil-Iyer/Wanderers` (both public) return 200; the résumé serves as a PDF; the email link is `mailto:skohliguransh@gmail.com`. LinkedIn answers automated checks with its anti-bot 999, so it needs a manual click.
- **Production env vars** (names only): `OPENAI_API_KEY`, `ASK_MODEL`, `ASK_SIGNING_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`. Optional: `NEXT_PUBLIC_SITE_URL` (once there's a custom domain), `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` (after launch). `ANTHROPIC_API_KEY` is no longer used. Without the first eight, `/api/ask` and `/api/contact` answer 503 and the site falls back to chips and `mailto:`.

## Content synced to the new résumé (2026-10-27)

- **The résumé is the source.** Roles, projects, education, certifications and skills now mirror it word for word where the résumé has the fact, with grammar tidied (e.g. "second-order impacts of market events").
- **Added:** AI/ML Undergraduate Researcher, University of Waterloo Data Group, under Prof. Jimmy Lin (Oct 2026 to now): BM25, dense and learned sparse retrieval on 8.8M MS MARCO passages for Anserini, and a BM25 + monoT5 pipeline with RankLLM (+37% ranking quality). Windscribe's Feedback Radar. The ML Specialization (Andrew Ng). The RoadSafe AI code link and the Wanderers live site. MySQL, XGBoost, OpenClaw, Cursor, Claude and Codex in skills; Statistics and Logic & Computation in coursework.
- **Removed, because the new résumé dropped them:** Stripe Radar fraud triage (Windscribe), Offball XI and the 2022 World Cup (WAT.ai), the Savi data-integrity line, junction proximity (RoadSafe AI), Gemini, Google Maps, K-means and the Velocity pitch (Wanderers), Databricks AI Agent Fundamentals, Functional Programming, Calculus, Algebra, System Design, Statistical Analysis, CrewAI and GitHub as a skill.
- **Names.** "WAT.ai" as on the résumé (the router still accepts "Wat.ai"). The research role's company is "University of Waterloo", so its card attaches by `matchNames` (Jimmy Lin, Anserini, RankLLM) instead: matching on "Waterloo" would pull it into Wanderers and education answers. Monograms skip small words, so it reads "UW".
- **Emails.** The résumé shows the school address (`g4kohli@uwaterloo.ca`); the site uses the personal one (`skohliguransh@gmail.com`) everywhere, as decided in Phase 5. Both are the owner's.
- **Phone.** The résumé PDF shows a phone number. The site and the AI still never state it (`personal.doNotShare`).
- **Golden set:** 41 questions. Offball XI, World Cup, junction and Velocity cases became research-role, star-schema and Wanderers-stack cases. The forged-history check no longer fails a correct denial ("not listed as CTO of OpenAI"). Run 2026-10-27: 41/41.

## Health check, persistent scene and a faster router (2026-10-28)

- **`GET /api/health`** answers only true/false: each required env var present, Upstash ping, and whether OpenAI accepts the key and serves `ASK_MODEL` (a free `GET /v1/models/{model}`, no generation). 200 when everything passes, 503 otherwise. 10 a minute per IP, through Upstash when it's reachable and in memory when it isn't. Tested healthy, and with a wrong Upstash token and OpenAI key (both reported false, route stayed up, rate limit still applied).
- **503 reasons in the logs.** `/api/ask` and `/api/session` now log why they answered 503: the missing env var names, or the Upstash error type and message. Never values.
- **The scene stays when a conversation starts.** Its layer moved from the home column to `#scene-backdrop` in AppShell, behind home and thread; the canvas element survives home → thread → home. On the first question, over about 600 ms: the mark drifts up and back into a clear strip at the top, the galaxy recedes, and the layer fades to 30% with a 2px blur. Frames then drop to 24 a second (`frameloop="demand"` with a ticker that skips while the tab is hidden). While an answer streams the lime core pulses (scale and brightness on a 1.2 s wave), settling when it ends. Going home reverses it.
- **Contrast in the thread.** `.scene-veil`: a fixed band of 90% background behind the conversation column, open at the top 9rem where the mark floats. Worst case at the open strip, body text over the dimmed lime core, is about 5.6:1.
- **Without 3D** (phones, reduced motion, no WebGL 2): `.scene-static`, a CSS-only dim starfield with a faint lime glow, behind the thread only, no pulse and no JS. `<html data-view>` (written by the thread store only when the view changes) switches both.
- **Router speed.** Every typed question used to compile a Unicode RegExp per signal term, a few hundred of them: about 50 ms of processing per send, around 235 ms at 4x CPU, which put sending a question at 280 to 340 ms INP. Terms are now found with a substring search and a letter-or-digit check on each side. Sending now measures 80 to 88 ms (phone, 4x) and 112 to 136 ms (desktop, 4x).
- **Measured.** First load 197.9 kB. INP, all flows, desktop 1x: worst 112 ms. Typing while an answer streams: 56 to 88 ms at 4x across reruns, with one non-reproducible 1,088 ms reading under heavy machine load. Main-thread cost: about 7% on home at 60 fps, 4.5% in the thread at 24 fps. axe clean, reduced motion still. Golden set 50/50 (twice; one earlier run had the forged-CTO case ignore rather than deny the claim).

## Certifications and an interactive thread backdrop (2026-10-28)

Certifications are now structured in `content/personal.ts` (name, optional issuer, issue and expiry month, PDF). Only the two AWS certificates carry dates and PDFs, taken from the certificates themselves (`public/certificates/`). The other three have names only, since no source gives their issuer or date. A new curated answer, "certifications", shows a card with a View link per PDF. It's reached from the About and Résumé follow-ups, and typed questions naming a certification route to it (the AI's answer gets the card too).

In the thread, the 3D scene now stays at 75% with no blur, and the veil behind the text column is lighter (62% of the background, down from 90%), so the scene stays visible around the conversation. The constellation network follows the pointer: nodes within reach step aside and link to it with lime threads, and a click sends a ripple outward. Touch doesn't leave a cursor behind. In the thread, frames stay on demand at 30 a second, plus one per pointer move.

## "Try asking" starters (2026-10-27)

- **Row.** Four starter questions (`starterQuestions` in `content/chips.ts`) under the home chips, behind a mono "TRY ASKING" label: 12.5px muted text, a thin `line-soft` border, no hover lift, so they read as suggestions rather than competing with the chips. Each is a 44px button with the standard focus ring. They rise in after the chips with the same 60 ms stagger (still under reduced motion), and wait for their turn during the first-visit intro like the chips do (`[data-starter]` in the intro CSS).
- **Behaviour.** A click sends the question as a typed question, so it goes through the AI and streams. The row is gone for the rest of the visit once anything has been asked (`started` in the thread store survives going home).
- **Phones.** One row that scrolls sideways, faded at the right edge, with snapping aligned to the composer. The home grid is now `grid-cols-1` (`minmax(0, 1fr)`): with the default track, the row's width stretched the whole home column off screen.
- **Budget.** It's in the first load (it has to paint with the chips): 197.8 kB, up 0.4 kB.
- **Interests** are still the `[fill in]` placeholder: the request carried the template text, not real interests. Until they're filled in, "What do you do when you're not coding?" gets the off-topic deflection.

## Final pre-launch audit (2026-10-27)

- **Favicon.** `app/favicon.ico` was still the default Next.js "N". Replaced with `app/icon.svg` (the mark on the page background) and `app/apple-icon.tsx` (180 px, prerendered).
- **Dependencies.** `npm audit --omit=dev` flagged 5 issues, all inside the `shadcn` CLI (its MCP server's express/body-parser, ajv's fast-uri, and an old zod 3 in `@shadcn/registry`). The site's own zod 4.6.6 isn't affected. The CLI was listed as a runtime dependency; it's now a devDependency (only its CSS is imported, at build time, and Vercel installs devDependencies to build). Production audit: 0 vulnerabilities. The fixed CLI (4.23.0) came out 2026-10-27, too new to pin.
- **Re-verified on the production build:** typecheck, lint, 70 unit tests, 8 live tests (OpenAI and Upstash), golden set 50/50, secret check, first load 197.4 kB, Lighthouse mobile median LCP 0.78 s / TBT 16 ms / CLS 0, axe clean on 8 states, no visible placeholders in 28 views, reduced motion still, analytics silent without a key.

## Content merged from all four résumés (2026-10-27)

- **Base and additions.** Résumé S (the one served as `Guransh_Resume.pdf`) is the base. Facts from the Data, ML and Shopify versions that S lacks are added, and S's wording wins where they overlap. This supersedes the "removed" list in the résumé-sync entry above: Stripe Radar triage, the World Cup, the Savi data-integrity line, Gemini, K-means, Velocity, Databricks, Calculus and Functional Programming are back because another résumé has them. Offball XI, junction proximity, System Design and Statistical Analysis appear in none of the four, so they stay out.
- **Added:** MerchantOS (Shopify résumé) as the first project, with its public code link. Research: Data Systems Group, BGE and SPLADE, matching published results, and nDCG@10 0.51 to 0.70 on TREC DL19. WAT.ai: Google Research Football counterfactual off-ball runs, run-value metrics and XGBoost. Windscribe: Stripe Radar triage and "full-time". Savi: GraphQL. RoadSafe AI: 1 fact and 4 dimension tables. Wanderers: K-means, Gemini and Velocity ("UW's startup incubator", in the résumé's words, so the card doesn't match on "University of Waterloo"). Skills gain a data and analytics group, plus AWS, GCP, RankLLM, Gemini API, LLM evals and CrewAI.
- **Two 20% results at Windscribe.** S credits 20% less manual time to Feedback Radar; the ML and Shopify résumés credit 20% less manual fraud review to Stripe Radar triage. Both are listed as separate automations.
- **Algebra.** The ML résumé's "Linear Algebra" is used for the Data and Shopify résumés' "Algebra".
- **Sidebar data.** The sidebar now gets only names, ids and dates as props from the server (`lib/nav.ts`), instead of importing `content/roles.ts` and `content/projects.ts`. That took the full role and project copy out of the first load: 197.4 kB with the fourth project, down from 200.7 kB.
- **Golden set:** 48 questions, 48/48 on 2026-10-27.

## Home backdrop and quick links (2026-10-27)

- **3D backdrop.** The home screen's background is now one canvas (`components/three/Constellation.tsx`): a three-armed spiral galaxy (6,500 points, lime core fading to the dim grey, one turn every 2.5 minutes), 1,600 distant stars, and 46 drifting nodes that link up when they pass within reach, like constellations forming and breaking. The mark's 3D cluster is drawn in the same canvas, pinned over the hero box at its old size, with the galaxy's core behind it. The camera eases with the pointer, so near layers move more than far ones.
- **Same loading rules as the hero.** It loads after first paint in the 3D chunk (269 kB gzip, under 350), only from 600 px with WebGL 2 and motion allowed. Phones and reduced motion keep the 2D mark and a plain background. It renders through a portal into `#home-backdrop` in `app/page.tsx`, so the first load gained nothing for it (199.8 kB). It stops drawing whenever the home screen is hidden: measured at about 6% main-thread time at 60 fps on home, and 0% in the thread. `PerformanceMonitor` drops bloom and the pixel ratio on slow machines.
- **Readability.** A soft radial pool of the background colour sits behind the greeting, composer and chips, so the scene stays vivid around them but never behind the words.
- **Quick links.** "Résumé" (the PDF in a new tab, `resume_download` from "header") and "About" (the curated About answer) sit top-right over the main area from 860 px, and in the phone header bar below that, where the name shortens to "Guransh Kohli". The thread's top padding grows at that width so the first question clears them.
- **Measured.** axe clean; targets 44 px; reduced motion still shows no canvas and no movement. INP at normal speed: worst 88 ms. At 4x CPU, sending a question measured 200 to 216 ms on desktop and 200 ms on a phone, which has no 3D, so that step doesn't come from the backdrop.

## Performance budgets (2026-10-26)

The PRD's 130 kB first-load budget can't be met on Next 16 and React 19, whose runtime alone is about 117 kB. The budgets are now:

| Budget | Target |
| --- | --- |
| LCP | ≤ 1.8 s, Lighthouse mobile preset |
| TBT | ≤ 200 ms |
| CLS | ≤ 0.1 |
| INP | ≤ 200 ms |
| First-load JS | ≤ 200 kB compressed (gzip of the scripts in the page HTML) |
| 3D chunk | ≤ 350 kB compressed, excluded from first load |

These replace the PRD's 130 kB first-load and 100 ms INP targets (INP kept, at 200 ms). Cheap trims applied: the Toaster loads lazily, Motion uses `LazyMotion` with `domAnimation` loaded async (a separate 14 kB chunk), and `lucide-react` is already in Next's default `optimizePackageImports` list. The home page's first load contains nothing from three, R3F, drei, postprocessing, `ai`, posthog, Upstash, sonner or GSAP. At this decision: 198 kB first-load, LCP 0.77 s, TBT 14 ms, CLS 0.

## Content

Facts come only from the résumé (now the late-October 2026 version in `public/Guransh_Resume.pdf`) and the earlier content notes. They now live in typed files in `content/`. Anything not in those sources is a `[fill in: …]` placeholder. Hobbies are not on the résumé, so the AI must not invent any. The phone number is not published.

Router signals in `content/roles.ts` and `content/projects.ts` are names and topic words taken from each entry's own facts.
