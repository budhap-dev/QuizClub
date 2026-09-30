import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { Logo, ThemeButton } from '@/components'
import { useSettingsStore } from '@/store/settingsStore'
import { VaultBadge } from '@/features/vault/VaultBadge'
import { cn } from '@/utils'
import { FloatingMenu } from './FloatingMenu'
import { NAV, isActive } from './nav'

const Brand = () => (
  <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap" aria-label="QuizClub home">
    <Logo />
    <span className="font-display font-semibold text-lg tracking-tight">
      <span className="text-gradient">Quiz</span>Club
    </span>
  </Link>
)

export function Layout() {
  const { pathname } = useLocation()
  const muted = useSettingsStore((s) => s.muted)
  const setMuted = useSettingsStore((s) => s.setMuted)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Phones: just the brand at the top; navigation lives in the floating menu. */}
      <header className="md:hidden px-4 pt-4 pb-1">
        <Brand />
      </header>

      {/* Tablets and up: sticky top bar on a near-opaque surface so content doesn't show through. */}
      <nav className="hidden md:block sticky top-0 z-40 px-4 py-3 bg-linear-to-b from-ink from-40% via-ink/70 to-transparent" aria-label="Main">
        <div className="max-w-6xl mx-auto nav-surface rounded-2xl pl-3 pr-2 py-1.5 flex items-center gap-1">
          <div className="mr-auto pr-2">
            <Brand />
          </div>
          {NAV.map(({ to, label, Icon }) => {
            const active = isActive(to, pathname)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2',
                  active ? 'text-fg' : 'text-fg/60 hover:text-fg',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-fg/12" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <Icon size={16} className="relative shrink-0" />
                <span className="relative">{label}</span>
              </Link>
            )
          })}
          <span className="w-px h-6 bg-fg/12 mx-1 shrink-0" aria-hidden />
          <VaultBadge />
          <ThemeButton />
          <button
            onClick={() => setMuted(!muted)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-fg/70 hover:text-fg hover:bg-fg/10 transition-colors"
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label="Toggle sound"
            aria-pressed={muted}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </nav>

      <div className="md:hidden">
        <FloatingMenu />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex-1 w-full max-w-6xl mx-auto px-4 pb-28 md:pb-16 pt-2"
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
