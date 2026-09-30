import { Copy, Play } from 'lucide-react'
import { Button, LevelBadge, Modal } from '@/components'
import { cn, OPTION_LABELS } from '@/utils'
import type { BankQuiz } from './bank'

const TYPE_LABEL = { mcq: 'MCQ', tf: 'T / F', timed: 'Timed' } as const

interface Props {
  quiz: BankQuiz | null
  onClose: () => void
  onPresent: (q: BankQuiz) => void
  onCopy: (q: BankQuiz) => void
}

/** Every question and answer of a bank quiz, so the host can check it before presenting or copying. */
export function BankQuizSheet({ quiz, onClose, onPresent, onCopy }: Props) {
  return (
    <Modal open={!!quiz} onClose={onClose} title={quiz?.title} className="sm:max-w-2xl">
      {quiz && (
        <>
          <div className="flex items-center gap-2 flex-wrap text-xs mb-3 -mt-2">
            <span className="chip" style={{ color: quiz.area.color }}>
              {quiz.area.label}
            </span>
            <LevelBadge level={quiz.difficulty} />
            <span className="text-fg/50">{quiz.questions.length} questions</span>
          </div>
          <p className="text-sm text-fg/65 mb-4">{quiz.description}</p>
          <ol className="space-y-1.5 mb-5">
            {quiz.questions.map((q, i) => (
              <li key={i} className="rounded-xl bg-fg/5 border border-fg/8 p-3 flex gap-3">
                <span className="text-fg/40 text-xs w-5 tabular-nums pt-0.5 shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium flex items-start gap-2">
                    <span className="chip shrink-0 mt-0.5">{TYPE_LABEL[q.type]}</span>
                    <span>{q.q}</span>
                  </div>
                  {q.type === 'mcq' && q.options && (
                    <div className="text-xs text-fg/60 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {q.options.map((o, j) => (
                        <span key={j} className={cn(j === q.answer && 'text-mint font-semibold')}>
                          {OPTION_LABELS[j]}. {o}
                        </span>
                      ))}
                    </div>
                  )}
                  {q.type === 'tf' && <div className="text-xs text-mint font-semibold mt-1">{q.answer ? 'TRUE' : 'FALSE'}</div>}
                  {q.type === 'timed' && <div className="text-xs text-mint font-semibold mt-1">Answer: {String(q.answer)}</div>}
                  {q.note && <div className="text-xs text-fg/45 mt-1">{q.note}</div>}
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="secondary" onClick={() => onCopy(quiz)}>
              <Copy /> Copy to My Quizzes
            </Button>
            <Button onClick={() => onPresent(quiz)}>
              <Play /> Present
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
