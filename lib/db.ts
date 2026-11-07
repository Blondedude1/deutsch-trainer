"use client";

import Dexie, { type Table } from "dexie";
import type { Grade, KeyWord, Token } from "./schemas";
import type { MistakeTag } from "./tags";
import type { TopicCard } from "./seed/topics";
import { SEED_TOPICS } from "./seed/topics";

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

export type Source = "topic" | "leak" | "qa";

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

  constructor() {
    super("deutsch-trainer");
    this.version(1).stores({
      topics: "id, order, status",
      exercises: "id, pool, [pool+level+used], topicId, used, flagged",
      attempts: "++id, exerciseId, topicId, day, at, source",
      activeTime: "day",
      meta: "key",
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
