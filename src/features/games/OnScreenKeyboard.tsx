import { motion } from 'framer-motion'
import { CornerDownLeft, Delete } from 'lucide-react'
import { cn } from '@/utils'

export type KeyStatus = 'correct' | 'present' | 'absent' | 'used'

interface OnScreenKeyboardProps {
  onKey: (key: string) => void
  statuses?: Record<string, KeyStatus>
  disabled?: boolean
  showEnter?: boolean
}

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

const statusClass: Record<KeyStatus, string> = {
  correct: 'bg-mint text-ink border-mint',
  present: 'bg-sun text-ink border-sun',
  absent: 'bg-fg/4 text-fg/30 border-transparent',
  used: 'bg-fg/4 text-fg/30 border-transparent',
}

export function OnScreenKeyboard({ onKey, statuses = {}, disabled, showEnter = true }: OnScreenKeyboardProps) {
  const Key = ({ k, wide, label }: { k: string; wide?: boolean; label?: React.ReactNode }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      disabled={disabled || statuses[k] === 'absent' || statuses[k] === 'used'}
      onClick={() => onKey(k)}
      aria-label={typeof label === 'string' ? undefined : k}
      className={cn(
        'h-12 md:h-14 rounded-lg font-semibold text-base md:text-lg transition-colors select-none border flex items-center justify-center',
        wide ? 'px-3 md:px-4 min-w-14' : 'w-8 md:w-11',
        statuses[k] ? statusClass[statuses[k]] : 'bg-fg/10 border-fg/8 hover:bg-fg/16',
        'disabled:cursor-not-allowed',
      )}
    >
      {label ?? k}
    </motion.button>
  )

  return (
    <div className="flex flex-col items-center gap-1.5 w-full max-w-2xl mx-auto">
      {ROWS.map((row, i) => (
        <div key={row} className="flex gap-1 md:gap-1.5 justify-center w-full">
          {i === 2 && showEnter && <Key k="Enter" wide label={<CornerDownLeft size={18} />} />}
          {row.split('').map((k) => (
            <Key key={k} k={k} />
          ))}
          {i === 2 && <Key k="Backspace" wide label={<Delete size={18} />} />}
        </div>
      ))}
    </div>
  )
}
