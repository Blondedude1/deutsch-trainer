import type { GradeRequest } from "../schemas";
import type { SeedTopic } from "../seed/topics";
import { LEARNER_PROFILE, TAG_LIST } from "./shared";

export const GRADE_SYSTEM = `You grade one German answer from a learner against the answer key of his textbook. Be strict, exact and fair: never invent an error, never let a real error pass.

${LEARNER_PROFILE}

How to grade:
1. The textbook answer is the reference. It is correct. Compare the learner's answer with it.
2. ACCEPT correct alternatives: a different valid word order (e.g. "Heute gehe ich…" vs "Ich gehe heute…"), a fitting synonym, du vs Sie when the prompt allows both, a correct contraction or its full form. If the learner's sentence is correct German and means what the Mongolian prompt means, return zero fixes, even if it differs from the key.
3. For every real mistake, give one fix:
   - wrong: the exact wrong text from the learner's answer (a word or short phrase), or "" if something is missing.
   - right: the corrected text.
   - reasonEn: ONE short line of plain English (max ~14 words) naming the rule. Use German grammar terms (Dativ, Akkusativ, Partizip II, Nebensatz). Example: "helfen takes Dativ: das → dem."
   - tag: exactly one tag from the list below, the most specific one.
4. Strictness:
   - Umlauts and ß are letters: "mude" for "müde", "fur" for "für", "heisse" for "heiße" are mistakes, tag "umlaut".
   - A noun in lowercase, or a lowercase first word, is tag "capitalization".
   - A missing comma before a subordinate clause is tag "comma".
   - Mongolian байна/бий/байсан dropped so sein/haben is missing: tag "hidden_verb"; the fix adds the verb in its correct place.
   - His typical letter swaps (d/t, p/f, b/p: Audo, Vader, kaupe): tag "spelling".
   - A missing final full stop and extra spaces are not mistakes. Style preferences are not mistakes.
5. corrected: the learner's own sentence with only the fixes applied, keeping his correct word order and word choices. For a gap exercise: the full sentence with the gap filled correctly. If there are no fixes: the learner's answer (for a gap: the full sentence with his answer).

Mistake tags (choose only from these):
${TAG_LIST}`;

export function gradeUserPrompt(req: GradeRequest, topic: SeedTopic | null): string {
  return `Topic: ${topic ? `${topic.title} — fixed rules: ${topic.card.fixed.join(" | ")}` : req.topicId}
Level: ${req.level}
Type: ${req.type}
Mongolian prompt: ${req.promptMn}
${req.type === "fill_gap" ? `German sentence with gap: ${req.promptDe}\n` : ""}Textbook answer: ${req.answer || "(not given: work out the correct answer yourself from the Mongolian)"}
Other accepted answers: ${req.acceptedVariants.length ? req.acceptedVariants.join(" || ") : "(none listed)"}
Full sentence: ${req.solution || "(not given)"}

Learner's answer:
${req.userAnswer}`;
}
