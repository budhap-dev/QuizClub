import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Eye, Loader2, PenLine, Play, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button, Card, LEVELS, LEVEL_LABEL, LevelBars, LevelSelect, Modal } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import { cn, tint } from '@/utils'
import { sfx } from '@/utils/sounds'
import type { Difficulty, Quiz } from '@/types'
import { QuizzesHeader } from '@/features/library/QuizzesTabs'
import { AREAS, searchBank, toQuiz, useBank, type BankQuiz } from './bank'
import { BankQuizSheet } from './BankQuizSheet'

export function QuizBank() {
  const navigate = useNavigate()
  const upsert = useQuizStore((s) => s.upsert)
  const start = useSessionStore((s) => s.start)
  const { quizzes, error } = useBank()
  const [params, setParams] = useSearchParams()
  const [viewing, setViewing] = useState<BankQuiz | null>(null)
  const [pickingLevel, setPickingLevel] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Search and filters live in the URL so Back returns to the same results.
  const query = params.get('q') ?? ''
  const area = params.get('area') ?? undefined
  const level = LEVELS.find((l) => l === params.get('level'))
  const setParam = (key: string, value?: string) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  // "/" focuses search, like most sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Level counts reflect the current search and area, so each level shows how many results it would leave.
  const unlevelled = useMemo(() => (quizzes ? searchBank(quizzes, { query, area }) : []), [quizzes, query, area])
  const hits = useMemo(() => (level ? unlevelled.filter((h) => h.quiz.difficulty === level) : unlevelled), [unlevelled, level])
  const levelCounts = useMemo(() => {
    const c = { all: unlevelled.length, easy: 0, medium: 0, hard: 0 }
    for (const h of unlevelled) c[h.quiz.difficulty]++
    return c
  }, [unlevelled])
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const q of quizzes ?? []) c[q.area.id] = (c[q.area.id] ?? 0) + 1
    return c
  }, [quizzes])
  const areas = AREAS.filter((a) => counts[a.id])
  const current = areas.find((a) => a.id === area)
  const filtered = !!(query || area || level)

  const present = (b: BankQuiz) => presentQuiz(toQuiz(b))
  const copy = (b: BankQuiz) => edit(toQuiz(b, 'manual'))
  const edit = (q: Quiz) => {
    upsert(q)
    navigate(`/create/manual/${q.id}`)
  }
  const presentQuiz = (q: Quiz) => {
    start(q)
    navigate('/play/stage')
  }

  const chip = (active: boolean, color: string) => ({
    className: cn(
      'shrink-0 h-10 md:h-9 px-3 rounded-full border text-[13px] whitespace-nowrap flex items-center gap-2 transition-colors',
      active ? 'font-semibold text-fg' : 'font-medium text-fg/80 bg-fg/4 border-fg/12 hover:bg-fg/8 hover:text-fg',
    ),
    style: active ? tint(color, 16, 50) : undefined,
  })
  const levelOptions: (Difficulty | undefined)[] = [undefined, ...LEVELS]

  return (
    <div>
      <QuizzesHeader mixInitial={{ area, level }} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-3.5 md:mb-5">
        <label className="relative flex-[1_1_320px] min-w-0 flex items-center gap-2.5 h-[46px] px-3.5 rounded-xl bg-fg/6 border border-fg/14 text-fg/60 focus-within:border-fg/30 transition-colors">
          <Search size={18} className="shrink-0" />
          <input
            ref={searchRef}
            type="search"
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] md:text-sm text-fg placeholder:text-fg/50"
            placeholder="Search by topic, e.g. cricket, planets, Bollywood"
            value={query}
            onChange={(e) => setParam('q', e.target.value)}
            aria-label="Search the quiz bank"
          />
          {query && (
            <button
              type="button"
              onClick={() => setParam('q')}
              className="w-8 h-8 -mr-1.5 rounded-lg flex items-center justify-center text-fg/50 hover:text-fg hover:bg-fg/10"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </label>
        <div className="hidden md:block">
          <LevelSelect label="Level" noneLabel="All levels" value={level} onChange={(l) => setParam('level', l)} counts={quizzes ? levelCounts : undefined} />
        </div>
      </div>

      {/* Areas: wrapping chips from md, one scrolling row on phones */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap mb-3.5" role="group" aria-label="Areas">
        <button type="button" {...chip(!area, 'var(--color-fg)')} onClick={() => setParam('area')} aria-pressed={!area}>
          All areas
        </button>
        {areas.map((a) => (
          <button key={a.id} type="button" {...chip(area === a.id, a.color)} onClick={() => setParam('area', area === a.id ? undefined : a.id)} aria-pressed={area === a.id}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} aria-hidden />
            {a.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4 md:mb-5 min-h-9 text-[13px] text-fg/65">
        {quizzes && (
          <span aria-live="polite">
            {current ? `${current.label} · ${hits.length} ${hits.length === 1 ? 'quiz' : 'quizzes'}` : `Showing ${hits.length} of ${quizzes.length}`}
            {filtered && (
              <button type="button" className="ml-2 underline underline-offset-4 hover:text-fg" onClick={() => setParams({}, { replace: true })}>
                Clear
              </button>
            )}
          </span>
        )}
        {/* Phones: the level filter folds into one button that opens a sheet. */}
        <button
          type="button"
          onClick={() => setPickingLevel(true)}
          className="md:hidden ml-auto h-9 px-2.5 rounded-[10px] border border-fg/14 flex items-center gap-1.5 text-fg font-medium"
          aria-haspopup="dialog"
        >
          {level ? <LevelBars level={level} /> : <SlidersHorizontal size={15} />}
          {level ? LEVEL_LABEL[level] : 'All levels'}
        </button>
      </div>

      {!quizzes && !error && (
        <div className="py-20 flex justify-center" role="status" aria-label="Loading">
          <Loader2 className="animate-spin text-fg/50" size={28} />
        </div>
      )}
      {error && <Card className="text-center py-10 text-fg/70">The quiz bank couldn't load. Check your connection and reload the page.</Card>}

      {quizzes && hits.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-xl bg-fg/8 text-fg/50 flex items-center justify-center mx-auto mb-4">
            <Search size={22} />
          </div>
          <p className="text-fg/70 mb-5">{query ? `No quizzes match "${query}".` : 'No quizzes match these filters.'}</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </Button>
            <Button onClick={() => navigate('/create/manual')}>
              <PenLine /> Make your own
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
        <AnimatePresence initial={false}>
          {hits.map(({ quiz: b, matchedQuestion }) => (
            <motion.article
              key={b.id}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="rounded-[18px] bg-fg/4 border border-fg/10 overflow-hidden flex flex-col"
            >
              <div className="h-11 px-[18px] flex items-center justify-between gap-3 border-b" style={tint(b.area.color, 12, 30)}>
                <span className="text-xs font-semibold uppercase tracking-[0.05em] truncate" style={{ color: b.area.color }}>
                  {b.area.label}
                </span>
                <span title={`${LEVEL_LABEL[b.difficulty]} level`}>
                  <LevelBars level={b.difficulty} size="lg" />
                </span>
              </div>
              <div className="p-[16px_18px_18px] flex-1 flex flex-col gap-2">
                <h3 className="font-display text-lg font-semibold leading-tight">{b.title}</h3>
                <p className="text-[13px] leading-normal text-fg/70 line-clamp-2">{b.description}</p>
                {matchedQuestion && (
                  <p className="text-xs text-fg/60 bg-fg/5 border border-fg/8 rounded-lg px-2.5 py-1.5 line-clamp-2">
                    <Search size={11} className="inline mr-1 -mt-0.5" />
                    {matchedQuestion}
                  </p>
                )}
                <div className="mt-auto pt-2 flex flex-wrap items-center gap-2">
                  <span className="w-full md:w-auto text-xs text-fg/65">
                    {LEVEL_LABEL[b.difficulty]} · {b.questions.length} questions
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewing(b)}
                    aria-label={`Preview ${b.title}`}
                    className="flex-1 md:flex-none md:ml-auto h-11 md:h-10 md:w-10 rounded-[10px] bg-fg/6 border border-fg/12 hover:bg-fg/12 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Eye size={17} />
                    <span className="md:hidden">Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.click()
                      present(b)
                    }}
                    className="flex-1 md:flex-none h-11 md:h-10 px-3.5 rounded-[10px] bg-pink text-on-accent font-semibold text-sm md:text-[13px] flex items-center justify-center gap-1.5 hover:brightness-110 transition-[filter]"
                  >
                    <Play size={15} /> Present
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {quizzes && (
        <p className="text-center text-sm text-fg/50 mt-8">
          Can't find a topic?{' '}
          <Link to="/create/manual" className="underline underline-offset-4 hover:text-fg">
            Make your own quiz
          </Link>
        </p>
      )}

      <Modal open={pickingLevel} onClose={() => setPickingLevel(false)} title="Level">
        <div className="grid gap-2" role="listbox" aria-label="Level">
          {levelOptions.map((l) => {
            const active = l === level
            return (
              <button
                key={l ?? 'all'}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setParam('level', l)
                  setPickingLevel(false)
                }}
                className={cn(
                  'h-12 flex items-center gap-2.5 rounded-xl border px-3.5 text-left text-sm transition-colors',
                  active ? 'bg-fg/12 border-fg/25 font-semibold' : 'bg-fg/5 border-fg/8 active:bg-fg/10',
                )}
              >
                {l ? <LevelBars level={l} /> : <SlidersHorizontal size={15} className="text-fg/60" />}
                <span className="flex-1">{l ? LEVEL_LABEL[l] : 'All levels'}</span>
                {active ? <Check size={15} className="shrink-0" /> : <span className="text-fg/45 tabular-nums text-xs">{levelCounts[l ?? 'all']}</span>}
              </button>
            )
          })}
        </div>
      </Modal>

      <BankQuizSheet quiz={viewing} onClose={() => setViewing(null)} onPresent={present} onCopy={copy} />
    </div>
  )
}
