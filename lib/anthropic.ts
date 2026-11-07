import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { GENERATE_MODEL, GRADE_MODEL } from "./config";

export const NO_KEY = "NO_KEY";

/**
 * Key source: the server env var if set, otherwise the key the learner saved in the app
 * (sent per request in the x-anthropic-key header, never stored on the server).
 */
function getClient(userKey: string | null) {
  const apiKey = process.env.ANTHROPIC_API_KEY || userKey?.trim();
  if (!apiKey) throw new AiError(NO_KEY, 401);
  return new Anthropic({ apiKey });
}

export class AiError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

type Effort = "low" | "medium" | "high";

/**
 * One structured-output call. The response is validated against the zod schema;
 * on a failed parse it retries once, then throws (never returns a fake result).
 */
export async function callJson<S extends z.ZodType>(opts: {
  schema: S;
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[] | string;
  effort: Effort;
  maxTokens: number;
  userKey: string | null;
  model: typeof GRADE_MODEL | typeof GENERATE_MODEL;
}): Promise<z.infer<S>> {
  const anthropic = getClient(opts.userKey);
  let lastError = "unknown error";

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // Streamed: large max_tokens values are refused for non-streaming requests.
      // Server-side refusal fallback exists for Sonnet, not for Haiku.
      const fallback = opts.model === GENERATE_MODEL ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {};
      const stream = anthropic.beta.messages.stream({
        model: opts.model,
        max_tokens: opts.maxTokens,
        ...fallback,
        // The system prompt is long and identical across calls: cache it.
        system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
        output_config: { effort: opts.effort, format: betaZodOutputFormat(opts.schema) },
        messages: [{ role: "user", content: opts.content }],
      });
      const res = await stream.finalMessage();

      if (res.stop_reason === "refusal") throw new AiError("The model declined this request.", 422);
      if (res.stop_reason === "max_tokens") {
        lastError = "response was cut off (max_tokens)";
        continue;
      }
      if (res.parsed_output != null) return res.parsed_output as z.infer<S>;
      lastError = "response did not match the schema";
    } catch (err) {
      if (err instanceof AiError) throw err;
      if (err instanceof Anthropic.AuthenticationError) throw new AiError("That API key was rejected. Check it in Stats → API key.", 401);
      if (err instanceof Anthropic.RateLimitError) throw new AiError("Rate limited. Wait a minute and try again.", 429);
      if (err instanceof Anthropic.BadRequestError) throw new AiError(`Bad request: ${err.message}`, 500);
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new AiError(`Could not get a valid answer from the model (${lastError}).`);
}
