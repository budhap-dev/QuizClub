import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Blobs, ThemeButton } from '@/components'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/utils'

const nav = [
  { to: '/', label: 'Home', emoji: '🏠' },
  { to: '/quizzes', label: 'Quizzes', emoji: '📚' },
  { to: '/play', label: 'Play', emoji: '🎬' },
  { to: '/games', label: 'Games', emoji: '🎮' },
  { to: '/settings', label: 'Settings', emoji: '⚙️' },
]

export function Layout() {
  const { pathname } = useLocation()
  const muted = useSettingsStore((s) => s.muted)
  const setMuted = useSettingsStore((s) => s.setMuted)

  return (
    <div className="min-h-screen flex flex-col">
      <Blobs />
      <nav className="sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto glass rounded-2xl px-3 py-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <Link to="/" className="font-display font-bold text-xl px-2 mr-auto whitespace-nowrap">
            <span className="text-gradient">Quiz</span>Club
          </Link>
          {nav.map((n) => {
            const active = n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  'relative px-3 py-1.5 rounded-xl text-sm md:text-base font-semibold whitespace-nowrap transition-colors',
                  active ? 'text-fg' : 'text-fg/60 hover:text-fg',
                )}
              >
                {active && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-fg/15" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative">
                  <span className="md:hidden">{n.emoji}</span>
                  <span className="hidden md:inline">
                    {n.emoji} {n.label}
                  </span>
                </span>
              </Link>
            )
          })}
          <ThemeButton />
          <button
            onClick={() => setMuted(!muted)}
            className="px-2 py-1.5 rounded-xl text-lg hover:bg-fg/10"
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label="Toggle sound"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </nav>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25 }}
        className="flex-1 w-full max-w-6xl mx-auto px-4 pb-16 pt-2"
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
