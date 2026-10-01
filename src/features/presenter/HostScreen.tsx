import { Check, ChevronLeft, ChevronRight, Eye, MonitorOff, MonitorSmartphone, Pause, Timer, Trophy } from 'lucide-react'
import { Button, TeamChip } from '@/components'
import { useSessionStore } from '@/store/sessionStore'
import type { Question, StagePhase } from '@/types'
import { cn, formatTime, OPTION_COLORS, OPTION_LABELS } from '@/utils'
import { AnswerCard, awardPrompt, ScorePanel } from './HostPanels'
import { useHostLink } from './hostLink'

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
  const quiz = useSessionStore((s) => s.activeQuiz)
  const session = useSessionStore((s) => s.session)
  const teams = useSessionStore((s) => s.teams)
  const { supported, connected, state, send } = useHostLink()

  // Live stage state when it's talking to us; otherwise the last saved session.
  const live = state && quiz && state.quizId === quiz.id ? state : null
  const index = live?.index ?? session?.index ?? 0
  const phase = live?.phase ?? session?.phase ?? 'question'
  const question = quiz?.questions[index]
  const upNext = quiz?.questions[index + 1]
  const total = quiz?.questions.length ?? 0
  const revealed = phase === 'revealed'
  const awarded = new Set(live?.awarded ?? [])
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

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-ink/85 backdrop-blur-md border-b border-fg/10 px-4 py-2.5 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-purple/18 text-purple flex items-center justify-center shrink-0">
          <MonitorSmartphone size={17} />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            {quiz.emoji} {quiz.title}
          </div>
          <div className="text-xs text-fg/55 tabular-nums truncate">
            {phase === 'podium' ? 'Results' : `Question ${index + 1} of ${total}`} · {PHASE_LABEL[phase]}
          </div>
        </div>
        <span
          className={cn('ml-auto chip shrink-0', connected ? 'text-mint' : 'text-sun')}
          role="status"
          title={connected ? 'Linked to the stage window' : 'Keep the stage open in the other window'}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', connected ? 'bg-mint' : 'bg-sun animate-pulse')} aria-hidden />
          {connected ? 'Linked to stage' : 'Waiting for stage'}
        </span>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 space-y-4">
        {off && (
          <p className="rounded-xl border border-sun/40 bg-sun/12 text-sm px-3.5 py-2.5">
            The stage isn't answering. Keep the presenter window open (it can be on another screen); controls work again as soon as it's back.
          </p>
        )}

        {/* What's on screen now */}
        <section className="glass rounded-2xl p-4">
          {question.type === 'slide' ? (
            <div className="text-xs uppercase tracking-wider text-fg/50 font-medium mb-1">Slide</div>
          ) : (
            <div className="text-xs uppercase tracking-wider text-fg/50 font-medium mb-1">
              {question.points} points{timed && ` · ${question.timeLimit}s`}
            </div>
          )}
          <h1 className="text-lg font-semibold leading-snug">{question.text}</h1>
          {question.type === 'slide' && question.body && <p className="text-sm text-fg/65 mt-1 whitespace-pre-line">{question.body}</p>}

          {opts.length > 0 && (
            <>
              <div className="grid gap-1.5 mt-3">
                {opts.map((o, i) => {
                  const picked = live?.picked === i
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={off || revealed || phase !== 'question'}
                      onClick={() => send({ cmd: 'pick', option: i })}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm transition-colors enabled:hover:bg-fg/8 disabled:cursor-default',
                        o.correct ? 'border-mint/60 bg-mint/10' : 'border-fg/10 bg-fg/4',
                        picked && !o.correct && 'border-red/60 bg-red/10',
                      )}
                    >
                      <span className="w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${o.color} 20%, transparent)`, color: o.color }}>
                        {o.label}
                      </span>
                      <span className="flex-1 min-w-0">{o.text}</span>
                      {picked && <span className="text-xs text-fg/60 shrink-0">locked in</span>}
                      {o.correct && <Check size={16} className="text-mint shrink-0" aria-label="Correct answer" />}
                    </button>
                  )
                })}
              </div>
              {phase === 'question' && <p className="text-xs text-fg/45 mt-2">Tap the room's answer to lock it in and reveal, or use Reveal below.</p>}
            </>
          )}
        </section>

        <AnswerCard question={question} />

        {/* Who got it */}
        {revealed && question.type !== 'slide' && teams.length > 0 && (
          <section>
            <h2 className="font-semibold mb-2">{awardPrompt(question)} <span className="text-fg/50 font-normal">+{question.points}</span></h2>
            <div className="flex flex-wrap gap-2">
              {teams.map((t) => (
                <TeamChip key={t.id} team={t} showScore={false} active={awarded.has(t.id)} onClick={off || awarded.has(t.id) ? undefined : () => send({ cmd: 'award', teamId: t.id })} />
              ))}
            </div>
          </section>
        )}

        {upNext && phase !== 'podium' && (
          <section className="rounded-xl border border-dashed border-fg/15 px-3.5 py-2.5">
            <div className="text-[11px] uppercase tracking-wider text-fg/50 font-medium">Up next</div>
            <div className="text-sm text-fg/75 line-clamp-2">{upNext.text}</div>
          </section>
        )}
        {!upNext && phase !== 'podium' && <p className="text-sm text-fg/50">This is the last question; Next shows the results.</p>}

        <ScorePanel onBump={(teamId, delta) => send({ cmd: 'bump', teamId, delta })} onUndo={() => send({ cmd: 'undo' })} disabled={off} />
      </main>

      {/* Controls, always in reach */}
      <footer className="sticky bottom-0 bg-ink/90 backdrop-blur-md border-t border-fg/10 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Button silent variant="secondary" onClick={() => send({ cmd: 'prev' })} disabled={off || (index === 0 && phase !== 'podium')} aria-label="Back">
            <ChevronLeft />
          </Button>
          {timed && phase === 'question' && (
            <Button silent variant={timer?.running ? 'secondary' : 'success'} onClick={() => send({ cmd: 'timer' })} disabled={off} className="tabular-nums">
              {timer?.running ? <Pause /> : <Timer />}
              {formatTime(timer?.remaining ?? question.timeLimit ?? 0)}
            </Button>
          )}
          {question.type !== 'slide' && phase === 'question' && (
            <Button silent onClick={() => send({ cmd: 'reveal' })} disabled={off}>
              <Eye /> Reveal
            </Button>
          )}
          {phase !== 'podium' && (
            <Button silent variant="secondary" onClick={() => send({ cmd: 'scores' })} disabled={off} className={cn(phase === 'scoreboard' && 'ring-2 ring-fg/60')} aria-label="Scoreboard">
              <Trophy />
            </Button>
          )}
          {phase !== 'podium' && (
            <Button silent className="ml-auto" onClick={() => send({ cmd: 'next' })} disabled={off}>
              {phase === 'scoreboard' ? 'Back to quiz' : index >= total - 1 ? 'Results' : 'Next'} <ChevronRight />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
