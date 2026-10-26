import { describe, expect, it } from "vitest";

import { issueTicket, TICKET_TTL_MS, verifyTicket } from "@/lib/ticket";

const SECRET = "test-secret-not-a-real-one-0123456789";
const NOW = 1_800_000_000_000;

describe("session tickets", () => {
  it("verifies a fresh ticket from the same IP", async () => {
    const { ticket, expires } = await issueTicket("203.0.113.7", SECRET, NOW);
    expect(expires).toBe(NOW + TICKET_TTL_MS);
    expect(await verifyTicket(ticket, "203.0.113.7", SECRET, NOW + 1000)).toBe("ok");
  });

  it("rejects it from another IP, with another secret, or after expiry", async () => {
    const { ticket } = await issueTicket("203.0.113.7", SECRET, NOW);
    expect(await verifyTicket(ticket, "198.51.100.2", SECRET, NOW)).toBe("invalid");
    expect(await verifyTicket(ticket, "203.0.113.7", `${SECRET}x`, NOW)).toBe("invalid");
    expect(await verifyTicket(ticket, "203.0.113.7", SECRET, NOW + TICKET_TTL_MS)).toBe("expired");
  });

  it("rejects a forged expiry, a tampered signature and junk", async () => {
    const { ticket } = await issueTicket("203.0.113.7", SECRET, NOW);
    const [, signature] = ticket.split(".");
    expect(await verifyTicket(`${NOW + 60_000}.${signature}`, "203.0.113.7", SECRET, NOW)).toBe("invalid");
    expect(await verifyTicket(`${NOW + TICKET_TTL_MS * 10}.${signature}`, "203.0.113.7", SECRET, NOW)).toBe("expired");
    const flipped = ticket.slice(0, -1) + (ticket.endsWith("A") ? "B" : "A");
    expect(await verifyTicket(flipped, "203.0.113.7", SECRET, NOW)).toBe("invalid");
    expect(await verifyTicket(null, "203.0.113.7", SECRET, NOW)).toBe("missing");
    expect(await verifyTicket("hello", "203.0.113.7", SECRET, NOW)).toBe("malformed");
  });

  it("never contains the IP", async () => {
    const { ticket } = await issueTicket("203.0.113.7", SECRET, NOW);
    expect(ticket).not.toContain("203.0.113.7");
  });
});
