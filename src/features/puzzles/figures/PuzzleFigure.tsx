import type { Figure, RebusToken } from '../types'
import { cn } from '@/utils'
import { GlyphView } from './GlyphView'
import { Matchsticks } from './Matchsticks'
import { SpotTheDifference } from './SpotTheDifference'

const tint = (color: string, pct = 16) => `color-mix(in srgb, ${color} ${pct}%, transparent)`

/** A box for one value; "?" is highlighted in the accent and "" is an empty slot. */
function Cell({ value, accent, className }: { value: string; accent: string; className?: string }) {
  const ask = value === '?'
  return (
    <div
      className={cn('rounded-xl border flex items-center justify-center font-display font-semibold tabular-nums', className)}
      style={
        ask
          ? { background: tint(accent, 22), borderColor: accent, color: accent }
          : { background: value ? 'color-mix(in srgb, var(--color-fg) 7%, transparent)' : 'transparent', borderColor: 'color-mix(in srgb, var(--color-fg) 16%, transparent)', borderStyle: value ? 'solid' : 'dashed' }
      }
    >
      {value}
    </div>
  )
}

function Wheel({ segments, center, accent }: { segments: string[]; center?: string; accent: string }) {
  const n = segments.length
  const R = 96
  const inner = center ? 34 : 0
  const at = (i: number, r: number) => {
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]
  }
  return (
    <svg viewBox="0 0 200 200" className="w-64 md:w-80 max-w-full" role="img" aria-label="Number wheel">
      <circle cx={100} cy={100} r={R} fill="color-mix(in srgb, var(--color-fg) 6%, transparent)" stroke="var(--color-fg)" strokeOpacity={0.35} strokeWidth={2} />
      {segments.map((_, i) => {
        const [x1, y1] = at(i - 0.5, inner || 0)
        const [x2, y2] = at(i - 0.5, R)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-fg)" strokeOpacity={0.35} strokeWidth={2} />
      })}
      {segments.map((s, i) => {
        const [x, y] = at(i, (R + inner) / 2 + 4)
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={s.length > 2 ? 18 : 22} fontWeight={600} className="font-display" fill={s === '?' ? accent : 'var(--color-fg)'}>
            {s}
          </text>
        )
      })}
      {center && (
        <>
          <circle cx={100} cy={100} r={inner} fill={tint(accent, 20)} stroke={accent} strokeWidth={2} />
          <text x={100} y={100} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700} className="font-display" fill="var(--color-fg)">
            {center}
          </text>
        </>
      )}
    </svg>
  )
}

function NumberTriangle({ corners, center, accent }: { corners: [string, string, string]; center: string; accent: string }) {
  const label = (v: string, x: number, y: number, size = 20) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={600} className="font-display" fill={v === '?' ? accent : 'var(--color-fg)'}>
      {v}
    </text>
  )
  return (
    <svg viewBox="0 0 140 130" className="w-36 md:w-44" role="img" aria-label="Number triangle">
      <polygon points="70,22 18,110 122,110" fill="color-mix(in srgb, var(--color-fg) 6%, transparent)" stroke="var(--color-fg)" strokeOpacity={0.4} strokeWidth={2} strokeLinejoin="round" />
      {label(corners[0], 70, 9)}
      {label(corners[1], 9, 120)}
      {label(corners[2], 131, 120)}
      {center === '?' && <circle cx={70} cy={78} r={15} fill={tint(accent, 22)} stroke={accent} strokeWidth={1.5} />}
      {label(center, 70, 78, 22)}
    </svg>
  )
}

function Clock({ time, accent }: { time: string | null; accent: string }) {
  const [h, m] = (time ?? '0:0').split(':').map(Number)
  const hourA = ((h % 12) + m / 60) * 30
  const minA = m * 6
  return (
    <svg viewBox="0 0 100 100" className="w-20 md:w-28" role="img" aria-label={time ?? 'Unknown time'}>
      <circle cx={50} cy={50} r={45} fill={time ? 'color-mix(in srgb, var(--color-fg) 6%, transparent)' : tint(accent, 18)} stroke={time ? 'var(--color-fg)' : accent} strokeOpacity={time ? 0.45 : 1} strokeWidth={3} strokeDasharray={time ? undefined : '6 5'} />
      {time ? (
        <>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={50} y1={9} x2={50} y2={i % 3 ? 13 : 16} stroke="var(--color-fg)" strokeOpacity={0.6} strokeWidth={i % 3 ? 1.5 : 3} transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <line x1={50} y1={50} x2={50} y2={27} stroke="var(--color-fg)" strokeWidth={5} strokeLinecap="round" transform={`rotate(${hourA} 50 50)`} />
          <line x1={50} y1={50} x2={50} y2={15} stroke={accent} strokeWidth={3} strokeLinecap="round" transform={`rotate(${minA} 50 50)`} />
          <circle cx={50} cy={50} r={3.5} fill="var(--color-fg)" />
        </>
      ) : (
        <text x={50} y={52} textAnchor="middle" dominantBaseline="central" fontSize={40} fontWeight={700} className="font-display" fill={accent}>
          ?
        </text>
      )}
    </svg>
  )
}

/** A balance with a pile on each pan. */
function Balance({ left, right, accent }: { left: string; right: string; accent: string }) {
  const pan = (v: string) => (
    <div className="flex flex-col items-center justify-end min-h-16">
      {v === '?' ? (
        <span className="w-12 h-12 rounded-xl border-2 border-dashed font-display font-bold text-2xl flex items-center justify-center mb-1" style={{ borderColor: accent, color: accent, background: tint(accent, 18) }}>
          ?
        </span>
      ) : (
        <span className="text-2xl md:text-4xl leading-tight text-center break-all px-1 mb-1">{v}</span>
      )}
      <span className="block w-full h-3 rounded-b-full border-2 border-t-0 border-fg/45" />
    </div>
  )
  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-2 gap-8 items-end">
        {pan(left)}
        {pan(right)}
      </div>
      <svg viewBox="0 0 200 44" className="w-full -mt-px" aria-hidden>
        <line x1={25} y1={2} x2={175} y2={2} stroke="var(--color-fg)" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
        <polygon points="100,4 86,38 114,38" fill="var(--color-fg)" fillOpacity={0.35} />
        <line x1={70} y1={40} x2={130} y2={40} stroke="var(--color-fg)" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
      </svg>
    </div>
  )
}

function RebusWord({ token }: { token: RebusToken }) {
  switch (token.style) {
    case 'rule':
      return <span className="block w-56 md:w-80 h-1 rounded-full bg-fg/80" />
    case 'big':
      return <span className="text-7xl md:text-9xl">{token.t}</span>
    case 'small':
      return <span className="text-base md:text-xl self-end mb-2">{token.t}</span>
    case 'reverse':
      return <span>{[...token.t].reverse().join('')}</span>
    case 'spaced':
      return <span className="tracking-[0.6em]">{token.t}</span>
    case 'faint':
      return <span className="opacity-35">{token.t}</span>
    case 'split': {
      const [a, b] = token.t.split('|')
      return (
        <span className="inline-flex gap-8 md:gap-14">
          <span>{a}</span>
          <span className="-rotate-6 translate-y-2">{b}</span>
        </span>
      )
    }
    case 'down':
      return (
        <span className="inline-flex flex-col leading-[1.05]">
          {[...token.t].map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </span>
      )
    default:
      return <span>{token.t}</span>
  }
}

interface PuzzleFigureProps {
  figure: Figure
  accent: string
  revealed: boolean
}

/** Draws a puzzle's diagram. Everything is SVG or styled text, so it follows the theme and scales to the screen. */
export function PuzzleFigure({ figure, accent, revealed }: PuzzleFigureProps) {
  switch (figure.kind) {
    case 'matchsticks':
      return <Matchsticks eq={figure.eq} className="mx-auto" />
    case 'sequence':
      return (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {figure.items.map((v, i) => (
            <Cell key={i} value={v} accent={accent} className={cn('h-14 md:h-20 px-3 min-w-14 md:min-w-20', v.length > 4 ? 'text-xl md:text-3xl' : 'text-2xl md:text-4xl')} />
          ))}
        </div>
      )
    case 'glyphs': {
      const cols = figure.cols
      return (
        <div className={cn('mx-auto', cols ? 'grid gap-2 md:gap-3 w-fit' : 'flex flex-wrap justify-center gap-2 md:gap-3')} style={cols ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` } : undefined}>
          {figure.items.map((gl, i) =>
            gl ? (
              <div key={i} className="glass rounded-xl p-2 md:p-3 w-[4.5rem] h-[4.5rem] md:w-28 md:h-28">
                <GlyphView glyph={gl} accent={accent} className="w-full h-full" />
              </div>
            ) : (
              <div key={i} className="rounded-xl border-2 border-dashed w-[4.5rem] h-[4.5rem] md:w-28 md:h-28 flex items-center justify-center font-display font-bold text-3xl md:text-5xl" style={{ borderColor: accent, color: accent, background: tint(accent, 14) }}>
                ?
              </div>
            ),
          )}
        </div>
      )
    }
    case 'pyramid':
      return (
        <div className="flex flex-col items-center gap-1.5">
          {figure.rows.map((row, r) => (
            <div key={r} className="flex gap-1.5">
              {row.map((v, i) => (
                <Cell key={i} value={v} accent={accent} className="w-14 h-11 md:w-24 md:h-16 text-xl md:text-3xl" />
              ))}
            </div>
          ))}
        </div>
      )
    case 'grid':
      return (
        <div className="grid gap-1.5 md:gap-2 w-fit mx-auto" style={{ gridTemplateColumns: `repeat(${figure.cells[0].length}, minmax(0, 1fr))` }}>
          {figure.cells.flat().map((v, i) => (
            <Cell key={i} value={v} accent={accent} className="w-16 h-16 md:w-24 md:h-24 text-2xl md:text-4xl" />
          ))}
        </div>
      )
    case 'wheel':
      return (
        <div className="flex justify-center">
          <Wheel segments={figure.segments} center={figure.center} accent={accent} />
        </div>
      )
    case 'number-triangles':
      return (
        <div className="flex flex-wrap justify-center gap-2 md:gap-6">
          {figure.items.map((t, i) => (
            <NumberTriangle key={i} corners={t.corners} center={t.center} accent={accent} />
          ))}
        </div>
      )
    case 'lines': {
      const h = figure.height ?? 100
      return (
        <svg viewBox={`0 0 ${figure.width ?? 100} ${h}`} className="mx-auto w-full max-w-[22rem] md:max-w-md" role="img" aria-label="Shape figure">
          {figure.segments.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-fg)" strokeWidth={1.1} strokeLinecap="round" />
          ))}
        </svg>
      )
    }
    case 'equations':
      return (
        <div className="flex flex-col items-center gap-2 md:gap-3">
          {figure.rows.map((row, r) => (
            <div key={r} className="flex items-center gap-1.5 md:gap-3 flex-wrap justify-center">
              {row.map((t, i) =>
                t === '?' ? (
                  <Cell key={i} value="?" accent={accent} className="w-12 h-12 md:w-16 md:h-16 text-2xl md:text-4xl" />
                ) : /^[\d+−×=÷-]+$/.test(t) ? (
                  <span key={i} className={cn('font-display font-semibold tabular-nums', /\d/.test(t) ? 'text-3xl md:text-5xl' : 'text-2xl md:text-4xl text-fg/60')}>
                    {t}
                  </span>
                ) : (
                  <span key={i} className="text-3xl md:text-5xl leading-none">
                    {t}
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      )
    case 'scales':
      return (
        <div className="flex flex-col items-center gap-4">
          {figure.rows.map(([l, r], i) => (
            <Balance key={i} left={l} right={r} accent={accent} />
          ))}
        </div>
      )
    case 'clocks':
      return (
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {figure.times.map((t, i) => (
            <Clock key={i} time={t} accent={accent} />
          ))}
        </div>
      )
    case 'rebus':
      return (
        <div className="mx-auto w-fit max-w-full rounded-2xl bg-fg/[0.04] border border-fg/12 px-6 py-8 md:px-12 md:py-10 flex flex-col items-center gap-3 md:gap-4 font-display font-bold text-4xl md:text-6xl tracking-wide">
          {figure.rows.map((row, r) => (
            <div key={r} className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 md:gap-x-8">
              {row.map((t, i) => (
                <RebusWord key={i} token={t} />
              ))}
            </div>
          ))}
        </div>
      )
    case 'spot':
      return <SpotTheDifference scene={figure.scene} revealed={revealed} />
  }
}
