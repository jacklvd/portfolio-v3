# Project detail pages

**Date:** 2026-07-07
**Status:** Approved design — ready for implementation plan

## Goal

Each project card in the Projects section (`app/meet-jack/components/projects.tsx`,
`components/magicui/bento-card.tsx`) currently only links out to the external
GitHub repo / demo. Give every project its own page on the site
(`/work/[slug]`) with more detail than the card's one-line description,
written to match the site's hand-drawn book/ink theme.

## Scope

All 10 projects currently in the "Show and tell" discussion category get a
working detail page. Custom long-form copy + a curated hero image are
authored now only for the 4 newest highlighted projects (ArchSketch, Frondly,
Sidekick Cat, TruthLens); the other 6 (Creator Verse, L-P Visualizer,
SmartSheet, LifePub, YouTube Analyze, HazardHub) fall back to their live
GitHub README until someone writes custom copy for them too.

Out of scope: editing UI for authoring project content (still done by hand in
the GitHub Discussion body), a listing/sitemap page beyond the existing
Projects section, changing how featured vs. regular projects are chosen.

## Content model

Extend the existing `proj:{...}` metadata convention
(`lib/projects/index.ts`). Today a discussion body is:

```
<short description used as the card blurb>

<!-- proj:{"technologies":[...],"source":"...","demo":...,"image":...,"featured":bool,"order":n} -->
```

Anything written **after** that HTML comment is new: raw markdown that becomes
the detail page's long-form body. This lets each project's write-up be
authored by hand in the discussion (avoiding raw READMEs, which are full of
install instructions and shields.io badges that don't belong on a portfolio
page) while old projects that never get custom copy still work.

`GithubProject` (in `lib/projects/index.ts`) gains two fields:

- `slug: string` — parsed from `source`'s repo name (e.g.
  `https://github.com/jacklvd/arch-sketch` → `arch-sketch`), lowercased. All
  10 current projects already have unique repo names, so no collision
  handling is needed. Falls back to `_id` if `source` isn't a recognizable
  `github.com/{owner}/{repo}` URL (defensive only — no current project hits
  this path).
- `detail: string` — the raw markdown after the `proj:` comment, trimmed.
  Empty string when nothing follows it.

`parseDetail(body)` sits next to the existing `parseMeta`/`cleanDescription`
helpers: matches `/<!--\s*proj:\{[\s\S]*?\}\s*-->([\s\S]*)/` and returns the
captured group trimmed, or `''` if the comment isn't found.

The global `Work` interface (`types/types.d.ts`) gains matching optional
fields: `slug?: string`, `detail?: string`.

### README fallback

New `lib/projects/readme.ts`:

```ts
export async function fetchReadme(source: string): Promise<string>
```

Parses `owner/repo` out of `source` (same regex as `githubOgImage`), calls
`GET https://api.github.com/repos/{owner}/{repo}/readme` with
`Accept: application/vnd.github.raw` and the existing `GH_ACCESS_TOKEN` server
credential (higher rate limit than unauthenticated; token is already
server-only). Returns `''` on any error or non-200 (non-fatal, matching every
other fetch in `lib/projects` / `lib/guestbook` / `lib/experience`) — the page
still renders with just the card-level description.

## Routing

New Server Component: `app/work/[slug]/page.tsx`.

```ts
export const dynamic = 'force-dynamic' // matches app/api/projects/route.ts

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const projects = await getGithubProjects()
  const project = projects.find(p => p.slug === params.slug)
  if (!project) notFound()

  const body = project.detail || (await fetchReadme(project.source))
  return <ProjectDetailView project={project} body={body} />
}

export async function generateMetadata({ params }): Promise<Metadata> {
  // best-effort title/description from the same lookup; falls back to
  // generic portfolio metadata if the slug doesn't resolve
}
```

Calling `getGithubProjects()` directly (server-only lib function) instead of
round-tripping through `/api/projects` — this page has no client-side state,
so there's no reason to fetch its own API route.

`app/work/[slug]/not-found.tsx` — themed 404 (wavy frame, `font-hand` copy,
a "back to projects" link) instead of Next's default blank page, since
`notFound()` is reachable by anyone typing an unknown slug.

## Rendering & theme

New component: `app/work/[slug]/project-detail-view.tsx` (Server Component,
no interactivity needed).

Layout, top to bottom, reusing existing pieces only:

- Back link to `/meet-jack#work` — `font-hand` text + arrow, same visual
  weight as other in-page nav text.
- Hero: the project image in a `WavyCard`, full color (unlike the grid's
  grayscale→color hover — this is the page's single focal image, not a card
  in a list).
- Title (`font-title text-5xl`), tech-stack pills (same pill styling
  `BentoCard`'s `Tags` already uses: `border-foreground/15 text-muted-foreground
  uppercase text-[0.6rem] tracking-wider`).
- Source / Demo links styled as `WavyButtonBorder` buttons (same pattern as
  the homepage's "Open the book" CTA).
- `WavyDivider`.
- Markdown body, rendered via `react-markdown` + `remark-gfm` (new deps —
  nothing in the repo renders markdown today, and this is exactly the
  well-known standard tool for it), wrapped in a `@tailwindcss/typography`
  (new dep) `prose` container themed via Tailwind config rather than left at
  the plugin's default look:

  ```
  prose prose-neutral dark:prose-invert max-w-none
  prose-headings:font-title prose-headings:text-foreground
  prose-p:text-muted-foreground prose-a:text-foreground prose-a:underline
  prose-strong:text-foreground prose-code:font-mono
  ```

- `Footer` (`components/layout/footer`) at the bottom, matching every other
  page.

No `SectionNav`/`ParallaxBackdrop` — those belong to the long scrolling
`/meet-jack` page; this is a single-purpose page and doesn't need that chrome.
Container: same `max-w-6xl mx-auto px-6 sm:px-10 md:px-16` wrapper `/meet-jack`
uses, for consistent margins.

`tailwind.config.js` adds the typography plugin and a couple of `prose-*`
theme overrides described above.

## Card wiring

`components/magicui/bento-card.tsx` and the "More work" card in
`app/meet-jack/components/projects.tsx`: wrap the image + title (+ description
for the small/medium/large variants) in a `next/link` `<Link href={`/work/${work.slug}`}>`.
The Source/Demo row (`<Links />`) stays a sibling *outside* that `Link`, not
nested inside it — avoids an invalid `<a>`-inside-`<a>`.

## Images

For the 4 new highlighted projects, replace the current `null` `image` (which
falls back to the auto-generated GitHub OG social-preview image) with one
real, thematically relevant photo each, found via web search and hotlinked
the same way the Sanity-sourced projects' images already are (a plain URL in
the `image` meta field — no upload/hosting step, `projectImageUrl` already
passes URL strings through as-is):

- ArchSketch — a system-design / whiteboard-diagram photo
- Frondly — a houseplant photo
- Sidekick Cat — a cat photo (matches the bot's branding)
- TruthLens — a security/privacy-flavored photo

`next.config.mjs`'s `images.remotePatterns` gains whatever host the chosen
photos are served from (expected: `images.unsplash.com`).

The other 6 projects are untouched — they keep their existing Sanity-CDN
images or the GitHub OG fallback.

## Content authoring (data changes, not code)

For the 4 new highlights, using the README research already gathered:

- Append a hand-written `detail` markdown section (a few paragraphs — what it
  does, why, how it's built) to each discussion body, after the `proj:`
  comment. Distilled from each README, not pasted verbatim, since raw READMEs
  are dev-setup-oriented.
- Update each discussion's `image` field to the curated photo URL.

Done via the same GraphQL `updateDiscussion` mutation pattern already used
earlier in this session (`lib/projects` credentials, ad-hoc script — not
committed, since it's a one-time content edit like the earlier project
reshuffle).

## Error handling

- Unknown slug → `notFound()` → themed 404.
- README fetch failure → empty string, page renders without a body section
  rather than erroring (matches every other non-fatal fetch in `lib/`).
- Missing/broken image URL → same `<img>`/`next/image` behavior as today
  (broken image icon) — no new handling; out of scope.

## Testing / verification

- `tsc --noEmit` clean.
- `next build` succeeds (validates `generateMetadata`, dynamic route, new
  deps resolve).
- Manual: visit `/work/arch-sketch` (custom detail content) and `/work/hazardhub`
  (README fallback, or empty-body fallback if HazardHub's README fetch fails)
  in both light and dark theme; confirm an unknown slug renders the themed
  404; confirm clicking a card's title/image navigates to its detail page
  while clicking Source/Demo still opens the external link.

## Execution sequence

1. `lib/projects/index.ts` — add `slug`, `detail`, `parseDetail`; `lib/projects/readme.ts`.
2. `types/types.d.ts` — add optional `slug`/`detail` to `Work`.
3. Add deps: `react-markdown`, `remark-gfm`, `@tailwindcss/typography`; wire the plugin + `prose-*` theme in `tailwind.config.js`.
4. `app/work/[slug]/page.tsx`, `project-detail-view.tsx`, `not-found.tsx`.
5. Wire `BentoCard` and the regular project card to link to `/work/[slug]`.
6. `next.config.mjs` — add the image host(s) the curated photos come from.
7. Web-search + pick 4 images; write 4 `detail` write-ups; push both via a one-off GraphQL script (not committed) updating the 4 new discussions.
8. Verify per the Testing section above.
