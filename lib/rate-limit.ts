// Best-effort, in-memory sliding-window rate limiter. Keyed by an opaque string
// (we pass a hashed IP so raw IPs are never held). State is module-level and
// per-process: on serverless it resets on cold starts and is not shared across
// instances, so it only blunts rapid-fire bursts. The durable guarantees
// (one-note-per-IP) live elsewhere. Fine for a low-traffic site.

export interface RateLimitResult {
  ok: boolean
  retryAfterSec: number
}

interface RateLimitOptions {
  limit: number
  windowMs: number
}

const hits = new Map<string, number[]>()

// Opportunistic cleanup so the map can't grow unbounded over a long uptime.
// Runs on every call (including blocked ones) so a flood of distinct blocked
// keys can't starve the sweep.
function maybeCleanup(windowStart: number) {
  if (hits.size <= 5000) return
  for (const [k, v] of hits) {
    if (v.length === 0 || v[v.length - 1] <= windowStart) hits.delete(k)
  }
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowStart = now - opts.windowMs
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart)
  maybeCleanup(windowStart)

  if (recent.length >= opts.limit) {
    hits.set(key, recent)
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + opts.windowMs - now) / 1000))
    return { ok: false, retryAfterSec }
  }

  recent.push(now)
  hits.set(key, recent)
  return { ok: true, retryAfterSec: 0 }
}
