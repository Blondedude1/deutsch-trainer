"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { syncSeedTopics } from "@/lib/db";
import { useActiveTimeTracker } from "@/lib/logic/activeTime";
import { BottomNav } from "./ui/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  useActiveTimeTracker();

  useEffect(() => {
    syncSeedTopics().catch(() => {});
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const showNav = !path.startsWith("/drill");

  return (
    <div
      className="mx-auto min-h-dvh w-full max-w-[480px]"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}
    >
      <main className={showNav ? "pb-nav" : ""}>{children}</main>
      {showNav && <BottomNav path={path} />}
    </div>
  );
}
