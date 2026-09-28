import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components'
import { cn, shuffle } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '../AwardBar'

interface Riddle {
  e: string
  a: string
  c: string
}

const RIDDLES: Riddle[] = [
  { e: '🦁👑', a: 'The Lion King', c: 'Movies' },
  { e: '🕷️👨', a: 'Spider-Man', c: 'Movies' },
  { e: '🚢🧊💔', a: 'Titanic', c: 'Movies' },
  { e: '❄️👸⛄', a: 'Frozen', c: 'Movies' },
  { e: '🐠🔍', a: 'Finding Nemo', c: 'Movies' },
  { e: '🦖🏝️', a: 'Jurassic Park', c: 'Movies' },
  { e: '👻🚫', a: 'Ghostbusters', c: 'Movies' },
  { e: '🧙‍♂️💍🌋', a: 'The Lord of the Rings', c: 'Movies' },
  { e: '🤖❤️🌱', a: 'WALL-E', c: 'Movies' },
  { e: '🐀👨‍🍳', a: 'Ratatouille', c: 'Movies' },
  { e: '🧸🤠🚀', a: 'Toy Story', c: 'Movies' },
  { e: '🦇🃏', a: 'The Dark Knight', c: 'Movies' },
  { e: '🐝🎬', a: 'Bee Movie', c: 'Movies' },
  { e: '🏏🇮🇳👑', a: 'Lagaan', c: 'Movies' },
  { e: '3️⃣🤪', a: '3 Idiots', c: 'Movies' },
  { e: '🐍✈️', a: 'Snakes on a Plane', c: 'Movies' },
  { e: '👽📞🏠', a: 'E.T.', c: 'Movies' },
  { e: '💃🌧️', a: 'Singin’ in the Rain', c: 'Songs' },
  { e: '🐝🥇', a: 'Bohemian Rhapsody', c: 'Songs' },
  { e: '🔥💍', a: 'Ring of Fire', c: 'Songs' },
  { e: '🌉💧😰', a: 'Bridge Over Troubled Water', c: 'Songs' },
  { e: '👋🌍', a: 'Hello', c: 'Songs' },
  { e: '🎂🎉🎈', a: 'Happy Birthday', c: 'Songs' },
  { e: '☔👩‍🎤', a: 'Umbrella', c: 'Songs' },
  { e: '🚀👨', a: 'Rocket Man', c: 'Songs' },
  { e: '💎☁️', a: 'Lucy in the Sky with Diamonds', c: 'Songs' },
  { e: '👶🦈', a: 'Baby Shark', c: 'Songs' },
  { e: '🎶💃🇮🇳', a: 'Jai Ho', c: 'Songs' },
  { e: '🗼🥐', a: 'Paris', c: 'Places' },
  { e: '🗽🍎', a: 'New York', c: 'Places' },
  { e: '🕌🐪🏜️', a: 'Dubai', c: 'Places' },
  { e: '🍕🏛️', a: 'Rome', c: 'Places' },
  { e: '🐨🏄', a: 'Australia', c: 'Places' },
  { e: '🏔️🧘🕉️', a: 'Nepal', c: 'Places' },
  { e: '🎡🕰️☕', a: 'London', c: 'Places' },
  { e: '🍣🗻', a: 'Japan', c: 'Places' },
  { e: '🏰🕌🇮🇳', a: 'Agra', c: 'Places' },
  { e: '🧀🧈🍞', a: 'Grilled cheese', c: 'Food' },
  { e: '🍚🐔🌶️', a: 'Chicken biryani', c: 'Food' },
  { e: '🥑🍞', a: 'Avocado toast', c: 'Food' },
  { e: '🌽🍿', a: 'Popcorn', c: 'Food' },
  { e: '🥔🍟', a: 'French fries', c: 'Food' },
  { e: '🐟🍟', a: 'Fish and chips', c: 'Food' },
  { e: '🍅🍝', a: 'Spaghetti bolognese', c: 'Food' },
  { e: '🐘🏠', a: 'The elephant in the room', c: 'Idioms' },
  { e: '🐱🎒', a: 'Let the cat out of the bag', c: 'Idioms' },
  { e: '🌧️🐱🐶', a: 'Raining cats and dogs', c: 'Idioms' },
  { e: '🪨🐦🐦', a: 'Kill two birds with one stone', c: 'Idioms' },
  { e: '🍰🍴', a: 'A piece of cake', c: 'Idioms' },
  { e: '💵🌳', a: 'Money doesn’t grow on trees', c: 'Idioms' },
  { e: '🧊💔', a: 'Break the ice', c: 'Idioms' },
  { e: '🎩🐇', a: 'Pull a rabbit out of a hat', c: 'Idioms' },
  { e: '⚡👦👓', a: 'Harry Potter', c: 'Books' },
  { e: '🐋⛵😠', a: 'Moby-Dick', c: 'Books' },
  { e: '👧🐇🕳️', a: 'Alice in Wonderland', c: 'Books' },
  { e: '🐷🕸️', a: 'Charlotte’s Web', c: 'Books' },
  { e: '🐒🐯🐻👦', a: 'The Jungle Book', c: 'Books' },
  { e: '🏹🔥👧', a: 'The Hunger Games', c: 'Books' },
  { e: '👴🌊🐟', a: 'The Old Man and the Sea', c: 'Books' },
]

const CATEGORIES = ['All', ...Array.from(new Set(RIDDLES.map((r) => r.c)))]

export default function EmojiRiddles() {
  const [cat, setCat] = useState('All')
  const [order, setOrder] = useState(() => shuffle(RIDDLES))
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const list = useMemo(() => (cat === 'All' ? order : order.filter((r) => r.c === cat)), [order, cat])
  const r = list[i % Math.max(1, list.length)]

  const go = (d: number) => {
    setRevealed(false)
    sfx.swoosh()
    setI((x) => (x + d + list.length) % list.length)
  }

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c)
              setI(0)
              setRevealed(false)
            }}
            className={cn('px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-colors', cat === c ? 'bg-purple border-purple' : 'border-white/15 hover:bg-white/10')}
          >
            {c}
          </button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOrder(shuffle(RIDDLES))
            setI(0)
            setRevealed(false)
          }}
        >
          🔀 Shuffle
        </Button>
      </div>

      <div className="text-white/50 text-sm mb-2 uppercase tracking-wider">
        {r.c} · {(i % list.length) + 1} / {list.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={r.e + i}
          initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.7, rotate: 4 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          className="glass rounded-[2.5rem] py-12 md:py-20 px-6 mb-6"
        >
          <div className="text-7xl md:text-9xl leading-none tracking-wider">{r.e}</div>
        </motion.div>
      </AnimatePresence>

      <div className="min-h-24 mb-4" style={{ perspective: 800 }}>
        <AnimatePresence mode="wait">
          {revealed ? (
            <motion.div
              key="ans"
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-rainbow text-ink rounded-3xl px-8 py-5 inline-block font-display font-bold text-3xl md:text-5xl"
            >
              {r.a}
            </motion.div>
          ) : (
            <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl md:text-3xl text-white/60 font-display pt-4">
              🤔 What is it?
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={() => go(-1)}>
          ← Prev
        </Button>
        {!revealed ? (
          <Button
            onClick={() => {
              setRevealed(true)
              sfx.reveal()
            }}
          >
            👀 Reveal answer
          </Button>
        ) : (
          <Button onClick={() => go(1)}>Next →</Button>
        )}
        <Button variant="secondary" onClick={() => go(1)}>
          Skip →
        </Button>
      </div>

      {revealed && <AwardBar points={10} reason="emoji-riddles" title="Who got it?" />}
    </div>
  )
}
