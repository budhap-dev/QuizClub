import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FlaskConical,
  Film,
  Gamepad2,
  Globe,
  Landmark,
  MonitorPlay,
  Music,
  PenLine,
  Play,
  Plus,
  Puzzle,
  Search,
  Shuffle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { IconBadge, LEVEL_LABEL, SegmentedProgress, TeamChip, buttonClass } from '@/components'
import { AREAS } from '@/features/bank/bank'
import { MixSheet } from '@/features/bank/MixSheet'
import { openHostScreen } from '@/features/presenter/hostLink'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import type { Quiz } from '@/types'
import { OPTION_COLORS, OPTION_LABELS, cn, tint } from '@/utils'

const tiles: { to: string; Icon: LucideIcon; title: string; text: string; color: string }[] = [
  { to: '/play', Icon: MonitorPlay, title: 'Present a quiz', text: 'Pick a quiz, add teams and go live on the big screen.', color: 'var(--color-pink)' },
  { to: '/create/manual', Icon: PenLine, title: 'Quiz maker', text: 'Slides, multiple choice, true/false, timed and more.', color: 'var(--color-cyan)' },
  { to: '/games', Icon: Gamepad2, title: 'Party games', text: 'Wordle, Hangman, Picture Reveal and more for between rounds.', color: 'var(--color-lime)' },
  { to: '/puzzles', Icon: Puzzle, title: 'Riddles and puzzles', text: 'Eleven puzzle types, from matchsticks to rebuses.', color: 'var(--color-orange)' },
]

const AREA_ICONS: Record<string, LucideIcon> = {
  general: Sparkles,
  geography: Globe,
  history: Landmark,
  science: FlaskConical,
  movies: Film,
  music: Music,
}
const homeAreas = AREAS.filter((a) => a.id in AREA_ICONS)

const QUICK_COUNTS = [10, 20, 30]
/** Accents for the lettered badges in the library list, in turn. */
const LIBRARY_COLORS = ['var(--color-pink)', 'var(--color-cyan)', 'var(--color-lime)']
const PINK = 'var(--color-pink)'

const container = { show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

const link = 'text-sm font-medium text-purple hover:text-fg transition-colors'

const ago = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
function relativeTime(t: number) {
  const mins = Math.round((t - Date.now()) / 60000)
  if (Math.abs(mins) < 60) return mins === 0 ? 'Just now' : ago.format(mins, 'minute')
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 24) return ago.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 7) return ago.format(days, 'day')
  if (Math.abs(days) < 30) return ago.format(Math.round(days / 7), 'week')
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Area label for a quiz, when its category maps to exactly one bank area. */
const areaLabel = (q: Quiz) => (q.category === 'custom' ? undefined : AREAS.find((a) => a.category === q.category)?.label)

function SectionHeader({ title, to, linkText }: { title: string; to: string; linkText: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-3.5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link to={to} className={cn(link, 'inline-flex items-center gap-1.5')}>
        {linkText}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}

function ResumeCard() {
  const session = useSessionStore((s) => s.session)!
  const quiz = useSessionStore((s) => s.activeQuiz)!
  // Live scores are on the store's teams; session.teams is the line-up as it was at the start.
  const teams = useSessionStore((s) => s.teams)
  const total = quiz.questions.length
  const q = quiz.questions[session.index]
  const area = areaLabel(quiz)
  const meta = [area, quiz.difficulty && LEVEL_LABEL[quiz.difficulty], `Question ${session.index + 1} of ${total}`].filter(Boolean).join(' · ')

  return (
    <div className="flex-[2_1_560px] min-w-0 rounded-[20px] border p-[18px] sm:p-6 flex flex-wrap gap-6" style={tint('var(--color-purple)')}>
      <div className="flex-[3_1_300px] min-w-0 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-mint" aria-hidden />
          In progress
        </div>
        <div>
          <h2 className="font-display text-[22px] sm:text-[28px] font-semibold leading-tight">{quiz.title}</h2>
          <div className="text-sm text-fg/70 mt-1.5">{meta}</div>
        </div>
        <SegmentedProgress total={total} current={session.index} />
        {teams.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => (
              <TeamChip key={t.id} team={t} size="sm" />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2.5 mt-1">
          <Link to="/play/stage" className={buttonClass('accent', 'md', 'h-11 flex-1 sm:flex-none')}>
            <Play />
            Resume on stage
          </Link>
          <button type="button" onClick={openHostScreen} className={buttonClass('secondary', 'md', 'h-11 flex-1 sm:flex-none font-medium')}>
            Open host screen
          </button>
        </div>
      </div>

      {q && (
        <div aria-hidden className="hidden lg:flex flex-[2_1_220px] min-w-0 rounded-[14px] bg-ink border border-fg/10 p-[18px] flex-col justify-center gap-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-fg/60">
            Q{session.index + 1}
            {area && ` · ${area}`}
          </div>
          <div className="font-display text-lg font-semibold leading-tight line-clamp-3">{q.text}</div>
          {q.type === 'mcq' && (
            <div className="grid grid-cols-2 gap-1.5">
              {q.options.slice(0, 4).map((o, i) => (
                <div key={i} className="h-7 rounded-[7px] border px-2 flex items-center text-[11px] min-w-0" style={tint(OPTION_COLORS[i], 16, 45)}>
                  <span className="truncate">
                    {OPTION_LABELS[i]} · {o}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StartCard() {
  return (
    <div className="flex-[2_1_560px] min-w-0 rounded-[20px] border p-[18px] sm:p-6 flex flex-col items-start gap-4" style={tint('var(--color-purple)')}>
      <IconBadge icon={MonitorPlay} color="var(--color-purple)" size={44} />
      <div>
        <h2 className="font-display text-[22px] sm:text-[28px] font-semibold leading-tight">Start a quiz night</h2>
        <p className="text-sm text-fg/70 mt-1.5 max-w-md">Choose a quiz, add your teams and put it on the big screen. Scores and progress are kept if you step away.</p>
      </div>
      <Link to="/play" className={buttonClass('accent', 'md', 'h-11 mt-auto')}>
        <Play />
        Pick a quiz
      </Link>
    </div>
  )
}

function QuickStart() {
  const navigate = useNavigate()
  const start = useSessionStore((s) => s.start)
  const [count, setCount] = useState(10)
  const [open, setOpen] = useState(false)
  // The sheet loads the whole bank, so it mounts on first use rather than with the page.
  const [mounted, setMounted] = useState(false)
  const shuffle = () => {
    setMounted(true)
    setOpen(true)
  }
  const cyan = 'var(--color-cyan)'

  return (
    <div className="flex-[1_1_280px] min-w-0 rounded-[20px] border p-[18px] sm:p-6 flex flex-col gap-4" style={tint(cyan, 10, 38)}>
      <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-4">
        <IconBadge icon={Shuffle} color={cyan} size={44} />
        <div className="min-w-0">
          <h2 className="font-display text-lg lg:text-xl font-semibold">Random bank quiz</h2>
          <p className="text-[13px] lg:text-sm leading-normal text-fg/70 mt-0.5 lg:mt-1.5">
            Mix questions from any of the {AREAS.length} areas and go straight to the stage.
          </p>
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex flex-1 gap-1.5" role="radiogroup" aria-label="Number of questions">
          {QUICK_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={count === n}
              onClick={() => setCount(n)}
              className={cn(
                'flex-1 h-11 lg:h-9 rounded-[10px] text-sm lg:text-[13px] tabular-nums transition-colors',
                count === n ? 'bg-cyan text-on-accent font-semibold' : 'bg-fg/6 border border-fg/14 font-medium hover:bg-fg/10',
              )}
            >
              {n}
              <span className="hidden lg:inline"> Qs</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={shuffle} aria-label="Shuffle and present" className="lg:hidden w-14 h-11 rounded-[11px] bg-fg/12 hover:bg-fg/16 flex items-center justify-center transition-colors">
          <Shuffle size={18} />
        </button>
      </div>
      <div className="hidden lg:flex flex-col mt-auto">
        <button type="button" onClick={shuffle} className={buttonClass('secondary', 'md', 'h-11')}>
          Shuffle and present
          <ArrowRight />
        </button>
      </div>
      {mounted && (
        <MixSheet
          open={open}
          onClose={() => setOpen(false)}
          initial={{ count }}
          onPresent={(q) => {
            start(q)
            navigate('/play/stage')
          }}
        />
      )}
    </div>
  )
}

function Library() {
  const quizzes = useQuizStore((s) => s.quizzes)
  const navigate = useNavigate()
  const start = useSessionStore((s) => s.start)
  const recent = useMemo(() => [...quizzes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3), [quizzes])
  const present = (q: Quiz) => {
    start(q)
    navigate('/play/stage')
  }

  if (recent.length === 0) {
    return (
      <div className="rounded-2xl border border-fg/10 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-fg/70">No saved quizzes yet</span>
        <Link to="/create/manual" className={link}>
          Create one
        </Link>
      </div>
    )
  }

  const badge = (q: Quiz, i: number, size: string) => (
    <span
      aria-hidden
      className={cn('rounded-[10px] flex items-center justify-center font-display font-bold shrink-0', size)}
      style={{ background: tint(LIBRARY_COLORS[i % 3], 16).background, color: LIBRARY_COLORS[i % 3] }}
    >
      {q.title.trim().charAt(0).toUpperCase() || 'Q'}
    </span>
  )
  const count = (q: Quiz) => `${q.questions.length} ${q.questions.length === 1 ? 'question' : 'questions'}`

  return (
    <>
      {/* Phones: a compact list. */}
      <ul className="lg:hidden rounded-2xl border border-fg/10 overflow-hidden">
        {recent.map((q, i) => (
          <li key={q.id} className={cn('flex items-center gap-3 px-3.5 py-3', i > 0 && 'border-t border-fg/8')}>
            {badge(q, i, 'w-10 h-10')}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{q.title}</div>
              <div className="text-xs text-fg/65 mt-0.5">
                {count(q)} · {relativeTime(q.updatedAt)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => present(q)}
              aria-label={`Present ${q.title}`}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-pink hover:brightness-110 transition-[filter]"
              style={{ background: tint(PINK, 16).background }}
            >
              <Play size={18} />
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop: a table. */}
      <div className="hidden lg:block rounded-2xl border border-fg/10 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-fg/4 text-xs font-semibold uppercase tracking-[0.04em] text-fg/60 text-left">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Quiz
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Questions
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Last edited
              </th>
              <th scope="col" className="px-5 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {recent.map((q, i) => (
              <tr key={q.id} className="border-t border-fg/8">
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-3 min-w-0">
                    {badge(q, i, 'w-9 h-9')}
                    <span className="font-semibold truncate">{q.title}</span>
                  </span>
                </td>
                <td className="px-4 py-3.5 text-fg/75 tabular-nums">{q.questions.length}</td>
                <td className="px-4 py-3.5 text-fg/75">{relativeTime(q.updatedAt)}</td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => present(q)}
                    aria-label={`Present ${q.title}`}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] text-[13px] font-semibold text-pink hover:brightness-110 transition-[filter]"
                    style={{ background: tint(PINK, 16).background }}
                  >
                    <Play size={14} />
                    Present
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function Home() {
  const navigate = useNavigate()
  const resumable = useSessionStore((s) => !!(s.session && s.activeQuiz))
  const [query, setQuery] = useState('')

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="pt-3 lg:pt-0 flex flex-col gap-[26px] lg:gap-9">
      <motion.header variants={item} className="flex flex-wrap items-end gap-5">
        <div className="flex-[1_1_320px] min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-purple mb-1.5 lg:mb-2">Welcome back</div>
          <h1 className="text-[28px] lg:text-[40px] leading-tight font-semibold">What are we playing tonight?</h1>
        </div>
        <div className="hidden lg:flex flex-wrap gap-2.5">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              const q = query.trim()
              navigate(q ? `/quizzes/bank?q=${encodeURIComponent(q)}` : '/quizzes/bank')
            }}
          >
            <label className="flex items-center gap-2.5 w-[320px] max-w-full h-11 px-3.5 rounded-xl bg-fg/6 border border-fg/14 text-fg/60 focus-within:border-fg/30 transition-colors">
              <Search size={18} className="shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the quiz bank"
                aria-label="Search the quiz bank"
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-fg placeholder:text-fg/50"
              />
            </label>
          </form>
          <Link to="/create/manual" className={buttonClass('secondary', 'md', 'h-11')}>
            <Plus />
            New quiz
          </Link>
        </div>
      </motion.header>

      <motion.section variants={item} className="flex flex-wrap gap-5" aria-label="Tonight">
        {resumable ? <ResumeCard /> : <StartCard />}
        <QuickStart />
      </motion.section>

      <motion.section variants={item}>
        <h2 className="text-lg font-semibold mb-3.5">Create and play</h2>
        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5 lg:gap-4">
          {tiles.map(({ to, Icon, title, text, color }) => (
            <Link
              key={to}
              to={to}
              className="rounded-2xl bg-fg/4 border border-fg/10 p-3.5 lg:p-[18px] flex flex-col gap-2.5 lg:gap-3 hover:-translate-y-0.5 hover:border-fg/20 transition-[transform,border-color] motion-reduce:hover:translate-y-0"
            >
              <IconBadge icon={Icon} color={color} size={40} />
              <span className="font-semibold text-sm lg:text-[15px]">{title}</span>
              <span className="hidden lg:block text-[13px] leading-normal text-fg/65">{text}</span>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section variants={item}>
        <SectionHeader title="Browse the quiz bank" to="/quizzes/bank" linkText={`See all ${AREAS.length} areas`} />
        <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] lg:gap-3 lg:overflow-visible">
          {homeAreas.map((a) => {
            const Icon = AREA_ICONS[a.id]
            return (
              <Link
                key={a.id}
                to={`/quizzes/bank?area=${a.id}`}
                className="flex-[0_0_128px] lg:flex-auto rounded-[14px] border p-3 lg:p-3.5 flex flex-col gap-2 lg:gap-2.5 hover:-translate-y-0.5 transition-transform motion-reduce:hover:translate-y-0"
                style={tint(a.color, 10, 32)}
              >
                <Icon size={20} style={{ color: a.color }} aria-hidden />
                <span className="font-semibold text-sm leading-snug">{a.label}</span>
              </Link>
            )
          })}
        </div>
      </motion.section>

      <motion.section variants={item}>
        <SectionHeader title="Your library" to="/quizzes" linkText="Open library" />
        <Library />
      </motion.section>
    </motion.div>
  )
}
