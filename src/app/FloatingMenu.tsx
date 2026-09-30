import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, type Variants } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Cloud, LayoutGrid, Move, Palette, Volume2, VolumeX, X } from 'lucide-react'
import { Modal, ThemePicker } from '@/components'
import { useSettingsStore } from '@/store/settingsStore'
import { useVaultStore, type VaultStatus } from '@/features/vault/vaultStore'
import { cn } from '@/utils'
import { NAV, isActive } from './nav'

/** Button size and the gap kept from the screen edges (px). */
const SIZE = 56
const EDGE = 16
/** Extra room at the top for notches and the browser bar. */
const TOP = 24
const STORAGE_KEY = 'quizclub.fab'

type Side = 'left' | 'right'
/** Where the button rests: which edge it hugs, and how far above its bottom-right home it sits (y ≤ 0). */
interface Rest {
  side: Side
  y: number
}

function loadRest(): Rest | null {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if ((v?.side === 'left' || v?.side === 'right') && typeof v.y === 'number') return v
  } catch {
    /* storage unavailable */
  }
  return null
}

function saveRest(r: Rest) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
  } catch {
    /* storage unavailable */
  }
}

/** Drag limits, measured from the button's home in the bottom-right corner. */
const limits = () => ({ left: -(window.innerWidth - SIZE - 2 * EDGE), top: -(window.innerHeight - SIZE - 2 * EDGE - TOP), right: 0, bottom: 0 })

const snap = { type: 'spring', stiffness: 520, damping: 38 } as const

const dot: Record<VaultStatus, string> = {
  locked: 'bg-fg/30',
  syncing: 'bg-sun animate-pulse',
  synced: 'bg-mint',
  offline: 'bg-orange',
  unconfigured: 'bg-sun',
  error: 'bg-red',
}

const list: Variants = {
  open: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
}

/**
 * Phone navigation: a floating button the user can drag anywhere; it snaps to the nearest side and
 * remembers where it was left. Tapping it expands the nav items, opening towards the middle of the screen.
 */
export function FloatingMenu() {
  const { pathname } = useLocation()
  const muted = useSettingsStore((s) => s.muted)
  const setMuted = useSettingsStore((s) => s.setMuted)
  const vaultId = useVaultStore((s) => s.id)
  const vaultStatus = useVaultStore((s) => s.status)

  const [open, setOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [bounds, setBounds] = useState(limits)
  const [placed] = useState(() => loadRest() !== null)
  const rest = useRef<Rest>(loadRest() ?? { side: 'right', y: 0 })
  const x = useMotionValue(rest.current.side === 'left' ? bounds.left : 0)
  const y = useMotionValue(Math.max(bounds.top, Math.min(0, rest.current.y)))
  const dragging = useRef(false)
  const fab = useRef<HTMLButtonElement>(null)
  const [anchor, setAnchor] = useState({ side: 'right' as Side, up: true, offset: 0 })
  const menuId = useId()

  // Keep the button on screen when the phone rotates or the browser bar resizes the viewport.
  useEffect(() => {
    const onResize = () => {
      const b = limits()
      setBounds(b)
      x.set(rest.current.side === 'left' ? b.left : 0)
      y.set(Math.max(b.top, Math.min(0, y.get())))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [x, y])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      fab.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const onDragEnd = () => {
    const side: Side = x.get() < bounds.left / 2 ? 'left' : 'right'
    void animate(x, side === 'left' ? bounds.left : 0, snap)
    rest.current = { side, y: y.get() }
    saveRest(rest.current)
    // The pointer-up that ends a drag also fires a click; let that click pass before re-enabling taps.
    window.setTimeout(() => (dragging.current = false), 80)
  }

  const toggle = () => {
    if (dragging.current || !fab.current) return
    const r = fab.current.getBoundingClientRect()
    const up = r.top + r.height / 2 > window.innerHeight / 2
    setAnchor({ side: rest.current.side, up, offset: up ? window.innerHeight - r.top + 12 : r.bottom + 12 })
    setOpen((o) => !o)
  }

  const item: Variants = {
    closed: { opacity: 0, y: anchor.up ? 10 : -10, scale: 0.96 },
    open: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 520, damping: 32 } },
  }
  const origin = `${anchor.up ? 'bottom' : 'top'} ${anchor.side}`
  const utility = 'flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-fg/75 hover:text-fg hover:bg-fg/10 transition-colors'

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.nav
            key="menu"
            id={menuId}
            aria-label="Main"
            className="nav-surface fixed z-40 w-64 max-w-[calc(100vw-2rem)] rounded-2xl p-2 overflow-y-auto"
            style={{
              [anchor.side]: EDGE,
              [anchor.up ? 'bottom' : 'top']: anchor.offset,
              maxHeight: `calc(100dvh - ${anchor.offset + EDGE}px)`,
              transformOrigin: origin,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 30 } }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.14 } }}
          >
            <motion.ul variants={list} initial="closed" animate="open" exit="closed" className="space-y-0.5">
              {NAV.map(({ to, label, Icon, color }) => {
                const active = isActive(to, pathname)
                return (
                  <motion.li key={to} variants={item}>
                    <Link
                      to={to}
                      aria-current={active ? 'page' : undefined}
                      className={cn('flex items-center gap-3 rounded-xl px-2 py-2 transition-colors', active ? 'bg-fg/12 text-fg' : 'text-fg/80 hover:bg-fg/8 hover:text-fg')}
                    >
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="font-medium">{label}</span>
                      {active && <span className="ml-auto mr-2 w-1.5 h-1.5 rounded-full" style={{ background: color }} aria-hidden />}
                    </Link>
                  </motion.li>
                )
              })}
              <motion.li variants={item} className="pt-1.5 mt-1.5 border-t border-fg/10 flex gap-1">
                <button type="button" className={utility} onClick={() => (setOpen(false), setThemeOpen(true))}>
                  <Palette size={17} /> Theme
                </button>
                <button type="button" className={utility} onClick={() => setMuted(!muted)} aria-pressed={muted} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}>
                  {muted ? <VolumeX size={17} /> : <Volume2 size={17} />} {muted ? 'Muted' : 'Sound'}
                </button>
                {vaultId && (
                  <Link to="/settings" className={cn(utility, 'relative flex-none w-11')} aria-label="Cloud vault status" title="Cloud vault">
                    <Cloud size={17} />
                    <span className={cn('absolute right-2 bottom-2 w-2 h-2 rounded-full ring-2 ring-ink-soft', dot[vaultStatus])} />
                  </Link>
                )}
              </motion.li>
              {!placed && (
                <motion.li variants={item} className="flex items-center gap-1.5 px-2 pt-2 pb-0.5 text-xs text-fg/45">
                  <Move size={12} /> Drag the button to move it
                </motion.li>
              )}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>

      <motion.button
        ref={fab}
        type="button"
        onClick={toggle}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={menuId}
        drag
        dragConstraints={bounds}
        dragElastic={0.12}
        dragMomentum={false}
        onDragStart={() => {
          dragging.current = true
          setOpen(false)
        }}
        onDragEnd={onDragEnd}
        whileTap={{ scale: 0.94 }}
        whileDrag={{ scale: 1.08, boxShadow: '0 18px 40px rgba(0,0,0,0.35)' }}
        style={{ x, y, width: SIZE, height: SIZE, right: EDGE, bottom: `calc(${EDGE}px + env(safe-area-inset-bottom))`, touchAction: 'none' }}
        className="fixed z-40 rounded-2xl bg-purple text-on-accent shadow-lg shadow-black/30 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex"
          >
            {open ? <X size={24} /> : <LayoutGrid size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <Modal open={themeOpen} onClose={() => setThemeOpen(false)} title="Theme">
        <ThemePicker compact />
      </Modal>
    </MotionConfig>
  )
}
