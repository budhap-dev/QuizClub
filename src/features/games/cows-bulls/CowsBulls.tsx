import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Delete, Eye, HelpCircle, RefreshCw } from 'lucide-react'
import { Button, Card, alertDialog, party } from '@/components'
import { cn, shuffle } from '@/utils'
import { sfx } from '@/utils/sounds'
import { AwardBar } from '../AwardBar'
import { useKeyboard } from '../useKeyboard'

interface Guess {
  value: string
  bulls: number
  cows: number
}

function randomSecret(): string {
  return shuffle('0123456789'.split('')).slice(0, 4).join('')
}

function score(secret: string, guess: string): { bulls: number; cows: number } {
  let bulls = 0
  let cows = 0
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) bulls++
    else if (secret.includes(guess[i])) cows++
  }
  return { bulls, cows }
}

export default function CowsBulls() {
  const [secret, setSecret] = useState(randomSecret)
  const [custom, setCustom] = useState('')
  const [current, setCurrent] = useState('')
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [won, setWon] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [rules, setRules] = useState(false)
  const [shake, setShake] = useState(0)

  const over = won || revealed

  const reset = (s?: string) => {
    setSecret(s ?? randomSecret())
    setCurrent('')
    setGuesses([])
    setWon(false)
    setRevealed(false)
    setCustom('')
  }

  const submit = useCallback(() => {
    if (current.length !== 4 || over) return
    const { bulls, cows } = score(secret, current)
    setGuesses((g) => [{ value: current, bulls, cows }, ...g])
    setCurrent('')
    if (bulls === 4) {
      setWon(true)
      sfx.fanfare()
      party.celebrate()
    } else {
      bulls + cows > 0 ? sfx.correct() : sfx.wrong()
    }
  }, [current, secret, over])

  const press = useCallback(
    (key: string) => {
      if (over) return
      if (key === 'Enter') return submit()
      if (key === 'Backspace') return setCurrent((c) => c.slice(0, -1))
      if (/^[0-9]$/.test(key)) {
        if (current.includes(key)) {
          setShake((s) => s + 1)
          sfx.wrong()
          return
        }
        if (current.length < 4) {
          sfx.click()
          setCurrent((c) => c + key)
        }
      }
    },
    [current, over, submit],
  )

  useKeyboard(press)

  const setCustomSecret = () => {
    if (!/^\d{4}$/.test(custom) || new Set(custom).size !== 4) {
      void alertDialog({ title: 'Invalid secret number', message: 'Enter 4 different digits, for example 4071.' })
      return
    }
    reset(custom)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <Button size="sm" variant="secondary" onClick={() => reset()}>
          <RefreshCw /> New game
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setRules((r) => !r)} aria-expanded={rules}>
          <HelpCircle /> Rules
        </Button>
        {!over && guesses.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => setRevealed(true)}>
            <Eye /> Reveal
          </Button>
        )}
      </div>

      <AnimatePresence>
        {rules && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="mb-4 text-fg/80 text-sm md:text-base">
              A secret 4-digit number with no repeated digits is hidden. Each guess gets scored: <b className="text-sun">Bulls</b> = a correct digit in the correct
              place, <b className="text-cyan">Cows</b> = a correct digit in the wrong place. Four bulls wins.
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {guesses.length === 0 && !over && (
        <Card className="mb-4 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-sm text-fg/60">Host: set a secret (optional)</span>
          <input type="password" inputMode="numeric" maxLength={4} className="input !w-32 text-center tracking-widest" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} placeholder="••••" />
          <Button size="sm" onClick={setCustomSecret}>
            Set
          </Button>
        </Card>
      )}

      {/* Current guess */}
      <motion.div key={shake} animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined} transition={{ duration: 0.4 }} className="flex justify-center gap-3 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'w-16 h-20 md:w-20 md:h-24 rounded-xl flex items-center justify-center font-display font-semibold text-4xl md:text-5xl border-2 transition-colors',
              over ? 'bg-brand text-on-accent border-transparent shadow-lg' : current[i] ? 'bg-fg/12 border-purple' : 'bg-fg/5 border-fg/15',
            )}
          >
            {over ? secret[i] : (current[i] ?? '')}
          </div>
        ))}
      </motion.div>

      {over && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-4">
          <div className="text-2xl md:text-3xl font-display font-semibold">{won ? `Cracked in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}` : `The number was ${secret}`}</div>
          {won && <AwardBar points={10} reason="cows-bulls" />}
        </motion.div>
      )}

      {/* Digit pad */}
      {!over && (
        <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-4">
          {'1234567890'.split('').map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.9 }}
              onClick={() => press(d)}
              disabled={current.includes(d) || current.length >= 4}
              className="h-14 md:h-16 rounded-xl bg-fg/10 border border-fg/8 hover:bg-fg/16 disabled:opacity-25 font-display font-semibold text-2xl md:text-3xl transition-colors"
            >
              {d}
            </motion.button>
          ))}
          <Button variant="secondary" className="col-span-2" onClick={() => press('Backspace')} disabled={!current} aria-label="Backspace">
            <Delete />
          </Button>
          <Button className="col-span-3" onClick={submit} disabled={current.length !== 4}>
            Guess
          </Button>
        </div>
      )}

      {/* History */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {guesses.map((g, i) => (
            <motion.div
              key={guesses.length - i}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="glass rounded-xl px-4 py-2 flex items-center gap-4"
            >
              <span className="text-fg/40 text-sm w-6 tabular-nums">{guesses.length - i}</span>
              <span className="font-display font-semibold text-2xl md:text-3xl tracking-[0.3em]">{g.value}</span>
              <span className="ml-auto font-display font-semibold text-xl md:text-2xl text-sun tabular-nums">
                <span className="text-[11px] uppercase tracking-wider text-fg/50 font-medium mr-1.5">Bulls</span>
                {g.bulls}
              </span>
              <span className="font-display font-semibold text-xl md:text-2xl text-cyan tabular-nums">
                <span className="text-[11px] uppercase tracking-wider text-fg/50 font-medium mr-1.5">Cows</span>
                {g.cows}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
