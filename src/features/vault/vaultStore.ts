import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type VaultStatus = 'locked' | 'syncing' | 'synced' | 'offline' | 'unconfigured' | 'error'

interface VaultState {
  /** Persisted: this device stays unlocked until the user locks it. The passphrase itself is never stored. */
  id: string | null
  keyRaw: string | null
  lastSyncedAt: number | null
  remoteUpdatedAt: number | null

  /** Runtime only */
  status: VaultStatus
  error: string | null
  /** Encrypted payload size in bytes, to warn before the server limit. */
  size: number
  /** True right after unlocking when neither side had any quizzes — likely a typo in the passphrase. */
  emptyOnUnlock: boolean

  setUnlocked: (id: string, keyRaw: string) => void
  setLocked: () => void
  setStatus: (status: VaultStatus, error?: string | null) => void
  setSynced: (remoteUpdatedAt: number | null, size: number) => void
  setEmptyOnUnlock: (v: boolean) => void
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set) => ({
      id: null,
      keyRaw: null,
      lastSyncedAt: null,
      remoteUpdatedAt: null,
      status: 'locked',
      error: null,
      size: 0,
      emptyOnUnlock: false,

      setUnlocked: (id, keyRaw) => set({ id, keyRaw, status: 'syncing', error: null, lastSyncedAt: null, remoteUpdatedAt: null, emptyOnUnlock: false }),
      setLocked: () => set({ id: null, keyRaw: null, lastSyncedAt: null, remoteUpdatedAt: null, status: 'locked', error: null, size: 0, emptyOnUnlock: false }),
      setStatus: (status, error = null) => set({ status, error }),
      setSynced: (remoteUpdatedAt, size) => set({ status: 'synced', error: null, lastSyncedAt: Date.now(), remoteUpdatedAt, size }),
      setEmptyOnUnlock: (emptyOnUnlock) => set({ emptyOnUnlock }),
    }),
    {
      name: 'quizclub.vault',
      partialize: (s) => ({ id: s.id, keyRaw: s.keyRaw, lastSyncedAt: s.lastSyncedAt, remoteUpdatedAt: s.remoteUpdatedAt }),
      // Rehydrated devices start "syncing" if unlocked; initVaultSync() runs the first sync.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<VaultState>
        return { ...current, ...p, status: p.id ? 'syncing' : 'locked' }
      },
    },
  ),
)
