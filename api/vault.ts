/**
 * Vercel serverless function: the encrypted quiz vault.
 *
 * The browser derives a vault id and an AES key from the user's passphrase and only
 * ever sends ciphertext here, which is stored in Upstash Redis keyed by the id. The
 * server cannot read quizzes, and there are no accounts — knowing the passphrase is
 * the credential.
 *
 *   GET    /api/vault?id=<64 hex>   → { blob: string | null, updatedAt: number | null }
 *   PUT    /api/vault?id=<64 hex>   body { blob, baseUpdatedAt } → { updatedAt }
 *                                    409 { conflict: true, blob, updatedAt } if the vault changed since baseUpdatedAt
 *   DELETE /api/vault?id=<64 hex>   → { ok: true }
 *
 * Env: KV_REST_API_URL + KV_REST_API_TOKEN (Upstash Redis via the Vercel Marketplace),
 * or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. Optional VAULT_RATE_LIMIT.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

const ID_RE = /^[0-9a-f]{64}$/
/** Upstash's free tier caps a request at 1 MB; leave headroom for JSON framing. */
const MAX_BLOB = 900_000
/** A vault nobody has touched for a year expires. Every read/write renews it. */
const TTL_SECONDS = 60 * 60 * 24 * 365
const RATE_LIMIT = Number(process.env.VAULT_RATE_LIMIT) || 60

interface StoredVault {
  blob: string
  updatedAt: number
}

interface RedisConfig {
  url: string
  token: string
}

function redisConfig(): RedisConfig | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

/** Run commands through the Upstash REST pipeline endpoint; returns one result per command. */
async function redis(cfg: RedisConfig, commands: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!res.ok) throw new Error(`Redis responded ${res.status}`)
  const out = (await res.json()) as { result?: unknown; error?: string }[]
  const failed = out.find((r) => r.error)
  if (failed) throw new Error(failed.error)
  return out.map((r) => r.result)
}

function fail(res: VercelResponse, status: number, error: string) {
  return res.status(status).json({ error })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const cfg = redisConfig()
  if (!cfg) return fail(res, 503, 'Vault storage is not configured on the server yet')

  const id = String(req.query.id ?? '')
  if (!ID_RE.test(id)) return fail(res, 400, 'Invalid vault id')

  const ip = (String(req.headers['x-forwarded-for'] ?? '').split(',')[0] || 'unknown').trim()
  const key = `vault:${id}`

  try {
    // Per-IP rate limit so passphrases cannot be guessed by hammering GET.
    const minute = Math.floor(Date.now() / 60_000)
    const rlKey = `rl:${ip}:${minute}`
    const [count] = await redis(cfg, [['INCR', rlKey], ['EXPIRE', rlKey, 120]])
    if (Number(count) > RATE_LIMIT) return fail(res, 429, 'Too many requests — try again in a minute')

    if (req.method === 'GET') {
      const [raw] = await redis(cfg, [['GET', key]])
      if (!raw) return res.status(200).json({ blob: null, updatedAt: null })
      const stored = JSON.parse(String(raw)) as StoredVault
      await redis(cfg, [['EXPIRE', key, TTL_SECONDS]])
      return res.status(200).json(stored)
    }

    if (req.method === 'PUT') {
      const body = (typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})) as { blob?: unknown; baseUpdatedAt?: unknown }
      const blob = typeof body.blob === 'string' ? body.blob : ''
      if (!blob.startsWith('v1.')) return fail(res, 400, 'Invalid vault payload')
      if (blob.length > MAX_BLOB) return fail(res, 413, 'Vault is too large (limit ~900 KB) — use image URLs instead of uploads')

      const [raw] = await redis(cfg, [['GET', key]])
      const current = raw ? (JSON.parse(String(raw)) as StoredVault) : null
      const base = body.baseUpdatedAt == null ? null : Number(body.baseUpdatedAt)
      // Optimistic concurrency: the client must have seen the latest version before overwriting it.
      if (current && current.updatedAt !== base) return res.status(409).json({ conflict: true, ...current })

      const stored: StoredVault = { blob, updatedAt: Date.now() }
      await redis(cfg, [['SET', key, JSON.stringify(stored), 'EX', TTL_SECONDS]])
      return res.status(200).json({ updatedAt: stored.updatedAt })
    }

    if (req.method === 'DELETE') {
      await redis(cfg, [['DEL', key]])
      return res.status(200).json({ ok: true })
    }

    return fail(res, 405, 'Method not allowed')
  } catch (err) {
    console.error('vault error', err)
    return fail(res, 502, 'Vault storage error')
  }
}
