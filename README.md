# jackvd.com

Personal portfolio for Jack Vo — Software Engineer ^^. A hand-drawn **"magic book"** themed site: wavy ink borders, script display fonts, paper-scrap stickers, and a little ink-doodle pet that wanders the page.

[![Live](https://img.shields.io/badge/live-jackvd.com-ff69b4?style=flat-square)](https://jackvd.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)](./LICENSE)

Live at [jackvd.com](https://jackvd.com).

## Highlights

- **Title-page landing** (`/`) — a wavy-framed book cover with draggable paper-scrap stickers, a 3D backdrop, and faint ink flourishes (moon, constellation, sparkles).
- **`/meet-jack`** — the portfolio proper: About, Experience, Projects, Research, and a Guestbook, with a left-rail section nav and a macOS-style magnify dock.
- **Guestbook** — visitors leave handwritten notes rendered as a wall of paper cards. Backed by **GitHub Discussions** (no visitor account needed); long notes truncate to a preview and open in full on click.
- **Dual-source projects** — projects merge **Sanity** entries with **GitHub Discussions** (a "Show and tell" category), so a new project can be added just by opening a discussion — no code change.
- **Site pet** — an ink-doodle companion with physics (walk / drag / throw / poke), section-aware quips, and a hat menu. It also stars in the page **loader**.
- Dark / light / system themes, a dark-mode star field, and a custom cursor.

## Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| Framework     | Next.js 16 (App Router)                   |
| Language      | TypeScript                                |
| Styling       | Tailwind CSS                              |
| Animation     | Framer Motion / Motion                    |
| 3D            | Three.js, React Three Fiber, Drei         |
| UI Primitives | Radix UI (shadcn/ui)                      |
| Data          | Sanity CMS + GitHub Discussions (GraphQL) |
| Forms         | React Hook Form + Zod                     |
| Theme         | next-themes                               |
| Icons         | Lucide, Radix Icons, Tabler               |

## Getting started

**Prerequisites:** Node.js 22+, Yarn

```bash
git clone https://github.com/jacklvd/portfolio-v3.git
cd portfolio-v3
yarn install
```

Create a `.env` file (see [Environment variables](#environment-variables)). The site runs without the optional GitHub keys — the guestbook falls back to seeded demo notes and projects fall back to Sanity only.

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

```env
# Sanity — projects CMS. The `production` dataset is public + read-only,
# so NO token is needed (do not commit one; it gets bundled to the client).
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production

# GitHub GraphQL — powers the guestbook (write) and projects (read).
GH_API_URL=https://api.github.com/graphql
# Fine-grained PAT scoped to the Discussions repo, Discussions: Read & write.
GH_ACCESS_TOKEN=github_pat_...

# Guestbook — notes are comments on ONE discussion in a private repo.
GUESTBOOK_REPO_OWNER=jacklvd
GUESTBOOK_REPO_NAME=storybook-db
GUESTBOOK_DISCUSSION_NUMBER=1
GUESTBOOK_DISCUSSION_ID=D_kwDO...        # discussion node id (for the add-comment mutation)
GUESTBOOK_SALT=any_random_string         # salts the hashed-IP one-note-per-person guard

# Projects — node id of the Discussions category projects are read from
# (the "Show and tell" category). Defaults to a built-in id if unset.
PROJECTS_CATEGORY_ID=DIC_kwDO...
```

> These are read **server-side only** (in `app/api/*` and `lib/*`) and are never inlined into the client bundle. Set the same keys in your Vercel project for production.

## Content management

- **Add a project** — open a discussion in the GitHub "Show and tell" category (or add a Sanity entry). The two sources merge at `/api/projects`; no deploy required.
- **Guestbook notes** — submitted via `/api/guestbook`, stored as comments on the guestbook discussion. One note per person (salted-hashed IP + a `localStorage` soft-guard), `5–280` chars.
- **Moderation** — hide a note by **minimizing its comment** on GitHub; minimized comments are filtered out on read. Profanity is auto-screened by a GitHub Action in the `storybook-db` repo.

## Scripts

```bash
yarn dev           # development server
yarn build         # production build
yarn start         # production server
yarn lint          # ESLint
yarn format        # Prettier (write)
yarn format:check  # Prettier (check)
yarn test          # Vitest
yarn gen-project   # generate a project entry (Gemini + HF FLUX images)
```

## Project structure

```text
app/
  layout.tsx              # root layout, fonts, providers
  globals.css             # global styles, theme vars, site-pet keyframes
  page.tsx                # landing "title page" cover
  api/
    guestbook/route.ts    # GET notes / POST a note (GitHub Discussions)
    projects/route.ts     # merged Sanity + GitHub Discussions projects
  meet-jack/
    page.tsx              # main portfolio page
    components/           # about, experience, projects, publications, contact (Guestbook), section-nav
components/
  effects/                # wavy-frame theme, cover-doodles, stickers, typewriter, 3D scene
  pet/                    # site pet (physics, sprite, loader, hats, quips)
  magicui/                # magnify dock
  cursor/                 # custom cursor
  layout/                 # navbar (dock), footer
  loading/                # skeleton + (legacy) preloader
  theme/                  # theme provider + toggle
  ui/                     # shadcn/ui primitives
lib/
  guestbook/              # GitHub Discussions client + GraphQL (guestbook)
  projects/               # Sanity + GitHub Discussions client + GraphQL (projects)
client/                   # Sanity client config
constants/ context/ data/ hooks/ types/ utils/
```

## Code quality

Pre-commit hooks run automatically via Husky and lint-staged:

- **ESLint** — `eslint-config-next`
- **Prettier** — JS/TS, JSON, CSS, Markdown

## Deployment

Deployed on [Vercel](https://vercel.com). Connect the repo, add the environment variables above to the project settings, and deploy.

## License

MIT
