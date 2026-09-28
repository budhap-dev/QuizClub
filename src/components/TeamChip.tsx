import { motion } from 'framer-motion'
import type { Team } from '@/types'
import { cn } from '@/utils'

interface TeamChipProps {
  team: Team
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
  className?: string
  onClick?: () => void
  active?: boolean
}

export function TeamChip({ team, size = 'md', showScore = true, className, onClick, active }: TeamChipProps) {
  const sizes = {
    sm: 'text-sm px-3 py-1 gap-1.5',
    md: 'text-base px-4 py-2 gap-2',
    lg: 'text-xl md:text-2xl px-6 py-3 gap-3',
  }
  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className={cn(
        'inline-flex items-center rounded-full font-display font-semibold border-2 transition-colors',
        onClick ? 'cursor-pointer' : 'cursor-default',
        active ? 'text-ink' : 'text-white',
        sizes[size],
        className,
      )}
      style={{
        borderColor: team.color,
        background: active ? team.color : `${team.color}33`,
      }}
    >
      <span>{team.emoji}</span>
      <span className="truncate max-w-[10rem]">{team.name}</span>
      {showScore && (
        <span
          className="ml-1 rounded-full px-2 py-0.5 text-sm font-bold tabular-nums"
          style={{ background: active ? 'rgba(0,0,0,0.15)' : team.color, color: active ? '#12082e' : '#12082e' }}
        >
          {team.score}
        </span>
      )}
    </motion.button>
  )
}
