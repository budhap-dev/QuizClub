import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, Home, Library, Play, Settings, Volume2, VolumeX } from 'lucide-react'
import { Logo, ThemeButton } from '@/components'
import { useSettingsStore } from '@/store/settingsStore'
import { VaultBadge } from '@/features/vault/VaultBadge'
import { cn } from '@/utils'

const nav = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/quizzes', label: 'Quizzes', Icon: Library },
  { to: '/play', label: 'Play', Icon: Play },
  { to: '/games', label: 'Games', Icon: Gamepad2 },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export function Layout() {
  const { pathname } = useLocation()
  const muted = useSettingsStore((s) => s.muted)
  const setMuted = useSettingsStore((s) => s.setMuted)

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto glass rounded-2xl pl-3 pr-2 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* Phones get the mark only so the five nav icons plus vault/theme/mute still fit in the pill. */}
          <Link to="/" className="flex items-center gap-2.5 mr-auto pr-2 whitespace-nowrap" aria-label="QuizClub home">
            <Logo />
            <span className="font-display font-semibold text-lg tracking-tight hidden sm:inline">
              <span className="text-gradient">Quiz</span>Club
            </span>
          </Link>
          {nav.map(({ to, label, Icon }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
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
                <span className="relative hidden md:inline">{label}</span>
              </Link>
            )
          })}
          <span className="w-px h-6 bg-fg/12 mx-1 shrink-0 hidden sm:block" aria-hidden />
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
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex-1 w-full max-w-6xl mx-auto px-4 pb-16 pt-2"
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
