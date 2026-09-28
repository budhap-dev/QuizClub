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

export function QuestionView({ question, revealed, timer, onToggleTimer, onOption }: QuestionViewProps) {
  const q = question
  const hasTimer = timer && timer.total > 0 && q.type !== 'slide'

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 py-6 gap-6">
      {/* Prompt */}
      <motion.div
        key={q.id + '-prompt'}
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full flex flex-col md:flex-row items-center gap-4 md:gap-8"
      >
        {hasTimer && (
          <button onClick={onToggleTimer} className="order-first md:order-none shrink-0" title="Start / pause timer (T)">
            <TimerRing total={timer.total} remaining={timer.remaining} size={110} />
          </button>
        )}
        <h1
          className={cn(
            'stage-text font-display font-bold text-center flex-1 leading-tight',
            q.type === 'slide' ? 'text-4xl md:text-6xl lg:text-7xl text-gradient' : 'text-3xl md:text-5xl lg:text-6xl',
          )}
        >
          {q.text}
        </h1>
        {hasTimer && <div className="hidden md:block w-[110px] shrink-0" />}
      </motion.div>

      {/* Image */}
      {q.imageUrl && (
        <motion.img
          key={q.id + '-img'}
          src={q.imageUrl}
          alt=""
          initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
          className="max-h-[38vh] max-w-full rounded-3xl shadow-2xl object-contain bg-white/5 p-2"
          referrerPolicy="no-referrer"
        />
      )}

      {/* Body by type */}
      {q.type === 'slide' && q.body && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-3xl text-white/80 text-center max-w-4xl whitespace-pre-line stage-text"
        >
          {q.body}
        </motion.p>
      )}

      {q.type === 'mcq' && (
        <div className={cn('grid gap-3 md:gap-4 w-full', q.options.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-2', q.options.length > 4 && 'lg:grid-cols-3')}>
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
                  'relative rounded-3xl p-4 md:p-6 text-left flex items-center gap-4 border-4 transition-all duration-500 bg-gradient-to-br',
                  OPTION_COLORS[i % OPTION_COLORS.length],
                  dim && 'opacity-25 grayscale',
                  correct ? 'border-white shadow-[0_0_60px_rgba(255,255,255,0.5)]' : 'border-transparent',
                )}
              >
                <span className="font-display font-bold text-2xl md:text-4xl bg-black/25 rounded-2xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0">
                  {OPTION_LABELS[i]}
                </span>
                {q.optionImages?.[i] && <img src={q.optionImages[i]} alt="" className="h-16 md:h-24 rounded-xl object-contain bg-white/20" />}
                <span className="font-display font-semibold text-xl md:text-3xl leading-tight stage-text">{opt}</span>
                {correct && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-4xl md:text-5xl">
                    ✅
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}

      {q.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
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
                  'rounded-3xl py-8 md:py-14 text-center font-display font-bold text-4xl md:text-6xl border-4 transition-all duration-500',
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
              className="bg-rainbow text-ink rounded-3xl px-10 py-6 md:py-10 font-display font-bold text-3xl md:text-6xl text-center stage-text shadow-2xl"
            >
              {q.answer}
            </motion.div>
          ) : (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl md:text-4xl text-white/60 font-display text-center">
              {timer?.running ? '⏳ Answers in, teams!' : '✍️ Write your answer…'}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
