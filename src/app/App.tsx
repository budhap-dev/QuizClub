import { Suspense, lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Layout } from './Layout'
import { Home } from '@/features/home/Home'

const ManualBuilder = lazy(() => import('@/features/builder/ManualBuilder').then((m) => ({ default: m.ManualBuilder })))
const MyQuizzes = lazy(() => import('@/features/library/MyQuizzes').then((m) => ({ default: m.MyQuizzes })))
const PlaySetup = lazy(() => import('@/features/presenter/PlaySetup').then((m) => ({ default: m.PlaySetup })))
const Stage = lazy(() => import('@/features/presenter/Stage').then((m) => ({ default: m.Stage })))
const Settings = lazy(() => import('@/features/settings/Settings').then((m) => ({ default: m.Settings })))

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-5xl animate-wiggle">🎲</div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <Suspense fallback={<Loading />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="create/manual" element={<ManualBuilder />} />
            <Route path="create/manual/:id" element={<ManualBuilder />} />
            <Route path="quizzes" element={<MyQuizzes />} />
            <Route path="play" element={<PlaySetup />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* Stage is full-bleed, no layout chrome */}
          <Route path="play/stage" element={<Stage />} />
          <Route path="preview/:id" element={<Stage preview />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}
