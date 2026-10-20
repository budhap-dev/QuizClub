import type { LucideIcon } from 'lucide-react'
import { cn, tint } from '@/utils'

interface IconBadgeProps {
  icon: LucideIcon
  /** Any CSS colour, usually a theme token such as `var(--color-cyan)`. */
  color: string
  /** Badge edge in px; 28 for nav rows, 36–44 for cards. */
  size?: number
  className?: string
}

/** Square tinted tile with a Lucide icon drawn in the same accent. */
export function IconBadge({ icon: Icon, color, size = 36, className }: IconBadgeProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex items-center justify-center shrink-0', size < 36 ? 'rounded-lg' : 'rounded-xl', className)}
      style={{ width: size, height: size, background: tint(color, 18).background, color }}
    >
      <Icon size={Math.round(size * 0.55)} />
    </span>
  )
}
