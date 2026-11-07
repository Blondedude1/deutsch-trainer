import type { Fix, Grade } from "../schemas";
import { verdictFromFixes } from "../logic/core";
import type { CardContent } from "./types";

// Local, free checkers for verb, pair and noun cards. Strict on umlauts, like the AI grader.

const squash = (s: string) => s.replace(/\s+/g, " ").trim().replace(/[.!]$/, "").trim();
const foldUmlauts = (s: string) => s.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/Ä/g, "A").replace(/Ö/g, "O").replace(/Ü/g, "U").replace(/ß/g, "ss");

/** Compare one form; returns a fix or null. */
function compareForm(given: string, right: string, wrongTag: Fix["tag"], reasonWrong: string): Fix | null {
  const g = squash(given);
  if (g === right) return null;
  if (!g) return { wrong: "", right, reasonEn: reasonWrong, tag: wrongTag };
  if (foldUmlauts(g) === foldUmlauts(right) || g.replace(/ss/g, "ß") === right) {
    return { wrong: g, right, reasonEn: "Umlauts and ß are letters: they count.", tag: "umlaut" };
  }
  if (g.toLowerCase() === right.toLowerCase()) {
    return { wrong: g, right, reasonEn: "Capital letters: nouns start with a capital, verbs don't.", tag: "capitalization" };
  }
  return { wrong: g, right, reasonEn: reasonWrong, tag: wrongTag };
}

function grade(fixes: Fix[], corrected: string): Grade {
  return { verdict: verdictFromFixes(fixes), corrected, fixes, tokens: [] };
}

/** Verb card: two fields, Präteritum (er) and Perfekt (er), e.g. "fuhr" + "ist gefahren". */
export function checkVerb(c: Extract<CardContent, { kind: "verb" }>, praetIn: string, perfektIn: string): Grade {
  const fixes: Fix[] = [];
  const stripPronoun = (s: string) => squash(s).replace(/^(er|sie|es)\s+/i, "");

  // Präteritum: accept "stand auf" with any spacing.
  const p = compareForm(stripPronoun(praetIn), c.praet, "verb_form", `Präteritum of ${c.inf} is "${c.praet}".`);
  if (p) fixes.push(p);

  const perf = stripPronoun(perfektIn).split(" ");
  const helperGiven = perf.length > 1 ? perf[0].toLowerCase() : "";
  const partGiven = perf.length > 1 ? perf.slice(1).join(" ") : perf[0] ?? "";
  const helperRight = c.helper === "sein" ? "ist" : "hat";
  const helperOk = helperGiven === helperRight || helperGiven === c.helper;
  if (!helperOk) {
    fixes.push({
      wrong: helperGiven,
      right: helperRight,
      reasonEn: c.helper === "sein" ? `${c.inf} = movement or change of state → ist.` : `${c.inf} = no movement, no change of state → hat.`,
      tag: "perfekt_helper",
    });
  }
  const part = compareForm(partGiven, c.partizip, "partizip_form", `Partizip II of ${c.inf} is "${c.partizip}".`);
  if (part) fixes.push(part);

  return grade(fixes, `${c.praet} · ${helperRight} ${c.partizip}`);
}

/** Fixed pair: the "+ Akk / + Dat" note is optional when typing. */
export function checkPair(c: Extract<CardContent, { kind: "pair" }>, input: string): Grade {
  const core = (s: string) => squash(s).replace(/\s*\+\s*(akk|dat|akkusativ|dativ)\b\.?/gi, "").replace(/\s+/g, " ").trim();
  const right = core(c.de);
  const options = [right, ...(c.accept ?? []).map(core)];
  const given = core(input);
  if (options.includes(given)) return grade([], c.de);
  const fix = compareForm(given, right, "fixed_pair", `The fixed pair is "${c.de}".`);
  return grade(fix ? [fix] : [], c.de);
}

/** Noun: singular with article + plural with article, e.g. "die Schwester" + "die Schwestern". */
export function checkNoun(c: Extract<CardContent, { kind: "noun" }>, singIn: string, plIn: string): Grade {
  const fixes: Fix[] = [];
  const [artGiven, ...rest] = squash(singIn).split(" ");
  const nounGiven = rest.join(" ");
  const nounRight = c.de.replace(/^(der|die|das)\s+/, "");
  if ((artGiven ?? "").toLowerCase() !== c.gender) {
    fixes.push({ wrong: artGiven ?? "", right: c.gender, reasonEn: `${nounRight} is ${c.gender === "der" ? "masculine" : c.gender === "die" ? "feminine" : "neuter"}: ${c.gender}.`, tag: "gender" });
  }
  const n = compareForm(nounGiven, nounRight, "spelling", `The noun is spelled "${nounRight}".`);
  if (n) fixes.push(n);
  const pl = compareForm(squash(plIn).replace(/^die\s+/i, ""), c.plural.replace(/^die\s+/, ""), "plural_form", `Plural: "${c.plural}".`);
  if (pl) fixes.push(pl);
  return grade(fixes, `${c.de} · ${c.plural}`);
}
