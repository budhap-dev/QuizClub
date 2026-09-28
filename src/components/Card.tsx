import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils'

interface CardProps extends HTMLMotionProps<'div'> {
  glow?: string
  interactive?: boolean
}

export function Card({ className, glow, interactive, children, ...rest }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -4, scale: 1.01 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={cn('glass rounded-3xl p-5 md:p-6', interactive && 'cursor-pointer', className)}
      style={glow ? { boxShadow: `0 10px 40px ${glow}55` } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
