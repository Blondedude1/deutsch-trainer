"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Blueprint } from "@/components/sentence/Blueprint";
import { BackLink, Button, Card, Chip, Label, Rich } from "@/components/ui/primitives";
import { SEAL } from "@/lib/config";
import { db } from "@/lib/db";
import { EMPTY_SEAL, topicChip, useAttempts, useTopic } from "@/lib/hooks";
import { dayKey } from "@/lib/logic/core";
import { sealInfo } from "@/lib/logic/stats";

export default function TopicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const topic = useTopic(id);
  const attempts = useAttempts();

  const { seal, leaks } = useMemo(() => {
    const mine = (attempts ?? []).filter((a) => a.topicId === id);
    const fixes = mine
      .filter((a) => a.grade && a.grade.fixes.length)
      .sort((a, b) => b.at - a.at)
      .flatMap((a) => a.grade!.fixes.map((f) => ({ ...f, at: a.at })))
      .slice(0, 6);
    return { seal: mine.length ? sealInfo(mine, dayKey()) : EMPTY_SEAL, leaks: fixes };
  }, [attempts, id]);

  if (topic === undefined) return null;
  if (topic === null)
    return (
      <div className="px-5 pt-3">
        <BackLink />
        <p className="text-sm text-muted">Topic not found.</p>
      </div>
    );

  const chip = topicChip(topic, seal);
  const locked = topic.status === "locked";

  const start = async (level: number) => {
    await db.topics.update(topic.id, { drillLevel: level, cardSeen: true });
    router.push(`/drill?t=${topic.id}`);
  };

  return (
    <div className="flex flex-col gap-3 px-5 pt-3">
      <header className="flex items-center justify-between">
        <BackLink />
        <Chip tone={chip.tone}>{chip.text}</Chip>
      </header>

      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 font-head text-2xl font-bold">{topic.title}</h1>
        <p className="m-0 text-[13px] text-muted">{topic.mongolianTitle}</p>
      </div>

      <Card className="flex flex-col gap-2">
        <Label color="var(--color-success)">Fixed · never changes</Label>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-snug text-soft">
          {topic.card.fixed.map((f, i) => (
            <li key={i}>
              <Rich text={f} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-col gap-2">
        <Label color="var(--color-warn)">Changes · what varies</Label>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-snug text-soft">
          {topic.card.changes.map((f, i) => (
            <li key={i}>
              <Rich text={f} />
            </li>
          ))}
        </ul>
      </Card>

      <section className="flex flex-col gap-1.5">
        <Label>Blueprints</Label>
        <div className="flex flex-col gap-1 rounded-[10px] bg-card px-3 py-2.5">
          {topic.card.blueprints.map((b, i) => (
            <Blueprint key={i} text={b} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-1.5">
        <Label>Mongolian clues</Label>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-snug text-soft">
          {topic.card.mongolianClues.map((c, i) => (
            <li key={i}>
              <Rich text={c} />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-1.5">
        <Label>Your leaks here</Label>
        {leaks.length === 0 ? (
          <p className="m-0 text-[13px] text-muted">No mistakes on this topic yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[13px]">
            {leaks.map((f, i) => (
              <li key={i}>
                <span className="text-error">✗ {f.wrong || "(missing)"}</span>
                <span className="text-success"> → {f.right}</span>
                <span className="text-muted"> · {f.reasonEn}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {locked ? (
        <div className="flex flex-col gap-2 pt-1">
          <p className="m-0 text-[13px] text-muted">Locked: not covered in class yet. Unlock it once you have had it in class.</p>
          <Button onClick={() => db.topics.update(topic.id, { status: "active" })}>Unlock this topic</Button>
        </div>
      ) : (
        <section className="flex flex-col gap-2 pt-1">
          <Label>Drill level</Label>
          <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Choose a level">
            {[1, 2, 3, 4, 5].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => db.topics.update(topic.id, { drillLevel: l })}
                aria-pressed={topic.drillLevel === l}
                className={`min-h-11 rounded-lg border font-mono text-sm ${topic.drillLevel === l ? "border-accent bg-accent-deep text-accent" : "border-border bg-card text-muted"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="m-0 text-xs text-muted">
            1 form · 2 short · 3 full sentence · 4 two clauses · 5 exam style. Sealing: {SEAL.daysNeeded} days with ≥ {SEAL.minItemsPerDay} level-3+ items at ≥{" "}
            {Math.round(SEAL.passRate * 100)} %{seal.todayN ? ` (today: ${seal.todayPass}/${seal.todayN})` : ""}.
          </p>
          <Button onClick={() => start(topic.drillLevel)}>Start drill · level {topic.drillLevel}/5</Button>
        </section>
      )}
    </div>
  );
}
