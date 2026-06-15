# Sanity → GitHub Discussions Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Projects, Experience, and Publications off Sanity / hard-coded arrays onto GitHub Discussions, and add in-memory rate-limiting to the guestbook — commenting out (not deleting) the Sanity code.

**Architecture:** Three read-only sources backed by the private `jacklvd/storybook-db` repo. Projects = one discussion per item in "Show and tell" (existing). Experience and Publications = one parent discussion each in "General", with one comment per item, parsed from a trailing `exp:{...}` / `pub:{...}` HTML-comment metadata block (the same technique the guestbook uses with `gb:`). A committed, idempotent migration script seeds GitHub from the current Sanity/hard-coded data via GitHub GraphQL. Each Next.js API route reads server-side with the shared `GH_ACCESS_TOKEN`; components fetch the routes client-side.

**Tech Stack:** Next.js (App Router, `nodejs` runtime), TypeScript (ESM), GitHub GraphQL API, vitest (added for unit tests), zod (existing).

---

## File Structure

**Created:**
- `vitest.config.ts` — test runner config (node env).
- `lib/rate-limit.ts` — in-memory sliding-window limiter.
- `lib/rate-limit.test.ts` — limiter unit tests.
- `lib/experience/client.ts` — experience source config (reuses guestbook creds).
- `lib/experience/gql.ts` — GraphQL query for the experience discussion's comments.
- `lib/experience/index.ts` — fetch + parse `exp:{...}` → `Experience[]`; exports `parseExpComment`.
- `lib/experience/index.test.ts` — parser unit tests.
- `app/api/experience/route.ts` — GET experiences.
- `lib/publications/client.ts` — publications source config.
- `lib/publications/gql.ts` — GraphQL query for the publications discussion's comments.
- `lib/publications/index.ts` — fetch + parse `pub:{...}` → `Publication[]`; exports `parsePubComment`.
- `lib/publications/index.test.ts` — parser unit tests.
- `app/api/publications/route.ts` — GET publications.
- `lib/projects/index.test.ts` — tests for the new `order` parsing.
- `scripts/migrate-to-discussions.ts` — one-time idempotent seeding script.

**Modified:**
- `package.json` — add `vitest` devDep + `test` script.
- `lib/projects/index.ts` — parse `order`, expose it on `GithubProject`.
- `app/api/guestbook/route.ts` — apply rate limiting.
- `app/meet-jack/components/projects.tsx` — comment out Sanity; GitHub-only; sort by `order`.
- `app/meet-jack/components/experience.tsx` — comment out Sanity; fetch `/api/experience`.
- `app/meet-jack/components/publications.tsx` — comment out hard-coded array; fetch `/api/publications`.
- `.env` — add `EXPERIENCE_DISCUSSION_NUMBER/ID`, `PUBLICATIONS_DISCUSSION_NUMBER/ID`.

---

## Task 1: Test infrastructure (vitest)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `lib/rate-limit.test.ts` (smoke test placeholder, replaced in Task 2)

- [ ] **Step 1: Install vitest**

Run: `npm install -D vitest`
Expected: vitest added to devDependencies, install succeeds.

- [ ] **Step 2: Add the test script to package.json**

In `package.json`, add to `"scripts"`:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Create a smoke test to prove the runner works**

Create `lib/rate-limit.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run the test suite**

Run: `npm test`
Expected: PASS — 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/rate-limit.test.ts
git commit -m "test: add vitest runner"
```

---

## Task 2: Rate limiter

**Files:**
- Create: `lib/rate-limit.ts`
- Test: `lib/rate-limit.test.ts` (replace the smoke test)

- [ ] **Step 1: Write the failing tests**

Replace the contents of `lib/rate-limit.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `./rate-limit` / `rateLimit is not a function`.

- [ ] **Step 3: Implement the limiter**

Create `lib/rate-limit.ts`:

```ts
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

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowStart = now - opts.windowMs
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart)

  if (recent.length >= opts.limit) {
    hits.set(key, recent)
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + opts.windowMs - now) / 1000))
    return { ok: false, retryAfterSec }
  }

  recent.push(now)
  hits.set(key, recent)

  // Opportunistic cleanup so the map can't grow unbounded over a long uptime.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.length === 0 || v[v.length - 1] <= windowStart) hits.delete(k)
    }
  }

  return { ok: true, retryAfterSec: 0 }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all 4 rateLimit tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/rate-limit.ts lib/rate-limit.test.ts
git commit -m "feat: add in-memory sliding-window rate limiter"
```

---

## Task 3: Apply rate limiting to the guestbook route

**Files:**
- Modify: `app/api/guestbook/route.ts`

No new unit test (route-level; verified by build + manual check in Task 14). This task wires the limiter from Task 2 into the existing route.

- [ ] **Step 1: Import the limiter**

In `app/api/guestbook/route.ts`, add to the import block (after the `getNotes` import on line 9):

```ts
import { rateLimit } from '@/lib/rate-limit'
```

- [ ] **Step 2: Add a 429 helper and rate-limit the GET handler**

Replace the existing `export async function GET() {` block (currently lines 56-67) with:

```ts
function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { error: 'Slow down a moment, then try again. 💛' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
  )
}

export async function GET(req: Request) {
  const gate = rateLimit(`gb-get:${hashIp(getClientIp(req))}`, { limit: 30, windowMs: 60_000 })
  if (!gate.ok) return tooMany(gate.retryAfterSec)

  if (!isGuestbookConfigured) {
    return NextResponse.json({ notes: DEMO_NOTES, demo: true })
  }
  try {
    const notes = await getNotes()
    return NextResponse.json({ notes })
  } catch (err) {
    console.error('guestbook GET failed:', err)
    return NextResponse.json({ error: 'Could not load the guestbook.' }, { status: 502 })
  }
}
```

(Note: `hashIp` and `getClientIp` are already imported / defined in this file.)

- [ ] **Step 3: Rate-limit the POST handler**

In `export async function POST(req: Request)`, immediately after the opening line `export async function POST(req: Request) {`, insert:

```ts
  const postGate = rateLimit(`gb-post:${hashIp(getClientIp(req))}`, { limit: 5, windowMs: 600_000 })
  if (!postGate.ok) return tooMany(postGate.retryAfterSec)

```

- [ ] **Step 4: Verify the project still type-checks / builds**

Run: `npx tsc --noEmit`
Expected: PASS — no type errors.

- [ ] **Step 5: Commit**

```bash
git add app/api/guestbook/route.ts
git commit -m "feat: rate-limit guestbook GET (30/min) and POST (5/10min)"
```

---

## Task 4: Experience source library

**Files:**
- Create: `lib/experience/client.ts`
- Create: `lib/experience/gql.ts`
- Create: `lib/experience/index.ts`
- Test: `lib/experience/index.test.ts`

- [ ] **Step 1: Write the failing parser test**

Create `lib/experience/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseExpComment } from './index'

describe('parseExpComment', () => {
  it('parses a well-formed exp metadata block', () => {
    const body = [
      '**Software Engineer Intern — Shopify Inc** (June, 2026 - August, 2026)',
      '',
      '- Currently work in Banking Security team!',
      '',
      '<!-- exp:{"id":1,"position":"Software Engineer Intern","company":"Shopify Inc","date":"June, 2026 - August, 2026","url":"https://www.shopify.com/","description":["Currently work in Banking Security team!"]} -->',
    ].join('\n')
    const exp = parseExpComment(body, 'C_node1')
    expect(exp).not.toBeNull()
    expect(exp!._id).toBe('C_node1')
    expect(exp!.id).toBe(1)
    expect(exp!.company).toBe('Shopify Inc')
    expect(exp!.description).toEqual(['Currently work in Banking Security team!'])
  })

  it('returns null when there is no exp block', () => {
    expect(parseExpComment('just a normal comment', 'C_x')).toBeNull()
  })

  it('returns null when required fields are missing', () => {
    const body = '<!-- exp:{"id":2,"company":"X"} -->'
    expect(parseExpComment(body, 'C_y')).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./index` / `parseExpComment is not a function`.

- [ ] **Step 3: Create the config module**

Create `lib/experience/client.ts`:

```ts
// Server-only config for the Experience source. Experience entries are stored
// as comments on ONE GitHub Discussion (the "Experience" discussion) in the same
// private repo as the guestbook/projects. Reuses the shared GitHub credentials;
// the token is read server-side only and never shipped to the browser.

export {
  GH_API_URL,
  GH_ACCESS_TOKEN,
  GUESTBOOK_REPO_OWNER as EXPERIENCE_REPO_OWNER,
  GUESTBOOK_REPO_NAME as EXPERIENCE_REPO_NAME,
} from '@/lib/guestbook/client'

import {
  GH_ACCESS_TOKEN,
  GUESTBOOK_REPO_OWNER,
  GUESTBOOK_REPO_NAME,
} from '@/lib/guestbook/client'

// The discussion whose comments hold the experience entries (number for reads,
// node id reserved for future writes).
export const EXPERIENCE_DISCUSSION_NUMBER = process.env.EXPERIENCE_DISCUSSION_NUMBER
export const EXPERIENCE_DISCUSSION_ID = process.env.EXPERIENCE_DISCUSSION_ID

export const isExperienceSourceConfigured = Boolean(
  GH_ACCESS_TOKEN &&
    GUESTBOOK_REPO_OWNER &&
    GUESTBOOK_REPO_NAME &&
    EXPERIENCE_DISCUSSION_NUMBER,
)
```

- [ ] **Step 4: Create the GraphQL query**

Create `lib/experience/gql.ts`:

```ts
import {
  EXPERIENCE_REPO_OWNER,
  EXPERIENCE_REPO_NAME,
  EXPERIENCE_DISCUSSION_NUMBER,
} from './client'

// Reads the comments on the Experience discussion. `body` carries the embedded
// exp:{...} metadata; `id` becomes the React key; minimized comments are hidden.
export function experienceQuery() {
  return `{
    repository(owner: "${EXPERIENCE_REPO_OWNER}", name: "${EXPERIENCE_REPO_NAME}") {
      discussion(number: ${EXPERIENCE_DISCUSSION_NUMBER}) {
        comments(first: 100) {
          nodes {
            id
            body
            isMinimized
          }
        }
      }
    }
  }`
}
```

- [ ] **Step 5: Create the fetch + parser module**

Create `lib/experience/index.ts`:

```ts
import { GH_API_URL, GH_ACCESS_TOKEN } from './client'
import { experienceQuery } from './gql'

// Shape consumed by the Experience UI.
export interface Experience {
  _id: string
  id: number
  position: string
  company: string
  date: string
  url: string
  description: string[]
}

// Pull the exp:{...} JSON out of a comment body. `_id` is the comment node id
// (used as the React key). Returns null for foreign/malformed comments.
export function parseExpComment(body: string, nodeId: string): Experience | null {
  const match = body.match(/<!--\s*exp:(\{[\s\S]*?\})\s*-->/)
  if (!match) return null
  try {
    const d = JSON.parse(match[1])
    if (!d?.position || !d?.company) return null
    return {
      _id: nodeId,
      id: typeof d.id === 'number' ? d.id : 0,
      position: String(d.position),
      company: String(d.company),
      date: String(d.date ?? ''),
      url: String(d.url ?? ''),
      description: Array.isArray(d.description) ? d.description.map(String) : [],
    }
  } catch {
    return null
  }
}

interface ExperienceResponse {
  repository: {
    discussion: {
      comments: { nodes: { id: string; body: string; isMinimized: boolean }[] }
    } | null
  }
}

// All experience entries, ordered by their numeric `id` ascending.
export async function getExperiences(): Promise<Experience[]> {
  const res = await fetch(GH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${GH_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: experienceQuery() }),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '))
  }
  const nodes = (json.data as ExperienceResponse).repository.discussion?.comments.nodes ?? []
  return nodes
    .filter((n) => !n.isMinimized)
    .map((n) => parseExpComment(n.body, n.id))
    .filter((e): e is Experience => e !== null)
    .sort((a, b) => a.id - b.id)
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all parseExpComment tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/experience/
git commit -m "feat: add Experience GitHub Discussions source"
```

---

## Task 5: Experience API route

**Files:**
- Create: `app/api/experience/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/experience/route.ts`:

```ts
import { NextResponse } from 'next/server'

import { isExperienceSourceConfigured } from '@/lib/experience/client'
import { getExperiences } from '@/lib/experience'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Experience entries sourced from GitHub Discussions (comments on the Experience
// discussion). Returns an empty list when unconfigured or on error so the UI
// degrades gracefully instead of crashing.
export async function GET() {
  if (!isExperienceSourceConfigured) {
    return NextResponse.json({ experiences: [] })
  }
  try {
    const experiences = await getExperiences()
    return NextResponse.json({ experiences })
  } catch (err) {
    console.error('experience GET failed:', err)
    return NextResponse.json({ experiences: [] })
  }
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: PASS — no type errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/experience/route.ts
git commit -m "feat: add /api/experience route"
```

---

## Task 6: Publications source library

**Files:**
- Create: `lib/publications/client.ts`
- Create: `lib/publications/gql.ts`
- Create: `lib/publications/index.ts`
- Test: `lib/publications/index.test.ts`

Note: the publication title is stored **inside** the `pub:{...}` block (not parsed from markdown) for robustness.

- [ ] **Step 1: Write the failing parser test**

Create `lib/publications/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parsePubComment } from './index'

describe('parsePubComment', () => {
  it('parses a well-formed pub metadata block', () => {
    const body = [
      '**Medical Spoken Named Entity Recognition** (2024)',
      '',
      'Spoken NER aims to extract named entities from speech.',
      '',
      '<!-- pub:{"title":"Medical Spoken Named Entity Recognition","authors":"Co-author — Jack Vo","year":"2024","url":"https://arxiv.org/abs/2406.13337","abstract":"Spoken NER aims to extract named entities from speech."} -->',
    ].join('\n')
    const pub = parsePubComment(body)
    expect(pub).not.toBeNull()
    expect(pub!.title).toBe('Medical Spoken Named Entity Recognition')
    expect(pub!.year).toBe('2024')
    expect(pub!.url).toBe('https://arxiv.org/abs/2406.13337')
    expect(pub!.abstract).toContain('Spoken NER')
  })

  it('returns null when there is no pub block', () => {
    expect(parsePubComment('just a normal comment')).toBeNull()
  })

  it('returns null when title or url is missing', () => {
    expect(parsePubComment('<!-- pub:{"year":"2024"} -->')).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./index` / `parsePubComment is not a function`.

- [ ] **Step 3: Create the config module**

Create `lib/publications/client.ts`:

```ts
// Server-only config for the Publications source. Publications are stored as
// comments on ONE GitHub Discussion (the "Publications" discussion) in the same
// private repo. Reuses the shared GitHub credentials (token server-side only).

export {
  GH_API_URL,
  GH_ACCESS_TOKEN,
  GUESTBOOK_REPO_OWNER as PUBLICATIONS_REPO_OWNER,
  GUESTBOOK_REPO_NAME as PUBLICATIONS_REPO_NAME,
} from '@/lib/guestbook/client'

import {
  GH_ACCESS_TOKEN,
  GUESTBOOK_REPO_OWNER,
  GUESTBOOK_REPO_NAME,
} from '@/lib/guestbook/client'

export const PUBLICATIONS_DISCUSSION_NUMBER = process.env.PUBLICATIONS_DISCUSSION_NUMBER
export const PUBLICATIONS_DISCUSSION_ID = process.env.PUBLICATIONS_DISCUSSION_ID

export const isPublicationsSourceConfigured = Boolean(
  GH_ACCESS_TOKEN &&
    GUESTBOOK_REPO_OWNER &&
    GUESTBOOK_REPO_NAME &&
    PUBLICATIONS_DISCUSSION_NUMBER,
)
```

- [ ] **Step 4: Create the GraphQL query**

Create `lib/publications/gql.ts`:

```ts
import {
  PUBLICATIONS_REPO_OWNER,
  PUBLICATIONS_REPO_NAME,
  PUBLICATIONS_DISCUSSION_NUMBER,
} from './client'

// Reads the comments on the Publications discussion. `createdAt` is used to keep
// a stable order; `body` carries the embedded pub:{...} metadata.
export function publicationsQuery() {
  return `{
    repository(owner: "${PUBLICATIONS_REPO_OWNER}", name: "${PUBLICATIONS_REPO_NAME}") {
      discussion(number: ${PUBLICATIONS_DISCUSSION_NUMBER}) {
        comments(first: 100) {
          nodes {
            body
            createdAt
            isMinimized
          }
        }
      }
    }
  }`
}
```

- [ ] **Step 5: Create the fetch + parser module**

Create `lib/publications/index.ts`:

```ts
import { GH_API_URL, GH_ACCESS_TOKEN } from './client'
import { publicationsQuery } from './gql'

// Shape consumed by the Publications UI.
export interface Publication {
  title: string
  authors: string
  year: string
  url: string
  abstract?: string
}

// Pull the pub:{...} JSON out of a comment body. Returns null for
// foreign/malformed comments (must have at least a title and url).
export function parsePubComment(body: string): Publication | null {
  const match = body.match(/<!--\s*pub:(\{[\s\S]*?\})\s*-->/)
  if (!match) return null
  try {
    const d = JSON.parse(match[1])
    if (!d?.title || !d?.url) return null
    return {
      title: String(d.title),
      authors: String(d.authors ?? ''),
      year: String(d.year ?? ''),
      url: String(d.url),
      abstract: d.abstract ? String(d.abstract) : undefined,
    }
  } catch {
    return null
  }
}

interface PublicationsResponse {
  repository: {
    discussion: {
      comments: { nodes: { body: string; createdAt: string; isMinimized: boolean }[] }
    } | null
  }
}

// All publications, newest comment first (stable insertion order).
export async function getPublications(): Promise<Publication[]> {
  const res = await fetch(GH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${GH_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: publicationsQuery() }),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '))
  }
  const nodes = (json.data as PublicationsResponse).repository.discussion?.comments.nodes ?? []
  return nodes
    .filter((n) => !n.isMinimized)
    .map((n) => parsePubComment(n.body))
    .filter((p): p is Publication => p !== null)
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all parsePubComment tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/publications/
git commit -m "feat: add Publications GitHub Discussions source"
```

---

## Task 7: Publications API route

**Files:**
- Create: `app/api/publications/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/publications/route.ts`:

```ts
import { NextResponse } from 'next/server'

import { isPublicationsSourceConfigured } from '@/lib/publications/client'
import { getPublications } from '@/lib/publications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Publications sourced from GitHub Discussions (comments on the Publications
// discussion). Empty list when unconfigured or on error.
export async function GET() {
  if (!isPublicationsSourceConfigured) {
    return NextResponse.json({ publications: [] })
  }
  try {
    const publications = await getPublications()
    return NextResponse.json({ publications })
  } catch (err) {
    console.error('publications GET failed:', err)
    return NextResponse.json({ publications: [] })
  }
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: PASS — no type errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/publications/route.ts
git commit -m "feat: add /api/publications route"
```

---

## Task 8: Add `order` to the projects source

**Files:**
- Modify: `lib/projects/index.ts`
- Test: `lib/projects/index.test.ts`

The `GithubProject` interface and `getGithubProjects` already exist. We add an `order` field parsed from the `proj:{...}` block and sort by it. `parseMeta` already reads the block — we surface `order` on the returned object.

- [ ] **Step 1: Write a failing test for order parsing/sorting**

Create `lib/projects/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { sortByOrder, type GithubProject } from './index'

function mk(title: string, order?: number): GithubProject {
  return {
    _id: `gh-${title}`,
    title,
    description: '',
    technologies: [],
    source: 'https://github.com/x/y',
    image: '',
    featured: false,
    order: order ?? Number.MAX_SAFE_INTEGER,
  }
}

describe('sortByOrder', () => {
  it('sorts ascending by order, undefined-order items last', () => {
    const out = sortByOrder([mk('c', 3), mk('a', 1), mk('z'), mk('b', 2)])
    expect(out.map((p) => p.title)).toEqual(['a', 'b', 'c', 'z'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `sortByOrder` is not exported / `order` not on `GithubProject`.

- [ ] **Step 3: Add `order` to the interface and meta type**

In `lib/projects/index.ts`, in `interface GithubProject` add (after `featured: boolean`):

```ts
  order: number
```

In `interface ProjectMeta` add (after `featured?: boolean`):

```ts
  order?: number
```

- [ ] **Step 4: Populate `order` and export a sort helper**

In `lib/projects/index.ts`, inside the `return { ... }` object built in `getGithubProjects` (after `featured: Boolean(meta.featured),`), add:

```ts
        order: typeof meta.order === 'number' ? meta.order : Number.MAX_SAFE_INTEGER,
```

Then change the final `return nodes.map(...).filter(...)` chain so it sorts before returning. Replace the closing of `getGithubProjects` — i.e. the `.filter((p): p is GithubProject => p !== null)` line — with:

```ts
    .filter((p): p is GithubProject => p !== null)
    .sort((a, b) => a.order - b.order)
}

// Stable ascending sort by `order`; items without an explicit order sort last.
export function sortByOrder(projects: GithubProject[]): GithubProject[] {
  return [...projects].sort((a, b) => a.order - b.order)
}
```

(The `getGithubProjects` function body now ends with the sorted return; `sortByOrder` is a separately-exported helper used by the test and reusable by the UI.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — sortByOrder test passes, all prior tests still pass.

- [ ] **Step 6: Commit**

```bash
git add lib/projects/index.ts lib/projects/index.test.ts
git commit -m "feat: parse and sort projects by order"
```

---

## Task 9: Migration script

**Files:**
- Create: `scripts/migrate-to-discussions.ts`

This script is run manually in Task 10. It is committed for reproducibility. It loads `.env` itself (no dotenv dependency), reads Sanity + the hard-coded publications, and seeds GitHub via GraphQL. Idempotent.

- [ ] **Step 1: Create the script**

Create `scripts/migrate-to-discussions.ts`:

```ts
/**
 * One-time, idempotent migration: seeds GitHub Discussions from the current
 * Sanity data (projects + experience) and the hard-coded publications list.
 *
 * Run:  npx -y tsx scripts/migrate-to-discussions.ts
 *
 * Safe to re-run: existing project discussions (matched by title) and existing
 * experience/publication comments (matched by exp.id / pub.url) are skipped.
 * Prints the Experience/Publications discussion numbers + node ids to paste
 * into .env afterwards.
 */
import { readFileSync } from 'fs'

// --- tiny .env loader (no dependency) ---------------------------------------
function loadEnv() {
  let raw = ''
  try {
    raw = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  } catch {
    return
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}
loadEnv()

const TOKEN = process.env.GH_ACCESS_TOKEN
const REPO_OWNER = process.env.GUESTBOOK_REPO_OWNER
const REPO_NAME = process.env.GUESTBOOK_REPO_NAME
const PROJECTS_CATEGORY_ID = process.env.PROJECTS_CATEGORY_ID ?? 'DIC_kwDOSzzhEc4C-tbO'
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID
const SANITY_DATASET = process.env.SANITY_DATASET

if (!TOKEN || !REPO_OWNER || !REPO_NAME) {
  throw new Error('Missing GH_ACCESS_TOKEN / GUESTBOOK_REPO_OWNER / GUESTBOOK_REPO_NAME in .env')
}
if (!SANITY_PROJECT_ID || !SANITY_DATASET) {
  throw new Error('Missing SANITY_PROJECT_ID / SANITY_DATASET in .env')
}

const GH_API = process.env.GH_API_URL ?? 'https://api.github.com/graphql'

async function gh<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(GH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `token ${TOKEN}` },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data as T
}

// --- Sanity reads -----------------------------------------------------------
async function sanityQuery<T>(groq: string): Promise<T> {
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v2024-05-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.error) throw new Error(JSON.stringify(json.error))
  return json.result as T
}

interface SanityWork {
  title: string
  description: string
  technologies: string[]
  source: string
  demo: string | null
  img: string | null
}
interface SanityExp {
  id: number
  position: string
  company: string
  date: string
  url: string
  description: string[]
}

// Publications are currently hard-coded in publications.tsx — mirrored here.
const PUBLICATIONS = [
  {
    title: 'Real-time Speech Summarization for Medical Conversations',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.15888',
    abstract:
      'In doctor-patient conversations, identifying medically relevant information is crucial, posing the need for conversation summarization. We propose the first deployable real-time speech summarization system for real-world applications in industry, generating a local summary after every N speech utterances and a global summary at the end of a conversation.',
  },
  {
    title: 'Medical Spoken Named Entity Recognition',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.13337',
    abstract:
      'Spoken Named Entity Recognition (NER) aims to extract named entities from speech and categorize them into types like person, location, organization, etc. We present VietMed-NER — the first spoken NER dataset in the medical domain.',
  },
  {
    title: 'Sentiment Reasoning for Healthcare',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2407.21054',
    abstract:
      'Transparency in AI healthcare decision-making is crucial for building trust. Incorporating reasoning capabilities enables Large Language Models to understand emotions in context, handle nuanced language, and infer unstated sentiments.',
  },
]

// --- repo lookup ------------------------------------------------------------
interface RepoInfo {
  repository: {
    id: string
    discussionCategories: { nodes: { id: string; name: string }[] }
    discussions: { nodes: { number: number; id: string; title: string }[] }
  }
}

async function getRepoInfo(): Promise<RepoInfo['repository']> {
  const data = await gh<RepoInfo>(`{
    repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
      id
      discussionCategories(first: 25) { nodes { id name } }
      discussions(first: 100) { nodes { number id title } }
    }
  }`)
  return data.repository
}

async function getCommentBodies(discussionNumber: number): Promise<string[]> {
  const data = await gh<{
    repository: { discussion: { comments: { nodes: { body: string }[] } } | null }
  }>(`{
    repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
      discussion(number: ${discussionNumber}) { comments(first: 100) { nodes { body } } }
    }
  }`)
  return data.repository.discussion?.comments.nodes.map((n) => n.body) ?? []
}

const CREATE_DISCUSSION = `
  mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }) {
      discussion { number id }
    }
  }`

const ADD_COMMENT = `
  mutation($discussionId: ID!, $body: String!) {
    addDiscussionComment(input: { discussionId: $discussionId, body: $body }) { comment { id } }
  }`

async function main() {
  const repo = await getRepoInfo()
  const categories = repo.discussionCategories.nodes
  const generalCat = categories.find((c) => c.name === 'General')
  if (!generalCat) throw new Error(`No "General" category. Found: ${categories.map((c) => c.name).join(', ')}`)

  // ---- Projects: one discussion per work, in "Show and tell" --------------
  const works = await sanityQuery<SanityWork[]>(
    '*[_type=="work"]|order(orderRank){title,description,technologies,source,demo,"img":image.asset->url}',
  )
  const existingTitles = new Set(repo.discussions.nodes.map((d) => d.title))
  let projOrder = 1
  for (const w of works) {
    const featured = projOrder <= 4
    const meta = {
      technologies: w.technologies ?? [],
      source: w.source,
      demo: w.demo ?? null,
      image: w.img ?? null,
      featured,
      order: projOrder,
    }
    if (existingTitles.has(w.title)) {
      console.log(`SKIP project (exists): ${w.title}`)
    } else {
      const body = `${w.description}\n\n<!-- proj:${JSON.stringify(meta)} -->`
      await gh(CREATE_DISCUSSION, {
        repositoryId: repo.id,
        categoryId: PROJECTS_CATEGORY_ID,
        title: w.title,
        body,
      })
      console.log(`CREATED project: ${w.title} (order ${projOrder}, featured ${featured})`)
    }
    projOrder++
  }

  // ---- helper: ensure a parent discussion exists in General ---------------
  async function ensureParent(title: string, intro: string) {
    const existing = repo.discussions.nodes.find((d) => d.title === title)
    if (existing) {
      console.log(`Parent exists: ${title} (#${existing.number})`)
      return existing
    }
    const data = await gh<{ createDiscussion: { discussion: { number: number; id: string } } }>(
      CREATE_DISCUSSION,
      { repositoryId: repo.id, categoryId: generalCat!.id, title, body: intro },
    )
    const d = data.createDiscussion.discussion
    console.log(`CREATED parent: ${title} (#${d.number})`)
    return d
  }

  // ---- Experience: one comment per job ------------------------------------
  const exps = await sanityQuery<SanityExp[]>(
    '*[_type=="experience"]|order(id){id,position,company,date,url,description}',
  )
  const expParent = await ensureParent(
    'Experience',
    'Work experience entries. Each comment is one role; edit the `exp:{...}` block to update the site.',
  )
  const expBodies = await getCommentBodies(expParent.number)
  for (const e of exps) {
    if (expBodies.some((b) => b.includes(`"id":${e.id}`) && b.includes('exp:'))) {
      console.log(`SKIP experience (exists): ${e.company} #${e.id}`)
      continue
    }
    const meta = {
      id: e.id,
      position: e.position,
      company: e.company,
      date: e.date,
      url: e.url,
      description: e.description ?? [],
    }
    const bullets = (e.description ?? []).map((d) => `- ${d}`).join('\n')
    const body = `**${e.position} — ${e.company}** (${e.date})\n\n${bullets}\n\n<!-- exp:${JSON.stringify(meta)} -->`
    await gh(ADD_COMMENT, { discussionId: expParent.id, body })
    console.log(`ADDED experience: ${e.company} #${e.id}`)
  }

  // ---- Publications: one comment per paper --------------------------------
  const pubParent = await ensureParent(
    'Publications',
    'Publication entries. Each comment is one paper; edit the `pub:{...}` block to update the site.',
  )
  const pubBodies = await getCommentBodies(pubParent.number)
  for (const p of PUBLICATIONS) {
    if (pubBodies.some((b) => b.includes(p.url) && b.includes('pub:'))) {
      console.log(`SKIP publication (exists): ${p.title}`)
      continue
    }
    const body = `**${p.title}** (${p.year})\n\n${p.abstract}\n\n<!-- pub:${JSON.stringify(p)} -->`
    await gh(ADD_COMMENT, { discussionId: pubParent.id, body })
    console.log(`ADDED publication: ${p.title}`)
  }

  console.log('\n=== Add these to .env ===')
  console.log(`EXPERIENCE_DISCUSSION_NUMBER=${expParent.number}`)
  console.log(`EXPERIENCE_DISCUSSION_ID=${expParent.id}`)
  console.log(`PUBLICATIONS_DISCUSSION_NUMBER=${pubParent.number}`)
  console.log(`PUBLICATIONS_DISCUSSION_ID=${pubParent.id}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

- [ ] **Step 2: Type-check the script**

Run: `npx tsc --noEmit`
Expected: PASS — no type errors. (If `tsc` complains about `import.meta`, that is fine to ignore only if it passes under the repo's existing `tsconfig`; the project is ESM so it should resolve.)

- [ ] **Step 3: Commit (do NOT run the script yet)**

```bash
git add scripts/migrate-to-discussions.ts
git commit -m "feat: add idempotent Sanity->GitHub Discussions migration script"
```

---

## Task 10: Run the migration (manual checkpoint — requires explicit go-ahead)

**This task writes to the real `jacklvd/storybook-db` repo. Pause and get the user's explicit go-ahead before running Step 2.**

**Files:**
- Modify: `.env` (paste the printed discussion ids)

- [ ] **Step 1: Confirm with the user**

Tell the user: "About to run the migration — this creates up to 7 project discussions + an Experience and Publications discussion (with 4 + 3 comments) in `jacklvd/storybook-db`. It's idempotent. Proceed?" Wait for an explicit yes.

- [ ] **Step 2: Run the script**

Run: `npx -y tsx scripts/migrate-to-discussions.ts`
Expected: prints `CREATED project: ...` / `ADDED experience: ...` / `ADDED publication: ...` lines, then an `=== Add these to .env ===` block with four values. No errors.

- [ ] **Step 3: Paste the four printed values into `.env`**

Append the four `EXPERIENCE_DISCUSSION_*` / `PUBLICATIONS_DISCUSSION_*` lines from the output to `.env`.

- [ ] **Step 4: Verify the new sources return data**

Run:
```bash
npm run dev &
sleep 8
curl -s localhost:3000/api/experience | head -c 400; echo
curl -s localhost:3000/api/publications | head -c 400; echo
curl -s localhost:3000/api/projects | head -c 400; echo
kill %1
```
Expected: each returns a non-empty JSON array (`experiences` has 4, `publications` has 3, `projects` has 7 + any pre-existing like HazardHub).

- [ ] **Step 5 (idempotency check): re-run the script**

Run: `npx -y tsx scripts/migrate-to-discussions.ts`
Expected: every line is `SKIP ...` / `Parent exists` — nothing created.

No commit (`.env` is gitignored; verify it is with `git check-ignore .env`).

---

## Task 11: Wire Projects to GitHub-only

**Files:**
- Modify: `app/meet-jack/components/projects.tsx`

- [ ] **Step 1: Comment out the Sanity import**

In `app/meet-jack/components/projects.tsx`, change line 3 from:

```tsx
import { client } from '@/client/client';
```

to:

```tsx
// MIGRATED to GitHub Discussions — Sanity source kept for reference, see /api/projects.
// import { client } from '@/client/client';
```

- [ ] **Step 2: Replace the dual-source fetch with GitHub-only**

Replace the entire `useEffect(() => { ... }, []);` block (currently lines 32-55) with:

```tsx
  useEffect(() => {
    setIsLoading(true);
    // Projects now come solely from GitHub Discussions (via our server route),
    // already sorted by `order`. The Sanity source is migrated and commented out.
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => setWorks((d.projects ?? []) as Work[]))
      .catch(() => setWorks([]))
      .finally(() => setIsLoading(false));

    /* MIGRATED — previous dual-source merge (Sanity + GitHub):
    Promise.all([
      client
        .fetch('*[_type == "work"] | order(orderRank)')
        .catch(() => [] as Work[]),
      fetch('/api/projects')
        .then(r => r.json())
        .then(d => (d.projects ?? []) as Work[])
        .catch(() => [] as Work[]),
    ])
      .then(([sanityWorks, githubWorks]) => {
        const sanity = sanityWorks.map((work: Work, index: number) => ({
          ...work,
          featured: index < 4,
        }));
        setWorks([...sanity, ...githubWorks]);
      })
      .finally(() => setIsLoading(false));
    */
  }, []);
```

- [ ] **Step 3: Verify featured/regular split still works**

No code change needed — `featuredWorks`/`regularWorks` (lines 58-60) already derive from `work.featured`, which now comes from the `proj:{...}` metadata. Confirm those lines are unchanged.

- [ ] **Step 4: Type-check + build**

Run: `npx tsc --noEmit`
Expected: PASS — no unused-import or type errors (the `client` import is commented out, not dangling).

- [ ] **Step 5: Commit**

```bash
git add app/meet-jack/components/projects.tsx
git commit -m "refactor: projects fetch GitHub-only, comment out Sanity"
```

---

## Task 12: Wire Experience to GitHub

**Files:**
- Modify: `app/meet-jack/components/experience.tsx`

- [ ] **Step 1: Comment out the Sanity import**

In `app/meet-jack/components/experience.tsx`, change line 3 from:

```tsx
import { client } from '@/client/client';
```

to:

```tsx
// MIGRATED to GitHub Discussions — Sanity source kept for reference, see /api/experience.
// import { client } from '@/client/client';
```

- [ ] **Step 2: Replace the Sanity fetch effect**

Replace the entire second `useEffect(() => { ... }, []);` block (the one containing `fetchExperiences`, currently lines 40-57) with:

```tsx
  useEffect(() => {
    // Experience now comes from GitHub Discussions (comments on the Experience
    // discussion), already sorted by `id` server-side.
    fetch('/api/experience')
      .then(r => r.json())
      .then((d: { experiences?: Experience[] }) => {
        const data = d.experiences ?? [];
        setExperiences(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      })
      .catch(error => console.error('Failed to fetch experiences:', error));

    /* MIGRATED — previous Sanity fetch:
    const fetchExperiences = async () => {
      const query = `*[_type == "experience"] {
        _id, id, position, company, date, url, description
      }`;
      try {
        const data: Experience[] = await client.fetch(query);
        const sorted = [...data].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        setExperiences(sorted);
        if (sorted.length > 0) setSelectedId(sorted[0]._id);
      } catch (error) {
        console.error('Failed to fetch experiences:', error);
      }
    };
    fetchExperiences();
    */
  }, []);
```

(The existing `Experience` interface at the top of the file matches the API shape — no change.)

- [ ] **Step 3: Type-check + build**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/meet-jack/components/experience.tsx
git commit -m "refactor: experience fetch from /api/experience, comment out Sanity"
```

---

## Task 13: Wire Publications to GitHub

**Files:**
- Modify: `app/meet-jack/components/publications.tsx`

- [ ] **Step 1: Comment out the hard-coded array and make it stateful**

In `app/meet-jack/components/publications.tsx`:

Change line 2 from:

```tsx
import React from 'react';
```

to:

```tsx
import React, { useEffect, useState } from 'react';
```

Then replace the hard-coded `const publications: Publication[] = [ ... ];` block (currently lines 16-41) with:

```tsx
/* MIGRATED to GitHub Discussions — kept for reference, now fetched from /api/publications:
const publications: Publication[] = [
  {
    title: 'Real-time Speech Summarization for Medical Conversations',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.15888',
    abstract:
      'In doctor-patient conversations, identifying medically relevant information is crucial, posing the need for conversation summarization. We propose the first deployable real-time speech summarization system for real-world applications in industry, generating a local summary after every N speech utterances and a global summary at the end of a conversation.',
  },
  {
    title: 'Medical Spoken Named Entity Recognition',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.13337',
    abstract:
      'Spoken Named Entity Recognition (NER) aims to extract named entities from speech and categorize them into types like person, location, organization, etc. We present VietMed-NER — the first spoken NER dataset in the medical domain.',
  },
  {
    title: 'Sentiment Reasoning for Healthcare',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2407.21054',
    abstract:
      'Transparency in AI healthcare decision-making is crucial for building trust. Incorporating reasoning capabilities enables Large Language Models to understand emotions in context, handle nuanced language, and infer unstated sentiments.',
  },
];
*/
```

- [ ] **Step 2: Fetch publications inside the component**

Change the component declaration from:

```tsx
export const PublicationsSection = () => {
  return (
```

to:

```tsx
export const PublicationsSection = () => {
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    // Publications now come from GitHub Discussions (comments on the
    // Publications discussion).
    fetch('/api/publications')
      .then(r => r.json())
      .then((d: { publications?: Publication[] }) => setPublications(d.publications ?? []))
      .catch(() => setPublications([]));
  }, []);

  return (
```

(The `Publication` interface at the top of the file is unchanged and matches the API shape. The existing `publications.map(...)` JSX now reads from state.)

- [ ] **Step 3: Type-check + build**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/meet-jack/components/publications.tsx
git commit -m "refactor: publications fetch from /api/publications, comment out hard-coded list"
```

---

## Task 14: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — rate-limit, experience parser, publications parser, projects order tests all green.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds; `/api/experience`, `/api/publications`, `/api/projects`, `/api/guestbook` all compile.

- [ ] **Step 4: Manual smoke test in dev**

Run: `npm run dev`, open `http://localhost:3000/meet-jack`, and confirm:
- Projects section renders the 7 migrated projects (4 featured in the bento, custom `cdn.sanity.io` images visible).
- Experience section lists the 4 jobs (Shopify first) with bullets.
- Publications section lists the 3 papers.
- Guestbook still loads; after ~5 quick note submissions you get a `429` (or the friendly "Slow down" message).

- [ ] **Step 5: Final commit (if any docs/notes changed)**

```bash
git add -A
git commit -m "chore: verify Sanity->GitHub Discussions migration" --allow-empty
```

---

## Self-Review notes (for the implementer)

- **cdn.sanity.io images**: already whitelisted in `next.config.mjs`; no change needed. Images keep working because the Sanity project/CDN stays live (code is only commented out).
- **`order` on featured**: the migration marks the first 4 (by `orderRank`) as `featured:true`; the UI caps featured at 4 (existing logic) and now sorts everything by `order`.
- **Env not committed**: `.env` is gitignored — the four new discussion ids are pasted locally and (TODO) added to Vercel before production deploy.
- **Vercel TODO**: add `EXPERIENCE_DISCUSSION_NUMBER/ID` and `PUBLICATIONS_DISCUSSION_NUMBER/ID` to the Vercel project env, or those sections render empty in production.
