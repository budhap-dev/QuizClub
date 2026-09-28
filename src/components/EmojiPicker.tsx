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
          className={cn(
            'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-transform hover:scale-110',
            value === e ? 'bg-purple ring-2 ring-white' : 'bg-white/10',
          )}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
