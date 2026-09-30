# 🎉 QuizClub

A colourful quiz app for classrooms, offices and parties, with a clean, presentable look, built for the big screen. Present quizzes to a room, keep score for teams, and fill the gaps with party games.

## Features

- **Presenter mode** — full-screen stage with animated questions, countdown timer, reveal, live scoreboard and a confetti podium. Keyboard shortcuts: `→` next, `←` back, `Space` reveal, `T` timer, `S` scoreboard, `F` fullscreen, `H` quiz-master panel.
- **Teams & scoring** — add teams or individual players, tap who got it right after each reveal, or use the +/− panel with undo.
- **Manual quiz maker** — slides, multiple choice, true/false and timed questions with images, points, timers and host notes. Drag to reorder, preview before saving.
- **Quiz bank** — 72 ready-made quizzes (720 questions) across 18 areas (general knowledge, geography, India, history, science, space, nature, literature, words, maths, movies, music, sports, technology, food, mythology, art, kids). Search titles, tags and question text, filter by area and level, view every answer, then present as-is or copy to My Quizzes to edit. Also pickable from Play setup.
- **Levels** — every quiz can be Easy, Medium or Hard. Bank quizzes come rated, and you set it for your own in the builder. My Quizzes, the bank and Play setup all filter by level.
- **Built-in library** — Flag Guesser, Logo Quiz, Mental Maths (generated fresh each time), General Knowledge, Geography, Science, Literature, Movies, Sports, Music, History.
- **Party games** — Cows & Bulls, Hangman, Wordle, Word Scramble, Emoji Riddles, Memory Match. Award points to teams from any game.
- **Cloud vault** — sync your quiz library across devices with no account: pick a passphrase in Settings, and the library is encrypted in the browser (PBKDF2 + AES-GCM) and stored as ciphertext in Upstash Redis via `api/vault.ts`. Enter the same passphrase on another device to pull it down. Deletions carry across (tombstones), the newest edit wins, and the server can't read anything.
- **Themes** — twelve colour themes: six dark (Neon Night, Deep Ocean, Sunset, Forest, Retro Arcade, Midnight Mono) and six light (Candy Pop, Daylight, Coastal, Sunrise, Lilac, Meadow), switchable from the palette button in the nav or on stage. Palettes live in `src/index.css`; the picker metadata in `src/app/theme.ts`.
- Fully responsive: presenter on a laptop/TV, quiz-master controls work from a phone.

## Stack

React 18 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide icons · Zustand · Vercel serverless (`/api`)

## Getting started

```bash
npm install
cp .env.example .env      # cloud-vault settings, only needed to run /api locally
npm run dev               # SPA on http://localhost:5173
```

To run the cloud-vault API locally, use the Vercel CLI in a second terminal (`vercel dev` serves `/api` on port 3000 and Vite proxies to it). Everything else works without it.

## Deploying (Vercel)

1. Import the repo in Vercel — the framework preset is detected automatically.
2. **Storage → Create → Upstash Redis** (free tier) and connect it to the project; this adds `KV_REST_API_URL` / `KV_REST_API_TOKEN` for the cloud vault.
3. Optional: `VAULT_RATE_LIMIT` (vault requests per IP per minute, default 60).
4. Deploy. Secrets never reach the browser.
5. On the live site: Settings → Cloud vault → choose a passphrase → your quizzes upload. Repeat with the same passphrase on any other device.

Local development with the API: `npm i -g vercel`, `vercel link`, `vercel env pull .env`, then `vercel dev` in one terminal and `npm run dev` in another (Vite proxies `/api` to it).

## Adding to the quiz bank

Each area is a JSON file in `src/features/bank/data/` (format in that folder's README). Add or edit quizzes there, then run `npm run check:bank` to validate structure, lengths, answer indexes and duplicate questions. Each area aims for one easy, two medium and one hard quiz (the kids area is all easy); hard quizzes are worth 15 points a question, the rest 10.

## Share card and icons

Links to the site show a preview card (`public/og-image.png`, 1200×630) through the Open Graph and Twitter tags in `index.html`. The card and the app icons are HTML in `scripts/share-assets/`; after editing them, run `node scripts/share-assets/render.mjs` (needs Google Chrome) to re-render the PNGs in `public/`. The tags point at the production address, so update them if the domain changes. Chat apps cache previews: WhatsApp and Slack can take a while to show a new card for a link they have already seen.

## Project layout

```
api/                    Vercel serverless functions (AI generation)
src/
  app/                  routes + layout
  components/           shared UI (Button, Card, Modal, TimerRing, TeamChip…)
  features/
    bank/               quiz bank: data/*.json (one file per area), loader, search, page
    builder/            manual quiz maker
    games/              party games
    home/               landing page
    library/            built-in question packs + My Quizzes
    presenter/          setup, stage, scoreboard, podium, host drawer
    settings/
  store/                zustand stores (quizzes, session/teams, settings)
  types/
  utils/                helpers + synthesised sound effects
```

## Roadmap

- Shared/cloud quiz library
