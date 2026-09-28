import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Quiz } from '@/types'
import { uid } from '@/utils'

interface QuizState {
  quizzes: Quiz[]
  upsert: (quiz: Quiz) => void
  remove: (id: string) => void
  duplicate: (id: string) => Quiz | undefined
  get: (id: string) => Quiz | undefined
  importMany: (quizzes: Quiz[]) => number
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizzes: [],
      upsert: (quiz) =>
        set((s) => {
          const exists = s.quizzes.some((q) => q.id === quiz.id)
          const next = { ...quiz, updatedAt: Date.now() }
          return {
            quizzes: exists ? s.quizzes.map((q) => (q.id === quiz.id ? next : q)) : [next, ...s.quizzes],
          }
        }),
      remove: (id) => set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) })),
      duplicate: (id) => {
        const src = get().quizzes.find((q) => q.id === id)
        if (!src) return undefined
        const copy: Quiz = {
          ...src,
          id: uid('quiz'),
          title: `${src.title} (copy)`,
          questions: src.questions.map((q) => ({ ...q, id: uid('q') })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((s) => ({ quizzes: [copy, ...s.quizzes] }))
        return copy
      },
      get: (id) => get().quizzes.find((q) => q.id === id),
      importMany: (incoming) => {
        const valid = incoming.filter((q) => q && typeof q.title === 'string' && Array.isArray(q.questions))
        set((s) => {
          const ids = new Set(s.quizzes.map((q) => q.id))
          const fresh = valid.map((q) => (ids.has(q.id) ? { ...q, id: uid('quiz') } : q))
          return { quizzes: [...fresh, ...s.quizzes] }
        })
        return valid.length
      },
    }),
    { name: 'quizclub.quizzes' },
  ),
)
