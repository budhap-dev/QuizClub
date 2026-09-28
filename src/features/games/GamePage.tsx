import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Gamepad2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components'
import { gameById } from './registry'

export function GamePage() {
  const { game } = useParams()
  const meta = game ? gameById(game) : undefined

  if (!meta) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-fg/8 text-fg/50 flex items-center justify-center mx-auto mb-4">
          <Gamepad2 size={26} />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Game not found</h1>
        <Link to="/games" className="underline underline-offset-4 text-fg/70 hover:text-fg">
          Back to games
        </Link>
      </div>
    )
  }

  const Game = meta.component
  return (
    <div>
      <PageHeader title={meta.title} icon={meta.emoji} color={meta.color} back="/games" />
      <Suspense
        fallback={
          <div className="py-20 flex justify-center" role="status" aria-label="Loading">
            <Loader2 className="animate-spin text-fg/50" size={28} />
          </div>
        }
      >
        <Game />
      </Suspense>
    </div>
  )
}
