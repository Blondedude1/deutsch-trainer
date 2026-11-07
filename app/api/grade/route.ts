import { NextResponse } from "next/server";
import { AiError, callJson } from "@/lib/anthropic";
import { GRADE_MODEL } from "@/lib/config";
import { verdictFromFixes } from "@/lib/logic/core";
import { GRADE_SYSTEM, gradeUserPrompt } from "@/lib/prompts/grade";
import { GradeOutputSchema, GradeRequestSchema, type Grade } from "@/lib/schemas";
import { TOPIC_BY_ID } from "@/lib/seed/topics";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const parsed = GradeRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request." }, { status: 400 });
  const r = parsed.data;

  try {
    const out = await callJson({
      schema: GradeOutputSchema,
      system: GRADE_SYSTEM,
      content: gradeUserPrompt(r, TOPIC_BY_ID[r.topicId] ?? null),
      effort: "medium",
      maxTokens: 4000,
      model: GRADE_MODEL,
      userKey: req.headers.get("x-anthropic-key"),
    });
    // Drop no-op "fixes" the model sometimes emits (wrong === right).
    const fixes = out.fixes.filter((f) => f.wrong.trim() !== f.right.trim());
    const grade: Grade = { ...out, fixes, verdict: verdictFromFixes(fixes), tokens: [] };
    return NextResponse.json({ grade });
  } catch (err) {
    const e = err instanceof AiError ? err : new AiError("Grading failed.");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
