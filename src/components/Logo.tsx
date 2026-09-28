import { cn } from '@/utils'

interface LogoProps {
  size?: number
  className?: string
}

/** Brand mark: a rounded gradient tile with a Q. Matches public/favicon.svg. */
export function Logo({ size = 28, className }: LogoProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex items-center justify-center rounded-lg bg-brand text-on-accent font-display font-bold leading-none select-none', className)}
      style={{ width: size, height: size, fontSize: size * 0.58 }}
    >
      Q
    </span>
  )
}
