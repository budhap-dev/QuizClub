import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, Eye, Pause, Play, SkipForward, SquareDashedMousePointer } from 'lucide-react'
import { Button, party } from '@/components'
import { cn, pick, shuffle } from '@/utils'
import { sfx } from '@/utils/sounds'
import { COUNTRIES, flagUrl, WELL_KNOWN } from '@/features/library/packs/flags'
import { BRANDS, logoUrl } from '@/features/library/packs/logos'
import { AwardBar } from '../AwardBar'

interface Picture {
  name: string
  url: string
  /** Logos are drawn on a light card so dark marks stay visible on every theme. */
  light: boolean
}

const FLAGS: Picture[] = COUNTRIES.filter(([c]) => WELL_KNOWN.has(c)).map(([c, name]) => ({ name, url: flagUrl(c), light: false }))
const LOGOS: Picture[] = BRANDS.map(([slug, name]) => ({ name, url: logoUrl(slug), light: true }))
const DECKS: Record<string, Picture[]> = { Flags: FLAGS, Logos: LOGOS, Mixed: [...FLAGS, ...LOGOS] }
const SPEEDS = [
  { label: 'Slow', ms: 3000 },
  { label: 'Normal', ms: 2000 },
  { label: 'Fast', ms: 1000 },
]
const COLS = 5
const ROWS = 4
const TILES = COLS * ROWS
/** Guessing with every tile still on scores the most; each tile gone costs a point, down to a floor. */
const pointsFor = (removed: number) => Math.max(5, 25 - removed)

export default function PictureReveal() {
  const [deck, setDeck] = useState('Mixed')
  const [speed, setSpeed] = useState(2000)
  const [card, setCard] = useState<Picture>(() => pick(DECKS.Mixed))
  const [order, setOrder] = useState(() => shuffle([...Array(TILES).keys()]))
  const [removed, setRemoved] = useState(0)
  const [running, setRunning] = useState(false)
  const [state, setState] = useState<'play' | 'correct' | 'revealed'>('play')
  const [round, setRound] = useState(1)

  const gone = useMemo(() => new Set(order.slice(0, removed)), [order, removed])
  const points = pointsFor(removed)

  const next = (d = deck) => {
    const pool = DECKS[d].filter((p) => p.url !== card.url)
    setCard(pick(pool))
    setOrder(shuffle([...Array(TILES).keys()]))
    setRemoved(0)
    setRunning(false)
    setState('play')
    setRound((r) => r + 1)
  }

  const uncover = () => setRemoved((r) => Math.min(TILES, r + 1))
  /** Clicking a tile lifts that one: swap it into the next uncover slot. */
  const uncoverTile = (i: number) => {
    const pos = order.indexOf(i)
    if (pos < removed) return
    const o = [...order]
    ;[o[pos], o[removed]] = [o[removed], o[pos]]
    setOrder(o)
    setRemoved(removed + 1)
  }

  useEffect(() => {
    if (!running || state !== 'play') return
    const id = window.setInterval(() => {
      setRemoved((r) => {
        if (r >= TILES - 1) setRunning(false)
        return Math.min(TILES, r + 1)
      })
      sfx.tick()
    }, speed)
    return () => window.clearInterval(id)
  }, [running, state, speed])

  const correct = () => {
    setState('correct')
    setRunning(false)
    sfx.fanfare()
    party.burst()
  }
  const reveal = () => {
    setState('revealed')
    setRunning(false)
    sfx.reveal()
  }

  const chip = (active: boolean) => cn('px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', active ? 'bg-orange/18 border-orange text-fg' : 'border-fg/12 text-fg/75 hover:bg-fg/8 hover:text-fg')

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {Object.keys(DECKS).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDeck(d)
              next(d)
            }}
            aria-pressed={deck === d}
            className={chip(deck === d)}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-center items-center mb-5 text-sm text-fg/60">
        Speed:
        {SPEEDS.map((s) => (
          <button
            key={s.ms}
            onClick={() => setSpeed(s.ms)}
            aria-pressed={speed === s.ms}
            className={cn('px-2.5 py-1 rounded-md font-medium transition-colors', speed === s.ms ? 'bg-fg/15 text-fg' : 'hover:bg-fg/10')}
          >
            {s.label}
          </button>
        ))}
        <span className="ml-3">Round {round}</span>
      </div>

      {/* Picture under tiles */}
      <div className={cn('relative mx-auto w-full max-w-2xl aspect-[16/10] rounded-2xl overflow-hidden border border-fg/12', card.light ? 'bg-white' : 'bg-fg/6')}>
        <img
          key={card.url}
          src={card.url}
          alt={state === 'play' ? 'Hidden picture' : card.name}
          className={cn('absolute inset-0 w-full h-full object-contain', card.light ? 'p-[12%]' : 'p-3')}
          referrerPolicy="no-referrer"
          draggable={false}
          // If the image host can't serve this one, move on rather than show an empty frame.
          onError={() => next()}
        />
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
          {[...Array(TILES).keys()].map((i) => (
            <AnimatePresence key={card.url + i}>
              {state === 'play' && !gone.has(i) && (
                <motion.button
                  type="button"
                  exit={{ opacity: 0, scale: 0.6, rotate: 8 }}
                  transition={{ duration: 0.35 }}
                  onClick={() => uncoverTile(i)}
                  className="border border-ink/40 bg-ink-soft hover:brightness-125"
                  style={{ background: `color-mix(in srgb, var(--color-orange) ${8 + ((i * 7) % 10)}%, var(--color-ink-soft))` }}
                  aria-label="Uncover this tile"
                />
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      <div className="mt-4 mb-4 text-sm text-fg/60 tabular-nums">
        {state === 'play' ? (
          <>
            {TILES - removed} tiles left · a correct guess now scores <b className="text-fg">{points}</b>
          </>
        ) : (
          <span className="text-2xl md:text-3xl font-display font-semibold text-fg">{state === 'correct' ? `Correct! It's ${card.name}` : `It's ${card.name}`}</span>
        )}
      </div>

      {state === 'play' ? (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant={running ? 'secondary' : 'success'} onClick={() => setRunning((r) => !r)} disabled={removed >= TILES}>
            {running ? (
              <>
                <Pause /> Pause
              </>
            ) : (
              <>
                <Play fill="currentColor" /> {removed ? 'Resume' : 'Start'}
              </>
            )}
          </Button>
          <Button variant="secondary" onClick={uncover} disabled={removed >= TILES}>
            <SquareDashedMousePointer /> Uncover one
          </Button>
          <Button onClick={correct}>
            <Check /> Correct
          </Button>
          <Button variant="secondary" onClick={reveal}>
            <Eye /> Reveal
          </Button>
          <Button variant="ghost" onClick={() => next()}>
            <SkipForward /> Skip
          </Button>
        </div>
      ) : (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {state === 'correct' && <AwardBar points={points} reason="picture-reveal" />}
          <Button className="mt-4" onClick={() => next()}>
            Next picture <ChevronRight />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
