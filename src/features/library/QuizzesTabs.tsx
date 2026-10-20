import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Plus, Shuffle } from 'lucide-react'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import type { Difficulty, Quiz } from '@/types'
import { cn, tint } from '@/utils'
import { AREAS, useBank } from '@/features/bank/bank'
import { MixSheet } from '@/features/bank/MixSheet'

const TABS = [
  { to: '/quizzes', end: true, label: 'My quizzes', short: 'Mine' },
  { to: '/quizzes/bank', end: false, label: 'Quiz bank', short: 'Bank' },
]

/** Switch between the user's own quizzes and the ready-made quiz bank: underline tabs from md, a segmented control below. */
export function QuizzesTabs() {
  return (
    <nav aria-label="Quizzes" className="flex gap-0.5 p-1 rounded-xl bg-fg/6 border border-fg/10 md:p-0 md:gap-1 md:rounded-none md:bg-transparent md:border-0 md:border-b md:border-fg/10">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cn(
              'flex-1 md:flex-none h-[38px] md:h-11 px-4 rounded-[9px] md:rounded-none md:border-b-2 md:-mb-px text-sm md:text-[15px] flex items-center justify-center transition-colors',
              isActive ? 'bg-fg/14 md:bg-transparent md:border-cyan font-semibold text-fg' : 'md:border-transparent font-medium text-fg/72 hover:text-fg',
            )
          }
        >
          <span className="md:hidden">{t.short}</span>
          <span className="hidden md:inline">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

interface QuizzesHeaderProps {
  /** Filters the random mix starts from, e.g. the bank's current area and level. */
  mixInitial?: { area?: string; level?: Difficulty }
  /** Extra buttons beside "Mix a random quiz" (My quizzes: Import and New quiz). */
  actions?: React.ReactNode
}

/** Title, bank totals, the random mix and the tabs; shared by My quizzes and the quiz bank. */
export function QuizzesHeader({ mixInitial, actions }: QuizzesHeaderProps) {
  const navigate = useNavigate()
  const upsert = useQuizStore((s) => s.upsert)
  const start = useSessionStore((s) => s.start)
  const { quizzes } = useBank()
  const [mixing, setMixing] = useState(false)
  const questions = useMemo(() => quizzes?.reduce((n, q) => n + q.questions.length, 0) ?? 0, [quizzes])
  const cyan = 'var(--color-cyan)'

  const present = (q: Quiz) => {
    start(q)
    navigate('/play/stage')
  }
  const edit = (q: Quiz) => {
    upsert(q)
    navigate(`/create/manual/${q.id}`)
  }

  return (
    <div className="flex flex-col gap-3.5 md:gap-6 pt-3 lg:pt-0 mb-3.5 md:mb-6">
      <header className="flex flex-wrap items-center md:items-end gap-2 md:gap-5">
        <div className="flex-1 md:flex-[1_1_320px] min-w-0">
          <h1 className="text-[28px] md:text-4xl leading-tight font-semibold">Quizzes</h1>
          {quizzes && (
            <p className="hidden md:block mt-2 text-[15px] text-fg/70">
              {quizzes.length} ready-made quizzes and {questions} questions across {AREAS.length} areas.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-2.5">
          <button
            type="button"
            onClick={() => setMixing(true)}
            disabled={!quizzes}
            aria-label="Mix a random quiz"
            title="Build a fresh quiz from questions across the bank"
            className="h-11 w-11 md:w-auto md:px-4 rounded-xl border flex items-center justify-center gap-2 text-cyan font-semibold text-sm hover:brightness-110 transition-[filter] disabled:opacity-50"
            style={tint(cyan, 14, 42)}
          >
            <Shuffle size={18} />
            <span className="hidden md:inline">Mix a random quiz</span>
          </button>
          {actions ?? (
            <Link to="/create/manual" aria-label="New quiz" className="md:hidden w-11 h-11 rounded-xl bg-fg/6 border border-fg/10 flex items-center justify-center hover:bg-fg/12 transition-colors">
              <Plus size={19} />
            </Link>
          )}
        </div>
      </header>
      <QuizzesTabs />
      <MixSheet open={mixing} onClose={() => setMixing(false)} initial={mixInitial} onPresent={present} onCopy={edit} />
    </div>
  )
}
