/**
 * Deployment self-check: which optional services this deployment can see.
 * Reports presence and variable *names* only — never values — so it is safe to expose.
 *
 *   GET /api/health → { ok, env, commit, region, node, features: { vault }, customEnv: string[] }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Platform-injected prefixes; anything else is a variable someone configured for this project. */
const PLATFORM = /^(VERCEL|AWS|TURBO|NX|NEXT|NODE|CI$|PATH$|HOME$|LANG|PWD$|SHLVL|TZ$|LAMBDA|_HANDLER|TMPDIR|LD_|SHELL$|USER$|LOGNAME|HOSTNAME|TERM|OLDPWD|PYTHONPATH|DEBIAN)/

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const keys = Object.keys(process.env)
  return res.status(200).json({
    ok: true,
    env: process.env.VERCEL_ENV ?? 'local',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    region: process.env.VERCEL_REGION ?? null,
    node: process.version,
    features: {
      vault: Boolean((process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) && (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)),
    },
    // Value lengths only: enough to tell "set" from "present but empty" without exposing anything.
    customEnv: Object.fromEntries(
      keys
        .filter((k) => !PLATFORM.test(k))
        .sort()
        .map((k) => [k, (process.env[k] ?? '').length]),
    ),
    encryptedEnvBundle: Boolean(process.env.VERCEL_ENCRYPTED_ENV_CONTENT),
    totalEnvKeys: keys.length,
  })
}
