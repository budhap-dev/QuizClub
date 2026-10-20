import { useId } from 'react'
import type { Glyph } from '../types'

const SIDES = { triangle: 3, square: 4, diamond: 4, pentagon: 5, hexagon: 6, octagon: 8 } as const

function polygon(sides: number, r: number, start: number) {
  return Array.from({ length: sides }, (_, i) => {
    const a = ((start + (i * 360) / sides) * Math.PI) / 180
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

function starPath(r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = ((-90 + i * 36) * Math.PI) / 180
    const d = i % 2 ? r * 0.42 : r
    return `${(50 + d * Math.cos(a)).toFixed(2)},${(50 + d * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

/** Positions for 1–9 dots in a small cluster around the centre. */
function dotSpots(n: number, spread: number): [number, number][] {
  if (n === 1) return [[50, 50]]
  if (n === 2) return [[50 - spread, 50], [50 + spread, 50]]
  if (n <= 6) {
    return Array.from({ length: n }, (_, i) => {
      const a = ((-90 + (i * 360) / n) * Math.PI) / 180
      return [50 + spread * Math.cos(a), 50 + spread * Math.sin(a)]
    })
  }
  const cols = 3
  return Array.from({ length: n }, (_, i) => [50 + ((i % cols) - 1) * spread, 50 + (Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2) * spread])
}

/** Draws one pattern cell on a 100×100 canvas in the theme's colours. */
export function GlyphView({ glyph, accent, className }: { glyph: Glyph; accent: string; className?: string }) {
  const clip = useId()
  const stroke = 'var(--color-fg)'

  let body: React.ReactNode
  if ('grid' in glyph) {
    const n = glyph.grid
    const size = 84 / n
    body = Array.from({ length: n * n }, (_, i) => (
      <rect
        key={i}
        x={8 + (i % n) * size + 2}
        y={8 + Math.floor(i / n) * size + 2}
        width={size - 4}
        height={size - 4}
        rx={3}
        fill={glyph.on.includes(i) ? accent : 'none'}
        stroke={glyph.on.includes(i) ? accent : stroke}
        strokeOpacity={glyph.on.includes(i) ? 1 : 0.3}
        strokeWidth={2}
      />
    ))
  } else if ('dots' in glyph && !('shape' in glyph)) {
    body = dotSpots(glyph.dots, 20).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill={accent} />)
  } else {
    const r = 38 * (glyph.size ?? 1)
    const fill = glyph.fill ?? 'empty'
    let shape: React.ReactElement
    switch (glyph.shape) {
      case 'circle':
        shape = <circle cx={50} cy={50} r={r} />
        break
      case 'star':
        shape = <polygon points={starPath(r)} />
        break
      case 'arrow':
        shape = <path d="M50 12 L72 40 L58 40 L58 88 L42 88 L42 40 L28 40 Z" strokeLinejoin="round" />
        break
      case 'plus':
        shape = <path d="M40 14 H60 V40 H86 V60 H60 V86 H40 V60 H14 V40 H40 Z" strokeLinejoin="round" />
        break
      default: {
        const sides = SIDES[glyph.shape]
        // Flat bottoms for triangles and squares, points up for the rest.
        const start = glyph.shape === 'square' || glyph.shape === 'octagon' ? -90 + 180 / sides : -90
        shape = <polygon points={polygon(sides, glyph.shape === 'triangle' ? r * 1.1 : r, start)} transform={glyph.shape === 'triangle' ? 'translate(0 6)' : undefined} strokeLinejoin="round" />
      }
    }
    const arrowLike = glyph.shape === 'arrow' || glyph.shape === 'plus'
    body = (
      <g transform={glyph.rot ? `rotate(${glyph.rot} 50 50)` : undefined}>
        {fill === 'half' && (
          <defs>
            <clipPath id={clip}>
              <rect x={0} y={0} width={50} height={100} />
            </clipPath>
          </defs>
        )}
        {fill === 'half' && (
          <g fill={accent} clipPath={`url(#${clip})`}>
            {shape}
          </g>
        )}
        <g fill={fill === 'solid' || arrowLike ? accent : 'none'} stroke={fill === 'solid' || arrowLike ? accent : stroke} strokeWidth={4}>
          {shape}
        </g>
      </g>
    )
    if (glyph.dots) {
      body = (
        <>
          {body}
          {dotSpots(glyph.dots, 11).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y + (glyph.shape === 'triangle' ? 10 : 0)} r={5} fill={stroke} />
          ))}
        </>
      )
    }
  }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {body}
    </svg>
  )
}
