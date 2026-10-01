import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Dices, Eye, Loader2, MonitorPlay, Play, Plus, Search } from 'lucide-react'
import { Button, Card, EmojiPicker, LevelBadge, LevelSelect, Modal, PageHeader, TeamChip } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { useSessionStore } from '@/store/sessionStore'
import { cn, TEAM_COLORS } from '@/utils'
import type { Difficulty, Quiz } from '@/types'
import { PACKS } from '@/features/library/packs'
import { makeQuiz } from '@/features/library/helpers'
import { searchBank, toQuiz, useBank } from '@/features/bank/bank'
import { MixSheet } from '@/features/bank/MixSheet'

type Tab = 'library' | 'bank' | 'mine'

const StepTitle = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold flex items-center gap-2.5">
    <span className="w-6 h-6 rounded-full bg-purple/20 text-purple text-xs font-bold flex items-center justify-center tabular-nums">{n}</span>
    {children}
  </h2>
)

export function PlaySetup() {
  const navigate = useNavigate()
  const saved = useQuizStore((s) => s.quizzes)
  const { teams, addTeam, updateTeam, removeTeam, resetScores, start } = useSessionStore()

  const [tab, setTab] = useState<Tab>('library')
  const [selected, setSelected] = useState<Quiz | null>(null)
  const [count, setCount] = useState(10)
  const [newTeam, setNewTeam] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [bankQuery, setBankQuery] = useState('')
  const [bankPick, setBankPick] = useState<string | null>(null)
  const [level, setLevel] = useState<Difficulty | undefined>()
  const [mixing, setMixing] = useState(false)
  const bank = useBank()
  const bankHits = useMemo(() => (bank.quizzes ? searchBank(bank.quizzes, { query: bankQuery, difficulty: level }) : []), [bank.quizzes, bankQuery, level])

  // Everything the user has saved: built by hand, copied from the bank, or from the old AI generator.
  const mine = useMemo(() => saved.filter((q) => q.source !== 'library'), [saved])
  const mineShown = useMemo(() => mine.filter((q) => !level || q.difficulty === level), [mine, level])
  const editingTeam = teams.find((t) => t.id === editing)

  const [packPick, setPackPick] = useState<string | null>(null)
  const chooseLibrary = (packId: string, n = count) => {
    const pack = PACKS.find((p) => p.id === packId)!
    setPackPick(packId)
    setSelected(makeQuiz(pack, Math.min(n, pack.poolSize)))
  }
  const changeCount = (n: number) => {
    setCount(n)
    // Rebuild the chosen pack so the new count is what gets presented.
    if (packPick) chooseLibrary(packPick, n)
  }

  const go = () => {
    if (!selected) return
    start(selected)
    navigate('/play/stage')
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'library', label: 'Built-in' },
    { id: 'bank', label: 'Quiz bank' },
    { id: 'mine', label: 'My quizzes' },
  ]

  return (
    <div>
      <PageHeader title="Present a Quiz" icon={<MonitorPlay />} color="var(--color-pink)" subtitle="Pick a quiz, add teams, then go live." />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-6">
        {/* ─── Quiz picker ─── */}
        <Card className="min-w-0">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="mr-auto">
              <StepTitle n={1}>Choose a quiz</StepTitle>
            </div>
            <div className="flex gap-0.5 bg-fg/6 border border-fg/10 rounded-lg p-0.5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id)
                    setSelected(null)
                    setBankPick(null)
                    setPackPick(null)
                  }}
                  className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors', tab === t.id ? 'bg-fg/12 text-fg' : 'text-fg/60 hover:text-fg')}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Built-in packs mix levels, so the level filter applies to the bank and saved quizzes. */}
          {tab !== 'library' && <LevelSelect label="Level" noneLabel="All levels" noneShort="All" value={level} onChange={setLevel} className="mb-3" />}

          {tab === 'library' && (
            <>
              <label className="flex items-center gap-3 mb-4 text-sm text-fg/70">
                Questions per round
                <input type="range" min={5} max={30} step={5} value={count} onChange={(e) => changeCount(+e.target.value)} className="accent-purple flex-1" />
                <span className="font-semibold text-fg w-8 text-right tabular-nums">{count}</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-2.5 max-h-[26rem] overflow-y-auto pr-1">
                {PACKS.map((p) => {
                  const active = packPick === p.id && !!selected
                  return (
                    <button
                      key={p.id}
                      onClick={() => chooseLibrary(p.id)}
                      aria-pressed={active}
                      className={cn('text-left rounded-xl p-3 border transition-colors flex gap-3 items-start', active ? 'bg-fg/12' : 'bg-fg/5 hover:bg-fg/10 border-transparent')}
                      style={active ? { borderColor: p.color } : undefined}
                    >
                      <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: `color-mix(in srgb, ${p.color} 18%, transparent)` }}>
                        {p.emoji}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-sm" style={{ color: p.color }}>
                          {p.title}
                        </span>
                        <span className="block text-xs text-fg/60 line-clamp-2 mt-0.5">{p.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {tab === 'bank' && (
            <>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg/45 pointer-events-none" />
                <input
                  type="search"
                  className="input !pl-9"
                  placeholder="Search the quiz bank…"
                  value={bankQuery}
                  onChange={(e) => setBankQuery(e.target.value)}
                  aria-label="Search the quiz bank"
                />
              </div>
              {!bank.quizzes ? (
                <div className="py-10 flex justify-center" role="status" aria-label="Loading">
                  <Loader2 className="animate-spin text-fg/50" size={24} />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2.5 max-h-[26rem] overflow-y-auto pr-1">
                  <button
                    onClick={() => setMixing(true)}
                    aria-pressed={bankPick === 'mix'}
                    className={cn(
                      'text-left rounded-xl p-3 border border-dashed transition-colors flex gap-3 items-start',
                      bankPick === 'mix' ? 'bg-fg/12 border-purple' : 'bg-fg/5 hover:bg-fg/10 border-fg/20',
                    )}
                  >
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-purple" style={{ background: 'color-mix(in srgb, var(--color-purple) 18%, transparent)' }}>
                      <Dices size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-sm truncate">{bankPick === 'mix' && selected ? selected.title : 'Random mix'}</span>
                      <span className="block text-xs text-fg/60 mt-1 line-clamp-2">
                        {bankPick === 'mix' && selected ? `${selected.questions.length - 1} questions · tap to change` : 'Pick areas, a level and a length'}
                      </span>
                    </span>
                  </button>
                  {bankHits.length === 0 && <div className="col-span-full text-center py-10 text-fg/60 text-sm">{bankQuery ? `No quizzes match "${bankQuery}".` : 'No quizzes at this level.'}</div>}
                  {bankHits.map(({ quiz: b }) => {
                    const active = bankPick === b.id
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setBankPick(b.id)
                          setSelected(toQuiz(b))
                        }}
                        aria-pressed={active}
                        className={cn('text-left rounded-xl p-3 border transition-colors flex gap-3 items-start', active ? 'bg-fg/12' : 'bg-fg/5 hover:bg-fg/10 border-transparent')}
                        style={active ? { borderColor: b.area.color } : undefined}
                      >
                        <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: `color-mix(in srgb, ${b.area.color} 18%, transparent)` }}>
                          {b.emoji}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-sm truncate">{b.title}</span>
                          <span className="flex items-center gap-1.5 flex-wrap text-xs text-fg/60 mt-1">
                            <LevelBadge level={b.difficulty} />
                            {b.area.label}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'mine' && (
            <div className="grid sm:grid-cols-2 gap-2.5 max-h-[26rem] overflow-y-auto pr-1">
              {mineShown.length === 0 && level && mine.length > 0 && (
                <div className="col-span-full text-center py-10 text-fg/60 text-sm">None of your quizzes are at this level.</div>
              )}
              {mine.length === 0 && (
                <div className="col-span-full text-center py-10 text-fg/60 text-sm">
                  No quizzes of your own yet.{' '}
                  <button className="underline underline-offset-4 hover:text-fg" onClick={() => navigate('/create/manual')}>
                    Create one
                  </button>
                </div>
              )}
              {mineShown.map((q) => {
                const active = selected?.id === q.id
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelected(q)}
                    aria-pressed={active}
                    className={cn('text-left rounded-xl p-3 border transition-colors flex gap-3 items-start', active ? 'bg-fg/12 border-purple' : 'bg-fg/5 hover:bg-fg/10 border-transparent')}
                  >
                    <span className="w-10 h-10 rounded-lg bg-fg/8 flex items-center justify-center text-xl shrink-0">{q.emoji}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-sm truncate">{q.title}</span>
                      <span className="flex items-center gap-1.5 flex-wrap text-xs text-fg/60 mt-1">
                        {q.difficulty && <LevelBadge level={q.difficulty} />}
                        {q.questions.length} questions
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {/* ─── Teams ─── */}
        <div className="flex flex-col gap-4 lg:gap-6 min-w-0">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <StepTitle n={2}>Teams & players</StepTitle>
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
              <Button type="submit" variant="secondary">
                <Plus /> Add
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 min-h-10">
              <AnimatePresence>
                {teams.map((t) => (
                  <motion.div key={t.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <TeamChip team={t} onClick={() => setEditing(t.id)} showScore={false} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {teams.length === 0 && <p className="text-fg/50 text-sm">Add at least one team to keep score. Tap a chip to edit it.</p>}
            </div>
          </Card>

          <Card tint="var(--color-purple)">
            <StepTitle n={3}>Go live</StepTitle>
            <p className="text-fg/70 text-sm mt-1 mb-4">
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
                <Play fill="currentColor" /> Start presenting
              </Button>
              {selected && selected.source !== 'library' && (
                <Button size="lg" variant="secondary" onClick={() => navigate(`/preview/${selected.id}`)}>
                  <Eye /> Preview
                </Button>
              )}
            </div>
            <p className="text-fg/45 text-xs mt-3">Tip: press F on stage for fullscreen. Use → / ← to move, Space to reveal.</p>
          </Card>
        </div>
      </div>

      <MixSheet
        open={mixing}
        onClose={() => setMixing(false)}
        initial={{ level }}
        presentLabel="Use this mix"
        onPresent={(q) => {
          setBankPick('mix')
          setSelected(q)
          setMixing(false)
        }}
      />

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
                    className={cn('w-8 h-8 rounded-full transition-shadow', editingTeam.color === c ? 'ring-2 ring-fg ring-offset-2 ring-offset-ink-soft' : 'hover:ring-2 hover:ring-fg/40')}
                    style={{ background: c }}
                    aria-label={`Colour ${c}`}
                    aria-pressed={editingTeam.color === c}
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
                variant="secondary"
                className="text-red"
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
