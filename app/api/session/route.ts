import { clientIp, noStore, sameOrigin } from "@/lib/request";
import { issueTicket } from "@/lib/ticket";

/** GET /api/session: a short-lived ticket for POST /api/ask, bound to the caller's IP (PRD §11). */
export async function GET(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "origin" }, { status: 403, headers: noStore });

  const secret = process.env.ASK_SIGNING_SECRET;
  if (!secret) {
    console.error("session unavailable: missing env ASK_SIGNING_SECRET");
    return Response.json({ error: "unavailable" }, { status: 503, headers: noStore });
  }

  const { ticket, expires } = await issueTicket(clientIp(request), secret);
  return Response.json({ ticket, expires }, { headers: noStore });
}
