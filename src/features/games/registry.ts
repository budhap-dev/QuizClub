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
    color: '#fbbf24',
    description: 'Crack the secret 4-digit number. Bulls = right digit, right place. Cows = right digit, wrong place.',
    component: lazy(() => import('./cows-bulls/CowsBulls')),
  },
  {
    id: 'hangman',
    title: 'Hangman',
    emoji: '🪢',
    color: '#ff4d8d',
    description: 'Guess the word one letter at a time before the drawing is complete.',
    component: lazy(() => import('./hangman/Hangman')),
  },
  {
    id: 'wordle',
    title: 'Wordle',
    emoji: '🟩',
    color: '#a3e635',
    description: 'Six tries to find the five-letter word. Green, yellow, grey — you know the drill.',
    component: lazy(() => import('./wordle/Wordle')),
  },
  {
    id: 'scramble',
    title: 'Word Scramble',
    emoji: '🔀',
    color: '#22d3ee',
    description: 'Unscramble the letters before the clock runs out.',
    component: lazy(() => import('./scramble/Scramble')),
  },
  {
    id: 'emoji-riddles',
    title: 'Emoji Riddles',
    emoji: '🧩',
    color: '#a855f7',
    description: 'Movies, songs and places — told only in emoji.',
    component: lazy(() => import('./emoji-riddles/EmojiRiddles')),
  },
  {
    id: 'memory',
    title: 'Memory Match',
    emoji: '🃏',
    color: '#34d399',
    description: 'Flip cards and find the matching pairs. Fewest moves wins.',
    component: lazy(() => import('./memory/Memory')),
  },
]

export const gameById = (id: string) => GAMES.find((g) => g.id === id)
