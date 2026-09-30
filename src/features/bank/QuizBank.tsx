import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Check, ChevronDown, Copy, Eye, Loader2, Play, Search, Sparkles, X } from 'lucide-react'
import { Button, Card, LEVELS, LevelBadge, LevelSelect, Modal, PageHeader } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import { cn } from '@/utils'
import { QuizzesTabs } from '@/features/library/QuizzesTabs'
import { AREAS, searchBank, toQuiz, useBank, type BankQuiz } from './bank'
import { BankQuizSheet } from './BankQuizSheet'

export function QuizBank() {
  const navigate = useNavigate()
  const upsert = useQuizStore((s) => s.upsert)
  const start = useSessionStore((s) => s.start)
  const { quizzes, error } = useBank()
  const [params, setParams] = useSearchParams()
  const [viewing, setViewing] = useState<BankQuiz | null>(null)
  const [pickingArea, setPickingArea] = useState(false)
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

  const present = (b: BankQuiz) => {
    start(toQuiz(b))
    navigate('/play/stage')
  }
  const copy = (b: BankQuiz) => {
    const q = toQuiz(b, 'manual')
    upsert(q)
    navigate(`/create/manual/${q.id}`)
  }

  const chip = (active: boolean) =>
    cn('shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap', active ? 'bg-fg/12 border-fg/25 text-fg' : 'border-fg/10 text-fg/65 hover:bg-fg/8 hover:text-fg')

  return (
    <div>
      <PageHeader
        title="Quiz Bank"
        icon={<BookOpen />}
        color="var(--color-cyan)"
        subtitle={quizzes ? `${quizzes.length} ready-made quizzes across ${areas.length} areas. Present one as it is, or copy it to edit.` : 'Ready-made quizzes across many areas.'}
      />
      <QuizzesTabs />

      {/* Search */}
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg/45 pointer-events-none" />
        <input
          ref={searchRef}
          type="search"
          className="input !pl-11 !pr-10 !py-3 text-base"
          placeholder="Search quizzes, topics or questions…"
          value={query}
          onChange={(e) => setParam('q', e.target.value)}
          aria-label="Search the quiz bank"
        />
        {query && (
          <button
            type="button"
            onClick={() => setParam('q')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-fg/50 hover:text-fg hover:bg-fg/10"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Areas: one picker button that opens a sheet on phones, wrapping chips from sm up */}
      <div className="sm:hidden flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setPickingArea(true)}
          className="flex-1 min-w-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-fg/12 bg-fg/6 text-left active:bg-fg/10"
          aria-haspopup="dialog"
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: current?.color ?? 'color-mix(in srgb, var(--color-fg) 35%, transparent)' }} aria-hidden />
          <span className="text-fg/50 text-sm">Area</span>
          <span className="font-medium truncate">{current?.label ?? 'All areas'}</span>
          <span className="text-fg/40 text-sm tabular-nums ml-auto">{current ? counts[current.id] : quizzes?.length}</span>
          <ChevronDown size={16} className="text-fg/50 shrink-0" />
        </button>
        {current && (
          <button type="button" onClick={() => setParam('area')} className="w-11 shrink-0 rounded-xl border border-fg/12 bg-fg/6 flex items-center justify-center text-fg/60 active:bg-fg/10" aria-label="Show all areas">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="hidden sm:flex flex-wrap gap-1.5 mb-2">
        <button type="button" className={chip(!area)} onClick={() => setParam('area')} aria-pressed={!area}>
          All areas
        </button>
        {areas.map((a) => (
          <button key={a.id} type="button" className={chip(area === a.id)} onClick={() => setParam('area', area === a.id ? undefined : a.id)} aria-pressed={area === a.id}>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: a.color }} aria-hidden />
            {a.label}
            <span className="text-fg/40 ml-1.5 tabular-nums">{counts[a.id]}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-x-3 gap-y-2 flex-wrap mb-5">
        <LevelSelect label="Level" noneLabel="All levels" noneShort="All" value={level} onChange={(l) => setParam('level', l)} counts={quizzes ? levelCounts : undefined} />
        {quizzes && (
          <span className="text-sm text-fg/50 ml-auto" aria-live="polite">
            {hits.length} {hits.length === 1 ? 'quiz' : 'quizzes'}
            {filtered && (
              <button type="button" className="ml-2 underline underline-offset-4 hover:text-fg" onClick={() => setParams({}, { replace: true })}>
                Clear
              </button>
            )}
          </span>
        )}
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
            <Button onClick={() => navigate('/create/ai')}>
              <Sparkles /> Generate one with AI
            </Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence initial={false}>
          {hits.map(({ quiz: b, matchedQuestion }) => (
            <motion.div key={b.id} layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <Card tint={b.area.color} className="h-full flex flex-col">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-11 h-11 rounded-xl bg-fg/8 flex items-center justify-center text-2xl shrink-0">{b.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-snug">{b.title}</h3>
                    <div className="text-xs mt-1 flex items-center gap-1.5 flex-wrap">
                      <button type="button" className="chip hover:bg-fg/14" style={{ color: b.area.color }} onClick={() => setParam('area', b.area.id)}>
                        {b.area.label}
                      </button>
                      <LevelBadge level={b.difficulty} />
                      <span className="text-fg/50">{b.questions.length} Qs</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-fg/60 line-clamp-2 mb-2">{b.description}</p>
                {matchedQuestion && (
                  <p className="text-xs text-fg/55 bg-fg/5 border border-fg/8 rounded-lg px-2.5 py-1.5 mb-2 line-clamp-2">
                    <Search size={11} className="inline mr-1 -mt-0.5" />
                    {matchedQuestion}
                  </p>
                )}
                <div className="mt-auto pt-2 flex items-center gap-1">
                  <Button size="sm" onClick={() => present(b)}>
                    <Play /> Present
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setViewing(b)}>
                    <Eye /> View
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => copy(b)} title="Copy to My Quizzes and edit">
                    <Copy /> Copy & edit
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {quizzes && (
        <p className="text-center text-sm text-fg/45 mt-8">
          Can't find a topic?{' '}
          <Link to="/create/ai" className="underline underline-offset-4 hover:text-fg">
            Generate a quiz with AI
          </Link>
        </p>
      )}

      <Modal open={pickingArea} onClose={() => setPickingArea(false)} title="Choose an area">
        <div className="grid grid-cols-2 gap-2" role="listbox" aria-label="Areas">
          {[undefined, ...areas].map((a) => {
            const active = (a?.id ?? undefined) === area
            return (
              <button
                key={a?.id ?? 'all'}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setParam('area', a?.id)
                  setPickingArea(false)
                }}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm transition-colors',
                  !a && 'col-span-2',
                  active ? 'bg-fg/12 border-fg/25 font-semibold' : 'bg-fg/5 border-fg/8 active:bg-fg/10',
                )}
                style={active && a ? { borderColor: a.color } : undefined}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: a?.color ?? 'color-mix(in srgb, var(--color-fg) 35%, transparent)' }}
                  aria-hidden
                />
                <span className="flex-1 min-w-0 leading-tight">{a?.label ?? 'All areas'}</span>
                {active ? <Check size={15} className="shrink-0" /> : <span className="text-fg/40 tabular-nums text-xs">{a ? counts[a.id] : quizzes?.length}</span>}
              </button>
            )
          })}
        </div>
      </Modal>

      <BankQuizSheet quiz={viewing} onClose={() => setViewing(null)} onPresent={present} onCopy={copy} />
    </div>
  )
}
