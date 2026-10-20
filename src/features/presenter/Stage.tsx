import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Eye, Maximize, MonitorOff, MonitorSmartphone, Pause, SlidersHorizontal, Timer, Trophy, X } from 'lucide-react'
import { Button, LEVEL_LABEL, Logo, SegmentedProgress, ThemeButton, TimerRing, confirmDialog, party } from '@/components'
import { quizAreaLabel } from '@/features/bank/bank'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import type { Quiz, StagePhase, Team } from '@/types'
import { sfx } from '@/utils/sounds'
import { cn, tint } from '@/utils'
import { QuestionView } from './QuestionView'
import { Scoreboard } from './Scoreboard'
import { Podium } from './Podium'
import { HostDrawer } from './HostDrawer'
import { awardPrompt } from './HostPanels'
import { useAudioClip } from './useAudioClip'
import { useCountdown } from './useCountdown'
import { openHostScreen, useStageLink, type HostCommand } from './hostLink'

interface StageProps {
  preview?: boolean
}

const iconButton = 'w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-fg bg-fg/6 border border-fg/12 hover:bg-fg/12 transition-colors'

const ordinal = (n: number) => {
  const rem = n % 100
  return n + (rem >= 11 && rem <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
}

/** Standard competition ranks (1, 2, 2, 4): tied teams share a place. */
function rankTeams(teams: Team[]) {
  const ranks = new Map<string, number>()
  for (const t of teams) ranks.set(t.id, 1 + teams.filter((o) => o.score > t.score).length)
  return ranks
}

interface TeamCardProps {
  team: Team
  rank: number
  leader: boolean
  /** Points this team has been given on the current question. */
  gained: number
  points: number
  onAward?: () => void
}

/** A team's place and score in the stage footer; a button that awards the question's points once the answer is out. */
function TeamCard({ team, rank, leader, gained, points, onAward }: TeamCardProps) {
  const Tag = onAward ? 'button' : 'div'
  return (
    <Tag
      {...(onAward ? { type: 'button' as const, onClick: onAward, 'aria-label': `Give ${points} points to ${team.name} (now ${team.score})` } : {})}
      className={cn(
        'relative flex-[1_1_160px] min-w-0 h-16 px-4 rounded-[14px] border flex items-center gap-3 text-left',
        !leader && 'bg-fg/4 border-fg/10',
        onAward && 'cursor-pointer hover:-translate-y-0.5 hover:border-fg/40 transition-[transform,border-color] motion-reduce:hover:translate-y-0',
      )}
      style={leader ? tint(team.color) : undefined}
    >
      {/* The team colour mixed toward the text colour, so it stays readable on light and dark themes. */}
      <span className="font-display font-bold text-sm shrink-0" style={{ color: `color-mix(in srgb, ${team.color} 65%, var(--color-fg))` }}>
        {ordinal(rank)}
      </span>
      <span className="font-semibold truncate" title={team.name}>
        {team.name}
      </span>
      <span className="ml-auto font-display font-semibold text-[26px] tabular-nums">{team.score}</span>
      {/* On the corner, so it never squeezes the name. */}
      {gained > 0 && <span className="absolute -top-2 -right-1.5 rounded-md px-1.5 py-0.5 bg-mint text-ink text-xs font-bold tabular-nums shadow-sm">+{gained}</span>}
    </Tag>
  )
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
  // Team ids given this question's points; a team can appear more than once on a "name them all" question.
  const [awarded, setAwarded] = useState<string[]>([])

  const setPhase = useCallback(
    (p: StagePhase) => (preview ? setLocalPhase(p) : store.setPhase(p)),
    [preview, store],
  )

  const next = useCallback(() => {
    sfx.swoosh()
    setAwarded([])
    if (preview) {
      if (localIndex >= total - 1) setLocalPhase('podium')
      else {
        setLocalIndex((i) => i + 1)
        setLocalPhase('question')
      }
    } else store.next()
  }, [preview, localIndex, total, store])

  const prev = useCallback(() => {
    setAwarded([])
    if (preview) {
      setLocalIndex((i) => Math.max(0, i - 1))
      setLocalPhase('question')
    } else store.prev()
  }, [preview, store])

  // The option the host tapped on this question, if any; shown as right or wrong on reveal.
  const [picked, setPicked] = useState<number | null>(null)
  // Answers of a "name them all" question uncovered so far.
  const [uncovered, setUncovered] = useState<number[]>([])
  useEffect(() => {
    setPicked(null)
    setUncovered([])
  }, [question?.id])
  const audio = useAudioClip(question?.audioUrl)

  const reveal = useCallback(() => {
    if (!question || question.type === 'slide' || revealed) return
    if (question.type === 'list') setUncovered(question.answers.map((_, i) => i))
    sfx.reveal()
    setPhase('revealed')
    party.burst(0.5, 0.4)
  }, [question, revealed, setPhase])

  /** Tapping an answer locks it in: reveal, and mark the tap right or wrong. */
  const pick = useCallback(
    (i: number) => {
      if (question?.type === 'list') {
        // Uncover one answer; uncovering the last one reveals the question.
        if (revealed || uncovered.includes(i)) return
        const next = [...uncovered, i]
        setUncovered(next)
        if (next.length >= question.answers.length) {
          setPhase('revealed')
          party.burst(0.5, 0.4)
        }
        return sfx.point()
      }
      if (!question || revealed || (question.type !== 'mcq' && question.type !== 'truefalse')) return
      const right = question.type === 'mcq' ? i === question.correctIndex : (i === 0) === question.answer
      setPicked(i)
      setPhase('revealed')
      if (right) {
        sfx.correct()
        party.burst(0.5, 0.4)
      } else sfx.wrong()
    },
    [question, revealed, setPhase, uncovered],
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
        case 'p':
        case 'P':
          audio?.toggle()
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
  }, [next, prev, reveal, phase, setPhase, timer, audio])

  const awardTeam = (t: Team) => {
    // One award per team, except "name them all", which scores once per answer named.
    if (preview || !question || (question.type !== 'list' && awarded.includes(t.id))) return
    store.award(t.id, question.points, 'correct')
    sfx.correct()
    setAwarded((s) => [...s, t.id])
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
          awarded,
          uncovered,
          audio: audio ? audio.playing : null,
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
        case 'audio':
          return audio?.toggle()
      }
    },
  )
  // With a host screen connected, the big screen shows only what the room should see.
  const hostLive = link.connected

  const ranks = useMemo(() => rankTeams(teams), [teams])

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

  const hasTimer = question.type !== 'slide' && (question.timeLimit ?? 0) > 0 && (phase === 'question' || phase === 'revealed')
  const canAward = revealed && !hostLive && !preview && question.type !== 'slide'
  const meta = [quizAreaLabel(quiz), quiz.difficulty && LEVEL_LABEL[quiz.difficulty]].filter(Boolean).join(' · ')

  return (
    // Locked to the viewport on md+ so a slide never needs scrolling; phones may scroll.
    <div className="min-h-dvh md:h-dvh md:overflow-hidden flex flex-col select-none">
      <header className="shrink-0 px-3 md:px-5 lg:px-10 pt-3 md:pt-[clamp(0.75rem,3vh,1.75rem)] flex flex-wrap items-center gap-x-3 md:gap-x-6 gap-y-3">
        <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none">
          <Logo size={36} className="rounded-[10px] shrink-0" />
          <div className="min-w-0">
            <div className="font-display font-semibold text-lg leading-tight truncate">{quiz.title}</div>
            {meta && <div className="text-[13px] text-fg/65 truncate">{meta}</div>}
          </div>
        </div>

        <div className="order-last md:order-none basis-full md:basis-auto md:flex-[1_1_320px] max-w-[560px] mx-auto flex flex-col gap-2">
          <div className="flex justify-between gap-3 text-[13px] font-semibold text-fg/75 tabular-nums">
            <span>{phase === 'podium' ? 'Results' : `Question ${index + 1} of ${total}`}</span>
            {phase !== 'podium' && question.type !== 'slide' && <span>{question.points} points</span>}
          </div>
          <SegmentedProgress total={total} current={phase === 'podium' ? total : index} label={phase === 'podium' ? 'Quiz finished' : undefined} />
        </div>

        <div className="flex items-center gap-2 md:gap-2.5 ml-auto md:ml-0">
          {hasTimer && (
            <button
              onClick={revealed ? undefined : timer.toggle}
              className="shrink-0 rounded-full"
              title="Start / pause timer (T)"
              aria-label={`${timer.running ? 'Pause' : 'Start'} timer, ${Math.ceil(timer.remaining)} seconds left`}
            >
              <TimerRing total={question.timeLimit ?? 0} remaining={timer.remaining} size={56} />
            </button>
          )}
          {preview && (
            <span className="hidden sm:flex h-8 px-3 rounded-full border text-[13px] font-semibold text-sun items-center" style={tint('var(--color-sun)')}>
              Preview
            </span>
          )}
          {!preview && link.supported && (
            <button
              onClick={openHostScreen}
              className={cn(iconButton, 'hidden sm:flex w-auto px-3.5 gap-2 text-sm font-medium', hostLive && 'text-mint')}
              style={hostLive ? tint('var(--color-mint)') : undefined}
              title={hostLive ? 'Host screen connected; click to bring it forward' : 'Open the quiz master controls in a second window'}
            >
              <MonitorSmartphone size={18} />
              {hostLive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-mint" aria-hidden /> Host connected
                </>
              ) : (
                'Host screen'
              )}
            </button>
          )}
          {/* Phones keep the top bar to the essentials so the quiz title still fits. */}
          <span className="hidden sm:contents">
            <ThemeButton />
          </span>
          <button onClick={() => setDrawer(true)} className={iconButton} title="Quiz master panel (H)" aria-label="Quiz master panel">
            <SlidersHorizontal size={18} />
          </button>
          <button onClick={toggleFullscreen} className={cn(iconButton, 'hidden sm:flex')} title="Fullscreen (F)" aria-label="Fullscreen">
            <Maximize size={18} />
          </button>
          <button onClick={exit} className={iconButton} title={preview ? 'Close preview' : 'Exit'} aria-label={preview ? 'Close preview' : 'Exit stage'}>
            <X size={18} />
          </button>
        </div>
      </header>

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
              picked={picked}
              uncovered={uncovered}
              audio={audio}
              onOption={pick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team scores and controls. After reveal the team cards award points; with a host screen connected,
          the controls live there and the big screen only shows the scores. */}
      {(teams.length > 0 || !hostLive) && (
        <footer className="shrink-0 mx-3 md:mx-5 lg:mx-10 mb-3 md:mb-[clamp(0.75rem,3vh,1.75rem)] mt-1 pt-[clamp(0.75rem,2.2vh,1.25rem)] border-t border-fg/8 flex flex-wrap items-center gap-3 md:gap-4">
          {teams.length > 0 && (
            <div className="flex-[1_1_560px] min-w-0">
              {canAward && (
                <div className="text-sm text-fg/60 mb-2">
                  {awardPrompt(question)} (+{question.points})
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {teams.map((t) => (
                  <TeamCard
                    key={t.id}
                    team={t}
                    rank={ranks.get(t.id) ?? 1}
                    leader={ranks.get(t.id) === 1 && t.score > 0}
                    gained={awarded.filter((id) => id === t.id).length * question.points}
                    onAward={canAward ? () => awardTeam(t) : undefined}
                    points={question.points}
                  />
                ))}
              </div>
            </div>
          )}
          {!hostLive && (
            <div className="flex flex-wrap items-center justify-end gap-2.5 ml-auto">
              <Button size="stage" variant="secondary" onClick={prev} disabled={index === 0 && phase !== 'podium'}>
                <ChevronLeft /> Back
              </Button>
              {hasTimer && phase === 'question' && (
                <Button size="stage" variant={timer.running ? 'secondary' : 'success'} onClick={timer.toggle}>
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
                <Button size="stage" onClick={reveal}>
                  <Eye /> Reveal
                </Button>
              )}
              {phase !== 'podium' && (
                <Button size="stage" variant="secondary" onClick={toggleScores} aria-pressed={phase === 'scoreboard'} className={cn(phase === 'scoreboard' && 'ring-2 ring-fg/60')}>
                  <Trophy /> Scores
                </Button>
              )}
              {phase === 'podium' ? (
                <Button size="stage" variant="accent" onClick={exit}>
                  <Check /> Finish
                </Button>
              ) : (
                <Button size="stage" variant="accent" onClick={forward}>
                  {phase === 'scoreboard' ? 'Continue' : index >= total - 1 ? 'Results' : 'Next question'} <ChevronRight />
                </Button>
              )}
            </div>
          )}
        </footer>
      )}

      <HostDrawer open={drawer} onClose={() => setDrawer(false)} question={question} preview={preview} />
    </div>
  )
}
