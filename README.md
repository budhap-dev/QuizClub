# 🎉 QuizClub

A colourful, animated quiz-night app built for the big screen. Present quizzes to a room, keep score for teams, and fill the gaps with party games.

## Features

- **Presenter mode** — full-screen stage with animated questions, countdown timer, reveal, live scoreboard and a confetti podium. Keyboard shortcuts: `→` next, `←` back, `Space` reveal, `T` timer, `S` scoreboard, `F` fullscreen, `H` quiz-master panel.
- **Teams & scoring** — add teams or individual players, tap who got it right after each reveal, or use the +/− panel with undo.
- **AI quiz generator** — describe a topic, pick difficulty, audience and question types; Claude builds the quiz server-side.
- **Manual quiz maker** — slides, multiple choice, true/false and timed questions with images, points, timers and host notes. Drag to reorder, preview before saving.
- **Built-in library** — Flag Guesser, Logo Quiz, Mental Maths (generated fresh each time), General Knowledge, Geography, Science, Literature, Movies, Sports, Music, History.
- **Party games** — Cows & Bulls, Hangman, Wordle, Word Scramble, Emoji Riddles, Memory Match. Award points to teams from any game.
- **Themes** — seven colour themes (Neon Night, Deep Ocean, Sunset, Forest, Retro Arcade, Midnight Mono and the light Candy Pop), switchable from the 🎨 button in the nav or on stage. Palettes live in `src/index.css`; the picker metadata in `src/app/theme.ts`.
- Fully responsive: presenter on a laptop/TV, quiz-master controls work from a phone.

## Stack

React 18 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand · Vercel serverless (`/api`) · Claude API

## Getting started

```bash
npm install
cp .env.example .env      # add ANTHROPIC_API_KEY for the AI generator
npm run dev               # SPA on http://localhost:5173
```

To run the AI endpoint locally, use the Vercel CLI in a second terminal (`vercel dev` serves `/api` on port 3000 and Vite proxies to it). Without it, the AI screen offers a built-in-library fallback.

## Deploying (Vercel)

1. Import the repo in Vercel — the framework preset is detected automatically.
2. Add environment variables: `ANTHROPIC_API_KEY` (required), optionally `ANTHROPIC_MODEL` and `AI_ACCESS_CODE`.
3. Deploy. The API key never reaches the browser.

## Project layout

```
api/                    Vercel serverless functions (AI generation)
src/
  app/                  routes + layout
  components/           shared UI (Button, Card, Modal, TimerRing, TeamChip…)
  features/
    ai/                 AI generator screen + client
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

- Google sign-in (replaces the optional access code for the AI generator)
- Shared/cloud quiz library
