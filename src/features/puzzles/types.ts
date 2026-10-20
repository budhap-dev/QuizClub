import type { Difficulty } from '@/types'

export type PuzzleType =
  | 'riddle'
  | 'lateral'
  | 'logic'
  | 'sequence'
  | 'number'
  | 'picture-maths'
  | 'matchsticks'
  | 'patterns'
  | 'counting'
  | 'rebus'
  | 'spot'

/** A cell in a shape-pattern puzzle: a polygon or symbol, a mini grid of shaded squares, or a cluster of dots. */
export type Glyph =
  | {
      shape: 'circle' | 'triangle' | 'square' | 'diamond' | 'pentagon' | 'hexagon' | 'octagon' | 'star' | 'arrow' | 'plus'
      /** Clockwise rotation in degrees. */
      rot?: number
      fill?: 'solid' | 'empty' | 'half'
      /** Dots drawn inside the shape. */
      dots?: number
      /** Scale from 0.4 to 1 (default 1). */
      size?: number
    }
  | { grid: number; on: number[] }
  | { dots: number }

/** One word or symbol in a rebus. `rule` draws a horizontal line instead of text. */
export interface RebusToken {
  t: string
  style?: 'small' | 'big' | 'reverse' | 'down' | 'spaced' | 'split' | 'rule' | 'faint'
}

/** One element of a spot-the-difference picture: an SVG tag and its attributes. */
export type SceneEl = [tag: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'path' | 'line', attrs: Record<string, string | number>]

export interface Scene {
  /** Elements in drawing order, keyed so a difference can replace or remove one. */
  items: [key: string, el: SceneEl][]
  differences: {
    /** Where the difference is, in the 400×300 picture, and how close a tap must land. */
    at: [x: number, y: number, r: number]
    /** Replacements for the right-hand picture: a new element, or null to remove it. Unknown keys are added on top. */
    set: Record<string, SceneEl | null>
    label: string
  }[]
}

export type Figure =
  | { kind: 'matchsticks'; eq: string }
  | { kind: 'sequence'; items: string[] }
  | { kind: 'glyphs'; items: (Glyph | null)[]; cols?: number }
  | { kind: 'pyramid'; rows: string[][] }
  | { kind: 'wheel'; segments: string[]; center?: string }
  | { kind: 'grid'; cells: string[][] }
  | { kind: 'number-triangles'; items: { corners: [string, string, string]; center: string }[] }
  | { kind: 'lines'; segments: [number, number, number, number][]; width?: number; height?: number }
  | { kind: 'equations'; rows: string[][] }
  | { kind: 'scales'; rows: [left: string, right: string][] }
  | { kind: 'clocks'; times: (string | null)[] }
  | { kind: 'rebus'; rows: RebusToken[][] }
  | { kind: 'spot'; scene: Scene }

export interface Puzzle {
  type: PuzzleType
  level: Difficulty
  /** The question as read out to the room. */
  q: string
  figure?: Figure
  /** Multiple choice: text or shapes, with `answerIndex` marking the right one. */
  options?: (string | Glyph)[]
  answerIndex?: number
  /** The answer as shown on reveal (optional when the right option says it all). */
  answer?: string
  /** A picture of the solved puzzle, e.g. the corrected matchstick sum. */
  answerFigure?: Figure
  /** Emoji illustrating the answer, shown beside it on reveal. */
  emoji?: string
  hint?: string
  /** Why the answer is right. */
  why?: string
}
