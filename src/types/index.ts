export type QuestionType = 'slide' | 'mcq' | 'truefalse' | 'timed' | 'number' | 'order' | 'list'

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
  /** Optional sound clip (URL or uploaded data URL) the host plays on stage, for music and sound rounds. */
  audioUrl?: string
  /** Points awarded for a correct answer. Slides ignore this. */
  points: number
  /** Seconds for the countdown. 0/undefined = no timer. */
  timeLimit?: number
  /** Private note shown only to the quiz master (accepted alternatives, pronunciation…). */
  hostNote?: string
  /** Shown to everyone once the answer is revealed: why it's right, or a related fact. */
  explanation?: string
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

/** Closest guess wins: teams write a number, the host awards whoever was nearest. */
export interface NumberQuestion extends QuestionBase {
  type: 'number'
  answer: number
  /** Shown after the number, e.g. "m", "km" or "years". */
  unit?: string
}

/** Put the items in order. The stage shows them shuffled and lettered, then slides them into place. */
export interface OrderQuestion extends QuestionBase {
  type: 'order'
  /** Items in the correct order. */
  items: string[]
  /** Optional labels for the two ends, e.g. ["Oldest", "Newest"]. */
  ends?: [string, string]
}

/** Name them all: several answers, each worth `points`. The host can uncover them one at a time. */
export interface ListQuestion extends QuestionBase {
  type: 'list'
  answers: string[]
}

export type Question = SlideQuestion | McqQuestion | TrueFalseQuestion | TimedQuestion | NumberQuestion | OrderQuestion | ListQuestion

/** 'ai' remains for quizzes saved while the AI generator existed. */
export type QuizSource = 'manual' | 'ai' | 'library'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Quiz {
  id: string
  title: string
  description?: string
  category: QuizCategory
  emoji: string
  source: QuizSource
  /** How hard the quiz is; unset for older quizzes and ones the author hasn't rated. */
  difficulty?: Difficulty
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

