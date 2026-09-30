import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils'

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

export function Modal({ open, onClose, title, children, className, role = 'dialog', labelledBy }: ModalProps) {
  const titleId = useId()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            role={role}
            aria-modal="true"
            aria-labelledby={labelledBy ?? (title ? titleId : undefined)}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn(
              'glass w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 bg-ink-soft/95',
              className,
            )}
          >
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h2 id={titleId} className="text-lg font-semibold">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 -mr-1 rounded-lg flex items-center justify-center text-fg/60 hover:text-fg hover:bg-fg/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
