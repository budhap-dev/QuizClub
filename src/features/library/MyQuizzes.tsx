import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button, Card, PageHeader } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import { downloadJson, readJsonFile } from '@/utils'
import type { Quiz } from '@/types'

export function MyQuizzes() {
  const navigate = useNavigate()
  const { quizzes, remove, duplicate, importMany } = useQuizStore()
  const start = useSessionStore((s) => s.start)
  const fileRef = useRef<HTMLInputElement>(null)

  const onImport = async (file?: File) => {
    if (!file) return
    try {
      const data = await readJsonFile<Quiz[] | Quiz>(file)
      importMany(Array.isArray(data) ? data : [data])
    } catch {
      alert('That file is not a valid QuizClub export.')
    }
  }

  return (
    <div>
      <PageHeader
        title="My Quizzes"
        emoji="📚"
        subtitle={`${quizzes.length} saved`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              ⬆️ Import
            </Button>
            <Button size="sm" onClick={() => navigate('/create/manual')}>
              ＋ New quiz
            </Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => void onImport(e.target.files?.[0])} />
          </>
        }
      />

      {quizzes.length === 0 && (
        <Card className="text-center py-14">
          <div className="text-6xl mb-3">🗂️</div>
          <p className="text-white/70 mb-4">Nothing here yet. Build one by hand or let AI do the heavy lifting.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate('/create/ai')}>✨ AI generator</Button>
            <Button variant="secondary" onClick={() => navigate('/create/manual')}>
              🛠️ Manual builder
            </Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {quizzes.map((q) => (
            <motion.div key={q.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Card className="h-full flex flex-col">
                <div className="flex items-start gap-3 mb-2">
                  <div className="text-4xl">{q.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-xl leading-tight">{q.title}</h3>
                    <div className="text-xs text-white/50 mt-1">
                      {q.questions.length} questions · {q.source === 'ai' ? '✨ AI' : '🛠️ Manual'} · {new Date(q.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {q.description && <p className="text-sm text-white/60 line-clamp-2 mb-3">{q.description}</p>}
                <div className="mt-auto flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => {
                      start(q)
                      navigate('/play/stage')
                    }}
                  >
                    ▶️ Present
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/preview/${q.id}`)}>
                    👁️
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/create/manual/${q.id}`)}>
                    ✏️
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => duplicate(q.id)} title="Duplicate">
                    ⧉
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => downloadJson(`${q.title.replace(/\s+/g, '-').toLowerCase()}.json`, q)} title="Export">
                    ⬇️
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red" onClick={() => confirm(`Delete "${q.title}"?`) && remove(q.id)} title="Delete">
                    🗑️
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
