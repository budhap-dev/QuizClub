/**
 * Deployment self-check: which optional services this deployment can see.
 * Reports presence only — never values — so it is safe to expose.
 *
 *   GET /api/health → { ok, env, commit, region, features: { ai, vault } }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({
    ok: true,
    env: process.env.VERCEL_ENV ?? 'local',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    region: process.env.VERCEL_REGION ?? null,
    features: {
      ai: Boolean(process.env.ANTHROPIC_API_KEY),
      vault: Boolean((process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) && (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)),
    },
  })
}
