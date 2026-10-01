import { lazy, type LazyExoticComponent } from 'react'

export interface GameMeta {
  id: string
  title: string
  emoji: string
  color: string
  description: string
  component: LazyExoticComponent<() => JSX.Element>
}

export const GAMES: GameMeta[] = [
  {
    id: 'cows-bulls',
    title: 'Cows & Bulls',
    emoji: '🐂',
    color: 'var(--color-sun)',
    description: 'Crack the secret 4-digit number. Bulls = right digit, right place. Cows = right digit, wrong place.',
    component: lazy(() => import('./cows-bulls/CowsBulls')),
  },
  {
    id: 'hangman',
    title: 'Hangman',
    emoji: '🪢',
    color: 'var(--color-pink)',
    description: 'Guess the word one letter at a time before the drawing is complete.',
    component: lazy(() => import('./hangman/Hangman')),
  },
  {
    id: 'wordle',
    title: 'Wordle',
    emoji: '🟩',
    color: 'var(--color-lime)',
    description: 'Six tries to find the five-letter word. Green, yellow, grey — you know the drill.',
    component: lazy(() => import('./wordle/Wordle')),
  },
  {
    id: 'scramble',
    title: 'Word Scramble',
    emoji: '🔀',
    color: 'var(--color-cyan)',
    description: 'Unscramble the letters before the clock runs out.',
    component: lazy(() => import('./scramble/Scramble')),
  },
  {
    id: 'emoji-riddles',
    title: 'Emoji Riddles',
    emoji: '🧩',
    color: 'var(--color-purple)',
    description: 'Movies, songs and places — told only in emoji.',
    component: lazy(() => import('./emoji-riddles/EmojiRiddles')),
  },
  {
    id: 'memory',
    title: 'Memory Match',
    emoji: '🃏',
    color: 'var(--color-mint)',
    description: 'Flip cards and find the matching pairs. Fewest moves wins.',
    component: lazy(() => import('./memory/Memory')),
  },
  {
    id: 'picture-reveal',
    title: 'Picture Reveal',
    emoji: '🖼️',
    color: 'var(--color-orange)',
    description: 'A flag or logo hides under tiles that drop away one by one. Guess early for more points.',
    component: lazy(() => import('./picture-reveal/PictureReveal')),
  },
  {
    id: 'higher-lower',
    title: 'Higher or Lower',
    emoji: '↕️',
    color: 'var(--color-sun)',
    description: 'Which came first, which is taller? Keep the streak going, or bank it before you slip.',
    component: lazy(() => import('./higher-lower/HigherLower')),
  },
  {
    id: 'odd-one-out',
    title: 'Odd One Out',
    emoji: '🔍',
    color: 'var(--color-cyan)',
    description: "Four things, one doesn't belong. Spot it, then hear why.",
    component: lazy(() => import('./odd-one-out/OddOneOut')),
  },
]

export const gameById = (id: string) => GAMES.find((g) => g.id === id)
