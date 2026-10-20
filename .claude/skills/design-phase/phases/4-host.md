# Phase 4: host screen

**Goal:** restyle `/play/host` as a single-column remote. It opens as a 560×900 popup (`openHostScreen`), so design for a narrow window.

**Scope:** layout only. The host link is a BroadcastChannel, which only connects windows in the same browser. Don't promise or build control from another device.

**Files:** `src/features/presenter/HostScreen.tsx` and `src/features/presenter/HostPanels.tsx` (`AnswerCard`, `AwardChip`, `ScorePanel`). `HostDrawer.tsx` only if it shares those panels.

**Mockup:** `Stage-Mobile.dc.html` sections `Question preview`, `Stage controls`, `Scoring` and `Bottom controls`, plus the header above them.

## Build

1. **Frame:** `max-w-md mx-auto px-4`, with the page padded at the bottom to clear a fixed bottom bar. It stays a single column at every width.
2. **Header:**
   - a 44px back or close button;
   - "Host screen" in Outfit 17px over the quiz title in 12px `text-fg/65`;
   - a connection pill on the right: `tint(mint)` with a dot and "On stage" when connected; `bg-fg/6` with "Stage not open" otherwise, keeping today's message and the way to reopen the stage.
3. **Progress:** "Question n of N" and points, over `SegmentedProgress`.
4. **Question card** (`bg-fg/5 border-fg/10 rounded-[18px] p-[18px]`):
   - the question in Outfit 22px;
   - choices in a 2-column grid of 40px rows. The correct choice is solid `mint` with `text-on-accent` and a check, always visible to the host; the others are `bg-fg/5 text-fg/70`.
   - the note, with a `Lightbulb` icon in `sun`.
   - Other question types show the answer line `AnswerCard` produces today.
5. **Controls grid** (2 columns, 64px cards):
   - timer: `tint(sun)` with a 40px ring, the seconds, "Pause timer"/"Start timer" and "of Ns";
   - reveal toggle: `tint(mint)` with an `Eye` badge showing "Revealed / Tap to hide", or "Reveal answer" when hidden, with `aria-pressed`.
   - Keep the scoreboard and podium actions as a secondary row underneath.
6. **Award points:** one row per team. Each row has a colour dot, the name, a 44px `−` button, the score in Outfit 22px, and a 44px `+` button. The leader's `+` is solid pink; the others are `bg-fg/14`. The leading row gets `tint(pink)`. Reuse the current award logic and labels (`awardPrompt`).
7. **Up next:** keep the existing preview of the next question as a small muted card below the scores.
8. **Bottom bar:** `fixed inset-x-0 bottom-0` on `ink-soft/96` with `border-t`, inner `max-w-md mx-auto`. It holds a 56px Previous button and a full-width primary "Next question" button (54px).

**Done when:** with the stage open in one window and `/play/host` in a 560×900 popup, every control still drives the stage. Also check the disconnected state and a true/false question, in both themes.
