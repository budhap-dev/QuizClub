/**
 * Keeps the local quiz library and the encrypted cloud vault in step.
 *
 * sync = pull → merge (newest wins, tombstones beat stale copies) → apply locally → push if
 * the merged result differs from what the server has. Local edits schedule a debounced sync;
 * focusing the tab or coming back online pulls again.
 */
import { useQuizStore } from '@/store/quizStore'
import { vaultApi, VaultApiError } from './api'
import { decryptJson, deriveVaultKeys, encryptJson, exportKey, importKey, VaultDecryptError, type VaultKeys } from './crypto'
import { fingerprint, mergeLibraries, pruneTombstones, type Library, type VaultPayload } from './merge'
import { useVaultStore } from './vaultStore'

let keysCache: { id: string; keys: VaultKeys } | null = null
let inflight: Promise<void> | null = null
let pushTimer: number | undefined
let lastFocusSync = 0
/** Set while merged data is being written into the quiz store so the subscriber doesn't echo it back. */
let applyingRemote = false

async function getKeys(): Promise<VaultKeys | null> {
  const { id, keyRaw } = useVaultStore.getState()
  if (!id || !keyRaw) return null
  if (keysCache?.id !== id) keysCache = { id, keys: { id, key: await importKey(keyRaw) } }
  return keysCache.keys
}

function localLibrary(): Library {
  const s = useQuizStore.getState()
  return { quizzes: s.quizzes, deleted: s.deleted }
}

function explain(err: unknown): { status: 'offline' | 'unconfigured' | 'error'; message: string } {
  if (err instanceof VaultApiError) {
    if (err.status === 0) return { status: 'offline', message: "Couldn't reach the server — changes are saved on this device and will sync later" }
    if (err.status === 503) return { status: 'unconfigured', message: 'Cloud storage is not set up on the server yet (add Upstash Redis to the Vercel project)' }
    return { status: 'error', message: err.message }
  }
  if (err instanceof VaultDecryptError) return { status: 'error', message: err.message }
  return { status: 'error', message: err instanceof Error ? err.message : 'Sync failed' }
}

/** Pull, merge, apply, push. Safe to call often; concurrent calls share one run. */
export function syncNow(): Promise<void> {
  if (inflight) return inflight
  inflight = run().finally(() => {
    inflight = null
  })
  return inflight
}

async function run(retry = true): Promise<void> {
  const keys = await getKeys()
  if (!keys) return
  const vault = useVaultStore.getState()
  vault.setStatus('syncing')
  try {
    const remote = await vaultApi.get(keys.id)
    const local = localLibrary()

    let remoteLib: Library | null = null
    if (remote.blob) {
      const payload = await decryptJson<VaultPayload>(keys, remote.blob)
      remoteLib = { quizzes: payload.quizzes ?? [], deleted: payload.deleted ?? {} }
    }

    const merged = remoteLib ? mergeLibraries(local, remoteLib) : { quizzes: local.quizzes, deleted: pruneTombstones(local.deleted) }

    if (fingerprint(merged) !== fingerprint(local)) {
      applyingRemote = true
      try {
        useQuizStore.getState().replaceLibrary(merged)
      } finally {
        applyingRemote = false
      }
    }

    const remoteFp = remoteLib ? fingerprint(remoteLib) : ''
    if (fingerprint(merged) !== remoteFp) {
      const payload: VaultPayload = { v: 1, quizzes: merged.quizzes, deleted: merged.deleted, savedAt: Date.now() }
      const blob = await encryptJson(keys, payload)
      const res = await vaultApi.put(keys.id, blob, remote.updatedAt)
      if (res.conflict) {
        // Someone else wrote in between: merge again from the top, once.
        if (retry) return run(false)
        throw new Error('The vault changed while syncing — try again')
      }
      vault.setSynced(res.updatedAt, blob.length)
    } else {
      vault.setSynced(remote.updatedAt, remote.blob?.length ?? 0)
    }
  } catch (err) {
    const { status, message } = explain(err)
    useVaultStore.getState().setStatus(status, message)
  }
}

/** Debounced sync after local edits. */
export function schedulePush(delay = 1500) {
  if (!useVaultStore.getState().id) return
  window.clearTimeout(pushTimer)
  pushTimer = window.setTimeout(() => void syncNow(), delay)
}

/** Derive keys from the passphrase, remember them on this device and run the first sync. */
export async function unlockVault(passphrase: string): Promise<void> {
  const keys = await deriveVaultKeys(passphrase)
  keysCache = { id: keys.id, keys }
  useVaultStore.getState().setUnlocked(keys.id, await exportKey(keys.key))
  const before = useQuizStore.getState().quizzes.length
  await syncNow()
  const s = useVaultStore.getState()
  if (s.status === 'synced' && before === 0 && useQuizStore.getState().quizzes.length === 0) s.setEmptyOnUnlock(true)
}

/** Forget the key on this device. Local quizzes stay. */
export function lockVault() {
  window.clearTimeout(pushTimer)
  keysCache = null
  useVaultStore.getState().setLocked()
}

/** Remove the cloud copy entirely, then lock. */
export async function deleteVault(): Promise<void> {
  const { id } = useVaultStore.getState()
  if (!id) return
  await vaultApi.remove(id)
  lockVault()
}

export function initVaultSync() {
  useQuizStore.subscribe((s, prev) => {
    if (applyingRemote) return
    if (s.quizzes !== prev.quizzes || s.deleted !== prev.deleted) schedulePush()
  })

  const onFocus = () => {
    if (!useVaultStore.getState().id) return
    if (Date.now() - lastFocusSync < 30_000) return
    lastFocusSync = Date.now()
    void syncNow()
  }
  window.addEventListener('focus', onFocus)
  window.addEventListener('online', () => void syncNow())

  if (useVaultStore.getState().id) void syncNow()
}
