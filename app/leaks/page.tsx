"use client";

import { useMemo } from "react";
import { Bar, Card, Label, LinkButton } from "@/components/ui/primitives";
import { useAttempts } from "@/lib/hooks";
import { leakRanking } from "@/lib/logic/stats";
import { TAG_INFO } from "@/lib/tags";

function Trend({ count, prev }: { count: number; prev: number }) {
  if (count === prev) return <span className="font-mono text-[11px] text-muted">= {prev}</span>;
  const up = count > prev;
  return (
    <span className={`font-mono text-[11px] ${up ? "text-error" : "text-success"}`}>
      {up ? "▲" : "▼"} {Math.abs(count - prev)} vs last week
    </span>
  );
}

export default function LeaksPage() {
  const attempts = useAttempts();
  const { ranking, recent } = useMemo(() => {
    const list = attempts ?? [];
    const recent = list
      .filter((a) => a.grade && a.grade.fixes.length)
      .sort((a, b) => b.at - a.at)
      .slice(0, 12);
    return { ranking: leakRanking(list), recent };
  }, [attempts]);
  const max = Math.max(1, ...ranking.map((r) => r.count));

  return (
    <div className="flex flex-col gap-4 px-5 pt-5 md:pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-head text-2xl font-bold">Leaks</h1>
        <p className="m-0 text-sm text-muted">Mistake patterns, last 7 days.</p>
      </div>

      {ranking.length === 0 && (
        <Card>
          <p className="m-0 text-sm text-muted">No mistakes logged yet. Do a drill and they will show up here.</p>
        </Card>
      )}

      <ul className="m-0 grid list-none gap-2 p-0 md:grid-cols-2">
        {ranking.map((r) => (
          <li key={r.tag}>
            <Card className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-semibold">{TAG_INFO[r.tag].label}</span>
                  <span className="text-xs text-muted">{TAG_INFO[r.tag].hint}</span>
                </div>
                <span className="font-mono text-lg font-bold text-warn">{r.count}</span>
              </div>
              <Bar pct={(r.count / max) * 100} />
              <div className="flex items-center justify-between gap-3">
                <Trend count={r.count} prev={r.prev} />
                <LinkButton href={`/drill?leak=${r.tag}`} variant="secondary" className="min-h-11 px-4">
                  Drill this leak
                </LinkButton>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {recent.length > 0 && (
        <section className="flex flex-col gap-2">
          <Label>Recent ✗ → ✓</Label>
          <ul className="m-0 grid list-none gap-2 p-0 md:grid-cols-2">
            {recent.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 rounded-[10px] border border-border bg-card px-3 py-2.5 text-[13px]">
                <span className="text-error line-through decoration-error/60">{a.answer}</span>
                <span className="text-success">{a.grade!.corrected}</span>
                <span className="text-muted">{a.grade!.fixes.map((f) => f.reasonEn).join(" · ")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
