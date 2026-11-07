import type { Grade, Token } from "@/lib/schemas";
import { TAG_INFO, MINOR_TAGS } from "@/lib/tags";
import { AnswerMarkup } from "../sentence/AnswerMarkup";
import { SentenceView } from "../sentence/SentenceView";
import { Card, Chip } from "../ui/primitives";

export function FeedbackCard({ grade, answer, reference }: { grade: Grade; answer: string; reference?: Token[] }) {
  const n = grade.fixes.length;
  const head =
    grade.verdict === "correct"
      ? { text: "Correct", color: "text-success" }
      : grade.verdict === "minor"
        ? { text: `Almost · ${n} minor ${n === 1 ? "fix" : "fixes"}`, color: "text-warn" }
        : { text: `${n} ${n === 1 ? "fix" : "fixes"}`, color: "text-error" };
  const tags = [...new Set(grade.fixes.map((f) => f.tag))];

  return (
    <Card className="flex flex-col gap-3" >
      <div className="flex flex-wrap items-center justify-between gap-2" role="status">
        <span className={`font-head text-base font-bold ${head.color}`}>{head.text}</span>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Chip key={t} small tone={MINOR_TAGS.includes(t) ? "warn" : "error"}>
              {t.replace(/_/g, " ").toUpperCase()}
            </Chip>
          ))}
        </div>
      </div>

      {n > 0 && (
        <div className="flex flex-col gap-1">
          <span className="label">You wrote</span>
          <AnswerMarkup answer={answer} fixes={grade.fixes} />
        </div>
      )}

      <div className="flex flex-col gap-1">
        {n > 0 && <span className="label">Corrected</span>}
        {grade.tokens.length ? <SentenceView tokens={grade.tokens} /> : <p className="m-0 text-[15px]">{grade.corrected}</p>}
      </div>

      {!grade.tokens.length && reference && reference.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="label">Textbook answer</span>
          <SentenceView tokens={reference} />
        </div>
      )}

      {n > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-snug text-soft">
          {grade.fixes.map((f, i) => (
            <li key={i}>
              <b className="font-semibold text-text">
                {f.wrong ? f.wrong : "(missing)"} → {f.right || "(remove)"}
              </b>
              : {f.reasonEn}
              <span className="sr-only"> ({TAG_INFO[f.tag].label})</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
