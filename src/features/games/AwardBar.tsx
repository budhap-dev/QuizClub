import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TeamChip } from '@/components'
import { useSessionStore } from '@/store/sessionStore'
import { sfx } from '@/utils/sounds'

interface AwardBarProps {
  points?: number
  reason?: string
  title?: string
}

/** Shared strip: tap a team to give it points from a game. */
export function AwardBar({ points = 10, reason = 'game', title = 'Award points' }: AwardBarProps) {
  const teams = useSessionStore((s) => s.teams)
  const award = useSessionStore((s) => s.award)
  const [pops, setPops] = useState<{ id: number; teamId: string }[]>([])

  if (teams.length === 0) {
    return (
      <p className="text-center text-white/40 text-sm mt-4">
        <Link to="/play" className="underline hover:text-white">
          Add teams in Play
        </Link>{' '}
        to award points from games.
      </p>
    )
  }

  const give = (teamId: string) => {
    award(teamId, points, reason)
    sfx.point()
    const id = Date.now()
    setPops((p) => [...p, { id, teamId }])
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-3 mt-4 flex flex-wrap items-center justify-center gap-2">
      <span className="text-white/60 text-sm mr-1">
        {title} (+{points}):
      </span>
      {teams.map((t) => (
        <div key={t.id} className="relative">
          <TeamChip team={t} onClick={() => give(t.id)} />
          <AnimatePresence>
            {pops
              .filter((p) => p.teamId === t.id)
              .map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -40, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  className="absolute left-1/2 -translate-x-1/2 -top-2 font-display font-bold text-lime pointer-events-none"
                >
                  +{points}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  )
}
