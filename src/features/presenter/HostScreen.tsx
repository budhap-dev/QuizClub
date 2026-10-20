import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Eye, MonitorOff, MonitorPlay, Pause, Play, Trophy, X } from 'lucide-react'
import { Button, IconBadge, SegmentedProgress, TimerRing, buttonClass } from '@/components'
import { useSessionStore } from '@/store/sessionStore'
import type { Question, StagePhase } from '@/types'
import { cn, OPTION_COLORS, OPTION_LABELS, tint } from '@/utils'
import { AnswerCard, ScorePanel } from './HostPanels'
import { useHostLink } from './hostLink'

const iconButton = 'w-11 h-11 shrink-0 rounded-xl bg-fg/6 border border-fg/10 hover:bg-fg/12 flex items-center justify-center transition-colors'
const controlCard = 'h-16 px-3.5 rounded-2xl border flex items-center gap-3 text-left transition-[filter,opacity] enabled:hover:brightness-110'

/** Bring back the stage window by name, or open it again if it was closed. */
const openStage = () => window.open('/play/stage', 'quizclub-stage')?.focus()

const PHASE_LABEL: Record<StagePhase, string> = { question: 'Question on screen', revealed: 'Answer showing', scoreboard: 'Scoreboard showing', podium: 'Results showing' }

/** The choices the room picks from, with the right one marked (true/false counts True as 0). */
function choices(q: Question): { label: string; text: string; correct: boolean; color: string }[] {
  if (q.type === 'mcq') return q.options.map((text, i) => ({ label: OPTION_LABELS[i], text, correct: i === q.correctIndex, color: OPTION_COLORS[i] }))
  if (q.type === 'truefalse')
    return [
      { label: 'T', text: 'True', correct: q.answer, color: 'var(--color-mint)' },
      { label: 'F', text: 'False', correct: !q.answer, color: 'var(--color-red)' },
    ]
  return []
}

/**
 * The quiz master's screen: a second window, usually on the laptop, while the stage runs on the big screen.
 * It shows the answer, notes and what's next, and drives the stage; the stage makes every change.
 */
export function HostScreen() {
  const navigate = useNavigate()
  const quiz = useSessionStore((s) => s.activeQuiz)
  const session = useSessionStore((s) => s.session)
  const { supported, connected, state, send } = useHostLink()

  // Live stage state when it's talking to us; otherwise the last saved session.
  const live = state && quiz && state.quizId === quiz.id ? state : null
  const index = live?.index ?? session?.index ?? 0
  const phase = live?.phase ?? session?.phase ?? 'question'
  const question = quiz?.questions[index]
  const upNext = quiz?.questions[index + 1]
  const total = quiz?.questions.length ?? 0
  const revealed = phase === 'revealed'
  const awarded = live?.awarded ?? []
  const uncovered = live?.uncovered ?? []
  const timer = live?.timer
  const off = !connected

  if (!supported || !quiz || !session || !question) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-fg/8 text-fg/50 flex items-center justify-center">
          <MonitorOff size={26} />
        </div>
        <h1 className="text-2xl font-semibold">{supported ? 'No quiz on stage' : 'Host screen not supported'}</h1>
        <p className="text-fg/60 max-w-sm">
          {supported
            ? 'Start a quiz from Play setup in the main window, then open the host screen from the stage.'
            : 'This browser cannot link two windows. Use the quiz master panel on the stage instead.'}
        </p>
      </div>
    )
  }

  const opts = choices(question)
  const timed = question.type !== 'slide' && (question.timeLimit ?? 0) > 0
  const timerLive = phase === 'question' && !revealed
  const close = () => (window.opener ? window.close() : navigate('/play/stage'))

  return (
    <div className="min-h-dvh pb-32">
      <div className="max-w-md mx-auto px-4">
        <header className="flex items-center gap-2.5 pt-3.5 pb-2.5">
          <button type="button" onClick={close} className={iconButton} aria-label={window.opener ? 'Close host screen' : 'Back to the stage'}>
            {window.opener ? <X size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold text-[17px] leading-tight">Host screen</div>
            <div className="text-xs text-fg/65 truncate">
              {quiz.title} · {PHASE_LABEL[phase]}
            </div>
          </div>
          <span
            className={cn('h-7 px-2.5 rounded-full border flex items-center gap-1.5 text-xs font-semibold shrink-0', connected ? 'text-mint' : 'bg-fg/6 border-fg/12 text-fg/70')}
            style={connected ? tint('var(--color-mint)', 14, 40) : undefined}
            role="status"
            title={connected ? 'Linked to the stage window' : 'Keep the stage open in the other window'}
          >
            <span className={cn('w-[7px] h-[7px] rounded-full', connected ? 'bg-mint' : 'bg-fg/40 animate-pulse')} aria-hidden />
            {connected ? 'On stage' : 'Stage not open'}
          </span>
        </header>

        <main className="pt-1.5 flex flex-col gap-[18px]">
          {off && (
            <div className="rounded-[14px] border text-sm px-3.5 py-3 flex flex-col gap-2.5" style={tint('var(--color-sun)', 10, 36)}>
              <p>The stage isn't answering. Keep the presenter window open (it can be on another screen); controls work again as soon as it's back.</p>
              <button type="button" onClick={openStage} className={buttonClass('secondary', 'sm', 'self-start')}>
                <MonitorPlay /> Open the stage
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-fg/70 tabular-nums">
              <span>{phase === 'podium' ? 'Results' : `Question ${index + 1} of ${total}`}</span>
              {question.type !== 'slide' && phase !== 'podium' && (
                <span>
                  {question.points} points{question.type === 'list' && ' per answer'}
                </span>
              )}
            </div>
            <SegmentedProgress total={total} current={phase === 'podium' ? total : index} label={phase === 'podium' ? 'Quiz finished' : undefined} />
          </div>

          {/* What's on screen now */}
          <section className="rounded-[18px] bg-fg/5 border border-fg/10 p-[18px] flex flex-col gap-3.5">
            {question.type === 'slide' && <div className="text-[11px] uppercase tracking-wider text-fg/50 font-medium -mb-2">Slide</div>}
            <h1 className="font-display text-[22px] leading-tight font-semibold">{question.text}</h1>
            {question.type === 'slide' && question.body && <p className="text-sm text-fg/65 -mt-1 whitespace-pre-line">{question.body}</p>}

            {question.audioUrl && (
              <Button silent size="sm" variant="secondary" className="self-start" onClick={() => send({ cmd: 'audio' })} disabled={off}>
                {live?.audio ? <Pause /> : <Play />} {live?.audio ? 'Pause clip' : 'Play clip on stage'}
              </Button>
            )}

            {opts.length > 0 && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {opts.map((o, i) => {
                    const picked = live?.picked === i
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={off || revealed || phase !== 'question'}
                        onClick={() => send({ cmd: 'pick', option: i })}
                        aria-label={`${o.label}: ${o.text}${o.correct ? ' (correct answer)' : ''}. Lock in and reveal`}
                        className={cn(
                          'min-h-10 rounded-[10px] px-3 py-2 flex items-center gap-1.5 text-left text-sm transition-colors disabled:cursor-default',
                          // `ink` on mint, as on the stage: legible on every theme, unlike on-accent on Neon.
                          o.correct ? 'bg-mint text-ink font-semibold' : 'bg-fg/5 text-fg/70 enabled:hover:bg-fg/10',
                          picked && !o.correct && 'bg-red/15 text-fg ring-1 ring-red/60',
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          {o.label} · {o.text}
                        </span>
                        {o.correct && <Check size={16} className="shrink-0" aria-hidden />}
                        {picked && !o.correct && <span className="text-[11px] text-fg/60 shrink-0">picked</span>}
                      </button>
                    )
                  })}
                </div>
                {phase === 'question' && <p className="text-xs text-fg/50 mt-2">Tap the room's answer to lock it in and reveal.</p>}
              </div>
            )}

            {question.type === 'list' && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {question.answers.map((a, i) => {
                    const shown = revealed || uncovered.includes(i)
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={off || shown}
                        onClick={() => send({ cmd: 'pick', option: i })}
                        className={cn(
                          'min-h-10 rounded-[10px] px-3 py-2 flex items-center gap-2 text-left text-sm transition-colors disabled:cursor-default',
                          shown ? 'bg-mint/15 text-fg' : 'bg-fg/5 text-fg/75 enabled:hover:bg-fg/10',
                        )}
                      >
                        <span className="text-xs font-bold tabular-nums text-fg/50">{i + 1}</span>
                        <span className="flex-1 min-w-0">{a}</span>
                        {shown ? <Check size={15} className="text-mint shrink-0" aria-label="On screen" /> : <Eye size={15} className="text-fg/40 shrink-0" aria-label="Uncover" />}
                      </button>
                    )
                  })}
                </div>
                {!revealed && <p className="text-xs text-fg/50 mt-2">Tap an answer to uncover it on screen when a team names it.</p>}
              </div>
            )}

            {/* The answer line for the other types; just the notes where the choices already show it. */}
            <AnswerCard question={question} bare showAnswer={opts.length === 0 && question.type !== 'list'} />
          </section>

          {/* Stage controls */}
          {(phase === 'question' || phase === 'revealed') && question.type !== 'slide' && (
            <section className="grid grid-cols-2 gap-2.5">
              {timed && (
                <button
                  type="button"
                  onClick={() => send({ cmd: 'timer' })}
                  disabled={off || !timerLive}
                  className={cn(controlCard, 'disabled:opacity-50')}
                  style={tint('var(--color-sun)', 10, 38)}
                >
                  <span className="relative shrink-0" role="img" aria-label={`${Math.ceil(timer?.remaining ?? question.timeLimit ?? 0)} seconds left`}>
                    <TimerRing total={question.timeLimit ?? 0} remaining={timer?.remaining ?? question.timeLimit ?? 0} size={40} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-sm">{!timerLive ? 'Timer stopped' : timer?.running ? 'Pause timer' : 'Start timer'}</span>
                    <span className="block text-xs text-fg/65">of {question.timeLimit} seconds</span>
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => send({ cmd: 'reveal' })}
                disabled={off || revealed}
                aria-pressed={revealed}
                // Stays bright once revealed: it reads as the "on" state rather than a disabled button.
                className={cn(controlCard, !timed && 'col-span-2', !revealed && 'disabled:opacity-50')}
                style={tint('var(--color-mint)', revealed ? 14 : 10, 40)}
              >
                <IconBadge icon={Eye} color="var(--color-mint)" size={40} />
                <span className="min-w-0">
                  <span className="block font-semibold text-sm">{revealed ? 'Revealed' : 'Reveal answer'}</span>
                  <span className="block text-xs text-fg/65">{revealed ? 'On the big screen' : 'Show it on screen'}</span>
                </span>
              </button>
            </section>
          )}
          {phase !== 'podium' && (
            <Button
              silent
              variant="secondary"
              onClick={() => send({ cmd: 'scores' })}
              disabled={off}
              aria-pressed={phase === 'scoreboard'}
              className={cn('h-11 -mt-2', phase === 'scoreboard' && 'ring-2 ring-fg/60')}
            >
              <Trophy /> {phase === 'scoreboard' ? 'Hide scoreboard' : 'Show scoreboard'}
            </Button>
          )}

          <ScorePanel
            onBump={(teamId, delta) => send({ cmd: 'bump', teamId, delta })}
            onUndo={() => send({ cmd: 'undo' })}
            disabled={off}
            award={revealed && question.type !== 'slide' ? { question, awarded, onAward: (teamId) => send({ cmd: 'award', teamId }) } : undefined}
          />

          {upNext && phase !== 'podium' && (
            <section className="rounded-[14px] border border-dashed border-fg/15 px-3.5 py-2.5">
              <div className="text-[11px] uppercase tracking-wider text-fg/50 font-medium">Up next</div>
              <div className="text-sm text-fg/70 line-clamp-2">{upNext.text}</div>
            </section>
          )}
          {!upNext && phase !== 'podium' && <p className="text-sm text-fg/50">This is the last question; Next shows the results.</p>}
        </main>
      </div>

      {/* Always in reach */}
      <footer className="fixed inset-x-0 bottom-0 z-20 bg-ink-soft/96 border-t border-fg/10 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="max-w-md mx-auto flex gap-2.5">
          <button
            type="button"
            onClick={() => send({ cmd: 'prev' })}
            disabled={off || (index === 0 && phase !== 'podium')}
            aria-label="Previous question"
            className="w-14 h-[54px] shrink-0 rounded-[14px] bg-fg/6 border border-fg/14 hover:bg-fg/12 flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <ChevronLeft size={22} />
          </button>
          <Button silent variant="accent" size="stage" className="flex-1 h-[54px] text-base" onClick={() => send({ cmd: 'next' })} disabled={off || phase === 'podium'}>
            {phase === 'podium' ? 'Results on screen' : phase === 'scoreboard' ? 'Back to quiz' : index >= total - 1 ? 'Results' : 'Next question'}
            {phase !== 'podium' && <ChevronRight />}
          </Button>
        </div>
      </footer>
    </div>
  )
}
