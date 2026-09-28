import type { AiQuizRequest, Question, Quiz } from '@/types'
import { uid } from '@/utils'
import { flagUrl } from '@/features/library/packs/flags'
import { logoUrl } from '@/features/library/packs/logos'

/** Raw shape returned by /api/generate-quiz (mirrors the tool schema in api/generate-quiz.ts). */
interface RawAiQuestion {
  type: Question['type']
  text: string
  body?: string
  options?: string[]
  correctIndex?: number
  answer?: boolean | string
  points?: number
  timeLimit?: number
  hostNote?: string
  flagCode?: string
  logoSlug?: string
}

interface RawAiQuiz {
  title: string
  description: string
  emoji: string
  questions: RawAiQuestion[]
}

export class AiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
  }
}

export async function generateQuiz(req: AiQuizRequest, accessCode?: string): Promise<Quiz> {
  const res = await fetch('/api/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(accessCode ? { 'x-access-code': accessCode } : {}) },
    body: JSON.stringify(req),
  })
  const data = (await res.json().catch(() => ({}))) as Partial<RawAiQuiz> & { error?: string }
  if (!res.ok) throw new AiError(data.error ?? `Request failed (${res.status})`, res.status)
  return normalise(data as RawAiQuiz, req)
}

/** Validate + coerce the model output into our Quiz shape, dropping anything broken. */
function normalise(raw: RawAiQuiz, req: AiQuizRequest): Quiz {
  const questions: Question[] = []
  for (const r of raw.questions ?? []) {
    const text = String(r.text ?? '').trim()
    if (!text) continue
    const imageUrl = r.flagCode ? flagUrl(r.flagCode.toLowerCase()) : r.logoSlug ? logoUrl(r.logoSlug.toLowerCase()) : undefined
    const base = {
      id: uid('q'),
      text,
      imageUrl,
      points: Math.max(0, Math.round(Number(r.points) || 10)),
      timeLimit: Math.max(0, Math.round(Number(r.timeLimit) || 0)) || undefined,
      hostNote: r.hostNote?.trim() || undefined,
    }
    switch (r.type) {
      case 'slide':
        questions.push({ ...base, type: 'slide', points: 0, timeLimit: undefined, body: r.body?.trim() })
        break
      case 'mcq': {
        const options = (r.options ?? []).map((o) => String(o).trim()).filter(Boolean)
        const correctIndex = Number(r.correctIndex)
        if (options.length < 2 || !(correctIndex >= 0 && correctIndex < options.length)) continue
        questions.push({ ...base, type: 'mcq', options, correctIndex })
        break
      }
      case 'truefalse': {
        const a = typeof r.answer === 'string' ? r.answer.toLowerCase() === 'true' : Boolean(r.answer)
        questions.push({ ...base, type: 'truefalse', answer: a })
        break
      }
      case 'timed': {
        const answer = String(r.answer ?? '').trim()
        if (!answer) continue
        questions.push({ ...base, type: 'timed', answer, timeLimit: base.timeLimit ?? 30 })
        break
      }
    }
  }
  if (questions.length === 0) throw new AiError('The AI returned no usable questions. Try a different topic.')

  const now = Date.now()
  return {
    id: uid('quiz'),
    title: String(raw.title ?? req.topic).trim() || req.topic,
    description: String(raw.description ?? '').trim(),
    category: req.category,
    emoji: (raw.emoji ?? '✨').trim().slice(0, 4) || '✨',
    source: 'ai',
    questions,
    createdAt: now,
    updatedAt: now,
  }
}
