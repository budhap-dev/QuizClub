import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Gamepad2, MonitorPlay, PenLine, Play, type LucideIcon } from 'lucide-react'
import { Card } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'

const tiles: { to: string; Icon: LucideIcon; title: string; text: string; color: string }[] = [
  { to: '/play', Icon: MonitorPlay, title: 'Present a quiz', text: 'Pick a quiz, add teams and go live on the big screen.', color: 'var(--color-pink)' },
  { to: '/quizzes/bank', Icon: BookOpen, title: 'Quiz bank', text: 'Ready-made quizzes across 19 areas, searchable by topic and level.', color: 'var(--color-purple)' },
  { to: '/create/manual', Icon: PenLine, title: 'Manual quiz maker', text: 'Slides, multiple choice, true/false and timed questions.', color: 'var(--color-cyan)' },
  { to: '/games', Icon: Gamepad2, title: 'Party games', text: 'Cows & Bulls, Hangman, Wordle and more for between rounds.', color: 'var(--color-lime)' },
]

const container = { show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function Home() {
  const quizCount = useQuizStore((s) => s.quizzes.length)
  const session = useSessionStore((s) => s.session)
  const activeQuiz = useSessionStore((s) => s.activeQuiz)

  return (
    <div className="py-8 md:py-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 md:mb-12 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-fg/12 bg-fg/6 px-3 py-1 text-xs font-medium text-fg/70 mb-5">
          <MonitorPlay size={13} className="text-purple" />
          Built for the big screen
        </span>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.08]">
          Quizzes and games,
          <br />
          <span className="text-gradient">made to present.</span>
        </h1>
        <p className="text-fg/65 text-base md:text-lg mt-4 md:mt-5 max-w-xl mx-auto">
          Present a quiz to the room, keep score for teams and fill the breaks with party games. Everything runs in the browser.
        </p>
      </motion.div>

      {session && activeQuiz && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
          <Link to="/play/stage" className="block">
            <Card interactive tint="var(--color-purple)" className="flex items-center gap-4 py-4">
              <span className="w-11 h-11 rounded-xl bg-brand text-on-accent flex items-center justify-center shrink-0">
                <Play size={20} fill="currentColor" />
              </span>
              <div className="min-w-0">
                <div className="font-semibold truncate">Resume: {activeQuiz.title}</div>
                <div className="text-fg/60 text-sm">
                  Question {session.index + 1} of {activeQuiz.questions.length}
                </div>
              </div>
              <ArrowRight size={18} className="ml-auto text-fg/50 shrink-0" />
            </Card>
          </Link>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-4">
        {tiles.map(({ to, Icon, title, text, color }) => (
          <motion.div key={to} variants={item}>
            <Link to={to} className="block h-full">
              <Card interactive tint={color} className="h-full flex gap-4 items-start">
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
                >
                  <Icon size={22} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">{title}</h2>
                  <p className="text-fg/65 text-sm leading-relaxed">{text}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-center text-sm text-fg/50">
        <Link to="/quizzes" className="underline underline-offset-4 decoration-fg/30 hover:text-fg transition-colors">
          {quizCount === 0 ? 'No saved quizzes yet — create one' : `${quizCount} saved ${quizCount === 1 ? 'quiz' : 'quizzes'} in your library`}
        </Link>
      </motion.div>
    </div>
  )
}
