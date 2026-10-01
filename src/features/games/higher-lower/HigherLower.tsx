import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Check, ChevronRight, Flag, RotateCcw, X } from 'lucide-react'
import { Button, party } from '@/components'
import { cn, shuffle } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '../AwardBar'

interface Deck {
  /** What the arrows mean for this deck. */
  up: string
  down: string
  format: (v: number) => string
  items: [string, number][]
}

// Only settled facts: dates of well-known events, and heights that don't change.
const DECKS: Record<string, Deck> = {
  'Which came first?': {
    up: 'Later',
    down: 'Earlier',
    format: (v) => String(v),
    items: [
      ['The Magna Carta is sealed', 1215],
      ['Constantinople falls to the Ottomans', 1453],
      ['Columbus reaches the Americas', 1492],
      ['William Shakespeare is born', 1564],
      ['The Great Fire of London', 1666],
      ['The US Declaration of Independence', 1776],
      ['The storming of the Bastille', 1789],
      ['The Battle of Waterloo', 1815],
      ['Darwin publishes On the Origin of Species', 1859],
      ['The Suez Canal opens', 1869],
      ['Bell patents the telephone', 1876],
      ['The Statue of Liberty is dedicated', 1886],
      ['The Eiffel Tower is completed', 1889],
      ['The first modern Olympics, in Athens', 1896],
      ["The Wright brothers' first powered flight", 1903],
      ['The Titanic sinks', 1912],
      ['The Panama Canal opens', 1914],
      ['Fleming discovers penicillin', 1928],
      ['The first FIFA World Cup', 1930],
      ['India becomes independent', 1947],
      ['Everest is climbed for the first time', 1953],
      ['Sputnik 1, the first satellite, is launched', 1957],
      ['Humans first walk on the Moon', 1969],
      ['The first Star Wars film is released', 1977],
      ['The Chernobyl disaster', 1986],
      ['The Berlin Wall falls', 1989],
      ['The Hubble Space Telescope is launched', 1990],
      ['Nelson Mandela becomes president of South Africa', 1994],
      ['The first Harry Potter book is published', 1997],
      ['Google is founded', 1998],
      ['Wikipedia launches', 2001],
      ['Euro notes and coins go into circulation', 2002],
      ['Facebook launches', 2004],
      ['YouTube launches', 2005],
      ['The first iPhone goes on sale', 2007],
    ],
  },
  'Taller or shorter?': {
    up: 'Taller',
    down: 'Shorter',
    format: (v) => `${v.toLocaleString()} m`,
    items: [
      ['Mount Everest', 8849],
      ['K2', 8611],
      ['Aconcagua', 6961],
      ['Denali', 6190],
      ['Mount Kilimanjaro', 5895],
      ['Mount Elbrus', 5642],
      ['The Matterhorn', 4478],
      ['Mount Fuji', 3776],
      ['Mount Kosciuszko', 2228],
      ['Ben Nevis', 1345],
      ['Angel Falls (total drop)', 979],
      ['Burj Khalifa', 828],
      ['Shanghai Tower', 632],
      ['CN Tower', 553],
      ['One World Trade Center', 541],
      ['Taipei 101', 508],
      ['Petronas Towers', 452],
      ['Empire State Building (to its tip)', 443],
      ['The Shard', 310],
      ['Golden Gate Bridge towers', 227],
      ['Gateway Arch', 192],
      ['Statue of Unity', 182],
      ["Big Ben's Elizabeth Tower", 96],
      ['Statue of Liberty (ground to torch)', 93],
      ['Qutub Minar', 73],
      ['Christ the Redeemer (with pedestal)', 38],
    ],
  },
}
const POINTS_PER_STEP = 5

export default function HigherLower() {
  const [deckName, setDeckName] = useState(Object.keys(DECKS)[0])
  const deck = DECKS[deckName]
  const [queue, setQueue] = useState(() => shuffle(deck.items))
  const [i, setI] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  // guess → result (after a call) → over (wrong call, banked or out of cards)
  const [phase, setPhase] = useState<'guess' | 'result' | 'over'>('guess')
  const [lastRight, setLastRight] = useState(false)
  const [banked, setBanked] = useState(false)

  const cur = queue[i]
  const next = queue[i + 1]

  const newRun = (name = deckName) => {
    setQueue(shuffle(DECKS[name].items))
    setI(0)
    setStreak(0)
    setBanked(false)
    setPhase('guess')
  }

  const call = (dir: 'up' | 'down') => {
    if (!next || phase !== 'guess') return
    // Equal values count as right either way.
    const right = dir === 'up' ? next[1] >= cur[1] : next[1] <= cur[1]
    setLastRight(right)
    if (right) {
      const s = streak + 1
      setStreak(s)
      setBest((b) => Math.max(b, s))
      sfx.correct()
      if (i + 2 >= queue.length) {
        setPhase('over')
        party.burst()
      } else setPhase('result')
    } else {
      sfx.wrong()
      setPhase('over')
    }
  }

  const advance = () => {
    setI((x) => x + 1)
    setPhase('guess')
  }

  const bank = () => {
    setLastRight(true)
    setBanked(true)
    setPhase('over')
    sfx.fanfare()
  }

  // A banked run stops before the next card, so it stays hidden.
  const shown = phase !== 'guess' && !banked

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {Object.keys(DECKS).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDeckName(d)
              newRun(d)
            }}
            aria-pressed={deckName === d}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              deckName === d ? 'bg-sun/18 border-sun text-fg' : 'border-fg/12 text-fg/75 hover:bg-fg/8 hover:text-fg',
            )}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="text-sm text-fg/60 mb-5 tabular-nums">
        Streak <b className="text-fg">{streak}</b> · Best {best} · {POINTS_PER_STEP} points per correct call
      </div>

      <div className="grid sm:grid-cols-2 gap-3 md:gap-4 mb-5">
        <div className="rounded-2xl border border-fg/12 bg-fg/6 p-5 md:p-6 flex flex-col justify-center min-h-40">
          <div className="text-xs uppercase tracking-wider text-fg/50 font-medium mb-2">Now</div>
          <div className="text-xl md:text-2xl font-display font-semibold leading-snug">{cur[0]}</div>
          <div className="text-3xl md:text-4xl font-display font-semibold text-sun mt-2 tabular-nums">{deck.format(cur[1])}</div>
        </div>
        <AnimatePresence mode="wait">
          {next && (
            <motion.div
              key={next[0]}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className={cn(
                'rounded-2xl border p-5 md:p-6 flex flex-col justify-center min-h-40 transition-colors',
                !shown ? 'border-fg/12 bg-fg/6' : lastRight ? 'border-mint/60 bg-mint/10' : 'border-red/60 bg-red/10',
              )}
            >
              <div className="text-xs uppercase tracking-wider text-fg/50 font-medium mb-2">Next</div>
              <div className="text-xl md:text-2xl font-display font-semibold leading-snug">{next[0]}</div>
              <div className="text-3xl md:text-4xl font-display font-semibold mt-2 tabular-nums">
                {shown ? (
                  <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={lastRight ? 'text-mint' : 'text-red'}>
                    {deck.format(next[1])}
                  </motion.span>
                ) : (
                  <span className="text-fg/30">?</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'guess' && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button size="lg" variant="success" onClick={() => call('up')}>
            <ArrowUp /> {deck.up}
          </Button>
          <Button size="lg" variant="danger" onClick={() => call('down')}>
            <ArrowDown /> {deck.down}
          </Button>
          {streak > 0 && (
            <Button size="lg" variant="secondary" onClick={bank}>
              <Flag /> Bank {streak * POINTS_PER_STEP}
            </Button>
          )}
        </div>
      )}

      {phase === 'result' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-2xl font-display font-semibold mb-3 flex items-center justify-center gap-2 text-mint">
            <Check /> Right! Streak of {streak}
          </div>
          <Button size="lg" onClick={advance}>
            Keep going <ChevronRight />
          </Button>
        </motion.div>
      )}

      {phase === 'over' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className={cn('text-2xl font-display font-semibold mb-1 flex items-center justify-center gap-2', lastRight ? 'text-mint' : 'text-red')}>
            {lastRight ? <Check /> : <X />}
            {!lastRight ? (streak ? `Wrong call — the run ends at ${streak}` : 'Wrong call — try a new run') : banked ? `Banked a streak of ${streak}` : `Perfect run: ${streak} in a row!`}
          </div>
          {streak > 0 && <AwardBar points={streak * POINTS_PER_STEP} reason="higher-lower" title="Award the streak" />}
          <Button className="mt-4" onClick={() => newRun()}>
            <RotateCcw /> New run
          </Button>
        </motion.div>
      )}
    </div>
  )
}
