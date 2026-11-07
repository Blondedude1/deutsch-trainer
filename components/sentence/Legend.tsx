"use client";

import { useState } from "react";

export function LegendBody() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-muted">
      <span>
        <span className="rounded bg-subj-bg px-1.5 text-text">ich</span> subject
      </span>
      <span>
        <span className="rounded bg-v2-bg px-1.5 font-semibold text-v2">geht</span> verb, slot 2
      </span>
      <span>
        <span className="rounded bg-conn-bg px-1.5 font-semibold text-conn">weil</span> connector
      </span>
      <span>
        <span className="rounded border-b-2 border-warn bg-final-bg px-1.5 font-bold text-final">bin</span> end / NS verb
      </span>
      <span>
        <span className="rounded border border-dashed border-adv-line px-1.5 text-text">heute</span> TE · KA · MO · LO
      </span>
      <span>
        <span className="font-mono text-text">N A D G</span> case tag
      </span>
      <span className="col-span-2 flex flex-wrap gap-x-3">
        <span className="border-b-2 border-g-der text-text">der</span>
        <span className="border-b-2 border-g-die text-text">die</span>
        <span className="border-b-2 border-g-das text-text">das</span>
        <span className="border-b-2 border-g-pl text-text">plural</span>
        <span className="text-error underline decoration-2 underline-offset-4">wrong</span>
      </span>
      <span className="col-span-2 text-[11px]">
        TE time · KA reason · MO manner · LO place
      </span>
    </div>
  );
}

/** One tap away: a toggle that reveals the colour legend. */
export function LegendToggle() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-11 items-center self-start font-mono text-[11px] tracking-[1.5px] text-muted"
      >
        {open ? "HIDE LEGEND" : "COLOUR LEGEND"}
      </button>
      {open && <LegendBody />}
    </div>
  );
}
