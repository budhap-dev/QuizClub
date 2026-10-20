import { createElement, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { sfx } from '@/utils/sounds'
import type { Scene, SceneEl } from '../types'

const W = 400
const H = 300

function draw(items: [string, SceneEl][]) {
  return items.map(([key, [tag, attrs]]) => createElement(tag, { key, ...attrs }))
}

/** The scene with every difference applied: replaced, removed, or added on top. */
function changed(scene: Scene): [string, SceneEl][] {
  const set: Record<string, SceneEl | null> = Object.assign({}, ...scene.differences.map((d) => d.set))
  const out = scene.items.flatMap(([k, el]): [string, SceneEl][] => (k in set ? (set[k] ? [[k, set[k]!]] : []) : [[k, el]]))
  for (const [k, el] of Object.entries(set)) if (el && !scene.items.some(([key]) => key === k)) out.push([k, el])
  return out
}

/**
 * Two pictures side by side. Tapping near a difference on either one circles it on both;
 * Reveal circles whatever is left.
 */
export function SpotTheDifference({ scene, revealed }: { scene: Scene; revealed: boolean }) {
  const [found, setFound] = useState<number[]>([])
  const [miss, setMiss] = useState<{ x: number; y: number; id: number } | null>(null)
  const right = useMemo(() => changed(scene), [scene])

  const tap = (e: React.MouseEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * W
    const y = ((e.clientY - box.top) / box.height) * H
    const hit = scene.differences.findIndex(({ at: [cx, cy, r] }, i) => !found.includes(i) && Math.hypot(x - cx, y - cy) <= r)
    if (hit >= 0) {
      setFound((f) => [...f, hit])
      sfx.correct()
    } else if (!revealed) {
      setMiss({ x, y, id: Date.now() })
      sfx.wrong()
    }
  }

  const rings = (
    <>
      {scene.differences.map(({ at: [cx, cy, r] }, i) => {
        const isFound = found.includes(i)
        if (!isFound && !revealed) return null
        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={isFound ? '#10b981' : '#f59e0b'}
            strokeWidth={4}
            strokeDasharray={isFound ? undefined : '8 6'}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box' }}
          />
        )
      })}
      <AnimatePresence>
        {miss && (
          <motion.g key={miss.id} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }} onAnimationComplete={() => setMiss(null)}>
            <line x1={miss.x - 9} y1={miss.y - 9} x2={miss.x + 9} y2={miss.y + 9} stroke="#ef4444" strokeWidth={4} strokeLinecap="round" />
            <line x1={miss.x + 9} y1={miss.y - 9} x2={miss.x - 9} y2={miss.y + 9} stroke="#ef4444" strokeWidth={4} strokeLinecap="round" />
          </motion.g>
        )}
      </AnimatePresence>
    </>
  )

  const total = scene.differences.length
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[scene.items, right].map((items, side) => (
          <svg
            key={side}
            viewBox={`0 0 ${W} ${H}`}
            onClick={tap}
            className="w-full rounded-xl border border-fg/12 cursor-crosshair select-none touch-manipulation"
            role="img"
            aria-label={side ? 'Second picture' : 'First picture'}
          >
            {draw(items)}
            {rings}
          </svg>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="tabular-nums font-medium text-fg/75">
          Found {found.length} of {total}
        </span>
        {found.length === total && (
          <span className="chip" style={{ color: 'var(--color-mint)' }}>
            <Check size={12} /> All found
          </span>
        )}
      </div>
    </div>
  )
}
