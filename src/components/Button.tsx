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
  // Solid accents; `on-accent` keeps the label legible on every theme's purple/red/mint.
  primary: 'bg-purple text-on-accent shadow-sm shadow-purple/30 hover:brightness-110',
  secondary: 'bg-fg/8 border border-fg/12 text-fg hover:bg-fg/14 hover:border-fg/20',
  ghost: 'bg-transparent text-fg/75 hover:bg-fg/8 hover:text-fg',
  danger: 'bg-red text-on-accent hover:brightness-110',
  success: 'bg-mint text-ink hover:brightness-105',
}

const sizes: Record<Size, string> = {
  sm: 'text-[0.8125rem] px-3 py-1.5 rounded-lg gap-1.5 [&_svg]:size-3.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2 [&_svg]:size-4',
  lg: 'text-base px-6 py-3 rounded-xl gap-2 [&_svg]:size-[1.125rem]',
  xl: 'text-lg md:text-xl px-8 py-4 rounded-2xl gap-2.5 [&_svg]:size-5',
}

export function Button({ variant = 'primary', size = 'md', className, silent, onClick, children, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'font-semibold inline-flex items-center justify-center select-none cursor-pointer whitespace-nowrap',
        'transition-[background-color,border-color,filter,box-shadow] duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100',
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
