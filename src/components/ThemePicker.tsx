import { Check } from 'lucide-react'
import { THEMES } from '@/app/theme'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/utils'
import { sfx } from '@/utils/sounds'

interface ThemePickerProps {
  compact?: boolean
  className?: string
}

const GROUPS = [
  { label: 'Dark', themes: THEMES.filter((t) => !t.light) },
  { label: 'Light', themes: THEMES.filter((t) => t.light) },
]

/** Swatch grid for choosing the colour theme, split into dark and light. Each card is painted in its own palette. */
export function ThemePicker({ compact, className }: ThemePickerProps) {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  return (
    <div className={cn('space-y-4', className)}>
      {GROUPS.map((g) => (
        <div key={g.label}>
          <div className="text-[11px] uppercase tracking-wider font-medium text-fg/50 mb-2">{g.label}</div>
          <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4')}>
            {g.themes.map((t) => {
              const active = t.id === theme
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id)
                    sfx.click()
                  }}
                  aria-pressed={active}
                  className={cn('rounded-xl p-3 text-left border transition-colors', active ? 'border-fg' : 'border-fg/15 hover:border-fg/40')}
                  style={{ background: t.preview.ink, color: t.preview.fg }}
                >
                  <div className="h-6 rounded-lg mb-2.5 flex overflow-hidden">
                    {[t.preview.a, t.preview.b, t.preview.c, t.preview.d].map((c, i) => (
                      <span key={i} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">{t.name}</span>
                    {active && <Check size={14} className="ml-auto shrink-0" />}
                  </div>
                  {!compact && <div className="text-xs opacity-70 mt-0.5 leading-snug">{t.description.replace(/^Light mode — /, '')}</div>}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
