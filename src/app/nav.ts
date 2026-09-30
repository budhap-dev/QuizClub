import { Gamepad2, Home, Library, Play, Settings, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  /** Accent used to tint the item's icon badge in the mobile menu. */
  color: string
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Home', Icon: Home, color: 'var(--color-purple)' },
  { to: '/quizzes', label: 'Quizzes', Icon: Library, color: 'var(--color-cyan)' },
  { to: '/play', label: 'Play', Icon: Play, color: 'var(--color-pink)' },
  { to: '/games', label: 'Games', Icon: Gamepad2, color: 'var(--color-lime)' },
  { to: '/settings', label: 'Settings', Icon: Settings, color: 'var(--color-sun)' },
]

export const isActive = (to: string, pathname: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to))
