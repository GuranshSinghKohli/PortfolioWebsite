import { Resend } from "resend";
import { z } from "zod";

import { clean } from "@/lib/ai/history";
import { contactRequest } from "@/lib/contact";
import { checkContact } from "@/lib/ratelimit";
import { clientIp, noStore, sameOrigin } from "@/lib/request";

/** Far more than a 2,000-character message and its fields need. */
const MAX_BODY_BYTES = 16_000;

/**
 * POST /api/contact (PRD §11, §12): validation, honeypot, 4/hour and 60/day
 * per IP, then Resend to CONTACT_TO_EMAIL with the visitor as reply-to. Any
 * failure is a status the sheet turns into the mailto fallback.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "origin" }, { status: 403, headers: noStore });

  const { RESEND_API_KEY: key, CONTACT_TO_EMAIL: to, CONTACT_FROM_EMAIL: from } = process.env;
  if (!key || !to || !from) return Response.json({ error: "unavailable" }, { status: 503, headers: noStore });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "too_long" }, { status: 413, headers: noStore });

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid" }, { status: 400, headers: noStore });
  }
  const parsed = contactRequest.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid", fields: z.flattenError(parsed.error).fieldErrors },
      { status: 400, headers: noStore },
    );
  }
  const { name, email, message, website } = parsed.data;

  // A bot filled the hidden field: report success and send nothing.
  if (website) return Response.json({ ok: true }, { headers: noStore });

  let limit;
  try {
    limit = await checkContact(clientIp(request));
  } catch {
    return Response.json({ error: "limiter" }, { status: 503, headers: noStore });
  }
  if (!limit.ok) {
    if (limit.reason === "unavailable") return Response.json({ error: "limiter" }, { status: 503, headers: noStore });
    return Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfter) } },
    );
  }

  const sender = clean(name, 100).replace(/\s+/g, " ");
  const { error } = await new Resend(key).emails.send({
    from: `Portfolio contact <${from}>`,
    to,
    replyTo: email,
    subject: `Portfolio message from ${sender}`,
    text: `${message}\n\n${sender} <${email}>\nSent from the portfolio contact form.`,
  });
  if (error) {
    console.error("contact send failed:", error.name);
    return Response.json({ error: "send" }, { status: 502, headers: noStore });
  }
  return Response.json({ ok: true }, { headers: noStore });
}
