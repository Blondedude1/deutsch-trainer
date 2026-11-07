"use client";

import { useState, type RefObject } from "react";

/** ä ö ü ß + capitals toggle. Inserts at the cursor without stealing focus. */
export function UmlautRow({
  inputRef,
  value,
  onChange,
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
}) {
  const [caps, setCaps] = useState(false);
  const chars = caps ? ["Ä", "Ö", "Ü", "ß"] : ["ä", "ö", "ü", "ß"];

  const insert = (ch: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + ch + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + ch.length, start + ch.length);
    });
  };

  const keep = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault(); // keep the keyboard open

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {chars.map((ch) => (
        <button
          key={ch}
          type="button"
          onPointerDown={keep}
          onMouseDown={keep}
          onClick={() => insert(ch)}
          aria-label={`Insert ${ch}`}
          className="min-h-11 rounded-lg border border-border bg-card font-mono text-[17px] text-text"
        >
          {ch}
        </button>
      ))}
      <button
        type="button"
        onPointerDown={keep}
        onMouseDown={keep}
        onClick={() => setCaps((c) => !c)}
        aria-pressed={caps}
        aria-label="Toggle capital umlauts"
        className={`min-h-11 rounded-lg border font-mono text-[13px] ${caps ? "border-accent-line bg-accent-deep text-accent" : "border-border bg-card text-muted"}`}
      >
        {caps ? "ä ö ü" : "Ä Ö Ü"}
      </button>
    </div>
  );
}
