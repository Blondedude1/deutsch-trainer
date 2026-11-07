"use client";

import { useState } from "react";
import { setMeta } from "@/lib/db";
import { useMeta } from "@/lib/hooks";
import { Button } from "./ui/primitives";

/** Paste the Anthropic key once; it is stored on this device only. */
export function ApiKeyBox({ onSaved }: { onSaved?: () => void }) {
  const saved = useMeta<string>("apiKey", "");
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);

  if (saved && !editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm text-soft">
          Saved · …{saved.slice(-4)}
        </span>
        <Button variant="secondary" className="min-h-11" onClick={() => setEditing(true)}>
          Change
        </Button>
      </div>
    );
  }

  const save = async () => {
    const k = value.trim();
    if (!k) return;
    await setMeta("apiKey", k);
    setValue("");
    setEditing(false);
    onSaved?.();
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="apikey" className="text-xs text-muted">
        Anthropic API key (console.anthropic.com → API Keys). Stays on this phone.
      </label>
      <input
        id="apikey"
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="sk-ant-…"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="min-h-12 rounded-[10px] border border-accent-line bg-bg px-3 text-[15px] text-text outline-none focus:border-accent"
      />
      <Button onClick={save} disabled={!value.trim()}>
        Save key
      </Button>
    </div>
  );
}
