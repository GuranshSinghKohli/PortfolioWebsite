import { profile } from "@/content/profile";

/*
 * Scripts that run while the HTML is parsed, before first paint. They correct
 * what the server can't know: saved theme, rail state and the visitor's clock.
 * Plain strings, so server components can inline them.
 */

export const THEME_STORAGE_KEY = "theme";
export const RAIL_STORAGE_KEY = "rail";
export const BOOT_STORAGE_KEY = "booted";

/**
 * Root layout <head>: saved theme and rail state on <html>, plus data-intro:
 * "boot" on a first visit, "reveal" after that, and absent with reduced
 * motion. CSS hides the animated pieces while data-intro is set.
 */
export const shellScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")d.dataset.theme=t;if(localStorage.getItem("${RAIL_STORAGE_KEY}")==="collapsed")d.dataset.rail="collapsed";if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.intro=localStorage.getItem("${BOOT_STORAGE_KEY}")?"reveal":"boot"}catch(e){}})()`;

export type DayPart = keyof typeof profile.greetings;

/** Morning 5–11, afternoon 12–16, evening 17–21, late night 22–4. */
export function dayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "lateNight";
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The greeting as word spans for the CSS reveal (globals.css, .greeting-word):
 * each word carries its index in --i, which staggers its animation-delay.
 */
export function greetingHtml(text: string) {
  return text
    .split(" ")
    .map((word, i) => `<span class="greeting-word" style="--i:${i}">${escapeHtml(word)}</span>`)
    .join(" ");
}

/** Swaps the server's default greeting for the one matching the visitor's clock. */
export function greetingScript(id: string) {
  const html = JSON.stringify(
    Object.fromEntries(Object.entries(profile.greetings).map(([part, text]) => [part, greetingHtml(text)])),
  );
  return `(function(){var n=document.getElementById(${JSON.stringify(id)});if(!n)return;var h=new Date().getHours(),g=${html};n.innerHTML=h>=5&&h<12?g.morning:h<17&&h>=12?g.afternoon:h>=17&&h<22?g.evening:g.lateNight})()`;
}

/** Picks one sub-line per visit. */
export function subLineScript(id: string) {
  const lines = JSON.stringify(profile.subLines);
  return `(function(){var n=document.getElementById(${JSON.stringify(id)});if(!n)return;var l=${lines};n.textContent=l[Math.floor(Math.random()*l.length)]})()`;
}
