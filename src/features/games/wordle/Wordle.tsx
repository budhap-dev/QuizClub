import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, RefreshCw } from 'lucide-react'
import { Button, Card, party } from '@/components'
import { cn, pick } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '../AwardBar'
import { OnScreenKeyboard, type KeyStatus } from '../OnScreenKeyboard'
import { useKeyboard } from '../useKeyboard'

const WORDS = `APPLE BEACH BRAIN BREAD BRICK BRIDE BROOM CANDY CHAIR CHEEK CHESS CHILD CLOCK CLOUD COAST CRANE CRISP CROWN DANCE DREAM DRINK EAGLE EARTH FEAST FIELD FLAME FLOUR FRUIT GHOST GIANT GLASS GLOBE GRAPE GRASS GREEN HEART HONEY HORSE HOUSE JUICE LEMON LIGHT LUNCH MAGIC MANGO MELON MONEY MOUSE MUSIC NIGHT NURSE OCEAN ONION PAINT PAPER PARTY PEACH PIANO PILOT PIZZA PLANT PLATE QUEEN QUIET RADIO RIVER ROBOT ROUND SALAD SHARK SHEEP SHIRT SHOES SLEEP SMILE SNAKE SNOW SPACE SPOON STORM SUGAR SWEET TABLE TIGER TOAST TOOTH TOWER TRAIN TRUCK WATER WHALE WHEEL WORLD YOUTH ZEBRA ACTOR ANGEL BASIC BLAZE BLOOM BOARD BRAVE CABIN CAMEL CHARM CHIEF CLEAN CLIMB COMET CORAL CRAFT DAISY DELTA DRAFT EMPTY ENJOY FAIRY FANCY FEVER FLASH FROST GRAND HAPPY HOTEL HUMAN JOLLY JUMBO KNIFE LASER LUCKY MAPLE METAL MOTOR NOBLE OLIVE ORBIT PEARL PLAZA PRIZE QUICK RAPID ROAST ROYAL SCARF SHINE SOLAR SPICE STONE STYLE SUNNY SWIFT TASTE TEMPO THUMB TOPIC TULIP UNITY VIVID WITCH YACHT`
  .split(/\s+/)
  .filter((w) => w.length === 5)

type Status = 'correct' | 'present' | 'absent'

function evaluate(guess: string, secret: string): Status[] {
  const res: Status[] = Array(5).fill('absent')
  const remaining: Record<string, number> = {}
  for (let i = 0; i < 5; i++) {
    if (guess[i] === secret[i]) res[i] = 'correct'
    else remaining[secret[i]] = (remaining[secret[i]] ?? 0) + 1
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === 'correct') continue
    if (remaining[guess[i]] > 0) {
      res[i] = 'present'
      remaining[guess[i]]--
    }
  }
  return res
}

const tileClass: Record<Status, string> = { correct: 'bg-mint text-ink border-mint', present: 'bg-sun text-ink border-sun', absent: 'bg-fg/10 text-fg/60 border-fg/10' }

export default function Wordle() {
  const [secret, setSecret] = useState(() => pick(WORDS))
  const [rows, setRows] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [strict, setStrict] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shake, setShake] = useState(0)
  const [custom, setCustom] = useState('')
  const [revealed, setRevealed] = useState(false)

  const won = rows[rows.length - 1] === secret
  const lost = !won && rows.length >= 6
  const over = won || lost || revealed

  const flash = (msg: string) => {
    setToast(msg)
    setShake((s) => s + 1)
    sfx.wrong()
    window.setTimeout(() => setToast(null), 1400)
  }

  const reset = (word?: string) => {
    setSecret(word ?? pick(WORDS))
    setRows([])
    setCurrent('')
    setRevealed(false)
    setCustom('')
  }

  const submit = useCallback(() => {
    if (over) return
    if (current.length < 5) return flash('Not enough letters')
    if (strict && !WORDS.includes(current)) return flash('Not in word list')
    const next = [...rows, current]
    setRows(next)
    setCurrent('')
    if (current === secret) {
      window.setTimeout(() => {
        sfx.fanfare()
        party.celebrate()
      }, 1300)
    } else if (next.length >= 6) {
      window.setTimeout(() => sfx.timeUp(), 1300)
    } else sfx.swoosh()
  }, [current, over, rows, secret, strict])

  const press = useCallback(
    (key: string) => {
      if (over) return
      if (key === 'Enter') return submit()
      if (key === 'Backspace') return setCurrent((c) => c.slice(0, -1))
      if (/^[A-Z]$/.test(key) && current.length < 5) {
        sfx.click()
        setCurrent((c) => c + key)
      }
    },
    [over, submit, current.length],
  )

  useKeyboard(press)

  // Keyboard colouring: best status wins.
  const statuses: Record<string, KeyStatus> = {}
  const rank: Record<Status, number> = { absent: 0, present: 1, correct: 2 }
  rows.forEach((r) => {
    evaluate(r, secret).forEach((s, i) => {
      const l = r[i]
      if (!statuses[l] || rank[s] > rank[statuses[l] as Status]) statuses[l] = s
    })
  })

  const setCustomSecret = () => {
    const w = custom.toUpperCase().replace(/[^A-Z]/g, '')
    if (w.length !== 5) return alert('Enter a 5-letter word.')
    reset(w)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-wrap gap-2 justify-center items-center mb-4">
        <Button size="sm" variant="secondary" onClick={() => reset()}>
          <RefreshCw /> New word
        </Button>
        <label className="text-sm text-fg/60 flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} className="accent-purple" /> Strict dictionary
        </label>
        {!over && rows.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => setRevealed(true)}>
            <Eye /> Reveal
          </Button>
        )}
      </div>

      {rows.length === 0 && !over && (
        <Card className="mb-4 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-sm text-fg/60">Host: set a secret word (optional)</span>
          <input type="password" maxLength={5} className="input !w-36 text-center tracking-widest uppercase" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="•••••" />
          <Button size="sm" onClick={setCustomSecret}>
            Set
          </Button>
        </Card>
      )}

      <div className="relative">
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-1/2 -translate-x-1/2 -top-2 z-10 bg-fg text-ink font-semibold text-sm px-3 py-1.5 rounded-lg shadow-lg">
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-1.5 md:gap-2 justify-center mb-6" style={{ gridTemplateRows: 'repeat(6, auto)' }}>
          {Array.from({ length: 6 }).map((_, r) => {
            const word = rows[r] ?? (r === rows.length ? current : '')
            const submitted = r < rows.length
            const ev = submitted ? evaluate(word, secret) : null
            const isCurrent = r === rows.length && !over
            return (
              <motion.div key={r + (isCurrent ? shake : 0)} animate={isCurrent && shake ? { x: [0, -8, 8, -5, 5, 0] } : undefined} transition={{ duration: 0.4 }} className="flex gap-1.5 md:gap-2">
                {Array.from({ length: 5 }).map((_, c) => {
                  const ch = word[c] ?? ''
                  return (
                    <motion.div
                      key={c}
                      initial={false}
                      animate={submitted ? { rotateX: [0, 90, 0] } : ch ? { scale: [1, 1.1, 1] } : {}}
                      transition={submitted ? { delay: c * 0.25, duration: 0.5 } : { duration: 0.15 }}
                      className={cn(
                        'w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 flex items-center justify-center font-display font-semibold text-2xl md:text-4xl',
                        submitted && ev ? tileClass[ev[c]] : ch ? 'border-fg/50' : 'border-fg/15',
                      )}
                      style={submitted ? { transitionDelay: `${c * 0.25 + 0.25}s` } : undefined}
                    >
                      {ch}
                    </motion.div>
                  )
                })}
              </motion.div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {over && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: won ? 1.3 : 0 }} className="text-center mb-4">
            <div className="text-2xl md:text-3xl font-display font-semibold">{won ? `Solved in ${rows.length}/6` : `The word was ${secret}`}</div>
            {won && <AwardBar points={Math.max(5, 35 - rows.length * 5)} reason="wordle" />}
          </motion.div>
        )}
      </AnimatePresence>

      <OnScreenKeyboard onKey={press} statuses={statuses} disabled={over} />
    </div>
  )
}
