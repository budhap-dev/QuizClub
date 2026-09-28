import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  muted: boolean
  /** Optional access code sent to the AI endpoint (until Google login lands). */
  aiAccessCode: string
  /** Default seconds for new questions in the builder. */
  defaultTimeLimit: number
  defaultPoints: number
  scoreStep: number
  setMuted: (m: boolean) => void
  setAiAccessCode: (c: string) => void
  setDefaultTimeLimit: (n: number) => void
  setDefaultPoints: (n: number) => void
  setScoreStep: (n: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      aiAccessCode: '',
      defaultTimeLimit: 20,
      defaultPoints: 10,
      scoreStep: 10,
      setMuted: (muted) => set({ muted }),
      setAiAccessCode: (aiAccessCode) => set({ aiAccessCode }),
      setDefaultTimeLimit: (defaultTimeLimit) => set({ defaultTimeLimit }),
      setDefaultPoints: (defaultPoints) => set({ defaultPoints }),
      setScoreStep: (scoreStep) => set({ scoreStep }),
    }),
    { name: 'quizclub.settings' },
  ),
)
