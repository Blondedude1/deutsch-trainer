"use client";

import { useMemo } from "react";
import { Card, Chip, Label, StatTile } from "@/components/ui/primitives";
import { EMPTY_SEAL, sealByTopic, topicChip, useAllActive, useAttempts, useTopics } from "@/lib/hooks";
import { daysAgo, formatDuration } from "@/lib/logic/core";
import { peeksSince, streaks } from "@/lib/logic/stats";

export default function StatsPage() {
  const attempts = useAttempts();
  const active = useAllActive();
  const topics = useTopics();

  const s = useMemo(() => {
    const list = attempts ?? [];
    const total = (active ?? []).reduce((sum, d) => sum + d.seconds, 0);
    const graded = list.filter((a) => a.grade).length;
    return {
      total,
      graded,
      streak: streaks(list),
      peeks: peeksSince(list, daysAgo(6)),
      seal: sealByTopic(list),
      week: (active ?? []).filter((d) => d.day >= daysAgo(6)).reduce((sum, d) => sum + d.seconds, 0),
    };
  }, [attempts, active]);

  return (
    <div className="flex flex-col gap-4 px-5 pt-5">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-head text-2xl font-bold">Stats</h1>
        <p className="m-0 text-sm text-muted">Charts come in Phase 3.</p>
      </div>

      <Card className="flex flex-col gap-1">
        <Label>Hours played</Label>
        <span className="font-mono text-3xl font-bold text-accent">{(s.total / 3600).toFixed(1)} h</span>
        <span className="text-xs text-muted">Last 7 days: {formatDuration(s.week)}</span>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Best streak" value={String(s.streak.best)} />
        <StatTile label="Peeks · 7 days" value={String(s.peeks)} />
        <StatTile label="Answers" value={String(s.graded)} />
      </div>

      <section className="flex flex-col gap-1.5">
        <Label>Topics</Label>
        {(topics ?? [])
          .filter((t) => t.status === "active")
          .map((t) => {
            const info = s.seal.get(t.id) ?? EMPTY_SEAL;
            const chip = topicChip(t, info);
            return (
              <div key={t.id} className="flex min-h-11 items-center justify-between gap-3 rounded-[10px] bg-card px-3 py-2 text-sm">
                <span>{t.title}</span>
                <Chip tone={chip.tone}>{chip.text}</Chip>
              </div>
            );
          })}
      </section>
    </div>
  );
}
