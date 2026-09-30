import type { Question } from '@/types'
import { pick, randInt, shuffle } from '@/utils'
import { mcq, timed, type Pack } from '../helpers'

type Level = 'easy' | 'medium' | 'hard'

interface Problem {
  q: string
  a: number
  /** The working, shown on screen after the reveal. */
  why: string
}

function easy(): Problem {
  const op = pick(['+', '-', '×'])
  if (op === '+') {
    const a = randInt(2, 60), b = randInt(2, 60)
    return { q: `${a} + ${b}`, a: a + b, why: `${a} + ${b} = ${a + b}` }
  }
  if (op === '-') {
    const a = randInt(10, 80), b = randInt(1, a)
    return { q: `${a} − ${b}`, a: a - b, why: `${a} − ${b} = ${a - b}. Check: ${a - b} + ${b} = ${a}` }
  }
  const a = randInt(2, 12), b = randInt(2, 12)
  return { q: `${a} × ${b}`, a: a * b, why: `${a} × ${b} = ${a * b}` }
}

function medium(): Problem {
  const kind = pick(['mul', 'div', 'mix', 'sq'])
  if (kind === 'mul') {
    const a = randInt(12, 30), b = randInt(3, 12)
    const tens = Math.floor(a / 10) * 10, ones = a - tens
    const why = ones ? `${tens} × ${b} = ${tens * b}, ${ones} × ${b} = ${ones * b}, so ${tens * b} + ${ones * b} = ${a * b}` : `${a} × ${b} = ${a * b}`
    return { q: `${a} × ${b}`, a: a * b, why }
  }
  if (kind === 'div') {
    const b = randInt(3, 12), r = randInt(4, 25)
    return { q: `${b * r} ÷ ${b}`, a: r, why: `${b} × ${r} = ${b * r}, so ${b * r} ÷ ${b} = ${r}` }
  }
  if (kind === 'sq') {
    const a = randInt(11, 25)
    return { q: `${a}²`, a: a * a, why: `${a}² = ${a} × ${a} = ${a * a}` }
  }
  const a = randInt(5, 20), b = randInt(2, 9), c = randInt(1, 30)
  return { q: `${a} × ${b} + ${c}`, a: a * b + c, why: `Multiply first: ${a} × ${b} = ${a * b}, then ${a * b} + ${c} = ${a * b + c}` }
}

function hard(): Problem {
  const kind = pick(['pct', 'cube', 'sqrt', 'chain', 'prime'])
  if (kind === 'pct') {
    const p = pick([5, 10, 12.5, 15, 20, 25, 30, 40, 60, 75])
    const n = pick([40, 80, 120, 160, 200, 240, 320, 400, 480, 640, 800])
    const ans = Math.round((p / 100) * n)
    return { q: `${p}% of ${n}`, a: ans, why: `${p}% of ${n} = ${n} × ${p} ÷ 100 = ${ans}` }
  }
  if (kind === 'cube') {
    const a = randInt(3, 12)
    return { q: `${a}³`, a: a ** 3, why: `${a}³ = ${a} × ${a} × ${a} = ${a * a} × ${a} = ${a ** 3}` }
  }
  if (kind === 'sqrt') {
    const a = randInt(11, 30)
    return { q: `√${a * a}`, a, why: `${a} × ${a} = ${a * a}, so √${a * a} = ${a}` }
  }
  if (kind === 'prime') {
    const primes = [101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179]
    const i = randInt(0, primes.length - 2)
    const between = Array.from({ length: primes[i + 1] - primes[i] - 1 }, (_, k) => primes[i] + k + 1)
    const why = `${between.join(', ')} ${between.length === 1 ? 'has a factor' : 'all have factors'}; ${primes[i + 1]} is divisible only by 1 and itself`
    return { q: `What is the next prime number after ${primes[i]}?`, a: primes[i + 1], why }
  }
  const a = randInt(10, 40), b = randInt(10, 40), c = randInt(2, 9)
  return { q: `(${a} + ${b}) × ${c}`, a: (a + b) * c, why: `Brackets first: ${a} + ${b} = ${a + b}, then ${a + b} × ${c} = ${(a + b) * c}` }
}

const gen: Record<Level, () => Problem> = { easy, medium, hard }

function distractors(answer: number): number[] {
  const set = new Set<number>()
  let guard = 0
  while (set.size < 3 && guard++ < 50) {
    const spread = Math.max(2, Math.round(Math.abs(answer) * 0.15))
    const d = answer + randInt(-spread, spread) * pick([1, 1, 2])
    if (d !== answer && d >= 0) set.add(d)
  }
  while (set.size < 3) set.add(answer + set.size + 1)
  return [...set]
}

export function buildMathsQuestions(count: number, level: Level | 'mixed' = 'mixed'): Question[] {
  const out: Question[] = []
  for (let i = 0; i < count; i++) {
    const lvl: Level = level === 'mixed' ? pick(['easy', 'medium', 'hard']) : level
    const p = gen[lvl]()
    const points = lvl === 'easy' ? 5 : lvl === 'medium' ? 10 : 15
    const time = lvl === 'easy' ? 10 : lvl === 'medium' ? 20 : 30
    // Every third question is open-ended (timed) for extra drama.
    if (i % 3 === 2) {
      out.push(timed({ q: `${p.q} = ?`, answer: String(p.a), time, note: p.why }, points))
    } else {
      const options = shuffle([p.a, ...distractors(p.a)]).map(String)
      out.push(mcq({ q: `${p.q} = ?`, options, answer: options.indexOf(String(p.a)), note: p.why }, points, time))
    }
  }
  return out
}

export const mathsPack: Pack = {
  id: 'maths',
  title: 'Mental Maths',
  emoji: '➗',
  category: 'maths',
  description: 'Quick-fire arithmetic, squares, cubes and percentages. Generated fresh every time.',
  color: '#22d3ee',
  poolSize: 50,
  build: (n) => buildMathsQuestions(n),
}

export const mathsEasyPack: Pack = {
  ...mathsPack,
  id: 'maths-easy',
  title: 'Mental Maths (Easy)',
  description: 'Addition, subtraction and times tables.',
  build: (n) => buildMathsQuestions(n, 'easy'),
}
