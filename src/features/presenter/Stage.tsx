import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, TeamChip, ThemeButton, party } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import type { Quiz, StagePhase, Team } from '@/types'
import { sfx } from '@/utils/sounds'
import { cn } from '@/utils'
import { QuestionView } from './QuestionView'
import { Scoreboard } from './Scoreboard'
import { Podium } from './Podium'
import { HostDrawer } from './HostDrawer'
import { useCountdown } from './useCountdown'

interface StageProps {
  preview?: boolean
}

/**
 * Full-screen presenter. In preview mode it plays a saved quiz with local state
 * and no scoring so the builder can check the flow.
 */
export function Stage({ preview }: StageProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const savedQuiz = useQuizStore((s) => (id ? s.get(id) : undefined))
  const store = useSessionStore()

  // Preview keeps its own cursor; live mode uses the persisted session.
  const [localIndex, setLocalIndex] = useState(0)
  const [localPhase, setLocalPhase] = useState<StagePhase>('question')

  const quiz: Quiz | null = preview ? (savedQuiz ?? null) : store.activeQuiz
  const index = preview ? localIndex : (store.session?.index ?? 0)
  const phase: StagePhase = preview ? localPhase : (store.session?.phase ?? 'question')
  const teams: Team[] = preview ? [] : store.teams

  const question = quiz?.questions[index]
  const total = quiz?.questions.length ?? 0
  const revealed = phase === 'revealed'
  const [drawer, setDrawer] = useState(false)
  const [awarded, setAwarded] = useState<Set<string>>(new Set())

  const setPhase = useCallback(
    (p: StagePhase) => (preview ? setLocalPhase(p) : store.setPhase(p)),
    [preview, store],
  )

  const next = useCallback(() => {
    sfx.swoosh()
    setAwarded(new Set())
    if (preview) {
      if (localIndex >= total - 1) setLocalPhase('podium')
      else {
        setLocalIndex((i) => i + 1)
        setLocalPhase('question')
      }
    } else store.next()
  }, [preview, localIndex, total, store])

  const prev = useCallback(() => {
    setAwarded(new Set())
    if (preview) {
      setLocalIndex((i) => Math.max(0, i - 1))
      setLocalPhase('question')
    } else store.prev()
  }, [preview, store])

  const reveal = useCallback(() => {
    if (!question || question.type === 'slide' || revealed) return
    sfx.reveal()
    setPhase('revealed')
    party.burst(0.5, 0.4)
  }, [question, revealed, setPhase])

  const timer = useCountdown(question?.timeLimit ?? 0, reveal)

  // Reset timer whenever the question changes.
  useEffect(() => {
    timer.reset(question?.timeLimit ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          if (phase === 'scoreboard') setPhase('question')
          else next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          prev()
          break
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (phase === 'scoreboard') setPhase('question')
          else reveal()
          break
        case 't':
        case 'T':
          timer.toggle()
          break
        case 's':
        case 'S':
          setPhase(phase === 'scoreboard' ? 'question' : 'scoreboard')
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'h':
        case 'H':
          setDrawer((d) => !d)
          break
        case 'Escape':
          setDrawer(false)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, reveal, phase, setPhase, timer])

  const awardTeam = (t: Team) => {
    if (preview || !question || awarded.has(t.id)) return
    store.award(t.id, question.points, 'correct')
    sfx.correct()
    setAwarded((s) => new Set(s).add(t.id))
  }

  const progress = useMemo(() => (total ? ((index + 1) / total) * 100 : 0), [index, total])

  if (!quiz || !question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-6xl">🤷</div>
        <h1 className="text-3xl font-bold">Nothing to present</h1>
        <p className="text-fg/60">Pick a quiz and add teams first.</p>
        <Button onClick={() => navigate('/play')}>Go to Play setup</Button>
      </div>
    )
  }

  const exit = () => {
    if (preview) navigate(-1)
    else if (confirm('End this quiz session?')) {
      store.end()
      navigate('/play')
    }
  }

  return (
    // Locked to the viewport on md+ so a slide never needs scrolling; phones may scroll.
    <div className="min-h-dvh md:h-dvh md:overflow-hidden flex flex-col select-none">
      {/* Progress bar */}
      <div className="h-1.5 bg-fg/10 shrink-0">
        <motion.div className="h-full bg-rainbow" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>

      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 md:px-5 py-2 text-sm shrink-0">
        <button onClick={exit} className="glass rounded-xl px-3 py-1.5 hover:bg-fg/20" title="Exit">
          ✕ {preview ? 'Close preview' : 'Exit'}
        </button>
        <div className="font-display font-bold text-fg/70 truncate">
          {quiz.emoji} {quiz.title}
        </div>
        <div className="ml-auto font-display font-bold tabular-nums text-fg/70">
          {phase === 'podium' ? 'Results' : `${index + 1} / ${total}`}
        </div>
        {preview && <span className="bg-sun text-ink font-bold px-2 py-0.5 rounded-lg">PREVIEW</span>}
        <ThemeButton className="glass !px-3 text-base" />
        <button onClick={toggleFullscreen} className="glass rounded-xl px-3 py-1.5 hover:bg-fg/20 hidden sm:block" title="Fullscreen (F)">
          ⛶
        </button>
        <button onClick={() => setDrawer(true)} className="glass rounded-xl px-3 py-1.5 hover:bg-fg/20" title="Quiz master panel (H)">
          🎛️
        </button>
      </div>

      {/* Main area */}
      <AnimatePresence mode="wait">
        {phase === 'podium' ? (
          <motion.div key="podium" className="flex-1 min-h-0 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Podium teams={teams} />
          </motion.div>
        ) : phase === 'scoreboard' ? (
          <motion.div key="board" className="flex-1 min-h-0 flex" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
            <Scoreboard teams={teams} />
          </motion.div>
        ) : (
          <motion.div key={question.id} className="flex-1 min-h-0 flex" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }} transition={{ duration: 0.3 }}>
            <QuestionView
              question={question}
              revealed={revealed}
              timer={{ total: question.timeLimit ?? 0, remaining: timer.remaining, running: timer.running }}
              onToggleTimer={timer.toggle}
              onOption={() => reveal()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Award strip: appears after reveal */}
      <AnimatePresence>
        {revealed && teams.length > 0 && question.type !== 'slide' && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="px-4 pb-1 flex flex-wrap items-center justify-center gap-2 shrink-0"
          >
            <span className="text-fg/60 text-sm mr-2">Who got it? (+{question.points})</span>
            {teams.map((t) => (
              <TeamChip key={t.id} team={t} onClick={() => awardTeam(t)} active={awarded.has(t.id)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="px-3 md:px-5 py-2 flex items-center gap-2 flex-wrap justify-center shrink-0">
        <Button variant="secondary" onClick={prev} disabled={index === 0 && phase !== 'podium'}>
          ← Back
        </Button>
        {question.type !== 'slide' && phase === 'question' && (question.timeLimit ?? 0) > 0 && (
          <Button variant={timer.running ? 'secondary' : 'success'} onClick={timer.toggle}>
            {timer.running ? '⏸ Pause' : '⏱ Start timer'}
          </Button>
        )}
        {question.type !== 'slide' && phase === 'question' && (
          <Button onClick={reveal}>
            👀 Reveal
          </Button>
        )}
        {phase !== 'podium' && (
          <Button variant="secondary" onClick={() => setPhase(phase === 'scoreboard' ? 'question' : 'scoreboard')} className={cn(phase === 'scoreboard' && 'ring-2 ring-fg')}>
            🏆 Scores
          </Button>
        )}
        {phase === 'podium' ? (
          <Button onClick={exit} variant="primary">
            🎉 Finish
          </Button>
        ) : (
          <Button onClick={() => (phase === 'scoreboard' ? setPhase('question') : next())} variant="primary">
            {index >= total - 1 && phase !== 'scoreboard' ? 'Results →' : 'Next →'}
          </Button>
        )}
      </div>

      <HostDrawer open={drawer} onClose={() => setDrawer(false)} question={question} preview={preview} />
    </div>
  )
}
