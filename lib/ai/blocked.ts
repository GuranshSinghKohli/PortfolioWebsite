import { APICallError } from "ai";

/**
 * OpenAI rejects a flagged prompt with a 400 whose error code is
 * `invalid_prompt`. That is a blocked question, not an outage, so the visitor
 * gets the polite deflection rather than an error.
 */
export function isBlockedPrompt(error: unknown) {
  if (!APICallError.isInstance(error) || error.statusCode !== 400) return false;
  const body = error.responseBody ?? "";
  return /"code"\s*:\s*"invalid_prompt"|content[_ ]policy|flagged/i.test(body);
}
