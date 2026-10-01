import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronRight, Eye, Lightbulb, X } from 'lucide-react'
import { Button, party } from '@/components'
import { cn, OPTION_COLORS, OPTION_LABELS, shuffle } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '../AwardBar'

/** Four things, the odd one first, then why. The board shuffles them. */
const SETS: [string[], string][] = [
  [['Moon', 'Mercury', 'Venus', 'Earth'], 'The Moon is a natural satellite; the others are planets.'],
  [['Sirius', 'Mars', 'Jupiter', 'Saturn'], 'Sirius is a star; the others are planets.'],
  [['Trumpet', 'Violin', 'Cello', 'Viola'], 'The trumpet is a brass instrument; the others have strings.'],
  [['Flute', 'Piano', 'Guitar', 'Harp'], 'The flute is a wind instrument; the others have strings.'],
  [['Carrot', 'Tomato', 'Cucumber', 'Pumpkin'], 'A carrot is a root; the others are botanically fruits.'],
  [['Shark', 'Whale', 'Dolphin', 'Seal'], 'The shark is a fish; the others are mammals.'],
  [['Bat', 'Sparrow', 'Pigeon', 'Parrot'], 'The bat is a mammal; the others are birds.'],
  [['Eagle', 'Penguin', 'Ostrich', 'Emu'], 'The eagle can fly; the others are flightless birds.'],
  [['Gecko', 'Python', 'Cobra', 'Viper'], 'The gecko is a lizard; the others are snakes.'],
  [['Frog', 'Crocodile', 'Turtle', 'Snake'], 'The frog is an amphibian; the others are reptiles.'],
  [['Spider', 'Ant', 'Bee', 'Beetle'], 'A spider has eight legs and is an arachnid; the others are insects.'],
  [['Wolf', 'Lion', 'Tiger', 'Leopard'], 'The wolf is a canine; the others are big cats.'],
  [['Sydney', 'Paris', 'Rome', 'Madrid'], "Sydney isn't a national capital; the others are."],
  [['Bolivia', 'Japan', 'Iceland', 'Madagascar'], 'Bolivia is landlocked; the others are island nations.'],
  [['Kilimanjaro', 'Everest', 'K2', 'Kangchenjunga'], 'Kilimanjaro is in Africa; the others are in the Himalaya and Karakoram.'],
  [['Sahara', 'Amazon', 'Nile', 'Danube'], 'The Sahara is a desert; the others are rivers.'],
  [['Caspian', 'Pacific', 'Atlantic', 'Indian'], 'The Caspian is an enclosed sea, often called the largest lake; the others are oceans.'],
  [['Oxygen', 'Neon', 'Argon', 'Helium'], 'Oxygen is not a noble gas; the others are.'],
  [['Water', 'Hydrogen', 'Helium', 'Lithium'], 'Water is a compound; the others are elements.'],
  [['Diamond', 'Iron', 'Copper', 'Gold'], 'Diamond is a form of carbon, not a metal.'],
  [['Mercury', 'Copper', 'Silver', 'Iron'], 'Mercury is liquid at room temperature; the others are solid.'],
  [['Pascal', 'Celsius', 'Fahrenheit', 'Kelvin'], 'The pascal measures pressure; the others are temperature scales.'],
  [['Triangle', 'Square', 'Rectangle', 'Rhombus'], 'A triangle has three sides; the others have four.'],
  [['Cube', 'Hexagon', 'Pentagon', 'Octagon'], 'A cube is a 3D solid; the others are flat shapes.'],
  [['9', '2', '3', '5'], '9 is not a prime number (3 × 3); the others are prime.'],
  [['48', '16', '25', '36'], "48 isn't a perfect square; 16, 25 and 36 are 4², 5² and 6²."],
  [['Mozart', 'Picasso', 'Monet', 'Van Gogh'], 'Mozart was a composer; the others were painters.'],
  [['Beethoven', 'Shakespeare', 'Dickens', 'Austen'], 'Beethoven was a composer; the others were writers.'],
  [['Oliver Twist', 'Hamlet', 'Macbeth', 'Othello'], 'Oliver Twist is a Dickens novel; the others are Shakespeare plays.'],
  [['Golf', 'Tennis', 'Badminton', 'Squash'], 'Golf is played with clubs; the others with rackets.'],
  [['Toyota', 'Apple', 'Google', 'Microsoft'], 'Toyota makes cars; the others are tech companies.'],
  [['Femur', 'Heart', 'Liver', 'Kidney'], 'The femur is a bone; the others are organs.'],
]

const deal = (set: (typeof SETS)[number]) => ({ items: shuffle(set[0]), odd: set[0][0], reason: set[1] })

export default function OddOneOut() {
  const [queue, setQueue] = useState(() => shuffle(SETS))
  const [i, setI] = useState(0)
  const [board, setBoard] = useState(() => deal(queue[0]))
  const [picked, setPicked] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const choose = (item: string) => {
    if (revealed) return
    setPicked(item)
    setRevealed(true)
    if (item === board.odd) {
      sfx.correct()
      party.burst()
    } else sfx.wrong()
  }

  const next = () => {
    let q = queue
    let n = i + 1
    // Out of sets: reshuffle and start again.
    if (n >= q.length) {
      q = shuffle(SETS)
      setQueue(q)
      n = 0
    }
    setI(n)
    setBoard(deal(q[n]))
    setPicked(null)
    setRevealed(false)
  }

  const right = picked === board.odd

  return (
    <div className="max-w-3xl mx-auto text-center">
      <p className="text-fg/60 text-sm mb-5">
        Which one doesn't belong? Tap the room's answer, or reveal it. <span className="tabular-nums">Round {i + 1}</span>
      </p>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5">
        {board.items.map((item, k) => {
          const isOdd = item === board.odd
          const color = OPTION_COLORS[k]
          const wrongPick = revealed && picked === item && !isOdd
          return (
            <motion.button
              key={board.odd + item}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: revealed && !isOdd && !wrongPick ? 0.4 : 1, y: 0 }}
              transition={{ delay: revealed ? 0 : k * 0.06 }}
              onClick={() => choose(item)}
              disabled={revealed}
              className={cn('rounded-2xl border p-4 md:p-6 flex items-center gap-3 text-left transition-colors min-h-20 md:min-h-28', !revealed && 'hover:brightness-125')}
              style={
                revealed && isOdd
                  ? { background: 'var(--color-mint)', borderColor: 'var(--color-mint)', color: 'var(--color-ink)' }
                  : wrongPick
                    ? { background: 'color-mix(in srgb, var(--color-red) 22%, transparent)', borderColor: 'var(--color-red)' }
                    : { background: `color-mix(in srgb, ${color} 14%, transparent)`, borderColor: `color-mix(in srgb, ${color} 45%, transparent)` }
              }
            >
              <span className="w-9 h-9 rounded-lg font-display font-semibold flex items-center justify-center shrink-0 text-ink" style={{ background: revealed && isOdd ? 'color-mix(in srgb, var(--color-ink) 15%, transparent)' : wrongPick ? 'var(--color-red)' : color }}>
                {revealed && isOdd ? <Check size={18} strokeWidth={3} /> : wrongPick ? <X size={18} strokeWidth={3} /> : OPTION_LABELS[k]}
              </span>
              <span className="text-xl md:text-3xl font-display font-semibold leading-tight">{item}</span>
            </motion.button>
          )
        })}
      </div>

      {revealed ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl border border-sun/40 bg-sun/10 px-4 py-3 flex items-start gap-3 text-left max-w-2xl mx-auto">
            <Lightbulb className="text-sun shrink-0 mt-0.5" size={20} />
            <div>
              {picked && <div className={cn('font-display font-semibold', right ? 'text-mint' : 'text-red')}>{right ? 'Correct!' : `Not quite — it's ${board.odd}`}</div>}
              <div className="text-fg/85">{board.reason}</div>
            </div>
          </div>
          {right && <AwardBar points={10} reason="odd-one-out" />}
          <Button className="mt-4" onClick={next}>
            Next set <ChevronRight />
          </Button>
        </motion.div>
      ) : (
        <Button variant="secondary" onClick={() => setRevealed(true)}>
          <Eye /> Reveal
        </Button>
      )}
    </div>
  )
}
