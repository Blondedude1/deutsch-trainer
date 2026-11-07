"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, Button, Card, Chip, Label, LinkButton, StatTile } from "@/components/ui/primitives";
import { LEARNER } from "@/lib/config";
import { db, type Topic } from "@/lib/db";
import { EMPTY_SEAL, sealByTopic, topicChip, useActiveSeconds, useAttempts, useMeta, useTopics } from "@/lib/hooks";
import { dayKey, formatDuration } from "@/lib/logic/core";
import { leakRanking, streaks } from "@/lib/logic/stats";
import { TAG_INFO } from "@/lib/tags";

export default function Home() {
  const topics = useTopics();
  const attempts = useAttempts();
  const activeToday = useActiveSeconds();
  const qaDone = useMeta<string | null>("qaDone", null) === dayKey();
  const [adding, setAdding] = useState(false);

  const derived = useMemo(() => {
    const list = attempts ?? [];
    return { seal: sealByTopic(list), streak: streaks(list), leaks: leakRanking(list) };
  }, [attempts]);

  const unlocked = (topics ?? []).filter((t) => t.status === "active");
  const sealedCount = unlocked.filter((t) => derived.seal.get(t.id)?.sealed).length;
  const top = derived.leaks.slice(0, 3);
  const maxLeak = Math.max(1, ...top.map((l) => l.count));
  const qaTags = top.map((l) => l.tag);

  return (
    <div className="flex flex-col gap-4 px-5 pt-5 md:pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10">
      <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between md:hidden">
        <span className="font-mono text-xs tracking-[2px] text-muted">DEUTSCH TRAINER</span>
      </header>

      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-head text-[32px] leading-tight font-bold">{LEARNER.name}</h1>
        <p className="m-0 text-sm text-muted">{LEARNER.levelLine}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Active today" value={formatDuration(activeToday)} />
        <StatTile label="Clean streak" value={String(derived.streak.current)} />
        <StatTile label="Sealed" value={`${sealedCount}/${unlocked.length}`} />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[14px] border border-accent-line bg-accent-deep p-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-head text-[17px] font-bold">Daily QA</span>
          <span className="text-xs text-soft">
            {qaDone ? "Done for today." : qaTags.length ? "10 questions from your weakest leaks" : "Unlocks after your first mistakes"}
          </span>
        </div>
        {qaDone ? (
          <Chip tone="success">DONE</Chip>
        ) : qaTags.length ? (
          <LinkButton href={`/drill?qa=${qaTags.join(",")}`} className="min-h-11 px-5">
            Start
          </LinkButton>
        ) : null}
      </div>

      <section className="flex flex-col gap-2.5">
        <Label>Weakest leaks</Label>
        {top.length === 0 && <p className="m-0 text-[13px] text-muted">No mistakes logged in the last 7 days.</p>}
        {top.map((l) => (
          <Link key={l.tag} href="/leaks" className="flex flex-col gap-1">
            <div className="flex justify-between gap-3 text-[13px]">
              <span>{TAG_INFO[l.tag].label}</span>
              <span className="font-mono text-warn">{l.count}</span>
            </div>
            <Bar pct={(l.count / maxLeak) * 100} />
          </Link>
        ))}
      </section>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label>Skill tree</Label>
          <button
            type="button"
            onClick={() => setAdding((a) => !a)}
            aria-expanded={adding}
            className="min-h-11 rounded-lg border border-dashed border-accent-line px-2.5 text-xs font-semibold text-accent"
          >
            {adding ? "Close" : "+ Add today's class topic"}
          </button>
        </div>

        {adding && <UnlockPanel topics={(topics ?? []).filter((t) => t.status === "locked")} onDone={() => setAdding(false)} />}

        {[1, 2].map((lvl) => (
          <div key={lvl} className="flex flex-col gap-1.5 md:grid md:grid-cols-2 md:gap-2 lg:flex">
            <span className="mt-1 font-mono text-[11px] text-muted md:col-span-2">LEVEL {lvl}</span>
            {(topics ?? [])
              .filter((t) => t.level === lvl)
              .map((t) => {
                const chip = topicChip(t, derived.seal.get(t.id) ?? EMPTY_SEAL);
                const href = t.status === "locked" || !t.cardSeen ? `/topic/${t.id}` : `/drill?t=${t.id}`;
                return (
                  <Link key={t.id} href={href} className="flex min-h-11 items-center justify-between gap-3 rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm">
                    <span className={t.status === "locked" ? "text-muted" : ""}>{t.title}</span>
                    <Chip tone={chip.tone}>{chip.text}</Chip>
                  </Link>
                );
              })}
          </div>
        ))}
      </section>
    </div>
  );
}

function UnlockPanel({ topics, onDone }: { topics: Topic[]; onDone: () => void }) {
  return (
    <Card className="flex flex-col gap-2">
      <p className="m-0 text-[13px] text-soft">
        Which topic did class cover today? Unlocking it adds its grammar to every drill. (Adding a topic from your notes and photos comes in Phase 2.)
      </p>
      {topics.length === 0 && <p className="m-0 text-[13px] text-muted">Every topic is already unlocked.</p>}
      {topics.map((t) => (
        <Button
          key={t.id}
          variant="secondary"
          className="justify-between text-left"
          onClick={async () => {
            await db.topics.update(t.id, { status: "active" });
            onDone();
          }}
        >
          <span>{t.title}</span>
          <span className="font-mono text-[11px] text-accent">UNLOCK</span>
        </Button>
      ))}
    </Card>
  );
}
