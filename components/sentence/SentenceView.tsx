import type { Token } from "@/lib/schemas";

export const GENDER_COLOR: Record<string, string> = {
  der: "var(--color-g-der)",
  die: "var(--color-g-die)",
  das: "var(--color-g-das)",
  pl: "var(--color-g-pl)",
};

function roleStyle(t: Token): { className: string; style?: React.CSSProperties } {
  if (t.wrong) return { className: "px-1.5 font-semibold text-error underline decoration-error decoration-2 underline-offset-4" };
  switch (t.role) {
    case "subject":
      return { className: "rounded-[5px] bg-subj-bg px-1.5" };
    case "verb2":
      return { className: "rounded-[5px] bg-v2-bg px-1.5 font-semibold text-v2" };
    case "connector":
      return { className: "rounded-[5px] bg-conn-bg px-1.5 font-semibold text-conn" };
    case "finalVerb":
      return { className: "rounded-[5px] border-b-2 border-warn bg-final-bg px-1.5 font-bold text-final" };
    case "noun":
      return {
        className: "px-0.5",
        style: t.gender ? { borderBottom: `2px solid ${GENDER_COLOR[t.gender]}` } : undefined,
      };
    default:
      return { className: "px-0.5" };
  }
}

function TokenChip({ t }: { t: Token }) {
  const { className, style } = roleStyle(t);
  const tag = t.role === "noun" || (t.role === "subject" && t.gender) ? t.case : null;
  return (
    <span className="inline-flex flex-col items-center">
      <span className="h-3 font-mono text-[9px] leading-3 text-muted" aria-hidden={!tag}>
        {tag ?? ""}
      </span>
      <span className={`py-0.5 leading-snug ${className}`} style={style}>
        {t.text}
      </span>
    </span>
  );
}

type Group = { adv: Token["adv"]; advId: number | null; tokens: Token[] };

function groupTokens(tokens: Token[]): Group[] {
  const groups: Group[] = [];
  for (const t of tokens) {
    const last = groups[groups.length - 1];
    if (t.adv && last && last.adv === t.adv && last.advId === t.advId) last.tokens.push(t);
    else groups.push({ adv: t.adv, advId: t.adv ? t.advId : null, tokens: [t] });
  }
  return groups;
}

/** A German sentence colour-coded by role (see the legend). */
export function SentenceView({ tokens, size = "base" }: { tokens: Token[]; size?: "base" | "sm" }) {
  const groups = groupTokens(tokens);
  return (
    <div className={`flex flex-wrap items-end gap-x-1 gap-y-1.5 ${size === "sm" ? "text-sm" : "text-[15px]"}`}>
      {groups.map((g, i) => {
        if (!g.adv) return g.tokens.map((t, j) => <TokenChip key={`${i}-${j}`} t={t} />);
        const caseTag = g.tokens.find((t) => t.role === "noun")?.case;
        return (
          <span key={i} className="inline-flex flex-col items-center">
            <span className="font-mono text-[9px] leading-3 text-muted">
              {g.adv.toUpperCase()}
              {caseTag ? ` · ${caseTag}` : ""}
            </span>
            <span className="inline-flex flex-wrap items-end gap-x-0.5 rounded-[5px] border border-dashed border-adv-line px-1">
              {g.tokens.map((t, j) => (
                <TokenChip key={j} t={{ ...t, case: null }} />
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
}
