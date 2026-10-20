import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Puzzle, Shuffle } from 'lucide-react'
import { Card, LEVELS, LevelBars, LevelSelect, PageHeader } from '@/components'
import type { Difficulty } from '@/types'
import { isLevel, PUZZLE_TYPES, PUZZLES } from './registry'

const container = { show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function Puzzles() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('level')
  const level = isLevel(raw) ? raw : undefined

  const counts = useMemo(() => {
    const out: Record<string, Record<Difficulty | 'all', number>> = {}
    for (const p of PUZZLES) {
      for (const key of [p.type, 'mix']) {
        out[key] ??= { all: 0, easy: 0, medium: 0, hard: 0 }
        out[key][p.level]++
        out[key].all++
      }
    }
    return out
  }, [])

  const suffix = level ? `?level=${level}` : ''
  const shown = (type: string) => (level ? counts[type]?.[level] ?? 0 : counts[type]?.all ?? 0)

  return (
    <div>
      <PageHeader
        title="Riddles & Puzzles"
        icon={<Puzzle />}
        color="var(--color-orange)"
        subtitle="Brain-teasers for the big screen: pick a type and a level, then give a hint, reveal the answer and explain why."
      />

      <LevelSelect
        className="mb-5"
        label="Puzzle level"
        value={level}
        noneLabel="All levels"
        noneShort="All"
        counts={counts.mix}
        onChange={(l) => setParams(l ? { level: l } : {}, { replace: true })}
      />

      <Link to={`/puzzles/mix${suffix}`} className="block mb-4">
        <Card interactive tint="var(--color-orange)" className="flex items-center gap-4 py-4">
          <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-orange) 18%, transparent)', color: 'var(--color-orange)' }}>
            <Shuffle size={20} />
          </span>
          <div className="min-w-0">
            <div className="font-semibold">Mixed bag</div>
            <div className="text-fg/60 text-sm">
              {shown('mix')} puzzles of every type{level ? '' : ', easiest first'}
            </div>
          </div>
          <ArrowRight size={18} className="ml-auto text-fg/50 shrink-0" />
        </Card>
      </Link>

      <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PUZZLE_TYPES.map(({ id, title, Icon, color, description }) => {
          const n = shown(id)
          return (
            <motion.div key={id} variants={item}>
              <Link to={`/puzzles/${id}${suffix}`} className={n ? 'block h-full' : 'block h-full pointer-events-none opacity-50'} aria-disabled={!n}>
                <Card interactive tint={color} className="h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}>
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold leading-tight">{title}</h2>
                      <p className="text-fg/65 text-sm leading-relaxed mt-1">{description}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-3 text-xs text-fg/55 tabular-nums">
                    {LEVELS.map((l) => (
                      <span key={l} className="inline-flex items-center gap-1.5" title={`${counts[id]?.[l] ?? 0} ${l}`} style={{ opacity: level && level !== l ? 0.4 : 1 }}>
                        <LevelBars level={l} />
                        {counts[id]?.[l] ?? 0}
                      </span>
                    ))}
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
