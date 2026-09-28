import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils'
import { sfx } from '@/utils/sounds'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  silent?: boolean
  children?: React.ReactNode
}

const variants: Record<Variant, string> = {
  // primary/danger sit on saturated gradients, so their text stays white in every theme
  primary: 'bg-gradient-to-r from-pink to-purple text-white shadow-lg shadow-purple/40 hover:shadow-purple/60',
  secondary: 'bg-fg/10 border border-fg/20 text-fg hover:bg-fg/20',
  ghost: 'bg-transparent text-fg/80 hover:bg-fg/10 hover:text-fg',
  danger: 'bg-gradient-to-r from-red to-orange text-white shadow-lg shadow-red/40',
  success: 'bg-gradient-to-r from-mint to-lime text-ink shadow-lg shadow-mint/40',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-xl',
  md: 'text-base px-5 py-2.5 rounded-2xl',
  lg: 'text-lg px-7 py-3.5 rounded-2xl',
  xl: 'text-xl md:text-2xl px-9 py-4 rounded-3xl',
}

export function Button({ variant = 'primary', size = 'md', className, silent, onClick, children, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'font-display font-semibold inline-flex items-center justify-center gap-2 select-none cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-shadow',
        variants[variant],
        sizes[size],
        className,
      )}
      onClick={(e) => {
        if (!silent) sfx.click()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
