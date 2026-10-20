# Phase 1: app shell and shared primitives

**Goal:** from `lg` (1024px) up, a fixed sidebar replaces the top bar. Below `lg`, a top bar plus a bottom tab bar replace the draggable floating menu. This phase also adds the primitives from `spec.md` that phases 2–5 reuse.

**Files:** `src/app/Layout.tsx`, `src/app/nav.ts`, `src/app/FloatingMenu.tsx` (delete), `src/utils/index.ts`, `src/components/index.ts`, new `src/components/IconBadge.tsx` and `src/components/SegmentedProgress.tsx`. Read `ThemeButton.tsx`, `ThemePicker.tsx`, `Logo.tsx` and `features/vault/VaultBadge.tsx` only to reuse them.

**Mockups:** `Home-Desktop.dc.html` section `Sidebar`; `Home-Mobile.dc.html` sections `Top bar` and `Bottom tab bar`.

## Build

1. **Primitives:** `tint()`, `IconBadge` and `SegmentedProgress`, exactly as `spec.md` describes. Export them.
2. **Sidebar (`lg+`):** `w-60 shrink-0 sticky top-0 h-dvh` on `ink-soft`, `border-r border-fg/8`, `px-4 py-6`, `flex-col gap-7`. From top to bottom:
   - the brand (the existing `Brand`, with the logo at 34px);
   - a primary "Present a quiz" button (`MonitorPlay`) linking to `/play`, 44px tall and full width;
   - the `NAV` list. Each row is 44px tall with a 28px `IconBadge` in the item's colour and a `text-sm` label. The active row gets `bg-fg/9 font-semibold text-fg` and `aria-current`; inactive rows are `text-fg/72`. Keep the `motion` `layoutId` pill.
   - pinned to the bottom (`mt-auto`): a theme button 48px tall showing three overlapping 14px dots from the current theme's `preview`, the theme name and a muted "Theme" label, which opens the existing theme picker; then a row with the sound toggle (icon and "Sound on"/"Muted") and `VaultBadge`.
3. **Content (`lg+`):** `flex-1 min-w-0`. The `<main>` keeps its motion and changes to `max-w-[1120px] mx-auto px-10 pt-8 pb-16`.
4. **Mobile and tablet (`<lg`):**
   - Top bar `px-4 pt-3.5 pb-1.5`: the brand on the left; on the right, two 44px icon buttons with `bg-fg/6 border-fg/10 rounded-xl`. Search links to `/quizzes/bank`; settings (`SlidersHorizontal`) links to `/settings`.
   - Bottom tab bar: `fixed inset-x-0 bottom-0 z-40` on `ink-soft/96` with `border-t border-fg/10`. Padding is `pt-2 px-3 pb-[max(env(safe-area-inset-bottom),14px)]`. It has five items: Home, Quizzes, **Present**, Games, Puzzles. Each item is an icon (22px) over a label (11px), at least 48px tall. Active items are `text-fg font-semibold` with the icon in the item's colour; inactive items are `text-fg/65`. Present is a raised `w-[54px] h-[54px] rounded-[18px] bg-pink text-on-accent` tile with `-mt-[26px]`, a 4px `ink-soft` border and the label underneath. It links to `/play` and is active on `/play*`.
   - Main gets `pb-28` so content clears the tab bar.
5. Delete `FloatingMenu.tsx` and its imports. Theme, sound and sync on phones now live on `/settings`; check the page already has all three (it does: ThemePicker, the mute checkbox, VaultCard). Remove `localStorage` key `quizclub.fab` handling with the file.

**Keep:** the stage and host routes stay outside `Layout`, so they are untouched. Also keep the theme meta colour, the scroll lock used by modals and the reduced-motion behaviour.

**Done when:** `/`, `/quizzes`, `/games` and `/settings` look right at 390px, 820px and 1440px in Neon Night and Daylight. The active state follows the route, nothing is hidden under the tab bar, and Tab moves through the sidebar in order.
