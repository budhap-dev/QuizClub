import type { McqQuestion, Question, Quiz, QuizCategory, SlideQuestion, TimedQuestion, TrueFalseQuestion } from '@/types'
import { sample, shuffle, uid } from '@/utils'

export const DEFAULT_TIME = 20
export const DEFAULT_POINTS = 10

/** Minimal shape a pack author writes; ids/points/timers are filled in by the builders below. */
export interface RawMcq {
  q: string
  options: string[]
  /** Index into options */
  answer: number
  image?: string
  note?: string
}
export interface RawTf {
  q: string
  answer: boolean
  note?: string
}
export interface RawTimed {
  q: string
  answer: string
  time?: number
  note?: string
}

export function mcq(raw: RawMcq, points = DEFAULT_POINTS, time = DEFAULT_TIME): McqQuestion {
  // Shuffle options so the correct one isn't always in the same slot.
  const order = shuffle(raw.options.map((_, i) => i))
  return {
    id: uid('q'),
    type: 'mcq',
    text: raw.q,
    options: order.map((i) => raw.options[i]),
    correctIndex: order.indexOf(raw.answer),
    imageUrl: raw.image,
    hostNote: raw.note,
    points,
    timeLimit: time,
  }
}

export function tf(raw: RawTf, points = DEFAULT_POINTS, time = 15): TrueFalseQuestion {
  return { id: uid('q'), type: 'truefalse', text: raw.q, answer: raw.answer, hostNote: raw.note, points, timeLimit: time }
}

export function timed(raw: RawTimed, points = DEFAULT_POINTS): TimedQuestion {
  return { id: uid('q'), type: 'timed', text: raw.q, answer: raw.answer, hostNote: raw.note, points, timeLimit: raw.time ?? 30 }
}

export function slide(text: string, body?: string, imageUrl?: string): SlideQuestion {
  return { id: uid('q'), type: 'slide', text, body, imageUrl, points: 0 }
}

/**
 * A pack is a lazy generator so packs that build questions randomly (flags, maths)
 * produce a fresh quiz every time.
 */
export interface Pack {
  id: string
  title: string
  emoji: string
  category: QuizCategory
  description: string
  color: string
  /** Approximate size of the pool; used for the count slider max. */
  poolSize: number
  build: (count: number) => Question[]
}

export function makeQuiz(pack: Pack, count: number): Quiz {
  const now = Date.now()
  return {
    id: uid('lib'),
    title: pack.title,
    description: pack.description,
    category: pack.category,
    emoji: pack.emoji,
    source: 'library',
    questions: [slide(pack.title, pack.description), ...pack.build(count)],
    createdAt: now,
    updatedAt: now,
  }
}

/** Pick `count` from a raw list and convert. */
export function fromPool(pool: (RawMcq | RawTf)[], count: number): Question[] {
  return sample(pool, count).map((r) => ('options' in r ? mcq(r) : tf(r)))
}
