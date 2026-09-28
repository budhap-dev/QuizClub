import { motion } from 'framer-motion'
import type { Team } from '@/types'

interface ScoreboardProps {
  teams: Team[]
  title?: string
}

const medals = ['🥇', '🥈', '🥉']

export function Scoreboard({ teams, title = 'Scoreboard' }: ScoreboardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const max = Math.max(1, ...sorted.map((t) => t.score))

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-6">
      <motion.h1 initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-7xl font-bold text-gradient mb-8">
        {title}
      </motion.h1>
      {sorted.length === 0 && <p className="text-white/60 text-2xl">No teams yet — add some in Play setup.</p>}
      <div className="w-full space-y-3">
        {sorted.map((t, i) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
            className="glass rounded-3xl p-3 md:p-4 flex items-center gap-4"
          >
            <div className="w-10 md:w-14 text-3xl md:text-4xl text-center font-display font-bold text-white/60">{medals[i] ?? i + 1}</div>
            <div className="text-3xl md:text-5xl">{t.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-xl md:text-3xl truncate">{t.name}</div>
              <div className="h-3 md:h-4 rounded-full bg-white/10 mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: t.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(3, (Math.max(0, t.score) / max) * 100)}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
            <motion.div
              key={t.score}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="font-display font-bold text-3xl md:text-5xl tabular-nums w-20 md:w-28 text-right"
              style={{ color: t.color }}
            >
              {t.score}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
