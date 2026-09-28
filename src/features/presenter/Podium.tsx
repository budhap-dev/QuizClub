import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Team } from '@/types'
import { party } from '@/components'
import { sfx } from '@/utils/sounds'

export function Podium({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const [first, second, third] = sorted

  useEffect(() => {
    sfx.fanfare()
    party.fireworks()
  }, [])

  // Step heights scale with the viewport so the podium always fits the stage.
  const steps = [
    { team: second, height: 'h-[clamp(5rem,18vh,12rem)]', label: '2', delay: 0.6, color: '#c0c0c0' },
    { team: first, height: 'h-[clamp(7rem,28vh,18rem)]', label: '1', delay: 1.2, color: '#ffd700' },
    { team: third, height: 'h-[clamp(4rem,14vh,9rem)]', label: '3', delay: 0.3, color: '#cd7f32' },
  ]

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-[clamp(0.5rem,2vh,1.5rem)]">
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="text-[clamp(2rem,7vh,4.5rem)] font-bold text-gradient mb-1"
      >
        🏆 Final Results
      </motion.h1>
      {first && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="text-[clamp(1.1rem,3.2vh,1.9rem)] text-white/80 mb-[clamp(1rem,4vh,2.5rem)]">
          Congratulations, <b style={{ color: first.color }}>{first.name}</b>!
        </motion.p>
      )}
      <div className="flex items-end justify-center gap-3 md:gap-6 w-full">
        {steps.map(({ team, height, label, delay, color }) => (
          <div key={label} className="flex flex-col items-center flex-1 max-w-56">
            {team && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.3, type: 'spring' }}
                className="text-center mb-2"
              >
                <motion.div
                  className="text-[clamp(2.5rem,8vh,4.5rem)] leading-none"
                  animate={label === '1' ? { y: [0, -12, 0], rotate: [0, -5, 5, 0] } : undefined}
                  transition={{ repeat: Infinity, duration: 1.6, delay: 2 }}
                >
                  {team.emoji}
                </motion.div>
                <div className="font-display font-bold text-[clamp(1rem,2.8vh,1.5rem)] truncate max-w-48">{team.name}</div>
                <div className="font-display font-bold text-[clamp(1.25rem,4.5vh,2.25rem)]" style={{ color: team.color }}>
                  {team.score}
                </div>
              </motion.div>
            )}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay, type: 'spring', stiffness: 150, damping: 15 }}
              style={{ originY: 1, background: `linear-gradient(180deg, ${color}, ${color}66)` }}
              className={`w-full ${height} rounded-t-3xl flex items-start justify-center pt-3 font-display font-bold text-[clamp(2rem,7vh,3.75rem)] text-ink/80 shadow-2xl`}
            >
              {label}
            </motion.div>
          </div>
        ))}
      </div>
      {sorted.length > 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-[clamp(0.75rem,3vh,2rem)] flex flex-wrap justify-center gap-2">
          {sorted.slice(3).map((t, i) => (
            <div key={t.id} className="glass rounded-full px-4 py-1.5 font-display text-[clamp(0.9rem,2.2vh,1.1rem)]">
              {i + 4}. {t.emoji} {t.name} · <b style={{ color: t.color }}>{t.score}</b>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
