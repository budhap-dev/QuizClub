import { cn } from '@/utils'

interface SegmentedProgressProps {
  total: number
  /** Zero-based index of the current step. */
  current: number
  /** Defaults to "Question N of M". */
  label?: string
  className?: string
}

/** One bar per question: done in purple, current in pink. Long quizzes collapse into a single continuous bar. */
export function SegmentedProgress({ total, current, label, className }: SegmentedProgressProps) {
  const ariaLabel = label ?? `Question ${current + 1} of ${total}`
  const bar = 'h-[5px] md:h-1.5 rounded-full'

  if (total > 20) {
    const pct = (n: number) => `${(n / total) * 100}%`
    return (
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        className={cn(bar, 'flex overflow-hidden bg-fg/14', className)}
      >
        <span className="bg-purple transition-[width] duration-300" style={{ width: pct(current) }} />
        <span className="bg-pink" style={{ width: pct(1) }} />
      </div>
    )
  }

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className={cn('flex gap-1', className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn(bar, 'flex-1 transition-colors', i < current ? 'bg-purple' : i === current ? 'bg-pink' : 'bg-fg/14')} />
      ))}
    </div>
  )
}
