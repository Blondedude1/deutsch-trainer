import { createEmptyCard, fsrs, generatorParameters, Rating, type Card as FsrsCard, type Grade as FsrsGrade } from "ts-fsrs";
import type { Verdict } from "../schemas";

export { Rating };

// Anki's defaults: learning steps 1 min / 10 min, 90 % target recall.
const scheduler = fsrs(generatorParameters({ enable_fuzz: true, request_retention: 0.9 }));

export const LEECH_LAPSES = 8;

export function newFsrsCard(now = new Date()): FsrsCard {
  return createEmptyCard(now);
}

export function rate(card: FsrsCard, rating: FsrsGrade, now = new Date()): FsrsCard {
  return scheduler.next(card, now, rating).card;
}

/** Interval preview for the rating buttons, e.g. "10m", "3d". */
export function previewIntervals(card: FsrsCard, now = new Date()): Record<number, string> {
  const p = scheduler.repeat(card, now);
  const out: Record<number, string> = {};
  for (const r of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as const) {
    out[r] = formatInterval(p[r].card.due.getTime() - now.getTime());
  }
  return out;
}

export function formatInterval(ms: number): string {
  const m = Math.max(1, Math.round(ms / 60000));
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 31) return `${d}d`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${(d / 365).toFixed(1)}y`;
}

/** The grader decides the low ratings; only a clean answer lets you choose Good or Easy. */
export function ratingFromVerdict(v: Verdict | "peek"): FsrsGrade | null {
  if (v === "peek" || v === "wrong") return Rating.Again;
  if (v === "minor") return Rating.Hard;
  return null; // correct: learner picks Good / Easy
}
