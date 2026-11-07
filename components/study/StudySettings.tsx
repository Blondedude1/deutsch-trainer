"use client";

import { setMeta } from "@/lib/db";
import { useMeta } from "@/lib/hooks";
import { NEW_PER_DAY_DEFAULT } from "@/lib/srs/queue";

const OPTIONS = [5, 10, 15, 20, 30, 50];

export function StudySettings() {
  const n = useMeta<number>("newPerDay", NEW_PER_DAY_DEFAULT);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">New cards per day</span>
      <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="New cards per day">
        {OPTIONS.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={n === o}
            onClick={() => setMeta("newPerDay", o)}
            className={`min-h-11 rounded-lg border font-mono text-sm ${n === o ? "border-accent bg-accent-deep text-accent" : "border-border bg-card text-muted"}`}
          >
            {o}
          </button>
        ))}
      </div>
      <span className="text-xs text-muted">Each new card brings about 5–8 reviews over the next month. 15 a day is a solid pace.</span>
    </div>
  );
}
