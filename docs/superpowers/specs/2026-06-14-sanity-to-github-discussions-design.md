# Migration: Sanity / hard-coded content → GitHub Discussions

**Date:** 2026-06-14
**Status:** Approved design — ready for implementation plan

## Goal

Move the meet-jack portfolio's dynamic content off Sanity (and off hard-coded
arrays) and onto GitHub Discussions in the private `jacklvd/storybook-db` repo,
so content can be edited from GitHub without code changes or a Sanity Studio.
The Projects section already merges Sanity + GitHub Discussions; this completes
the migration for Projects and extends the same approach to Experience and
Publications. Also adds request rate-limiting to the guestbook.

**Sanity code is commented out, not deleted** (per user instruction). The Sanity
project/CDN stays live so existing project images keep working.

## Scope

In scope (the three dynamic content types + guestbook hardening):

- **Projects** (`work`, 7 docs) — already dual-source; finish the cutover to
  GitHub-only.
- **Experience** (`experience`, 4 docs) — Sanity-only today; add a GitHub source.
- **Publications** (3 entries) — hard-coded array in `publications.tsx`; move to
  GitHub.
- **Guestbook** — add in-memory rate-limiting.

Out of scope: `about.tsx` (static, no data source), the guestbook's existing
storage model (unchanged except rate-limiting), deleting the Sanity project,
adding Vercel env (left as a documented TODO).

## Current state (verified 2026-06-14)

- `client/client.ts` + `client/constants.ts` — Sanity client (public dataset
  `production`, project `n2iulynq`, no token; read-only).
- `app/meet-jack/components/projects.tsx` — fetches Sanity `work` (client-side)
  **and** `/api/projects`, merges them; first 4 Sanity docs forced `featured`.
- `app/meet-jack/components/experience.tsx` — fetches Sanity `experience` only.
- `app/meet-jack/components/publications.tsx` — hard-coded `publications: Publication[]`.
- `lib/projects/{client,gql,index,image}.ts` + `app/api/projects/route.ts` —
  the existing GitHub Discussions source for projects ("Show and tell" category,
  `proj:{...}` metadata block). Reuses guestbook GitHub credentials.
- `lib/guestbook/{client,gql,index,colors}.ts` + `app/api/guestbook/route.ts` —
  notes are comments on one Discussion (General category). Anti-abuse today:
  zod validation, honeypot `website` field, durable one-note-per-hashed-IP. No
  request-rate limiting.

Data pulled from the public Sanity API for migration (exact content):

- 7 `work` docs: Number Classification, Creator Verse, L-P Visualizer,
  SmartSheet, LifePub, YouTube Analyze, To-Do List. Each: title, description,
  technologies[], source, demo (nullable), and an image on `cdn.sanity.io`.
- 4 `experience` docs (ordered by numeric `id`): Shopify (1), Elevance Health
  (2), Elevance Health (3), Matson Money (4). Each: position, company, date,
  url, description[].

## Storage architecture

All content lives in `jacklvd/storybook-db`. Each item carries a machine-readable
metadata block in a trailing HTML comment (same technique as the existing
`gb:` / `proj:` blocks) plus human-readable markdown for editing in GitHub.

| Section | Count | Pattern | Location |
|---|---|---|---|
| Projects | 7 | One **discussion per project** | "Show and tell" category (`PROJECTS_CATEGORY_ID`) |
| Experience | 4 | One "Experience" discussion; **each job a comment** | General category |
| Publications | 3 | One "Publications" discussion; **each paper a comment** | General category |

Rationale: Projects already use one-discussion-per-item, so it stays. Experience
and Publications use the comments-under-one-discussion pattern (like the
guestbook) so the migration needs **no manually-created categories** — discussion
categories cannot be created via the GitHub API, but discussions and comments
can. Both parent discussions go in the existing "General" category.

### Metadata blocks

Projects (extends the existing block with a new `order` field):

```
<!-- proj:{"technologies":["..."],"source":"https://...","demo":null,"image":"https://cdn.sanity.io/...","featured":true,"order":1} -->
```

- `image` = the existing `cdn.sanity.io` URL (already whitelisted in
  `next.config.mjs`; CDN stays live) — preserves the custom screenshots.
- `order` (new) — deterministic sort key; the lib sorts ascending by `order`.
- `featured:true` on the first 4 (by current `orderRank`) to preserve the bento
  layout. UI still caps featured at 4.

Experience (one comment per job):

```
<!-- exp:{"id":1,"position":"...","company":"...","date":"...","url":"https://...","description":["bullet","bullet"]} -->
```

Publications (one comment per paper; title is the paper title):

```
<!-- pub:{"authors":"...","year":"2024","url":"https://arxiv.org/...","abstract":"..."} -->
```

## New code

Mirror `lib/projects/` for the two new read-only sources.

- `lib/experience/client.ts` — config; reuse `GH_API_URL`/`GH_ACCESS_TOKEN`/repo
  from guestbook; `EXPERIENCE_DISCUSSION_NUMBER` (read) + `EXPERIENCE_DISCUSSION_ID`
  (future writes); `isExperienceSourceConfigured`.
- `lib/experience/gql.ts` — query a discussion's comments by number.
- `lib/experience/index.ts` — fetch comments, parse `exp:{...}`, sort by `id`,
  return `Experience[]` (`{_id,id,position,company,date,url,description[]}`).
- `app/api/experience/route.ts` — `runtime='nodejs'`, `dynamic='force-dynamic'`,
  GET returns `{experiences}`; `[]` when unconfigured; non-fatal on error.
- `lib/publications/{client,gql,index}.ts` + `app/api/publications/route.ts` —
  same shape; parses `pub:{...}`, returns `{publications}` (`{title,authors,year,url,abstract}`).
- `lib/rate-limit.ts` — see below.

## Rate limiting (guestbook)

`lib/rate-limit.ts`: a small in-memory sliding-window limiter.

- Interface: `rateLimit(key, { limit, windowMs }) => { ok, retryAfterSec }`.
- Storage: module-level `Map<string, number[]>` of recent timestamps per key,
  pruned on each call.
- Key: hashed IP (reuse `hashIp` from `lib/guestbook`) so raw IPs are never held.

Applied in `app/api/guestbook/route.ts`:

- POST: ~5 requests / 10 min per IP.
- GET: ~30 requests / min per IP.
- On exceed: HTTP `429` with a `Retry-After` header and a friendly JSON error.

Caveat (documented in the file): in-memory state resets on serverless cold
starts and is per-instance, so it is best-effort. The durable
one-note-per-hashed-IP rule (stored in GitHub) remains the primary guarantee;
the limiter just blunts rapid-fire bursts. Sufficient for a low-traffic site;
swappable for Upstash later if needed.

## Migration script — `scripts/migrate-to-discussions.ts`

One-time, committed, idempotent. Run with `npx tsx scripts/migrate-to-discussions.ts`.
Reads `GH_ACCESS_TOKEN` and Sanity public ids from `.env`.

Steps:

1. Read `work` and `experience` from the public Sanity API; read the
   publications list (copied into the script from the current hard-coded array).
2. Resolve category IDs via `repository.discussionCategories` ("Show and tell"
   for projects, "General" for the two parents).
3. Projects: for each, `createDiscussion` in "Show and tell" with title = project
   name and the `proj:{...}` body. **Skip if a discussion with that title already
   exists** (so HazardHub #2 and re-runs are safe).
4. Experience: ensure one "Experience" discussion exists (create if missing),
   then `addDiscussionComment` for each job. **Skip a job if a comment with the
   same `exp.id` already exists.**
5. Publications: same as Experience, keyed on `pub.url`.
6. Print the resulting discussion numbers + node IDs for the two parents so they
   can be pasted into `.env`.

GraphQL only (no `gh` CLI dependency — `gh` is not installed). Reuses the
`githubGraphQL` pattern already in `lib/guestbook/index.ts`.

## Component changes (comment out, don't delete)

- `projects.tsx` — comment out the Sanity `client.fetch('*[_type=="work"]...')`
  branch and the `@/client/client` import; fetch only `/api/projects`. Featured
  and order now come from metadata (`featured` flag, sort by `order`, cap 4).
- `experience.tsx` — comment out the Sanity `client.fetch` block and import;
  fetch `/api/experience`; keep the existing sort-by-`id` and loading states.
- `publications.tsx` — comment out the hard-coded `publications` array; fetch
  `/api/publications` into state. The commented array stays as reference/fallback.
- `lib/projects/index.ts` + `gql.ts` — parse and sort by `order`.

`client/client.ts`, `client/constants.ts`, and `lib/projects/image.ts` are left
intact: `projectImageUrl` already passes URL strings through, so `urlFor` becomes
a dormant fallback. `next.config.mjs` keeps `cdn.sanity.io` whitelisted.

## Env additions

Add to `.env` (and TODO: mirror in Vercel project env):

- `EXPERIENCE_DISCUSSION_NUMBER`, `EXPERIENCE_DISCUSSION_ID`
- `PUBLICATIONS_DISCUSSION_NUMBER`, `PUBLICATIONS_DISCUSSION_ID`

No new categories and no `EXPERIENCE_CATEGORY_ID` (superseded by the
comments-under-one-discussion pattern).

## Error handling

- All three API routes: return empty list when their source is unconfigured;
  log and return empty (non-fatal) on GitHub errors, so the UI degrades to an
  empty/blank section rather than crashing.
- Components keep their existing loading spinners; an empty fetch simply renders
  no items.
- Guestbook POST/GET gain `429` handling; the client surfaces the friendly
  message.

## Testing / verification

- Unit-level: metadata parsers (`exp:`/`pub:`/`proj:` round-trip, including the
  new `order`); `rateLimit` (allows under limit, blocks over, window resets).
- Migration script: idempotency — a second run creates nothing and reports all
  items skipped.
- Integration: `npm run build` passes; local `npm run dev` shows Projects,
  Experience, and Publications rendering from GitHub with Sanity commented out;
  guestbook returns `429` after exceeding the POST limit.

## Execution sequence

1. Build libs (`experience`, `publications`, `rate-limit`), API routes, and the
   migration script.
2. **Run the migration script** — writes 9 discussions + 7 comments to the real
   `jacklvd/storybook-db` repo. Pause for explicit go-ahead before running.
   Paste the printed discussion numbers/IDs into `.env`.
3. Wire the three components to GitHub-only, comment out Sanity/hard-coded code,
   add guestbook rate-limiting, and verify with a local build.

## Open TODOs (post-implementation)

- Add the new `*_DISCUSSION_NUMBER/ID` env vars to Vercel.
- Optionally revisit Upstash rate-limiting if traffic ever grows.
