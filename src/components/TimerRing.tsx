import { motion } from 'framer-motion'
import { cn } from '@/utils'

interface TimerRingProps {
  total: number
  remaining: number
  size?: number
  className?: string
}

/** Circular countdown that shifts from green → amber → red. */
export function TimerRing({ total, remaining, size = 110, className }: TimerRingProps) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const frac = total > 0 ? Math.max(0, remaining / total) : 0
  const color = frac > 0.5 ? '#34d399' : frac > 0.25 ? '#fbbf24' : '#f43f5e'
  const urgent = remaining <= 5 && remaining > 0

  return (
    <motion.div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      animate={urgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={urgent ? { repeat: Infinity, duration: 1 } : undefined}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} style={{ stroke: 'color-mix(in srgb, var(--color-fg) 12%, transparent)' }} strokeWidth={8} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - frac), stroke: color }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-display font-bold tabular-nums"
        style={{ fontSize: size * 0.34, color }}
      >
        {Math.ceil(remaining)}
      </div>
    </motion.div>
  )
}
