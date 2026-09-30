import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, Lightbulb, RefreshCw } from 'lucide-react'
import { Button, party } from '@/components'
import { cn, pick } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '../AwardBar'
import { OnScreenKeyboard, type KeyStatus } from '../OnScreenKeyboard'
import { useKeyboard } from '../useKeyboard'

interface Word {
  w: string
  hint: string
}

const WORDS: Record<string, Word[]> = {
  Animals: [
    { w: 'ELEPHANT', hint: 'Largest land animal' }, { w: 'KANGAROO', hint: 'Hops around Australia' }, { w: 'PENGUIN', hint: 'Bird in a tuxedo' },
    { w: 'GIRAFFE', hint: 'Longest neck' }, { w: 'DOLPHIN', hint: 'Clever ocean mammal' }, { w: 'CHEETAH', hint: 'Fastest on land' },
    { w: 'OCTOPUS', hint: 'Eight arms' }, { w: 'CROCODILE', hint: 'Toothy river reptile' }, { w: 'BUTTERFLY', hint: 'Was once a caterpillar' },
    { w: 'HEDGEHOG', hint: 'Spiky and small' }, { w: 'FLAMINGO', hint: 'Pink and stands on one leg' }, { w: 'CHAMELEON', hint: 'Changes colour' },
    { w: 'PEACOCK', hint: 'Show-off tail feathers' }, { w: 'RHINOCEROS', hint: 'Horn on its nose' }, { w: 'SQUIRREL', hint: 'Hoards nuts' },
  ],
  Countries: [
    { w: 'BRAZIL', hint: 'Home of carnival' }, { w: 'JAPAN', hint: 'Land of the rising sun' }, { w: 'ARGENTINA', hint: 'Tango and Messi' },
    { w: 'NIGERIA', hint: 'Most populous in Africa' }, { w: 'NORWAY', hint: 'Fjords' }, { w: 'THAILAND', hint: 'Bangkok' },
    { w: 'PORTUGAL', hint: 'Lisbon' }, { w: 'AUSTRALIA', hint: 'Down under' }, { w: 'SWITZERLAND', hint: 'Alps and chocolate' },
    { w: 'INDONESIA', hint: 'Thousands of islands' }, { w: 'MOROCCO', hint: 'Marrakech' }, { w: 'NEW ZEALAND', hint: 'Kiwis' },
    { w: 'SRI LANKA', hint: 'Teardrop island' }, { w: 'MEXICO', hint: 'Tacos and pyramids' }, { w: 'ICELAND', hint: 'Geysers and volcanoes' },
  ],
  Movies: [
    { w: 'TITANIC', hint: 'Iceberg ahead' }, { w: 'FROZEN', hint: 'Let it go' }, { w: 'JURASSIC PARK', hint: 'Dinosaurs on an island' },
    { w: 'THE LION KING', hint: 'Hakuna matata' }, { w: 'INCEPTION', hint: 'A dream within a dream' }, { w: 'FINDING NEMO', hint: 'Lost clownfish' },
    { w: 'SPIRITED AWAY', hint: 'Ghibli bathhouse' }, { w: 'AVATAR', hint: 'Blue people of Pandora' }, { w: 'TOY STORY', hint: 'Woody and Buzz' },
    { w: 'THE MATRIX', hint: 'Red pill or blue pill' }, { w: 'HARRY POTTER', hint: 'The boy who lived' }, { w: 'LAGAAN', hint: 'Cricket vs the British' },
    { w: 'SHREK', hint: 'Green ogre' }, { w: 'GLADIATOR', hint: 'Are you not entertained?' }, { w: 'MOANA', hint: 'Ocean chose her' },
  ],
  Food: [
    { w: 'SPAGHETTI', hint: 'Long Italian pasta' }, { w: 'CROISSANT', hint: 'Buttery French crescent' }, { w: 'SUSHI', hint: 'Rice and fish' },
    { w: 'PANCAKE', hint: 'Flip it' }, { w: 'BIRYANI', hint: 'Fragrant layered rice' }, { w: 'GUACAMOLE', hint: 'Mashed avocado' },
    { w: 'CHOCOLATE', hint: 'Made from cocoa' }, { w: 'PIZZA', hint: 'Slice of Naples' }, { w: 'SAMOSA', hint: 'Fried triangle snack' },
    { w: 'BURRITO', hint: 'Wrapped Mexican meal' }, { w: 'LASAGNE', hint: 'Layered pasta bake' }, { w: 'DUMPLING', hint: 'Filled dough parcel' },
    { w: 'FALAFEL', hint: 'Fried chickpea balls' }, { w: 'CHEESECAKE', hint: 'Creamy dessert on a biscuit base' }, { w: 'POPCORN', hint: 'Cinema snack' },
  ],
  Science: [
    { w: 'GRAVITY', hint: 'Keeps your feet on the ground' }, { w: 'MOLECULE', hint: 'Group of atoms' }, { w: 'VOLCANO', hint: 'Erupts lava' },
    { w: 'TELESCOPE', hint: 'Look at the stars' }, { w: 'PHOTOSYNTHESIS', hint: 'How plants make food' }, { w: 'ELECTRON', hint: 'Negative particle' },
    { w: 'GALAXY', hint: 'Billions of stars' }, { w: 'MAGNET', hint: 'Attracts iron' }, { w: 'OXYGEN', hint: 'We breathe it' },
    { w: 'DINOSAUR', hint: 'Extinct giant reptile' }, { w: 'ECLIPSE', hint: 'Sun hides behind the Moon' }, { w: 'BACTERIA', hint: 'Tiny single-celled life' },
    { w: 'THERMOMETER', hint: 'Measures temperature' }, { w: 'ASTEROID', hint: 'Space rock' }, { w: 'EVOLUTION', hint: 'Darwin’s big idea' },
  ],
}

const CATEGORIES = [...Object.keys(WORDS), 'Random']
const MAX_WRONG = 7

function pickWord(cat: string): { word: Word; category: string } {
  const category = cat === 'Random' ? pick(Object.keys(WORDS)) : cat
  return { word: pick(WORDS[category]), category }
}

export default function Hangman() {
  const [cat, setCat] = useState('Random')
  const [round, setRound] = useState(() => pickWord('Random'))
  const [guessed, setGuessed] = useState<Set<string>>(new Set())
  const [hint, setHint] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const letters = useMemo(() => new Set(round.word.w.replace(/[^A-Z]/g, '').split('')), [round])
  const wrong = [...guessed].filter((l) => !letters.has(l))
  const won = [...letters].every((l) => guessed.has(l))
  const lost = wrong.length >= MAX_WRONG
  const over = won || lost || revealed
  const showAll = lost || revealed

  const newGame = (c = cat) => {
    setRound(pickWord(c))
    setGuessed(new Set())
    setHint(false)
    setRevealed(false)
  }

  const guess = useCallback(
    (key: string) => {
      if (over || !/^[A-Z]$/.test(key) || guessed.has(key)) return
      const next = new Set(guessed).add(key)
      setGuessed(next)
      if (letters.has(key)) {
        const nowWon = [...letters].every((l) => next.has(l))
        if (nowWon) {
          sfx.fanfare()
          party.celebrate()
        } else sfx.correct()
      } else {
        const wrongCount = [...next].filter((l) => !letters.has(l)).length
        wrongCount >= MAX_WRONG ? sfx.timeUp() : sfx.wrong()
      }
    },
    [over, guessed, letters],
  )

  useKeyboard(guess)

  const statuses: Record<string, KeyStatus> = {}
  guessed.forEach((l) => (statuses[l] = letters.has(l) ? 'correct' : 'absent'))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c)
              newGame(c)
            }}
            aria-pressed={cat === c}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              cat === c ? 'bg-pink/18 border-pink text-fg' : 'border-fg/12 text-fg/75 hover:bg-fg/8 hover:text-fg',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[14rem_1fr] gap-6 items-center">
        <Gallows wrong={wrong.length} lost={lost} />

        <div className="text-center">
          <div className="text-sm text-fg/50 mb-2 uppercase tracking-wider">{round.category}</div>
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4">
            {round.word.w.split('').map((ch, i) =>
              ch === ' ' ? (
                <div key={i} className="w-4 md:w-6" />
              ) : (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{ scale: guessed.has(ch) ? [1, 1.2, 1] : 1 }}
                  className={cn(
                    'w-9 h-12 md:w-12 md:h-16 rounded-lg border-b-4 flex items-center justify-center font-display font-semibold text-2xl md:text-4xl',
                    guessed.has(ch) ? 'bg-mint/20 border-mint text-fg' : showAll ? 'bg-red/20 border-red text-red' : 'bg-fg/10 border-fg/40',
                  )}
                >
                  {guessed.has(ch) || showAll ? ch : ''}
                </motion.div>
              ),
            )}
          </div>

          <div className="flex justify-center items-center gap-2 mb-4 text-fg/60 text-sm">
            <span>
              Wrong: <b className="text-red">{wrong.length}</b> / {MAX_WRONG}
            </span>
            {wrong.length > 0 && <span className="tracking-widest text-fg/40">{wrong.join(' ')}</span>}
          </div>

          <AnimatePresence mode="wait">
            {over ? (
              <motion.div key="over" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-4">
                <div className="text-2xl md:text-3xl font-display font-semibold">{won ? 'Got it!' : `It was "${round.word.w}"`}</div>
                {won && <AwardBar points={10} reason="hangman" />}
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 min-h-8">
                {hint ? (
                  <span className="text-sun font-medium inline-flex items-center gap-1.5">
                    <Lightbulb size={16} /> {round.word.hint}
                  </span>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setHint(true)}>
                    <Lightbulb /> Show hint
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-2 mb-4">
            <Button size="sm" variant="secondary" onClick={() => newGame()}>
              <RefreshCw /> New word
            </Button>
            {!over && (
              <Button size="sm" variant="secondary" onClick={() => setRevealed(true)}>
                <Eye /> Reveal
              </Button>
            )}
          </div>
        </div>
      </div>

      <OnScreenKeyboard onKey={guess} statuses={statuses} disabled={over} showEnter={false} lockGuessed />
    </div>
  )
}

/** SVG hangman drawn progressively. Parts appear with a draw-on animation. */
function Gallows({ wrong, lost }: { wrong: number; lost: boolean }) {
  const part = (n: number, el: JSX.Element) => (
    <AnimatePresence>
      {wrong >= n && (
        <motion.g key={n} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          {el}
        </motion.g>
      )}
    </AnimatePresence>
  )
  const stroke = lost ? 'var(--color-red)' : 'var(--color-sun)'
  return (
    <svg viewBox="0 0 200 240" className="w-48 md:w-56 mx-auto drop-shadow-lg">
      {/* Gallows base — always visible */}
      <motion.path d="M20 220 H120 M50 220 V20 H130 V45" style={{ stroke: 'var(--color-purple)' }} strokeWidth={8} strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
      {part(1, <motion.circle cx={130} cy={70} r={22} style={{ stroke }} strokeWidth={6} fill="none" />)}
      {part(2, <motion.path d="M130 92 V150" style={{ stroke }} strokeWidth={6} strokeLinecap="round" />)}
      {part(3, <motion.path d="M130 105 L100 130" style={{ stroke }} strokeWidth={6} strokeLinecap="round" />)}
      {part(4, <motion.path d="M130 105 L160 130" style={{ stroke }} strokeWidth={6} strokeLinecap="round" />)}
      {part(5, <motion.path d="M130 150 L105 195" style={{ stroke }} strokeWidth={6} strokeLinecap="round" />)}
      {part(6, <motion.path d="M130 150 L155 195" style={{ stroke }} strokeWidth={6} strokeLinecap="round" />)}
      {part(7, (
        <>
          <motion.path d="M120 62 l6 6 m0 -6 l-6 6" style={{ stroke }} strokeWidth={3} />
          <motion.path d="M134 62 l6 6 m0 -6 l-6 6" style={{ stroke }} strokeWidth={3} />
          <motion.path d="M120 82 q10 -8 20 0" style={{ stroke }} strokeWidth={3} fill="none" />
        </>
      ))}
    </svg>
  )
}
