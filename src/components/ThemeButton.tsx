import { useState } from 'react'
import { Modal } from './Modal'
import { ThemePicker } from './ThemePicker'
import { cn } from '@/utils'

interface ThemeButtonProps {
  className?: string
}

/** 🎨 button that opens the theme picker — used in the nav and on the presenter stage. */
export function ThemeButton({ className }: ThemeButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('px-2 py-1.5 rounded-xl text-lg hover:bg-fg/10', className)}
        title="Change theme"
        aria-label="Change theme"
      >
        🎨
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Theme">
        <ThemePicker compact />
      </Modal>
    </>
  )
}
