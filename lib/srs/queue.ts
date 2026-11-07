"use client";

import type { Grade as FsrsGrade } from "ts-fsrs";
import { db, getMeta, type Attempt } from "../db";
import { dayKey, uniqueTags } from "../logic/core";
import type { Grade } from "../schemas";
import { LEECH_LAPSES, rate } from "./scheduler";
import type { StudyCard } from "./types";

export const NEW_PER_DAY_DEFAULT = 15;
const LEARN_AHEAD_MS = 20 * 60 * 1000; // Anki's learn-ahead limit
const NEW_EVERY = 4; // show a new card after every 3 reviews, when both exist

export async function getNewPerDay() {
  return getMeta<number>("newPerDay", NEW_PER_DAY_DEFAULT);
}

export type QueueCounts = { due: number; learning: number; newLeft: number; nextAt: number | null };

export async function queueCounts(now = Date.now()): Promise<QueueCounts> {
  const today = dayKey(now);
  const [active, seenToday, newPerDay] = await Promise.all([
    db.cards.where("suspended").equals(0).toArray(),
    db.cards.where("firstSeen").equals(today).count(),
    getNewPerDay(),
  ]);
  let due = 0;
  let learning = 0;
  let newAvailable = 0;
  let nextAt: number | null = null;
  for (const c of active) {
    if (c.state === 0) {
      newAvailable++;
      continue;
    }
    if (c.due <= now) {
      if (c.state === 2) due++;
      else learning++;
    } else if (nextAt === null || c.due < nextAt) {
      nextAt = c.due;
    }
  }
  const newLeft = Math.max(0, Math.min(newPerDay - seenToday, newAvailable));
  return { due, learning, newLeft, nextAt };
}

export type NextPick = { card: StudyCard; kind: "review" | "learning" | "new" } | { card: null; nextAt: number | null };

/**
 * Anki order: learning cards that are due, then reviews mixed with new cards,
 * then learning cards up to 20 min ahead. `sinceNew` = reviews shown since the last new card.
 */
export async function pickNext(sinceNew: number, now = Date.now()): Promise<NextPick> {
  const counts = await queueCounts(now);
  const dueCards = await db.cards
    .where("due")
    .belowOrEqual(now)
    .filter((c) => c.suspended === 0 && c.state !== 0)
    .sortBy("due");
  const learningDue = dueCards.filter((c) => c.state !== 2);
  const reviewsDue = dueCards.filter((c) => c.state === 2);

  if (learningDue.length) return { card: learningDue[0], kind: "learning" };

  const nextNew =
    counts.newLeft > 0
      ? (await db.cards.where("state").equals(0).filter((c) => c.suspended === 0).sortBy("order"))[0]
      : undefined;

  if (reviewsDue.length && (!nextNew || sinceNew < NEW_EVERY - 1)) return { card: reviewsDue[0], kind: "review" };
  if (nextNew) return { card: nextNew, kind: "new" };
  if (reviewsDue.length) return { card: reviewsDue[0], kind: "review" };

  const ahead = await db.cards
    .where("due")
    .between(now, now + LEARN_AHEAD_MS, true, true)
    .filter((c) => c.suspended === 0 && (c.state === 1 || c.state === 3))
    .sortBy("due");
  if (ahead.length) return { card: ahead[0], kind: "learning" };

  return { card: null, nextAt: counts.nextAt };
}

/** Apply a rating, update the card, and log the answer (for leaks and stats). */
export async function answerCard(
  card: StudyCard,
  rating: FsrsGrade,
  log: { answer: string; grade: Grade | null; peeked: boolean; ms: number },
): Promise<StudyCard> {
  const now = new Date();
  const fsrs = rate(card.fsrs, rating, now);
  const updated: StudyCard = {
    ...card,
    fsrs,
    due: fsrs.due.getTime(),
    state: fsrs.state,
    firstSeen: card.firstSeen ?? dayKey(now),
    leech: fsrs.lapses >= LEECH_LAPSES ? 1 : card.leech,
  };
  const attempt: Attempt = {
    exerciseId: card.id,
    topicId: card.content.kind === "sentence" ? card.content.topicId : `deck:${card.deck}`,
    source: "srs",
    level: 0,
    answer: log.answer,
    grade: log.grade,
    verdict: log.peeked ? "peek" : (log.grade?.verdict ?? (rating === 1 ? "wrong" : "correct")),
    tags: log.grade ? uniqueTags(log.grade.fixes) : [],
    peeked: log.peeked,
    counted: !log.peeked && card.deck !== "rule", // self-rated rule cards never move the streak
    ms: log.ms,
    at: now.getTime(),
    day: dayKey(now),
  };
  await db.transaction("rw", db.cards, db.attempts, async () => {
    await db.cards.put(updated);
    await db.attempts.add(attempt);
  });
  return updated;
}
