import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Eye, Maximize2, MonitorOff, MonitorSmartphone, Pause, SlidersHorizontal, Timer, Trophy, X } from 'lucide-react'
import { Button, TeamChip, ThemeButton, confirmDialog, party } from '@/components'
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
import { openHostScreen, useStageLink, type HostCommand } from './hostLink'

interface StageProps {
  preview?: boolean
}

const topButton = 'glass rounded-lg h-9 px-3 flex items-center gap-1.5 text-sm text-fg/80 hover:text-fg hover:bg-fg/12 transition-colors'

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

  // The option the host tapped on this question, if any; shown as right or wrong on reveal.
  const [picked, setPicked] = useState<number | null>(null)
  useEffect(() => setPicked(null), [question?.id])

  const reveal = useCallback(() => {
    if (!question || question.type === 'slide' || revealed) return
    sfx.reveal()
    setPhase('revealed')
    party.burst(0.5, 0.4)
  }, [question, revealed, setPhase])

  /** Tapping an answer locks it in: reveal, and mark the tap right or wrong. */
  const pick = useCallback(
    (i: number) => {
      if (!question || revealed || (question.type !== 'mcq' && question.type !== 'truefalse')) return
      const right = question.type === 'mcq' ? i === question.correctIndex : (i === 0) === question.answer
      setPicked(i)
      setPhase('revealed')
      if (right) {
        sfx.correct()
        party.burst(0.5, 0.4)
      } else sfx.wrong()
    },
    [question, revealed, setPhase],
  )

  const timer = useCountdown(question?.timeLimit ?? 0, reveal)

  // Once the answer is showing, the countdown is over: no more ticks or time-up buzzer.
  useEffect(() => {
    if (revealed) timer.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed])

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
          if (phase === 'question') timer.toggle()
          break
        case 's':
        case 'S':
          if (phase !== 'podium') setPhase(phase === 'scoreboard' ? 'question' : 'scoreboard')
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

  const toggleScores = () => setPhase(phase === 'scoreboard' ? 'question' : 'scoreboard')
  const forward = () => (phase === 'scoreboard' ? setPhase('question') : next())

  // The host screen sees what the stage sees and drives it with the same actions as the buttons below.
  const link = useStageLink(
    preview || !quiz || !question
      ? null
      : {
          quizId: quiz.id,
          index,
          phase,
          timer: { total: question.timeLimit ?? 0, remaining: timer.remaining, running: timer.running },
          picked,
          awarded: [...awarded],
        },
    (c: HostCommand) => {
      switch (c.cmd) {
        case 'next':
          return forward()
        case 'prev':
          return prev()
        case 'reveal':
          return reveal()
        case 'timer':
          return phase === 'question' && !revealed && timer.toggle()
        case 'scores':
          return phase !== 'podium' && toggleScores()
        case 'pick':
          return pick(c.option)
        case 'award': {
          const t = teams.find((x) => x.id === c.teamId)
          return revealed && t && awardTeam(t)
        }
        case 'bump':
          store.award(c.teamId, c.delta, 'manual')
          return c.delta > 0 ? sfx.point() : sfx.minus()
        case 'undo':
          return store.undo()
      }
    },
  )
  // With a host screen connected, the big screen shows only what the room should see.
  const hostLive = link.connected

  const progress = useMemo(() => (total ? ((index + 1) / total) * 100 : 0), [index, total])

  if (!quiz || !question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-fg/8 text-fg/50 flex items-center justify-center">
          <MonitorOff size={26} />
        </div>
        <h1 className="text-2xl font-semibold">Nothing to present</h1>
        <p className="text-fg/60">Pick a quiz and add teams first.</p>
        <Button onClick={() => navigate('/play')}>Go to Play setup</Button>
      </div>
    )
  }

  const exit = async () => {
    if (preview) return navigate(-1)
    const ok = await confirmDialog({
      title: 'End this quiz?',
      message: 'The session closes and you return to Play setup. Teams stay for the next quiz.',
      confirmLabel: 'End quiz',
      cancelLabel: 'Keep presenting',
      tone: 'danger',
    })
    if (ok) {
      store.end()
      navigate('/play')
    }
  }

  return (
    // Locked to the viewport on md+ so a slide never needs scrolling; phones may scroll.
    <div className="min-h-dvh md:h-dvh md:overflow-hidden flex flex-col select-none">
      {/* Progress bar */}
      <div className="h-1 bg-fg/10 shrink-0">
        <motion.div className="h-full bg-brand" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>

      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 md:px-5 py-2 text-sm shrink-0">
        <button onClick={exit} className={topButton} title="Exit">
          <X size={16} /> {preview ? 'Close preview' : 'Exit'}
        </button>
        <div className="font-medium text-fg/70 truncate flex items-center gap-2 pl-1">
          <span>{quiz.emoji}</span>
          <span className="truncate">{quiz.title}</span>
        </div>
        <div className="ml-auto font-medium tabular-nums text-fg/60 whitespace-nowrap">{phase === 'podium' ? 'Results' : `${index + 1} / ${total}`}</div>
        {preview && <span className="chip bg-sun/20 text-sun">Preview</span>}
        {!preview && link.supported && (
          <button
            onClick={openHostScreen}
            className={cn(topButton, 'hidden sm:flex', hostLive && 'text-mint')}
            title={hostLive ? 'Host screen connected; click to bring it forward' : 'Open the quiz master controls in a second window'}
          >
            <MonitorSmartphone size={16} />
            {hostLive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-mint" aria-hidden /> Host connected
              </>
            ) : (
              'Host screen'
            )}
          </button>
        )}
        <ThemeButton className="glass" />
        <button onClick={toggleFullscreen} className={cn(topButton, 'hidden sm:flex px-2.5')} title="Fullscreen (F)" aria-label="Fullscreen">
          <Maximize2 size={16} />
        </button>
        <button onClick={() => setDrawer(true)} className={cn(topButton, 'px-2.5')} title="Quiz master panel (H)" aria-label="Quiz master panel">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Main area */}
      <AnimatePresence mode="wait">
        {phase === 'podium' ? (
          <motion.div key="podium" className="flex-1 min-h-0 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Podium teams={teams} />
          </motion.div>
        ) : phase === 'scoreboard' ? (
          <motion.div key="board" className="flex-1 min-h-0 flex" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
            <Scoreboard teams={teams} />
          </motion.div>
        ) : (
          <motion.div key={question.id} className="flex-1 min-h-0 flex" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <QuestionView
              question={question}
              revealed={revealed}
              timer={{ total: question.timeLimit ?? 0, remaining: timer.remaining, running: timer.running }}
              onToggleTimer={revealed ? undefined : timer.toggle}
              picked={picked}
              onOption={pick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Award strip: appears after reveal */}
      <AnimatePresence>
        {revealed && !hostLive && teams.length > 0 && question.type !== 'slide' && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="px-4 pb-1 flex flex-wrap items-center justify-center gap-2 shrink-0"
          >
            <span className="text-fg/60 text-sm mr-2">Who got it? (+{question.points})</span>
            {teams.map((t) => (
              <TeamChip key={t.id} team={t} onClick={() => awardTeam(t)} active={awarded.has(t.id)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls (the host screen has its own) */}
      <div className={cn('px-3 md:px-5 py-2.5 flex items-center gap-2 flex-wrap justify-center shrink-0', hostLive && 'hidden')}>
        <Button variant="secondary" onClick={prev} disabled={index === 0 && phase !== 'podium'}>
          <ChevronLeft /> Back
        </Button>
        {question.type !== 'slide' && phase === 'question' && (question.timeLimit ?? 0) > 0 && (
          <Button variant={timer.running ? 'secondary' : 'success'} onClick={timer.toggle}>
            {timer.running ? (
              <>
                <Pause /> Pause
              </>
            ) : (
              <>
                <Timer /> Start timer
              </>
            )}
          </Button>
        )}
        {question.type !== 'slide' && phase === 'question' && (
          <Button onClick={reveal}>
            <Eye /> Reveal
          </Button>
        )}
        {phase !== 'podium' && (
          <Button variant="secondary" onClick={toggleScores} className={cn(phase === 'scoreboard' && 'ring-2 ring-fg/60')}>
            <Trophy /> Scores
          </Button>
        )}
        {phase === 'podium' ? (
          <Button onClick={exit} variant="primary">
            <Check /> Finish
          </Button>
        ) : (
          <Button onClick={forward} variant="primary">
            {index >= total - 1 && phase !== 'scoreboard' ? 'Results' : 'Next'} <ChevronRight />
          </Button>
        )}
      </div>

      <HostDrawer open={drawer} onClose={() => setDrawer(false)} question={question} preview={preview} />
    </div>
  )
}
