/** Raw text imports, configured in next.config.ts (Turbopack) and native in Vitest. */
declare module "*.md?raw" {
  const text: string;
  export default text;
}
