import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Quiz, ScoreEvent, Session, StagePhase, Team } from '@/types'
import { TEAM_COLORS, TEAM_EMOJIS, uid } from '@/utils'

interface SessionState {
  /** Teams persist between quizzes so a club night can run several quizzes. */
  teams: Team[]
  /** The quiz currently on stage (a snapshot so library quizzes don't need saving). */
  activeQuiz: Quiz | null
  session: Session | null

  addTeam: (name?: string) => Team
  updateTeam: (id: string, patch: Partial<Team>) => void
  removeTeam: (id: string) => void
  resetScores: () => void
  clearTeams: () => void

  start: (quiz: Quiz) => void
  end: () => void
  setIndex: (i: number) => void
  next: () => void
  prev: () => void
  setPhase: (p: StagePhase) => void
  award: (teamId: string, delta: number, reason?: string) => void
  undo: () => void
}

function newTeam(name: string, existing: Team[]): Team {
  const i = existing.length
  return {
    id: uid('team'),
    name,
    emoji: TEAM_EMOJIS[i % TEAM_EMOJIS.length],
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    score: 0,
  }
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      teams: [],
      activeQuiz: null,
      session: null,

      addTeam: (name) => {
        const t = newTeam(name?.trim() || `Team ${get().teams.length + 1}`, get().teams)
        set((s) => ({ teams: [...s.teams, t] }))
        return t
      },
      updateTeam: (id, patch) => set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTeam: (id) => set((s) => ({ teams: s.teams.filter((t) => t.id !== id) })),
      resetScores: () => set((s) => ({ teams: s.teams.map((t) => ({ ...t, score: 0 })) })),
      clearTeams: () => set({ teams: [] }),

      start: (quiz) =>
        set((s) => ({
          activeQuiz: quiz,
          teams: s.teams.map((t) => ({ ...t, score: 0 })),
          session: {
            quizId: quiz.id,
            teams: s.teams,
            index: 0,
            phase: 'question',
            history: [],
            startedAt: Date.now(),
          },
        })),
      end: () => set({ session: null, activeQuiz: null }),
      setIndex: (index) =>
        set((s) => (s.session ? { session: { ...s.session, index, phase: 'question' } } : {})),
      next: () => {
        const { session, activeQuiz } = get()
        if (!session || !activeQuiz) return
        const last = activeQuiz.questions.length - 1
        if (session.index >= last) {
          set({ session: { ...session, phase: 'podium' } })
        } else {
          set({ session: { ...session, index: session.index + 1, phase: 'question' } })
        }
      },
      prev: () => {
        const { session } = get()
        if (!session) return
        set({ session: { ...session, index: Math.max(0, session.index - 1), phase: 'question' } })
      },
      setPhase: (phase) => set((s) => (s.session ? { session: { ...s.session, phase } } : {})),
      award: (teamId, delta, reason) => {
        const { session, activeQuiz } = get()
        const ev: ScoreEvent = {
          teamId,
          delta,
          reason,
          questionId: activeQuiz?.questions[session?.index ?? 0]?.id,
          at: Date.now(),
        }
        set((s) => ({
          teams: s.teams.map((t) => (t.id === teamId ? { ...t, score: t.score + delta } : t)),
          session: s.session ? { ...s.session, history: [...s.session.history, ev] } : s.session,
        }))
      },
      undo: () => {
        const { session } = get()
        if (!session || session.history.length === 0) return
        const last = session.history[session.history.length - 1]
        set((s) => ({
          teams: s.teams.map((t) => (t.id === last.teamId ? { ...t, score: t.score - last.delta } : t)),
          session: { ...session, history: session.history.slice(0, -1) },
        }))
      },
    }),
    { name: 'quizclub.session' },
  ),
)
