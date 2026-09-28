import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card, PageHeader } from '@/components'
import { GAMES } from './registry'

const container = { show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 24, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } }

export function Games() {
  return (
    <div>
      <PageHeader title="Party Games" emoji="🎮" subtitle="Quick crowd-pleasers for between rounds. Award points to your teams from any game." />
      <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((g) => (
          <motion.div key={g.id} variants={item}>
            <Link to={`/games/${g.id}`} className="block h-full">
              <Card interactive glow={g.color} className="h-full">
                <motion.div className="text-6xl mb-3" whileHover={{ rotate: [0, -12, 12, 0], transition: { duration: 0.5 } }}>
                  {g.emoji}
                </motion.div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: g.color }}>
                  {g.title}
                </h2>
                <p className="text-white/70 text-sm">{g.description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
