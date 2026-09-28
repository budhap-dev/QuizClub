import type { Quiz } from '@/types'

/** What gets encrypted and stored in the vault. */
export interface VaultPayload {
  v: 1
  quizzes: Quiz[]
  /** Tombstones: quiz id → time it was deleted, so a deletion wins over stale copies elsewhere. */
  deleted: Record<string, number>
  savedAt: number
}

export interface Library {
  quizzes: Quiz[]
  deleted: Record<string, number>
}

/** Tombstones older than this are dropped; any device that hasn't synced for a month re-merges cleanly enough. */
export const TOMBSTONE_TTL = 30 * 24 * 60 * 60 * 1000

/**
 * Newest copy of each quiz wins; a deletion beats any copy older than it.
 * Symmetric, so the result is the same whichever side is "local".
 */
export function mergeLibraries(a: Library, b: Library, now = Date.now()): Library {
  const deleted: Record<string, number> = {}
  for (const src of [a.deleted, b.deleted]) {
    for (const [id, at] of Object.entries(src ?? {})) deleted[id] = Math.max(deleted[id] ?? 0, at)
  }

  const byId = new Map<string, Quiz>()
  for (const q of [...(a.quizzes ?? []), ...(b.quizzes ?? [])]) {
    if ((deleted[q.id] ?? 0) > q.updatedAt) continue
    const existing = byId.get(q.id)
    if (!existing || q.updatedAt > existing.updatedAt) byId.set(q.id, q)
  }
  // A quiz edited after its tombstone was written is a resurrection: drop the tombstone.
  for (const id of byId.keys()) delete deleted[id]

  return {
    quizzes: [...byId.values()].sort((x, y) => y.updatedAt - x.updatedAt),
    deleted: pruneTombstones(deleted, now),
  }
}

export function pruneTombstones(deleted: Record<string, number>, now = Date.now()): Record<string, number> {
  return Object.fromEntries(Object.entries(deleted ?? {}).filter(([, at]) => now - at < TOMBSTONE_TTL))
}

/** Cheap identity of a library's contents, for "did anything change?" checks. */
export function fingerprint(lib: Library): string {
  const q = (lib.quizzes ?? []).map((x) => `${x.id}:${x.updatedAt}`).sort()
  const d = Object.entries(lib.deleted ?? {}).map(([id, at]) => `${id}:${at}`).sort()
  return `${q.join(',')}|${d.join(',')}`
}
