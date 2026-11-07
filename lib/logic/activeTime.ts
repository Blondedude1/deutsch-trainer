"use client";

import { useEffect } from "react";
import { ACTIVE } from "../config";
import { db } from "../db";
import { dayKey } from "./core";

/** Fire after a Check so a long think-then-submit still counts as activity. */
export function markActivity() {
  window.dispatchEvent(new Event("dt:activity"));
}

/**
 * Steam-style "hours played": counts time only while the tab is visible AND there
 * was input or a check within the last 60 s.
 */
export function useActiveTimeTracker() {
  useEffect(() => {
    let last = 0; // no credit until the first interaction
    const bump = () => {
      last = Date.now();
    };
    const events = ["pointerdown", "keydown", "input", "dt:activity"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));

    let pending = 0;
    const flush = async () => {
      if (pending <= 0) return;
      const secs = pending;
      pending = 0;
      const day = dayKey();
      await db.transaction("rw", db.activeTime, async () => {
        const row = await db.activeTime.get(day);
        await db.activeTime.put({ day, seconds: (row?.seconds ?? 0) + secs });
      });
    };

    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - last > ACTIVE.idleMs) return;
      pending += ACTIVE.tickMs / 1000;
      if (pending >= 15) flush().catch(() => {});
    }, ACTIVE.tickMs);

    const onHide = () => {
      if (document.visibilityState === "hidden") flush().catch(() => {});
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      clearInterval(tick);
      events.forEach((e) => window.removeEventListener(e, bump));
      document.removeEventListener("visibilitychange", onHide);
      flush().catch(() => {});
    };
  }, []);
}
