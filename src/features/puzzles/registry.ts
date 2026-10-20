import { BookOpenText, Brain, Flame, Grid3x3, Lightbulb, ListOrdered, MessageCircleQuestion, Scale, ScanSearch, Shapes, Triangle, Type, type LucideIcon } from 'lucide-react'
import type { Difficulty } from '@/types'
import type { Puzzle, PuzzleType } from './types'
import { LATERAL, LOGIC, RIDDLES } from './data/words'
import { NUMBER_PUZZLES, PICTURE_MATHS, SEQUENCES } from './data/numbers'
import { COUNTING, MATCHSTICKS, PATTERNS, REBUS } from './data/visual'
import { SPOT } from './data/spot'
import { STORIES } from './data/stories'

export interface PuzzleTypeMeta {
  id: PuzzleType
  title: string
  Icon: LucideIcon
  color: string
  description: string
}

export const PUZZLE_TYPES: PuzzleTypeMeta[] = [
  { id: 'riddle', title: 'Riddles', Icon: MessageCircleQuestion, color: 'var(--color-purple)', description: 'Classic word riddles — what has keys but can’t open locks?' },
  { id: 'lateral', title: 'Lateral thinking', Icon: Lightbulb, color: 'var(--color-sun)', description: 'Strange situations with a simple explanation, if you think sideways.' },
  { id: 'logic', title: 'Logic', Icon: Brain, color: 'var(--color-cyan)', description: 'Knights and knaves, river crossings and questions that trick your gut.' },
  { id: 'sequence', title: 'What comes next?', Icon: ListOrdered, color: 'var(--color-pink)', description: 'Number and letter sequences, from squares to look-and-say.' },
  { id: 'number', title: 'Number puzzles', Icon: Grid3x3, color: 'var(--color-lime)', description: 'Pyramids, wheels, grids and triangles with a missing number.' },
  { id: 'picture-maths', title: 'Picture maths', Icon: Scale, color: 'var(--color-orange)', description: 'Emoji equations and balance scales: work out what each picture is worth.' },
  { id: 'matchsticks', title: 'Matchsticks', Icon: Flame, color: 'var(--color-red)', description: 'Move, add or take away matches to fix the sum.' },
  { id: 'patterns', title: 'Shape patterns', Icon: Shapes, color: 'var(--color-mint)', description: 'Turning arrows, shaded grids and clocks — pick what fits.' },
  { id: 'counting', title: 'Count the shapes', Icon: Triangle, color: 'var(--color-cyan)', description: 'How many triangles, squares or rectangles are hiding in the figure?' },
  { id: 'rebus', title: 'Word pictures', Icon: Type, color: 'var(--color-pink)', description: 'Rebus puzzles: MIND over MATTER, words that go down, back and apart.' },
  { id: 'spot', title: 'Spot the difference', Icon: ScanSearch, color: 'var(--color-purple)', description: 'Two pictures, a handful of changes. Tap them as the room calls them out.' },
  { id: 'story', title: 'Story puzzles', Icon: BookOpenText, color: 'var(--color-orange)', description: 'Read a short story aloud, then ask the room: who did it, what went wrong, or how can that be?' },
]

export const PUZZLES: Puzzle[] = [...RIDDLES, ...LATERAL, ...LOGIC, ...SEQUENCES, ...NUMBER_PUZZLES, ...PICTURE_MATHS, ...MATCHSTICKS, ...PATTERNS, ...COUNTING, ...REBUS, ...SPOT, ...STORIES]

export const puzzleTypeById = (id: string) => PUZZLE_TYPES.find((t) => t.id === id)

export const isLevel = (v: string | null): v is Difficulty => v === 'easy' || v === 'medium' || v === 'hard'

/** Points a team earns for solving a puzzle at each level. */
export const LEVEL_POINTS: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 20 }

/** Thinking time offered by the timer at each level, in seconds. */
export const LEVEL_SECONDS: Record<Difficulty, number> = { easy: 30, medium: 60, hard: 90 }
