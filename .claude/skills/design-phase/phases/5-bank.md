# Phase 5: quizzes and quiz bank

**Goal:** a cleaner browsing screen with a counted header, underline tabs, a single toolbar, colour-dot area chips, and cards with a coloured header band.

**Files:** `src/features/bank/QuizBank.tsx` (281 lines; grep for the section you need), `src/features/library/QuizzesTabs.tsx`, the header of `src/features/library/MyQuizzes.tsx` so the two tabs match, and `src/components/Level.tsx` (a `size` prop on `LevelBars`, plus restyling `LevelSelect`).

**Mockups:** `Bank-Desktop.dc.html` sections `Content`, `Tabs`, `Toolbar`, `Area chips` and `Results`; `Bank-Mobile.dc.html` for the stacked layout. The mockup's third "Picture packs" tab is **out of scope**: keep two tabs.

## Build

1. **Header (shared by both tabs):** h1 "Quizzes" and "{n} ready-made quizzes and {m} questions across {AREAS.length} areas", computed from `useBank()` (show no subtitle while loading). On the right, "Mix a random quiz" as a `tint(cyan)` button with `Shuffle`, opening the existing `MixSheet`. On mobile, a 44px icon button next to a "New quiz" `Plus` button.
2. **Tabs:**
   - `md+`: underline tabs. Each is 44px tall with `px-4`; the active tab gets a 2px `cyan` bottom border and `font-semibold text-fg`; the row has `border-b border-fg/10`.
   - `<md`: a full-width segmented control (`p-1 rounded-xl bg-fg/6`, active `bg-fg/14`).
   - Keep `NavLink` routing.
3. **Toolbar:** a search field (`flex-[1_1_320px]`, 46px, placeholder "Search by topic, e.g. cricket, planets, Bollywood") and `LevelSelect` restyled to `p-1 rounded-xl`, with 36px items and an active `bg-fg/14`. On mobile, the level control becomes a compact "All levels" filter button that opens the same options; reuse the existing sheet pattern.
4. **Area chips:** "All areas" plus every area that has quizzes.
   - Each chip is 36px tall (40px on mobile), `rounded-full`, with an 8px colour dot and the label.
   - Inactive chips are `bg-fg/4 border-fg/12`. The active chip uses `tint(area.color, 16, 50)` ("All" uses `fg`). Use `aria-pressed`.
   - `md+` wraps the chips; `<md` shows one horizontal scrolling row (`-mx-4 px-4`). That row replaces the phone area-picker sheet from PR #19: remove the sheet if nothing else uses it.
   - Below the chips: "Showing x of y", or "Area · n quizzes" when an area is selected.
5. **Cards:** `grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4`, each `rounded-[18px] bg-fg/4 border-fg/10 overflow-hidden`.
   - Header band: 44px, `tint(area.color, 12, 30)` with only a bottom border. It holds the area label (12px uppercase, in the area colour) and `LevelBars size="lg"` (6px wide bars, 8/12/16 tall).
   - Body: `p-[16px_18px_18px]` with the title (Outfit 18px), a description that is `line-clamp-2` at 13px `text-fg/70`, and a footer.
   - Footer: "Level · N questions", a 40px Preview icon button (opens `BankQuizSheet`) and a primary "Present" button.
   - Mobile: one column; Preview and Present become two equal 44px buttons.
6. Keep search, area and level in the URL (`q`, `area`, `level`) exactly as today. Home and the top-bar search already link here with them.

**Done when:** `/quizzes/bank` with no filter, with `?area=geography`, and with `?q=cricket&level=easy`, plus `/quizzes`, all look right at 390px and 1440px in both themes, and Present, Preview, Copy and Mix still work.
