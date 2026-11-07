// Seed topics. Card text supports **bold**. Blueprints use role markup:
//   {S:subject} {V:verb in slot 2} {C:connector} {F:final / NS verb} {A:adverbial}
// Case names: Nominativ = нэрлэхийн, Akkusativ = заахын, Dativ = өгөх-оршихын, Genitiv = харьяалахын.

export type TopicCard = {
  fixed: string[];
  changes: string[];
  blueprints: string[];
  mongolianClues: string[];
};

export type SeedTopic = {
  id: string;
  order: number;
  title: string;
  mongolianTitle: string;
  level: 1 | 2;
  card: TopicCard;
};

export const SEED_TOPICS: SeedTopic[] = [
  // ───────────── Level 1 ─────────────
  {
    id: "t01-conjugation",
    order: 1,
    level: 1,
    title: "Verb conjugation",
    mongolianTitle: "Үйл үгийн хувилал",
    card: {
      fixed: [
        "Endings: ich **-e**, du **-st**, er/sie/es **-t**, wir **-en**, ihr **-t**, sie/Sie **-en**.",
        "Stem ends in -t/-d (arbeiten, finden): add **e** → du arbeit**e**st, er arbeit**e**t.",
        "Stem ends in -s/-ß/-z (heißen, tanzen): du only **-t** → du heißt.",
        "wir and sie/Sie always look like the Infinitiv.",
      ],
      changes: [
        "Vowel change only in **du** and **er/sie/es**: a→ä (fahren → du fährst), e→i (sprechen → er spricht), e→ie (lesen → er liest).",
        "**sein**: bin, bist, ist, sind, seid, sind.",
        "**haben**: habe, hast, hat, haben, habt, haben.",
        "**werden**: werde, wirst, wird, werden, werdet, werden.",
        "**wissen**: weiß, weißt, weiß, wissen, wisst, wissen (ich = er, no -t).",
      ],
      blueprints: ["{S:Ich} {V:wohne} {A:in Berlin}.", "{S:Er} {V:fährt} {A:heute} nach Hause.", "{S:Du} {V:liest} ein Buch."],
      mongolianClues: [
        "Mongolian verbs don't change for person (би явна, тэр явна). German always does: ich gehe, er geht.",
        "**-на/-нэ/-но/-нө** (present) → German Präsens.",
      ],
    },
  },
  {
    id: "t02-nom-akk",
    order: 2,
    level: 1,
    title: "Nominativ + Akkusativ",
    mongolianTitle: "Нэрлэхийн ба заахын тийн ялгал",
    card: {
      fixed: [
        "Nominativ (нэрлэхийн) = the subject: who does it.",
        "Akkusativ (заахын) = the direct object: what/whom.",
        "Only **der** changes: der → **den**, ein → **einen**, kein → **keinen**, mein → **meinen**.",
        "die, das and plural stay the same in Akkusativ.",
        "**haben** always takes Akkusativ: Ich habe **einen** Bruder.",
      ],
      changes: [
        "The gender of the noun: der Tisch → den Tisch; die Lampe → die Lampe; das Buch → das Buch.",
        "Word order can move, the case doesn't: **Den** Film sehe ich heute.",
      ],
      blueprints: ["{S:Ich} {V:kaufe} den Tisch.", "{S:Wir} {V:haben} einen Hund.", "{S:Der Mann} {V:sieht} die Frau."],
      mongolianClues: [
        "**-ыг/-ийг/-г** (заахын) → Akkusativ object.",
        "Mongolian subject has no ending (Би, Ээж) → Nominativ.",
        "**надад … байна** (I have) → ich habe + Akkusativ.",
      ],
    },
  },
  {
    id: "t03-dativ",
    order: 3,
    level: 1,
    title: "Dativ",
    mongolianTitle: "Өгөх-оршихын тийн ялгал",
    card: {
      fixed: [
        "Dativ (өгөх-оршихын): der → **dem**, die → **der**, das → **dem**, plural → **den** + -n.",
        "ein → **einem**, eine → **einer**; mein → **meinem**, meine → **meiner**.",
        "Dativ verbs (only one object, always Dativ): **helfen, danken, gefallen, gehören, schmecken, glauben, gratulieren, schaden**.",
        "Giving verbs (geben, schenken, zeigen, bringen, erklären): **person = Dativ first, thing = Akk second**.",
      ],
      changes: [
        "Which verb: helfen → Dativ; besuchen/fragen → Akkusativ (no Dativ!).",
        "Giving verbs: if the thing is a pronoun (es, ihn), it comes first: Ich gebe **es** dem Kind.",
      ],
      blueprints: ["{S:Ich} {V:helfe} dem Kind.", "{S:Das Buch} {V:gehört} der Frau.", "{S:Er} {V:schenkt} seiner Mutter einen Ring."],
      mongolianClues: [
        "**-д/-т** on a person (ээжид, багшид) → Dativ.",
        "**надад таалагдаж байна** → es gefällt mir (the thing is subject, the person is Dativ).",
        "**-д туслах** → helfen + Dativ.",
      ],
    },
  },
  {
    id: "t04-plural",
    order: 4,
    level: 1,
    title: "Plural + plural Dativ",
    mongolianTitle: "Олон тоо ба олон тооны Dativ",
    card: {
      fixed: [
        "Plural article: **die** in Nominativ and Akkusativ, for every gender.",
        "Dativ plural: **den** + noun gets **-n**: die Kinder → mit den Kinder**n**.",
        "No extra -n if the plural already ends in -n or -s: den Frauen, den Autos.",
        "Plural subject → verb in the **-en** form: Die Kinder spiel**en**.",
      ],
      changes: [
        "Plural endings must be learned with the noun: -e (Tische), -er (Kinder), -n (Frauen), -s (Autos), umlaut (Mütter, Äpfel).",
        "kein/mein in plural: keine, meine (Nom/Akk), keinen, meinen (Dativ).",
      ],
      blueprints: ["{S:Die Kinder} {V:spielen} {A:im Park}.", "{S:Ich} {V:helfe} den Kindern.", "{S:Wir} {V:kaufen} die Äpfel."],
      mongolianClues: [
        "**-ууд/-үүд/-нууд/-чууд** → plural noun.",
        "**-д/-т** on a plural (хүүхдүүдэд) → den …-n.",
      ],
    },
  },
  {
    id: "t05-akk-prep",
    order: 5,
    level: 1,
    title: "Akkusativ prepositions",
    mongolianTitle: "Заахын тийн ялгалтай угтвар үгс",
    card: {
      fixed: [
        "**für, um, durch, gegen, ohne, bis** always take Akkusativ (заахын).",
        "Only der-words change: für **den** Vater, ohne **meinen** Bruder.",
        "**ohne** + a general thing = no article: ohne Zucker, ohne Geld.",
        "**bis** usually without article: bis Montag, bis morgen.",
      ],
      changes: [
        "The noun's gender: für die Mutter / für den Vater / für das Kind.",
        "Pronouns: für **mich**, ohne **dich**, gegen **ihn**.",
      ],
      blueprints: ["{S:Ich} {V:kaufe} {A:für meinen Bruder} ein Geschenk.", "{S:Wir} {V:gehen} {A:durch den Park}.", "{S:Er} {V:trinkt} Kaffee {A:ohne Zucker}."],
      mongolianClues: [
        "**-д зориулж / -ын төлөө** → für.",
        "**-гүйгээр / -гүй** → ohne.",
        "**дундуур / -аар дамжин** → durch. **-ын эсрэг** → gegen.",
        "**…цагт** (at 8 o'clock) → um 8 Uhr. **хүртэл** → bis.",
      ],
    },
  },
  {
    id: "t06-dat-prep",
    order: 6,
    level: 1,
    title: "Dativ prepositions + contractions",
    mongolianTitle: "Өгөх-оршихын тийн ялгалтай угтвар үгс",
    card: {
      fixed: [
        "**aus, bei, mit, nach, seit, von, zu** always take Dativ (өгөх-оршихын).",
        "Contractions: zu dem → **zum**, zu der → **zur**, von dem → **vom**, bei dem → **beim**.",
        "**nach Hause** = going home (гэр лүүгээ). **zu Hause** = at home (гэртээ).",
      ],
      changes: [
        "**nach** + city/country without article: nach Berlin, nach Deutschland.",
        "**zu** + person or place with article: zum Arzt, zur Schule, zu meiner Mutter.",
        "**seit** + time: seit einem Jahr (Mongolian: **…-аас хойш, … болж байна**).",
      ],
      blueprints: ["{S:Ich} {V:fahre} {A:mit dem Bus} {A:zur Arbeit}.", "{S:Sie} {V:kommt} {A:aus der Mongolei}.", "{S:Er} {V:wohnt} {A:seit einem Jahr} {A:in Berlin}."],
      mongolianClues: [
        "**-тай/-тэй/-той** (with) → mit + Dativ.",
        "**-аас/-ээс** (from) → aus (a place) / von (a person, a start point).",
        "**руу/рүү** to a city → nach; to a person/place → zu.",
        "**гэртээ** → zu Hause; **гэр лүүгээ** → nach Hause.",
      ],
    },
  },
  {
    id: "t07-wechsel",
    order: 7,
    level: 1,
    title: "Wechselpräpositionen + verb pairs",
    mongolianTitle: "Хоёр тийн ялгалтай угтвар үгс (Wo / Wohin)",
    card: {
      fixed: [
        "**in, an, auf, über, unter, vor, hinter, neben, zwischen**.",
        "**Wo?** (location, no movement) → Dativ. **Wohin?** (direction, movement) → Akkusativ.",
        "Position verbs (Wo + Dativ): **liegen, stehen, sitzen, hängen** (hing).",
        "Action verbs (Wohin + Akk): **legen, stellen, setzen, hängen** (hängte).",
        "in dem → **im**, in das → **ins**, an dem → **am**, an das → **ans**.",
      ],
      changes: [
        "The verb decides the case: Das Buch **liegt auf dem** Tisch. Ich **lege** das Buch **auf den** Tisch.",
        "The preposition: an (vertical / edge), auf (flat surface), in (inside).",
      ],
      blueprints: ["{S:Das Buch} {V:liegt} {A:auf dem Tisch}.", "{S:Ich} {V:lege} das Buch {A:auf den Tisch}.", "{S:Wir} {V:gehen} {A:ins Kino}."],
      mongolianClues: [
        "**хаана? … -д/-т** (ширээн дээр) → Wo → Dativ.",
        "**хаашаа? … руу/рүү, дээр нь тавих** → Wohin → Akkusativ.",
        "**хэвтэж байна** → liegt; **тавина (хэвтүүлж)** → legen.",
      ],
    },
  },
  {
    id: "t08-genitiv",
    order: 8,
    level: 1,
    title: "Genitiv + alternatives",
    mongolianTitle: "Харьяалахын тийн ялгал",
    card: {
      fixed: [
        "Genitiv (харьяалахын): der/das → **des** + noun -(e)s; die/plural → **der**.",
        "1-syllable noun → **-es**: des Mann**es**. 2+ syllables → **-s**: des Lehrer**s**.",
        "Ends in s/ß/x/z/sch → **-es**: des Haus**es**. -nis → **-nisses**: des Ergeb**nisses**.",
        "The owned thing comes first: das Auto **des Vaters**.",
      ],
      changes: [
        "Names: **Peters** Auto (no apostrophe); name ends in s/x/z → **Klaus'** Auto.",
        "Spoken alternative: **von + Dativ**: das Auto von meinem Vater.",
        "Ownership as a verb: Das Auto **gehört** meinem Vater (Dativ).",
      ],
      blueprints: ["{S:Das Auto des Vaters} {V:ist} neu.", "{S:Das} {V:ist} Peters Buch.", "{S:Das Haus} {V:gehört} meiner Mutter."],
      mongolianClues: [
        "**-ын/-ийн/-ы/-ий/-н** (харьяалахын) → Genitiv (des/der) or von + Dativ.",
        "Mongolian order is owner → thing (аавын машин). German is thing → owner (das Auto des Vaters), except names (Peters Auto).",
      ],
    },
  },
  {
    id: "t09-adj-endings",
    order: 9,
    level: 1,
    title: "Adjective endings",
    mongolianTitle: "Тэмдэг нэрийн нөхцөл",
    card: {
      fixed: [
        "Adjective after **is/are** (Der Tisch ist **neu**) → no ending.",
        "After der/die/das: Nominativ singular → **-e** (der neue, die neue, das neue).",
        "After der/die/das: Akk die/das → **-e**; everything else → **-en** (den neuen, dem neuen, die neuen Bücher).",
        "After ein-words: same as above, but bare **ein** shows the gender: ein neu**er** Tisch, ein neu**es** Buch.",
      ],
      changes: [
        "Article type: der neue Tisch vs ein neuer Tisch.",
        "Case: der neue Tisch (N) → den neuen Tisch (A) → dem neuen Tisch (D).",
        "Plural with die → **-en**: die neuen Schuhe.",
      ],
      blueprints: ["{S:Der neue Lehrer} {V:ist} nett.", "{S:Ich} {V:kaufe} einen neuen Tisch.", "{S:Sie} {V:wohnt} {A:in einem großen Haus}."],
      mongolianClues: [
        "Mongolian adjectives never change (шинэ ширээ, шинэ ширээг). German ones always change with article and case.",
        "**-ыг/-ийг** on the noun → Akk ending on the adjective (den neu**en** Tisch).",
      ],
    },
  },
  {
    id: "t10-modal",
    order: 10,
    level: 1,
    title: "Modal verbs",
    mongolianTitle: "Модаль үйл үг",
    card: {
      fixed: [
        "**können, müssen, dürfen, wollen, sollen, möchten**.",
        "ich = er/sie/es, **no ending**: ich kann, er kann; ich will, er will.",
        "Second verb goes to the **end** as a bare **Infinitiv**: Ich kann gut **schwimmen**.",
      ],
      changes: [
        "Singular stem change: können → kann, müssen → muss, dürfen → darf, wollen → will. (sollen → soll, möchten → möchte.)",
        "**nicht müssen** = don't have to (шаардлагагүй). **nicht dürfen** = must not (болохгүй).",
      ],
      blueprints: ["{S:Ich} {V:kann} gut {F:schwimmen}.", "{S:Du} {V:musst} {A:heute} {F:arbeiten}.", "{S:Hier} {V:darf} man nicht {F:rauchen}."],
      mongolianClues: [
        "**-ж чадна** → können. **-х ёстой** → müssen. **-ж болно** → dürfen.",
        "**-хыг хүсэж байна / -на** (will) → wollen. **-маар байна** → möchten. **-х хэрэгтэй (гэсэн)** → sollen.",
        "**-ж болохгүй** → nicht dürfen. **-х шаардлагагүй** → nicht müssen.",
      ],
    },
  },
  {
    id: "t11-questions",
    order: 11,
    level: 1,
    title: "Questions",
    mongolianTitle: "Асуух өгүүлбэр",
    card: {
      fixed: [
        "W-question: **W-word → verb → subject**: Wo wohnst du?",
        "Yes/no question: **verb first**: Wohnst du in Berlin?",
        "wer (N) / wen (A) / wem (D) / wessen (G).",
      ],
      changes: [
        "Person + preposition: **mit wem**, für wen, von wem.",
        "Thing + preposition: **wo(r)- + preposition**: womit, wofür, worauf, worüber (r before a vowel).",
      ],
      blueprints: ["Wo {V:wohnst} {S:du}?", "{V:Hast} {S:du} {A:heute} Zeit?", "Mit wem {V:gehst} {S:du} ins Kino?"],
      mongolianClues: [
        "**хэн** → wer, **хэнийг** → wen, **хэнд** → wem, **хэний** → wessen.",
        "**хэнтэй** → mit wem; **юугаар** → womit; **юуны тухай** → worüber.",
        "**…уу/үү/юу/юү?** (no question word) → verb first.",
      ],
    },
  },
  {
    id: "t12-ein-kein",
    order: 12,
    level: 1,
    title: "ein / kein vs der",
    mongolianTitle: "ein, kein ба der",
    card: {
      fixed: [
        "**der/die/das** = a known, specific thing. **ein/eine** = one, any, new information.",
        "kein = ein + not. kein takes the same endings as ein (keinen, keiner…).",
        "No plural of ein: Ich habe Bücher. Plural of kein: keine Bücher.",
      ],
      changes: [
        "Case endings: ein Hund (N) → einen Hund (A) → einem Hund (D).",
        "Uncountable things have no ein: Ich trinke Wasser.",
      ],
      blueprints: ["{S:Ich} {V:habe} einen Bruder.", "{S:Ich} {V:sehe} den Mann.", "{S:Wir} {V:haben} keine Zeit."],
      mongolianClues: [
        "Object with **-ыг/-ийг/-г** (номыг) → **der/die/das** (the book).",
        "Object without ending (ном уншина) → **ein-** (a book) or no article.",
        "**нэг** → ein. **…гүй / байхгүй** with a noun → kein.",
      ],
    },
  },
  {
    id: "t13-negation",
    order: 13,
    level: 1,
    title: "Negation: kein vs nicht",
    mongolianTitle: "Үгүйсгэл: kein ба nicht",
    card: {
      fixed: [
        "**kein** negates a noun that would have **ein** or no article: Ich habe **kein** Auto.",
        "**nicht** negates everything else: verbs, adjectives, nouns with der/mein.",
        "Time words come **before** nicht: Ich komme **heute nicht**.",
      ],
      changes: [
        "nicht placement: whole sentence → at the end (Ich schlafe nicht); before an adjective (nicht gut); before a place/preposition (nicht nach Hause); before the end verb (Ich kann nicht kommen).",
        "kein ending follows ein: keinen Hund, keine Zeit, kein Geld.",
      ],
      blueprints: ["{S:Ich} {V:habe} kein Auto.", "{S:Er} {V:kommt} {A:heute} nicht.", "{S:Wir} {V:können} nicht {F:kommen}."],
      mongolianClues: [
        "**…гүй / байхгүй** after a noun (машингүй, мөнгө байхгүй) → kein.",
        "**-аагүй / -хгүй / биш** on a verb or adjective → nicht.",
      ],
    },
  },
  {
    id: "t14-pronouns",
    order: 14,
    level: 1,
    title: "Personal pronouns (Akk / Dativ)",
    mongolianTitle: "Биеийн төлөөний үг",
    card: {
      fixed: [
        "Akk: mich, dich, ihn, sie, es, uns, euch, sie/Sie.",
        "Dativ: mir, dir, ihm, ihr, ihm, uns, euch, ihnen/Ihnen.",
        "uns and euch are the same in Akk and Dativ.",
        "Two pronouns: **Akk before Dativ**: Ich gebe **es ihm**.",
      ],
      changes: [
        "The verb decides the case: helfen → mir; sehen → mich.",
        "Noun + pronoun: pronoun first: Ich gebe **ihm** das Buch. Ich gebe **es** dem Kind.",
      ],
      blueprints: ["{S:Ich} {V:sehe} dich.", "{V:Kannst} {S:du} mir {F:helfen}?", "{S:Ich} {V:gebe} es ihm."],
      mongolianClues: [
        "**намайг** → mich, **надад** → mir; **чамайг** → dich, **чамд** → dir.",
        "**түүнийг** → ihn/sie, **түүнд** → ihm/ihr; **биднийг / бидэнд** → uns.",
        "**тэднийг** → sie, **тэдэнд** → ihnen.",
      ],
    },
  },
  {
    id: "t15-possessives",
    order: 15,
    level: 1,
    title: "Possessives",
    mongolianTitle: "Хамаатуулах төлөөний үг",
    card: {
      fixed: [
        "mein (my), dein (your), **sein** (his/its), **ihr** (her), unser, euer, **ihr** (their), **Ihr** (your, formal).",
        "Endings = the ein/kein table: mein Bruder, meinen Bruder, meinem Bruder, meine Schwester.",
        "euer loses its e with an ending: eure, euren.",
      ],
      changes: [
        "The **owner** picks the word (sein vs ihr). The **noun** picks the ending (meine vs meinen).",
        "die-words never take -en in Nom/Akk: **meine** Mutter (not meinen).",
      ],
      blueprints: ["{S:Mein Bruder} {V:wohnt} {A:in Ulaanbaatar}.", "{S:Sie} {V:besucht} ihren Vater.", "{S:Er} {V:hilft} seiner Mutter."],
      mongolianClues: [
        "**миний** → mein, **чиний** → dein, **түүний** → sein/ihr, **бидний** → unser, **тэдний** → ihr.",
        "**-аа/-ээ/-оо/-өө** (ээжтэйгээ, ахаа) = the subject's own → sein/ihr/mein matching the subject.",
      ],
    },
  },
  {
    id: "t16-separable",
    order: 16,
    level: 1,
    title: "Separable / inseparable verbs",
    mongolianTitle: "Салдаг ба салдаггүй үйл үг",
    card: {
      fixed: [
        "Separable prefix goes to the **end**: aufstehen → Ich stehe um 7 Uhr **auf**.",
        "Never split: **be-, ge-, emp-, ent-, er-, miss-, ver-, zer-** (bekommen, verstehen).",
        "With a modal or in an NS, the verb is joined again: Ich muss früh **aufstehen**. …, weil ich früh **aufstehe**.",
      ],
      changes: [
        "Common separable prefixes: ab-, an-, auf-, aus-, ein-, mit-, vor-, zu-, zurück-, fern-.",
        "**über-/unter-**: stress decides. Stress on prefix → separable (Er setzt über); stress on verb → inseparable (Er übersetzt).",
      ],
      blueprints: ["{S:Ich} {V:stehe} {A:um 7 Uhr} {F:auf}.", "{S:Er} {V:ruft} seine Mutter {F:an}.", "{S:Ich} {V:verstehe} das nicht."],
      mongolianClues: [
        "Mongolian keeps the verb in one word (босно, утасдана). German splits the prefix to the end.",
        "**утасдах** → anrufen, **босох** → aufstehen, **зурагт үзэх** → fernsehen.",
      ],
    },
  },
  {
    id: "t17-reflexive",
    order: 17,
    level: 1,
    title: "Reflexive verbs",
    mongolianTitle: "Өөрийн хэвийн үйл үг (sich)",
    card: {
      fixed: [
        "Reflexive pronoun: mich/mir, dich/dir, **sich**, uns, euch, **sich**.",
        "Only **ich** and **du** have different Akk/Dativ forms.",
        "Default is Akk: Ich wasche **mich**.",
      ],
      changes: [
        "Another Akk object present → reflexive becomes **Dativ**: Ich wasche **mir** die Hände.",
        "Common: sich freuen, sich interessieren für, sich treffen, sich setzen, sich duschen, sich vorstellen.",
      ],
      blueprints: ["{S:Ich} {V:freue} mich.", "{S:Ich} {V:wasche} mir die Hände.", "{S:Er} {V:interessiert} sich {A:für Musik}."],
      mongolianClues: [
        "**өөрийгөө** → sich (Akk); **өөртөө** → sich (Dativ).",
        "**гараа угаах** (wash one's own hands) → sich die Hände waschen (Dativ, because die Hände is the Akk object).",
      ],
    },
  },

  // ───────────── Level 2 ─────────────
  {
    id: "t18-perfekt",
    order: 18,
    level: 2,
    title: "Perfekt",
    mongolianTitle: "Төгссөн цаг (Perfekt)",
    card: {
      fixed: [
        "**haben/sein** in slot 2 + **Partizip II** at the end.",
        "**sein** for movement (gehen, fahren, fliegen, kommen) and change of state (aufstehen, einschlafen, sterben, werden) + sein, bleiben, passieren.",
        "Everything else → haben.",
      ],
      changes: [
        "Regular: **ge- + stem + -t** (gemacht). Irregular: **ge- + stem + -en** (gefahren, often vowel change).",
        "Separable: ge in the middle: auf**ge**standen, ein**ge**kauft.",
        "No ge-: inseparable (bekommen, verstanden) and **-ieren** (studiert, telefoniert).",
      ],
      blueprints: ["{S:Ich} {V:habe} gestern Deutsch {F:gelernt}.", "{S:Wir} {V:sind} {A:nach Berlin} {F:gefahren}.", "{S:Er} {V:ist} {A:um 6 Uhr} {F:aufgestanden}."],
      mongolianClues: [
        "**-сан/-сэн/-сон/-сөн, -лаа/-лээ/-лоо/-лөө, -в** (past) → Perfekt in speech.",
        "**явсан, ирсэн, нисэн** (movement) → bin/ist + Partizip.",
      ],
    },
  },
  {
    id: "t19-praeteritum",
    order: 19,
    level: 2,
    title: "Präteritum",
    mongolianTitle: "Өнгөрсөн цаг (Präteritum)",
    card: {
      fixed: [
        "One word, **no helper**: Ich **ging**. Er **kaufte**.",
        "Regular: stem + **-te**: ich kaufte, du kauftest, er kaufte, wir kauften.",
        "ich = er, no ending: ich ging, er ging.",
        "In speech: **war, hatte** and modals (konnte, musste, wollte, durfte, sollte) are used instead of Perfekt.",
      ],
      changes: [
        "Irregular stems must be learned: gehen → ging, kommen → kam, sehen → sah, fahren → fuhr.",
        "Separable: prefix still at the end: Er stand um 6 Uhr **auf**.",
      ],
      blueprints: ["{S:Ich} {V:war} {A:gestern} krank.", "{S:Er} {V:hatte} keine Zeit.", "{S:Wir} {V:konnten} nicht {F:kommen}."],
      mongolianClues: [
        "Same Mongolian past (**-сан, -лаа, -в**). Story or written text → Präteritum; sein/haben/modals → always Präteritum.",
        "**байсан** → war; **…-тай байсан / надад … байсан** → hatte.",
      ],
    },
  },
  {
    id: "t20-plusquam",
    order: 20,
    level: 2,
    title: "Plusquamperfekt",
    mongolianTitle: "Урьд өнгөрсөн цаг",
    card: {
      fixed: [
        "**hatte/war** + **Partizip II** at the end.",
        "Same haben/sein choice as Perfekt.",
        "Used for the earlier of two past events.",
      ],
      changes: [
        "Which event is earlier: Als ich ankam, **war** der Zug schon **abgefahren**.",
        "Often with nachdem: Nachdem er gegessen **hatte**, ging er.",
      ],
      blueprints: ["{S:Ich} {V:hatte} schon {F:gegessen}.", "{S:Der Zug} {V:war} schon {F:abgefahren}."],
      mongolianClues: ["**-сан байсан / -чихсан байсан** → Plusquamperfekt.", "**аль хэдийн** → schon."],
    },
  },
  {
    id: "t21-tense-map",
    order: 21,
    level: 2,
    title: "Tense map",
    mongolianTitle: "Цагийн зураглал",
    card: {
      fixed: [
        "Each clause half gets **its own** tense: Ich weiß, dass er gestern gekommen **ist**.",
        "The Mongolian ending on each verb decides the tense.",
      ],
      changes: [
        "Present / near future → Präsens. Past → Perfekt (speech) / Präteritum (sein, haben, modals, stories).",
        "Earlier past → Plusquamperfekt. Clear future plan/prediction → werden + Infinitiv.",
      ],
      blueprints: ["{S:Ich} {V:glaube}, {C:dass} {S:er} {A:morgen} {F:kommt}.", "{S:Er} {V:sagt}, {C:dass} {S:er} krank {F:war}."],
      mongolianClues: [
        "**-на/-нэ** → Präsens. **-даг/-дэг** (habit) → Präsens + oft/immer.",
        "**-сан, -лаа, -в** → Perfekt / Präteritum. **-сан байсан** → Plusquamperfekt.",
        "**-х болно** → werden + Infinitiv.",
      ],
    },
  },
  {
    id: "t22-hs-ns",
    order: 22,
    level: 2,
    title: "HS / NS shape",
    mongolianTitle: "Гол ба гишүүн өгүүлбэр",
    card: {
      fixed: [
        "HS (Hauptsatz): conjugated verb in **slot 2**.",
        "NS (Nebensatz): connector first, conjugated verb **last**.",
        "Comma always between HS and NS.",
      ],
      changes: [
        "NS first → it fills slot 1, so the HS verb comes right after the comma: **verb, verb**. Weil ich müde **bin**, **gehe** ich nach Hause.",
        "Two verbs in the NS: Partizip/Infinitiv, then the conjugated verb: …, weil ich arbeiten **muss**.",
      ],
      blueprints: ["{S:Ich} {V:bleibe} {A:zu Hause}, {C:weil} {S:ich} krank {F:bin}.", "{C:Weil} {S:ich} krank {F:bin}, {V:bleibe} {S:ich} {A:zu Hause}."],
      mongolianClues: [
        "Mongolian puts the reason first and the verb last everywhere. German HS needs the verb in slot 2.",
        "**учраас, болохоор, гэж, эсэх, -вал** → an NS: verb last.",
      ],
    },
  },
  {
    id: "t23-dass-ob",
    order: 23,
    level: 2,
    title: "dass / ob",
    mongolianTitle: "dass ба ob (гэж / эсэх)",
    card: {
      fixed: [
        "**dass** = that (a fact/statement). **ob** = whether (a yes/no question inside).",
        "Both start an NS: verb last.",
        "Every NS needs **its own subject**: Ich hoffe, dass **du** kommst.",
      ],
      changes: [
        "Perfekt inside the NS: Partizip + helper last: …, dass er gekommen **ist**.",
        "Modal inside: …, ob ich kommen **kann**.",
      ],
      blueprints: ["{S:Ich} {V:weiß}, {C:dass} {S:er} krank {F:ist}.", "{S:Ich} {V:frage}, {C:ob} {S:du} Zeit {F:hast}.", "{S:Sie} {V:sagt}, {C:dass} {S:sie} gestern {F:gearbeitet hat}."],
      mongolianClues: ["**гэж / гэдгийг / гэдэг** → dass.", "**эсэхийг / …уу үгүйг** → ob."],
    },
  },
  {
    id: "t24-reason",
    order: 24,
    level: 2,
    title: "Reason: weil / denn / deshalb / wegen",
    mongolianTitle: "Шалтгаан",
    card: {
      fixed: [
        "**weil** + reason → NS, verb last.",
        "**denn** + reason → slot 0, normal order (verb 2nd).",
        "**deshalb / deswegen / darum** + result → slot 1, **verb right after**: Deshalb **gehe** ich.",
        "**nämlich** inside the reason sentence, after the verb: Ich bin **nämlich** krank.",
        "**wegen / aufgrund + Genitiv** → a noun, no verb: wegen des Regens.",
      ],
      changes: [
        "Which half gets the connector: weil/denn on the **reason**, deshalb on the **result**.",
        "Clause vs noun: weil + clause; wegen + noun.",
      ],
      blueprints: ["{S:Ich} {V:bleibe} {A:zu Hause}, {C:weil} {S:ich} krank {F:bin}.", "{S:Ich} {V:bin} krank, {C:deshalb} {V:bleibe} {S:ich} {A:zu Hause}.", "{C:Wegen} des Regens {V:bleibe} {S:ich} {A:zu Hause}."],
      mongolianClues: [
        "**учраас / болохоор / тул** (on the reason) → weil / denn.",
        "**тиймээс / иймээс** (on the result) → deshalb.",
        "**…-ын улмаас / -аас болж** + a noun → wegen + Genitiv.",
      ],
    },
  },
  {
    id: "t25-contrast",
    order: 25,
    level: 2,
    title: "Contrast: obwohl / trotzdem / trotz",
    mongolianTitle: "Эсрэгцэл",
    card: {
      fixed: [
        "**obwohl** + the surprising condition → NS, verb last.",
        "**trotzdem** + the result → slot 1, verb right after.",
        "**trotz + Genitiv** → a noun only.",
      ],
      changes: [
        "Same pattern as weil / deshalb / wegen: clause / result / noun.",
        "NS first: Obwohl ich krank bin, **gehe** ich zur Arbeit.",
      ],
      blueprints: ["{S:Ich} {V:gehe} {A:zur Arbeit}, {C:obwohl} {S:ich} krank {F:bin}.", "{S:Ich} {V:bin} krank, {C:trotzdem} {V:gehe} {S:ich} {A:zur Arbeit}.", "{C:Trotz} des Regens {V:gehen} {S:wir} spazieren."],
      mongolianClues: ["**-сан ч / хэдий ч** (on the condition) → obwohl.", "**гэсэн ч / тэгсэн ч** (on the result) → trotzdem.", "**…-ыг үл харгалзан** + noun → trotz + Genitiv."],
    },
  },
  {
    id: "t26-time",
    order: 26,
    level: 2,
    title: "Time: als / wenn / während / bevor / nachdem",
    mongolianTitle: "Цаг хугацааны холбоос",
    card: {
      fixed: [
        "**als** = once in the past (Als ich Kind war…).",
        "**wenn** = every time, or present/future (Wenn ich Zeit habe…).",
        "**während** = while (same time). **bevor** = before. **nachdem** = after.",
        "All are NS connectors: verb last.",
      ],
      changes: [
        "**nachdem**: NS one tense earlier. NS Plusquamperfekt + HS Präteritum; NS Perfekt + HS Präsens.",
        "**während + Genitiv** can also be a preposition: während des Unterrichts.",
      ],
      blueprints: ["{C:Als} {S:ich} Kind {F:war}, {V:wohnte} {S:ich} {A:auf dem Land}.", "{C:Wenn} {S:ich} Zeit {F:habe}, {V:lese} {S:ich}.", "{C:Nachdem} {S:er} {F:gegessen hatte}, {V:ging} {S:er} nach Hause."],
      mongolianClues: [
        "**-х үед / байхад** (past, once) → als. **-х бүрт / -вал/-вэл** → wenn.",
        "**-х зуур / -ын үеэр** → während. **-хаас өмнө** → bevor. **-сны дараа** → nachdem.",
      ],
    },
  },
  {
    id: "t27-indem",
    order: 27,
    level: 2,
    title: "indem / dadurch, dass",
    mongolianTitle: "Арга зам: indem",
    card: {
      fixed: [
        "**indem** = by doing (the method). NS, verb last.",
        "**dadurch, dass** = the same, with dadurch in the HS.",
        "Answers the question **Wie?** (How?).",
      ],
      changes: [
        "indem version: Man lernt Deutsch, **indem** man viel liest.",
        "dadurch version: Man lernt Deutsch **dadurch, dass** man viel liest.",
      ],
      blueprints: ["{S:Man} {V:lernt} Deutsch, {C:indem} {S:man} viel {F:liest}.", "{S:Ich} {V:spare} Geld {C:dadurch, dass} {S:ich} {A:zu Hause} {F:koche}."],
      mongolianClues: ["**-ж / -ч … замаар, -ж байж** (by doing) → indem.", "**ингэж …-аар** → dadurch, dass."],
    },
  },
  {
    id: "t28-zu-inf",
    order: 28,
    level: 2,
    title: "zu-Infinitiv",
    mongolianTitle: "zu-тай үйлийн үндэс",
    card: {
      fixed: [
        "**zu** right before the Infinitiv, at the end: Ich versuche, Deutsch **zu lernen**.",
        "Separable: zu goes inside: ab**zu**schaffen, auf**zu**stehen.",
        "Same subject in both halves → zu-Infinitiv, **no subject**.",
      ],
      changes: [
        "Different subject → dass + subject: Ich hoffe, **dass du** kommst.",
        "Never both: no sentence has dass and zu together.",
        "Triggers: versuchen, vergessen, anfangen, aufhören, Lust haben, Zeit haben, es ist wichtig/schwer.",
      ],
      blueprints: ["{S:Ich} {V:versuche}, jeden Tag Deutsch {F:zu lernen}.", "{S:Es} {V:ist} wichtig, früh {F:aufzustehen}.", "{S:Ich} {V:habe} keine Lust, {A:heute} {F:zu kochen}."],
      mongolianClues: ["**-хыг / -х** (infinitive) after оролдох, мартах, эхлэх, сонирхол … → zu + Infinitiv.", "**-х нь чухал** → es ist wichtig, … zu …"],
    },
  },
  {
    id: "t29-about",
    order: 29,
    level: 2,
    title: "\"It's about\": es geht um / handelt von",
    mongolianTitle: "…-ын тухай",
    card: {
      fixed: [
        "**es geht um + Akk**: In dem Film geht es **um** eine Liebe.",
        "**es handelt sich um + Akk**.",
        "**X handelt von + Dativ**: Der Film handelt **von** einer Liebe.",
        "geht/handelt in slot 2; **es** right behind it when something else is in slot 1.",
      ],
      changes: [
        "Noun after → **um** / **von**.",
        "Clause after → **darum, wie/dass** … (verb last) / **davon, wie/dass** …",
      ],
      blueprints: ["{A:In diesem Film} {V:geht} {S:es} um eine Liebe.", "{S:Es} {V:geht} darum, {C:wie} {S:man} Geld {F:spart}.", "{S:Das Buch} {V:handelt} von einem Kind."],
      mongolianClues: ["**…-ын тухай** + noun → um + Akk / von + Dativ.", "**хэрхэн / яаж …** → darum, wie. **…гэдгийн тухай** → darum, dass."],
    },
  },
  {
    id: "t30-gen-prep",
    order: 30,
    level: 2,
    title: "Genitiv prepositions",
    mongolianTitle: "Харьяалахын тийн ялгалтай угтвар үгс",
    card: {
      fixed: [
        "**wegen, trotz, während, statt, aufgrund, innerhalb, außerhalb** + Genitiv.",
        "des + noun -(e)s (der/das); der (die/plural).",
        "Followed by a noun, never a clause.",
      ],
      changes: [
        "Adjective in Genitiv → -en: wegen des schlechten Wetters.",
        "Spoken German often uses Dativ after wegen: that is not exam style.",
      ],
      blueprints: ["{C:Wegen} des Regens {V:bleiben} {S:wir} {A:zu Hause}.", "{S:Ich} {V:arbeite} {A:während der Woche}.", "{A:Innerhalb einer Woche} {V:muss} {S:ich} das {F:machen}."],
      mongolianClues: [
        "**-ын улмаас** → wegen / aufgrund. **-ыг үл харгалзан** → trotz. **-ын үеэр** → während.",
        "**-ын оронд** → statt. **…дотор** (time) → innerhalb. **…гадна** → außerhalb.",
      ],
    },
  },
  {
    id: "t31-adj-no-article",
    order: 31,
    level: 2,
    title: "Adjectives after ein + no article",
    mongolianTitle: "Тэмдэг нэр: ein-ий дараа ба гишүүнгүй",
    card: {
      fixed: [
        "No article → the adjective takes the **der-word ending**: gut**er** Wein, mit gut**em** Wein, gut**es** Bier.",
        "Plural, no article: Nom/Akk **-e** (heutig**e** Jugendlich**e**), Dativ **-en**, Genitiv **-er** (digital**er** Medien).",
        "After ein-words with an ending → **-en** except Nom/Akk die/das.",
      ],
      changes: [
        "Article present or not: die neuen Medien vs neue Medien.",
        "Case: viele junge Leute (N) / mit vielen jungen Leuten (D) / der Einfluss digitaler Medien (G).",
      ],
      blueprints: ["{S:Viele junge Leute} {V:nutzen} soziale Medien.", "{S:Der Einfluss digitaler Medien} {V:ist} groß.", "{S:Ich} {V:trinke} gern kalten Tee."],
      mongolianClues: ["Mongolian has no article: the German no-article ending shows the case on the adjective itself.", "**олон** → viele (no article, strong endings)."],
    },
  },
  {
    id: "t32-partizip1",
    order: 32,
    level: 2,
    title: "Partizip I",
    mongolianTitle: "Одоо цагийн нэр үйл (Partizip I)",
    card: {
      fixed: [
        "Infinitiv + **d**: schlafen → schlafen**d**.",
        "Before a noun → adjective ending: der schlafend**e** Hund.",
        "As an adverb → no ending: Er spricht **fließend** Deutsch.",
      ],
      changes: [
        "Ending follows the adjective table: ein schlafender Hund, mit dem schlafenden Hund.",
        "Common: fließend, spannend, wachsend, steigend, folgend.",
      ],
      blueprints: ["{S:Der schlafende Hund} {V:liegt} {A:auf dem Sofa}.", "{S:Sie} {V:spricht} fließend Deutsch."],
      mongolianClues: ["**-ж байгаа / -аа** before a noun (унтаж байгаа нохой) → Partizip I.", "**чөлөөтэй (ярих)** → fließend."],
    },
  },
  {
    id: "t33-es",
    order: 33,
    level: 2,
    title: "Impersonal es",
    mongolianTitle: "Эзэнгүй es",
    card: {
      fixed: [
        "Weather: **Es** regnet. Es schneit. Es ist kalt.",
        "Time: **Es** ist 8 Uhr. Es ist spät.",
        "**es gibt + Akk** = there is/are: Es gibt **einen** Park hier.",
        "Feeling: **Es geht mir gut** (person in Dativ).",
      ],
      changes: [
        "Something else in slot 1 → es moves behind the verb: Heute **regnet es**.",
        "es gibt never changes for plural: Es **gibt** viele Parks.",
      ],
      blueprints: ["{S:Es} {V:regnet}.", "{A:Hier} {V:gibt} {S:es} einen Park.", "{S:Es} {V:geht} mir gut."],
      mongolianClues: [
        "**бороо орж байна** → es regnet. **…цаг болж байна** → es ist … Uhr.",
        "**…байдаг / байна** (there is, no owner) → es gibt + Akk.",
        "**Миний бие сайн байна** → Es geht mir gut.",
      ],
    },
  },
  {
    id: "t34-dieser",
    order: 34,
    level: 2,
    title: "dieser",
    mongolianTitle: "dieser (энэ)",
    card: {
      fixed: [
        "dieser copies the **der/die/das** endings: der → dies**er**, den → dies**en**, dem → dies**em**, die → dies**e**, das → dies**es**.",
        "Adjective after dieser → same as after der: dieser neue Film.",
        "Same pattern: jeder, welcher, mancher.",
      ],
      changes: ["Case: dieser Film (N), diesen Film (A), in diesem Film (D), dieses Films (G)."],
      blueprints: ["{S:Dieser Film} {V:ist} spannend.", "{A:In diesem Film} {V:geht} {S:es} um Liebe.", "{S:Ich} {V:kenne} diese Frau."],
      mongolianClues: ["**энэ** → dieser/diese/dieses. **тэр** (that) → der/jener.", "**энэ … -ыг** → diesen/diese/dieses (Akk)."],
    },
  },
  {
    id: "t35-chunks",
    order: 35,
    level: 2,
    title: "Chunks: fixed pairs",
    mongolianTitle: "Тогтмол хослолууд",
    card: {
      fixed: [
        "Noun-verb pairs: **Maßnahmen ergreifen**, **eine Entscheidung treffen**, **eine Frage stellen**, **eine Rolle spielen**, **Bescheid sagen**, **Angst haben**, **Zeit haben**, **einen Ausflug machen**.",
        "Preposition pairs: **Einfluss auf + Akk**, **sich entscheiden für + Akk**, **warten auf + Akk**, **sich freuen auf + Akk**, **schützen vor + Dat**, **investieren in + Akk**, **profitieren von + Dat**, **sich auswirken auf + Akk**.",
      ],
      changes: ["The verb is conjugated and moves (slot 2 / end); the noun and preposition never change.", "Case after the preposition is fixed by the pair, not by Wo/Wohin."],
      blueprints: ["{S:Die Regierung} {V:muss} Maßnahmen {F:ergreifen}.", "{S:Ich} {V:freue} mich auf das Wochenende.", "{S:Das Handy} {V:hat} einen großen Einfluss auf Kinder."],
      mongolianClues: [
        "**шийдвэр гаргах** → eine Entscheidung **treffen** (not machen).",
        "**асуулт асуух** → eine Frage **stellen**. **арга хэмжээ авах** → Maßnahmen **ergreifen**.",
        "**…-д нөлөөлөх** → Einfluss auf + Akk. **…-аас хамгаалах** → schützen vor + Dat.",
      ],
    },
  },
];

export const TOPIC_BY_ID: Record<string, SeedTopic> = Object.fromEntries(SEED_TOPICS.map((t) => [t.id, t]));
