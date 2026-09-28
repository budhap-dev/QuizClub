import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, Reorder, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Copy, Eye, PenLine, Play, Plus, Save, Trash2 } from 'lucide-react'
import { Button, Card, EmojiPicker, Modal, PageHeader } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useSessionStore } from '@/store/sessionStore'
import type { Question, Quiz, QuizCategory } from '@/types'
import { cn, uid } from '@/utils'
import { QuestionEditor, convertType } from './QuestionEditor'

const CATEGORIES: { id: QuizCategory; label: string }[] = [
  { id: 'custom', label: 'Custom' },
  { id: 'general', label: 'General knowledge' },
  { id: 'geography', label: 'Geography' },
  { id: 'science', label: 'Science' },
  { id: 'literature', label: 'Literature' },
  { id: 'maths', label: 'Maths' },
  { id: 'movies', label: 'Movies' },
  { id: 'sports', label: 'Sports' },
  { id: 'music', label: 'Music' },
  { id: 'history', label: 'History' },
  { id: 'flags', label: 'Flags' },
  { id: 'logos', label: 'Logos' },
]

const TYPE_LABEL: Record<Question['type'], string> = { slide: 'Slide', mcq: 'MCQ', truefalse: 'T / F', timed: 'Timed' }

function blankQuiz(): Quiz {
  const now = Date.now()
  return { id: uid('quiz'), title: '', description: '', category: 'custom', emoji: '🧠', source: 'manual', questions: [], createdAt: now, updatedAt: now }
}

/** Validation issues per question, used to block saving obviously broken quizzes. */
function issues(q: Question): string | null {
  if (!q.text.trim()) return 'Missing question text'
  if (q.type === 'mcq') {
    if (q.options.some((o) => !o.trim())) return 'Empty option'
    if (q.options.length < 2) return 'Need at least 2 options'
  }
  if (q.type === 'timed' && !q.answer.trim()) return 'Missing answer'
  return null
}

export function ManualBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useQuizStore((s) => (id ? s.get(id) : undefined))
  const upsert = useQuizStore((s) => s.upsert)
  const start = useSessionStore((s) => s.start)
  const { defaultPoints, defaultTimeLimit } = useSettingsStore()

  const [quiz, setQuiz] = useState<Quiz>(() => existing ?? blankQuiz())
  const [selected, setSelected] = useState<string | null>(quiz.questions[0]?.id ?? null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [dirty, setDirty] = useState(false)

  // If navigating between /create/manual/:id routes, load the requested quiz.
  useEffect(() => {
    if (existing && existing.id !== quiz.id) {
      setQuiz(existing)
      setSelected(existing.questions[0]?.id ?? null)
      setDirty(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id])

  const update = (p: Partial<Quiz>) => {
    setQuiz((q) => ({ ...q, ...p }))
    setDirty(true)
  }
  const setQuestions = (questions: Question[]) => update({ questions })

  const current = useMemo(() => quiz.questions.find((q) => q.id === selected), [quiz.questions, selected])
  const problems = quiz.questions.map(issues)
  const invalidCount = problems.filter(Boolean).length
  const canSave = quiz.title.trim().length > 0 && quiz.questions.length > 0 && invalidCount === 0

  const addQuestion = (type: Question['type'] = 'mcq') => {
    const base: Question = { id: uid('q'), type: 'mcq', text: '', options: ['', '', '', ''], correctIndex: 0, points: defaultPoints, timeLimit: defaultTimeLimit }
    const q = type === 'mcq' ? base : convertType(base, type)
    setQuestions([...quiz.questions, q])
    setSelected(q.id)
  }

  const duplicateQuestion = (qid: string) => {
    const i = quiz.questions.findIndex((q) => q.id === qid)
    if (i < 0) return
    const copy = { ...quiz.questions[i], id: uid('q') }
    const next = [...quiz.questions]
    next.splice(i + 1, 0, copy)
    setQuestions(next)
    setSelected(copy.id)
  }

  const removeQuestion = (qid: string) => {
    const next = quiz.questions.filter((q) => q.id !== qid)
    setQuestions(next)
    if (selected === qid) setSelected(next[0]?.id ?? null)
  }

  const save = (): Quiz => {
    const saved = { ...quiz, title: quiz.title.trim() || 'Untitled quiz' }
    upsert(saved)
    setQuiz(saved)
    setDirty(false)
    return saved
  }

  return (
    <div>
      <PageHeader
        title={existing ? 'Edit Quiz' : 'Manual Quiz Maker'}
        icon={<PenLine />}
        color="var(--color-cyan)"
        back="/quizzes"
        subtitle={dirty ? 'Unsaved changes' : undefined}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={!canSave}
              onClick={() => {
                const s = save()
                navigate(`/preview/${s.id}`)
              }}
            >
              <Eye /> Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!canSave}
              onClick={() => {
                const s = save()
                start(s)
                navigate('/play/stage')
              }}
            >
              <Play /> Present
            </Button>
            <Button size="sm" disabled={!canSave} onClick={() => save()}>
              <Save /> Save
            </Button>
          </>
        }
      />

      {/* Quiz meta */}
      <Card className="mb-4">
        <div className="flex gap-3 items-start flex-wrap">
          <button
            type="button"
            onClick={() => setEmojiOpen(true)}
            className="w-[5.5rem] h-[5.5rem] rounded-xl bg-fg/8 border border-fg/10 text-3xl hover:bg-fg/14 transition-colors shrink-0"
            title="Pick an emoji"
            aria-label="Pick an emoji"
          >
            {quiz.emoji}
          </button>
          <div className="flex-1 min-w-52 space-y-2">
            <input className="input text-lg font-semibold" placeholder="Quiz title" value={quiz.title} onChange={(e) => update({ title: e.target.value })} />
            <input className="input" placeholder="Short description (optional)" value={quiz.description ?? ''} onChange={(e) => update({ description: e.target.value })} />
          </div>
          <select className="input !w-auto" value={quiz.category} onChange={(e) => update({ category: e.target.value as QuizCategory })}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* min-w-0 lets each card shrink below its content's min-content width on phones */}
      <div className="grid grid-cols-1 md:grid-cols-[18rem_1fr] gap-4">
        {/* Question list */}
        <Card className="min-w-0 md:max-h-[70vh] md:overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Questions ({quiz.questions.length})</h2>
          </div>
          <Reorder.Group axis="y" values={quiz.questions} onReorder={setQuestions} className="space-y-1">
            <AnimatePresence initial={false}>
              {quiz.questions.map((q, i) => (
                <Reorder.Item
                  key={q.id}
                  value={q}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  onClick={() => setSelected(q.id)}
                  className={cn(
                    'rounded-lg px-2.5 py-2 flex items-center gap-2 cursor-grab active:cursor-grabbing border transition-colors',
                    selected === q.id ? 'bg-fg/12 border-purple' : 'bg-fg/5 border-transparent hover:bg-fg/10',
                  )}
                >
                  <span className="text-fg/40 text-xs w-4 tabular-nums">{i + 1}</span>
                  <span className="chip">{TYPE_LABEL[q.type]}</span>
                  <span className="flex-1 truncate text-sm">{q.text || <i className="text-fg/40">Untitled</i>}</span>
                  {problems[i] && <AlertTriangle size={14} className="text-sun shrink-0" aria-label={problems[i]!} />}
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Button size="sm" variant="secondary" onClick={() => addQuestion('mcq')}>
              <Plus /> MCQ
            </Button>
            <Button size="sm" variant="secondary" onClick={() => addQuestion('truefalse')}>
              <Plus /> T / F
            </Button>
            <Button size="sm" variant="secondary" onClick={() => addQuestion('timed')}>
              <Plus /> Timed
            </Button>
            <Button size="sm" variant="secondary" onClick={() => addQuestion('slide')}>
              <Plus /> Slide
            </Button>
          </div>
          <p className="text-xs text-fg/40 mt-2">Drag to reorder.</p>
        </Card>

        {/* Editor */}
        <Card className="min-w-0">
          {current ? (
            <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Question {quiz.questions.findIndex((q) => q.id === current.id) + 1}</h2>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => duplicateQuestion(current.id)}>
                    <Copy /> Duplicate
                  </Button>
                  <Button size="sm" variant="ghost" className="text-fg/60 hover:text-red" onClick={() => removeQuestion(current.id)}>
                    <Trash2 /> Delete
                  </Button>
                </div>
              </div>
              <QuestionEditor question={current} onChange={(q) => setQuestions(quiz.questions.map((x) => (x.id === q.id ? q : x)))} />
            </motion.div>
          ) : (
            <div className="text-center py-16 text-fg/60 text-sm">
              <div className="w-12 h-12 rounded-xl bg-fg/8 text-fg/50 flex items-center justify-center mx-auto mb-4">
                <PenLine size={22} />
              </div>
              Add a question to start building.
            </div>
          )}
        </Card>
      </div>

      <Modal open={emojiOpen} onClose={() => setEmojiOpen(false)} title="Quiz emoji">
        <EmojiPicker
          value={quiz.emoji}
          onChange={(emoji) => {
            update({ emoji })
            setEmojiOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
