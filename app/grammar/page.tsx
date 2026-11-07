"use client";

import { useMemo, useState } from "react";
import { Blueprint } from "@/components/sentence/Blueprint";
import { Card, Label, Rich } from "@/components/ui/primitives";
import { REF_TABLES, type RefTable } from "@/lib/seed/reference";
import { SEED_TOPICS, type SeedTopic } from "@/lib/seed/topics";

const SHORT: Record<string, string> = {
  articles: "Articles",
  ein: "ein / kein",
  pronouns: "Pronouns",
  "adj-der": "Adj. after der",
  "adj-ein": "Adj. after ein",
  "adj-none": "Adj. no article",
  prepositions: "Prepositions",
  connectors: "Connectors",
  "word-order": "Word order",
  tenses: "Tenses",
  "core-verbs": "sein / haben",
  modals: "Modals",
  questions: "Questions",
};

/** Umlaut-blind search: "prapositionen" finds "Präpositionen". */
const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/\*\*/g, "")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss");

const tableText = (t: RefTable) => fold([t.title, t.mn, t.keywords ?? "", ...t.head, ...t.rows.flat(), ...(t.notes ?? [])].join(" "));
const topicText = (t: SeedTopic) =>
  fold([t.title, t.mongolianTitle, ...t.card.fixed, ...t.card.changes, ...t.card.blueprints, ...t.card.mongolianClues].join(" "));

function Table({ t }: { t: RefTable }) {
  return (
    <Card className="flex min-w-0 flex-col gap-2.5">
      <div id={t.id} className="flex flex-col gap-0.5 scroll-mt-20">
        <h2 className="m-0 font-head text-base font-bold">{t.title}</h2>
        <span className="text-xs text-muted">{t.mn}</span>
      </div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full border-collapse font-mono text-[12px] md:text-[13px]">
          <thead>
            <tr>
              {t.head.map((h, i) => (
                <th key={i} className="border-b border-border px-1.5 py-1.5 text-left text-[11px] font-medium whitespace-nowrap text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i} className="border-b border-divider last:border-0">
                {r.map((c, j) => (
                  <td key={j} className={`px-1.5 py-1.5 align-top ${j === 0 ? "font-sans text-[12px] text-soft" : "text-text"}`}>
                    {j === 0 && c.includes(" · ") ? (
                      <>
                        {c.split(" · ")[0]}
                        <span className="block text-[10px] text-muted">{c.split(" · ").slice(1).join(" · ")}</span>
                      </>
                    ) : (
                      <Rich text={c} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {t.notes && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[12px] leading-snug text-soft">
          {t.notes.map((n, i) => (
            <li key={i}>
              <Rich text={n} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TopicEntry({ t, open }: { t: SeedTopic; open: boolean }) {
  return (
    <details id={t.id} open={open} className="group scroll-mt-20 rounded-[10px] border border-border bg-card">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5">
        <span className="flex flex-col">
          <span className="text-sm font-semibold">{t.title}</span>
          <span className="text-xs text-muted">{t.mongolianTitle}</span>
        </span>
        <span className="font-mono text-xs text-muted group-open:rotate-90">›</span>
      </summary>
      <div className="flex flex-col gap-3 border-t border-divider px-3.5 py-3 text-[13px] leading-snug text-soft">
        <Section label="Fixed" color="var(--color-success)" items={t.card.fixed} />
        <Section label="Changes" color="var(--color-warn)" items={t.card.changes} />
        <div className="flex flex-col gap-1">
          <Label>Blueprints</Label>
          {t.card.blueprints.map((b, i) => (
            <Blueprint key={i} text={b} />
          ))}
        </div>
        <Section label="Mongolian clues" items={t.card.mongolianClues} />
      </div>
    </details>
  );
}

function Section({ label, items, color }: { label: string; items: string[]; color?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Label color={color}>{label}</Label>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {items.map((x, i) => (
          <li key={i}>
            <Rich text={x} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GrammarPage() {
  const [q, setQ] = useState("");
  const query = fold(q.trim());

  const { tables, topics } = useMemo(() => {
    if (!query) return { tables: REF_TABLES, topics: SEED_TOPICS };
    return {
      tables: REF_TABLES.filter((t) => tableText(t).includes(query)),
      topics: SEED_TOPICS.filter((t) => topicText(t).includes(query)),
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-4 px-5 pt-5 md:pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-head text-2xl font-bold">Grammar</h1>
        <p className="m-0 text-sm text-muted">Every table and rule in one place.</p>
      </div>

      <div className="sticky top-0 z-10 -mx-5 bg-bg/95 px-5 py-2 backdrop-blur md:top-14">
        <label htmlFor="grammar-search" className="sr-only">
          Search grammar
        </label>
        <input
          id="grammar-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: dativ, weil, adjektiv, хэнд…"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-h-12 w-full rounded-[10px] border border-border bg-card px-3 text-[15px] text-text outline-none focus:border-accent"
        />
      </div>

      {!query && (
        <nav aria-label="Jump to" className="flex flex-wrap gap-1.5">
          {REF_TABLES.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="flex min-h-9 items-center rounded-md border border-border bg-card px-2.5 text-xs text-soft">
              {SHORT[t.id] ?? t.title}
            </a>
          ))}
          <a href="#topics" className="flex min-h-9 items-center rounded-md border border-accent-line bg-accent-deep px-2.5 text-xs font-semibold text-accent">
            All 35 topics
          </a>
        </nav>
      )}

      {query && tables.length === 0 && topics.length === 0 && <p className="m-0 text-sm text-muted">Nothing matches &ldquo;{q}&rdquo;.</p>}

      {tables.length > 0 && (
        <section className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
          {tables.map((t) => (
            <Table key={t.id} t={t} />
          ))}
        </section>
      )}

      {topics.length > 0 && (
        <section id="topics" className="flex scroll-mt-20 flex-col gap-2">
          <Label>Topics</Label>
          {[1, 2].map((lvl) => {
            const list = topics.filter((t) => t.level === lvl);
            if (!list.length) return null;
            return (
              <div key={lvl} className="flex flex-col gap-1.5">
                <span className="mt-1 font-mono text-[11px] text-muted">LEVEL {lvl}</span>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-1.5 md:grid-cols-[repeat(2,minmax(0,1fr))] md:items-start">
                  {list.map((t) => (
                    <TopicEntry key={`${t.id}-${query ? "q" : ""}`} t={t} open={!!query} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
