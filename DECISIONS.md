# Decisions

Notes for choices the spec leaves open. Phase 1 only.

## Content

Personal facts come from the October 2026 résumé. The graph keeps three experience nodes, so Wanderers sits on the projects ring even though the résumé also lists it as a founding-engineer role. The résumé has three projects, so the fourth project slot is removed and RoadSafe AI uses the left-side angle. Life nodes stay `[Interest]` and `[Hobby]` because the résumé does not name hobbies. The phone number is not published. GitHub and LinkedIn URLs are the ones already confirmed for this account. The résumé PDF itself has no project URLs, so RoadSafe AI has no code link.

The owner node's `askQuestion` is an empty string. Tapping it will clear the answer in phase 2.

## Tooling

- npm is the package manager. `create-next-app` refuses a package name with capital letters, so the package is `portfolio-website` inside this folder.
- Versions are pinned exactly in `package.json`.
- shadcn/ui is the current `radix-nova` preset. It installs the unified `radix-ui` and `cn` packages, so this project does not add separate `clsx`, `tailwind-merge`, or `@radix-ui/react-slot`.
- TypeScript is 6.0.3, not 7.0.2. `typescript-eslint` (pulled in by `eslint-config-next`) does not support TypeScript 7 yet, so lint would not run.
- ESLint stays on 10.12.0. `eslint-config-next` still declares peers for ESLint 9; install warns, and lint is the check that it actually runs.
- `zod` is not installed yet. It arrives with the API in phase 4.

## Theme

The page is always the dark observatory palette. There is no light theme in the spec.

Accent alternatives (`#7CC7FF`, `#FFB86B`, `#F2F2F2`) are available as `data-accent="sky" | "amber" | "paper"` on `<html>`. The footer control that sets them is part of phase 3.

shadcn's `--primary` points at the spec `--accent`, so the ask button uses the lime fill. Spec `--muted` is the label grey `#9A9DA6`.

## Layout

- Contact in the header scrolls to `#ask`. There is no separate contact page in the spec.
- Résumé links to `/resume`, a placeholder page. Phase 5 replaces it with the tracked PDF route. A `page.tsx` and a `route.ts` cannot share that segment, so the page will be removed then.
- The ask panel is visual only. Submitting the form and the "Try one" chips do nothing until phase 2.
- Pill boxes are estimated, not measured in a browser: `0.56em` per character, 24px of horizontal padding, height `fontSize * 1.25 + 16`. The overlap test requires 8px of clearance at a canvas width of 620px and above. Below that, the flat graph can crowd; the mobile ring list is phase 5.
- Ring labels sit 12px outside the left edge of each ellipse, set in vertical writing mode and rotated 180° so they read bottom to top.

## Deferred

3D rendering, the opening build, Magic UI, Aceternity, the ask store, retrieval animation, and live RAG are later phases.
