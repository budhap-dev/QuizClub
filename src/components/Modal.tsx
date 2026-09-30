import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils'
import { useScrollLock } from '@/utils/scrollLock'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  role?: 'dialog' | 'alertdialog'
  /** id of the element that names the dialog; defaults to the title heading. */
  labelledBy?: string
}

/** Below Tailwind's `sm` breakpoint the modal is a bottom sheet. */
const SHEET_QUERY = '(max-width: 639px)'

function useIsSheet() {
  const [sheet, setSheet] = useState(() => typeof window !== 'undefined' && window.matchMedia(SHEET_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(SHEET_QUERY)
    const onChange = () => setSheet(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return sheet
}

/** Swipe distance or speed that dismisses the sheet. */
const CLOSE_OFFSET = 90
const CLOSE_VELOCITY = 500

/**
 * Centred dialog on larger screens; on phones a bottom sheet that slides up, slides back down to close,
 * and can be swiped down by its handle. The page behind never scrolls while it is open.
 */
export function Modal({ open, onClose, title, children, className, role = 'dialog', labelledBy }: ModalProps) {
  const titleId = useId()
  const sheet = useIsSheet()
  const drag = useDragControls()
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > CLOSE_OFFSET || info.velocity.y > CLOSE_VELOCITY) onClose()
  }
  const startDrag = (e: React.PointerEvent) => sheet && drag.start(e)

  const motionProps = sheet
    ? {
        initial: { y: '100%' },
        animate: { y: 0, transition: { type: 'spring' as const, stiffness: 420, damping: 40 } },
        exit: { y: '100%', transition: { duration: 0.22, ease: 'easeIn' as const } },
        drag: 'y' as const,
        dragListener: false,
        dragControls: drag,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.8 },
        onDragEnd,
      }
    : {
        initial: { y: 16, opacity: 0, scale: 0.98 },
        animate: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 380, damping: 32 } },
        exit: { y: 16, opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
      }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 sm:backdrop-blur-sm touch-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            {...motionProps}
            onClick={(e) => e.stopPropagation()}
            role={role}
            aria-modal="true"
            aria-labelledby={labelledBy ?? (title ? titleId : undefined)}
            className={cn(
              'w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-ink-soft border border-fg/10 shadow-2xl touch-auto',
              'pb-[env(safe-area-inset-bottom)] sm:pb-0',
              className,
            )}
          >
            {sheet && (
              <div onPointerDown={startDrag} className="shrink-0 pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none" aria-hidden>
                <span className="w-10 h-1.5 rounded-full bg-fg/25" />
              </div>
            )}
            <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-5 pt-2 sm:p-6">
              {title && (
                <div onPointerDown={startDrag} className={cn('flex items-center justify-between mb-4', sheet && 'touch-none')}>
                  <h2 id={titleId} className="text-lg font-semibold">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-8 h-8 -mr-1 rounded-lg flex items-center justify-center text-fg/60 hover:text-fg hover:bg-fg/10 transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
