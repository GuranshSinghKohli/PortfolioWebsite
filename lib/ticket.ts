/**
 * Session tickets (PRD §11): stateless HMAC-SHA256, so they survive cold
 * starts. A ticket is "<expiry ms>.<signature>", signed over the expiry and
 * the visitor's IP, so it only works from the IP it was issued to. The IP is
 * never in the ticket itself.
 */
export const TICKET_TTL_MS = 10 * 60 * 1000;

const encoder = new TextEncoder();

async function key(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

function fromBase64Url(text: string) {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function issueTicket(ip: string, secret: string, now = Date.now()) {
  const expires = now + TICKET_TTL_MS;
  const signature = await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(`${expires}.${ip}`));
  return { ticket: `${expires}.${toBase64Url(signature)}`, expires };
}

export type TicketCheck = "ok" | "missing" | "malformed" | "expired" | "invalid";

/** Constant-time check through `crypto.subtle.verify`. */
export async function verifyTicket(ticket: string | null, ip: string, secret: string, now = Date.now()): Promise<TicketCheck> {
  if (!ticket) return "missing";
  const match = /^(\d{13})\.([A-Za-z0-9_-]{43})$/.exec(ticket);
  if (!match) return "malformed";
  const expires = Number(match[1]);
  if (expires <= now || expires > now + TICKET_TTL_MS) return "expired";
  let signature: Uint8Array<ArrayBuffer>;
  try {
    signature = fromBase64Url(match[2]);
  } catch {
    return "malformed";
  }
  const valid = await crypto.subtle.verify("HMAC", await key(secret), signature, encoder.encode(`${expires}.${ip}`));
  return valid ? "ok" : "invalid";
}
