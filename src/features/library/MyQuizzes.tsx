import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Copy, Download, Eye, Library, PenLine, Pencil, Play, Plus, Trash2, Upload } from 'lucide-react'
import { Button, Card, LevelBadge, LevelSelect, PageHeader, alertDialog, confirmDialog } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import { downloadJson, readJsonFile } from '@/utils'
import type { Difficulty, Quiz } from '@/types'
import { QuizzesTabs } from './QuizzesTabs'

export function MyQuizzes() {
  const navigate = useNavigate()
  const { quizzes, remove, duplicate, importMany } = useQuizStore()
  const start = useSessionStore((s) => s.start)
  const fileRef = useRef<HTMLInputElement>(null)
  const [level, setLevel] = useState<Difficulty | undefined>()
  const shown = useMemo(() => (level ? quizzes.filter((q) => q.difficulty === level) : quizzes), [quizzes, level])
  const levelCounts = useMemo(() => {
    const c = { all: quizzes.length, easy: 0, medium: 0, hard: 0 }
    for (const q of quizzes) if (q.difficulty) c[q.difficulty]++
    return c
  }, [quizzes])

  const onImport = async (file?: File) => {
    if (!file) return
    try {
      const data = await readJsonFile<Quiz[] | Quiz>(file)
      importMany(Array.isArray(data) ? data : [data])
    } catch {
      void alertDialog({ title: 'Import failed', message: 'That file is not a valid QuizClub export.', tone: 'danger' })
    }
  }

  return (
    <div>
      <PageHeader
        title="My Quizzes"
        icon={<Library />}
        subtitle={`${quizzes.length} saved`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload /> Import
            </Button>
            <Button size="sm" onClick={() => navigate('/create/manual')}>
              <Plus /> New quiz
            </Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => void onImport(e.target.files?.[0])} />
          </>
        }
      />
      <QuizzesTabs />

      {quizzes.length === 0 && (
        <Card className="text-center py-14">
          <div className="w-12 h-12 rounded-xl bg-fg/8 text-fg/50 flex items-center justify-center mx-auto mb-4">
            <Library size={22} />
          </div>
          <p className="text-fg/70 mb-5">Nothing here yet. Copy one from the quiz bank, build one by hand, or let AI do the heavy lifting.</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button onClick={() => navigate('/quizzes/bank')}>
              <BookOpen /> Browse the quiz bank
            </Button>
            <Button variant="secondary" onClick={() => navigate('/create/manual')}>
              <PenLine /> Manual builder
            </Button>
          </div>
        </Card>
      )}

      {quizzes.length > 0 && <LevelSelect label="Level" noneLabel="All levels" noneShort="All" value={level} onChange={setLevel} counts={levelCounts} className="mb-5" />}
      {quizzes.length > 0 && shown.length === 0 && (
        <Card className="text-center py-10 text-fg/65 text-sm">
          No quizzes at this level yet. Set a quiz's level in the builder, or{' '}
          <button type="button" className="underline underline-offset-4 hover:text-fg" onClick={() => navigate(`/quizzes/bank?level=${level}`)}>
            browse {level} quizzes in the bank
          </button>
          .
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {shown.map((q) => (
            <motion.div key={q.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
              <Card className="h-full flex flex-col">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-11 h-11 rounded-xl bg-fg/8 flex items-center justify-center text-2xl shrink-0">{q.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-snug truncate">{q.title}</h3>
                    <div className="text-xs text-fg/50 mt-1 flex items-center gap-1.5 flex-wrap">
                      {q.difficulty && <LevelBadge level={q.difficulty} />}
                      <span className="chip">{q.source === 'ai' ? 'AI' : 'Manual'}</span>
                      <span>{q.questions.length} questions</span>
                      <span aria-hidden>·</span>
                      <span>{new Date(q.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {q.description && <p className="text-sm text-fg/60 line-clamp-2 mb-3">{q.description}</p>}
                <div className="mt-auto pt-2 flex items-center gap-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      start(q)
                      navigate('/play/stage')
                    }}
                  >
                    <Play /> Present
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/preview/${q.id}`)} title="Preview" aria-label="Preview">
                    <Eye />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/create/manual/${q.id}`)} title="Edit" aria-label="Edit">
                    <Pencil />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => duplicate(q.id)} title="Duplicate" aria-label="Duplicate">
                    <Copy />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadJson(`${q.title.replace(/\s+/g, '-').toLowerCase()}.json`, q)}
                    title="Export"
                    aria-label="Export"
                  >
                    <Download />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-fg/60 hover:text-red ml-auto"
                    onClick={async () => (await confirmDialog({ title: `Delete "${q.title}"?`, message: 'This cannot be undone.', confirmLabel: 'Delete', tone: 'danger' })) && remove(q.id)}
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 />
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
