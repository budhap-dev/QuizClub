import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, type TargetAndTransition, type Variants } from 'framer-motion'
import { Check, Lightbulb, Ruler, X } from 'lucide-react'
import type { OrderQuestion, Question } from '@/types'
import { cn, OPTION_COLORS, OPTION_LABELS } from '@/utils'
import { TimerRing } from '@/components'
import { formatNumberAnswer, orderAnswer, orderTiles } from './questionText'

interface QuestionViewProps {
  question: Question
  revealed: boolean
  timer?: { total: number; remaining: number; running: boolean }
  onToggleTimer?: () => void
  /** Option the host tapped (for true/false, 0 = True, 1 = False). */
  picked?: number | null
  onOption?: (i: number) => void
}

/** Options appear one after another; `i` is the option index. */
const showAt = (i: number): TargetAndTransition => ({
  opacity: 1,
  y: 0,
  transition: { delay: 0.3 + i * 0.09, type: 'spring', stiffness: 300, damping: 26 },
})

const optionAnim: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: showAt,
}

/**
 * Tinted tile in its option colour. On reveal the correct answer turns success green (whatever its
 * own colour) and a wrong pick turns red, so right and wrong never look alike.
 */
const tileStyle = (color: string, correct: boolean, wrong = false) =>
  correct
    ? { background: 'var(--color-mint)', borderColor: 'var(--color-fg)' }
    : wrong
      ? { background: 'color-mix(in srgb, var(--color-red) 24%, transparent)', borderColor: 'var(--color-red)' }
      : { background: `color-mix(in srgb, ${color} 14%, transparent)`, borderColor: `color-mix(in srgb, ${color} 45%, transparent)` }

/** A short side-to-side shake for a wrong pick. */
const shake = (i: number): TargetAndTransition => ({ ...showAt(i), x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.45 } })

const WrongMark = () => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="shrink-0 rounded-full bg-red text-on-accent w-[clamp(2rem,5vh,3rem)] h-[clamp(2rem,5vh,3rem)] flex items-center justify-center"
    aria-label="Wrong answer"
  >
    <X className="w-[60%] h-[60%]" strokeWidth={3} />
  </motion.span>
)

/** Text of the correct answer, e.g. "B · Mars" or "True". */
function correctText(q: Question): string | null {
  if (q.type === 'mcq') return `${OPTION_LABELS[q.correctIndex] ?? ''} · ${q.options[q.correctIndex] ?? ''}`
  if (q.type === 'truefalse') return q.answer ? 'True' : 'False'
  return null
}

/**
 * After the reveal: a verdict when an answer was tapped ("Correct!" / "Not quite — the answer is B · Mars")
 * and the question's explanation. Renders nothing when there's neither.
 */
function AnswerPanel({ q, picked }: { q: Question; picked?: number | null }) {
  const tapped = picked !== null && picked !== undefined && (q.type === 'mcq' || q.type === 'truefalse')
  const right = tapped && (q.type === 'mcq' ? picked === q.correctIndex : q.type === 'truefalse' && (picked === 0) === q.answer)
  if (!tapped && !q.explanation) return null
  const tone = !tapped ? 'var(--color-sun)' : right ? 'var(--color-mint)' : 'var(--color-red)'
  return <PanelBody key={q.id + '-panel'} tone={tone} tapped={tapped} right={right} q={q} />
}

function PanelBody({ q, tone, tapped, right }: { q: Question; tone: string; tapped: boolean; right: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  // On short screens the panel can land below the fold: bring it into view once it has animated in.
  useEffect(() => {
    const id = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 450)
    return () => window.clearTimeout(id)
  }, [])
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.35, type: 'spring', stiffness: 260, damping: 26 } }}
      className="w-full max-w-4xl shrink-0 rounded-2xl border px-[clamp(0.875rem,2vw,1.5rem)] py-[clamp(0.5rem,1.6vh,1rem)] flex items-start gap-[clamp(0.625rem,1.5vw,1rem)]"
      style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, borderColor: `color-mix(in srgb, ${tone} 40%, transparent)` }}
      role="status"
      data-testid="answer-panel"
    >
      <span
        className="shrink-0 rounded-xl w-[clamp(2rem,5vh,2.75rem)] h-[clamp(2rem,5vh,2.75rem)] flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${tone} 22%, transparent)`, color: tone }}
        aria-hidden
      >
        {!tapped ? <Lightbulb className="w-[55%] h-[55%]" /> : right ? <Check className="w-[60%] h-[60%]" strokeWidth={3} /> : <X className="w-[60%] h-[60%]" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1 stage-text">
        {tapped && (
          <div className="font-display font-semibold text-[clamp(1.05rem,2.8vh,1.6rem)] leading-tight" style={{ color: tone }}>
            {right ? 'Correct!' : `Not quite — the answer is ${correctText(q)}`}
          </div>
        )}
        {q.explanation && <p className={cn('text-fg/85 text-[clamp(0.95rem,2.4vh,1.35rem)] leading-snug', tapped && 'mt-0.5')}>{q.explanation}</p>}
      </div>
    </motion.div>
  )
}

/**
 * Everything here is sized with clamp(…vh…) so a question, its image and its
 * options always fit the stage height without scrolling. The image is the only
 * flexible item: it takes whatever space is left after the prompt and answers.
 */
export function QuestionView({ question, revealed, timer, onToggleTimer, picked, onOption }: QuestionViewProps) {
  const q = question
  const hasTimer = timer && timer.total > 0 && q.type !== 'slide'

  return (
    // Scrolls only when it must (phones with the answer panel open); safe centring keeps the top reachable.
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col items-center justify-center-safe w-full max-w-6xl mx-auto px-4 py-[clamp(0.5rem,1.5vh,1.5rem)] gap-[clamp(0.5rem,2vh,1.5rem)]">
      {/* Prompt */}
      <motion.div
        key={q.id + '-prompt'}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="w-full shrink-0 flex flex-col md:flex-row items-center gap-3 md:gap-8"
      >
        {hasTimer && (
          <button onClick={onToggleTimer} className="order-first md:order-none shrink-0" title="Start / pause timer (T)">
            <TimerRing total={timer.total} remaining={timer.remaining} size={96} />
          </button>
        )}
        <h1
          className={cn(
            'stage-text font-display font-semibold tracking-tight text-center flex-1 leading-tight',
            q.type === 'slide' ? 'text-[clamp(1.75rem,7vh,4.5rem)] text-gradient' : 'text-[clamp(1.35rem,5vh,3.5rem)]',
          )}
        >
          {q.text}
        </h1>
        {hasTimer && <div className="hidden md:block w-24 shrink-0" />}
      </motion.div>

      {/* Image: flexible, fills the remaining height */}
      {q.imageUrl && (
        <motion.div
          key={q.id + '-img'}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 26 }}
          className="flex-1 min-h-0 w-full flex items-center justify-center"
        >
          <img
            src={q.imageUrl}
            alt=""
            className="max-h-[38vh] md:max-h-full max-w-full rounded-2xl shadow-xl object-contain bg-fg/5 p-2 border border-fg/10"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      )}

      {/* Body by type */}
      {q.type === 'slide' && q.body && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-[clamp(1.1rem,3.2vh,1.9rem)] text-fg/75 text-center max-w-4xl whitespace-pre-line stage-text min-h-0 overflow-y-auto no-scrollbar"
        >
          {q.body}
        </motion.p>
      )}

      {q.type === 'mcq' && (
        <div className={cn('grid gap-[clamp(0.5rem,1.5vh,1rem)] w-full shrink-0 md:grid-cols-2', q.options.length > 4 && 'lg:grid-cols-3')}>
          {q.options.map((opt, i) => {
            const color = OPTION_COLORS[i % OPTION_COLORS.length]
            const correct = revealed && i === q.correctIndex
            const wrong = revealed && picked === i && !correct
            const dim = revealed && !correct && !wrong
            return (
              <motion.button
                key={q.id + '-' + i}
                custom={i}
                variants={optionAnim}
                initial="hidden"
                animate={correct ? { ...showAt(i), scale: [1, 1.03, 1], transition: { duration: 0.5 } } : wrong ? shake(i) : 'show'}
                onClick={() => onOption?.(i)}
                aria-pressed={picked === i}
                style={tileStyle(color, correct, wrong)}
                className={cn(
                  'relative rounded-2xl px-[clamp(0.75rem,2vw,1.5rem)] py-[clamp(0.5rem,1.8vh,1.25rem)] text-left flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] border transition-all duration-500',
                  correct ? 'text-ink shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-fg)_25%,transparent)]' : 'text-fg',
                  !revealed && 'hover:brightness-125',
                  dim && 'opacity-30 grayscale',
                )}
              >
                <span
                  className={cn(
                    'font-display font-semibold text-[clamp(1.1rem,3.2vh,2rem)] rounded-xl w-[clamp(2.25rem,6.5vh,3.5rem)] h-[clamp(2.25rem,6.5vh,3.5rem)] flex items-center justify-center shrink-0',
                    correct ? 'bg-ink/15 text-ink' : 'text-ink',
                  )}
                  style={correct ? undefined : { background: wrong ? 'var(--color-red)' : color }}
                >
                  {OPTION_LABELS[i]}
                </span>
                {q.optionImages?.[i] && <img src={q.optionImages[i]} alt="" className="h-[clamp(3rem,10vh,6rem)] rounded-lg object-contain bg-fg/20" />}
                <span className="font-display font-medium text-[clamp(1.05rem,3vh,1.8rem)] leading-tight stage-text">{opt}</span>
                {correct && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto shrink-0 rounded-full bg-ink/15 w-[clamp(2rem,5vh,3rem)] h-[clamp(2rem,5vh,3rem)] flex items-center justify-center"
                  >
                    <Check className="w-[60%] h-[60%]" strokeWidth={3} />
                  </motion.span>
                )}
                {wrong && (
                  <span className="ml-auto">
                    <WrongMark />
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}

      {q.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.5vh,1rem)] w-full max-w-3xl shrink-0">
          {[true, false].map((v, i) => {
            const color = v ? 'var(--color-mint)' : 'var(--color-red)'
            const correct = revealed && v === q.answer
            const wrong = revealed && picked === i && !correct
            const dim = revealed && !correct && !wrong
            const Icon = v ? Check : X
            return (
              <motion.button
                key={q.id + String(v)}
                custom={i}
                variants={optionAnim}
                initial="hidden"
                animate={wrong ? shake(i) : 'show'}
                onClick={() => onOption?.(i)}
                aria-pressed={picked === i}
                style={tileStyle(color, correct, wrong)}
                className={cn(
                  'relative rounded-2xl py-[clamp(1.25rem,6vh,3.5rem)] flex items-center justify-center gap-[clamp(0.5rem,1.5vw,1rem)] font-display font-semibold text-[clamp(1.5rem,5.5vh,3.5rem)] border transition-all duration-500',
                  correct ? 'text-ink shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-fg)_25%,transparent)] scale-[1.03]' : 'text-fg',
                  !revealed && 'hover:brightness-125',
                  dim && 'opacity-30 grayscale',
                )}
              >
                <span
                  className={cn('rounded-full w-[clamp(2rem,5.5vh,3.25rem)] h-[clamp(2rem,5.5vh,3.25rem)] flex items-center justify-center shrink-0', correct ? 'bg-ink/15' : 'text-ink')}
                  style={correct ? undefined : { background: color }}
                >
                  <Icon className="w-[60%] h-[60%]" strokeWidth={3} />
                </span>
                {v ? 'True' : 'False'}
                {wrong && (
                  <span className="absolute top-2 right-2">
                    <WrongMark />
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}

      {q.type === 'timed' && (
        <AnimatePresence mode="wait">
          {revealed ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-brand text-on-accent rounded-2xl px-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(1rem,4vh,2.5rem)] font-display font-semibold text-[clamp(1.5rem,6vh,3.5rem)] text-center stage-text shadow-xl shrink-0"
            >
              {q.answer}
            </motion.div>
          ) : (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[clamp(1.1rem,3.5vh,2rem)] text-fg/55 font-display text-center shrink-0">
              {timer?.running ? 'Answers in, teams' : 'Write your answer'}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {q.type === 'number' && (
        <AnimatePresence mode="wait">
          {revealed ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-brand text-on-accent rounded-2xl px-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(1rem,4vh,2.5rem)] font-display font-semibold text-[clamp(1.75rem,7vh,4rem)] text-center stage-text shadow-xl shrink-0 tabular-nums"
            >
              {formatNumberAnswer(q)}
            </motion.div>
          ) : (
            <motion.div key="guess" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-[clamp(1.1rem,3.5vh,2rem)] text-fg/60 font-display text-center shrink-0">
              <Ruler className="w-[1.1em] h-[1.1em] text-cyan shrink-0" />
              Closest guess wins{q.unit && <span className="text-fg/45">· answer in {q.unit}</span>}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {q.type === 'order' && <OrderView q={q} revealed={revealed} />}

      {revealed && q.type !== 'slide' && <AnswerPanel q={q} picked={picked} />}
    </div>
  )
}

const endsCaption = (ends?: [string, string]) =>
  ends?.[0] && ends?.[1] ? `${ends[0]} → ${ends[1]}` : ends?.[0] ? `${ends[0]} first` : ends?.[1] ? `${ends[1]} last` : 'Put these in the right order'

/** Shuffled, lettered tiles that slide into the right order on reveal. */
function OrderView({ q, revealed }: { q: OrderQuestion; revealed: boolean }) {
  const tiles = orderTiles(q)
  const shown = revealed ? [...tiles].sort((a, b) => a.rank - b.rank) : tiles
  return (
    <div className="w-full max-w-3xl shrink-0 flex flex-col items-center gap-[clamp(0.375rem,1.2vh,0.75rem)]">
      <div className="text-[clamp(0.95rem,2.6vh,1.5rem)] text-fg/60 font-display stage-text">{endsCaption(q.ends)}</div>
      <div className="w-full flex flex-col gap-[clamp(0.375rem,1.2vh,0.75rem)]">
        {shown.map((t, i) => {
          const color = OPTION_COLORS[tiles.indexOf(t) % OPTION_COLORS.length]
          return (
            <motion.div
              key={q.id + t.letter}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ layout: { type: 'spring', stiffness: 220, damping: 26, delay: revealed ? i * 0.06 : 0 }, delay: revealed ? 0 : 0.3 + i * 0.08 }}
              className="rounded-2xl border px-[clamp(0.75rem,2vw,1.25rem)] py-[clamp(0.375rem,1.4vh,0.875rem)] flex items-center gap-[clamp(0.5rem,1.5vw,1rem)]"
              style={revealed ? { background: 'color-mix(in srgb, var(--color-mint) 16%, transparent)', borderColor: 'color-mix(in srgb, var(--color-mint) 50%, transparent)' } : tileStyle(color, false)}
            >
              {revealed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="font-display font-semibold tabular-nums text-ink bg-mint rounded-full w-[clamp(1.75rem,4.5vh,2.5rem)] h-[clamp(1.75rem,4.5vh,2.5rem)] flex items-center justify-center shrink-0 text-[clamp(0.95rem,2.6vh,1.4rem)]"
                >
                  {t.rank + 1}
                </motion.span>
              )}
              <span
                className="font-display font-semibold text-ink rounded-xl w-[clamp(2rem,5.5vh,3rem)] h-[clamp(2rem,5.5vh,3rem)] flex items-center justify-center shrink-0 text-[clamp(1rem,3vh,1.75rem)]"
                style={{ background: color }}
              >
                {t.letter}
              </span>
              <span className="font-display font-medium text-[clamp(1.05rem,3vh,1.8rem)] leading-tight stage-text">{t.text}</span>
            </motion.div>
          )
        })}
      </div>
      {revealed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} className="text-[clamp(1rem,2.8vh,1.6rem)] font-display font-semibold tracking-wide stage-text">
          {orderAnswer(q)}
        </motion.div>
      )}
    </div>
  )
}
