import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button, Card, EmojiPicker, Modal, PageHeader, TeamChip } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import { cn, TEAM_COLORS } from '@/utils'
import type { Quiz, QuizSource } from '@/types'
import { PACKS } from '@/features/library/packs'
import { makeQuiz } from '@/features/library/helpers'

type Tab = 'library' | QuizSource

export function PlaySetup() {
  const navigate = useNavigate()
  const saved = useQuizStore((s) => s.quizzes)
  const { teams, addTeam, updateTeam, removeTeam, resetScores, start } = useSessionStore()

  const [tab, setTab] = useState<Tab>('library')
  const [selected, setSelected] = useState<Quiz | null>(null)
  const [count, setCount] = useState(10)
  const [newTeam, setNewTeam] = useState('')
  const [editing, setEditing] = useState<string | null>(null)

  const savedByTab = useMemo(() => saved.filter((q) => q.source === tab), [saved, tab])
  const editingTeam = teams.find((t) => t.id === editing)

  const chooseLibrary = (packId: string) => {
    const pack = PACKS.find((p) => p.id === packId)!
    setSelected(makeQuiz(pack, Math.min(count, pack.poolSize)))
  }

  const go = () => {
    if (!selected) return
    start(selected)
    navigate('/play/stage')
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'library', label: 'Built-in', emoji: '🎁' },
    { id: 'ai', label: 'AI quizzes', emoji: '✨' },
    { id: 'manual', label: 'My quizzes', emoji: '🛠️' },
  ]

  return (
    <div>
      <PageHeader title="Present a Quiz" emoji="🎬" subtitle="Step 1: pick a quiz · Step 2: add teams · Step 3: go live" />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* ─── Quiz picker ─── */}
        <Card>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <h2 className="text-xl font-bold mr-auto">1 · Choose a quiz</h2>
            <div className="flex gap-1 bg-fg/5 rounded-2xl p-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id)
                    setSelected(null)
                  }}
                  className={cn('px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors', tab === t.id ? 'bg-purple text-fg' : 'text-fg/60 hover:text-fg')}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'library' && (
            <>
              <label className="flex items-center gap-3 mb-4 text-sm text-fg/70">
                Questions per round
                <input type="range" min={5} max={30} step={5} value={count} onChange={(e) => setCount(+e.target.value)} className="accent-pink flex-1" />
                <span className="font-bold text-fg w-8 text-right">{count}</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-3 max-h-[26rem] overflow-y-auto pr-1">
                {PACKS.map((p) => {
                  const active = selected?.title === p.title
                  return (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => chooseLibrary(p.id)}
                      className={cn('text-left rounded-2xl p-4 border-2 transition-colors', active ? 'bg-fg/15' : 'bg-fg/5 hover:bg-fg/10')}
                      style={{ borderColor: active ? p.color : 'transparent' }}
                    >
                      <div className="text-3xl mb-1">{p.emoji}</div>
                      <div className="font-display font-bold" style={{ color: p.color }}>
                        {p.title}
                      </div>
                      <div className="text-xs text-fg/60 line-clamp-2">{p.description}</div>
                    </motion.button>
                  )
                })}
              </div>
            </>
          )}

          {tab !== 'library' && (
            <div className="grid sm:grid-cols-2 gap-3 max-h-[26rem] overflow-y-auto pr-1">
              {savedByTab.length === 0 && (
                <div className="col-span-full text-center py-10 text-fg/60">
                  No {tab === 'ai' ? 'AI-generated' : 'manual'} quizzes yet.{' '}
                  <button className="underline" onClick={() => navigate(tab === 'ai' ? '/create/ai' : '/create/manual')}>
                    Create one →
                  </button>
                </div>
              )}
              {savedByTab.map((q) => {
                const active = selected?.id === q.id
                return (
                  <motion.button
                    key={q.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelected(q)}
                    className={cn('text-left rounded-2xl p-4 border-2 transition-colors', active ? 'bg-fg/15 border-purple' : 'bg-fg/5 hover:bg-fg/10 border-transparent')}
                  >
                    <div className="text-3xl mb-1">{q.emoji}</div>
                    <div className="font-display font-bold">{q.title}</div>
                    <div className="text-xs text-fg/60">{q.questions.length} questions</div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </Card>

        {/* ─── Teams ─── */}
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">2 · Teams & players</h2>
              {teams.some((t) => t.score !== 0) && (
                <Button size="sm" variant="ghost" onClick={resetScores}>
                  Reset scores
                </Button>
              )}
            </div>
            <form
              className="flex gap-2 mb-3"
              onSubmit={(e) => {
                e.preventDefault()
                addTeam(newTeam)
                setNewTeam('')
              }}
            >
              <input className="input" placeholder="Team or player name" value={newTeam} onChange={(e) => setNewTeam(e.target.value)} maxLength={24} />
              <Button type="submit" variant="success">
                Add
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 min-h-12">
              <AnimatePresence>
                {teams.map((t) => (
                  <motion.div key={t.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <TeamChip team={t} onClick={() => setEditing(t.id)} showScore={false} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {teams.length === 0 && <p className="text-fg/50 text-sm">Add at least one team to keep score. Tap a chip to edit it.</p>}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple/40 to-pink/30">
            <h2 className="text-xl font-bold mb-1">3 · Go live</h2>
            <p className="text-fg/70 text-sm mb-4">
              {selected ? (
                <>
                  <b className="text-fg">{selected.title}</b> · {selected.questions.length} slides
                </>
              ) : (
                'Pick a quiz to continue.'
              )}
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button size="lg" onClick={go} disabled={!selected}>
                ▶️ Start presenting
              </Button>
              {selected && selected.source !== 'library' && (
                <Button size="lg" variant="secondary" onClick={() => navigate(`/preview/${selected.id}`)}>
                  👁️ Preview
                </Button>
              )}
            </div>
            <p className="text-fg/40 text-xs mt-3">Tip: press F on stage for fullscreen. Use → / ← to move, Space to reveal.</p>
          </Card>
        </div>
      </div>

      <Modal open={!!editingTeam} onClose={() => setEditing(null)} title="Edit team">
        {editingTeam && (
          <div className="space-y-4">
            <input className="input" value={editingTeam.name} onChange={(e) => updateTeam(editingTeam.id, { name: e.target.value })} maxLength={24} />
            <div>
              <div className="text-sm text-fg/60 mb-2">Colour</div>
              <div className="flex flex-wrap gap-2">
                {TEAM_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateTeam(editingTeam.id, { color: c })}
                    className={cn('w-9 h-9 rounded-full border-4', editingTeam.color === c ? 'border-fg' : 'border-transparent')}
                    style={{ background: c }}
                    aria-label={`Colour ${c}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-fg/60 mb-2">Avatar</div>
              <EmojiPicker value={editingTeam.emoji} onChange={(emoji) => updateTeam(editingTeam.id, { emoji })} />
            </div>
            <div className="flex justify-between pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  removeTeam(editingTeam.id)
                  setEditing(null)
                }}
              >
                Remove
              </Button>
              <Button size="sm" onClick={() => setEditing(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
