import type { Fix, Verdict } from "../schemas";
import { MINOR_TAGS, type MistakeTag } from "../tags";

/** Local calendar day, YYYY-MM-DD. */
export function dayKey(d: Date | number = new Date()): string {
  const x = typeof d === "number" ? new Date(d) : d;
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${m}-${day}`;
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dayKey(d);
}

/**
 * Strict comparison for the local fast path: trim, collapse spaces, ignore a missing
 * final full stop. Case, umlauts and commas still matter.
 */
export function normalizeAnswer(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim()
    .replace(/[.]$/, "")
    .trim();
}

export function isExactMatch(user: string, answer: string, variants: string[]): boolean {
  if (!answer) return false; // items without a stored answer must go to the grader
  const u = normalizeAnswer(user);
  return [answer, ...variants].some((a) => a && normalizeAnswer(a) === u);
}

/** The verdict is derived from the fixes, never trusted from the model. */
export function verdictFromFixes(fixes: Fix[]): Verdict {
  if (fixes.length === 0) return "correct";
  return fixes.every((f) => MINOR_TAGS.includes(f.tag)) ? "minor" : "wrong";
}

export function isPass(v: Verdict | "peek"): boolean {
  return v === "correct" || v === "minor";
}

export function uniqueTags(fixes: Fix[]): MistakeTag[] {
  return [...new Set(fixes.map((f) => f.tag))];
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
