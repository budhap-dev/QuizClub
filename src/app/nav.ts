import { Gamepad2, Home, Library, Play, Puzzle, SlidersHorizontal, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  /** Accent for the item's icon badge in the sidebar and its active icon in the tab bar. */
  color: string
}

const HOME: NavItem = { to: '/', label: 'Home', Icon: Home, color: 'var(--color-purple)' }
const QUIZZES: NavItem = { to: '/quizzes', label: 'Quizzes', Icon: Library, color: 'var(--color-cyan)' }
const PLAY: NavItem = { to: '/play', label: 'Play', Icon: Play, color: 'var(--color-pink)' }
const GAMES: NavItem = { to: '/games', label: 'Games', Icon: Gamepad2, color: 'var(--color-lime)' }
const PUZZLES: NavItem = { to: '/puzzles', label: 'Puzzles', Icon: Puzzle, color: 'var(--color-orange)' }
const SETTINGS: NavItem = { to: '/settings', label: 'Settings', Icon: SlidersHorizontal, color: 'var(--color-sun)' }

/** Desktop sidebar, top to bottom. */
export const NAV: NavItem[] = [HOME, QUIZZES, PLAY, GAMES, PUZZLES, SETTINGS]

/** Phone and tablet tab bar; Play becomes the raised "Present" tile in the middle, and settings moves to the top bar. */
export const TABS: NavItem[] = [HOME, QUIZZES, { ...PLAY, label: 'Present' }, GAMES, PUZZLES]

export const isActive = (to: string, pathname: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to))
