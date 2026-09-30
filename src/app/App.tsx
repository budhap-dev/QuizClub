import { Suspense, lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { DialogHost } from '@/components'
import { Layout } from './Layout'
import { Home } from '@/features/home/Home'

const AiGenerator = lazy(() => import('@/features/ai/AiGenerator').then((m) => ({ default: m.AiGenerator })))
const ManualBuilder = lazy(() => import('@/features/builder/ManualBuilder').then((m) => ({ default: m.ManualBuilder })))
const QuizBank = lazy(() => import('@/features/bank/QuizBank').then((m) => ({ default: m.QuizBank })))
const MyQuizzes = lazy(() => import('@/features/library/MyQuizzes').then((m) => ({ default: m.MyQuizzes })))
const PlaySetup = lazy(() => import('@/features/presenter/PlaySetup').then((m) => ({ default: m.PlaySetup })))
const Stage = lazy(() => import('@/features/presenter/Stage').then((m) => ({ default: m.Stage })))
const Games = lazy(() => import('@/features/games/Games').then((m) => ({ default: m.Games })))
const GamePage = lazy(() => import('@/features/games/GamePage').then((m) => ({ default: m.GamePage })))
const Settings = lazy(() => import('@/features/settings/Settings').then((m) => ({ default: m.Settings })))

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
      <Loader2 className="animate-spin text-fg/50" size={28} />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <>
      <Suspense fallback={<Loading />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="create/ai" element={<AiGenerator />} />
              <Route path="create/manual" element={<ManualBuilder />} />
              <Route path="create/manual/:id" element={<ManualBuilder />} />
              <Route path="quizzes" element={<MyQuizzes />} />
              <Route path="quizzes/bank" element={<QuizBank />} />
              <Route path="play" element={<PlaySetup />} />
              <Route path="games" element={<Games />} />
              <Route path="games/:game" element={<GamePage />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* Stage is full-bleed, no layout chrome */}
            <Route path="play/stage" element={<Stage />} />
            <Route path="preview/:id" element={<Stage preview />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <DialogHost />
    </>
  )
}
