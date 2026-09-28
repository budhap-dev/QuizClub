import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, party } from '@/components'
import { cn, pick, shuffle } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '../AwardBar'

const WORDS: Record<string, string[]> = {
  Animals: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'KANGAROO', 'LEOPARD', 'OSTRICH', 'HAMSTER', 'PANTHER', 'TORTOISE', 'SQUIRREL', 'GORILLA', 'BUFFALO', 'RACCOON', 'PELICAN', 'LOBSTER', 'SPARROW', 'ANTELOPE', 'MONGOOSE', 'JELLYFISH'],
  Fruits: ['BANANA', 'MANGO', 'PAPAYA', 'CHERRY', 'ORANGE', 'GRAPES', 'PINEAPPLE', 'STRAWBERRY', 'WATERMELON', 'COCONUT', 'APRICOT', 'BLUEBERRY', 'POMEGRANATE', 'LYCHEE', 'GUAVA', 'AVOCADO', 'RASPBERRY', 'KIWI', 'PEACH', 'JACKFRUIT'],
  Countries: ['FRANCE', 'BRAZIL', 'CANADA', 'NIGERIA', 'GERMANY', 'THAILAND', 'PORTUGAL', 'ARGENTINA', 'MALAYSIA', 'SWEDEN', 'PAKISTAN', 'AUSTRALIA', 'ETHIOPIA', 'COLOMBIA', 'VIETNAM', 'HUNGARY', 'DENMARK', 'MOROCCO', 'PHILIPPINES', 'ICELAND'],
  Jobs: ['TEACHER', 'PLUMBER', 'SURGEON', 'ARCHITECT', 'FIREFIGHTER', 'JOURNALIST', 'ENGINEER', 'MUSICIAN', 'DENTIST', 'LAWYER', 'FARMER', 'PILOT', 'CHEMIST', 'DESIGNER', 'LIBRARIAN', 'MECHANIC', 'SCIENTIST', 'ASTRONAUT', 'CARPENTER', 'DETECTIVE'],
  Kitchen: ['SPATULA', 'BLENDER', 'TOASTER', 'SAUCEPAN', 'COLANDER', 'WHISK', 'KETTLE', 'GRATER', 'LADLE', 'SKILLET', 'CUTLERY', 'MICROWAVE', 'CHOPSTICKS', 'ROLLING PIN', 'THERMOS', 'TEAPOT', 'CORKSCREW', 'STRAINER', 'PEELER', 'TONGS'],
}
const CATEGORIES = [...Object.keys(WORDS), 'Random']
const TIMES = [15, 30, 60]

function scramble(word: string): string {
  const letters = word.replace(/ /g, '').split('')
  let out = word
  let guard = 0
  while (out === word && guard++ < 20) out = shuffle(letters).join('')
  return out
}

export default function Scramble() {
  const [cat, setCat] = useState('Random')
  const [duration, setDuration] = useState(30)
  const [word, setWord] = useState(() => pick(WORDS[pick(Object.keys(WORDS))]))
  const [scrambled, setScrambled] = useState(() => scramble(word))
  const [remaining, setRemaining] = useState(duration)
  const [running, setRunning] = useState(false)
  const [state, setState] = useState<'play' | 'correct' | 'revealed' | 'timeup'>('play')
  const [round, setRound] = useState(1)

  const newWord = (c = cat, keepRound = false) => {
    const category = c === 'Random' ? pick(Object.keys(WORDS)) : c
    const w = pick(WORDS[category].filter((x) => x !== word))
    setWord(w)
    setScrambled(scramble(w))
    setRemaining(duration)
    setRunning(false)
    setState('play')
    if (!keepRound) setRound((r) => r + 1)
  }

  useEffect(() => {
    if (!running || state !== 'play') return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id)
          setRunning(false)
          setState('timeup')
          sfx.timeUp()
          return 0
        }
        if (r <= 6) sfx.tick()
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, state])

  const correct = () => {
    setState('correct')
    setRunning(false)
    sfx.fanfare()
    party.burst()
  }

  const pct = (remaining / duration) * 100
  const barColor = pct > 50 ? '#34d399' : pct > 25 ? '#fbbf24' : '#f43f5e'

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c)
              newWord(c)
            }}
            className={cn('px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-colors', cat === c ? 'bg-cyan text-ink border-cyan' : 'border-white/15 hover:bg-white/10')}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-center items-center mb-6 text-sm text-white/60">
        Timer:
        {TIMES.map((t) => (
          <button
            key={t}
            onClick={() => {
              setDuration(t)
              setRemaining(t)
              setRunning(false)
            }}
            className={cn('px-2.5 py-1 rounded-lg font-semibold', duration === t ? 'bg-white/20 text-white' : 'hover:bg-white/10')}
          >
            {t}s
          </button>
        ))}
        <span className="ml-3">Round {round}</span>
      </div>

      {/* Timer bar */}
      <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-6 max-w-xl mx-auto">
        <motion.div className="h-full rounded-full" animate={{ width: `${pct}%`, background: barColor }} transition={{ duration: 0.9, ease: 'linear' }} />
      </div>

      {/* Letters */}
      <AnimatePresence mode="wait">
        <motion.div key={scrambled + state} className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
          {(state === 'play' || state === 'timeup' ? scrambled : word).split('').map((ch, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, rotate: -10 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              className={cn(
                'w-12 h-14 md:w-16 md:h-20 rounded-2xl flex items-center justify-center font-display font-bold text-3xl md:text-5xl shadow-lg',
                state === 'correct' || state === 'revealed' ? 'bg-rainbow text-ink' : ch === ' ' ? 'opacity-0' : 'bg-gradient-to-br from-cyan to-purple',
              )}
            >
              {ch}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="text-5xl md:text-7xl font-display font-bold tabular-nums mb-4" style={{ color: barColor }}>
        {remaining}
      </div>

      {state === 'play' && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant={running ? 'secondary' : 'success'} onClick={() => setRunning((r) => !r)}>
            {running ? '⏸ Pause' : '▶️ Start'}
          </Button>
          <Button onClick={correct}>✅ Correct!</Button>
          <Button variant="secondary" onClick={() => setScrambled(scramble(word))}>
            🔀 Re-scramble
          </Button>
          <Button variant="danger" onClick={() => setState('revealed')}>
            👀 Reveal
          </Button>
          <Button variant="ghost" onClick={() => newWord()}>
            ⏭ Skip
          </Button>
        </div>
      )}

      {state !== 'play' && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-2xl md:text-3xl font-display font-bold mb-2">
            {state === 'correct' ? '🎉 Correct!' : state === 'timeup' ? `⏰ Time's up! It was ${word}` : `It was ${word}`}
          </div>
          {state === 'correct' && <AwardBar points={10} reason="scramble" />}
          <Button className="mt-4" onClick={() => newWord()}>
            Next word →
          </Button>
        </motion.div>
      )}
    </div>
  )
}
