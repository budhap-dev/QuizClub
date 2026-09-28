import { motion } from 'framer-motion'

/** Decorative floating shapes in the page background, painted in the current theme's accents. */
export function Blobs() {
  const blobs = [
    { c: 'var(--color-pink)', x: '5%', y: '10%', s: 260, d: 0 },
    { c: 'var(--color-cyan)', x: '75%', y: '5%', s: 220, d: 1.5 },
    { c: 'var(--color-lime)', x: '85%', y: '70%', s: 180, d: 0.7 },
    { c: 'var(--color-purple)', x: '10%', y: '75%', s: 240, d: 2.2 },
    { c: 'var(--color-sun)', x: '50%', y: '45%', s: 140, d: 1.1 },
  ]
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-30"
          style={{ background: b.c, width: b.s, height: b.s, left: b.x, top: b.y }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 9 + i, repeat: Infinity, ease: 'easeInOut', delay: b.d }}
        />
      ))}
    </div>
  )
}
