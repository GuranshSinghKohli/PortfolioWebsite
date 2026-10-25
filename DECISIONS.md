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

## Content

Personal facts come from the October 2026 résumé, still in `content/*.md` until Phase 0 moves them into typed files. Their `nodeIds` front matter belongs to the old graph and can go then. Hobbies are not on the résumé, so the AI must not invent any. The phone number is not published.
