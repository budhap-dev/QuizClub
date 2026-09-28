import { motion } from 'framer-motion'
import type { Team } from '@/types'

interface ScoreboardProps {
  teams: Team[]
  title?: string
}

/** Gold / silver / bronze rank badges for the top three; the rest are plain. */
const RANK_COLORS = ['#f5c542', '#c9ced6', '#d08a4e']

/** Sized with clamp(…vh…) so it fits the stage; the list scrolls if there are many teams. */
export function Scoreboard({ teams, title = 'Scoreboard' }: ScoreboardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const max = Math.max(1, ...sorted.map((t) => t.score))

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-[clamp(0.5rem,2vh,1.5rem)]">
      <motion.h1
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="shrink-0 text-[clamp(2rem,7vh,4.5rem)] font-semibold tracking-tight mb-[clamp(0.5rem,3vh,2rem)]"
      >
        {title}
      </motion.h1>
      {sorted.length === 0 && <p className="text-fg/60 text-xl">No teams yet — add some in Play setup.</p>}
      <div className="w-full min-h-0 overflow-y-auto no-scrollbar space-y-[clamp(0.4rem,1.2vh,0.75rem)]">
        {sorted.map((t, i) => {
          const rank = RANK_COLORS[i]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
              className="glass rounded-2xl px-3 md:px-4 py-[clamp(0.4rem,1.4vh,1rem)] flex items-center gap-3 md:gap-4"
            >
              <div
                className="w-[clamp(2rem,5vh,3rem)] h-[clamp(2rem,5vh,3rem)] rounded-full flex items-center justify-center text-[clamp(0.9rem,2.6vh,1.5rem)] font-display font-semibold tabular-nums shrink-0"
                style={rank ? { background: rank, color: '#111' } : { background: 'color-mix(in srgb, var(--color-fg) 10%, transparent)', color: 'color-mix(in srgb, var(--color-fg) 70%, transparent)' }}
              >
                {i + 1}
              </div>
              <div className="text-[clamp(1.5rem,4.5vh,3rem)] leading-none">{t.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-[clamp(1.1rem,3.2vh,1.9rem)] truncate">{t.name}</div>
                <div className="h-[clamp(0.4rem,1.2vh,0.75rem)] rounded-full bg-fg/10 mt-1.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: t.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(3, (Math.max(0, t.score) / max) * 100)}%` }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <motion.div
                key={t.score}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                className="font-display font-semibold text-[clamp(1.5rem,5vh,3rem)] tabular-nums w-20 md:w-28 text-right"
                style={{ color: t.color }}
              >
                {t.score}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
