import { cn } from '@/utils'

const EMOJIS = [
  '🧠', '🎯', '🏆', '🌍', '🚩', '🔬', '📚', '🎬', '⚽', '🎵', '🏛️', '➗', '🧪', '🎨', '🎮', '🍕', '🐾', '🚀', '💡', '🎉',
  '🦁', '🐯', '🐸', '🦊', '🐼', '🦄', '🐙', '🦖', '🐧', '🦋', '🐨', '🦩', '🐲', '🦈', '🐝', '🦜', '🐢', '🐬', '🦉', '🐺',
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  className?: string
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          aria-pressed={value === e}
          className={cn(
            'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors',
            value === e ? 'bg-purple/25 ring-2 ring-purple' : 'bg-fg/8 hover:bg-fg/14',
          )}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
