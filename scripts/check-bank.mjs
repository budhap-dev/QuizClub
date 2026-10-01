// Validate the quiz bank data: `npm run check:bank`. Exits 1 on any error.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = new URL('../src/features/bank/data/', import.meta.url).pathname
const AREAS = ['general', 'geography', 'india', 'history', 'science', 'space', 'nature', 'literature', 'words', 'maths', 'movies', 'music', 'sports', 'technology', 'food', 'mythology', 'art', 'funny', 'kids']
const errors = []
const warnings = []
const seen = new Map()
let quizCount = 0
let questionCount = 0
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()) {
  let data
  try {
    data = JSON.parse(readFileSync(join(DIR, file), 'utf8'))
  } catch (e) {
    errors.push(`${file}: invalid JSON (${e.message})`)
    continue
  }
  const at = (where, msg) => errors.push(`${file} › ${where}: ${msg}`)
  if (!AREAS.includes(data.area)) at('area', `unknown area "${data.area}"`)
  if (`${data.area}.json` !== file) warnings.push(`${file}: area "${data.area}" doesn't match the file name`)
  const slugs = new Set()
  const positions = [0, 0, 0, 0]
  for (const quiz of data.quizzes ?? []) {
    quizCount++
    const w = quiz.slug ?? '(no slug)'
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(quiz.slug ?? '')) at(w, 'slug must be kebab-case')
    if (slugs.has(quiz.slug)) at(w, 'duplicate slug')
    slugs.add(quiz.slug)
    for (const k of ['title', 'emoji', 'description']) if (typeof quiz[k] !== 'string' || !quiz[k].trim()) at(w, `missing ${k}`)
    if (!['easy', 'medium', 'hard'].includes(quiz.difficulty)) at(w, `bad difficulty "${quiz.difficulty}"`)
    if (!Array.isArray(quiz.tags) || quiz.tags.length === 0) at(w, 'needs tags')
    if (!Array.isArray(quiz.questions) || quiz.questions.length < 5) at(w, 'needs at least 5 questions')
    ;(quiz.questions ?? []).forEach((q, i) => {
      questionCount++
      const qw = `${w} #${i + 1}`
      if (typeof q.q !== 'string' || !q.q.trim()) return at(qw, 'missing question text')
      if (q.q.length > 140) at(qw, `question is ${q.q.length} chars (max 140)`)
      // Same wording and same answer; generic stems like "Which is the correct spelling?" differ by answer.
      const key = `${norm(q.q)} → ${norm(String(q.type === 'mcq' ? q.options?.[q.answer] : q.answer))}`
      if (seen.has(key)) at(qw, `duplicate of ${seen.get(key)}`)
      else seen.set(key, `${file} › ${qw}`)
      if (q.note && q.note.length > 160) warnings.push(`${file} › ${qw}: note is ${q.note.length} chars`)
      switch (q.type) {
        case 'mcq':
          if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) at(qw, 'mcq needs 2–6 options')
          else {
            if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) at(qw, `answer index ${q.answer} out of range`)
            else positions[q.answer] = (positions[q.answer] ?? 0) + 1
            if (new Set(q.options.map(norm)).size !== q.options.length) at(qw, 'duplicate options')
            q.options.forEach((o) => typeof o === 'string' && o.length > 40 && at(qw, `option "${o}" is over 40 chars`))
          }
          break
        case 'tf':
          if (typeof q.answer !== 'boolean') at(qw, 'tf answer must be true or false')
          break
        case 'timed':
          if (typeof q.answer !== 'string' || !q.answer.trim()) at(qw, 'timed answer must be text')
          else if (q.answer.length > 30) at(qw, `timed answer is ${q.answer.length} chars (max 30)`)
          break
        default:
          at(qw, `unknown type "${q.type}"`)
      }
    })
  }
  const total = positions.reduce((a, b) => a + b, 0)
  if (total >= 12 && Math.max(...positions) / total > 0.45) warnings.push(`${file}: correct answers bunch up in one position (${positions.join('/')})`)
}

for (const w of warnings) console.warn(`warn  ${w}`)
for (const e of errors) console.error(`error ${e}`)
console.log(`\n${quizCount} quizzes, ${questionCount} questions — ${errors.length} errors, ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
