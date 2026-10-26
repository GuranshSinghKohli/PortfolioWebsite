import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Live tests call the real model and spend real money, so they never run in
 * `npm test`. Run them with `npm run test:live` (reads .env.local).
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/live/**/*.live.ts"],
    testTimeout: 60_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "node_modules/next/dist/compiled/server-only/empty.js"),
    },
  },
});
