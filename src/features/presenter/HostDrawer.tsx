import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, SlidersHorizontal, Undo2, X } from 'lucide-react'
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

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="bg-fg/10 border border-fg/10 px-1.5 py-0.5 rounded font-sans text-[11px]">{children}</kbd>
)

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
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-ink-soft/95 backdrop-blur-xl border-l border-fg/10 p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-purple" /> Quiz master
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-fg/60 hover:text-fg hover:bg-fg/10 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {question && question.type !== 'slide' && (
              <div className="glass rounded-xl p-4 mb-4">
                <div className="text-[11px] uppercase tracking-wider text-fg/50 font-medium">Answer</div>
                <div className="font-display font-semibold text-lg text-lime">{answerText(question)}</div>
                {question.hostNote && (
                  <>
                    <div className="text-[11px] uppercase tracking-wider text-fg/50 font-medium mt-3">Note</div>
                    <div className="text-fg/80 text-sm">{question.hostNote}</div>
                  </>
                )}
              </div>
            )}

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
                    <Button size="sm" variant="secondary" silent onClick={() => bump(t.id, -step)} disabled={preview} aria-label="Subtract points" className="px-2">
                      <Minus />
                    </Button>
                    <Button size="sm" variant="success" silent onClick={() => bump(t.id, step)} disabled={preview} aria-label="Add points" className="px-2">
                      <Plus />
                    </Button>
                  </motion.div>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={undo} disabled={preview || history.length === 0}>
                <Undo2 /> Undo last ({history.length})
              </Button>
            </div>

            <div className="mt-6 text-xs text-fg/45 space-y-1.5">
              <div>
                <Kbd>→</Kbd> next · <Kbd>←</Kbd> back
              </div>
              <div>
                <Kbd>Space</Kbd> reveal · <Kbd>T</Kbd> timer
              </div>
              <div>
                <Kbd>S</Kbd> scoreboard · <Kbd>F</Kbd> fullscreen · <Kbd>H</Kbd> this panel
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
