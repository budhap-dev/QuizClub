import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, party } from '@/components'
import { useSessionStore } from '@/store/sessionStore'
import { cn, sample, shuffle } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '../AwardBar'

const EMOJIS = ['🍕', '🚀', '🐸', '🎸', '🌈', '🦄', '🍩', '⚽', '🎈', '🐙', '🍉', '🎯', '🦖', '🌵', '🎃', '🐳', '🧁', '🎲', '🦜', '🍓', '🛸', '🐝', '🎁', '🧩']

interface CardT {
  id: number
  emoji: string
  matched: boolean
}

const SIZES = [
  { label: 'Easy 4×3', cols: 4, pairs: 6 },
  { label: 'Medium 4×4', cols: 4, pairs: 8 },
  { label: 'Hard 6×4', cols: 6, pairs: 12 },
]

function deal(pairs: number): CardT[] {
  const picked = sample(EMOJIS, pairs)
  return shuffle([...picked, ...picked]).map((emoji, id) => ({ id, emoji, matched: false }))
}

export default function Memory() {
  const teams = useSessionStore((s) => s.teams)
  const [size, setSize] = useState(1)
  const [cards, setCards] = useState(() => deal(SIZES[1].pairs))
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [lock, setLock] = useState(false)
  const [teamMode, setTeamMode] = useState(false)
  const [turn, setTurn] = useState(0)
  const [teamScores, setTeamScores] = useState([0, 0])

  const names = [teams[0]?.name ?? 'Team A', teams[1]?.name ?? 'Team B']
  const colors = [teams[0]?.color ?? '#ff4d8d', teams[1]?.color ?? '#22d3ee']
  const done = cards.every((c) => c.matched)

  const reset = (s = size) => {
    setCards(deal(SIZES[s].pairs))
    setFlipped([])
    setMoves(0)
    setSeconds(0)
    setStarted(false)
    setLock(false)
    setTurn(0)
    setTeamScores([0, 0])
  }

  useEffect(() => {
    if (!started || done) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [started, done])

  useEffect(() => {
    if (done && cards.length) {
      sfx.fanfare()
      party.celebrate()
    }
  }, [done, cards.length])

  const flip = (id: number) => {
    if (lock || flipped.includes(id) || cards[id].matched) return
    setStarted(true)
    sfx.click()
    const next = [...flipped, id]
    setFlipped(next)
    if (next.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = next
      if (cards[a].emoji === cards[b].emoji) {
        setCards((cs) => cs.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)))
        setFlipped([])
        sfx.correct()
        if (teamMode) setTeamScores((s) => s.map((v, i) => (i === turn ? v + 1 : v)))
      } else {
        setLock(true)
        window.setTimeout(() => {
          setFlipped([])
          setLock(false)
          sfx.wrong()
          if (teamMode) setTurn((t) => 1 - t)
        }, 800)
      }
    }
  }

  const winner = teamScores[0] === teamScores[1] ? null : teamScores[0] > teamScores[1] ? 0 : 1

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="flex flex-wrap gap-2 justify-center items-center mb-4">
        {SIZES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => {
              setSize(i)
              reset(i)
            }}
            className={cn('px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-colors', size === i ? 'bg-mint text-ink border-mint' : 'border-fg/15 hover:bg-fg/10')}
          >
            {s.label}
          </button>
        ))}
        <label className="text-sm text-fg/60 flex items-center gap-2 cursor-pointer ml-2">
          <input
            type="checkbox"
            checked={teamMode}
            onChange={(e) => {
              setTeamMode(e.target.checked)
              reset()
            }}
            className="accent-mint"
          />
          2 teams take turns
        </label>
        <Button size="sm" variant="secondary" onClick={() => reset()}>
          🔄 New game
        </Button>
      </div>

      <div className="flex justify-center gap-6 mb-4 font-display font-bold text-lg md:text-xl">
        <span>
          Moves: <b className="text-sun">{moves}</b>
        </span>
        <span>
          Time: <b className="text-cyan">{seconds}s</b>
        </span>
      </div>

      {teamMode && (
        <div className="flex justify-center gap-3 mb-4">
          {names.map((n, i) => (
            <motion.div
              key={n}
              animate={{ scale: turn === i && !done ? 1.08 : 1 }}
              className={cn('rounded-2xl px-4 py-2 font-display font-bold border-2', turn === i && !done ? 'bg-fg/15' : 'opacity-60')}
              style={{ borderColor: colors[i] }}
            >
              {n}: <span style={{ color: colors[i] }}>{teamScores[i]}</span>
              {turn === i && !done && <span className="ml-2">👈</span>}
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-2 md:gap-3 mx-auto" style={{ gridTemplateColumns: `repeat(${SIZES[size].cols}, minmax(0, 1fr))`, maxWidth: SIZES[size].cols * 110 }}>
        {cards.map((c) => {
          const up = flipped.includes(c.id) || c.matched
          return (
            <motion.button
              key={c.id}
              onClick={() => flip(c.id)}
              whileHover={!up ? { scale: 1.05 } : undefined}
              whileTap={!up ? { scale: 0.95 } : undefined}
              className="aspect-square relative"
              style={{ perspective: 600 }}
              aria-label={up ? c.emoji : 'Hidden card'}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ rotateY: up ? 180 : 0 }}
                transition={{ duration: 0.45 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple to-pink flex items-center justify-center text-3xl shadow-lg" style={{ backfaceVisibility: 'hidden' }}>
                  ❓
                </div>
                <div
                  className={cn(
                    'absolute inset-0 rounded-2xl flex items-center justify-center text-4xl md:text-5xl shadow-lg',
                    c.matched ? 'bg-mint/30 ring-4 ring-mint' : 'bg-fg/15',
                  )}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {c.emoji}
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6">
            <div className="text-3xl md:text-4xl font-display font-bold">
              {teamMode ? (winner === null ? '🤝 It’s a tie!' : `🏆 ${names[winner]} wins!`) : `🎉 Done in ${moves} moves · ${seconds}s`}
            </div>
            <AwardBar points={10} reason="memory" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
