<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules

- After any `shadcn add`, change `import { cn } from "cn"` in the new files to `import { cn } from "@/lib/utils"`. This project uses `clsx` and `tailwind-merge`, not the `cn` package.
- `shadcn init` and `shadcn add` can rewrite `app/globals.css` and `app/layout.tsx`. Check the diff and restore the PRD tokens and fonts.
- Content in `content/` is the only source of facts. Never invent facts; use a `[fill in: …]` placeholder instead.
