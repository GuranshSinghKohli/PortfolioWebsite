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
- **Toaster** loads after hydration through `next/dynamic`. Nothing toasts before Phase 4.
- **First-load JS.** Measured gzip of the scripts in the home page HTML: 189 kB at Checkpoint 1A and 198 kB at 1B. React DOM and the Next.js client runtime alone are about 117 kB; the rest is mainly Radix (tooltip, dialog), lucide icons and Motion's core. The 3D chunk is 268 kB gzip. GSAP (boot only) is a 27 kB chunk loaded after first paint on a first visit.
- **LCP (1B review).** Lighthouse 13.5, mobile preset, production build on localhost, median of 3: 0.77 s on a repeat visit and 0.77 s on a first visit (FCP 0.67 s, CLS 0, TBT 14 ms). The LCP element is the composer placeholder: split into word spans, the greeting is no longer one large text block. On a first visit the boot intro hides the shell for about 1.6 s, which Lighthouse doesn't count.

## Phase 2 thread (Checkpoint 2A)

- **Thread code is lazy.** `lib/thread/store.ts` (first load) holds the view and turns and imports no thread code. The router, answer texts and thread UI are one 3.9 kB chunk (`components/thread/runtime.ts`), loaded by `import()` and prefetched on hover, focus or press of any chip, sidebar item, send button, or composer focus. `homeChips` and chip labels moved to `content/chips.ts` so the home page doesn't pull in `answers.ts`.
- **Home stays mounted, hidden, during a thread.** Rebuilding it would lose the pre-paint greeting (the inline script only runs on first load), and the hidden hero canvas stops drawing. The rail header (mark and name) returns home and clears the thread.
- **Router.** Topics are curated answer ids. Entity signals come from `content/roles.ts` and `content/projects.ts`; the topic words (résumé, Spotify, work, built, music, where…) live in `lib/router.ts`. "Says nothing about" means the word is absent from the current topic's answer text and its own signals. One addition to the PRD rule: a question that points back at the current topic ("that", "it", "this", "there", "they"…) keeps it even if it has a weak word, so "how does that work" inherits as the PRD's own example requires. Strong names still switch.
- **Typed questions without AI.** A strong or weak route gets that topic's curated answer. An inherited topic, no topic, or the answer just shown gets "The live AI arrives soon. Try one of these:" with follow-up chips.
- **Follow-up chips** are the topic's own follow-ups, then the home chips for the current mode, skipping answers already shown, three at most.
- **Motion.** The question bubble rises from the composer (32 px, 260 ms spring) rather than a shared-layout animation from the home composer, which would need Motion's layout features in the first load. The answer fades up over 240 ms after it. Reduced motion shows both still and scrolls instantly.
- **Focus.** Asking from the home screen moves focus to the conversation region, because the chip or button that asked is hidden with the home screen. The region is `aria-live="polite"`; follow-up chips sit outside it so they aren't announced with every answer.
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

Facts come only from the October 2026 résumé and the earlier content notes. They now live in typed files in `content/`. Anything not in those sources is a `[fill in: …]` placeholder. Hobbies are not on the résumé, so the AI must not invent any. The phone number is not published.

Router signals in `content/roles.ts` and `content/projects.ts` are names and topic words taken from each entry's own facts.
