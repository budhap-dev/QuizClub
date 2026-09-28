import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import { Card, PageHeader } from '@/components'
import { GAMES } from './registry'

const container = { show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function Games() {
  return (
    <div>
      <PageHeader
        title="Party Games"
        icon={<Gamepad2 />}
        color="var(--color-lime)"
        subtitle="Quick crowd-pleasers for between rounds. Award points to your teams from any game."
      />
      <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((g) => (
          <motion.div key={g.id} variants={item}>
            <Link to={`/games/${g.id}`} className="block h-full">
              <Card interactive tint={g.color} className="h-full">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: `color-mix(in srgb, ${g.color} 18%, transparent)` }}>
                  {g.emoji}
                </div>
                <h2 className="text-lg font-semibold mb-1">{g.title}</h2>
                <p className="text-fg/65 text-sm leading-relaxed">{g.description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
