import { describe, it, expect } from 'vitest'
import { rateLimit } from './rate-limit'

describe('rateLimit', () => {
  it('allows requests up to the limit', () => {
    const key = `k-allow-${Math.random()}`
    expect(rateLimit(key, { limit: 3, windowMs: 1000 }).ok).toBe(true)
    expect(rateLimit(key, { limit: 3, windowMs: 1000 }).ok).toBe(true)
    expect(rateLimit(key, { limit: 3, windowMs: 1000 }).ok).toBe(true)
  })

  it('blocks the request that exceeds the limit and reports retryAfterSec', () => {
    const key = `k-block-${Math.random()}`
    rateLimit(key, { limit: 2, windowMs: 1000 })
    rateLimit(key, { limit: 2, windowMs: 1000 })
    const res = rateLimit(key, { limit: 2, windowMs: 1000 })
    expect(res.ok).toBe(false)
    expect(res.retryAfterSec).toBeGreaterThanOrEqual(1)
    expect(res.retryAfterSec).toBeLessThanOrEqual(1)
  })

  it('resets after the window elapses', async () => {
    const key = `k-reset-${Math.random()}`
    rateLimit(key, { limit: 1, windowMs: 30 })
    expect(rateLimit(key, { limit: 1, windowMs: 30 }).ok).toBe(false)
    await new Promise((r) => setTimeout(r, 45))
    expect(rateLimit(key, { limit: 1, windowMs: 30 }).ok).toBe(true)
  })

  it('keeps separate counters per key', () => {
    const a = `k-a-${Math.random()}`
    const b = `k-b-${Math.random()}`
    rateLimit(a, { limit: 1, windowMs: 1000 })
    expect(rateLimit(a, { limit: 1, windowMs: 1000 }).ok).toBe(false)
    expect(rateLimit(b, { limit: 1, windowMs: 1000 }).ok).toBe(true)
  })
})
