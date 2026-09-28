import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button, Card, PageHeader } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { AiQuizRequest, Question, Quiz, QuestionType, QuizCategory } from '@/types'
import { cn, OPTION_LABELS } from '@/utils'
import { sfx } from '@/utils/sounds'
import { PACKS } from '@/features/library/packs'
import { makeQuiz } from '@/features/library/helpers'
import { AiError, generateQuiz } from './client'

const CATEGORIES: { id: QuizCategory; label: string; emoji: string; hint: string }[] = [
  { id: 'general', label: 'General', emoji: '🧠', hint: 'A bit of everything' },
  { id: 'flags', label: 'Flags', emoji: '🚩', hint: 'Flags of Europe' },
  { id: 'logos', label: 'Logos', emoji: '🏷️', hint: 'Car brand logos' },
  { id: 'geography', label: 'Geography', emoji: '🌍', hint: 'Rivers of Asia' },
  { id: 'science', label: 'Science', emoji: '🔬', hint: 'The solar system' },
  { id: 'maths', label: 'Maths', emoji: '➗', hint: 'Fractions and percentages' },
  { id: 'literature', label: 'Literature', emoji: '📚', hint: 'Shakespeare' },
  { id: 'movies', label: 'Movies', emoji: '🎬', hint: '90s Bollywood' },
  { id: 'sports', label: 'Sports', emoji: '⚽', hint: 'Cricket World Cups' },
  { id: 'music', label: 'Music', emoji: '🎵', hint: '80s pop' },
  { id: 'history', label: 'History', emoji: '🏛️', hint: 'Ancient Egypt' },
  { id: 'custom', label: 'Anything', emoji: '✨', hint: 'Office trivia about our team' },
]

const TYPES: { id: QuestionType; label: string }[] = [
  { id: 'mcq', label: '🔠 Multiple choice' },
  { id: 'truefalse', label: '✅ True / False' },
  { id: 'timed', label: '⏱️ Timed answer' },
  { id: 'slide', label: '🖼️ Slides' },
]

const LOADING_LINES = ['Consulting the oracle…', 'Sharpening pencils…', 'Arguing with the quizmaster…', 'Double-checking facts…', 'Adding a plot twist…']

export function AiGenerator() {
  const navigate = useNavigate()
  const upsert = useQuizStore((s) => s.upsert)
  const start = useSessionStore((s) => s.start)
  const accessCode = useSettingsStore((s) => s.aiAccessCode)

  const [form, setForm] = useState<AiQuizRequest>({ topic: '', category: 'general', difficulty: 'mixed', count: 10, types: ['mcq', 'truefalse'], audience: 'mixed' })
  const [loading, setLoading] = useState(false)
  const [line, setLine] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Quiz | null>(null)

  const set = <K extends keyof AiQuizRequest>(k: K, v: AiQuizRequest[K]) => setForm((f) => ({ ...f, [k]: v }))
  const toggleType = (t: QuestionType) => set('types', form.types.includes(t) ? form.types.filter((x) => x !== t) : [...form.types, t])
  const catMeta = CATEGORIES.find((c) => c.id === form.category)!

  const run = async () => {
    setError(null)
    setResult(null)
    setLoading(true)
    const tick = window.setInterval(() => setLine((l) => (l + 1) % LOADING_LINES.length), 1800)
    try {
      const quiz = await generateQuiz({ ...form, topic: form.topic.trim() || catMeta.hint }, accessCode || undefined)
      sfx.fanfare()
      setResult(quiz)
    } catch (e) {
      const msg = e instanceof AiError ? e.message : 'Something went wrong. Please try again.'
      setError(msg)
      sfx.wrong()
    } finally {
      window.clearInterval(tick)
      setLoading(false)
    }
  }

  /** Offline fallback: build from the built-in library for the chosen category. */
  const fallback = () => {
    const pack = PACKS.find((p) => p.category === form.category) ?? PACKS.find((p) => p.id === 'general')!
    const quiz = { ...makeQuiz(pack, form.count), source: 'ai' as const, title: `${pack.title} (offline)` }
    setResult(quiz)
    setError(null)
  }

  const removeQuestion = (id: string) => result && setResult({ ...result, questions: result.questions.filter((q) => q.id !== id) })

  const save = () => {
    if (!result) return
    upsert(result)
    return result
  }

  return (
    <div>
      <PageHeader title="AI Quiz Generator" emoji="✨" subtitle="Describe a topic — get a quiz. Review, tweak, then save or present." />

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-3">What's the quiz about?</h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set('category', c.id)}
                className={cn('rounded-xl py-2 px-1 text-sm font-semibold border-2 transition-colors', form.category === c.id ? 'bg-purple border-purple' : 'border-fg/10 hover:bg-fg/10')}
              >
                <div className="text-xl">{c.emoji}</div>
                {c.label}
              </button>
            ))}
          </div>

          <label className="block mb-4">
            <span className="text-sm text-fg/70">Topic or instructions</span>
            <textarea className="input mt-1 min-h-20" placeholder={`e.g. ${catMeta.hint}`} value={form.topic} onChange={(e) => set('topic', e.target.value)} maxLength={200} />
          </label>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <label className="block">
              <span className="text-sm text-fg/70">Difficulty</span>
              <select className="input mt-1" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as AiQuizRequest['difficulty'])}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-fg/70">Audience</span>
              <select className="input mt-1" value={form.audience} onChange={(e) => set('audience', e.target.value as AiQuizRequest['audience'])}>
                <option value="kids">Kids</option>
                <option value="adults">Adults</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-3 mb-4 text-sm text-fg/70">
            Questions
            <input type="range" min={3} max={30} value={form.count} onChange={(e) => set('count', +e.target.value)} className="accent-pink flex-1" />
            <span className="font-bold text-fg w-8 text-right">{form.count}</span>
          </label>

          <div className="mb-5">
            <span className="text-sm text-fg/70">Question types</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleType(t.id)}
                  className={cn('px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-colors', form.types.includes(t.id) ? 'bg-cyan/80 text-ink border-cyan' : 'border-fg/10 hover:bg-fg/10')}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={run} disabled={loading || form.types.length === 0}>
            {loading ? '🪄 Generating…' : '✨ Generate quiz'}
          </Button>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-2xl bg-red/20 border border-red/40 p-3 text-sm">
              <div className="font-semibold">Couldn't generate</div>
              <div className="text-fg/80">{error}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Button size="sm" variant="secondary" onClick={fallback}>
                  Use built-in {catMeta.label} questions instead
                </Button>
                {error.toLowerCase().includes('access code') && (
                  <Button size="sm" variant="ghost" onClick={() => navigate('/settings')}>
                    Enter access code
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </Card>

        <Card className="min-h-80">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center py-16 gap-4">
                <motion.div className="text-7xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                  🪄
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.p key={line} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-fg/70 font-display text-lg">
                    {LOADING_LINES[line]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl">{result.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <input className="input font-display font-bold text-lg !py-1.5" value={result.title} onChange={(e) => setResult({ ...result, title: e.target.value })} />
                    <p className="text-sm text-fg/60 mt-1">{result.description}</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1 mb-4">
                  {result.questions.map((q, i) => (
                    <PreviewRow key={q.id} q={q} i={i} onRemove={() => removeQuestion(q.id)} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      const s = save()
                      if (s) {
                        start(s)
                        navigate('/play/stage')
                      }
                    }}
                    disabled={result.questions.length === 0}
                  >
                    ▶️ Save & present
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const s = save()
                      if (s) navigate(`/create/manual/${s.id}`)
                    }}
                  >
                    ✏️ Save & edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      save()
                      navigate('/quizzes')
                    }}
                  >
                    💾 Save
                  </Button>
                  <Button variant="ghost" onClick={run}>
                    🔄 Regenerate
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center py-16 text-fg/50">
                <div className="text-6xl mb-3 animate-float">🤖</div>
                <p>Your generated quiz will appear here for review.</p>
                <p className="text-xs mt-2">Powered by Claude on the server — no key needed in the browser.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}

function PreviewRow({ q, i, onRemove }: { q: Question; i: number; onRemove: () => void }) {
  const badge: Record<Question['type'], string> = { slide: '🖼️', mcq: '🔠', truefalse: '✅', timed: '⏱️' }
  return (
    <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl bg-fg/5 p-3 flex gap-3">
      <div className="text-fg/40 text-sm w-6 tabular-nums pt-0.5">{i + 1}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold">
          {badge[q.type]} {q.text}
        </div>
        {q.type === 'mcq' && (
          <div className="text-xs text-fg/60 mt-1 flex flex-wrap gap-x-3">
            {q.options.map((o, j) => (
              <span key={j} className={cn(j === q.correctIndex && 'text-lime font-bold')}>
                {OPTION_LABELS[j]}. {o}
              </span>
            ))}
          </div>
        )}
        {q.type === 'truefalse' && <div className="text-xs text-lime font-bold mt-1">{q.answer ? 'TRUE' : 'FALSE'}</div>}
        {q.type === 'timed' && <div className="text-xs text-lime font-bold mt-1">→ {q.answer}</div>}
        {q.imageUrl && <img src={q.imageUrl} alt="" className="h-10 mt-1 rounded bg-fg/10 p-0.5" referrerPolicy="no-referrer" />}
      </div>
      <button onClick={onRemove} className="text-fg/30 hover:text-red self-start" aria-label="Remove question">
        ✕
      </button>
    </motion.div>
  )
}
