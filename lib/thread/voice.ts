import voice from "@/content/voice.md?raw";

/**
 * Loading verbs from the "## Loading verbs" list in content/voice.md, shown
 * while an AI answer is on its way. Thread chunk only.
 */
function section(markdown: string, heading: string) {
  const start = markdown.indexOf(`## ${heading}`);
  if (start < 0) return [];
  const rest = markdown.slice(start + heading.length + 3);
  const end = rest.search(/\n## /);
  return (end < 0 ? rest : rest.slice(0, end))
    .split("\n")
    .map((line) => /^\s*[-*]\s+(.+?)\s*$/.exec(line)?.[1])
    .filter((item): item is string => Boolean(item) && !item!.startsWith("[fill in"));
}

const verbs = section(voice, "Loading verbs");
export const loadingVerbs = verbs.length ? verbs : ["Thinking"];
