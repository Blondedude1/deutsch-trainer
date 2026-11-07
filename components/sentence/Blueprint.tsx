const STYLES: Record<string, string> = {
  S: "rounded bg-subj-bg px-1",
  V: "rounded bg-v2-bg px-1 font-semibold text-v2",
  C: "rounded bg-conn-bg px-1 font-semibold text-conn",
  F: "rounded border-b-2 border-warn bg-final-bg px-1 font-bold text-final",
  A: "rounded border border-dashed border-adv-line px-1",
};

/** Renders blueprint markup: {S:…} {V:…} {C:…} {F:…} {A:…} */
export function Blueprint({ text }: { text: string }) {
  const parts = text.split(/(\{[SVCFA]:[^}]*\})/g);
  return (
    <p className="m-0 font-mono text-[13px] leading-7">
      {parts.map((p, i) => {
        const m = p.match(/^\{([SVCFA]):([^}]*)\}$/);
        if (!m) return <span key={i}>{p}</span>;
        return (
          <span key={i} className={STYLES[m[1]]}>
            {m[2]}
          </span>
        );
      })}
    </p>
  );
}
