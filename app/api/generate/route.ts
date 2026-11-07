import { NextResponse } from "next/server";
import { AiError, callJson } from "@/lib/anthropic";
import { GENERATE_SYSTEM, generateUserPrompt } from "@/lib/prompts/generate";
import { GenerateOutputSchema, GenerateRequestSchema } from "@/lib/schemas";
import { SEED_TOPICS, TOPIC_BY_ID } from "@/lib/seed/topics";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const parsed = GenerateRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request." }, { status: 400 });
  const r = parsed.data;

  const topic = r.topicId ? (TOPIC_BY_ID[r.topicId] ?? null) : null;
  if (r.mode === "topic" && !topic) return NextResponse.json({ error: "Unknown topic." }, { status: 400 });

  // Known grammar = unlocked topics, plus the target topic itself.
  const knownIds = new Set([...r.knownTopicIds, ...(topic ? [topic.id] : [])]);
  const known = SEED_TOPICS.filter((t) => knownIds.has(t.id));

  try {
    const out = await callJson({
      schema: GenerateOutputSchema,
      system: GENERATE_SYSTEM,
      content: generateUserPrompt({ mode: r.mode, topic, level: r.level, tags: r.tags, count: r.count, avoid: r.avoid, known }),
      effort: "medium",
      maxTokens: 32000,
      userKey: req.headers.get("x-anthropic-key"),
    });
    // Keep only items that point at a known topic and have a usable answer.
    const items = out.items
      .map((it) => ({ ...it, topicId: topic && r.mode === "topic" ? topic.id : it.topicId }))
      .filter((it) => knownIds.has(it.topicId) && it.answer.trim() && it.promptMn.trim())
      .filter((it) => it.type === "mn_to_de" || (it.promptDe ?? "").includes("___"));
    if (items.length === 0) throw new AiError("The model returned no usable items.");
    return NextResponse.json({ items });
  } catch (err) {
    const e = err instanceof AiError ? err : new AiError("Generation failed.");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
