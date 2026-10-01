/**
 * The quiz bank: ready-made quizzes across many areas, stored as JSON in ./data and loaded on demand.
 * Search runs in the browser over titles, tags, descriptions, questions and answers.
 */
import { useEffect, useState } from 'react'
import type { Difficulty, Question, Quiz, QuizCategory, QuizSource } from '@/types'
import { shuffle, uid } from '@/utils'
import { mcq, slide, tf, timed } from '@/features/library/helpers'

export type { Difficulty }

export interface RawBankQuestion {
  type: 'mcq' | 'tf' | 'timed'
  q: string
  options?: string[]
  answer: number | boolean | string
  note?: string
}

export interface RawBankQuiz {
  slug: string
  title: string
  emoji: string
  difficulty: Difficulty
  tags: string[]
  description: string
  questions: RawBankQuestion[]
}

interface RawBankFile {
  area: string
  quizzes: RawBankQuiz[]
}

export interface Area {
  id: string
  label: string
  /** Theme accent for the area's chip and card tint. */
  color: string
  /** Closest QuizCategory, used when a bank quiz is presented or copied. */
  category: QuizCategory
}

export const AREAS: Area[] = [
  { id: 'general', label: 'General Knowledge', color: 'var(--color-purple)', category: 'general' },
  { id: 'geography', label: 'Geography', color: 'var(--color-cyan)', category: 'geography' },
  { id: 'india', label: 'India', color: 'var(--color-orange)', category: 'custom' },
  { id: 'history', label: 'History', color: 'var(--color-sun)', category: 'history' },
  { id: 'science', label: 'Science', color: 'var(--color-mint)', category: 'science' },
  { id: 'space', label: 'Space', color: 'var(--color-violet)', category: 'science' },
  { id: 'nature', label: 'Nature & Animals', color: 'var(--color-lime)', category: 'science' },
  { id: 'literature', label: 'Literature', color: 'var(--color-pink)', category: 'literature' },
  { id: 'words', label: 'Words & Language', color: 'var(--color-cyan)', category: 'literature' },
  { id: 'maths', label: 'Maths & Logic', color: 'var(--color-mint)', category: 'maths' },
  { id: 'movies', label: 'Movies & TV', color: 'var(--color-red)', category: 'movies' },
  { id: 'music', label: 'Music', color: 'var(--color-pink)', category: 'music' },
  { id: 'sports', label: 'Sports', color: 'var(--color-lime)', category: 'sports' },
  { id: 'technology', label: 'Technology', color: 'var(--color-cyan)', category: 'custom' },
  { id: 'food', label: 'Food & Drink', color: 'var(--color-orange)', category: 'custom' },
  { id: 'mythology', label: 'Mythology', color: 'var(--color-purple)', category: 'history' },
  { id: 'art', label: 'Art & Culture', color: 'var(--color-pink)', category: 'custom' },
  { id: 'funny', label: 'Funny & Weird', color: 'var(--color-orange)', category: 'general' },
  { id: 'kids', label: 'Kids', color: 'var(--color-sun)', category: 'general' },
]

export const areaById = (id: string) => AREAS.find((a) => a.id === id)

export interface BankQuiz extends RawBankQuiz {
  /** Stable id: bank:<area>:<slug>. */
  id: string
  area: Area
  /** Normalised text searched by `searchBank`. */
  haystack: { title: string; meta: string; questions: string[] }
}

export const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const questionText = (q: RawBankQuestion) => normalise(`${q.q} ${q.options?.join(' ') ?? ''} ${typeof q.answer === 'string' ? q.answer : ''}`)

const files = import.meta.glob<RawBankFile>('./data/*.json', { import: 'default' })

let cache: BankQuiz[] | null = null
let pending: Promise<BankQuiz[]> | null = null

/** Load every area file once; later calls reuse the result. */
export function loadBank(): Promise<BankQuiz[]> {
  if (cache) return Promise.resolve(cache)
  pending ??= Promise.all(Object.values(files).map((load) => load())).then((all) => {
    const order = new Map(AREAS.map((a, i) => [a.id, i]))
    const quizzes: BankQuiz[] = []
    for (const file of all.sort((a, b) => (order.get(a.area) ?? 99) - (order.get(b.area) ?? 99))) {
      const area = areaById(file.area)
      if (!area) continue
      for (const q of file.quizzes) {
        quizzes.push({
          ...q,
          id: `bank:${area.id}:${q.slug}`,
          area,
          haystack: {
            title: normalise(q.title),
            meta: normalise(`${q.tags.join(' ')} ${q.description} ${area.label}`),
            questions: q.questions.map(questionText),
          },
        })
      }
    }
    cache = quizzes
    return quizzes
  })
  return pending
}

/** React hook: the loaded bank, or null while loading. */
export function useBank(): { quizzes: BankQuiz[] | null; error: boolean } {
  const [quizzes, setQuizzes] = useState(cache)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (cache) return
    let live = true
    loadBank()
      .then((q) => live && setQuizzes(q))
      .catch(() => live && setError(true))
    return () => {
      live = false
    }
  }, [])
  return { quizzes, error }
}

export interface BankFilter {
  query: string
  area?: string
  difficulty?: Difficulty
}

export interface BankHit {
  quiz: BankQuiz
  /** A question that matched the search when the title and tags did not. */
  matchedQuestion?: string
}

/** Every word of the query must appear somewhere in the quiz; title and tag hits rank first. */
export function searchBank(quizzes: BankQuiz[], { query, area, difficulty }: BankFilter): BankHit[] {
  const words = normalise(query).split(/\s+/).filter(Boolean)
  const hits: (BankHit & { score: number; order: number })[] = []
  quizzes.forEach((quiz, order) => {
    if (area && quiz.area.id !== area) return
    if (difficulty && quiz.difficulty !== difficulty) return
    if (words.length === 0) return hits.push({ quiz, score: 0, order })
    const { title, meta, questions } = quiz.haystack
    let score = 0
    let matchedQuestion: string | undefined
    for (const w of words) {
      if (title.includes(w)) score += 5
      else if (meta.includes(w)) score += 3
      else {
        const i = questions.findIndex((q) => q.includes(w))
        if (i < 0) return
        score += 1
        matchedQuestion ??= quiz.questions[i].q
      }
    }
    hits.push({ quiz, score, order, matchedQuestion })
  })
  return hits.sort((a, b) => b.score - a.score || a.order - b.order)
}

const POINTS: Record<Difficulty, number> = { easy: 10, medium: 10, hard: 15 }

function buildQuestion(r: RawBankQuestion, points: number): Question | null {
  switch (r.type) {
    case 'mcq':
      return r.options && typeof r.answer === 'number' ? mcq({ q: r.q, options: r.options, answer: r.answer, note: r.note }, points) : null
    case 'tf':
      return typeof r.answer === 'boolean' ? tf({ q: r.q, answer: r.answer, note: r.note }, points) : null
    case 'timed':
      return typeof r.answer === 'string' ? timed({ q: r.q, answer: r.answer, note: r.note }, points) : null
  }
}

/**
 * Turn a bank entry into a playable quiz with fresh ids and shuffled options.
 * `source: 'manual'` makes an editable copy for My Quizzes.
 */
export function toQuiz(b: BankQuiz, source: QuizSource = 'library'): Quiz {
  const now = Date.now()
  const points = POINTS[b.difficulty]
  return {
    id: uid(source === 'library' ? 'lib' : 'quiz'),
    title: b.title,
    description: b.description,
    category: b.area.category,
    emoji: b.emoji,
    source,
    difficulty: b.difficulty,
    questions: [slide(b.title, b.description), ...b.questions.map((q) => buildQuestion(q, points)).filter((q): q is Question => q !== null)],
    createdAt: now,
    updatedAt: now,
  }
}

export interface MixOptions {
  /** Area ids to draw from; empty means every area except Kids. */
  areas: string[]
  level?: Difficulty
  count: number
}

/** One question chosen for a mix, with the bank quiz it came from (for its area and points). */
export interface MixPick {
  question: RawBankQuestion
  from: BankQuiz
}

const mixAreas = (areas: string[]) => (areas.length ? areas : AREAS.filter((a) => a.id !== 'kids').map((a) => a.id))

/** Every question a mix with these settings could draw from, without repeats. */
export function mixPool(quizzes: BankQuiz[], { areas, level }: Omit<MixOptions, 'count'>): MixPick[] {
  const wanted = new Set(mixAreas(areas))
  const seen = new Set<string>()
  const pool: MixPick[] = []
  for (const from of quizzes) {
    if (!wanted.has(from.area.id) || (level && from.difficulty !== level)) continue
    for (const question of from.questions) {
      const key = normalise(question.q)
      if (seen.has(key)) continue
      seen.add(key)
      pool.push({ question, from })
    }
  }
  return pool
}

/** Draw `count` questions, taking turns between areas so no single area crowds out the rest. */
export function pickMix(quizzes: BankQuiz[], options: MixOptions): MixPick[] {
  const byArea = new Map<string, MixPick[]>()
  for (const p of mixPool(quizzes, options)) byArea.set(p.from.area.id, [...(byArea.get(p.from.area.id) ?? []), p])
  const queues = shuffle([...byArea.values()].map((q) => shuffle(q)))
  const picks: MixPick[] = []
  while (picks.length < options.count && queues.some((q) => q.length)) {
    for (const q of queues) {
      const p = q.pop()
      if (p && picks.length < options.count) picks.push(p)
    }
  }
  return shuffle(picks)
}

const listAreas = (labels: string[]) =>
  labels.length <= 3 ? labels.join(labels.length === 3 ? ', ' : ' and ').replace(/, ([^,]+)$/, ' and $1') : `${labels.length} areas`

/** Turn picked questions into a playable quiz; each keeps the points of the level it came from. */
export function mixToQuiz(picks: MixPick[], { areas, level }: Omit<MixOptions, 'count'>, source: QuizSource = 'library'): Quiz {
  const now = Date.now()
  const chosen = mixAreas(areas).map(areaById).filter((a): a is Area => !!a)
  const single = chosen.length === 1 ? chosen[0] : undefined
  const title = single ? `${single.label} Mix` : 'Random Mix'
  const levelWord = level ? `${level} ` : ''
  const description = `${picks.length} ${levelWord}questions from ${areas.length ? listAreas(chosen.map((a) => a.label)) : 'across the quiz bank'}.`
  return {
    id: uid(source === 'library' ? 'lib' : 'quiz'),
    title,
    description,
    category: single?.category ?? 'general',
    emoji: '🎲',
    source,
    difficulty: level,
    questions: [slide(title, description), ...picks.map((p) => buildQuestion(p.question, POINTS[p.from.difficulty])).filter((q): q is Question => q !== null)],
    createdAt: now,
    updatedAt: now,
  }
}
