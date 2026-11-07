"use client";

// The Phase 1 grading acceptance checks, runnable from the Stats screen with the saved key.
import { getMeta } from "./db";
import type { Grade } from "./schemas";

type Check = [string, boolean];
type Case = { name: string; req: Record<string, unknown>; check: (g: Grade) => Check[] };

const base = { level: 3, type: "mn_to_de", promptDe: null, acceptedVariants: [] };
const cases: Case[] = [
  {
    name: "umlaut + hidden verb",
    req: { ...base, topicId: "t24-reason", promptMn: "Би ядарсан учраас одоо гэр лүүгээ явна.", answer: "Ich gehe jetzt nach Hause, weil ich müde bin.", solution: "Ich gehe jetzt nach Hause, weil ich müde bin.", userAnswer: "Ich gehe jetzt nach Hause, weil ich mude." },
    check: (g) => {
      const tags = g.fixes.map((f) => f.tag);
      return [
        ["verdict wrong", g.verdict === "wrong"],
        ["tag umlaut", tags.includes("umlaut")],
        ["tag hidden_verb", tags.includes("hidden_verb")],
        ["corrected has 'müde bin'", g.corrected.includes("müde bin")],
      ];
    },
  },
  {
    name: "deshalb verb position",
    req: { ...base, topicId: "t24-reason", promptMn: "Тиймээс тэр үсчин рүү явна.", answer: "Deshalb geht sie zum Friseur.", solution: "Deshalb geht sie zum Friseur.", userAnswer: "Deshalb sie geht zum Friseur." },
    check: (g) => [
      ["tag verb_position_hs", g.fixes.some((f) => f.tag === "verb_position_hs")],
      ["corrected", g.corrected.replace(/\.$/, "") === "Deshalb geht sie zum Friseur"],
    ],
  },
  {
    name: "das-word Dativ",
    req: { ...base, level: 2, topicId: "t03-dativ", promptMn: "Би хүүхдэд тусалж байна.", answer: "Ich helfe dem Kind.", solution: "Ich helfe dem Kind.", userAnswer: "Ich helfe des Kind." },
    check: (g) => [["tag das_dativ_dem", g.fixes.some((f) => f.tag === "das_dativ_dem")]],
  },
  {
    name: "um missing",
    req: { ...base, topicId: "t29-about", promptMn: "Энэ кино хайрын тухай.", answer: "In diesem Film geht es um eine Liebe.", solution: "In diesem Film geht es um eine Liebe.", userAnswer: "In diesem Film geht es eine Liebe." },
    check: (g) => [["tag um_darum", g.fixes.some((f) => f.tag === "um_darum")]],
  },
  {
    name: "alternative word order accepted",
    req: { ...base, topicId: "t06-dat-prep", promptMn: "Би өнөөдөр эгчтэйгээ кино руу явна.", answer: "Ich gehe heute mit meiner Schwester ins Kino.", solution: "Ich gehe heute mit meiner Schwester ins Kino.", userAnswer: "Heute gehe ich mit meiner Schwester ins Kino." },
    check: (g) => [["verdict correct", g.verdict === "correct"]],
  },
];


export type SelfTestResult = { name: string; ok: boolean; detail: string };

export async function runSelfTest(onResult: (r: SelfTestResult) => void) {
  const key = await getMeta<string>("apiKey", "");
  for (const c of cases) {
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json", ...(key ? { "x-anthropic-key": key } : {}) },
        body: JSON.stringify(c.req),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onResult({ name: c.name, ok: false, detail: data.error === "NO_KEY" ? "No API key saved." : (data.error ?? `HTTP ${res.status}`) });
        continue;
      }
      const results = c.check(data.grade);
      const failed = results.filter(([, pass]) => !pass).map(([label]) => label);
      onResult({
        name: c.name,
        ok: failed.length === 0,
        detail: failed.length ? `Missed: ${failed.join(", ")}. Got: ${data.grade.corrected} [${data.grade.fixes.map((f: { tag: string }) => f.tag).join(", ")}]` : data.grade.corrected,
      });
    } catch (e) {
      onResult({ name: c.name, ok: false, detail: e instanceof Error ? e.message : String(e) });
    }
  }
}
