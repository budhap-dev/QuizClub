# Phase 3: presenter stage

**Goal:** give the big screen a clearer frame: a top bar with segmented progress, larger option tiles with letter badges, a clearer reveal, and a footer with team scores and controls.

**Files:** `src/features/presenter/Stage.tsx` (407 lines; grep for the top bar near line 278 and the controls near line 353) and `src/features/presenter/QuestionView.tsx` (454 lines; grep for `tileStyle`, `AnswerPanel` and `WrongMark`). Optionally `Scoreboard.tsx` and `components/TimerRing.tsx`, for styling only.

**Mockup:** `Stage-Desktop.dc.html` sections `Top bar`, `Question` and `Scoreboard + controls`.

## Build

1. **Top bar:** replaces the 1px brand progress line and the current header row.
   - Left: `Logo` at 36px, the quiz title (Outfit 18px) and "Area · Level" (`text-fg/65`).
   - Centre (`max-w-[560px] flex-1`): "Question n of N" and the points value, over `SegmentedProgress`.
   - Right: `TimerRing` (keep its logic) at 56px, plus 44px icon buttons for fullscreen and exit.
   - Keep the "Host connected" pill, the Preview chip and the theme button, styled to match.
2. **Question type chip:** above the question, a tinted cyan pill with an icon showing the question type ("Multiple choice", "True or false" and so on).
3. **Question text:** keep the existing viewport-fitting clamp (PR #7: no scrolling on md+), with the maximum raised to about 64px, `text-balance`.
4. **Option tiles:** `grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4`, `min-h-[92px] rounded-[18px] border-2`.
   - Each tile has a letter badge (`w-[52px] h-[52px] rounded-[14px]`, `tint(optionColor, 24)` with the letter in the option colour, Outfit 24px bold) and the text in Outfit at about 30px, both clamped like today.
   - On reveal, the correct tile is solid `mint` with a `fg` border and `text-on-accent`; its badge flips to the dark colour; a 44px circle with a check sits at the end of the tile.
   - Other tiles drop to `opacity-60`. A wrong pick keeps today's red style and shake.
5. **Explanation (`AnswerPanel`):** `tint(sun, 10, 36)`, `rounded-[14px]`, a `Lightbulb` icon and 18px text, `max-w-[760px]`. Keep the right/wrong verdict tones.
6. **Footer:** `border-t border-fg/8 pt-5`, `flex-wrap`.
   - Team cards (`flex-[1_1_160px]`, 64px tall): rank ("1st"), name, and score in Outfit 26px. The leader gets `tint(teamColor)`; the others get `bg-fg/4`. Show a `+N` mint badge on teams awarded this question.
   - On the right: secondary "Back" and primary "Next question", both 52px tall.
   - Keep every current control (reveal, scoreboard, award) and every keyboard shortcut, restyled into this row.

**Keep:** all question types (MCQ, true/false, timed, closest number, put in order, name them all, picture and audio), the scoreboard and podium phases, the host link and the mobile layout (on `<md` the stage scrolls; that's fine).

**Done when:** `/preview/<id>` shows each question type correctly before and after reveal at 1440×900 and 390px, in both themes. Use a bank quiz copied to the library for the types it covers, plus a manual quiz for the rest.
