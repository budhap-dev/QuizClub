/**
 * Vercel serverless function: turns an AiQuizRequest into a quiz using Claude.
 * The API key lives only here (ANTHROPIC_API_KEY env var), never in the browser.
 *
 * TODO(auth): replace AI_ACCESS_CODE with Google sign-in verification.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'

const QUESTION_TYPES = ['slide', 'mcq', 'truefalse', 'timed'] as const
type QuestionType = (typeof QUESTION_TYPES)[number]

interface Body {
  topic: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  count: number
  types: QuestionType[]
  audience: 'kids' | 'adults' | 'mixed'
  language?: string
}

/** JSON schema the model must follow. Kept in sync with src/types. */
const quizSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'emoji', 'questions'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    emoji: { type: 'string', description: 'A single emoji representing the quiz' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'text', 'points', 'timeLimit', 'hostNote'],
        properties: {
          type: { type: 'string', enum: [...QUESTION_TYPES] },
          text: { type: 'string', description: 'The question prompt, or the slide title' },
          body: { type: 'string', description: 'Slide body text (slides only)' },
          options: { type: 'array', items: { type: 'string' }, description: 'MCQ options, 3–5 items (mcq only)' },
          correctIndex: { type: 'integer', description: 'Index of the correct option (mcq only)' },
          answer: { type: ['boolean', 'string'], description: 'true/false for truefalse; short text for timed' },
          points: { type: 'integer' },
          timeLimit: { type: 'integer', description: 'Seconds; 0 for slides' },
          hostNote: { type: 'string', description: 'A one-line fun fact or explanation for the quiz master' },
          flagCode: { type: 'string', description: 'ISO 3166-1 alpha-2 country code if the question is about a flag' },
          logoSlug: { type: 'string', description: 'simpleicons.org slug if the question is about a brand logo' },
        },
      },
    },
  },
}

function bad(res: VercelResponse, status: number, error: string) {
  return res.status(status).json({ error })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return bad(res, 405, 'Method not allowed')

  if (!process.env.ANTHROPIC_API_KEY) return bad(res, 500, 'ANTHROPIC_API_KEY is not configured on the server')

  const accessCode = process.env.AI_ACCESS_CODE
  if (accessCode && req.headers['x-access-code'] !== accessCode) return bad(res, 401, 'Invalid access code')

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Partial<Body>
  const topic = String(body.topic ?? '').trim().slice(0, 200)
  const count = Math.min(30, Math.max(3, Number(body.count) || 10))
  const types = (body.types ?? ['mcq', 'truefalse']).filter((t): t is QuestionType => (QUESTION_TYPES as readonly string[]).includes(t))
  if (!topic) return bad(res, 400, 'Topic is required')
  if (types.length === 0) return bad(res, 400, 'Pick at least one question type')

  const difficulty = body.difficulty ?? 'mixed'
  const audience = body.audience ?? 'mixed'
  const language = body.language?.trim() || 'English'

  const prompt = `Create a fun, accurate quiz for a live quiz night, presented on a big screen to ${audience === 'kids' ? 'children' : audience === 'adults' ? 'adults' : 'a mixed-age audience'}.

Topic: ${topic}
Category hint: ${body.category ?? 'general'}
Difficulty: ${difficulty}
Number of questions: exactly ${count}
Allowed question types: ${types.join(', ')}
Language: ${language}

Rules:
- Every fact must be correct and unambiguous. Avoid trick questions and anything dated or controversial.
- Mix the allowed types. If "slide" is allowed, use at most 2 slides (an intro and/or a fun-fact interlude); slides have points 0 and timeLimit 0.
- mcq: 4 options, one clearly correct, plausible distractors, correctIndex is 0-based. Vary which position is correct.
- truefalse: answer is a boolean. Make roughly half true and half false.
- timed: an open question with a short text answer; timeLimit 20–45.
- points: 5 for easy, 10 for medium, 15 for hard. timeLimit: 10–30 seconds for mcq/truefalse.
- hostNote: one short sentence with a fun fact or clarification.
- If a question is about a country's flag, set flagCode and phrase the question as "Which country does this flag belong to?".
- If a question is about a brand logo, set logoSlug (lowercase simpleicons slug) and phrase it as "Which brand is this logo?".
- Keep question text under 140 characters so it fits on screen.
- Title: short and catchy. Emoji: one emoji.`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
      tools: [
        {
          name: 'save_quiz',
          description: 'Save the generated quiz',
          input_schema: quizSchema as Anthropic.Tool['input_schema'],
        },
      ],
      tool_choice: { type: 'tool', name: 'save_quiz' },
    })

    const toolUse = msg.content.find((c) => c.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') return bad(res, 502, 'Model did not return a quiz')

    return res.status(200).json(toolUse.input)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    console.error('generate-quiz error', err)
    return bad(res, 502, message)
  }
}
