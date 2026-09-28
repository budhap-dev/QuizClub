import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components'
import { gameById } from './registry'

export function GamePage() {
  const { game } = useParams()
  const meta = game ? gameById(game) : undefined

  if (!meta) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-3">🕹️</div>
        <h1 className="text-3xl font-bold mb-2">Game not found</h1>
        <Link to="/games" className="underline text-white/70">
          Back to games
        </Link>
      </div>
    )
  }

  const Game = meta.component
  return (
    <div>
      <PageHeader title={meta.title} emoji={meta.emoji} back="/games" />
      <Suspense
        fallback={
          <div className="py-20 text-center text-5xl animate-wiggle">{meta.emoji}</div>
        }
      >
        <Game />
      </Suspense>
    </div>
  )
}
