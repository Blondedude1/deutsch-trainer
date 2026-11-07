"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { queueCounts } from "@/lib/srs/queue";
import { DECK_LABEL, type Deck } from "@/lib/srs/types";
import { LinkButton } from "../ui/primitives";

/** Home: today's queue, like Anki's deck screen. */
export function TodayCard() {
  const data = useLiveQuery(async () => {
    const [counts, cards] = await Promise.all([queueCounts(), db.cards.toArray()]);
    const decks = new Map<Deck, { total: number; started: number }>();
    for (const c of cards) {
      const d = decks.get(c.deck) ?? { total: 0, started: 0 };
      d.total++;
      if (c.state !== 0) d.started++;
      decks.set(c.deck, d);
    }
    return { counts, decks: [...decks.entries()] };
  }, []);

  const c = data?.counts;
  const total = c ? c.newLeft + c.learning + c.due : 0;

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-accent-line bg-accent-deep p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-head text-[17px] font-bold">Today</span>
          {c && (
            <span className="font-mono text-xs">
              <span className="text-accent">{c.newLeft} new</span> · <span className="text-error">{c.learning} learning</span> ·{" "}
              <span className="text-success">{c.due} due</span>
            </span>
          )}
        </div>
        {c && total > 0 ? (
          <LinkButton href="/study" className="min-h-11 px-6">
            Study
          </LinkButton>
        ) : (
          c && <span className="text-xs text-soft">All done</span>
        )}
      </div>
      {data && data.decks.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1 p-0 text-[12px] text-soft">
          {data.decks.map(([deck, d]) => (
            <li key={deck} className="flex justify-between gap-2">
              <span>{DECK_LABEL[deck]}</span>
              <span className="font-mono text-muted">
                {d.started}/{d.total}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
