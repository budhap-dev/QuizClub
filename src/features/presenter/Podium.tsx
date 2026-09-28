import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import type { Team } from '@/types'
import { party } from '@/components'
import { sfx } from '@/utils/sounds'

const MEDALS = { gold: '#f5c542', silver: '#c9ced6', bronze: '#d08a4e' }

export function Podium({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const [first, second, third] = sorted

  useEffect(() => {
    sfx.fanfare()
    party.fireworks()
  }, [])

  // Step heights scale with the viewport so the podium always fits the stage.
  const steps = [
    { team: second, height: 'h-[clamp(5rem,18vh,12rem)]', label: '2', delay: 0.6, color: MEDALS.silver },
    { team: first, height: 'h-[clamp(7rem,28vh,18rem)]', label: '1', delay: 1.2, color: MEDALS.gold },
    { team: third, height: 'h-[clamp(4rem,14vh,9rem)]', label: '3', delay: 0.3, color: MEDALS.bronze },
  ]

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-[clamp(0.5rem,2vh,1.5rem)]">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="text-[clamp(2rem,7vh,4.5rem)] font-semibold tracking-tight mb-1 flex items-center gap-[0.4em]"
      >
        <Trophy className="w-[0.9em] h-[0.9em] text-sun" />
        Final results
      </motion.h1>
      {first && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="text-[clamp(1.1rem,3.2vh,1.9rem)] text-fg/75 mb-[clamp(1rem,4vh,2.5rem)]">
          Congratulations, <b style={{ color: first.color }}>{first.name}</b>
        </motion.p>
      )}
      <div className="flex items-end justify-center gap-3 md:gap-6 w-full">
        {steps.map(({ team, height, label, delay, color }) => (
          <div key={label} className="flex flex-col items-center flex-1 max-w-56">
            {team && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.3, type: 'spring', stiffness: 260, damping: 22 }}
                className="text-center mb-2"
              >
                <div className="text-[clamp(2.5rem,8vh,4.5rem)] leading-none">{team.emoji}</div>
                <div className="font-display font-semibold text-[clamp(1rem,2.8vh,1.5rem)] truncate max-w-48">{team.name}</div>
                <div className="font-display font-semibold text-[clamp(1.25rem,4.5vh,2.25rem)] tabular-nums" style={{ color: team.color }}>
                  {team.score}
                </div>
              </motion.div>
            )}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay, type: 'spring', stiffness: 180, damping: 22 }}
              style={{ originY: 1, background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 65%, var(--color-ink)))` }}
              className={`w-full ${height} rounded-t-2xl flex items-start justify-center pt-3 font-display font-semibold text-[clamp(2rem,7vh,3.75rem)] text-black/60 shadow-xl`}
            >
              {label}
            </motion.div>
          </div>
        ))}
      </div>
      {sorted.length > 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-[clamp(0.75rem,3vh,2rem)] flex flex-wrap justify-center gap-2">
          {sorted.slice(3).map((t, i) => (
            <div key={t.id} className="glass rounded-full px-4 py-1.5 text-[clamp(0.9rem,2.2vh,1.1rem)] flex items-center gap-2">
              <span className="text-fg/50 tabular-nums">{i + 4}.</span> {t.emoji} {t.name} <b className="tabular-nums" style={{ color: t.color }}>{t.score}</b>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
