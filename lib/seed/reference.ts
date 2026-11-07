// Grammar reference tables. Cells support **bold**.
// Case names: Nominativ = нэрлэхийн, Akkusativ = заахын, Dativ = өгөх-оршихын, Genitiv = харьяалахын.

export type RefTable = {
  id: string;
  title: string;
  mn: string;
  head: string[];
  rows: string[][];
  notes?: string[];
  /** Extra search words (German grammar terms, Mongolian). */
  keywords?: string;
};

const CASES = ["Nom · нэрлэхийн", "Akk · заахын", "Dat · өгөх-оршихын", "Gen · харьяалахын"];

export const REF_TABLES: RefTable[] = [
  {
    id: "articles",
    keywords: "Artikel bestimmter Artikel Kasus Fälle Deklination гишүүн тийн ялгал",
    title: "Articles: der / die / das",
    mn: "Тодорхой гишүүн",
    head: ["", "der (m)", "die (f)", "das (n)", "die (pl)"],
    rows: [
      [CASES[0], "der", "die", "das", "die"],
      [CASES[1], "**den**", "die", "das", "die"],
      [CASES[2], "**dem**", "**der**", "**dem**", "**den** + ‑n"],
      [CASES[3], "**des** + ‑(e)s", "**der**", "**des** + ‑(e)s", "**der**"],
    ],
    notes: ["Only der changes in Akkusativ.", "dieser, jeder, welcher copy these endings: dieser, diesen, diesem, dieses."],
  },
  {
    id: "ein",
    keywords: "unbestimmter Artikel Possessivartikel Possessivpronomen Negativartikel kein mein",
    title: "ein / kein / mein",
    mn: "Тодорхойгүй гишүүн ба хамаатуулах",
    head: ["", "m", "f", "n", "pl"],
    rows: [
      [CASES[0], "ein", "eine", "ein", "keine / meine"],
      [CASES[1], "**einen**", "eine", "ein", "keine / meine"],
      [CASES[2], "**einem**", "**einer**", "**einem**", "**keinen** + ‑n"],
      [CASES[3], "**eines** + ‑(e)s", "**einer**", "**eines** + ‑(e)s", "**keiner**"],
    ],
    notes: ["ein has no plural. kein and all possessives (mein, dein, sein, ihr, unser, euer, Ihr) use this table."],
  },
  {
    id: "pronouns",
    keywords: "Personalpronomen Reflexivpronomen Possessiv төлөөний үг",
    title: "Personal pronouns",
    mn: "Биеийн төлөөний үг",
    head: ["Nom", "Akk", "Dat", "Possessive", "Reflexive (A / D)"],
    rows: [
      ["ich", "mich", "mir", "mein", "mich / mir"],
      ["du", "dich", "dir", "dein", "dich / dir"],
      ["er", "ihn", "ihm", "sein", "sich"],
      ["sie", "sie", "ihr", "ihr", "sich"],
      ["es", "es", "ihm", "sein", "sich"],
      ["wir", "uns", "uns", "unser", "uns"],
      ["ihr", "euch", "euch", "euer", "euch"],
      ["sie", "sie", "ihnen", "ihr", "sich"],
      ["Sie", "Sie", "Ihnen", "Ihr", "sich"],
    ],
    notes: ["Two pronouns: Akk before Dativ (Ich gebe **es ihm**).", "-аа/-ээ/-оо/-өө in Mongolian = the subject's own → sein/ihr/mein matching the subject."],
  },
  {
    id: "adj-der",
    keywords: "Adjektivendungen Adjektivdeklination schwache Deklination тэмдэг нэр",
    title: "Adjective endings after der / dieser",
    mn: "Тэмдэг нэр: der-ийн дараа",
    head: ["", "m", "f", "n", "pl"],
    rows: [
      [CASES[0], "-e", "-e", "-e", "-en"],
      [CASES[1], "**-en**", "-e", "-e", "-en"],
      [CASES[2], "-en", "-en", "-en", "-en"],
      [CASES[3], "-en", "-en", "-en", "-en"],
    ],
    notes: ["der neue Tisch · den neuen Tisch · mit dem neuen Tisch · die neuen Tische"],
  },
  {
    id: "adj-ein",
    keywords: "Adjektivendungen Adjektivdeklination gemischte Deklination тэмдэг нэр",
    title: "Adjective endings after ein / kein / mein",
    mn: "Тэмдэг нэр: ein-ий дараа",
    head: ["", "m", "f", "n", "pl"],
    rows: [
      [CASES[0], "**-er**", "-e", "**-es**", "-en"],
      [CASES[1], "-en", "-e", "**-es**", "-en"],
      [CASES[2], "-en", "-en", "-en", "-en"],
      [CASES[3], "-en", "-en", "-en", "-en"],
    ],
    notes: ["Bare ein shows no gender, so the adjective does: ein neu**er** Tisch, ein neu**es** Buch."],
  },
  {
    id: "adj-none",
    keywords: "Adjektivendungen Adjektivdeklination starke Deklination Nullartikel",
    title: "Adjective endings with no article",
    mn: "Тэмдэг нэр: гишүүнгүй",
    head: ["", "m", "f", "n", "pl"],
    rows: [
      [CASES[0], "-er", "-e", "-es", "-e"],
      [CASES[1], "-en", "-e", "-es", "-e"],
      [CASES[2], "-em", "-er", "-em", "-en"],
      [CASES[3], "-en", "-er", "-en", "-er"],
    ],
    notes: ["The adjective takes the der-word ending: gut**er** Wein, mit gut**em** Wein, heutig**e** Jugendliche, digital**er** Medien (Gen pl)."],
  },
  {
    id: "prepositions",
    keywords: "Präpositionen Wechselpräpositionen Akkusativpräpositionen Dativpräpositionen Genitivpräpositionen угтвар",
    title: "Prepositions by case",
    mn: "Угтвар үгс ба тийн ялгал",
    head: ["Case", "Prepositions"],
    rows: [
      ["Akk · заахын", "durch, für, gegen, ohne, um, bis"],
      ["Dat · өгөх-оршихын", "aus, bei, mit, nach, seit, von, zu, gegenüber, ab"],
      ["Wo? → Dat · Wohin? → Akk", "an, auf, hinter, in, neben, über, unter, vor, zwischen"],
      ["Gen · харьяалахын", "wegen, trotz, während, statt, aufgrund, innerhalb, außerhalb"],
    ],
    notes: ["Contractions: im, ins, am, ans, zum, zur, vom, beim.", "nach + city/country · zu + person/place · nach Hause (going) · zu Hause (at home)."],
  },
  {
    id: "connectors",
    keywords: "Konnektoren Konjunktionen Nebensatz Hauptsatz Satzbau холбоос",
    title: "Connectors and word order",
    mn: "Холбоос үг ба үгийн дараалал",
    head: ["Type", "Words", "Verb goes"],
    rows: [
      ["Slot 0 (no change)", "und, aber, oder, denn, sondern", "slot 2, normal order"],
      ["Slot 1 (adverb)", "deshalb, deswegen, darum, trotzdem, dann, außerdem, danach", "**right after** it: Deshalb **gehe** ich"],
      ["NS (subordinate)", "weil, dass, ob, wenn, als, obwohl, während, bevor, nachdem, indem, damit, bis, seit", "**last**: …, weil ich müde **bin**"],
      ["Two-part", "zwar … aber, entweder … oder, sowohl … als auch, weder … noch", "normal order"],
    ],
    notes: ["NS first → the main clause verb comes right after the comma: Weil ich müde bin, **gehe** ich."],
  },
  {
    id: "word-order",
    keywords: "Wortstellung Satzbau Satzstellung Hauptsatz Nebensatz TeKaMoLo Fragesatz дараалал",
    title: "Sentence shapes",
    mn: "Өгүүлбэрийн бүтэц",
    head: ["Shape", "Pattern", "Example"],
    rows: [
      ["Main clause (HS)", "[1 anything] [2 verb] … [end verb]", "Heute **habe** ich Deutsch **gelernt**."],
      ["W-question", "[W-word] [verb] [subject] … [end]", "Wann **kommst** du?"],
      ["Yes/no question", "[verb] [subject] … [end]", "**Kannst** du mir **helfen**?"],
      ["Subordinate (NS)", "[connector] [subject] … [end verb] [conj. verb]", "…, dass er **gekommen ist**."],
      ["NS first", "[NS], [verb] [subject] …", "Wenn ich Zeit habe, **lese** ich."],
      ["Middle order", "TeKaMoLo: time · reason · manner · place", "Ich fahre **morgen wegen der Arbeit mit dem Zug nach Berlin**."],
    ],
  },
  {
    id: "tenses",
    keywords: "Zeiten Tempus Präsens Perfekt Präteritum Plusquamperfekt Futur Partizip Hilfsverb цаг",
    title: "Tenses",
    mn: "Цаг",
    head: ["Tense", "Form", "Example", "Mongolian"],
    rows: [
      ["Präsens", "verb + ending", "Ich lerne.", "-на/-нэ, -даг/-дэг"],
      ["Perfekt", "haben/sein + Partizip II", "Ich **habe** gelernt. Ich **bin** gefahren.", "-сан/-сэн, -лаа/-лээ, -в"],
      ["Präteritum", "one word", "Ich lernte. Ich war. Ich hatte.", "-сан (stories, sein/haben/modals)"],
      ["Plusquamperfekt", "hatte/war + Partizip II", "Ich **hatte** gelernt.", "-сан байсан"],
      ["Futur I", "werden + Infinitiv", "Ich **werde** lernen.", "-х болно"],
    ],
    notes: ["sein for movement (gehen, fahren, kommen) and change of state (aufstehen, sterben, werden) + sein, bleiben, passieren.", "Partizip II: ge-…-t (gemacht) · ge-…-en (gefahren) · auf-ge-standen · no ge- for be-/ver-/er-… and -ieren."],
  },
  {
    id: "core-verbs",
    keywords: "Konjugation Hilfsverben sein haben werden wissen",
    title: "sein · haben · werden · wissen",
    mn: "Үндсэн үйл үгс",
    head: ["", "sein", "haben", "werden", "wissen"],
    rows: [
      ["ich", "bin", "habe", "werde", "weiß"],
      ["du", "bist", "hast", "wirst", "weißt"],
      ["er/sie/es", "ist", "hat", "wird", "weiß"],
      ["wir", "sind", "haben", "werden", "wissen"],
      ["ihr", "seid", "habt", "werdet", "wisst"],
      ["sie/Sie", "sind", "haben", "werden", "wissen"],
      ["Präteritum", "war", "hatte", "wurde", "wusste"],
    ],
  },
  {
    id: "modals",
    keywords: "Modalverben können müssen dürfen wollen sollen möchten",
    title: "Modal verbs",
    mn: "Модаль үйл үг",
    head: ["", "können", "müssen", "dürfen", "wollen", "sollen", "möchten"],
    rows: [
      ["ich", "kann", "muss", "darf", "will", "soll", "möchte"],
      ["du", "kannst", "musst", "darfst", "willst", "sollst", "möchtest"],
      ["er/sie/es", "kann", "muss", "darf", "will", "soll", "möchte"],
      ["wir", "können", "müssen", "dürfen", "wollen", "sollen", "möchten"],
      ["ihr", "könnt", "müsst", "dürft", "wollt", "sollt", "möchtet"],
      ["sie/Sie", "können", "müssen", "dürfen", "wollen", "sollen", "möchten"],
      ["Präteritum", "konnte", "musste", "durfte", "wollte", "sollte", "wollte"],
    ],
    notes: ["ich = er, no ending. Second verb at the end as Infinitiv.", "-ж чадна können · -х ёстой müssen · -ж болно dürfen · -маар байна möchten."],
  },
  {
    id: "questions",
    keywords: "Fragewörter W-Fragen Fragen асуух",
    title: "Question words",
    mn: "Асуух үг",
    head: ["German", "Mongolian", "German", "Mongolian"],
    rows: [
      ["wer", "хэн", "wo", "хаана"],
      ["wen", "хэнийг", "wohin", "хаашаа"],
      ["wem", "хэнд", "woher", "хаанаас"],
      ["wessen", "хэний", "wann", "хэзээ"],
      ["was", "юу", "warum", "яагаад"],
      ["mit wem", "хэнтэй", "wie", "яаж, ямар"],
      ["womit", "юугаар", "wie viel(e)", "хэд, хичнээн"],
    ],
  },
];
