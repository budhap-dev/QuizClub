import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  /** Icon (or emoji) shown in a tinted badge beside the title. */
  icon?: React.ReactNode
  /** Accent for the icon badge; defaults to the theme's purple. */
  color?: string
  subtitle?: string
  back?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, icon, color = 'var(--color-purple)', subtitle, back = '/', actions }: PageHeaderProps) {
  return (
    <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 mb-6">
      <Link
        to={back}
        className="glass rounded-xl w-10 h-10 flex items-center justify-center text-fg/70 hover:text-fg hover:bg-fg/12 transition-colors shrink-0"
        aria-label="Back"
      >
        <ArrowLeft size={18} />
      </Link>
      {icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 [&_svg]:size-5"
          style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-fg/60 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {/* Actions drop to their own row on phones so they never squeeze the title. */}
      {actions && <div className="flex gap-2 flex-wrap w-full md:w-auto md:ml-auto">{actions}</div>}
    </motion.header>
  )
}
