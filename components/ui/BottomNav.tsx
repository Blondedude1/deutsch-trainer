import Link from "next/link";

const ITEMS = [
  { href: "/", label: "Train", match: (p: string) => p === "/" || p.startsWith("/topic") },
  { href: "/leaks", label: "Leaks", match: (p: string) => p.startsWith("/leaks") },
  { href: "/verbs", label: "Verbs", match: (p: string) => p.startsWith("/verbs") },
  { href: "/stats", label: "Stats", match: (p: string) => p.startsWith("/stats") },
];

/** Phone: fixed bottom bar. */
export function BottomNav({ path }: { path: string }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-divider bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-1 px-5 pt-1.5 pb-1.5">
        {ITEMS.map((it) => {
          const active = it.match(path);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center text-[13px] ${active ? "font-semibold text-accent" : "text-muted"}`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Tablet / PC: top bar. */
export function TopNav({ path }: { path: string }) {
  return (
    <header className="sticky top-0 z-20 hidden border-b border-divider bg-card/95 backdrop-blur md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-8">
        <Link href="/" className="font-mono text-xs tracking-[2px] text-muted">
          DEUTSCH TRAINER
        </Link>
        <nav aria-label="Main" className="flex gap-1">
          {ITEMS.map((it) => {
            const active = it.match(path);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center rounded-lg px-4 text-sm ${active ? "bg-accent-deep font-semibold text-accent" : "text-muted hover:text-text"}`}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
