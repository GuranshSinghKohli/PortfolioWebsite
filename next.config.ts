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
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
