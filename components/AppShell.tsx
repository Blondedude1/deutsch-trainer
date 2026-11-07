"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { syncSeedCards, syncSeedTopics } from "@/lib/db";
import { isChunkError, repairAndReload } from "@/lib/repair";
import { useActiveTimeTracker } from "@/lib/logic/activeTime";
import { BottomNav, TopNav } from "./ui/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  useActiveTimeTracker();

  useEffect(() => {
    syncSeedTopics().catch(() => {});
    syncSeedCards().catch(() => {});
    // A broken cached script: repair once automatically instead of showing a crash.
    const onError = (msg: string) => {
      if (!isChunkError(msg)) return;
      try {
        if (sessionStorage.getItem("dt-repaired")) return;
        sessionStorage.setItem("dt-repaired", "1");
      } catch {}
      repairAndReload();
    };
    const onErr = (e: ErrorEvent) => onError(String(e.message ?? ""));
    const onRej = (e: PromiseRejectionEvent) => onError(String(e.reason?.message ?? e.reason ?? ""));
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  const showNav = !path.startsWith("/drill") && !path.startsWith("/study");

  return (
    <div
      className="min-h-dvh w-full"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}
    >
      {showNav && <TopNav path={path} />}
      <main className={`mx-auto w-full max-w-[480px] md:max-w-5xl md:px-3 ${showNav ? "pb-nav" : ""}`}>{children}</main>
      {showNav && <BottomNav path={path} />}
    </div>
  );
}
