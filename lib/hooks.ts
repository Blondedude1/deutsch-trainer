"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type Attempt, type Topic } from "./db";
import { dayKey } from "./logic/core";
import { sealInfo, type SealInfo } from "./logic/stats";
import { SEAL } from "./config";

export function useTopics(): Topic[] | undefined {
  return useLiveQuery(() => db.topics.orderBy("order").toArray(), []);
}

export function useTopic(id: string): Topic | null | undefined {
  return useLiveQuery(async () => (await db.topics.get(id)) ?? null, [id]);
}

export function useAttempts(): Attempt[] | undefined {
  return useLiveQuery(() => db.attempts.toArray(), []);
}

export function useActiveSeconds(day = dayKey()): number {
  return useLiveQuery(async () => (await db.activeTime.get(day))?.seconds ?? 0, [day]) ?? 0;
}

export function useAllActive() {
  return useLiveQuery(() => db.activeTime.toArray(), []);
}

export function useMeta<T>(key: string, fallback: T): T {
  return useLiveQuery(async () => ((await db.meta.get(key))?.value as T) ?? fallback, [key]) ?? fallback;
}

export type TopicChip = { text: string; tone: "success" | "accent" | "muted" };

export function topicChip(topic: Topic, seal: SealInfo): TopicChip {
  if (seal.sealed) return { text: "SEALED", tone: "success" };
  if (topic.status === "locked") return { text: "LOCKED", tone: "muted" };
  if (seal.days > 0) return { text: `DAY ${seal.days}/${SEAL.daysNeeded}`, tone: "accent" };
  return { text: "ACTIVE", tone: "accent" };
}

export function sealByTopic(attempts: Attempt[]): Map<string, SealInfo> {
  const today = dayKey();
  const by = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const arr = by.get(a.topicId) ?? [];
    arr.push(a);
    by.set(a.topicId, arr);
  }
  const out = new Map<string, SealInfo>();
  for (const [id, list] of by) out.set(id, sealInfo(list, today));
  return out;
}

export const EMPTY_SEAL: SealInfo = { days: 0, sealed: false, todayN: 0, todayPass: 0 };
