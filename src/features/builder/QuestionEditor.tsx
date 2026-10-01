import { useRef } from 'react'
import { ArrowDown, ArrowUp, Check, Plus, Upload, X } from 'lucide-react'
import { Button, alertDialog } from '@/components'
import type { McqQuestion, OrderQuestion, Question, QuestionType } from '@/types'
import { cn, OPTION_LABELS } from '@/utils'

interface QuestionEditorProps {
  question: Question
  onChange: (q: Question) => void
}

const TYPES: { id: QuestionType; label: string }[] = [
  { id: 'slide', label: 'Slide' },
  { id: 'mcq', label: 'Multiple choice' },
  { id: 'truefalse', label: 'True / False' },
  { id: 'timed', label: 'Timed answer' },
  { id: 'number', label: 'Closest number' },
  { id: 'order', label: 'Put in order' },
]

/** Most items an order question can have (one letter each, A–F). */
export const MAX_ORDER_ITEMS = 6

/** Convert a question to another type while keeping shared fields. */
export function convertType(q: Question, type: QuestionType): Question {
  const base = { id: q.id, text: q.text, imageUrl: q.imageUrl, points: q.points || 10, timeLimit: q.timeLimit, hostNote: q.hostNote, explanation: q.explanation }
  switch (type) {
    case 'slide':
      return { ...base, type, points: 0, body: '' }
    case 'mcq':
      return { ...base, type, options: ['', '', '', ''], correctIndex: 0 }
    case 'truefalse':
      return { ...base, type, answer: true }
    case 'timed':
      return { ...base, type, answer: '', timeLimit: q.timeLimit || 30 }
    case 'number':
      return { ...base, type, answer: NaN }
    case 'order':
      return { ...base, type, items: ['', '', '', ''] }
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export function QuestionEditor({ question: q, onChange }: QuestionEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const patch = (p: Partial<Question>) => onChange({ ...q, ...p } as Question)

  const onImageFile = async (file?: File) => {
    if (!file) return
    if (file.size > 1_500_000) {
      void alertDialog({ title: 'Image too large', message: 'Use an image under 1.5 MB, or paste an image URL instead.' })
      return
    }
    patch({ imageUrl: await fileToDataUrl(file) })
  }

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-1.5 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => q.type !== t.id && onChange(convertType(q, t.id))}
            aria-pressed={q.type === t.id}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              q.type === t.id ? 'bg-purple/18 border-purple text-fg' : 'border-fg/12 text-fg/75 hover:bg-fg/8 hover:text-fg',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <label className="block">
        <span className="text-sm text-fg/70">{q.type === 'slide' ? 'Slide title' : 'Question'}</span>
        <textarea className="input mt-1 min-h-20 text-base" value={q.text} onChange={(e) => patch({ text: e.target.value })} placeholder={q.type === 'slide' ? 'Round 1: Geography' : 'What is the capital of…?'} />
      </label>

      {/* Image */}
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <span className="text-sm text-fg/70">Image (URL or upload)</span>
          <div className="flex gap-2 mt-1">
            <input className="input" value={q.imageUrl?.startsWith('data:') ? '(uploaded image)' : (q.imageUrl ?? '')} onChange={(e) => patch({ imageUrl: e.target.value || undefined })} placeholder="https://…" />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} title="Upload image" aria-label="Upload image">
              <Upload />
            </Button>
            {q.imageUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={() => patch({ imageUrl: undefined })} title="Remove image" aria-label="Remove image">
                <X />
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void onImageFile(e.target.files?.[0])} />
          </div>
        </div>
        {q.imageUrl && <img src={q.imageUrl} alt="" className="h-20 w-28 object-contain rounded-lg bg-fg/8 border border-fg/10" referrerPolicy="no-referrer" />}
      </div>

      {/* Type-specific */}
      {q.type === 'slide' && (
        <label className="block">
          <span className="text-sm text-fg/70">Body text</span>
          <textarea className="input mt-1 min-h-24" value={q.body ?? ''} onChange={(e) => patch({ body: e.target.value } as Partial<Question>)} placeholder="Rules, fun facts, a welcome message…" />
        </label>
      )}

      {q.type === 'mcq' && <McqOptions q={q} onChange={onChange} />}

      {q.type === 'truefalse' && (
        <div>
          <span className="text-sm text-fg/70">Correct answer</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[true, false].map((v) => {
              const on = q.answer === v
              const Icon = v ? Check : X
              return (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => patch({ answer: v } as Partial<Question>)}
                  aria-pressed={on}
                  className={cn(
                    'rounded-xl py-3 font-semibold border transition-colors flex items-center justify-center gap-2',
                    on ? (v ? 'bg-mint/18 border-mint text-mint' : 'bg-red/18 border-red text-red') : 'border-fg/12 text-fg/70 hover:bg-fg/8 hover:text-fg',
                  )}
                >
                  <Icon size={16} strokeWidth={2.5} /> {v ? 'True' : 'False'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {q.type === 'timed' && (
        <label className="block">
          <span className="text-sm text-fg/70">Answer (revealed when time is up)</span>
          <input className="input mt-1" value={q.answer} onChange={(e) => patch({ answer: e.target.value } as Partial<Question>)} placeholder="Paris" />
        </label>
      )}

      {q.type === 'number' && (
        <div className="grid grid-cols-[1fr_8rem] gap-3">
          <label className="block">
            <span className="text-sm text-fg/70">Answer (the closest guess wins)</span>
            <input
              type="number"
              step="any"
              className="input mt-1"
              value={Number.isFinite(q.answer) ? q.answer : ''}
              onChange={(e) => patch({ answer: e.target.value === '' ? NaN : +e.target.value } as Partial<Question>)}
              placeholder="8849"
            />
          </label>
          <label className="block">
            <span className="text-sm text-fg/70">Unit</span>
            <input className="input mt-1" value={q.unit ?? ''} onChange={(e) => patch({ unit: e.target.value || undefined } as Partial<Question>)} placeholder="m" maxLength={16} />
          </label>
        </div>
      )}

      {q.type === 'order' && <OrderItems q={q} onChange={onChange} />}

      {/* Shared settings */}
      {q.type !== 'slide' && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-fg/70">Points</span>
            <input type="number" min={0} className="input mt-1" value={q.points} onChange={(e) => patch({ points: Math.max(0, +e.target.value) })} />
          </label>
          <label className="block">
            <span className="text-sm text-fg/70">Timer (seconds, 0 = none)</span>
            <input type="number" min={0} className="input mt-1" value={q.timeLimit ?? 0} onChange={(e) => patch({ timeLimit: Math.max(0, +e.target.value) })} />
          </label>
        </div>
      )}

      {q.type !== 'slide' && (
        <label className="block">
          <span className="text-sm text-fg/70">Explanation (shown on screen after the answer is revealed)</span>
          <textarea
            className="input mt-1 min-h-16"
            value={q.explanation ?? ''}
            onChange={(e) => patch({ explanation: e.target.value || undefined })}
            placeholder="Why the answer is right, or a fun fact about it"
            maxLength={240}
          />
        </label>
      )}

      <label className="block">
        <span className="text-sm text-fg/70">Quiz master note (hidden from the screen)</span>
        <input className="input mt-1" value={q.hostNote ?? ''} onChange={(e) => patch({ hostNote: e.target.value || undefined })} placeholder="Accepted alternatives, pronunciation…" />
      </label>
    </div>
  )
}

function McqOptions({ q, onChange }: { q: McqQuestion; onChange: (q: Question) => void }) {
  const setOption = (i: number, v: string) => onChange({ ...q, options: q.options.map((o, j) => (j === i ? v : o)) })
  const setOptionImage = (i: number, v: string) => {
    const imgs = [...(q.optionImages ?? [])]
    imgs[i] = v || undefined
    onChange({ ...q, optionImages: imgs })
  }
  const add = () => q.options.length < 6 && onChange({ ...q, options: [...q.options, ''] })
  const removeAt = (i: number) => {
    if (q.options.length <= 2) return
    const options = q.options.filter((_, j) => j !== i)
    // Deleting the correct option leaves none marked (-1) rather than silently promoting option A.
    const correctIndex = q.correctIndex === i ? -1 : q.correctIndex > i ? q.correctIndex - 1 : q.correctIndex
    // Option images are stored by position, so they shift with their options.
    const optionImages = q.optionImages && Array.from({ length: q.options.length }, (_, j) => q.optionImages?.[j]).filter((_, j) => j !== i)
    onChange({ ...q, options, correctIndex, optionImages })
  }

  return (
    <div>
      <span className="text-sm text-fg/70">Options — click the letter to mark the correct one</span>
      <div className="space-y-2 mt-1">
        {q.options.map((opt, i) => (
          <div key={i} className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => onChange({ ...q, correctIndex: i })}
              aria-pressed={q.correctIndex === i}
              className={cn(
                'w-10 h-10 rounded-lg font-semibold shrink-0 transition-colors border',
                q.correctIndex === i ? 'bg-mint text-ink border-mint' : 'bg-fg/8 border-fg/10 hover:bg-fg/14',
              )}
              title="Mark as correct"
            >
              {OPTION_LABELS[i]}
            </button>
            <input className="input" value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`Option ${OPTION_LABELS[i]}`} />
            <input className="input !w-32 hidden md:block" value={q.optionImages?.[i] ?? ''} onChange={(e) => setOptionImage(i, e.target.value)} placeholder="img URL" title="Optional image URL for this option" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-fg/40 hover:text-red hover:bg-fg/8 disabled:opacity-30 disabled:hover:text-fg/40 transition-colors shrink-0"
              aria-label="Remove option"
              disabled={q.options.length <= 2}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      {q.options.length < 6 && (
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={add}>
          <Plus /> Add option
        </Button>
      )}
    </div>
  )
}

function OrderItems({ q, onChange }: { q: OrderQuestion; onChange: (q: Question) => void }) {
  const set = (items: string[]) => onChange({ ...q, items })
  const move = (i: number, by: number) => {
    const items = [...q.items]
    ;[items[i], items[i + by]] = [items[i + by], items[i]]
    set(items)
  }
  const setEnd = (i: 0 | 1, v: string) => {
    const ends: [string, string] = [q.ends?.[0] ?? '', q.ends?.[1] ?? '']
    ends[i] = v
    onChange({ ...q, ends: ends[0] || ends[1] ? ends : undefined })
  }

  return (
    <div>
      <span className="text-sm text-fg/70">Items in the correct order. The stage shuffles them, then slides them into place on reveal.</span>
      <div className="space-y-2 mt-1">
        {q.items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="w-8 text-center text-sm font-semibold text-fg/50 tabular-nums shrink-0">{i + 1}</span>
            <input className="input" value={item} onChange={(e) => set(q.items.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Item ${i + 1}`} />
            <div className="flex shrink-0">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-8 rounded-md flex items-center justify-center text-fg/50 hover:text-fg hover:bg-fg/8 disabled:opacity-30" aria-label="Move up">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === q.items.length - 1} className="w-7 h-8 rounded-md flex items-center justify-center text-fg/50 hover:text-fg hover:bg-fg/8 disabled:opacity-30" aria-label="Move down">
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => set(q.items.filter((_, j) => j !== i))}
                disabled={q.items.length <= 3}
                className="w-8 h-8 rounded-md flex items-center justify-center text-fg/40 hover:text-red hover:bg-fg/8 disabled:opacity-30 disabled:hover:text-fg/40"
                aria-label="Remove item"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {q.items.length < MAX_ORDER_ITEMS && (
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => set([...q.items, ''])}>
          <Plus /> Add item
        </Button>
      )}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="block">
          <span className="text-sm text-fg/70">First means (optional)</span>
          <input className="input mt-1" value={q.ends?.[0] ?? ''} onChange={(e) => setEnd(0, e.target.value)} placeholder="Oldest" maxLength={24} />
        </label>
        <label className="block">
          <span className="text-sm text-fg/70">Last means (optional)</span>
          <input className="input mt-1" value={q.ends?.[1] ?? ''} onChange={(e) => setEnd(1, e.target.value)} placeholder="Newest" maxLength={24} />
        </label>
      </div>
    </div>
  )
}
