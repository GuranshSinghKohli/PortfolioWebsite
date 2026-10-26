// Fails the build if anything secret reached the browser bundle (PRD §11).
// Checks for OpenAI, Anthropic and Resend key shapes, and for the exact
// values of server-only variables when they are set (Vercel builds, .env.local).
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

// Local builds: read .env.local too (never overrides variables already set, as on Vercel).
try {
  process.loadEnvFile(".env.local");
} catch {}

const root = path.join(process.cwd(), "dist", "static");
const patterns = [
  { name: "OpenAI key", re: /sk-(proj-|svcacct-|admin-)?[A-Za-z0-9_-]{32,}/ },
  { name: "Anthropic key", re: /sk-ant-[A-Za-z0-9_-]{10,}/ },
  { name: "Resend key", re: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/ },
];
const secrets = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "ASK_SIGNING_SECRET", "UPSTASH_REDIS_REST_TOKEN", "RESEND_API_KEY"]
  .map((name) => ({ name, value: process.env[name] }))
  .filter((entry) => entry.value && entry.value.length >= 12);

function* files(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (/\.(js|css|html|json|txt|map)$/.test(entry)) yield full;
  }
}

const leaks = [];
let count = 0;
for (const file of files(root)) {
  count++;
  const text = readFileSync(file, "utf8");
  for (const { name, re } of patterns) if (re.test(text)) leaks.push(`${name} pattern in ${path.relative(process.cwd(), file)}`);
  for (const { name, value } of secrets) if (text.includes(value)) leaks.push(`${name} value in ${path.relative(process.cwd(), file)}`);
}

if (leaks.length) {
  console.error(`Secret check failed:\n${leaks.map((leak) => `  - ${leak}`).join("\n")}`);
  process.exit(1);
}
console.log(`Secret check passed: ${count} client files, ${patterns.length} key patterns, ${secrets.length} server values.`);
