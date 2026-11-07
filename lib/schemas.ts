import { z } from "zod";
import { MISTAKE_TAGS } from "./tags";

// Schemas shared by API routes (model output validation) and the client.
// Fields are nullable rather than optional: structured outputs require every key.

export const TagSchema = z.enum(MISTAKE_TAGS);
export const GenderSchema = z.enum(["der", "die", "das", "pl"]);
export const CaseSchema = z.enum(["N", "A", "D", "G"]);
export const RoleSchema = z.enum(["subject", "verb2", "connector", "finalVerb", "noun", "other"]);
export const AdvSchema = z.enum(["te", "ka", "mo", "lo"]);

export const TokenSchema = z.object({
  text: z.string(),
  role: RoleSchema,
  case: CaseSchema.nullable(),
  gender: GenderSchema.nullable(),
  /** TeKaMoLo label when this token is part of an adverbial phrase. */
  adv: AdvSchema.nullable(),
  /** Tokens sharing adv + advId are drawn inside one dashed box. */
  advId: z.number().int().nullable(),
  wrong: z.boolean(),
});
export type Token = z.infer<typeof TokenSchema>;

export const KeyWordSchema = z.object({
  de: z.string(),
  mn: z.string(),
  gender: GenderSchema.nullable(),
});
export type KeyWord = z.infer<typeof KeyWordSchema>;

export const ExerciseTypeSchema = z.enum(["mn_to_de", "fill_gap"]);

/** What the model produces for one item. */
export const GeneratedItemSchema = z.object({
  topicId: z.string(),
  type: ExerciseTypeSchema,
  promptMn: z.string(),
  /** fill_gap only: the German sentence with ___ for the gap. */
  promptDe: z.string().nullable(),
  keyWords: z.array(KeyWordSchema),
  /** What the learner must type: the full sentence (mn_to_de) or only the gap words (fill_gap). */
  answer: z.string(),
  acceptedVariants: z.array(z.string()),
  /** The full correct German sentence, for display. */
  solution: z.string(),
  solutionTokens: z.array(TokenSchema),
  tags: z.array(TagSchema),
});
export type GeneratedItem = z.infer<typeof GeneratedItemSchema>;

export const GenerateOutputSchema = z.object({ items: z.array(GeneratedItemSchema) });

export const FixSchema = z.object({
  wrong: z.string(),
  right: z.string(),
  reasonEn: z.string(),
  tag: TagSchema,
});
export type Fix = z.infer<typeof FixSchema>;

/** What the grader model returns (kept small: the colour-coded answer comes from the card). */
export const GradeOutputSchema = z.object({
  corrected: z.string(),
  fixes: z.array(FixSchema),
});

export type Verdict = "correct" | "minor" | "wrong";
/** tokens: colour-coded sentence when known (fast path); empty when the model graded. */
export type Grade = z.infer<typeof GradeOutputSchema> & { verdict: Verdict; tokens: Token[] };

/** Request bodies. */
export const GenerateRequestSchema = z.object({
  mode: z.enum(["topic", "leak", "qa"]),
  topicId: z.string().nullable(),
  level: z.number().int().min(1).max(5),
  tags: z.array(TagSchema),
  count: z.number().int().min(1).max(20),
  avoid: z.array(z.string()),
  knownTopicIds: z.array(z.string()),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const GradeRequestSchema = z.object({
  topicId: z.string(),
  level: z.number().int(),
  type: ExerciseTypeSchema,
  promptMn: z.string(),
  promptDe: z.string().nullable(),
  answer: z.string(),
  acceptedVariants: z.array(z.string()),
  solution: z.string(),
  userAnswer: z.string().min(1).max(600),
});
export type GradeRequest = z.infer<typeof GradeRequestSchema>;
