import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils'

interface CardProps extends HTMLMotionProps<'div'> {
  /** Accent colour washed lightly across the top-left corner. */
  tint?: string
  interactive?: boolean
}

export function Card({ className, tint, interactive, children, style, ...rest }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.995 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn('glass rounded-2xl p-5 md:p-6', interactive && 'cursor-pointer transition-colors hover:bg-fg/10 hover:border-fg/16', className)}
      style={{
        ...(tint ? { backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${tint} 16%, transparent), transparent 60%)` } : undefined),
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
