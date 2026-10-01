import { motion } from 'framer-motion'
import { Minus, Plus, Undo2 } from 'lucide-react'
import { Button, TeamChip } from '@/components'
import { useSessionStore } from '@/store/sessionStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { Question, Team } from '@/types'
import { OPTION_LABELS } from '@/utils'
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
  <div className={`text-[11px] uppercase tracking-wider text-fg/50 font-medium ${className ?? ''}`}>{children}</div>
)

/** A team's award button; shows how many times it scored when that's more than once. */
export function AwardChip({ team, count, onClick, showScore = false }: { team: Team; count: number; onClick?: () => void; showScore?: boolean }) {
  return (
    <span className="relative inline-flex">
      <TeamChip team={team} onClick={onClick} active={count > 0} showScore={showScore} />
      {count > 1 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-fg text-ink text-[11px] font-bold flex items-center justify-center tabular-nums" aria-label={`${count} answers`}>
          ×{count}
        </span>
      )}
    </span>
  )
}

/** Prompt for the award buttons: the nearest guess wins a number question. */
export const awardPrompt = (q: Question) => (q.type === 'number' ? 'Who was closest?' : q.type === 'list' ? 'Tap a team once per answer named' : 'Who got it?')

/** The answer and the quiz master's notes for one question. */
export function AnswerCard({ question }: { question: Question }) {
  if (question.type === 'slide') return null
  return (
    <div className="glass rounded-xl p-4">
      <Label>Answer</Label>
      <div className="font-display font-semibold text-lg text-lime">{answerText(question)}</div>
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
      {question.hostNote && (
        <>
          <Label className="mt-3">Note</Label>
          <div className="text-fg/80 text-sm">{question.hostNote}</div>
        </>
      )}
      {question.explanation && (
        <>
          <Label className="mt-3">Shown after the reveal</Label>
          <div className="text-fg/80 text-sm">{question.explanation}</div>
        </>
      )}
    </div>
  )
}

interface ScorePanelProps {
  onBump: (teamId: string, delta: number) => void
  onUndo: () => void
  disabled?: boolean
}

/** Teams by score with +/- buttons and undo. The caller decides where the changes are made. */
export function ScorePanel({ onBump, onUndo, disabled }: ScorePanelProps) {
  const teams = useSessionStore((s) => s.teams)
  const history = useSessionStore((s) => s.session?.history ?? [])
  const step = useSettingsStore((s) => s.scoreStep)
  const setStep = useSettingsStore((s) => s.setScoreStep)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Scores</h3>
        <label className="text-sm text-fg/60 flex items-center gap-2">
          step
          <input type="number" min={1} className="input !w-20 !py-1 !px-2 text-center" value={step} onChange={(e) => setStep(Math.max(1, +e.target.value))} />
        </label>
      </div>

      {teams.length === 0 && <p className="text-fg/50 text-sm">No teams. Add them in Play setup.</p>}
      <div className="space-y-2">
        {[...teams]
          .sort((a, b) => b.score - a.score)
          .map((t) => (
            <motion.div key={t.id} layout className="flex items-center gap-2 glass rounded-xl p-2 pl-3">
              <span className="text-xl">{t.emoji}</span>
              <span className="flex-1 font-medium truncate text-sm">{t.name}</span>
              <span className="font-display font-semibold text-lg tabular-nums w-12 text-right" style={{ color: t.color }}>
                {t.score}
              </span>
              <Button size="sm" variant="secondary" silent onClick={() => onBump(t.id, -step)} disabled={disabled} aria-label={`Subtract ${step} from ${t.name}`} className="px-2">
                <Minus />
              </Button>
              <Button size="sm" variant="success" silent onClick={() => onBump(t.id, step)} disabled={disabled} aria-label={`Add ${step} to ${t.name}`} className="px-2">
                <Plus />
              </Button>
            </motion.div>
          ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="secondary" silent onClick={onUndo} disabled={disabled || history.length === 0}>
          <Undo2 /> Undo last ({history.length})
        </Button>
      </div>
    </div>
  )
}
