import type { NumberQuestion, OrderQuestion } from '@/types'
import { OPTION_LABELS } from '@/utils'

/** "8,849 m" — grouped digits in the viewer's locale, then the unit if there is one. */
export const formatNumberAnswer = (q: NumberQuestion) => `${q.answer.toLocaleString()}${q.unit ? ` ${q.unit}` : ''}`

/** Small seeded PRNG so every window shows a question's items in the same shuffled order. */
function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

export interface OrderTile {
  text: string
  /** Letter shown on stage before the reveal. */
  letter: string
  /** 0-based correct position. */
  rank: number
}

/**
 * The items of an order question as the stage shows them before the reveal: shuffled (never already
 * in the right order) and lettered A, B, C… The shuffle depends only on the question id.
 */
export function orderTiles(q: OrderQuestion): OrderTile[] {
  const rand = seeded(q.id)
  const ranks = q.items.map((_, i) => i)
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = ranks.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[ranks[i], ranks[j]] = [ranks[j], ranks[i]]
    }
    if (ranks.some((r, i) => r !== i)) break
  }
  return ranks.map((rank, i) => ({ text: q.items[rank], letter: OPTION_LABELS[i] ?? String(i + 1), rank }))
}

/** The answer as letters in the right order, e.g. "C → A → D → B". */
export const orderAnswer = (q: OrderQuestion) =>
  orderTiles(q)
    .sort((a, b) => a.rank - b.rank)
    .map((t) => t.letter)
    .join(' → ')
