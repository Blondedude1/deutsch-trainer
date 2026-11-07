import { MISTAKE_TAGS, TAG_INFO } from "../tags";

export const LEARNER_PROFILE = `The learner: Myag, a native Mongolian speaker, fluent in English, an English teacher by training. He learns German through Mongolian in an intensive course (3–5 hours a day). He has finished level 1 (A1–A2) and is in level 2 (A2 → B1). Goal: Goethe C1. He studies on his phone and often types without umlauts and in lowercase.`;

export const TOKEN_RULES = `Sentence tokens (used to colour-code a German sentence). Split the sentence into tokens in order; joining all token texts with single spaces must reproduce the sentence exactly, punctuation attached to the preceding word (e.g. "Hause," and "bin.").
- role "subject": the subject noun phrase or pronoun of each clause (each word of the subject phrase is its own token with role "subject", nouns inside it also get case "N" and gender).
- role "verb2": the conjugated verb in position 2 of a main clause (or position 1 in a yes/no question or imperative).
- role "connector": weil, dass, ob, wenn, als, obwohl, indem, während (as conjunction), bevor, nachdem, damit, denn, aber, und, oder, sondern, deshalb, deswegen, darum, trotzdem, außerdem, dann, sowie W-words that start a subordinate clause.
- role "finalVerb": every verb form at the end of a clause: the conjugated verb of a subordinate clause, an Infinitiv after a modal/werden/zu, a Partizip II, a separable prefix.
- role "noun": every other noun (not part of the subject). Give it "case" (N/A/D/G) and "gender" (der/die/das/pl) of the noun phrase. Articles and adjectives in front of a noun get role "other" with the same case and gender.
- role "other": everything else.
- Adverbials (time, cause, manner, place): set "adv" to "te" (temporal), "ka" (causal), "mo" (modal), or "lo" (local) on every token of the phrase, and give the tokens of one phrase the same "advId" (1, 2, 3… per sentence). Keep the token's own role (a noun inside "mit meiner Schwester" is still role "noun", case "D", gender "die"). Tokens outside adverbials: adv null, advId null.
- case/gender null when not applicable. "wrong": always false in a solution; in a correction, true only on tokens that were changed or added compared to the learner's answer.`;

export const TAG_LIST = MISTAKE_TAGS.map((t) => `- ${t}: ${TAG_INFO[t].label}. ${TAG_INFO[t].hint}`).join("\n");

export const CASE_NAMES = `Mongolian case names: Nominativ = нэрлэхийн, Akkusativ = заахын, Dativ = өгөх-оршихын, Genitiv = харьяалахын.`;
