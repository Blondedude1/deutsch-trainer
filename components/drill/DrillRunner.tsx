"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LEVEL_UP_RATE } from "@/lib/config";
import { db, setMeta, type Exercise, type Topic } from "@/lib/db";
import { clearSession, gradeAnswer, NoKeyError, saveSession, startSession, type DrillSpec, type Session } from "@/lib/drill";
import { ApiKeyBox } from "../ApiKeyBox";
import { dayKey, isPass, uniqueTags } from "@/lib/logic/core";
import { markActivity } from "@/lib/logic/activeTime";
import type { Grade } from "@/lib/schemas";
import { TAG_INFO, type MistakeTag } from "@/lib/tags";
import { LegendToggle } from "../sentence/Legend";
import { SentenceView } from "../sentence/SentenceView";
import { BackLink, Button, Card, Loading } from "../ui/primitives";
import { FeedbackCard } from "./FeedbackCard";
import { KeyWords } from "./KeyWords";
import { UmlautRow } from "./UmlautRow";

export type DrillTarget = { kind: "topic"; topicId: string } | { kind: "leak"; tag: MistakeTag } | { kind: "qa"; tags: MistakeTag[] };

type Phase = "loading" | "error" | "item" | "done";

export function DrillRunner({ target }: { target: DrillTarget }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState("");
  const [noKey, setNoKey] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [ex, setEx] = useState<Exercise | null>(null);

  const [input, setInput] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [lastAnswer, setLastAnswer] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [peeked, setPeeked] = useState(false);
  const [peekArmed, setPeekArmed] = useState(false);
  const [tries, setTries] = useState(0);
  const [firstResult, setFirstResult] = useState<"pass" | "fail" | "peek" | null>(null);
  const shownAt = useRef(Date.now());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const resetItem = useCallback(() => {
    setInput("");
    setGrade(null);
    setLastAnswer("");
    setCheckError("");
    setPeeked(false);
    setPeekArmed(false);
    setTries(0);
    setFirstResult(null);
    shownAt.current = Date.now();
  }, []);

  const showIndex = useCallback(
    async (s: Session) => {
      if (s.index >= s.ids.length) {
        setPhase("done");
        return;
      }
      const item = await db.exercises.get(s.ids[s.index]);
      if (!item) {
        // item vanished (e.g. cleared data): skip it
        const next = { ...s, index: s.index + 1 };
        await saveSession(next);
        setSession(next);
        return showIndex(next);
      }
      setEx(item);
      resetItem();
      setPhase("item");
    },
    [resetItem],
  );

  const begin = useCallback(
    async (opts: { fresh?: boolean; level?: number } = {}) => {
      setPhase("loading");
      setError("");
      setNoKey(false);
      try {
        let spec: DrillSpec;
        if (target.kind === "topic") {
          const t = await db.topics.get(target.topicId);
          if (!t) throw new Error("Unknown topic.");
          if (t.status === "locked") {
            router.replace(`/topic/${t.id}`);
            return;
          }
          if (opts.level && opts.level !== t.drillLevel) {
            await db.topics.update(t.id, { drillLevel: opts.level });
            t.drillLevel = opts.level;
          }
          if (!t.cardSeen) await db.topics.update(t.id, { cardSeen: true });
          setTopic(t);
          spec = { source: "topic", topicId: t.id, level: t.drillLevel };
        } else if (target.kind === "leak") {
          spec = { source: "leak", tag: target.tag };
        } else {
          spec = { source: "qa", tags: target.tags };
        }
        const s = await startSession(spec, { fresh: opts.fresh });
        setSession(s);
        await showIndex(s);
      } catch (e) {
        setNoKey(e instanceof NoKeyError);
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    },
    [target, router, showIndex],
  );

  useEffect(() => {
    begin();
  }, [begin]);

  async function check() {
    if (!ex || !input.trim() || checking) return;
    markActivity();
    setChecking(true);
    setCheckError("");
    const answer = input.trim();
    try {
      const g = await gradeAnswer(ex, answer);
      const counted = !peeked && tries === 0;
      await db.attempts.add({
        exerciseId: ex.id,
        topicId: ex.topicId,
        source: ex.source,
        level: ex.level,
        answer,
        grade: g,
        verdict: g.verdict,
        tags: uniqueTags(g.fixes),
        peeked,
        counted,
        ms: Date.now() - shownAt.current,
        at: Date.now(),
        day: dayKey(),
      });
      if (ex.used === 0) await db.exercises.update(ex.id, { used: 1 });
      if (firstResult === null) setFirstResult(peeked ? "peek" : isPass(g.verdict) ? "pass" : "fail");
      setGrade(g);
      setLastAnswer(answer);
      setTries((n) => n + 1);
    } catch (e) {
      // Never fake a grade.
      if (e instanceof NoKeyError) {
        setNoKey(true);
        setCheckError(e.message);
        return;
      }
      setCheckError(e instanceof Error ? `Couldn't grade, try again. ${e.message}` : "Couldn't grade, try again.");
    } finally {
      setChecking(false);
      markActivity();
    }
  }

  async function peek() {
    if (!ex) return;
    if (!peekArmed) {
      setPeekArmed(true);
      return;
    }
    setPeekArmed(false);
    setPeeked(true);
    if (firstResult === null) setFirstResult("peek");
    await db.attempts.add({
      exerciseId: ex.id,
      topicId: ex.topicId,
      source: ex.source,
      level: ex.level,
      answer: "",
      grade: null,
      verdict: "peek",
      tags: [],
      peeked: true,
      counted: false,
      ms: Date.now() - shownAt.current,
      at: Date.now(),
      day: dayKey(),
    });
    if (ex.used === 0) await db.exercises.update(ex.id, { used: 1 });
  }

  function retry() {
    setGrade(null);
    setCheckError("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function next(opts: { skipResult?: boolean } = {}) {
    if (!session) return;
    const results = opts.skipResult ? session.results : [...session.results, firstResult ?? "peek"];
    const s = { ...session, index: session.index + 1, results };
    await saveSession(s);
    setSession(s);
    if (s.index >= s.ids.length) {
      await clearSession(s.pool);
      if (s.source === "qa") await setMeta("qaDone", dayKey());
      setPhase("done");
    } else {
      await showIndex(s);
    }
  }

  async function flag() {
    if (!ex) return;
    await db.exercises.update(ex.id, { flagged: 1, used: 1 });
    // A flagged item's attempts never count against the learner.
    await db.attempts.where("exerciseId").equals(ex.id).delete();
    await next({ skipResult: true });
  }

  const title =
    target.kind === "topic" ? (topic?.title ?? "") : target.kind === "leak" ? TAG_INFO[target.tag].label : "Daily QA";
  const levelText = session && target.kind === "topic" ? `LVL ${session.level}/5 · ` : "";
  const progress = session ? `${levelText}${Math.min(session.index + 1, session.ids.length)}/${session.ids.length}` : "";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-3 px-5 pt-3 md:max-w-2xl md:pt-8" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
      <header className="flex items-center justify-between gap-3">
        <BackLink />
        <div className="flex min-w-0 items-center gap-3">
          {target.kind === "topic" && (
            <Link href={`/topic/${target.topicId}`} className="flex min-h-11 items-center font-mono text-[11px] tracking-[1.5px] text-accent">
              CARD
            </Link>
          )}
          <span className="truncate font-mono text-xs text-muted">{progress}</span>
        </div>
      </header>
      <h1 className="m-0 truncate font-head text-lg font-bold">{title}</h1>

      {phase === "loading" && (
        <Card>
          <Loading text="Preparing items… a new batch takes up to a minute." />
        </Card>
      )}

      {phase === "error" && (
        <Card className="flex flex-col gap-3">
          <p className={`m-0 text-sm ${noKey ? "text-soft" : "text-error"}`}>{error}</p>
          {noKey ? <ApiKeyBox onSaved={() => begin()} /> : <Button onClick={() => begin()}>Try again</Button>}
        </Card>
      )}

      {phase === "done" && session && (
        <DoneCard
          session={session}
          isTopic={target.kind === "topic"}
          onAgain={() => begin({ fresh: true })}
          onLevelUp={session.level < 5 ? () => begin({ fresh: true, level: session.level + 1 }) : undefined}
        />
      )}

      {phase === "item" && ex && (
        <>
          <Card className="flex flex-col gap-2.5">
            {ex.type === "fill_gap" && ex.promptDe && <p className="m-0 font-mono text-[15px] leading-relaxed text-text">{ex.promptDe}</p>}
            <p className={`m-0 leading-snug font-medium ${ex.type === "fill_gap" ? "text-sm text-soft" : "text-[17px]"}`}>{ex.promptMn}</p>
            <KeyWords words={ex.keyWords} />
          </Card>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="answer" className="text-xs text-muted">
              {ex.type === "fill_gap" ? "Missing word(s)" : "Your German"}
            </label>
            <textarea
              id="answer"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!grade) check();
                }
              }}
              rows={ex.type === "fill_gap" ? 1 : 2}
              readOnly={!!grade}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              lang="de"
              className={`min-h-12 w-full resize-none rounded-[10px] border bg-bg px-3 py-3 text-[15px] text-text outline-none ${grade ? "border-border opacity-80" : "border-accent-line focus:border-accent"}`}
            />
            {!grade && <UmlautRow inputRef={inputRef} value={input} onChange={setInput} />}
          </div>

          {checkError && <p className="m-0 text-sm text-error" role="alert">{checkError}</p>}
          {noKey && phase === "item" && (
            <Card>
              <ApiKeyBox
                onSaved={() => {
                  setNoKey(false);
                  setCheckError("");
                }}
              />
            </Card>
          )}

          {grade && <FeedbackCard grade={grade} answer={lastAnswer} reference={ex.solutionTokens} />}

          {peeked && (
            <Card className="flex flex-col gap-2">
              <span className="label">Answer · not counted</span>
              <SentenceView tokens={ex.solutionTokens} />
              {ex.type === "fill_gap" && <p className="m-0 font-mono text-sm text-soft">Gap: {ex.answer}</p>}
            </Card>
          )}

          <LegendToggle />

          <div className="mt-auto flex flex-col gap-2">
            {!grade ? (
              <div className="grid grid-cols-[1fr_2fr] gap-2">
                <Button variant="secondary" onClick={peek} disabled={peeked}>
                  {peeked ? "Peeked" : peekArmed ? "Tap again" : "Peek"}
                </Button>
                <Button onClick={check} disabled={!input.trim() || checking}>
                  {checking ? "Checking…" : "Check"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={retry}>
                  Retry
                </Button>
                <Button onClick={() => next()}>Next</Button>
              </div>
            )}
            {peekArmed && <p className="m-0 text-center text-xs text-muted">Peeking shows the answer. This item won&apos;t count.</p>}
            {!grade && peeked && (
              <Button variant="ghost" onClick={() => next()}>
                Skip to next
              </Button>
            )}
            <button type="button" onClick={flag} className="min-h-11 self-center text-xs text-muted underline underline-offset-4">
              Bad item? Remove it
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DoneCard({ session, isTopic, onAgain, onLevelUp }: { session: Session; isTopic: boolean; onAgain: () => void; onLevelUp?: () => void }) {
  const n = session.results.length;
  const pass = session.results.filter((r) => r === "pass").length;
  const peeks = session.results.filter((r) => r === "peek").length;
  const rate = n ? pass / n : 0;
  const canLevelUp = isTopic && onLevelUp && rate >= LEVEL_UP_RATE;
  return (
    <Card className="flex flex-col gap-3">
      <span className="font-head text-xl font-bold">
        {pass}/{n} clean
      </span>
      <p className="m-0 text-sm text-soft">
        {Math.round(rate * 100)} % on first try{peeks ? ` · ${peeks} peeked` : ""}.
        {isTopic && session.level >= 3 ? " Level 3+ items count toward sealing." : ""}
      </p>
      {canLevelUp && <Button onClick={onLevelUp}>Level {session.level + 1}</Button>}
      <Button variant={canLevelUp ? "secondary" : "primary"} onClick={onAgain}>
        Another round
      </Button>
      <Link href="/" className="flex min-h-11 items-center justify-center text-sm text-muted">
        Home
      </Link>
    </Card>
  );
}
