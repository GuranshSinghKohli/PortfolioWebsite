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
- The AI provider is Anthropic through the Vercel AI SDK (`ai`, `@ai-sdk/anthropic`). The model comes from `ASK_MODEL`.

## Product decisions (2026-10-25)

Answers to the open questions in PHASES.md.

1. **Three headline projects:** QuantPilot, RoadSafe AI, Wanderers.space. The PRD asks for four; the résumé has three. Wanderers is shown as a project, with its founding-engineer role kept on the project entry, not in `content/roles.ts`.
2. **Mark:** one lime centre dot with three linked satellites, as §4 says. `LogoMark` is updated.
3. **Source chips** stay in Phase 6. The Phase 2 thread ships without them, even though figure C shows them.
4. **First-load budget:** the GSAP boot intro and SplitText load after first paint. Motion is used through `LazyMotion` with `m` components.
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

- **Intro flag.** The `<head>` script sets `<html data-intro>`: `boot` on a first visit, `reveal` after that (the `booted` key in localStorage), and nothing with reduced motion. CSS hides the shell (boot only), greeting, sub-line and chips while it is set; `components/motion/runIntro.ts` animates them in and removes it. A CSS failsafe shows everything after 5 s if the intro script never loads.
- **Sequence.** Boot (mark draws, overlay fades, shell fades in) takes 1.6 s. Any key, click or the "Skip intro" button jumps to its end. The greeting reveal then runs on every motion-allowed visit, and the chips rise in as it settles. GSAP and SplitText are a separate 30 kB chunk imported after first paint.
- **The greeting is hidden until GSAP loads.** Showing it and then re-hiding it for the reveal would flash. The cost is that the greeting (likely the LCP element) paints when the reveal starts, not at first paint. Reduced-motion visitors see it at first paint.
- **Sub-line.** The PRD only animates the greeting; the sub-line fades up 200 ms after it, so it doesn't sit alone on screen during the reveal.
- **Hero.** The 2D mark is server-rendered and stays for phones under 600 px, reduced motion and browsers without WebGL 2. Otherwise the 3D scene loads on idle and crossfades in after its first frame. The canvas is twice the hero box so bloom fades out before its edge. Scene colours are read from the theme tokens at mount.
- **Bloom on slow devices.** drei `PerformanceMonitor` turns bloom off when the frame rate drops (PRD §10). Headless Chrome's software renderer always triggers this, so automated screenshots show the core without its glow.
- **Toaster** loads after hydration through `next/dynamic`. Nothing toasts before Phase 4.
- **First-load JS is over the 130 kB budget.** Measured gzip of the scripts in the HTML: 189 kB at Checkpoint 1A and 198 kB at 1B. React DOM and the Next.js client runtime alone are about 117 kB. The rest is mainly Radix (tooltip, dialog), lucide icons and Motion's core. The 3D chunk is 268 kB gzip, under its 350 kB budget.

## Content

Facts come only from the October 2026 résumé and the earlier content notes. They now live in typed files in `content/`. Anything not in those sources is a `[fill in: …]` placeholder. Hobbies are not on the résumé, so the AI must not invent any. The phone number is not published.

Router signals in `content/roles.ts` and `content/projects.ts` are names and topic words taken from each entry's own facts.
