# Design upgrade: shared rules

The mockups are drawn in Neon Night. The app has 12 themes, so **never put a hex value in TSX**. Use theme tokens, Tailwind classes such as `bg-pink` and `text-fg/65`, or `var(--color-*)`.

## Turning mockup colours into tokens

| Mockup | Token |
|---|---|
| `#12082e`, `#0c0522` | `ink` (page; the stage uses ink too) |
| `#170c3d`, `#1c1150` | `ink-soft` (sidebar, tab bar) |
| `#ffffff`, `rgba(255,255,255,a)` | `fg`, `fg/<a×100>`, e.g. 0.65 → `text-fg/65`, 0.10 → `border-fg/10` |
| `#ff4d8d`, `#ff7aa8`, `#ffb3cc` | `pink` |
| `#a855f7`, `#c084fc`, `#e9d5ff` | `purple` |
| `#22d3ee`, `#67e8f9`, `#a5f3fc` | `cyan` |
| `#a3e635`, `#bef264` | `lime` |
| `#fb923c` | `orange` |
| `#fbbf24` | `sun` |
| `#34d399`, `#6ee7b7` | `mint` |
| `#f43f5e`, `#fb7185` | `red` |
| `#a78bfa` | `violet` |
| `#052e16`, `#0c0522` text on a solid accent | `on-accent` |

The lighter tints in the mockup exist only to make text readable on a dark background. Use the base accent instead: light themes already ship darker accents.

## Patterns (phase 1 builds the primitives; later phases reuse them)

- **`tint(color, bg = 12, border = 40)`** in `src/utils/index.ts` returns `{ background: color-mix(in srgb, <color> <bg>%, transparent), borderColor: … <border>% }`. Use it for every tinted card, chip and badge. Mockup `rgba(c,.10–.16)` is the background %; `rgba(c,.32–.45)` is the border %.
- **`<IconBadge icon color size>`** (`src/components/IconBadge.tsx`): a square, `rounded-lg` at 28px or `rounded-xl` at 36–44px, with `tint(color, 18)` and no border. The Lucide icon is drawn in `color` at about half the badge size.
- **`<SegmentedProgress total current>`** (`src/components/SegmentedProgress.tsx`): equal bars, `h-1.5` (`h-[5px]` on mobile), `gap-1`. Done bars are `purple`, the current bar is `pink`, the rest are `fg/14`. Above 20 questions it becomes one continuous bar. It needs an `aria-label`, e.g. "Question 4 of 10".
- **Buttons**: primary is solid `bg-pink text-on-accent`; secondary is `bg-fg/8 border border-fg/14`; tinted uses `tint()`. Height is 44px (`h-11`) everywhere touch matters. Icon-only buttons need an `aria-label`. Extend the existing `Button` component rather than adding a new one.
- **Surfaces**: plain cards are `bg-fg/4 border border-fg/10 rounded-2xl`. Hero cards use `tint(accent)` with `rounded-[20px]`.
- **Section header**: an `h2` at `text-lg font-semibold`, with an optional "See all" link on the right in the `text-sm` link colour.
- **Eyebrow label**: `text-xs font-semibold uppercase tracking-[0.06em]` in an accent colour.

## Type and spacing

- Outfit (`font-display`) for h1–h3, numbers and option letters; Inter for everything else.
- Page h1 is `text-[40px]` on desktop and `text-[28px]` on mobile, `leading-tight`. Card titles are 15–18px; body text is 13–14px at `text-fg/65`–`/70`.
- Desktop content is `max-w-[1120px] mx-auto px-10 py-8`. Mobile is `px-4`. Sections sit 26–36px apart.
- Grids should wrap, never squeeze: `grid-cols-[repeat(auto-fit,minmax(220px,1fr))]` and similar.

## Icons (lucide-react)

Home, Library, Play, Gamepad2, Puzzle, SlidersHorizontal (settings), MonitorPlay, PenLine, Plus, Search, Shuffle, Sparkles, Globe, Landmark, FlaskConical, Film, Music, Lightbulb, Eye, Maximize, X, ChevronLeft, ChevronRight, Minus, Check, Filter, Volume2, VolumeX.

## Never

- No new dependencies. No changes to stores, data files or routes unless the brief says so.
- No gradients other than the existing `bg-brand` and `.text-gradient`, which stay on the wordmark and logo. No emoji as UI icons. No bounce or scale-up on hover; a 2px lift or a colour change is the limit.
- `prefers-reduced-motion` must still work, and all 12 themes must stay legible (`text-on-accent` on solid accents).
