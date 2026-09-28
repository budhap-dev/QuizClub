/** Thin client for api/vault.ts. Errors carry the HTTP status so the UI can explain them. */

export class VaultApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface RemoteVault {
  blob: string | null
  updatedAt: number | null
}

type PutResult = { conflict: false; updatedAt: number } | { conflict: true; blob: string; updatedAt: number }

async function request(method: 'GET' | 'PUT' | 'DELETE', id: string, body?: unknown) {
  let res: Response
  try {
    res = await fetch(`/api/vault?id=${encodeURIComponent(id)}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new VaultApiError("Couldn't reach the server", 0)
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok && res.status !== 409) throw new VaultApiError(String(data.error ?? `Request failed (${res.status})`), res.status)
  return { status: res.status, data }
}

export const vaultApi = {
  async get(id: string): Promise<RemoteVault> {
    const { data } = await request('GET', id)
    return { blob: typeof data.blob === 'string' ? data.blob : null, updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : null }
  },
  async put(id: string, blob: string, baseUpdatedAt: number | null): Promise<PutResult> {
    const { status, data } = await request('PUT', id, { blob, baseUpdatedAt })
    if (status === 409) return { conflict: true, blob: String(data.blob), updatedAt: Number(data.updatedAt) }
    return { conflict: false, updatedAt: Number(data.updatedAt) }
  },
  async remove(id: string): Promise<void> {
    await request('DELETE', id)
  },
}
