import type { Fix } from "@/lib/schemas";

/** The learner's own answer with the wrong parts marked red. */
export function AnswerMarkup({ answer, fixes }: { answer: string; fixes: Fix[] }) {
  const ranges: [number, number][] = [];
  for (const f of fixes) {
    const w = f.wrong.trim();
    if (!w) continue;
    let from = 0;
    // take the first occurrence that doesn't overlap an earlier mark
    while (from <= answer.length) {
      const idx = answer.indexOf(w, from);
      if (idx < 0) break;
      const end = idx + w.length;
      if (!ranges.some(([a, b]) => idx < b && end > a)) {
        ranges.push([idx, end]);
        break;
      }
      from = idx + 1;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);

  const out: React.ReactNode[] = [];
  let pos = 0;
  ranges.forEach(([a, b], i) => {
    if (a > pos) out.push(<span key={`t${i}`}>{answer.slice(pos, a)}</span>);
    out.push(
      <span key={`w${i}`} className="text-error underline decoration-error decoration-2 underline-offset-4">
        {answer.slice(a, b)}
      </span>,
    );
    pos = b;
  });
  if (pos < answer.length) out.push(<span key="end">{answer.slice(pos)}</span>);

  return <p className="m-0 text-sm leading-relaxed text-soft">{out}</p>;
}
