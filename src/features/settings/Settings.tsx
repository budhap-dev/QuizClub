import { useRef } from 'react'
import { Button, Card, PageHeader, ThemePicker } from '@/components'
import { useSettingsStore } from '@/store/settingsStore'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import { downloadJson, readJsonFile } from '@/utils'
import type { Quiz } from '@/types'
import { VaultCard } from '@/features/vault/VaultCard'

export function Settings() {
  const s = useSettingsStore()
  const quizzes = useQuizStore((q) => q.quizzes)
  const importMany = useQuizStore((q) => q.importMany)
  const clearTeams = useSessionStore((q) => q.clearTeams)
  const fileRef = useRef<HTMLInputElement>(null)

  const onImport = async (file?: File) => {
    if (!file) return
    try {
      const data = await readJsonFile<Quiz[] | Quiz>(file)
      const n = importMany(Array.isArray(data) ? data : [data])
      alert(`Imported ${n} quiz${n === 1 ? '' : 'zes'}.`)
    } catch {
      alert('That file is not a valid QuizClub export.')
    }
  }

  return (
    <div>
      <PageHeader title="Settings" emoji="⚙️" />

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="md:col-span-2">
          <h2 className="text-xl font-bold mb-1">🎨 Theme</h2>
          <p className="text-fg/60 text-sm mb-3">Changes everywhere instantly — including the presenter stage.</p>
          <ThemePicker />
        </Card>

        <VaultCard className="md:col-span-2" />

        <Card>
          <h2 className="text-xl font-bold mb-3">Defaults</h2>
          <label className="block mb-3">
            <span className="text-fg/70 text-sm">Default timer (seconds)</span>
            <input type="number" className="input mt-1" min={0} value={s.defaultTimeLimit} onChange={(e) => s.setDefaultTimeLimit(+e.target.value)} />
          </label>
          <label className="block mb-3">
            <span className="text-fg/70 text-sm">Default points per question</span>
            <input type="number" className="input mt-1" min={1} value={s.defaultPoints} onChange={(e) => s.setDefaultPoints(+e.target.value)} />
          </label>
          <label className="block mb-3">
            <span className="text-fg/70 text-sm">Score +/− step on stage</span>
            <input type="number" className="input mt-1" min={1} value={s.scoreStep} onChange={(e) => s.setScoreStep(+e.target.value)} />
          </label>
          <label className="flex items-center gap-3 mt-2 cursor-pointer">
            <input type="checkbox" checked={s.muted} onChange={(e) => s.setMuted(e.target.checked)} className="w-5 h-5 accent-purple" />
            <span>Mute sound effects</span>
          </label>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-1">AI generator</h2>
          <p className="text-fg/60 text-sm mb-3">
            Quizzes are generated on the server, so no API key is needed here. If the host has set an access code, enter it below.
          </p>
          <label className="block">
            <span className="text-fg/70 text-sm">Access code (optional)</span>
            <input type="password" className="input mt-1" value={s.aiAccessCode} onChange={(e) => s.setAiAccessCode(e.target.value)} placeholder="••••••" />
          </label>
          <p className="text-fg/40 text-xs mt-3">Google sign-in is coming later and will replace the access code.</p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-3">Backup</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => downloadJson(`quizclub-${new Date().toISOString().slice(0, 10)}.json`, quizzes)} disabled={quizzes.length === 0}>
              ⬇️ Export all quizzes
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              ⬆️ Import JSON
            </Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => void onImport(e.target.files?.[0])} />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-3">Reset</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="danger" onClick={() => confirm('Remove all teams?') && clearTeams()}>
              Clear teams
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Delete ALL saved quizzes? This cannot be undone.')) {
                  useQuizStore.setState({ quizzes: [] })
                }
              }}
            >
              Delete all quizzes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
