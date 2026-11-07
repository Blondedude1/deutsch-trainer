import type { Card as FsrsCard } from "ts-fsrs";
import type { KeyWord, Token } from "../schemas";
import type { TreeId } from "../seed/decks";

export type Deck = "sentence" | "noun" | "verb" | "pair" | "rule";

export const DECK_LABEL: Record<Deck, string> = {
  sentence: "Sentences",
  noun: "Nouns + gender",
  verb: "Irregular verbs",
  pair: "Fixed pairs",
  rule: "Grammar rules",
};

/** One sentence a sentence card can show. A card rotates through its variants. */
export type SentenceVariant = {
  type: "mn_to_de" | "fill_gap";
  promptMn: string;
  promptDe: string | null;
  keyWords: KeyWord[];
  answer: string;
  acceptedVariants: string[];
  solution: string;
  solutionTokens: Token[];
};

export type CardContent =
  | { kind: "sentence"; topicId: string; tree?: TreeId; variants: SentenceVariant[] }
  | { kind: "noun"; mn: string; de: string; plural: string; gender: "der" | "die" | "das" }
  | { kind: "verb"; inf: string; mn: string; praet: string; partizip: string; helper: "haben" | "sein"; note?: string }
  | { kind: "pair"; mn: string; de: string; hint?: string; accept?: string[] }
  | { kind: "rule"; tree: TreeId; front: string; back: string; example: string };

export type StudyCard = {
  id: string;
  deck: Deck;
  content: CardContent;
  /** The learner's own memory hook: an image, a feeling, a link. */
  hook: string;
  fsrs: FsrsCard;
  /** Mirrors fsrs.due as a number, for the index. */
  due: number;
  /** Mirrors fsrs.state (0 new, 1 learning, 2 review, 3 relearning). */
  state: number;
  /** Order in which new cards are introduced (interleaves decks). */
  order: number;
  /** Day the card was first answered; used for the new-cards-per-day limit. */
  firstSeen: string | null;
  suspended: 0 | 1;
  leech: 0 | 1;
  createdAt: number;
};
