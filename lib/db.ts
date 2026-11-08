"use client";

import Dexie, { type Table } from "dexie";
import type { Grade, KeyWord, Token } from "./schemas";
import type { MistakeTag } from "./tags";
import type { TopicCard } from "./seed/topics";
import { SEED_TOPICS } from "./seed/topics";
import { PAIRS, RULES, VERBS } from "./seed/decks";
import type { StudyCard } from "./srs/types";
import { newFsrsCard } from "./srs/scheduler";

export type TopicStatus = "locked" | "active";

export type Topic = {
  id: string;
  order: number;
  title: string;
  mongolianTitle: string;
  level: 1 | 2;
  card: TopicCard;
  /** locked = not covered in class yet. Sealed is derived from attempts. */
  status: TopicStatus;
  /** Drill level the learner is on for this topic (1–5). */
  drillLevel: number;
  /** Has the topic card been shown before the first drill? */
  cardSeen: boolean;
};

export type Source = "topic" | "leak" | "qa" | "srs";

export type Exercise = {
  id: string;
  topicId: string;
  /** Where this item was generated for: a topic id, "leak:<tag>" or "qa:<day>". */
  pool: string;
  source: Source;
  level: number;
  type: "mn_to_de" | "fill_gap";
  promptMn: string;
  promptDe: string | null;
  keyWords: KeyWord[];
  answer: string;
  acceptedVariants: string[];
  solution: string;
  solutionTokens: Token[];
  tags: MistakeTag[];
  used: 0 | 1;
  flagged: 0 | 1;
  createdAt: number;
};

export type Attempt = {
  id?: number;
  exerciseId: string;
  topicId: string;
  source: Source;
  level: number;
  answer: string;
  grade: Grade | null; // null when peeked without answering
  verdict: Grade["verdict"] | "peek";
  tags: MistakeTag[];
  peeked: boolean;
  /** First, unpeeked try on this item. Only these count for streak and sealing. */
  counted: boolean;
  ms: number;
  at: number;
  day: string; // local YYYY-MM-DD
};

export type ActiveDay = { day: string; seconds: number };
export type Meta = { key: string; value: unknown };

class TrainerDB extends Dexie {
  topics!: Table<Topic, string>;
  exercises!: Table<Exercise, string>;
  attempts!: Table<Attempt, number>;
  activeTime!: Table<ActiveDay, string>;
  meta!: Table<Meta, string>;
  cards!: Table<StudyCard, string>;

  constructor() {
    super("deutsch-trainer");
    this.version(1).stores({
      topics: "id, order, status",
      exercises: "id, pool, [pool+level+used], topicId, used, flagged",
      attempts: "++id, exerciseId, topicId, day, at, source",
      activeTime: "day",
      meta: "key",
    });
    // v2: Anki-style cards
    this.version(2).stores({
      cards: "id, deck, due, state, order, firstSeen, suspended, leech",
    });
    this.on("populate", (tx) => {
      tx.table("topics").bulkAdd(
        SEED_TOPICS.map<Topic>((t) => ({
          ...t,
          status: t.level === 1 ? "active" : "locked",
          drillLevel: 1,
          cardSeen: false,
        })),
      );
    });
  }
}

export const db = new TrainerDB();

/** Add seed topics that were added to the code after the DB was created. */
export async function syncSeedTopics() {
  const existing = new Set(await db.topics.toCollection().primaryKeys());
  const missing = SEED_TOPICS.filter((t) => !existing.has(t.id));
  if (missing.length) {
    await db.topics.bulkAdd(
      missing.map<Topic>((t) => ({ ...t, status: "locked", drillLevel: 1, cardSeen: false })),
    );
  }
}

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const row = await db.meta.get(key);
  return row ? (row.value as T) : fallback;
}

export async function setMeta(key: string, value: unknown) {
  await db.meta.put({ key, value });
}

/** Built-in cards in the order new ones are introduced: rule, verb, pair, rule, verb, pair… */
function seedCards(): Omit<StudyCard, "fsrs" | "due" | "state" | "createdAt">[] {
  const lists = [
    RULES.map((r) => ({ id: `rule:${r.id}`, deck: "rule" as const, content: { kind: "rule" as const, tree: r.tree, front: r.front, back: r.back, example: r.example, gloss: r.gloss } })),
    VERBS.map((v) => ({ id: `verb:${v.inf}`, deck: "verb" as const, content: { kind: "verb" as const, ...v } })),
    PAIRS.map((p) => ({ id: `pair:${p.id}`, deck: "pair" as const, content: { kind: "pair" as const, mn: p.mn, de: p.de, hint: p.hint, accept: p.accept } })),
  ];
  const out: Omit<StudyCard, "fsrs" | "due" | "state" | "createdAt">[] = [];
  const longest = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const l of lists) {
      const c = l[i];
      if (c) out.push({ ...c, hook: "", order: out.length, firstSeen: null, suspended: 0, leech: 0 });
    }
  }
  return out;
}

/**
 * Add built-in cards that aren't in the learner's DB yet, and refresh the text of existing
 * ones (content fixes). Scheduling, hooks and history are never touched.
 */
export async function syncSeedCards() {
  const seeds = seedCards();
  const existing = new Map((await db.cards.toArray()).map((c) => [c.id, c]));
  const now = new Date();
  const fsrs = newFsrsCard(now);
  const missing = seeds.filter((c) => !existing.has(c.id));
  const changed = seeds.filter((c) => {
    const old = existing.get(c.id);
    return old && JSON.stringify(old.content) !== JSON.stringify(c.content);
  });
  await db.transaction("rw", db.cards, async () => {
    if (missing.length) await db.cards.bulkAdd(missing.map((c) => ({ ...c, fsrs, due: fsrs.due.getTime(), state: fsrs.state, createdAt: now.getTime() })));
    for (const c of changed) await db.cards.update(c.id, { content: c.content });
  });
}
