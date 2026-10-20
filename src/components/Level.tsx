import type { Difficulty } from '@/types'
import { cn } from '@/utils'

export const LEVELS: Difficulty[] = ['easy', 'medium', 'hard']
export const LEVEL_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
export const LEVEL_COLOR: Record<Difficulty, string> = { easy: 'var(--color-mint)', medium: 'var(--color-sun)', hard: 'var(--color-red)' }

const BARS = {
  md: { heights: [5, 8, 11], width: 3, gap: 2, radius: 1 },
  // Quiz card header bands.
  lg: { heights: [8, 12, 16], width: 6, gap: 3, radius: 2 },
}

/** One, two or three rising bars — readable at a glance and without relying on colour alone. */
export function LevelBars({ level, size = 'md', className }: { level: Difficulty; size?: keyof typeof BARS; className?: string }) {
  const filled = LEVELS.indexOf(level) + 1
  const { heights, width, gap, radius } = BARS[size]
  return (
    <span className={cn('inline-flex items-end', className)} style={{ gap, height: heights[2] }} aria-hidden>
      {heights.map((h, i) => (
        <span
          key={h}
          style={{ width, height: h, borderRadius: radius, background: i < filled ? LEVEL_COLOR[level] : 'color-mix(in srgb, var(--color-fg) 20%, transparent)' }}
        />
      ))}
    </span>
  )
}

/** Small chip naming a quiz's level. */
export function LevelBadge({ level, className }: { level: Difficulty; className?: string }) {
  return (
    <span className={cn('chip', className)} style={{ color: LEVEL_COLOR[level] }} title={`${LEVEL_LABEL[level]} level`}>
      <LevelBars level={level} />
      {LEVEL_LABEL[level]}
    </span>
  )
}

interface LevelSelectProps {
  value?: Difficulty
  onChange: (level: Difficulty | undefined) => void
  /** Label for the "no level" option: "All levels" when filtering, "Not set" when choosing. */
  noneLabel: string
  /** Shorter label used on phones, where four options share one row. */
  noneShort?: string
  /** Optional counts shown beside each level (filters). */
  counts?: Partial<Record<Difficulty | 'all', number>>
  label: string
  className?: string
}

/** Segmented control for picking a level, or none. Used both to filter lists and to set a quiz's level. */
export function LevelSelect({ value, onChange, noneLabel, noneShort, counts, label, className }: LevelSelectProps) {
  const item = (active: boolean) =>
    cn(
      'flex-1 sm:flex-none h-9 px-2 sm:px-3.5 rounded-[9px] text-[13px] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap',
      active ? 'bg-fg/14 text-fg font-semibold' : 'text-fg/72 font-medium hover:text-fg',
    )
  const count = (n?: number) => n !== undefined && <span className="text-fg/40 tabular-nums text-xs">{n}</span>
  return (
    <div className={cn('flex gap-0.5 bg-fg/6 border border-fg/10 rounded-xl p-1 w-full sm:w-fit', className)} role="radiogroup" aria-label={label}>
      <button type="button" role="radio" aria-checked={!value} className={item(!value)} onClick={() => onChange(undefined)}>
        {noneShort ? (
          <>
            <span className="sm:hidden">{noneShort}</span>
            <span className="hidden sm:inline">{noneLabel}</span>
          </>
        ) : (
          noneLabel
        )}
        {count(counts?.all)}
      </button>
      {LEVELS.map((l) => (
        <button key={l} type="button" role="radio" aria-checked={value === l} className={item(value === l)} onClick={() => onChange(value === l ? undefined : l)}>
          <LevelBars level={l} />
          {LEVEL_LABEL[l]}
          {count(counts?.[l])}
        </button>
      ))}
    </div>
  )
}
