import "server-only";

/**
 * Request checks shared by the /api routes. Both can be faked by a script
 * (PRD §11 "Honesty"); they stop browsers on other sites and casual reuse,
 * and the ticket and rate limits do the rest.
 */

/** The visitor's IP. Vercel sets x-real-ip and overwrites x-forwarded-for. */
export function clientIp(request: Request) {
  return (
    request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

/** Same-origin requests only: a matching Origin, or a browser's same-origin fetch marker. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

export const noStore = { "Cache-Control": "no-store" };
