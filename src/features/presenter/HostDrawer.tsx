import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSessionStore } from '@/store/sessionStore'
import type { Question } from '@/types'
import { sfx } from '@/utils/sounds'
import { AnswerCard, ScorePanel } from './HostPanels'

interface HostDrawerProps {
  open: boolean
  onClose: () => void
  question?: Question
  preview?: boolean
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="bg-fg/10 border border-fg/10 px-1.5 py-0.5 rounded font-sans text-[11px]">{children}</kbd>
)

/** Slide-out control panel for the quiz master: answers, notes and +/- scoring. */
export function HostDrawer({ open, onClose, question, preview }: HostDrawerProps) {
  const award = useSessionStore((s) => s.award)
  const undo = useSessionStore((s) => s.undo)

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
              <div className="mb-4">
                <AnswerCard question={question} />
              </div>
            )}

            <ScorePanel onBump={bump} onUndo={undo} disabled={preview} />

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
