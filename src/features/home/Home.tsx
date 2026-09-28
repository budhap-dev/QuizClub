import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'

const tiles = [
  { to: '/play', emoji: '🎬', title: 'Present a Quiz', text: 'Pick a quiz, add teams and go live on the big screen.', color: 'var(--color-pink)' },
  { to: '/create/ai', emoji: '✨', title: 'AI Quiz Generator', text: 'Describe a topic and get a ready-to-play quiz in seconds.', color: 'var(--color-purple)' },
  { to: '/create/manual', emoji: '🛠️', title: 'Manual Quiz Maker', text: 'Slides, MCQs, true/false and timed questions — your way.', color: 'var(--color-cyan)' },
  { to: '/games', emoji: '🎮', title: 'Party Games', text: 'Cows & Bulls, Hangman, Wordle and more crowd pleasers.', color: 'var(--color-lime)' },
]

const container = { show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 24, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1 } }

export function Home() {
  const quizCount = useQuizStore((s) => s.quizzes.length)
  const session = useSessionStore((s) => s.session)
  const activeQuiz = useSessionStore((s) => s.activeQuiz)

  return (
    <div className="py-6 md:py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <motion.div
          className="text-6xl md:text-7xl mb-3 inline-block"
          animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }}
        >
          🎉
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Welcome to <span className="text-gradient">QuizClub</span>
        </h1>
        <p className="text-fg/70 text-lg md:text-xl mt-3 max-w-xl mx-auto">
          Colourful quizzes and games, built for the big screen and for cheering crowds.
        </p>
      </motion.div>

      {session && activeQuiz && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link to="/play/stage">
            <Card interactive className="bg-rainbow text-ink flex items-center gap-4">
              <span className="text-4xl">▶️</span>
              <div>
                <div className="font-display font-bold text-xl">Resume: {activeQuiz.title}</div>
                <div className="text-ink/70">
                  Question {session.index + 1} of {activeQuiz.questions.length}
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-4 md:gap-6">
        {tiles.map((t) => (
          <motion.div key={t.to} variants={item}>
            <Link to={t.to} className="block h-full">
              <Card interactive glow={t.color} className="h-full flex gap-4 items-start">
                <motion.div
                  className="text-5xl md:text-6xl shrink-0"
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                >
                  {t.emoji}
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: t.color }}>
                    {t.title}
                  </h2>
                  <p className="text-fg/70">{t.text}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center text-fg/50">
        <Link to="/quizzes" className="underline underline-offset-4 hover:text-fg">
          {quizCount === 0 ? 'No saved quizzes yet — create one!' : `${quizCount} saved ${quizCount === 1 ? 'quiz' : 'quizzes'} in your library`}
        </Link>
      </motion.div>
    </div>
  )
}
