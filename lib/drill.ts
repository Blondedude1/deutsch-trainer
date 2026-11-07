"use client";

import { BATCH_SIZE, QA_SIZE } from "./config";
import { db, getMeta, setMeta, type Exercise, type Source } from "./db";
import type { GeneratedItem, Grade, GradeRequest } from "./schemas";
import type { MistakeTag } from "./tags";
import { dayKey, isExactMatch } from "./logic/core";

export type DrillSpec =
  | { source: "topic"; topicId: string; level: number }
  | { source: "leak"; tag: MistakeTag }
  | { source: "qa"; tags: MistakeTag[] };

export type Session = {
  pool: string;
  source: Source;
  level: number;
  ids: string[];
  index: number;
  /** One entry per finished item. */
  results: ("pass" | "fail" | "peek")[];
};

export function poolOf(spec: DrillSpec): string {
  if (spec.source === "topic") return spec.topicId;
  if (spec.source === "leak") return `leak:${spec.tag}`;
  return `qa:${dayKey()}`;
}

function levelOf(spec: DrillSpec) {
  return spec.source === "topic" ? spec.level : 3;
}

function sizeOf(spec: DrillSpec) {
  return spec.source === "topic" ? BATCH_SIZE : QA_SIZE;
}

const sessionKey = (pool: string) => `session:${pool}`;

export async function loadSession(pool: string): Promise<Session | null> {
  return getMeta<Session | null>(sessionKey(pool), null);
}

export async function saveSession(s: Session) {
  await setMeta(sessionKey(s.pool), s);
}

export async function clearSession(pool: string) {
  await db.meta.delete(sessionKey(pool));
}

/** Thrown when no API key is available; the UI shows the key box. */
export class NoKeyError extends Error {
  constructor() {
    super("Add your Anthropic API key to start.");
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  if (typeof navigator !== "undefined" && !navigator.onLine) throw new Error("You are offline. This step needs the internet.");
  const key = await getMeta<string>("apiKey", "");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (key) headers["x-anthropic-key"] = key;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (data.error === "NO_KEY") throw new NoKeyError();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status}).`);
  return data as T;
}

function toExercise(it: GeneratedItem, pool: string, source: Source, level: number): Exercise {
  return {
    id: crypto.randomUUID(),
    topicId: it.topicId,
    pool,
    source,
    level,
    type: it.type,
    promptMn: it.promptMn,
    promptDe: it.promptDe,
    keyWords: it.keyWords,
    answer: it.answer.trim(),
    acceptedVariants: it.acceptedVariants,
    solution: it.solution,
    solutionTokens: it.solutionTokens,
    tags: it.tags,
    used: 0,
    flagged: 0,
    createdAt: Date.now(),
  };
}

/** Start or resume a session: cached unused items first, generate only what's missing. */
export async function startSession(spec: DrillSpec, opts: { fresh?: boolean } = {}): Promise<Session> {
  const pool = poolOf(spec);
  const level = levelOf(spec);
  const size = sizeOf(spec);

  if (!opts.fresh) {
    const existing = await loadSession(pool);
    if (existing && existing.level === level && existing.index < existing.ids.length) return existing;
  }

  let items = await db.exercises
    .where("[pool+level+used]")
    .equals([pool, level, 0])
    .filter((e) => e.flagged === 0)
    .sortBy("createdAt");

  if (items.length < size) {
    const known = await db.topics.where("status").equals("active").primaryKeys();
    const recent = await db.exercises.where("pool").equals(pool).reverse().sortBy("createdAt");
    const avoid = recent.slice(0, 60).map((e) => e.solution);
    const tags = spec.source === "leak" ? [spec.tag] : spec.source === "qa" ? spec.tags : [];
    const { items: generated } = await postJson<{ items: GeneratedItem[] }>("/api/generate", {
      mode: spec.source,
      topicId: spec.source === "topic" ? spec.topicId : null,
      level,
      tags,
      count: size,
      avoid,
      knownTopicIds: known,
    });
    const fresh = generated.map((g) => toExercise(g, pool, spec.source, level));
    await db.exercises.bulkAdd(fresh);
    items = [...items, ...fresh];
  }

  const session: Session = { pool, source: spec.source, level, ids: items.slice(0, size).map((e) => e.id), index: 0, results: [] };
  await saveSession(session);
  return session;
}

/** Local fast path first; the model only when the answer isn't an exact known answer. */
export async function gradeAnswer(ex: Exercise, userAnswer: string): Promise<Grade> {
  if (isExactMatch(userAnswer, ex.answer, ex.acceptedVariants)) {
    const exactTarget = isExactMatch(userAnswer, ex.answer, []);
    return {
      verdict: "correct",
      corrected: ex.type === "fill_gap" || exactTarget ? ex.solution : userAnswer.trim(),
      fixes: [],
      tokens: ex.type === "fill_gap" || exactTarget ? ex.solutionTokens : [],
    };
  }
  const body: GradeRequest = {
    topicId: ex.topicId,
    level: ex.level,
    type: ex.type,
    promptMn: ex.promptMn,
    promptDe: ex.promptDe,
    answer: ex.answer,
    acceptedVariants: ex.acceptedVariants,
    solution: ex.solution,
    userAnswer: userAnswer.trim(),
  };
  const { grade } = await postJson<{ grade: Grade }>("/api/grade", body);
  return grade;
}
