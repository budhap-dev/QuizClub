import { useState } from 'react'
import { Palette } from 'lucide-react'
import { Modal } from './Modal'
import { ThemePicker } from './ThemePicker'
import { cn } from '@/utils'

interface ThemeButtonProps {
  className?: string
}

/** Palette button that opens the theme picker — used in the nav and on the presenter stage. */
export function ThemeButton({ className }: ThemeButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-fg/70 hover:text-fg hover:bg-fg/10 transition-colors', className)}
        title="Change theme"
        aria-label="Change theme"
      >
        <Palette size={18} />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Theme">
        <ThemePicker compact />
      </Modal>
    </>
  )
}
