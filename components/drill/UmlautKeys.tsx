"use client";

import { useState } from "react";

type Field = { el: HTMLInputElement | HTMLTextAreaElement; value: string; set: (v: string) => void };

/** Insert a character at the cursor of a field and keep the cursor after it. */
export function insertAtCursor({ el, value, set }: Field, ch: string) {
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  set(value.slice(0, start) + ch + value.slice(end));
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + ch.length, start + ch.length);
  });
}

/** ä ö ü ß + capitals toggle. The parent decides which field receives the character. */
export function UmlautKeys({ onInsert }: { onInsert: (ch: string) => void }) {
  const [caps, setCaps] = useState(false);
  const chars = caps ? ["Ä", "Ö", "Ü", "ß"] : ["ä", "ö", "ü", "ß"];
  const keep = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault(); // keep the keyboard open
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {chars.map((ch) => (
        <button
          key={ch}
          type="button"
          onPointerDown={keep}
          onMouseDown={keep}
          onClick={() => onInsert(ch)}
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
