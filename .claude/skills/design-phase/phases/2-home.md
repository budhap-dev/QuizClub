# Phase 2: home dashboard

**Goal:** turn Home from a marketing hero plus tiles into a dashboard for quiz night.

**Files:** `src/features/home/Home.tsx` (rewrite) and `src/features/bank/MixSheet.tsx` (add `count` to the `initial` prop). Read the store selectors in `store/sessionStore.ts` and `store/quizStore.ts`, `AREAS` in `features/bank/bank.ts`, `components/TeamChip.tsx`, and `openHostScreen` in `features/presenter/hostLink.ts`. To present a quiz, copy the pattern in `QuizBank.tsx` (`start(q); navigate('/play/stage')`).

**Mockups:** `Home-Desktop.dc.html` sections `Header`, `Resume`, `Mini stage preview`, `Quick start`, `Create & play`, `Bank areas` and `Library`; `Home-Mobile.dc.html` for the mobile order and sizes.

## Build (top to bottom; mobile uses the same order)

1. **Header:** eyebrow "Welcome back" in `purple`; h1 "What are we playing tonight?". From `lg` up, on the right: a 320px search field that submits to `/quizzes/bank?q=<text>`, and a secondary "New quiz" button (`Plus`) linking to `/create/manual`. Mobile shows the h1 only, since search is in the top bar.
2. **Hero row:** `flex flex-wrap gap-5`.
   - **Resume card** (`flex-[2_1_560px]`, `tint(purple)`), shown when `session && activeQuiz` exist:
     - a mint dot with "In progress", the quiz title in Outfit at 28px, and "Area · Level · Question n of N" (skip any part that's missing);
     - `SegmentedProgress`, then `TeamChip`s with their scores;
     - buttons: primary "Resume on stage" linking to `/play/stage`, and secondary "Open host screen" calling `openHostScreen()`.
     - On the right (desktop only, `flex-[1_1_240px]`), a non-interactive `aria-hidden` mini stage on an `ink` panel: "Q n · area", the question text at 18px, and for multiple-choice questions a 2×2 grid of options tinted in `OPTION_COLORS`.
     - With no session, the same slot shows a "Start a quiz night" card with a "Pick a quiz" button linking to `/play`.
   - **Quick start card** (`flex-[1_1_280px]`, `tint(cyan)`): a `Shuffle` `IconBadge`, "Random bank quiz", and "Mix questions from any of the {AREAS.length} areas and go straight to the stage." Below that, a 10/20/30 segmented group (selected is solid `cyan` with `text-on-accent`). "Shuffle and present" opens `MixSheet` with `initial={{ count }}`, and its `onPresent` starts the quiz and goes to the stage.
3. **Create and play:** four tiles in `grid-cols-[repeat(auto-fit,minmax(220px,1fr))]`: Present a quiz (`/play`, pink), Quiz maker (`/create/manual`, cyan), Party games (`/games`, lime) and Riddles and puzzles (`/puzzles`, orange). Each has an `IconBadge` (40px), a title and one line of text. On mobile the grid is 2×2 with titles only.
4. **Browse the quiz bank:** a "See all {AREAS.length} areas" link. Show six `AREAS` (general, geography, history, science, movies, music), each linking to `/quizzes/bank?area=<id>` with an icon (Sparkles, Globe, Landmark, FlaskConical, Film, Music), `tint(area.color, 10, 32)` and the label. Show no counts, so Home doesn't load the bank. Desktop uses `grid auto-fit minmax(150px)`; mobile uses a horizontal scroller (`overflow-x-auto -mx-4 px-4`, 128px cards).
5. **Your library:** the three most recently updated saved quizzes (`updatedAt`), with "Open library" linking to `/quizzes`.
   - Desktop: a table in a `border-fg/10 rounded-2xl` box with `overflow-x-auto`. Columns are Quiz (a lettered 36px badge plus the title), Questions, Last edited (relative time), and a tinted-pink Present button.
   - Mobile: a list with a 44px icon-only Present button.
   - With no quizzes: one row saying "No saved quizzes yet" with a "Create one" link.

**Keep:** the stagger entrance animation, which should stay subtle.

**Done when:** `/` works with and without a session in progress and with and without saved quizzes, at 390px and 1440px, in both themes.
