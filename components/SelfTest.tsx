"use client";

import { useState } from "react";
import { runSelfTest, type SelfTestResult } from "@/lib/selfTest";
import { Button } from "./ui/primitives";

export function SelfTest() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SelfTestResult[]>([]);

  const run = async () => {
    setRunning(true);
    setResults([]);
    await runSelfTest((r) => setResults((prev) => [...prev, r]));
    setRunning(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" onClick={run} disabled={running}>
        {running ? `Checking… ${results.length}/5` : "Run grading checks"}
      </Button>
      {results.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px]">
          {results.map((r) => (
            <li key={r.name}>
              <span className={`font-mono font-bold ${r.ok ? "text-success" : "text-error"}`}>{r.ok ? "PASS" : "FAIL"}</span> {r.name}
              <span className="block text-xs text-muted">{r.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
