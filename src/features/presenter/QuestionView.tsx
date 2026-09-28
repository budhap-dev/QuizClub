import { AnimatePresence, motion, type TargetAndTransition, type Variants } from 'framer-motion'
import type { Question } from '@/types'
import { cn, OPTION_COLORS, OPTION_LABELS } from '@/utils'
import { TimerRing } from '@/components'

interface QuestionViewProps {
  question: Question
  revealed: boolean
  timer?: { total: number; remaining: number; running: boolean }
  onToggleTimer?: () => void
  onOption?: (i: number) => void
}

/** Options pop in one after another; `i` is the option index. */
const showAt = (i: number): TargetAndTransition => ({
  opacity: 1,
  y: 0,
  scale: 1,
  transition: { delay: 0.35 + i * 0.12, type: 'spring', stiffness: 260, damping: 20 },
})

const optionAnim: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: showAt,
}

/**
 * Everything here is sized with clamp(…vh…) so a question, its image and its
 * options always fit the stage height without scrolling. The image is the only
 * flexible item: it takes whatever space is left after the prompt and answers.
 */
export function QuestionView({ question, revealed, timer, onToggleTimer, onOption }: QuestionViewProps) {
  const q = question
  const hasTimer = timer && timer.total > 0 && q.type !== 'slide'

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 py-[clamp(0.5rem,1.5vh,1.5rem)] gap-[clamp(0.5rem,2vh,1.5rem)]">
      {/* Prompt */}
      <motion.div
        key={q.id + '-prompt'}
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full shrink-0 flex flex-col md:flex-row items-center gap-3 md:gap-8"
      >
        {hasTimer && (
          <button onClick={onToggleTimer} className="order-first md:order-none shrink-0" title="Start / pause timer (T)">
            <TimerRing total={timer.total} remaining={timer.remaining} size={96} />
          </button>
        )}
        <h1
          className={cn(
            'stage-text font-display font-bold text-center flex-1 leading-tight',
            q.type === 'slide' ? 'text-[clamp(1.75rem,7vh,4.5rem)] text-gradient' : 'text-[clamp(1.35rem,5vh,3.75rem)]',
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
          initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
          className="flex-1 min-h-0 w-full flex items-center justify-center"
        >
          <img
            src={q.imageUrl}
            alt=""
            className="max-h-[38vh] md:max-h-full max-w-full rounded-3xl shadow-2xl object-contain bg-white/5 p-2"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      )}

      {/* Body by type */}
      {q.type === 'slide' && q.body && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[clamp(1.1rem,3.2vh,1.9rem)] text-white/80 text-center max-w-4xl whitespace-pre-line stage-text min-h-0 overflow-y-auto no-scrollbar"
        >
          {q.body}
        </motion.p>
      )}

      {q.type === 'mcq' && (
        <div className={cn('grid gap-[clamp(0.5rem,1.5vh,1rem)] w-full shrink-0 md:grid-cols-2', q.options.length > 4 && 'lg:grid-cols-3')}>
          {q.options.map((opt, i) => {
            const correct = revealed && i === q.correctIndex
            const dim = revealed && i !== q.correctIndex
            return (
              <motion.button
                key={q.id + '-' + i}
                custom={i}
                variants={optionAnim}
                initial="hidden"
                animate={correct ? { ...showAt(i), scale: [1, 1.06, 1], transition: { duration: 0.6, repeat: 2 } } : 'show'}
                whileHover={!revealed ? { scale: 1.02 } : undefined}
                onClick={() => onOption?.(i)}
                className={cn(
                  'relative rounded-3xl px-[clamp(0.75rem,2vw,1.5rem)] py-[clamp(0.5rem,1.8vh,1.5rem)] text-left flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] border-4 transition-all duration-500 bg-gradient-to-br',
                  OPTION_COLORS[i % OPTION_COLORS.length],
                  dim && 'opacity-25 grayscale',
                  correct ? 'border-white shadow-[0_0_60px_rgba(255,255,255,0.5)]' : 'border-transparent',
                )}
              >
                <span className="font-display font-bold text-[clamp(1.25rem,3.5vh,2.25rem)] bg-black/25 rounded-2xl w-[clamp(2.5rem,7vh,4rem)] h-[clamp(2.5rem,7vh,4rem)] flex items-center justify-center shrink-0">
                  {OPTION_LABELS[i]}
                </span>
                {q.optionImages?.[i] && <img src={q.optionImages[i]} alt="" className="h-[clamp(3rem,10vh,6rem)] rounded-xl object-contain bg-white/20" />}
                <span className="font-display font-semibold text-[clamp(1.05rem,3vh,1.9rem)] leading-tight stage-text">{opt}</span>
                {correct && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-[clamp(1.5rem,4vh,3rem)]">
                    ✅
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}

      {q.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.5vh,1rem)] w-full max-w-3xl shrink-0">
          {[true, false].map((v, i) => {
            const correct = revealed && v === q.answer
            const dim = revealed && v !== q.answer
            return (
              <motion.div
                key={q.id + String(v)}
                custom={i}
                variants={optionAnim}
                initial="hidden"
                animate="show"
                className={cn(
                  'rounded-3xl py-[clamp(1.25rem,6vh,3.5rem)] text-center font-display font-bold text-[clamp(1.75rem,6vh,3.75rem)] border-4 transition-all duration-500',
                  v ? 'bg-gradient-to-br from-mint to-lime text-ink' : 'bg-gradient-to-br from-red to-orange text-white',
                  dim && 'opacity-25 grayscale',
                  correct ? 'border-white shadow-[0_0_60px_rgba(255,255,255,0.5)] scale-105' : 'border-transparent',
                )}
              >
                {v ? '✔ TRUE' : '✘ FALSE'}
              </motion.div>
            )
          })}
        </div>
      )}

      {q.type === 'timed' && (
        <AnimatePresence mode="wait">
          {revealed ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 15 }}
              className="bg-rainbow text-ink rounded-3xl px-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(1rem,4vh,2.5rem)] font-display font-bold text-[clamp(1.5rem,6vh,3.75rem)] text-center stage-text shadow-2xl shrink-0"
            >
              {q.answer}
            </motion.div>
          ) : (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[clamp(1.25rem,4vh,2.25rem)] text-white/60 font-display text-center shrink-0">
              {timer?.running ? '⏳ Answers in, teams!' : '✍️ Write your answer…'}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
