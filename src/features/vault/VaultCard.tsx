import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cloud, Eye, EyeOff, KeyRound, Loader2, Lock, LockOpen, RefreshCw, Trash2 } from 'lucide-react'
import { Button, Card } from '@/components'
import { useQuizStore } from '@/store/quizStore'
import { cn } from '@/utils'
import { useVaultStore, type VaultStatus } from './vaultStore'
import { deleteVault, lockVault, syncNow, unlockVault } from './sync'

const MAX_BYTES = 900_000
const MIN_PASSPHRASE = 8

const dot: Record<VaultStatus, string> = {
  locked: 'bg-fg/30',
  syncing: 'bg-sun animate-pulse',
  synced: 'bg-mint',
  offline: 'bg-orange',
  unconfigured: 'bg-sun',
  error: 'bg-red',
}

function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return new Date(ts).toLocaleDateString()
}

const formatBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`)

/** Settings card: unlock the encrypted cloud vault with a passphrase, see sync status, lock or delete. */
export function VaultCard({ className }: { className?: string }) {
  const vault = useVaultStore()
  const count = useQuizStore((s) => s.quizzes.length)
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const unlocked = !!vault.id

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pass.length < MIN_PASSPHRASE || busy) return
    setBusy(true)
    try {
      await unlockVault(pass)
      setPass('')
    } finally {
      setBusy(false)
    }
  }

  const statusText = (() => {
    switch (vault.status) {
      case 'syncing':
        return 'Syncing…'
      case 'synced':
        return `Synced ${vault.lastSyncedAt ? timeAgo(vault.lastSyncedAt) : ''} · ${count} ${count === 1 ? 'quiz' : 'quizzes'} · ${formatBytes(vault.size)}`
      default:
        return vault.error ?? ''
    }
  })()

  return (
    <Card className={className}>
      <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
        <Cloud size={18} className="text-cyan" /> Cloud vault
      </h2>
      <p className="text-fg/60 text-sm mb-4">
        Keep your quizzes in sync across devices without an account. The library is encrypted in this browser with a passphrase — the server only ever stores
        scrambled data, so only someone with the passphrase can see your questions.
      </p>

      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.form key="locked" onSubmit={unlock} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  data-testid="vault-passphrase"
                  type={show ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Passphrase — use the same one on every device"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoComplete="off"
                  minLength={MIN_PASSPHRASE}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-fg/50 hover:text-fg hover:bg-fg/10 transition-colors"
                  title={show ? 'Hide passphrase' : 'Show passphrase'}
                  aria-label={show ? 'Hide passphrase' : 'Show passphrase'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button data-testid="vault-unlock" type="submit" disabled={pass.length < MIN_PASSPHRASE || busy}>
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" /> Deriving key…
                  </>
                ) : (
                  <>
                    <LockOpen /> Unlock
                  </>
                )}
              </Button>
            </div>
            <p className="text-fg/40 text-xs">
              At least {MIN_PASSPHRASE} characters. First time? Unlocking creates the vault and uploads the quizzes on this device. There is no reset if you
              forget the passphrase — keep an export from Backup as a safety net.
            </p>
            {vault.error && <p className="text-red text-sm">{vault.error}</p>}
          </motion.form>
        ) : (
          <motion.div key="unlocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 text-sm" data-testid="vault-status">
              <span className={cn('w-2 h-2 rounded-full shrink-0', dot[vault.status])} />
              <span className={cn(vault.status === 'error' && 'text-red', (vault.status === 'offline' || vault.status === 'unconfigured') && 'text-sun')}>
                {statusText}
              </span>
            </div>

            {vault.emptyOnUnlock && (
              <p className="text-sun text-sm">
                This vault is empty. If you expected quizzes here, lock and try the passphrase again — a different passphrase opens a different vault.
              </p>
            )}
            {vault.size > MAX_BYTES * 0.66 && (
              <p className="text-sun text-sm">
                The vault is {formatBytes(vault.size)} of the {formatBytes(MAX_BYTES)} limit. Prefer image URLs over uploads to keep it small.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button data-testid="vault-sync" size="sm" variant="secondary" onClick={() => void syncNow()} disabled={vault.status === 'syncing'}>
                <RefreshCw className={cn(vault.status === 'syncing' && 'animate-spin')} /> Sync now
              </Button>
              <Button data-testid="vault-lock" size="sm" variant="secondary" onClick={lockVault}>
                <Lock /> Lock this device
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-fg/60 hover:text-red"
                onClick={() => {
                  if (confirm('Delete the cloud copy of your library? Quizzes on this device are kept.')) void deleteVault()
                }}
              >
                <Trash2 /> Delete cloud copy
              </Button>
            </div>
            <p className="text-fg/40 text-xs flex items-center gap-1.5">
              <KeyRound size={12} /> Locking forgets the key on this device only; your quizzes stay here and in the cloud.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
