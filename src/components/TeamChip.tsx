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
    md: 'text-[0.9375rem] px-3.5 py-1.5 gap-2',
    lg: 'text-lg md:text-xl px-5 py-2.5 gap-2.5',
  }
  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={cn(
        'inline-flex items-center rounded-full font-semibold border transition-colors',
        onClick ? 'cursor-pointer' : 'cursor-default',
        active ? 'text-ink' : 'text-fg',
        sizes[size],
        className,
      )}
      style={{
        borderColor: active ? team.color : `color-mix(in srgb, ${team.color} 55%, transparent)`,
        background: active ? team.color : `color-mix(in srgb, ${team.color} 16%, transparent)`,
      }}
    >
      <span>{team.emoji}</span>
      <span className="truncate max-w-[10rem]">{team.name}</span>
      {showScore && (
        <span
          className="ml-0.5 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
          style={{ background: active ? 'rgba(0,0,0,0.15)' : team.color, color: 'var(--color-ink)' }}
        >
          {team.score}
        </span>
      )}
    </motion.button>
  )
}
