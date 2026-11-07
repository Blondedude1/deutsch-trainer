import type { SeedTopic } from "../seed/topics";
import { TAG_INFO, type MistakeTag } from "../tags";
import { CASE_NAMES, LEARNER_PROFILE, TAG_LIST, TOKEN_RULES } from "./shared";

export const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: "Level 1 — form only: very short items that test just the form (one article, one ending, one verb form). 3–6 word sentences.",
  2: "Level 2 — short sentences: 5–8 words, one clause, one grammar point.",
  3: "Level 3 — full sentences: 7–12 words, one clause, everyday content, may combine the topic with earlier topics.",
  4: "Level 4 — two clauses or two cases in one sentence (e.g. HS + NS, or Dativ person + Akk thing), 10–16 words.",
  5: "Level 5 — textbook exam style, B1 density: 12–20 words, topics like media, school, work, environment, health, travel; combine connectors and cases.",
};

export const GENERATE_SYSTEM = `You write German drill items for one learner, in the style of a German course book's Übung: simple, natural, unambiguous sentences.

${LEARNER_PROFILE}

${CASE_NAMES}

Rules for every item:
1. Use only grammar from the target topic and the topics the learner already knows (listed in the request). Vocabulary: everyday A2–B1 course-book words. No rare words, no idioms beyond the listed chunks.
2. promptMn: a natural Mongolian sentence (Cyrillic) that a Mongolian speaker would really say, with exactly one natural German translation as the target. It must NOT contain grammar hints, German words, case names, or brackets. Avoid Mongolian that could equally mean two different German tenses or articles unless the accepted variants cover both.
3. keyWords: only content words the learner might not know: nouns WITH their article in the nominative singular (e.g. "die Schwester", gender "die"; plural-only nouns gender "pl") and verbs as Infinitiv (gender null). Each with a short Mongolian gloss. Never include articles, pronouns, prepositions, connectors, endings or any word whose form is the point of the exercise. 2–5 key words.
4. Types:
   - "mn_to_de": promptDe null. answer = the full German target sentence with correct punctuation. solution = the same sentence.
   - "fill_gap": promptDe = the German sentence with exactly one gap written as ___ (one article, ending-bearing word, pronoun, preposition, or verb form). promptMn = the Mongolian translation of the whole sentence. answer = only the missing word(s). solution = the complete German sentence.
5. acceptedVariants: other genuinely correct answers (different valid word order, du/Sie when the Mongolian is ambiguous, synonyms that fit). Empty array if there are none. Never include a wrong form.
6. tags: 1–3 mistake tags from the list below that this item tests.
7. Vary subjects (ich, du, er, sie, wir, ihr, Sie, nouns), verbs and content across the batch. No two items with the same sentence frame. Do not repeat any sentence the learner has already seen (list in the request).
8. solutionTokens: tokens of the solution sentence, following the token rules.
9. Every German sentence must be 100 % correct standard German (umlauts, ß, capitalisation, commas before subordinate clauses).

${TOKEN_RULES}

Mistake tags:
${TAG_LIST}`;

export function generateUserPrompt(args: {
  mode: "topic" | "leak" | "qa";
  topic: SeedTopic | null;
  level: number;
  tags: MistakeTag[];
  count: number;
  avoid: string[];
  known: SeedTopic[];
}): string {
  const { mode, topic, level, tags, count, avoid, known } = args;
  const knownList = known.map((t) => `- ${t.id}: ${t.title}`).join("\n");
  const mixLine = `Type mix: about ${Math.round(count * 0.7)} "mn_to_de" and ${count - Math.round(count * 0.7)} "fill_gap", in random order.`;

  let task: string;
  if (mode === "topic" && topic) {
    task = `Write ${count} items for the topic "${topic.title}" (topicId "${topic.id}"). Every item's topicId is "${topic.id}".

Topic card:
FIXED: ${topic.card.fixed.join(" | ")}
CHANGES: ${topic.card.changes.join(" | ")}
MONGOLIAN CLUES: ${topic.card.mongolianClues.join(" | ")}

${LEVEL_DESCRIPTIONS[level]}
Every item must make the learner apply this topic's grammar.`;
  } else {
    const tagLines = tags.map((t) => `- ${t}: ${TAG_INFO[t].label}. ${TAG_INFO[t].hint}`).join("\n");
    task = `Write ${count} items that target these weak spots of the learner (spread the items evenly over them):
${tagLines}

${mode === "qa" ? LEVEL_DESCRIPTIONS[3] : LEVEL_DESCRIPTIONS[Math.max(2, level)]}
Set each item's topicId to the id of the known topic it mainly practises (from the list below).`;
  }

  return `${task}

${mixLine}

Topics the learner knows (use only their grammar):
${knownList}

Sentences already used (do not repeat or closely copy):
${avoid.length ? avoid.slice(0, 60).map((a) => `- ${a}`).join("\n") : "- none"}`;
}
