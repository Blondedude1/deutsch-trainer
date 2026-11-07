# Deutsch Trainer

A personal German drill app for one learner. Mongolian prompt → German answer → strict grading with a one-line reason for each fix. It tracks mistake patterns and progress.

Next.js (App Router) + TypeScript + Tailwind. All data stays on the device in IndexedDB (Dexie). AI calls go through server routes only.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: or paste the key in the app (Stats → API key)
npm run dev                  # http://localhost:3000
```

## Grading acceptance checks

With the app running (locally or deployed):

```bash
node scripts/acceptance.mjs http://localhost:3000
```

## Where things live

| What | Where |
|---|---|
| Model id, thresholds | `lib/config.ts` |
| AI prompts (tune here) | `lib/prompts/*.ts` |
| Topic cards (35 topics) | `lib/seed/topics.ts` |
| Mistake tags | `lib/tags.ts` |
| Output schemas (zod) | `lib/schemas.ts` |
| Streak, sealing, leaks | `lib/logic/stats.ts` |
| Active-time tracking | `lib/logic/activeTime.ts` |
| Local database | `lib/db.ts` |
| API routes | `app/api/generate`, `app/api/grade` |

## Study (Anki-style)

- Cards live in IndexedDB (`cards` table) and are scheduled with FSRS (`lib/srs/`), Anki's default algorithm.
- Built-in decks: 60 irregular verbs, 16 fixed pairs, 28 grammar rule cards (`lib/seed/decks.ts`). Textbook sentence and noun decks are added per lesson.
- The grader sets the low ratings: wrong → Again, minor → Hard. Only a clean answer lets you pick Good or Easy. Rule cards are self-rated.
- Verb, pair and noun cards are checked on the device (free). Sentence cards use the textbook answer first, then the AI grader if the answer differs.

## Rules worth knowing

- **Counted** = the first, unpeeked attempt on an item. Only counted attempts move the streak and sealing. A peek resets the streak.
- **minor** (only capitalization/comma fixes) counts as a pass. Umlaut mistakes count as wrong.
- **Sealed** = 3 separate days with at least 10 counted level-3+ items at 90 % or better.
- **Locked** topics are ones class hasn't covered yet. Unlock them from the topic card or with "+ Add today's class topic". Drills only use grammar from unlocked topics.
- **Bad item? Remove it** deletes a broken generated item and every attempt on it.
