import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: "dist",
  cacheComponents: true,
  // lib/ai/prompt.ts reads the voice guide at runtime.
  outputFileTracingIncludes: { "/api/ask": ["./content/voice.md"] },
  partialPrefetching: true,
  turbopack: {
    rules: {
      // `import text from "./file.md?raw"` gives the file as a string (loading verbs from content/voice.md).
      "*.md": { condition: { query: "?raw" }, type: "text" },
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
