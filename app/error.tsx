"use client";

import { repairAndReload } from "@/lib/repair";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col gap-3 px-5 pt-10">
      <h1 className="m-0 font-head text-xl font-bold">Something broke</h1>
      <p className="m-0 text-sm text-soft">Your progress is safe. Repair clears the offline copy of the app and reloads it.</p>
      <p className="m-0 font-mono text-xs break-words text-muted">{error.message}</p>
      <button type="button" onClick={repairAndReload} className="min-h-12 rounded-[10px] bg-accent px-4 text-sm font-semibold text-on-accent">
        Repair and reload
      </button>
      <button type="button" onClick={reset} className="min-h-11 text-sm text-muted underline underline-offset-4">
        Try again without repairing
      </button>
    </div>
  );
}
