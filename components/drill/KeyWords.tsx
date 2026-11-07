import type { KeyWord } from "@/lib/schemas";
import { GENDER_COLOR } from "../sentence/SentenceView";

const ARTICLE = /^(der|die|das)\s+/i;

export function KeyWords({ words }: { words: KeyWord[] }) {
  if (!words.length) return null;
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {words.map((w, i) => {
        const m = w.de.match(ARTICLE);
        const color = w.gender ? GENDER_COLOR[w.gender] : undefined;
        return (
          <li key={i} className="rounded-md bg-divider px-2 py-1 text-[12px]">
            {m ? (
              <>
                <span style={{ color }} className="font-semibold">
                  {m[1]}
                </span>{" "}
                {w.de.slice(m[0].length)}
              </>
            ) : (
              <span style={w.gender === "pl" ? { color } : undefined}>{w.de}</span>
            )}
            <span className="text-muted"> = {w.mn}</span>
          </li>
        );
      })}
    </ul>
  );
}
