import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeId } from '@/app/theme'

interface SettingsState {
  muted: boolean
  /** Colour theme; applied to <html data-theme> by src/app/theme.ts. */
  theme: ThemeId
  /** Optional access code sent to the AI endpoint (until Google login lands). */
  aiAccessCode: string
  /** Default seconds for new questions in the builder. */
  defaultTimeLimit: number
  defaultPoints: number
  scoreStep: number
  setMuted: (m: boolean) => void
  setTheme: (t: ThemeId) => void
  setAiAccessCode: (c: string) => void
  setDefaultTimeLimit: (n: number) => void
  setDefaultPoints: (n: number) => void
  setScoreStep: (n: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      theme: 'neon',
      aiAccessCode: '',
      defaultTimeLimit: 20,
      defaultPoints: 10,
      scoreStep: 10,
      setMuted: (muted) => set({ muted }),
      setTheme: (theme) => set({ theme }),
      setAiAccessCode: (aiAccessCode) => set({ aiAccessCode }),
      setDefaultTimeLimit: (defaultTimeLimit) => set({ defaultTimeLimit }),
      setDefaultPoints: (defaultPoints) => set({ defaultPoints }),
      setScoreStep: (scoreStep) => set({ scoreStep }),
    }),
    { name: 'quizclub.settings' },
  ),
)
