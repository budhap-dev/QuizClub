import { useEffect, useMemo, useState } from 'react'
import { Copy, Loader2, Play, Shuffle } from 'lucide-react'
import { Button, LevelSelect, Modal } from '@/components'
import { cn } from '@/utils'
import type { Difficulty, Quiz } from '@/types'
import { AREAS, mixPool, mixToQuiz, pickMix, useBank, type MixPick } from './bank'

const COUNTS = [10, 15, 20, 25, 30]

interface Props {
  open: boolean
  onClose: () => void
  /** Filters to start from, e.g. the area and level already chosen in the bank. */
  initial?: { area?: string; level?: Difficulty }
  onPresent: (quiz: Quiz) => void
  /** Label for the main button; Play setup uses it to pick the mix rather than start it. */
  presentLabel?: string
  onCopy?: (quiz: Quiz) => void
}

// No option letter: options are shuffled when the quiz is built, so the letter on stage will differ.
const answerOf = ({ question: q }: MixPick) =>
  q.type === 'mcq' && typeof q.answer === 'number' ? q.options?.[q.answer] : q.type === 'tf' ? (q.answer ? 'True' : 'False') : String(q.answer)

/** Build a fresh quiz from bank questions: choose areas, a level and a length, check the questions, then present or copy. */
export function MixSheet({ open, onClose, initial, onPresent, presentLabel = 'Present', onCopy }: Props) {
  const { quizzes } = useBank()
  const [areas, setAreas] = useState<string[]>([])
  const [level, setLevel] = useState<Difficulty | undefined>()
  const [count, setCount] = useState(15)
  const [seed, setSeed] = useState(0)

  // Each time the sheet opens, start from the caller's current filters.
  useEffect(() => {
    if (!open) return
    setAreas(initial?.area ? [initial.area] : [])
    setLevel(initial?.level)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const available = useMemo(() => (quizzes ? mixPool(quizzes, { areas, level }).length : 0), [quizzes, areas, level])
  // `seed` is only there so "Shuffle again" draws a new set with the same settings.
  const picks = useMemo(() => (quizzes && open ? pickMix(quizzes, { areas, level, count }) : []), [quizzes, open, areas, level, count, seed]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleArea = (id: string) => setAreas((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))
  const quiz = (source?: 'manual') => mixToQuiz(picks, { areas, level }, source)

  const chip = (active: boolean) =>
    cn('px-2.5 py-1.5 rounded-lg text-[0.8125rem] font-medium border transition-colors whitespace-nowrap', active ? 'bg-fg/12 border-fg/25 text-fg' : 'border-fg/10 text-fg/65 hover:bg-fg/8 hover:text-fg')

  return (
    <Modal open={open} onClose={onClose} title="Random mix" className="sm:max-w-2xl">
      <p className="text-sm text-fg/65 -mt-2 mb-4">A fresh quiz drawn from the bank, taking turns between the areas you pick.</p>

      <div className="text-sm font-medium mb-2">Areas</div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        <button type="button" className={chip(areas.length === 0)} onClick={() => setAreas([])} aria-pressed={areas.length === 0}>
          All areas
        </button>
        {AREAS.map((a) => (
          <button key={a.id} type="button" className={chip(areas.includes(a.id))} onClick={() => toggleArea(a.id)} aria-pressed={areas.includes(a.id)}>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: a.color }} aria-hidden />
            {a.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-fg/45 mb-4">All areas leaves out Kids; pick it on its own for a children's quiz.</p>

      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4">
        <div className="w-full sm:w-auto">
          <div className="text-sm font-medium mb-2">Level</div>
          <LevelSelect label="Level" noneLabel="Any level" noneShort="Any" value={level} onChange={setLevel} />
        </div>
        <div className="w-full sm:w-auto">
          <div className="text-sm font-medium mb-2">Questions</div>
          <div className="flex gap-0.5 bg-fg/6 border border-fg/10 rounded-lg p-0.5 w-full sm:w-fit" role="radiogroup" aria-label="Number of questions">
            {COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={count === n}
                onClick={() => setCount(n)}
                className={cn('flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-medium tabular-nums transition-colors', count === n ? 'bg-fg/12 text-fg' : 'text-fg/60 hover:text-fg')}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!quizzes ? (
        <div className="py-10 flex justify-center" role="status" aria-label="Loading">
          <Loader2 className="animate-spin text-fg/50" size={24} />
        </div>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-2">
            <div className="min-w-0">
              <div className="text-sm font-medium">Questions in this mix</div>
              <div className="text-xs text-fg/50" aria-live="polite">
                {available === 0 ? 'None match these settings.' : available < count ? `Only ${available} match, so the mix uses all of them.` : `Drawn from ${available} questions.`}
              </div>
            </div>
            <Button size="sm" variant="ghost" className="ml-auto shrink-0" onClick={() => setSeed((s) => s + 1)} disabled={available <= count}>
              <Shuffle /> Shuffle again
            </Button>
          </div>
          {picks.length === 0 ? (
            <p className="rounded-xl bg-fg/5 border border-fg/8 p-6 text-center text-sm text-fg/60 mb-5">No questions match. Try another level or more areas.</p>
          ) : (
            <ol className="space-y-1 mb-5 max-h-72 overflow-y-auto pr-1">
              {picks.map((p, i) => (
                <li key={`${p.from.id}:${p.question.q}`} className="rounded-lg bg-fg/5 border border-fg/8 px-3 py-2 flex gap-2.5 text-sm">
                  <span className="text-fg/40 text-xs w-5 tabular-nums pt-0.5 shrink-0">{i + 1}</span>
                  <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: p.from.area.color }} title={p.from.area.label} aria-hidden />
                  <span className="min-w-0">
                    <span className="block">{p.question.q}</span>
                    <span className="block text-xs text-mint font-medium mt-0.5">{answerOf(p)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        {onCopy && (
          <Button variant="secondary" onClick={() => onCopy(quiz('manual'))} disabled={picks.length === 0}>
            <Copy /> Copy & edit
          </Button>
        )}
        <Button onClick={() => onPresent(quiz())} disabled={picks.length === 0}>
          <Play /> {presentLabel}
        </Button>
      </div>
    </Modal>
  )
}
