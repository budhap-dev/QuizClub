import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Eye, Lightbulb, Pause, Puzzle as PuzzleIcon, Shuffle, Timer, X } from 'lucide-react'
import { Button, LEVELS, LevelBadge, LevelSelect, PageHeader, TimerRing, party } from '@/components'
import { useCountdown } from '@/features/presenter/useCountdown'
import { cn, OPTION_COLORS, OPTION_LABELS, shuffle } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '@/features/games/AwardBar'
import { PuzzleFigure } from './figures/PuzzleFigure'
import { GlyphView } from './figures/GlyphView'
import { isLevel, LEVEL_POINTS, LEVEL_SECONDS, PUZZLES, puzzleTypeById } from './registry'
import type { Puzzle } from './types'

/** Shuffled within each level, easiest first, so a session warms up before it gets hard. */
const deal = (list: Puzzle[]) => shuffle(list).sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))

export function PuzzlePlayer() {
  const { type = 'mix' } = useParams()
  const [params, setParams] = useSearchParams()
  const raw = params.get('level')
  const level = isLevel(raw) ? raw : undefined
  const meta = puzzleTypeById(type)
  const mix = type === 'mix'

  const pool = useMemo(() => PUZZLES.filter((p) => mix || p.type === type), [mix, type])
  const [order, setOrder] = useState(() => deal(pool))
  const list = useMemo(() => (level ? order.filter((p) => p.level === level) : order), [order, level])
  const counts = useMemo(() => {
    const c = { all: pool.length, easy: 0, medium: 0, hard: 0 }
    for (const p of pool) c[p.level]++
    return c
  }, [pool])

  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [hint, setHint] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const p = list[Math.min(i, list.length - 1)] as Puzzle | undefined
  const typeMeta = p ? puzzleTypeById(p.type) : meta
  const accent = typeMeta?.color ?? 'var(--color-orange)'

  const timer = useCountdown(p ? LEVEL_SECONDS[p.level] : 0)
  const [timerOn, setTimerOn] = useState(false)

  const go = useCallback(
    (d: number) => {
      if (!list.length) return
      sfx.swoosh()
      setI((x) => (x + d + list.length) % list.length)
      setRevealed(false)
      setHint(false)
      setPicked(null)
      setTimerOn(false)
      timer.reset()
    },
    [list.length, timer],
  )

  const reveal = useCallback(() => {
    if (revealed) return
    setRevealed(true)
    timer.pause()
    sfx.reveal()
  }, [revealed, timer])

  const choose = (k: number) => {
    if (revealed || !p) return
    setPicked(k)
    setRevealed(true)
    timer.pause()
    if (k === p.answerIndex) {
      sfx.correct()
      party.burst()
    } else sfx.wrong()
  }

  const toggleTimer = useCallback(() => {
    if (!timerOn) {
      setTimerOn(true)
      timer.start()
    } else timer.toggle()
  }, [timer, timerOn])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ' && (e.target as HTMLElement)?.tagName !== 'BUTTON') {
        e.preventDefault()
        reveal()
      } else if (e.key === 'h' || e.key === 'H') setHint(true)
      else if (e.key === 't' || e.key === 'T') toggleTimer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, reveal, toggleTimer])

  if (!mix && !meta) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-fg/8 text-fg/50 flex items-center justify-center mx-auto mb-4">
          <PuzzleIcon size={26} />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Puzzle type not found</h1>
        <Link to="/puzzles" className="underline underline-offset-4 text-fg/70 hover:text-fg">
          Back to puzzles
        </Link>
      </div>
    )
  }

  const Icon = meta?.Icon ?? Shuffle
  const right = picked !== null && picked === p?.answerIndex
  const correctOption = p?.options && p.answerIndex !== undefined ? p.options[p.answerIndex] : undefined

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={meta?.title ?? 'Mixed bag'}
        icon={<Icon />}
        color={meta?.color ?? 'var(--color-orange)'}
        back={`/puzzles${level ? `?level=${level}` : ''}`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setOrder(deal(pool))
              setI(0)
              setRevealed(false)
              setHint(false)
              setPicked(null)
              setTimerOn(false)
              timer.reset()
            }}
          >
            <Shuffle /> Shuffle
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <LevelSelect
          label="Puzzle level"
          value={level}
          noneLabel="All levels"
          noneShort="All"
          counts={counts}
          onChange={(l) => {
            setParams(l ? { level: l } : {}, { replace: true })
            setI(0)
            setRevealed(false)
            setHint(false)
            setPicked(null)
            setTimerOn(false)
            timer.reset()
          }}
        />
        {p && (
          <span className="text-fg/50 text-sm tabular-nums sm:ml-auto">
            Puzzle {Math.min(i, list.length - 1) + 1} of {list.length}
          </span>
        )}
      </div>

      {!p ? (
        <div className="glass rounded-2xl py-16 text-center text-fg/60">
          No {level} puzzles of this type yet.{' '}
          <button className="underline underline-offset-4 hover:text-fg" onClick={() => setParams({}, { replace: true })}>
            Show all levels
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.section
              key={`${PUZZLES.indexOf(p)}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="glass rounded-2xl p-5 md:p-8"
              style={{ backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 10%, transparent), transparent 55%)` }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {mix && typeMeta && (
                    <span className="chip" style={{ color: accent }}>
                      <typeMeta.Icon size={12} /> {typeMeta.title}
                    </span>
                  )}
                  <LevelBadge level={p.level} />
                  <span className="chip tabular-nums">{LEVEL_POINTS[p.level]} pts</span>
                </div>
                {timerOn && <TimerRing total={LEVEL_SECONDS[p.level]} remaining={timer.remaining} size={56} className="ml-auto -mt-1" />}
              </div>

              <h2 className="stage-text text-2xl md:text-4xl font-semibold leading-snug mb-6 md:mb-8">{p.q}</h2>

              {p.figure && (
                <div className="mb-6 md:mb-8">
                  <PuzzleFigure figure={p.figure} accent={accent} revealed={revealed} />
                </div>
              )}

              {p.options && (
                <div className={cn('grid gap-2.5 md:gap-3 mb-6', p.options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 md:grid-cols-4')}>
                  {p.options.map((o, k) => {
                    const isRight = k === p.answerIndex
                    const wrongPick = revealed && picked === k && !isRight
                    const color = OPTION_COLORS[k]
                    return (
                      <button
                        key={k}
                        onClick={() => choose(k)}
                        disabled={revealed}
                        className={cn('rounded-2xl border p-3 md:p-4 flex items-center gap-3 text-left transition-[filter,opacity] min-h-16', !revealed && 'hover:brightness-125', revealed && !isRight && !wrongPick && 'opacity-40')}
                        style={
                          revealed && isRight
                            ? { background: 'color-mix(in srgb, var(--color-mint) 22%, transparent)', borderColor: 'var(--color-mint)' }
                            : wrongPick
                              ? { background: 'color-mix(in srgb, var(--color-red) 20%, transparent)', borderColor: 'var(--color-red)' }
                              : { background: `color-mix(in srgb, ${color} 12%, transparent)`, borderColor: `color-mix(in srgb, ${color} 40%, transparent)` }
                        }
                      >
                        <span
                          className="w-8 h-8 rounded-lg font-display font-semibold flex items-center justify-center shrink-0 text-ink"
                          style={{ background: revealed && isRight ? 'var(--color-mint)' : wrongPick ? 'var(--color-red)' : color }}
                        >
                          {revealed && isRight ? <Check size={16} strokeWidth={3} /> : wrongPick ? <X size={16} strokeWidth={3} /> : OPTION_LABELS[k]}
                        </span>
                        {typeof o === 'string' ? (
                          <span className="text-lg md:text-2xl font-display font-semibold leading-tight">{o}</span>
                        ) : (
                          <GlyphView glyph={o} accent={accent} className="w-14 h-14 md:w-20 md:h-20 mx-auto" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              <AnimatePresence>
                {hint && p.hint && !revealed && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="rounded-xl border border-sun/40 bg-sun/10 px-4 py-2.5 flex items-center gap-2.5 text-fg/85 mb-4">
                      <Lightbulb className="text-sun shrink-0" size={18} /> {p.hint}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {revealed && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {p.type !== 'spot' && (
                    <div className="rounded-2xl border px-5 py-4 flex items-center gap-4" style={{ background: 'color-mix(in srgb, var(--color-mint) 16%, transparent)', borderColor: 'color-mix(in srgb, var(--color-mint) 50%, transparent)' }}>
                      {p.emoji && <span className="text-4xl md:text-5xl leading-none">{p.emoji}</span>}
                      <div className="min-w-0">
                        {picked !== null && <div className={cn('text-sm font-semibold', right ? 'text-mint' : 'text-red')}>{right ? 'Correct!' : 'Not quite'}</div>}
                        <div className="text-xs uppercase tracking-wider text-fg/55 font-semibold">Answer</div>
                        <div className="font-display font-semibold text-2xl md:text-3xl leading-tight">
                          {p.answer ?? (typeof correctOption === 'string' ? correctOption : `Option ${OPTION_LABELS[p.answerIndex ?? 0]}`)}
                        </div>
                      </div>
                      {correctOption && typeof correctOption !== 'string' && !p.answer && <GlyphView glyph={correctOption} accent={accent} className="w-14 h-14 ml-auto shrink-0" />}
                    </div>
                  )}
                  {p.answerFigure && (
                    <div className="rounded-2xl border border-fg/12 bg-fg/[0.04] p-4">
                      <PuzzleFigure figure={p.answerFigure} accent={accent} revealed />
                    </div>
                  )}
                  {p.why && (
                    <div className="rounded-2xl border border-sun/40 bg-sun/10 px-4 py-3 flex items-start gap-3">
                      <Lightbulb className="text-sun shrink-0 mt-0.5" size={20} />
                      <div className="text-fg/85">{p.why}</div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.section>
          </AnimatePresence>

          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <Button variant="secondary" onClick={() => go(-1)} aria-label="Previous puzzle">
              <ChevronLeft /> Prev
            </Button>
            {p.hint && !revealed && (
              <Button variant="secondary" onClick={() => setHint(true)} disabled={hint}>
                <Lightbulb /> Hint
              </Button>
            )}
            {!revealed && (
              <Button variant="secondary" onClick={toggleTimer}>
                {timerOn && timer.running ? <Pause /> : <Timer />} {timerOn ? (timer.running ? 'Pause' : 'Resume') : `${LEVEL_SECONDS[p.level]}s timer`}
              </Button>
            )}
            {!revealed ? (
              <Button onClick={reveal}>
                <Eye /> Reveal answer
              </Button>
            ) : (
              <Button onClick={() => go(1)}>
                Next puzzle <ChevronRight />
              </Button>
            )}
            {!revealed && (
              <Button variant="ghost" onClick={() => go(1)} aria-label="Skip puzzle">
                Skip <ChevronRight />
              </Button>
            )}
          </div>
          <p className="hidden md:block text-center text-xs text-fg/40 mt-3">← → move · Space reveal · H hint · T timer</p>

          {revealed && <AwardBar points={LEVEL_POINTS[p.level]} reason="puzzle" title="Who solved it?" />}
        </>
      )}
    </div>
  )
}
