import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MonitorPlay, Search, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react'
import { IconBadge, Logo, Modal, ThemePicker, buttonClass } from '@/components'
import { useSettingsStore } from '@/store/settingsStore'
import { VaultBadge } from '@/features/vault/VaultBadge'
import { cn } from '@/utils'
import { NAV, TABS, isActive } from './nav'
import { themeById } from './theme'

const Brand = ({ logo = 32, className }: { logo?: number; className?: string }) => (
  <Link to="/" className={cn('flex items-center gap-2.5 whitespace-nowrap', className)} aria-label="QuizClub home">
    <Logo size={logo} className="rounded-[10px]" />
    <span className="font-display font-semibold text-lg lg:text-[19px] tracking-tight">
      <span className="text-gradient">Quiz</span>Club
    </span>
  </Link>
)

/** Wide theme button for the sidebar: the current palette as three dots, plus its name. */
function SidebarTheme() {
  const [open, setOpen] = useState(false)
  const theme = themeById(useSettingsStore((s) => s.theme))
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-12 px-3 rounded-xl flex items-center gap-2.5 text-left text-[13px] font-medium bg-fg/5 border border-fg/10 hover:bg-fg/9 transition-colors"
        aria-label={`Theme: ${theme.name}. Change theme`}
      >
        <span className="flex shrink-0" aria-hidden>
          {[theme.preview.a, theme.preview.b, theme.preview.c].map((c, i) => (
            <span key={i} className={cn('w-3.5 h-3.5 rounded-full border-2 border-ink-soft', i > 0 && '-ml-1.5')} style={{ background: c }} />
          ))}
        </span>
        <span className="flex-1 min-w-0 truncate">{theme.name}</span>
        <span className="text-xs text-fg/60">Theme</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Theme">
        <ThemePicker compact />
      </Modal>
    </>
  )
}

function Sidebar({ pathname }: { pathname: string }) {
  const muted = useSettingsStore((s) => s.muted)
  const setMuted = useSettingsStore((s) => s.setMuted)

  return (
    <nav
      aria-label="Main"
      className="hidden lg:flex w-60 shrink-0 sticky top-0 h-dvh overflow-y-auto flex-col gap-7 px-4 py-6 bg-ink-soft border-r border-fg/8"
    >
      <Brand logo={34} className="px-2" />

      <Link to="/play" className={buttonClass('accent', 'md', 'h-11 w-full text-[15px] [&_svg]:size-[1.125rem]')}>
        <MonitorPlay />
        Present a quiz
      </Link>

      <div className="flex flex-col gap-0.5">
        {NAV.map(({ to, label, Icon, color }) => {
          const active = isActive(to, pathname)
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative h-11 px-2.5 rounded-[10px] flex items-center gap-3 text-sm transition-colors',
                active ? 'font-semibold text-fg' : 'font-medium text-fg/72 hover:text-fg hover:bg-fg/5',
              )}
            >
              {active && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-[10px] bg-fg/9" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
              )}
              <IconBadge icon={Icon} color={color} size={28} className="relative" />
              <span className="relative">{label}</span>
            </Link>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <SidebarTheme />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[13px] text-fg/80 bg-fg/5 border border-fg/10 hover:bg-fg/9 hover:text-fg transition-colors"
            aria-pressed={muted}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {muted ? 'Muted' : 'Sound on'}
          </button>
          <VaultBadge />
        </div>
      </div>
    </nav>
  )
}

const topIcon = 'w-11 h-11 rounded-xl flex items-center justify-center text-fg border transition-colors'

function TopBar({ pathname }: { pathname: string }) {
  const onSettings = isActive('/settings', pathname)
  return (
    <header className="lg:hidden flex items-center gap-2 px-4 pt-3.5 pb-1.5">
      <div className="mr-auto">
        <Brand />
      </div>
      <Link to="/quizzes/bank" className={cn(topIcon, 'bg-fg/6 border-fg/10 hover:bg-fg/10')} aria-label="Search the quiz bank">
        <Search size={19} />
      </Link>
      <Link
        to="/settings"
        className={cn(topIcon, onSettings ? 'bg-fg/12 border-fg/20' : 'bg-fg/6 border-fg/10 hover:bg-fg/10')}
        aria-label="Settings and theme"
        aria-current={onSettings ? 'page' : undefined}
      >
        <SlidersHorizontal size={19} />
      </Link>
    </header>
  )
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex items-end pt-2 px-3 pb-[max(env(safe-area-inset-bottom),14px)] bg-ink-soft/96 border-t border-fg/10"
    >
      {TABS.map(({ to, label, Icon, color }) => {
        const active = isActive(to, pathname)
        const present = to === '/play'
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex-1 min-w-0 flex flex-col items-center gap-1 text-[11px] transition-colors',
              present ? 'font-semibold text-fg' : 'pt-1.5 min-h-12',
              !present && (active ? 'font-semibold text-fg' : 'font-medium text-fg/65 hover:text-fg'),
            )}
          >
            {present ? (
              <span className="w-[54px] h-[54px] -mt-[26px] rounded-[18px] bg-pink text-on-accent border-4 border-ink-soft flex items-center justify-center">
                <Icon size={22} />
              </span>
            ) : (
              <Icon size={22} style={active ? { color } : undefined} />
            )}
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar pathname={pathname} />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <TopBar pathname={pathname} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1 w-full max-w-[1120px] mx-auto px-4 pt-2 pb-28 lg:px-10 lg:pt-8 lg:pb-16"
        >
          <Outlet />
        </motion.main>
      </div>

      <TabBar pathname={pathname} />
    </div>
  )
}
