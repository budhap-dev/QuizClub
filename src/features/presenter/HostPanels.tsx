import { motion } from 'framer-motion'
import { Lightbulb, Minus, Plus, Undo2 } from 'lucide-react'
import { Button } from '@/components'
import { useSessionStore } from '@/store/sessionStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { Question } from '@/types'
import { cn, OPTION_LABELS, tint } from '@/utils'
import { formatNumberAnswer, orderAnswer, orderTiles } from './questionText'

export function answerText(q?: Question): string {
  if (!q) return ''
  switch (q.type) {
    case 'mcq':
      return `${OPTION_LABELS[q.correctIndex]} · ${q.options[q.correctIndex]}`
    case 'truefalse':
      return q.answer ? 'TRUE' : 'FALSE'
    case 'timed':
      return q.answer
    case 'number':
      return formatNumberAnswer(q)
    case 'order':
      return orderAnswer(q)
    case 'list':
      return q.answers.join(' · ')
    default:
      return '—'
  }
}

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('text-[11px] uppercase tracking-wider text-fg/50 font-medium', className)}>{children}</div>
)

/** Prompt for the award buttons: the nearest guess wins a number question. */
export const awardPrompt = (q: Question) => (q.type === 'number' ? 'Who was closest?' : q.type === 'list' ? 'Tap a team once per answer named' : 'Who got it?')

interface AnswerCardProps {
  question: Question
  /** False where the answer is already on show, e.g. the host screen's marked choices. */
  showAnswer?: boolean
  /** Drop the card frame when it sits inside another card. */
  bare?: boolean
}

/** The answer and the quiz master's notes for one question. */
export function AnswerCard({ question, showAnswer = true, bare }: AnswerCardProps) {
  if (question.type === 'slide') return null
  const notes = question.hostNote || question.explanation
  if (!showAnswer && !notes) return null
  return (
    <div className={cn('space-y-3', !bare && 'rounded-[18px] bg-fg/5 border border-fg/10 p-4')}>
      {showAnswer && (
        <div>
          <Label>Answer</Label>
          <div className="font-display font-semibold text-lg text-mint">{answerText(question)}</div>
          {question.type === 'order' && (
            <ol className="mt-1.5 space-y-0.5 text-sm text-fg/80">
              {orderTiles(question)
                .sort((a, b) => a.rank - b.rank)
                .map((t) => (
                  <li key={t.letter}>
                    <span className="tabular-nums text-fg/50">{t.rank + 1}.</span> <b className="text-fg">{t.letter}</b> {t.text}
                  </li>
                ))}
            </ol>
          )}
          {question.type === 'number' && <div className="text-xs text-fg/50 mt-0.5">Award the closest guess.</div>}
        </div>
      )}
      {question.hostNote && (
        <div className="flex gap-2 text-[13px] leading-[1.45] text-fg/75">
          <Lightbulb size={16} className="text-sun shrink-0 mt-px" aria-label="Note" />
          {question.hostNote}
        </div>
      )}
      {question.explanation && (
        <div className="text-[13px] leading-[1.45] text-fg/65">
          <Label className="mb-0.5">On screen after the reveal</Label>
          {question.explanation}
        </div>
      )}
    </div>
  )
}

interface ScorePanelProps {
  onBump: (teamId: string, delta: number) => void
  onUndo: () => void
  disabled?: boolean
  /**
   * After a reveal on the host screen: + gives the question's points (once per team, or once per answer
   * on "name them all") instead of the score step.
   */
  award?: { question: Question; awarded: string[]; onAward: (teamId: string) => void }
}

/** One row per team, best first, with − and + buttons and undo. The caller decides where the changes are made. */
export function ScorePanel({ onBump, onUndo, disabled, award }: ScorePanelProps) {
  const teams = useSessionStore((s) => s.teams)
  const history = useSessionStore((s) => s.session?.history ?? [])
  const step = useSettingsStore((s) => s.scoreStep)
  const setStep = useSettingsStore((s) => s.setScoreStep)
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const top = sorted[0]?.score ?? 0
  const points = award?.question.points ?? 0

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-2.5">
        <h2 className="font-display text-[17px] font-semibold">
          {award ? (
            <>
              {awardPrompt(award.question)} <span className="text-fg/55 font-normal">+{points}</span>
            </>
          ) : (
            'Award points'
          )}
        </h2>
        <label className="text-xs text-fg/65 flex items-center gap-1.5 shrink-0">
          ±
          <input
            type="number"
            min={1}
            className="input !w-14 !h-7 !py-0 !px-1.5 text-center text-xs"
            value={step}
            onChange={(e) => setStep(Math.max(1, +e.target.value))}
            aria-label="Points per tap"
          />
          per tap
        </label>
      </div>

      {teams.length === 0 && <p className="text-fg/50 text-sm">No teams. Add them in Play setup.</p>}
      <div className="space-y-2">
        {sorted.map((t) => {
          const leader = t.score > 0 && t.score === top
          const times = award ? award.awarded.filter((id) => id === t.id).length : 0
          // Before anyone has the question's points, + hands them out; after that it's the score step again.
          const awarding = award && (award.question.type === 'list' || times === 0)
          return (
            <motion.div
              key={t.id}
              layout
              className={cn('flex items-center gap-3 rounded-[14px] border py-2.5 pr-2.5 pl-3.5', !leader && 'bg-fg/4 border-fg/10')}
              style={leader ? tint('var(--color-pink)', 10, 36) : undefined}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} aria-hidden />
              <span className="flex-1 min-w-0 font-semibold text-[15px] truncate">{t.name}</span>
              {times > 0 && (
                <span className="shrink-0 rounded-md px-1.5 py-0.5 bg-mint text-ink text-xs font-bold tabular-nums" aria-label={`Given ${times * points} points this question`}>
                  +{times * points}
                </span>
              )}
              <button
                type="button"
                onClick={() => onBump(t.id, -step)}
                disabled={disabled}
                aria-label={`Take ${step} points from ${t.name}`}
                className="w-11 h-11 rounded-xl bg-fg/8 hover:bg-fg/14 flex items-center justify-center shrink-0 transition-colors disabled:opacity-40"
              >
                <Minus size={18} />
              </button>
              <span className="w-10 text-center font-display font-semibold text-[22px] tabular-nums shrink-0">{t.score}</span>
              <button
                type="button"
                onClick={() => (awarding ? award.onAward(t.id) : onBump(t.id, step))}
                disabled={disabled}
                aria-label={awarding ? `Give ${points} points to ${t.name} for this question` : `Give ${step} points to ${t.name}`}
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-[background-color,filter] disabled:opacity-40',
                  leader ? 'bg-pink text-on-accent hover:brightness-110' : 'bg-fg/14 hover:bg-fg/20',
                )}
              >
                <Plus size={18} />
              </button>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-3">
        <Button size="sm" variant="secondary" silent onClick={onUndo} disabled={disabled || history.length === 0}>
          <Undo2 /> Undo last ({history.length})
        </Button>
      </div>
    </section>
  )
}
