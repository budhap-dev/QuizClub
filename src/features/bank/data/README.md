# Quiz bank data

One JSON file per area (`<area>.json`), loaded lazily by `src/features/bank/bank.ts`.

```jsonc
{
  "area": "geography",                 // must match an id in AREAS (bank.ts)
  "quizzes": [
    {
      "slug": "world-capitals",        // unique within the file, kebab-case
      "title": "World Capitals",
      "emoji": "🏙️",
      "difficulty": "easy",            // easy | medium | hard
      "tags": ["capitals", "countries"],
      "description": "One sentence shown on the card.",
      "questions": [
        { "type": "mcq", "q": "…?", "options": ["A", "B", "C", "D"], "answer": 2, "note": "Fun fact for the host." },
        { "type": "tf", "q": "…", "answer": false, "note": "…" },
        { "type": "timed", "q": "…?", "answer": "Short answer", "note": "…" }
      ]
    }
  ]
}
```

Run `npm run check:bank` after editing.

Rules: 10 questions per quiz (about 6 mcq, 2 tf, 2 timed); question text ≤ 140 characters; exactly 4 options of ≤ 40 characters; `answer` is the 0-based index of the correct option (options are shuffled when a quiz is built); timed answers ≤ 30 characters; notes are one sentence. Only stable, well-established facts.
