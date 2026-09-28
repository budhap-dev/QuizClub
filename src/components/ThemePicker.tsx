import { motion } from 'framer-motion'
import { THEMES } from '@/app/theme'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/utils'
import { sfx } from '@/utils/sounds'

interface ThemePickerProps {
  compact?: boolean
  className?: string
}

/** Swatch grid for choosing the colour theme. Each card is painted in its own palette. */
export function ThemePicker({ compact, className }: ThemePickerProps) {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  return (
    <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {THEMES.map((t) => {
        const active = t.id === theme
        return (
          <motion.button
            key={t.id}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setTheme(t.id)
              sfx.click()
            }}
            aria-pressed={active}
            className={cn('rounded-2xl p-3 text-left border-2 transition-colors shadow-lg', active ? 'border-fg' : 'border-transparent hover:border-fg/40')}
            style={{ background: t.preview.ink, color: t.preview.fg }}
          >
            <div
              className="h-8 rounded-xl mb-2"
              style={{ background: `linear-gradient(120deg, ${t.preview.a}, ${t.preview.b}, ${t.preview.c}, ${t.preview.d})` }}
            />
            <div className="flex items-center gap-1.5">
              <span>{t.emoji}</span>
              <span className="font-display font-bold text-sm truncate">{t.name}</span>
              {active && <span className="ml-auto text-xs">✓</span>}
            </div>
            {!compact && <div className="text-xs opacity-70 mt-0.5 leading-snug">{t.description}</div>}
          </motion.button>
        )
      })}
    </div>
  )
}
