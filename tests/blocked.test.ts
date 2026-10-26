import { APICallError } from "ai";
import { describe, expect, it } from "vitest";

import { blockedReply } from "@/content/answers";
import { isBlockedPrompt } from "@/lib/ai/blocked";

const apiError = (statusCode: number, responseBody: string) =>
  new APICallError({ message: "x", url: "https://api.openai.com/v1/responses", requestBodyValues: {}, statusCode, responseBody });

describe("blocked questions", () => {
  it("treats OpenAI's flagged-prompt 400 as blocked", () => {
    expect(isBlockedPrompt(apiError(400, '{"error":{"code":"invalid_prompt","message":"Invalid prompt: flagged"}}'))).toBe(true);
  });

  it("treats other failures as errors, not blocks", () => {
    expect(isBlockedPrompt(apiError(400, '{"error":{"code":"model_not_found"}}'))).toBe(false);
    expect(isBlockedPrompt(apiError(429, '{"error":{"code":"rate_limit_exceeded"}}'))).toBe(false);
    expect(isBlockedPrompt(new Error("network"))).toBe(false);
  });

  it("deflects briefly and politely, back toward work", () => {
    expect(blockedReply.length).toBeLessThan(120);
    expect(blockedReply).toMatch(/built/);
    expect(blockedReply).not.toMatch(/sorry|unable|as an ai|I can't help/i);
  });
});
