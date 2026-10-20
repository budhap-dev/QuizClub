import { useState } from 'react'
import { Palette } from 'lucide-react'
import { Modal } from './Modal'
import { ThemePicker } from './ThemePicker'
import { cn } from '@/utils'

interface ThemeButtonProps {
  className?: string
}

/** Palette button that opens the theme picker; sized to match the presenter stage's 44px top-bar buttons. */
export function ThemeButton({ className }: ThemeButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-fg bg-fg/6 border border-fg/12 hover:bg-fg/12 transition-colors', className)}
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
