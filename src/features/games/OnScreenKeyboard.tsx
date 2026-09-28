import { motion } from 'framer-motion'
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
  correct: 'bg-mint text-ink',
  present: 'bg-sun text-ink',
  absent: 'bg-white/5 text-white/30',
  used: 'bg-white/5 text-white/30',
}

export function OnScreenKeyboard({ onKey, statuses = {}, disabled, showEnter = true }: OnScreenKeyboardProps) {
  const Key = ({ k, wide, label }: { k: string; wide?: boolean; label?: string }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      disabled={disabled || statuses[k] === 'absent' || statuses[k] === 'used'}
      onClick={() => onKey(k)}
      className={cn(
        'h-12 md:h-14 rounded-xl font-display font-bold text-base md:text-xl transition-colors select-none',
        wide ? 'px-3 md:px-4 min-w-14' : 'w-8 md:w-11',
        statuses[k] ? statusClass[statuses[k]] : 'bg-white/15 hover:bg-white/25',
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
          {i === 2 && showEnter && <Key k="Enter" wide label="↵" />}
          {row.split('').map((k) => (
            <Key key={k} k={k} />
          ))}
          {i === 2 && <Key k="Backspace" wide label="⌫" />}
        </div>
      ))}
    </div>
  )
}
