import { Link } from 'react-router-dom'
import { cn } from '@/utils'
import { useVaultStore, type VaultStatus } from './vaultStore'

const dot: Record<VaultStatus, string> = {
  locked: 'bg-fg/30',
  syncing: 'bg-sun animate-pulse',
  synced: 'bg-mint',
  offline: 'bg-orange',
  unconfigured: 'bg-sun',
  error: 'bg-red',
}

const label: Record<VaultStatus, string> = {
  locked: 'Cloud vault locked',
  syncing: 'Cloud vault: syncing…',
  synced: 'Cloud vault: synced',
  offline: 'Cloud vault: offline',
  unconfigured: 'Cloud vault: server storage not set up',
  error: 'Cloud vault: error',
}

/** Small ☁️ in the nav showing sync state; hidden until a vault is unlocked. */
export function VaultBadge() {
  const id = useVaultStore((s) => s.id)
  const status = useVaultStore((s) => s.status)
  const error = useVaultStore((s) => s.error)
  if (!id) return null
  return (
    <Link to="/settings" className="relative px-2 py-1.5 rounded-xl text-lg hover:bg-fg/10" title={error ?? label[status]} aria-label={label[status]}>
      ☁️
      <span className={cn('absolute right-1 bottom-1.5 w-2 h-2 rounded-full ring-2 ring-ink', dot[status])} />
    </Link>
  )
}
