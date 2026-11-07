// Phase 1 grading acceptance checks against a running app.
// Usage: node scripts/acceptance.mjs https://your-app.vercel.app   (or http://localhost:3000)
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const base = { level: 3, type: "mn_to_de", promptDe: null, acceptedVariants: [] };
const cases = [
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

let failed = 0;
for (const c of cases) {
  const res = await fetch(`${BASE}/api/grade`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(c.req) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log(`FAIL ${c.name}: HTTP ${res.status} ${data.error ?? ""}`);
    failed++;
    continue;
  }
  const results = c.check(data.grade);
  const ok = results.every(([, pass]) => pass);
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.name}`);
  for (const [label, pass] of results) if (!pass) console.log(`     ✗ ${label}`);
  if (!ok) console.log("     grade:", JSON.stringify({ verdict: data.grade.verdict, corrected: data.grade.corrected, fixes: data.grade.fixes }));
}
console.log(failed ? `\n${failed} check(s) failed.` : "\nAll grading checks passed.");
process.exit(failed ? 1 : 0);
