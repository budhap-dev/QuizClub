import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components'
import { useSessionStore } from '@/store/sessionStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { Question } from '@/types'
import { sfx } from '@/utils/sounds'
import { OPTION_LABELS } from '@/utils'

interface HostDrawerProps {
  open: boolean
  onClose: () => void
  question?: Question
  preview?: boolean
}

function answerText(q?: Question): string {
  if (!q) return ''
  switch (q.type) {
    case 'mcq':
      return `${OPTION_LABELS[q.correctIndex]} · ${q.options[q.correctIndex]}`
    case 'truefalse':
      return q.answer ? 'TRUE' : 'FALSE'
    case 'timed':
      return q.answer
    default:
      return '—'
  }
}

/** Slide-out control panel for the quiz master: answers, notes and +/- scoring. */
export function HostDrawer({ open, onClose, question, preview }: HostDrawerProps) {
  const teams = useSessionStore((s) => s.teams)
  const award = useSessionStore((s) => s.award)
  const undo = useSessionStore((s) => s.undo)
  const history = useSessionStore((s) => s.session?.history ?? [])
  const step = useSettingsStore((s) => s.scoreStep)
  const setStep = useSettingsStore((s) => s.setScoreStep)

  const bump = (teamId: string, delta: number) => {
    if (preview) return
    award(teamId, delta, 'manual')
    delta > 0 ? sfx.point() : sfx.minus()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-ink-soft/95 backdrop-blur-xl border-l border-white/10 p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">🎛️ Quiz master</h2>
              <button onClick={onClose} className="text-3xl text-white/60 hover:text-white leading-none" aria-label="Close">
                ×
              </button>
            </div>

            {question && question.type !== 'slide' && (
              <div className="glass rounded-2xl p-4 mb-4">
                <div className="text-xs uppercase tracking-wider text-white/50">Answer</div>
                <div className="font-display font-bold text-xl text-lime">{answerText(question)}</div>
                {question.hostNote && (
                  <>
                    <div className="text-xs uppercase tracking-wider text-white/50 mt-3">Note</div>
                    <div className="text-white/80 text-sm">{question.hostNote}</div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Scores</h3>
              <label className="text-sm text-white/60 flex items-center gap-2">
                step
                <input type="number" min={1} className="input !w-20 !py-1 !px-2 text-center" value={step} onChange={(e) => setStep(Math.max(1, +e.target.value))} />
              </label>
            </div>

            {teams.length === 0 && <p className="text-white/50 text-sm">No teams. Add them in Play setup.</p>}
            <div className="space-y-2">
              {[...teams]
                .sort((a, b) => b.score - a.score)
                .map((t) => (
                  <motion.div key={t.id} layout className="flex items-center gap-2 glass rounded-2xl p-2 pl-3">
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="flex-1 font-semibold truncate">{t.name}</span>
                    <span className="font-display font-bold text-xl tabular-nums w-12 text-right" style={{ color: t.color }}>
                      {t.score}
                    </span>
                    <Button size="sm" variant="danger" silent onClick={() => bump(t.id, -step)} disabled={preview} aria-label="Subtract points">
                      −
                    </Button>
                    <Button size="sm" variant="success" silent onClick={() => bump(t.id, step)} disabled={preview} aria-label="Add points">
                      +
                    </Button>
                  </motion.div>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={undo} disabled={preview || history.length === 0}>
                ↶ Undo last ({history.length})
              </Button>
            </div>

            <div className="mt-6 text-xs text-white/40 space-y-1">
              <div>
                <kbd className="bg-white/10 px-1.5 rounded">→</kbd> next · <kbd className="bg-white/10 px-1.5 rounded">←</kbd> back
              </div>
              <div>
                <kbd className="bg-white/10 px-1.5 rounded">Space</kbd> reveal · <kbd className="bg-white/10 px-1.5 rounded">T</kbd> timer
              </div>
              <div>
                <kbd className="bg-white/10 px-1.5 rounded">S</kbd> scoreboard · <kbd className="bg-white/10 px-1.5 rounded">F</kbd> fullscreen ·{' '}
                <kbd className="bg-white/10 px-1.5 rounded">H</kbd> this panel
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
