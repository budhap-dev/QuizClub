export type QuestionType = 'slide' | 'mcq' | 'truefalse' | 'timed'

export type QuizCategory =
  | 'general'
  | 'flags'
  | 'logos'
  | 'maths'
  | 'geography'
  | 'science'
  | 'literature'
  | 'movies'
  | 'sports'
  | 'music'
  | 'history'
  | 'custom'

export interface QuestionBase {
  id: string
  type: QuestionType
  /** The prompt shown on screen. For slides this is the title. */
  text: string
  /** Optional image shown with the question. */
  imageUrl?: string
  /** Points awarded for a correct answer. Slides ignore this. */
  points: number
  /** Seconds for the countdown. 0/undefined = no timer. */
  timeLimit?: number
  /** Private note shown only to the quiz master. */
  hostNote?: string
}

export interface SlideQuestion extends QuestionBase {
  type: 'slide'
  /** Body text for the slide (supports line breaks). */
  body?: string
}

export interface McqQuestion extends QuestionBase {
  type: 'mcq'
  options: string[]
  /** Index into options. */
  correctIndex: number
  /** Optional image per option (same index). */
  optionImages?: (string | undefined)[]
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'truefalse'
  answer: boolean
}

export interface TimedQuestion extends QuestionBase {
  type: 'timed'
  /** Free-text answer revealed when time runs out. */
  answer: string
  timeLimit: number
}

export type Question = SlideQuestion | McqQuestion | TrueFalseQuestion | TimedQuestion

export type QuizSource = 'manual' | 'ai' | 'library'

export interface Quiz {
  id: string
  title: string
  description?: string
  category: QuizCategory
  emoji: string
  source: QuizSource
  questions: Question[]
  createdAt: number
  updatedAt: number
}

export interface Team {
  id: string
  name: string
  emoji: string
  color: string
  score: number
}

export type StagePhase = 'question' | 'revealed' | 'scoreboard' | 'podium'

export interface ScoreEvent {
  teamId: string
  delta: number
  reason?: string
  questionId?: string
  at: number
}

export interface Session {
  quizId: string
  teams: Team[]
  index: number
  phase: StagePhase
  history: ScoreEvent[]
  startedAt: number
}

export interface AiQuizRequest {
  topic: string
  category: QuizCategory
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  count: number
  types: QuestionType[]
  audience: 'kids' | 'adults' | 'mixed'
  language?: string
}

export interface AiQuizResponse {
  title: string
  description: string
  emoji: string
  questions: Question[]
}
