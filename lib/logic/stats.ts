import { SEAL } from "../config";
import type { Attempt } from "../db";
import type { MistakeTag } from "../tags";
import { daysAgo, isPass } from "./core";

/** Clean streak: consecutive counted passes. A wrong answer or a peek resets it. */
export function streaks(attempts: Attempt[]): { current: number; best: number } {
  const sorted = [...attempts].sort((a, b) => a.at - b.at);
  let current = 0;
  let best = 0;
  for (const a of sorted) {
    if (a.peeked) {
      current = 0;
      continue;
    }
    if (!a.counted) continue; // retries neither extend nor break the streak
    if (isPass(a.verdict)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return { current, best };
}

export type SealInfo = { days: number; sealed: boolean; todayN: number; todayPass: number };

/** A day counts when it has >= minItems counted level>=3 topic items at >= passRate. */
export function sealInfo(topicAttempts: Attempt[], today: string): SealInfo {
  const byDay = new Map<string, { n: number; pass: number }>();
  for (const a of topicAttempts) {
    if (a.source !== "topic" || !a.counted || a.level < SEAL.minLevel) continue;
    const d = byDay.get(a.day) ?? { n: 0, pass: 0 };
    d.n += 1;
    if (isPass(a.verdict)) d.pass += 1;
    byDay.set(a.day, d);
  }
  let days = 0;
  for (const d of byDay.values()) {
    if (d.n >= SEAL.minItemsPerDay && d.pass / d.n >= SEAL.passRate) days += 1;
  }
  const t = byDay.get(today) ?? { n: 0, pass: 0 };
  return { days, sealed: days >= SEAL.daysNeeded, todayN: t.n, todayPass: t.pass };
}

export type LeakRow = { tag: MistakeTag; count: number; prev: number };

/** Tag counts in the last 7 days vs the 7 before. Peeks carry no tags. */
export function leakRanking(attempts: Attempt[]): LeakRow[] {
  const start = daysAgo(6);
  const prevStart = daysAgo(13);
  const cur = new Map<MistakeTag, number>();
  const prev = new Map<MistakeTag, number>();
  for (const a of attempts) {
    if (a.peeked || !a.grade) continue;
    const bucket = a.day >= start ? cur : a.day >= prevStart ? prev : null;
    if (!bucket) continue;
    for (const f of a.grade.fixes) bucket.set(f.tag, (bucket.get(f.tag) ?? 0) + 1);
  }
  const tags = new Set([...cur.keys(), ...prev.keys()]);
  return [...tags]
    .map((tag) => ({ tag, count: cur.get(tag) ?? 0, prev: prev.get(tag) ?? 0 }))
    .filter((r) => r.count > 0 || r.prev > 0)
    .sort((a, b) => b.count - a.count || b.prev - a.prev);
}

export function peeksSince(attempts: Attempt[], day: string): number {
  return attempts.filter((a) => a.verdict === "peek" && a.day >= day).length;
}
