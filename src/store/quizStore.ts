import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Quiz } from '@/types'
import { uid } from '@/utils'

interface Library {
  quizzes: Quiz[]
  deleted: Record<string, number>
}

interface QuizState extends Library {
  upsert: (quiz: Quiz) => void
  remove: (id: string) => void
  /** Delete every quiz, leaving tombstones so cloud-vault sync doesn't bring them back. */
  clearAll: () => void
  duplicate: (id: string) => Quiz | undefined
  get: (id: string) => Quiz | undefined
  importMany: (quizzes: Quiz[]) => number
  /** Replace the whole library (used by cloud-vault sync after merging). */
  replaceLibrary: (lib: Library) => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizzes: [],
      /** Tombstones (id → deletedAt) so a deletion here isn't undone by a stale copy on another device. */
      deleted: {},
      upsert: (quiz) =>
        set((s) => {
          const exists = s.quizzes.some((q) => q.id === quiz.id)
          const next = { ...quiz, updatedAt: Date.now() }
          const { [quiz.id]: _revived, ...deleted } = s.deleted
          return {
            quizzes: exists ? s.quizzes.map((q) => (q.id === quiz.id ? next : q)) : [next, ...s.quizzes],
            deleted,
          }
        }),
      remove: (id) => set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id), deleted: { ...s.deleted, [id]: Date.now() } })),
      clearAll: () =>
        set((s) => {
          const now = Date.now()
          const deleted = { ...s.deleted }
          for (const q of s.quizzes) deleted[q.id] = now
          return { quizzes: [], deleted }
        }),
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
          const now = Date.now()
          // Imported copies count as fresh edits so they beat any tombstone for the same id.
          const fresh = valid.map((q) => ({ ...q, id: ids.has(q.id) ? uid('quiz') : q.id, updatedAt: now }))
          const deleted = { ...s.deleted }
          for (const q of fresh) delete deleted[q.id]
          return { quizzes: [...fresh, ...s.quizzes], deleted }
        })
        return valid.length
      },
      replaceLibrary: (lib) => set({ quizzes: lib.quizzes, deleted: lib.deleted }),
    }),
    { name: 'quizclub.quizzes' },
  ),
)
