# Project Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every project a page at `/work/[slug]` with more detail than its card, sourced from custom copy in its GitHub Discussion (falling back to the repo's live README), styled to match the site's hand-drawn book theme.

**Architecture:** Extend the existing `lib/projects` GitHub-Discussions data layer with a `slug` and a `detail` (long-form markdown) field per project. A new Server Component route (`app/work/[slug]/page.tsx`) looks up the project, renders `detail` (or fetches the README as a fallback) through `react-markdown`, and reuses the site's existing `WavyCard`/`WavyBorder`/`WavyDivider` components for chrome. Project cards (`BentoCard`, the regular grid card) link their image/title to the new route.

**Tech Stack:** Next.js 14 app router (Server Components), TypeScript, Tailwind CSS, `react-markdown` + `remark-gfm` + `@tailwindcss/typography` (new deps), Vitest for unit tests, GitHub GraphQL/REST APIs.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-07-project-detail-pages-design.md` — every task below implements a section of it.
- Next.js 14.2.35 app router conventions (this repo does not use the Next 15 async-`params` pattern — `params` is a plain object).
- Prettier formats with tabs; run `npx prettier --write <file>` on anything you create or edit before committing (husky's pre-commit hook is not executable in this environment, so it will not run automatically).
- No new dependencies beyond `react-markdown`, `remark-gfm`, `@tailwindcss/typography` — everything else reuses what's already installed.
- `GH_ACCESS_TOKEN` (in `.env`) is a live secret: never print it in full, never commit it, never put it in a committed script.
- All new/edited image hosts must be added to `next.config.mjs`'s `images.remotePatterns` before `next/image` will render them.
- This repo's git operations are slow (OneDrive-backed filesystem) — run `git`/`yarn` commands with a long timeout and expect multi-minute waits; do not assume a hang means failure.

---

### Task 1: `parseGithubRepo` + `slugFromSource` helpers

**Files:**
- Modify: `lib/projects/index.ts` (the `githubOgImage` function, currently lines 29-33)
- Test: `lib/projects/index.test.ts`

**Interfaces:**
- Produces: `parseGithubRepo(source: string): { owner: string; repo: string } | null` (exported), `slugFromSource(source: string, fallback: string): string` (exported). Both consumed by Task 2 and Task 3.

- [ ] **Step 1: Write the failing tests**

Add to `lib/projects/index.test.ts` (below the existing `sortByOrder` describe block, keep the existing `mk`/import untouched for now):

```ts
import { parseGithubRepo, slugFromSource } from './index'

describe('parseGithubRepo', () => {
  it('extracts owner and repo from a github.com URL', () => {
    expect(parseGithubRepo('https://github.com/jacklvd/arch-sketch')).toEqual({
      owner: 'jacklvd',
      repo: 'arch-sketch',
    })
  })

  it('strips a trailing .git', () => {
    expect(parseGithubRepo('https://github.com/jacklvd/arch-sketch.git')).toEqual({
      owner: 'jacklvd',
      repo: 'arch-sketch',
    })
  })

  it('returns null for a non-github source', () => {
    expect(parseGithubRepo('https://example.com/foo')).toBeNull()
  })
})

describe('slugFromSource', () => {
  it('lowercases the repo name from a github source', () => {
    expect(slugFromSource('https://github.com/jacklvd/ArchSketch', 'fallback')).toBe(
      'archsketch',
    )
  })

  it('falls back when the source is not a github.com URL', () => {
    expect(slugFromSource('https://gitlab.com/x/y', 'gh-3')).toBe('gh-3')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test lib/projects/index.test.ts`
Expected: FAIL — `parseGithubRepo` and `slugFromSource` are not exported from `./index`.

- [ ] **Step 3: Implement**

In `lib/projects/index.ts`, replace the existing `githubOgImage` function:

```ts
// GitHub's auto-generated social preview image for a repo, derived from its URL.
function githubOgImage(source: string): string {
  const m = source.match(/github\.com\/([^/]+)\/([^/?#]+)/)
  if (!m) return ''
  return `https://opengraph.githubassets.com/1/${m[1]}/${m[2].replace(/\.git$/, '')}`
}
```

with:

```ts
// Extracts {owner, repo} from a github.com URL, stripping a trailing .git.
// Shared by the OG-image fallback, the detail-page slug, and the README fetch.
export function parseGithubRepo(source: string): { owner: string; repo: string } | null {
  const m = source.match(/github\.com\/([^/]+)\/([^/?#]+)/)
  if (!m) return null
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') }
}

// GitHub's auto-generated social preview image for a repo, derived from its URL.
function githubOgImage(source: string): string {
  const repo = parseGithubRepo(source)
  if (!repo) return ''
  return `https://opengraph.githubassets.com/1/${repo.owner}/${repo.repo}`
}

// The detail page's URL slug. Repo names are unique across this site's
// projects today, so no collision handling — falls back to the caller's id
// only when `source` isn't a recognizable github.com URL.
export function slugFromSource(source: string, fallback: string): string {
  const repo = parseGithubRepo(source)
  return repo ? repo.repo.toLowerCase() : fallback
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test lib/projects/index.test.ts`
Expected: PASS (5 tests: the existing `sortByOrder` test + 4 new ones).

- [ ] **Step 5: Commit**

```bash
npx prettier --write lib/projects/index.ts lib/projects/index.test.ts
git add lib/projects/index.ts lib/projects/index.test.ts
git commit -m "feat(projects): add parseGithubRepo and slugFromSource helpers"
```

---

### Task 2: `parseDetail` + wire `slug`/`detail` into `GithubProject`

**Files:**
- Modify: `lib/projects/index.ts` (interface `GithubProject`, currently lines 7-17; the `getGithubProjects` return mapping, currently lines 90-100)
- Test: `lib/projects/index.test.ts`

**Interfaces:**
- Consumes: `parseGithubRepo`, `slugFromSource` from Task 1.
- Produces: `GithubProject` now has `slug: string` and `detail: string`. `parseDetail(body: string): string` (exported). `getGithubProjects()` populates both fields. Consumed by Task 4 (readme fallback caller in the page route), Task 5 (detail view props), Task 6 (page route), Task 7 (card `href`s via the `Work` type).

- [ ] **Step 1: Write the failing tests**

Add to `lib/projects/index.test.ts`:

```ts
import { parseDetail } from './index'

describe('parseDetail', () => {
  it('returns the markdown after the proj comment, trimmed', () => {
    const body =
      'Short desc\n\n<!-- proj:{"source":"https://github.com/x/y"} -->\n\n## More\nExtra detail.'
    expect(parseDetail(body)).toBe('## More\nExtra detail.')
  })

  it('returns an empty string when there is no proj comment', () => {
    expect(parseDetail('Just a description, no metadata.')).toBe('')
  })

  it('returns an empty string when nothing follows the comment', () => {
    const body = 'Short desc\n\n<!-- proj:{"source":"https://github.com/x/y"} -->'
    expect(parseDetail(body)).toBe('')
  })
})
```

Update the existing `mk()` helper at the top of the file to satisfy the now-required `slug`/`detail` fields:

```ts
function mk(title: string, order?: number): GithubProject {
  return {
    _id: `gh-${title}`,
    slug: title,
    title,
    description: '',
    detail: '',
    technologies: [],
    source: 'https://github.com/x/y',
    image: '',
    featured: false,
    order: order ?? Number.MAX_SAFE_INTEGER,
  }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test lib/projects/index.test.ts`
Expected: FAIL — `parseDetail` is not exported, and/or a TypeScript error on the `mk()` object literal missing `slug`/`detail` (run before Step 3's interface change).

- [ ] **Step 3: Implement**

In `lib/projects/index.ts`, update the `GithubProject` interface:

```ts
export interface GithubProject {
  _id: string
  slug: string
  title: string
  description: string
  detail: string
  technologies: string[]
  source: string
  demo?: string
  image: string
  featured: boolean
  order: number
}
```

Add `parseDetail` next to `cleanDescription`:

```ts
// Markdown written after the proj:{...} comment — a hand-authored long-form
// write-up for the project's detail page. Empty when nothing follows it, so
// the page falls back to the repo's README (see lib/projects/readme.ts).
export function parseDetail(body: string): string {
  const match = body.match(/<!--\s*proj:\{[\s\S]*?\}\s*-->([\s\S]*)/)
  return match ? match[1].trim() : ''
}
```

In `getGithubProjects`'s return mapping, add `slug` and `detail`:

```ts
return {
  _id: `gh-${node.number}`,
  slug: slugFromSource(source, `gh-${node.number}`),
  title: node.title,
  description: cleanDescription(node.bodyText),
  detail: parseDetail(node.body),
  technologies,
  source,
  demo: meta.demo ?? undefined,
  image: meta.image || githubOgImage(source),
  featured: Boolean(meta.featured),
  order: typeof meta.order === 'number' ? meta.order : Number.MAX_SAFE_INTEGER,
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test lib/projects/index.test.ts`
Expected: PASS (8 tests total).

- [ ] **Step 5: Commit**

```bash
npx prettier --write lib/projects/index.ts lib/projects/index.test.ts
git add lib/projects/index.ts lib/projects/index.test.ts
git commit -m "feat(projects): add slug and detail fields to GithubProject"
```

---

### Task 3: README fallback fetch

**Files:**
- Create: `lib/projects/readme.ts`
- Test: `lib/projects/readme.test.ts`

**Interfaces:**
- Consumes: `parseGithubRepo` from `lib/projects/index.ts` (Task 1), `GH_ACCESS_TOKEN` from `lib/projects/client.ts` (already exists).
- Produces: `fetchReadme(source: string): Promise<string>`. Consumed by Task 6 (page route).

- [ ] **Step 1: Write the failing tests**

Create `lib/projects/readme.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchReadme } from './readme'

describe('fetchReadme', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the README text on a successful fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('# Hello'),
      }),
    )
    const result = await fetchReadme('https://github.com/jacklvd/arch-sketch')
    expect(result).toBe('# Hello')
  })

  it('returns an empty string on a non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve('') }),
    )
    const result = await fetchReadme('https://github.com/jacklvd/arch-sketch')
    expect(result).toBe('')
  })

  it('returns an empty string for a non-github source without calling fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const result = await fetchReadme('https://example.com/foo')
    expect(result).toBe('')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns an empty string when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const result = await fetchReadme('https://github.com/jacklvd/arch-sketch')
    expect(result).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test lib/projects/readme.test.ts`
Expected: FAIL — `lib/projects/readme.ts` does not exist.

- [ ] **Step 3: Implement**

Create `lib/projects/readme.ts`:

```ts
import { GH_ACCESS_TOKEN } from './client'
import { parseGithubRepo } from './index'

// Fallback for projects with no custom `detail` write-up in their discussion
// post: fetches the repo's README as raw markdown. Non-fatal — any failure
// (private repo, no README, rate limit, network error) returns '' so the
// detail page still renders with just the card-level description.
export async function fetchReadme(source: string): Promise<string> {
  const repo = parseGithubRepo(source)
  if (!repo) return ''
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.repo}/readme`,
      {
        headers: {
          Accept: 'application/vnd.github.raw',
          ...(GH_ACCESS_TOKEN ? { Authorization: `token ${GH_ACCESS_TOKEN}` } : {}),
        },
        cache: 'no-store',
      },
    )
    if (!res.ok) return ''
    return await res.text()
  } catch {
    return ''
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test lib/projects/readme.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
npx prettier --write lib/projects/readme.ts lib/projects/readme.test.ts
git add lib/projects/readme.ts lib/projects/readme.test.ts
git commit -m "feat(projects): add README fallback fetch for detail pages"
```

---

### Task 4: Add markdown-rendering dependencies + Tailwind typography plugin

**Files:**
- Modify: `package.json`, `yarn.lock` (via `yarn add`)
- Modify: `tailwind.config.ts` (currently: `plugins: [addVariablesForColors, require('tailwindcss-animate')]`, near the bottom of the file)

**Interfaces:**
- Produces: `react-markdown`, `remark-gfm` importable packages; the `prose` Tailwind utility (and `prose-*` element modifiers) available in any component. Consumed by Task 5.

- [ ] **Step 1: Install the dependencies**

Run: `yarn add react-markdown remark-gfm @tailwindcss/typography`
Expected: command completes, `package.json`'s `dependencies` gains all three (react-markdown/remark-gfm) and `@tailwindcss/typography` — check which section `yarn add` places `@tailwindcss/typography` in; if it lands in `dependencies`, that's fine (this repo doesn't currently split runtime vs. build-time Tailwind plugins).

- [ ] **Step 2: Verify the packages resolve**

Run: `node -e "require('@tailwindcss/typography'); require('react-markdown'); require('remark-gfm'); console.log('ok')"`
Expected: prints `ok` with no errors. (`react-markdown`/`remark-gfm` are ESM-only in recent versions — if this throws an ERR_REQUIRE_ESM, that's expected for a bare `require()` in this smoke test and not a real problem, since Next.js's bundler handles ESM imports; only fail this step if `@tailwindcss/typography` itself fails to resolve.)

- [ ] **Step 3: Register the plugin**

In `tailwind.config.ts`, change:

```ts
  plugins: [addVariablesForColors, require('tailwindcss-animate')],
```

to:

```ts
  plugins: [
    addVariablesForColors,
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
```

- [ ] **Step 4: Verify the build still compiles**

Run: `yarn build`
Expected: succeeds (this repo has no page using `prose` yet, so this just confirms the plugin doesn't break the existing Tailwind config).

- [ ] **Step 5: Commit**

```bash
npx prettier --write tailwind.config.ts package.json
git add package.json yarn.lock tailwind.config.ts
git commit -m "chore: add react-markdown, remark-gfm, @tailwindcss/typography"
```

---

### Task 5: `ProjectDetailView` component

**Files:**
- Create: `app/work/[slug]/project-detail-view.tsx`

**Interfaces:**
- Consumes: `GithubProject` type from `lib/projects/index.ts` (Task 2); `WavyCard`, `WavyButtonBorder`, `WavyDivider` from `components/effects/wavy-frame.tsx` (existing); `Footer` (default export) from `components/layout/footer.tsx` (existing).
- Produces: `ProjectDetailView({ project, body }: { project: GithubProject; body: string })` — a Server Component. Consumed by Task 6.

- [ ] **Step 1: Implement**

Create `app/work/[slug]/project-detail-view.tsx`:

```tsx
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ExternalLink, GitBranch } from 'lucide-react';
import type { GithubProject } from '@/lib/projects';
import {
	WavyButtonBorder,
	WavyCard,
	WavyDivider,
} from '@/components/effects/wavy-frame';
import Footer from '@/components/layout/footer';

interface ProjectDetailViewProps {
	project: GithubProject;
	body: string;
}

const buttonClass =
	'group relative inline-flex items-center gap-2 px-5 py-2.5 font-hand text-lg text-foreground transition-transform duration-100 hover:translate-x-[2px] hover:translate-y-[2px]';

export function ProjectDetailView({ project, body }: ProjectDetailViewProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:px-10 md:px-16 md:py-24">
				<Link
					href="/meet-jack#work"
					className="mb-8 inline-flex items-center gap-1.5 font-hand text-lg text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft size={16} />
					Back to projects
				</Link>

				{project.image && (
					<WavyCard className="mb-8">
						<div className="relative aspect-video w-full">
							<Image
								src={project.image}
								alt={project.title}
								fill
								className="object-cover"
							/>
						</div>
					</WavyCard>
				)}

				<h1 className="mb-4 font-title text-5xl text-foreground md:text-6xl">
					{project.title}
				</h1>

				{project.technologies.length > 0 && (
					<div className="mb-6 flex flex-wrap gap-1.5">
						{project.technologies.map((tag) => (
							<span
								key={tag}
								className="border border-foreground/15 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-muted-foreground"
							>
								{tag}
							</span>
						))}
					</div>
				)}

				<div className="mb-10 flex flex-wrap gap-3">
					<a href={project.source} target="_blank" rel="noreferrer" className={buttonClass}>
						<WavyButtonBorder />
						<GitBranch size={14} />
						Source
					</a>
					{project.demo && (
						<a href={project.demo} target="_blank" rel="noreferrer" className={buttonClass}>
							<WavyButtonBorder />
							<ExternalLink size={14} />
							Demo
						</a>
					)}
				</div>

				<WavyDivider className="mb-10 text-foreground/20" />

				{body ? (
					<div
						className="prose prose-neutral max-w-none dark:prose-invert
              prose-headings:font-title prose-headings:text-foreground
              prose-p:text-muted-foreground prose-li:text-muted-foreground
              prose-a:text-foreground prose-a:underline
              prose-strong:text-foreground prose-code:font-mono"
					>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
					</div>
				) : (
					<p className="font-hand text-lg text-muted-foreground">
						{project.description}
					</p>
				)}
			</main>

			<Footer />
		</div>
	);
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors referencing `project-detail-view.tsx`. (It won't be reachable from any route yet — Task 6 wires that up — so this only checks the file's own types.)

- [ ] **Step 3: Commit**

```bash
npx prettier --write "app/work/[slug]/project-detail-view.tsx"
git add "app/work/[slug]/project-detail-view.tsx"
git commit -m "feat(projects): add ProjectDetailView component"
```

---

### Task 6: `/work/[slug]` route + themed 404

**Files:**
- Create: `app/work/[slug]/page.tsx`
- Create: `app/work/[slug]/not-found.tsx`

**Interfaces:**
- Consumes: `getGithubProjects` from `lib/projects/index.ts` (existing), `fetchReadme` from `lib/projects/readme.ts` (Task 3), `ProjectDetailView` from Task 5, `WavyCard`/`WavyButtonBorder` (existing).
- Produces: the live route `/work/[slug]`, reachable in the browser. Consumed by Task 7 (cards link here).

- [ ] **Step 1: Implement the route**

Create `app/work/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGithubProjects } from '@/lib/projects';
import { fetchReadme } from '@/lib/projects/readme';
import { ProjectDetailView } from './project-detail-view';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ProjectDetailPageProps {
	params: { slug: string };
}

export async function generateMetadata({
	params,
}: ProjectDetailPageProps): Promise<Metadata> {
	const projects = await getGithubProjects();
	const project = projects.find((p) => p.slug === params.slug);
	if (!project) {
		return { title: 'Project not found — Jack Vo' };
	}
	return {
		title: `${project.title} — Jack Vo`,
		description: project.description,
	};
}

export default async function ProjectDetailPage({
	params,
}: ProjectDetailPageProps) {
	const projects = await getGithubProjects();
	const project = projects.find((p) => p.slug === params.slug);
	if (!project) notFound();

	const body = project.detail || (await fetchReadme(project.source));

	return <ProjectDetailView project={project} body={body} />;
}
```

- [ ] **Step 2: Implement the themed 404**

Create `app/work/[slug]/not-found.tsx`:

```tsx
import Link from 'next/link';
import { WavyButtonBorder, WavyCard } from '@/components/effects/wavy-frame';

export default function ProjectNotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
			<WavyCard className="max-w-md p-10">
				<p className="mb-3 font-title text-4xl text-foreground">
					Page missing its pages
				</p>
				<p className="font-hand text-lg text-muted-foreground">
					Couldn&apos;t find that project. It might&apos;ve been renamed or
					moved.
				</p>
			</WavyCard>
			<Link
				href="/meet-jack#work"
				className="group relative inline-flex items-center gap-2 px-5 py-2.5 font-hand text-lg text-foreground transition-transform duration-100 hover:translate-x-[2px] hover:translate-y-[2px]"
			>
				<WavyButtonBorder />
				Back to projects
			</Link>
		</div>
	);
}
```

- [ ] **Step 3: Verify with a local build and manual check**

Run: `yarn build` — expected: succeeds, and the route summary lists `/work/[slug]` as a dynamic route.

Run: `yarn dev` in one terminal, then in a browser visit:
- `http://localhost:3000/work/arch-sketch` (or any current project slug — check `http://localhost:3000/api/projects` for valid slugs first) → the detail page renders with the README fallback content (Task 9 hasn't added custom copy yet).
- `http://localhost:3000/work/this-does-not-exist` → the themed 404 from Step 2 renders, not Next's default 404.

Stop the dev server when done (`Ctrl+C`, or if started in the background, use the harness's background-task controls — do not leave it running).

- [ ] **Step 4: Commit**

```bash
npx prettier --write "app/work/[slug]/page.tsx" "app/work/[slug]/not-found.tsx"
git add "app/work/[slug]/page.tsx" "app/work/[slug]/not-found.tsx"
git commit -m "feat(projects): add /work/[slug] detail route and themed 404"
```

---

### Task 7: Link project cards to their detail pages

**Files:**
- Modify: `types/types.d.ts`
- Modify: `components/magicui/bento-card.tsx`
- Modify: `app/meet-jack/components/projects.tsx` (the "More work" card, currently lines 124-192)

**Interfaces:**
- Consumes: `/work/[slug]` route from Task 6.
- Produces: nothing new consumed by later tasks — this is the last code task.

- [ ] **Step 1: Add optional fields to the global `Work` type**

In `types/types.d.ts`, change:

```ts
interface Work {
  _id: string
  title: string
  description: string
  technologies: string[]
  source: string
  demo?: string
  image: any
  featured?: boolean
}
```

to:

```ts
interface Work {
  _id: string
  slug?: string
  title: string
  description: string
  detail?: string
  technologies: string[]
  source: string
  demo?: string
  image: any
  featured?: boolean
}
```

- [ ] **Step 2: Wire `BentoCard`**

Rewrite `components/magicui/bento-card.tsx`:

```tsx
import Link from 'next/link';
import { GitBranch, ExternalLink } from 'lucide-react';
import { WavyCard } from '@/components/effects/wavy-frame';
import { projectImageUrl } from '@/lib/projects/image';

const BentoCard = ({
  work,
  size,
}: {
  work: Work;
  size: 'small' | 'medium' | 'large';
}) => {
  const maxLen = size === 'large' ? 160 : size === 'medium' ? 110 : 75;
  const desc =
    work.description.length > maxLen
      ? work.description.slice(0, maxLen) + '…'
      : work.description;

  const tagLimit = size === 'small' ? 2 : 3;
  const extra = work.technologies
    ? work.technologies.length - tagLimit
    : 0;
  const href = work.slug ? `/work/${work.slug}` : work.source;

  const Links = () => (
    <div className="flex items-center gap-4">
      <a
        href={work.source}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-xs tracking-wide hover:opacity-70 transition-opacity"
      >
        <GitBranch size={12} />
        Source
      </a>
      {work.demo && (
        <a
          href={work.demo}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs tracking-wide hover:opacity-70 transition-opacity"
        >
          <ExternalLink size={12} />
          Demo
        </a>
      )}
    </div>
  );

  const Tags = ({ light = false }: { light?: boolean }) => (
    work.technologies ? (
      <div className="flex flex-wrap gap-1.5">
        {work.technologies.slice(0, tagLimit).map((tag: string) => (
          <span
            key={tag}
            className={`px-2 py-0.5 text-[0.6rem] tracking-wider uppercase border ${
              light
                ? 'border-white/30 text-white/70'
                : 'border-foreground/15 text-muted-foreground'
            }`}
          >
            {tag}
          </span>
        ))}
        {extra > 0 && (
          <span
            className={`px-2 py-0.5 text-[0.6rem] tracking-wider uppercase border ${
              light
                ? 'border-white/30 text-white/70'
                : 'border-foreground/15 text-muted-foreground'
            }`}
          >
            +{extra}
          </span>
        )}
      </div>
    ) : null
  );

  /* ── Large card: full-bleed image + gradient overlay ── */
  if (size === 'large') {
    return (
      <WavyCard>
        <Link href={href} className="absolute inset-0 block">
          <img
            src={projectImageUrl(work.image, 900)}
            alt={work.title}
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-3">
          <Link href={href}>
            <h3 className="font-serif text-xl leading-snug">{work.title}</h3>
          </Link>
          <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
          <Tags light />
          <div className="pt-1 text-white/80">
            <Links />
          </div>
        </div>
      </WavyCard>
    );
  }

  /* ── Medium card: image left, content right ── */
  if (size === 'medium') {
    return (
      <WavyCard className="flex">
        <Link href={href} className="w-2/5 shrink-0 overflow-hidden block">
          <img
            src={projectImageUrl(work.image, 600)}
            alt={work.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            loading="lazy"
          />
        </Link>
        <div className="flex flex-col justify-between p-5 flex-1">
          <div className="space-y-2">
            <Link href={href}>
              <h3 className="font-serif text-lg leading-snug text-foreground">{work.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
          <div className="space-y-3 mt-4">
            <Tags />
            <Links />
          </div>
        </div>
      </WavyCard>
    );
  }

  /* ── Small card: image top, content below ── */
  return (
    <WavyCard className="flex flex-col">
      <Link href={href} className="aspect-video overflow-hidden block">
        <img
          src={projectImageUrl(work.image, 500)}
          alt={work.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-col flex-1 p-4 space-y-3">
        <Link href={href}>
          <h3 className="font-serif text-base leading-snug text-foreground">{work.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{desc}</p>
        <Tags />
        <Links />
      </div>
    </WavyCard>
  );
};

export default BentoCard;
```

- [ ] **Step 3: Wire the regular "More work" card**

In `app/meet-jack/components/projects.tsx`, add the import:

```tsx
import Link from 'next/link';
```

Then replace the card's image block:

```tsx
                      {/* Image */}
                      <div className="aspect-video overflow-hidden">
                        <Image
                          src={projectImageUrl(work.image)}
                          alt={work.title}
                          width={600}
                          height={338}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          loading="lazy"
                        />
                      </div>
```

with:

```tsx
                      {/* Image */}
                      <Link
                        href={work.slug ? `/work/${work.slug}` : work.source}
                        className="aspect-video overflow-hidden block"
                      >
                        <Image
                          src={projectImageUrl(work.image)}
                          alt={work.title}
                          width={600}
                          height={338}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          loading="lazy"
                        />
                      </Link>
```

And replace the title:

```tsx
                        <h3 className="font-medium text-foreground mb-2 leading-snug">
                          {work.title}
                        </h3>
```

with:

```tsx
                        <Link href={work.slug ? `/work/${work.slug}` : work.source}>
                          <h3 className="font-medium text-foreground mb-2 leading-snug">
                            {work.title}
                          </h3>
                        </Link>
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` — expected: no errors.

Run: `yarn build` — expected: succeeds.

Run: `yarn dev`, open `http://localhost:3000/meet-jack`, scroll to Projects. Confirm: clicking a card's image or title navigates to `/work/<slug>`; clicking "Source" or "Demo" still opens the external link in a new tab (not the detail page). Check both a featured (bento) card and a "More work" card. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
npx prettier --write types/types.d.ts components/magicui/bento-card.tsx app/meet-jack/components/projects.tsx
git add types/types.d.ts components/magicui/bento-card.tsx app/meet-jack/components/projects.tsx
git commit -m "feat(projects): link project cards to their detail pages"
```

---

### Task 8: Whitelist the curated-image host

**Files:**
- Modify: `next.config.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `next/image` can render `images.unsplash.com` URLs. Consumed by Task 9.

- [ ] **Step 1: Implement**

In `next.config.mjs`, add a new entry to `images.remotePatterns` (after the existing `raw.githubusercontent.com` entry):

```js
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '**',
      },
      // Curated hero images for project detail pages (Unsplash, hotlinked).
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
```

- [ ] **Step 2: Verify**

Run: `yarn build` — expected: succeeds (no project currently uses this host yet, so this just confirms valid config syntax).

- [ ] **Step 3: Commit**

```bash
npx prettier --write next.config.mjs
git add next.config.mjs
git commit -m "chore: whitelist images.unsplash.com for project detail heroes"
```

---

### Task 9: Author custom content for the 4 highlighted projects

**Files:**
- None committed to the repo — this pushes content to the `jacklvd/storybook-db` GitHub Discussions, the same way the earlier project-reshuffle work in this session did (an ad-hoc script run once, in the scratchpad directory, not committed, since `GH_ACCESS_TOKEN` must never land in a committed file).

**Interfaces:**
- Consumes: the 4 discussion node IDs created earlier this session (ArchSketch `D_kwDOSzzhEc4AnoNO` #12, Frondly `D_kwDOSzzhEc4AnoNP` #13, Sidekick Cat `D_kwDOSzzhEc4AnoNQ` #14, TruthLens `D_kwDOSzzhEc4AnoNR` #15); `updateDiscussion` GraphQL mutation (same pattern used earlier this session for the demotions).
- Produces: each of the 4 discussions gets a real `image` URL (replacing `null`) and a `detail` markdown section appended after the `proj:` comment. `getGithubProjects()` (Task 2) and the `/work/[slug]` route (Task 6) pick these up automatically — no code changes needed.

Images were sourced via web search (Unsplash, free-tier, non-`plus.` license) and resolved to direct CDN URLs:

| Project | Theme | Image |
|---|---|---|
| ArchSketch | whiteboard system-design diagram | `https://images.unsplash.com/photo-1755548218134-ae9862203fe1?auto=format&fit=crop&w=1600&q=80` |
| Frondly | houseplant | `https://images.unsplash.com/photo-1641977563529-7b617571393d?auto=format&fit=crop&w=1600&q=80` |
| Sidekick Cat | cat looking at camera | `https://images.unsplash.com/photo-1651520998049-0d4508b5fae2?auto=format&fit=crop&w=1600&q=80` |
| TruthLens | padlock / digital security | `https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=1600&q=80` |

- [ ] **Step 1: Write the script**

Create `/private/tmp/claude-501/-Users-itsjackie-Library-CloudStorage-OneDrive-Personal-PortfolioWeb/22f4ee72-b8b4-4f8b-a963-9385ce567f6e/scratchpad/add-project-details.py` (adjust the scratchpad path to whatever this session's actual scratchpad directory is — check the system prompt for the current one, it changes per session):

```python
import json
import os
import urllib.request

TOKEN = os.environ["GH_ACCESS_TOKEN"]
API_URL = "https://api.github.com/graphql"

UPDATE_BODY_MUTATION = """
mutation($discussionId: ID!, $body: String!) {
  updateDiscussion(input: {discussionId: $discussionId, body: $body}) {
    discussion { id number title }
  }
}
"""


def gql(query, variables):
    body = json.dumps({"query": query, "variables": variables}).encode()
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"token {TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        data = json.load(resp)
    if "errors" in data:
        raise RuntimeError(data["errors"])
    return data["data"]


updates = [
    (
        "D_kwDOSzzhEc4AnoNO",  # ArchSketch #12
        "AI-powered system design diagram generator — describe a system in plain "
        "language and get back interactive, draggable architecture, database "
        "schema, and API diagrams, routed through a local Ollama model with a "
        "Gemini cloud fallback.\n\n"
        + json.dumps(
            {
                "technologies": ["React", "TypeScript", "FastAPI", "Ollama", "Gemini"],
                "source": "https://github.com/jacklvd/arch-sketch",
                "demo": None,
                "image": "https://images.unsplash.com/photo-1755548218134-ae9862203fe1?auto=format&fit=crop&w=1600&q=80",
                "featured": True,
                "order": 1,
            },
            separators=(",", ":"),
        ).join(["<!-- proj:", " -->"])
        + "\n\n"
        "## What it does\n\n"
        "Describe a system in plain language — user flows, functional and "
        "non-functional requirements — and get back interactive, draggable "
        "diagrams: high-level architecture, database schema, API design, and "
        "low-level component breakdowns, auto-laid-out with dagre and rendered "
        "with React Flow.\n\n"
        "## How it works\n\n"
        "A FastAPI backend routes each request to a local Ollama model "
        "(`gemma4:e2b`) first, falling back to Google's Gemini "
        "(`gemini-2.5-flash`) for more complex designs or when Ollama isn't "
        "available — so simple diagrams stay fast and free, and only the "
        "harder cases spend a cloud API call.\n\n"
        "## Stack\n\n"
        "Vite + React 19 + TypeScript on the frontend, Tailwind CSS v4 for "
        "styling, Zustand for state, and a Python 3.14 FastAPI backend with "
        "Pydantic v2 request validation.",
    ),
    (
        "D_kwDOSzzhEc4AnoNP",  # Frondly #13
        "An AI-powered plant-care and foraging concierge agent — snap a photo for "
        "an instant health diagnosis, a personalized watering plan, and "
        "edible-vs-toxic foraging safety checks. Built for the Kaggle AI Agents "
        "Intensive capstone.\n\n"
        + json.dumps(
            {
                "technologies": ["React Native", "Python", "FastAPI", "Gemini", "Firebase"],
                "source": "https://github.com/jacklvd/frondly-world",
                "demo": None,
                "image": "https://images.unsplash.com/photo-1641977563529-7b617571393d?auto=format&fit=crop&w=1600&q=80",
                "featured": True,
                "order": 2,
            },
            separators=(",", ":"),
        ).join(["<!-- proj:", " -->"])
        + "\n\n"
        "## What it does\n\n"
        "Frondly is a personal plant-care and foraging concierge agent. Point a "
        "camera at a houseplant and it identifies the species, diagnoses its "
        "health from the photo, and streams back a plain-language explanation, "
        "a health score, and a care plan — remembering the conversation so you "
        "can ask follow-ups. It also schedules watering per plant using "
        "species, room, light, and live local weather instead of a fixed "
        "calendar.\n\n"
        "## Foraging mode\n\n"
        "Outdoors, the same camera flow checks a wild plant against a "
        "research-verified Pacific Northwest dataset and sorts it into edible, "
        "not-edible, or toxic, with lookalike warnings — always paired with a "
        "safety reminder, never a bare \"it's edible.\"\n\n"
        "## Why an agent, not a classifier\n\n"
        "Plant care isn't one API call, it's reasoning over messy visual input "
        "and picking the right tool: identify vs. diagnose vs. compute a "
        "watering schedule vs. fetch weather. A Google ADK agent (Gemini 2.5) "
        "orchestrates those tools and holds context across a diagnosis "
        "conversation.\n\n"
        "## Stack\n\n"
        "Expo (React Native) client, FastAPI + Google ADK backend, Gemini 2.5, "
        "and Firebase for auth and per-user Firestore backups.",
    ),
    (
        "D_kwDOSzzhEc4AnoNQ",  # Sidekick Cat #14
        "A self-hosted GitHub code-review bot with its own branded App identity — "
        "reviews every PR inline, answers slash commands, and runs on free-tier "
        "LLMs for about $0/month.\n\n"
        + json.dumps(
            {
                "technologies": ["Python", "Cloud Run", "Groq", "GitHub App"],
                "source": "https://github.com/jacklvd/sidekick-cat",
                "demo": "https://sidekick-cat-guide.streamlit.app/",
                "image": "https://images.unsplash.com/photo-1651520998049-0d4508b5fae2?auto=format&fit=crop&w=1600&q=80",
                "featured": True,
                "order": 3,
            },
            separators=(",", ":"),
        ).join(["<!-- proj:", " -->"])
        + "\n\n"
        "## What it does\n\n"
        "Sidekick Cat is a self-hosted GitHub code-review bot with its own "
        "name, its own face, and a $0 hosting bill. It welcomes new PRs, checks "
        "the description for a TL;DR/What/Why/Test breakdown, labels the PR by "
        "the files it touches, and posts a short AI summary — then reviews on "
        "demand with `/review`, leaving inline notes on the exact changed "
        "lines plus a verdict.\n\n"
        "## Why it's different from `github-actions[bot]`\n\n"
        "It's a real, branded GitHub App — its own avatar and voice in every "
        "comment — installed once per account rather than copy-pasted as a "
        "workflow file into every repo. Inline review threads reconcile on "
        "re-run instead of piling up duplicates, and `/merge` won't ship until "
        "they're resolved.\n\n"
        "## Staying free and safe\n\n"
        "Both LLM providers behind it (Groq and GitHub Models) are no-card "
        "free tiers, so inference can only ever 429, never bill, and Cloud Run "
        "scales to zero between events. Daily caps, a circuit breaker, and a "
        "loop guard are built into the request path so it can't run up a bill "
        "even if something goes wrong.\n\n"
        "## Stack\n\n"
        "Python 3.13 managed with uv, deployed on Google Cloud Run, backed by "
        "Firestore for state.",
    ),
    (
        "D_kwDOSzzhEc4AnoNR",  # TruthLens #15
        "A privacy-first deepfake verification dApp built for the Midnight "
        "blockchain hackathon — an off-chain AI classifier scores an image and "
        "commits a zero-knowledge-backed verdict on-chain without the image "
        "itself ever being revealed.\n\n"
        + json.dumps(
            {
                "technologies": ["Next.js", "TypeScript", "FastAPI", "Compact"],
                "source": "https://github.com/jacklvd/midnight-hack",
                "demo": "https://truthlens-orpin-gamma.vercel.app/",
                "image": "https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=1600&q=80",
                "featured": True,
                "order": 4,
            },
            separators=(",", ":"),
        ).join(["<!-- proj:", " -->"])
        + "\n\n"
        "## What it does\n\n"
        "TruthLens is a privacy-first deepfake verification dApp, built for the "
        "Midnight blockchain hackathon. Drop in an image, and an off-chain AI "
        "classifier (a Hugging Face ViT model) scores it as real or fake — "
        "then the verdict, a hash of the image, and which model was used get "
        "committed to a Midnight smart contract. The image itself, the model "
        "weights, and every intermediate output stay private; only the hash "
        "and verdict become public.\n\n"
        "## Why Midnight\n\n"
        "Midnight is a blockchain with privacy built in: you can prove a piece "
        "of work happened without revealing the inputs or the model internals. "
        "The smart contract is written in Compact, Midnight's privacy-circuit "
        "language, using its witness/disclose pattern — private data flows in "
        "through a witness, and only values explicitly disclosed reach the "
        "public ledger.\n\n"
        "## Stack\n\n"
        "A FastAPI backend runs the deepfake classifier, a small Node.js "
        "sidecar owns the Midnight contract calls, and a Next.js + Tailwind + "
        "shadcn/ui frontend ties it together — deployed on Hugging Face Spaces "
        "and Vercel.",
    ),
]

for discussion_id, body in updates:
    result = gql(UPDATE_BODY_MUTATION, {"discussionId": discussion_id, "body": body})
    print("updated:", result["updateDiscussion"]["discussion"])
```

- [ ] **Step 2: Run it**

```bash
source <(grep -E '^GH_ACCESS_TOKEN=' .env) && export GH_ACCESS_TOKEN && \
python3 /path/to/scratchpad/add-project-details.py
```

Expected output: 4 lines, `updated: {'id': '...', 'number': 12, 'title': 'ArchSketch'}` etc. (numbers 12-15).

- [ ] **Step 3: Verify against the live site**

Run: `yarn dev`, then visit:
- `http://localhost:3000/work/arch-sketch` → hero shows the whiteboard photo, body shows the "What it does / How it works / Stack" sections (not the raw README).
- `http://localhost:3000/work/frondly-world`, `/work/sidekick-cat`, `/work/midnight-hack` → same check.
- `http://localhost:3000/meet-jack#work` → the 4 featured bento cards now show the new curated photos instead of GitHub's auto-generated OG image.

Check both light and dark theme (the theme toggle in the site header) on at least one detail page, to confirm the `prose-*` dark-mode classes from Task 5 render legibly.

Stop the dev server when done.

- [ ] **Step 4: Clean up**

```bash
rm /path/to/scratchpad/add-project-details.py
```

(Nothing to commit — this task only pushed content to GitHub Discussions.)

---

## Self-review notes

- **Spec coverage:** content model (Tasks 1-2), README fallback (Task 3), deps + theme (Tasks 4-5), routing + 404 (Task 6), card wiring (Task 7), image host (Task 8), content authoring (Task 9) — every spec section has a task.
- **Type consistency checked:** `GithubProject.slug`/`.detail` (Task 2) match the `project.slug`/`project.detail` usages in Task 5/6; `Work.slug`/`.detail` (Task 7) are separate (optional) fields on the older merge-friendly type, consistent with how `Work.image: any` already differs from `GithubProject.image: string`.
- **No placeholders:** the Task 9 script contains the actual chosen image URLs and actual write-up copy, not TODOs — these were resolved via web search during planning, not deferred to execution time.
