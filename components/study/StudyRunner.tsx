"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Grade as FsrsGrade } from "ts-fsrs";
import { db, type Exercise } from "@/lib/db";
import { gradeAnswer, NoKeyError } from "@/lib/drill";
import { markActivity } from "@/lib/logic/activeTime";
import type { Grade } from "@/lib/schemas";
import { TREES } from "@/lib/seed/decks";
import { checkNoun, checkPair, checkVerb } from "@/lib/srs/check";
import { answerCard, pickNext, queueCounts, type QueueCounts } from "@/lib/srs/queue";
import { formatInterval, previewIntervals, Rating, ratingFromVerdict } from "@/lib/srs/scheduler";
import { DECK_LABEL, type StudyCard } from "@/lib/srs/types";
import { ApiKeyBox } from "../ApiKeyBox";
import { FeedbackCard } from "../drill/FeedbackCard";
import { KeyWords } from "../drill/KeyWords";
import { insertAtCursor, UmlautKeys } from "../drill/UmlautKeys";
import { LegendToggle } from "../sentence/Legend";
import { SentenceView } from "../sentence/SentenceView";
import { BackLink, Button, Card, Chip, Loading, Rich } from "../ui/primitives";

type Phase = "loading" | "question" | "answered" | "done" | "error";

// Labels only: examples live in the instruction line and always use a different word,
// so a placeholder can never give the answer away.
const FIELDS: Record<StudyCard["deck"], { label: string; placeholder: string }[]> = {
  sentence: [{ label: "Your German", placeholder: "" }],
  verb: [
    { label: "Präteritum (er-form)", placeholder: "" },
    { label: "Perfekt (er-form, with hat / ist)", placeholder: "" },
  ],
  pair: [{ label: "German expression", placeholder: "" }],
  noun: [
    { label: "Singular with der / die / das", placeholder: "" },
    { label: "Plural with die", placeholder: "" },
  ],
  rule: [{ label: "Your answer (optional)", placeholder: "" }],
};

/** One plain line telling you exactly what to do, with an example from another word. */
function instructionFor(card: StudyCard): { text: string; example?: string } {
  const c = card.content;
  switch (c.kind) {
    case "sentence": {
      const v = variantOf(card)!;
      return v.type === "fill_gap"
        ? { text: "Type only the missing word(s) for the gap ___.", example: "Ich helfe ___ Kind. → dem" }
        : { text: "Translate the Mongolian sentence into German.", example: "Би ядарсан байна. → Ich bin müde." };
    }
    case "verb": {
      const ex = c.inf === "gehen" ? "kommen → kam · ist gekommen" : "gehen → ging · ist gegangen";
      return { text: "Write the er-form in Präteritum, then in Perfekt (hat or ist + Partizip II).", example: ex };
    }
    case "pair":
      return { text: "Write the German fixed expression. The + Akk / + Dat part is optional.", example: "асуулт асуух → eine Frage stellen" };
    case "noun":
      return { text: "Write the noun with its article, then the plural.", example: "ном → das Buch · die Bücher" };
    case "rule":
      return { text: "Answer in your head (or type it), then tap Show answer and rate how well you knew it." };
  }
}

/** The variant a sentence card shows this time: rotates with each review. */
function variantOf(card: StudyCard) {
  if (card.content.kind !== "sentence") return null;
  const v = card.content.variants;
  return v[card.fsrs.reps % v.length];
}

export function StudyRunner() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [card, setCard] = useState<StudyCard | null>(null);
  const [counts, setCounts] = useState<QueueCounts | null>(null);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [fields, setFields] = useState<string[]>([""]);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [revealed, setRevealed] = useState(false); // rule cards
  const [peeked, setPeeked] = useState(false);
  const [peekArmed, setPeekArmed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [noKey, setNoKey] = useState(false);
  const [hook, setHook] = useState("");
  const sinceNew = useRef(0);
  const shownAt = useRef(Date.now());
  const refs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([]);
  const focused = useRef(0);

  const loadNext = useCallback(async () => {
    setPhase("loading");
    const [pick, c] = await Promise.all([pickNext(sinceNew.current), queueCounts()]);
    setCounts(c);
    if (!pick.card) {
      setNextAt(pick.nextAt);
      setCard(null);
      setPhase("done");
      return;
    }
    sinceNew.current = pick.kind === "new" ? 0 : sinceNew.current + 1;
    setCard(pick.card);
    setFields(FIELDS[pick.card.deck].map(() => ""));
    setGrade(null);
    setRevealed(false);
    setPeeked(false);
    setPeekArmed(false);
    setError("");
    setNoKey(false);
    setHook(pick.card.hook);
    focused.current = 0;
    shownAt.current = Date.now();
    setPhase("question");
    requestAnimationFrame(() => refs.current[0]?.focus());
  }, []);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  const setField = (i: number, v: string) => setFields((f) => f.map((x, j) => (j === i ? v : x)));

  async function check() {
    if (!card || checking) return;
    markActivity();
    if (card.deck === "rule") {
      setRevealed(true);
      setPhase("answered");
      return;
    }
    if (!fields.some((f) => f.trim())) return;
    setChecking(true);
    setError("");
    try {
      let g: Grade;
      const c = card.content;
      if (c.kind === "verb") g = checkVerb(c, fields[0], fields[1]);
      else if (c.kind === "pair") g = checkPair(c, fields[0]);
      else if (c.kind === "noun") g = checkNoun(c, fields[0], fields[1]);
      else if (c.kind === "sentence") {
        const v = variantOf(card)!;
        const ex: Exercise = {
          id: card.id, topicId: c.topicId, pool: "srs", source: "srs", level: 3, type: v.type,
          promptMn: v.promptMn, promptDe: v.promptDe, keyWords: v.keyWords, answer: v.answer,
          acceptedVariants: v.acceptedVariants, solution: v.solution, solutionTokens: v.solutionTokens,
          tags: [], used: 1, flagged: 0, createdAt: 0,
        };
        g = await gradeAnswer(ex, fields[0]);
      } else return;
      setGrade(g);
      setPhase("answered");
    } catch (e) {
      if (e instanceof NoKeyError) setNoKey(true);
      setError(e instanceof Error ? `Couldn't grade, try again. ${e.message}` : "Couldn't grade, try again.");
    } finally {
      setChecking(false);
    }
  }

  function peek() {
    if (!peekArmed) {
      setPeekArmed(true);
      return;
    }
    setPeekArmed(false);
    setPeeked(true);
    setRevealed(true);
    setPhase("answered");
  }

  async function finish(rating: FsrsGrade) {
    if (!card) return;
    markActivity();
    if (hook !== card.hook) await db.cards.update(card.id, { hook });
    await answerCard({ ...card, hook }, rating, {
      answer: fields.filter(Boolean).join(" · "),
      grade: peeked ? null : grade,
      peeked,
      ms: Date.now() - shownAt.current,
    });
    await loadNext();
  }

  const forced: FsrsGrade | null = peeked ? Rating.Again : grade ? ratingFromVerdict(grade.verdict) : null;
  const intervals = card ? previewIntervals(card.fsrs) : null;
  const remaining = counts ? counts.due + counts.learning + counts.newLeft : 0;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-3 px-5 pt-3 md:max-w-2xl md:pt-8" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
      <header className="flex items-center justify-between gap-3">
        <BackLink />
        {counts && (
          <span className="font-mono text-xs text-muted" aria-label="Cards left today">
            <span className="text-accent">{counts.newLeft}</span> new · <span className="text-error">{counts.learning}</span> learn · <span className="text-success">{counts.due}</span> due
          </span>
        )}
      </header>

      {phase === "loading" && (
        <Card>
          <Loading text="Loading…" />
        </Card>
      )}

      {phase === "done" && (
        <Card className="flex flex-col gap-3">
          <span className="font-head text-xl font-bold">{nextAt && nextAt - Date.now() < 3600_000 ? "Done for now" : "Done for today"}</span>
          <p className="m-0 text-sm text-soft">
            {nextAt
              ? `Next card ${nextAt - Date.now() < 86_400_000 ? `in ${formatInterval(nextAt - Date.now())}` : `on ${new Date(nextAt).toLocaleDateString()}`}.`
              : "No cards left."}
          </p>
          <Link href="/" className="flex min-h-11 items-center justify-center text-sm text-muted">
            Home
          </Link>
        </Card>
      )}

      {(phase === "question" || phase === "answered") && card && (
        <>
          <div className="flex items-center gap-2">
            <Chip tone="accent">{DECK_LABEL[card.deck].toUpperCase()}</Chip>
            {card.state === 0 && <Chip tone="muted">NEW</Chip>}
            {card.leech === 1 && <Chip tone="warn">LEECH</Chip>}
            <span className="ml-auto font-mono text-[11px] text-muted">{remaining} left</span>
          </div>

          <Front card={card} />

          {!revealed || card.deck !== "rule" ? (
            <div className="flex flex-col gap-2">
              {FIELDS[card.deck].map((f, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label htmlFor={`f${i}`} className="text-xs text-muted">
                    {f.label}
                  </label>
                  {card.deck === "sentence" || card.deck === "rule" ? (
                    <textarea
                      id={`f${i}`}
                      ref={(el) => {
                        refs.current[i] = el;
                      }}
                      rows={card.deck === "rule" ? 2 : variantOf(card)?.type === "fill_gap" ? 1 : 2}
                      value={fields[i] ?? ""}
                      onFocus={() => (focused.current = i)}
                      onChange={(e) => setField(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && phase === "question") {
                          e.preventDefault();
                          check();
                        }
                      }}
                      readOnly={phase === "answered"}
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      spellCheck={false}
                      lang="de"
                      className="min-h-12 w-full resize-none rounded-[10px] border border-accent-line bg-card px-3 py-3 text-[15px] text-text outline-none focus:border-accent read-only:border-border read-only:opacity-80"
                    />
                  ) : (
                    <input
                      id={`f${i}`}
                      ref={(el) => {
                        refs.current[i] = el;
                      }}
                      value={fields[i] ?? ""}
                      placeholder={f.placeholder}
                      onFocus={() => (focused.current = i)}
                      onChange={(e) => setField(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" || phase !== "question") return;
                        e.preventDefault();
                        if (i < FIELDS[card.deck].length - 1) refs.current[i + 1]?.focus();
                        else check();
                      }}
                      readOnly={phase === "answered"}
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="off"
                      spellCheck={false}
                      lang="de"
                      className="min-h-12 w-full rounded-[10px] border border-accent-line bg-card px-3 text-[15px] text-text outline-none placeholder:text-muted/50 focus:border-accent read-only:border-border read-only:opacity-80"
                    />
                  )}
                </div>
              ))}
              {phase === "question" && card.deck !== "rule" && (
                <UmlautKeys
                  onInsert={(ch) => {
                    const i = focused.current;
                    const el = refs.current[i];
                    if (el) insertAtCursor({ el, value: fields[i] ?? "", set: (v) => setField(i, v) }, ch);
                  }}
                />
              )}
            </div>
          ) : null}

          {error && (
            <p className="m-0 text-sm text-error" role="alert">
              {error}
            </p>
          )}
          {noKey && (
            <Card>
              <ApiKeyBox onSaved={() => { setNoKey(false); setError(""); }} />
            </Card>
          )}

          {phase === "answered" && <Back card={card} grade={grade} answer={fields.join(" · ")} peeked={peeked} />}

          {phase === "answered" && (
            <HookBox value={hook} onChange={setHook} urge={forced === Rating.Again} />
          )}

          {card.deck === "sentence" && <LegendToggle />}

          <div className="mt-auto flex flex-col gap-2 pt-2">
            {phase === "question" && (
              <div className="grid grid-cols-[1fr_2fr] gap-2">
                <Button variant="secondary" onClick={peek} disabled={card.deck === "rule"}>
                  {peekArmed ? "Tap again" : "Peek"}
                </Button>
                <Button onClick={check} disabled={checking || (card.deck !== "rule" && !fields.some((f) => f.trim()))}>
                  {checking ? "Checking…" : card.deck === "rule" ? "Show answer" : "Check"}
                </Button>
              </div>
            )}
            {peekArmed && <p className="m-0 text-center text-xs text-muted">Peeking shows the answer and counts as Again.</p>}

            {phase === "answered" && intervals && (
              card.deck === "rule" ? (
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-4 gap-1.5">
                    {([[Rating.Again, "Again"], [Rating.Hard, "Hard"], [Rating.Good, "Good"], [Rating.Easy, "Easy"]] as const).map(([r, l]) => (
                      <RateButton key={l} label={l} interval={intervals[r]} onClick={() => finish(r)} primary={r === Rating.Good} />
                    ))}
                  </div>
                  <p className="m-0 grid grid-cols-4 gap-1.5 text-center text-[11px] leading-tight text-muted">
                    <span>didn&apos;t know</span>
                    <span>knew, with effort</span>
                    <span>knew it</span>
                    <span>knew instantly</span>
                  </p>
                </div>
              ) : forced !== null ? (
                <RateButton label={forced === Rating.Again ? "Again" : "Hard"} interval={intervals[forced]} onClick={() => finish(forced)} primary wide />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <RateButton label="Good" interval={intervals[Rating.Good]} onClick={() => finish(Rating.Good)} primary />
                  <RateButton label="Easy" interval={intervals[Rating.Easy]} onClick={() => finish(Rating.Easy)} />
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

function RateButton({ label, interval, onClick, primary, wide }: { label: string; interval: string; onClick: () => void; primary?: boolean; wide?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 flex-col items-center justify-center rounded-[10px] border px-2 ${wide ? "w-full" : ""} ${primary ? "border-accent bg-accent text-on-accent" : "border-border bg-card text-text"}`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className={`font-mono text-[11px] ${primary ? "text-on-accent/80" : "text-muted"}`}>{interval}</span>
    </button>
  );
}

function Front({ card }: { card: StudyCard }) {
  const c = card.content;
  const how = instructionFor(card);
  return (
    <Card className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5 border-b border-divider pb-2.5">
        <p className="m-0 text-[13px] leading-snug text-soft">{how.text}</p>
        {how.example && <p className="m-0 font-mono text-[12px] text-muted">e.g. {how.example}</p>}
      </div>
      {c.kind === "sentence" && (() => {
        const v = variantOf(card)!;
        return (
          <>
            {v.type === "fill_gap" && v.promptDe && <p className="m-0 font-mono text-[15px] leading-relaxed">{v.promptDe}</p>}
            <p className={`m-0 leading-snug font-medium ${v.type === "fill_gap" ? "text-sm text-soft" : "text-[17px]"}`}>{v.promptMn}</p>
            <KeyWords words={v.keyWords} />
          </>
        );
      })()}
      {c.kind === "verb" && (
        <>
          <p className="m-0 font-mono text-xl font-bold">{c.inf}</p>
          <p className="m-0 text-sm text-soft">{c.mn}</p>
        </>
      )}
      {c.kind === "pair" && (
        <>
          <p className="m-0 text-[17px] font-medium">{c.mn}</p>
          {c.hint && <p className="m-0 font-mono text-xs text-muted">{c.hint}</p>}
        </>
      )}
      {c.kind === "noun" && <p className="m-0 text-[17px] font-medium">{c.mn}</p>}
      {c.kind === "rule" && (
        <>
          <span className="label">{TREES[c.tree]}</span>
          <p className="m-0 text-[15px] leading-snug font-medium">
            <Rich text={c.front} />
          </p>
        </>
      )}
    </Card>
  );
}

function Back({ card, grade, answer, peeked }: { card: StudyCard; grade: Grade | null; answer: string; peeked: boolean }) {
  const c = card.content;
  if (c.kind === "rule") {
    return (
      <Card className="flex flex-col gap-2">
        <span className="label">Rule</span>
        <p className="m-0 text-[15px] font-semibold">
          <Rich text={c.back} />
        </p>
        <p className="m-0 font-mono text-sm text-soft">
          <Rich text={c.example} />
        </p>
        {c.gloss && (
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {c.gloss.split(" · ").map((g) => (
              <li key={g} className="rounded-md bg-divider px-2 py-1 text-[12px] text-soft">
                {g}
              </li>
            ))}
          </ul>
        )}
      </Card>
    );
  }
  const v = variantOf(card);
  if (peeked) {
    return (
      <Card className="flex flex-col gap-2">
        <span className="label">Answer · counts as Again</span>
        {v ? <SentenceView tokens={v.solutionTokens} /> : <p className="m-0 font-mono text-[15px]">{solutionText(card)}</p>}
      </Card>
    );
  }
  if (!grade) return null;
  return (
    <>
      <FeedbackCard grade={grade} answer={answer} reference={v?.solutionTokens} />
      {c.kind === "verb" && c.note && <p className="m-0 text-xs text-muted">{c.note}</p>}
    </>
  );
}

function solutionText(card: StudyCard): string {
  const c = card.content;
  if (c.kind === "verb") return `${c.praet} · ${c.helper === "sein" ? "ist" : "hat"} ${c.partizip}`;
  if (c.kind === "pair") return c.de;
  if (c.kind === "noun") return `${c.de} · ${c.plural}`;
  return "";
}

function HookBox({ value, onChange, urge }: { value: string; onChange: (v: string) => void; urge: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="hook" className={`text-xs ${urge ? "font-semibold text-warn" : "text-muted"}`}>
        {urge ? "Make a hook so this sticks: an image, a feeling, a link" : "Your hook"}
      </label>
      <textarea
        id="hook"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. fahren → ist: a horse galloping across the steppe"
        className="w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-text outline-none placeholder:text-muted/60 focus:border-accent"
      />
    </div>
  );
}
