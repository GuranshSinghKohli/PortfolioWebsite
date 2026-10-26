import { profile } from "@/content/profile";
import { InlineScript } from "@/components/InlineScript";
import { greetingScript, subLineScript } from "@/lib/prepaint";

const GREETING_ID = "home-greeting";
const SUBLINE_ID = "home-subline";

/**
 * Time-aware greeting. The server can't know the visitor's clock, so it
 * renders the afternoon line and an inline script swaps in the right one
 * before first paint.
 */
export function Greeting() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h1
        id={GREETING_ID}
        suppressHydrationWarning
        className="text-[clamp(2rem,5vw,3rem)] leading-[1.1] font-normal tracking-[-0.02em] text-balance text-text"
      >
        {profile.greetings.afternoon}
      </h1>
      <InlineScript html={greetingScript(GREETING_ID)} />
      <p
        id={SUBLINE_ID}
        suppressHydrationWarning
        className="max-w-[46ch] text-[15px] leading-[1.6] text-pretty text-muted-foreground"
      >
        {profile.subLines[0]}
      </p>
      <InlineScript html={subLineScript(SUBLINE_ID)} />
    </div>
  );
}
