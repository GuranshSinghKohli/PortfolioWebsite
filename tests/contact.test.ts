import { describe, expect, it } from "vitest";

import { contactErrors, contactRequest, mailtoDraft } from "@/lib/contact";
import { profile } from "@/content/profile";

const good = { name: "Ada", email: "ada@example.com", message: "Hello there, I'd like to chat." };

describe("contact form", () => {
  it("accepts a good draft, trimmed", () => {
    expect(contactErrors(good)).toEqual({});
    expect(contactRequest.parse({ ...good, email: "  ada@example.com " }).email).toBe("ada@example.com");
  });

  it("explains each problem inline", () => {
    expect(contactErrors({ name: " ", email: "nope", message: "hi" })).toEqual({
      name: "Add your name.",
      email: "That email doesn't look right.",
      message: "Say a little more: at least 10 characters.",
    });
    expect(contactErrors({ ...good, email: "" }).email).toBe("Add your email, so I can reply.");
    expect(contactErrors({ ...good, message: "x".repeat(2001) }).message).toMatch(/under 2,000/);
  });

  it("carries the honeypot to the server", () => {
    expect(contactRequest.parse({ ...good, website: "spam.example" }).website).toBe("spam.example");
  });

  it("hands the draft to the mail app", () => {
    const href = mailtoDraft(good);
    expect(href.startsWith(`mailto:${profile.socials.email}?`)).toBe(true);
    const params = new URLSearchParams(href.split("?")[1]);
    expect(params.get("subject")).toBe("Hello from Ada");
    expect(params.get("body")).toBe("Hello there, I'd like to chat.\n\nAda (ada@example.com)");
  });
});
