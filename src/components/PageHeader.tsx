import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  emoji?: string
  subtitle?: string
  back?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, emoji, subtitle, back = '/', actions }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 md:gap-4 mb-6"
    >
      <Link to={back} className="glass rounded-2xl w-11 h-11 flex items-center justify-center text-xl hover:bg-white/20" aria-label="Back">
        ←
      </Link>
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
          {emoji && <span className="animate-float inline-block">{emoji}</span>}
          <span className="text-gradient">{title}</span>
        </h1>
        {subtitle && <p className="text-white/60 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </motion.header>
  )
}
