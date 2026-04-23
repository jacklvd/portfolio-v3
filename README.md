# jackvd.com

Personal portfolio website for Jack Vo — Software Engineer.

Live at [jackvd.com](https://jackvd.com).

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion, Three.js |
| UI Primitives | Radix UI |
| CMS | Sanity |
| Theme | next-themes (dark / light / system) |
| Icons | Lucide React, Radix Icons |
| Forms | React Hook Form + Zod |

## Getting started

**Prerequisites:** Node.js 18+, Yarn

```bash
git clone https://github.com/jacklvd/portfolio-v3.git
cd portfolio-v3
yarn install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
```

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
yarn dev           # development server
yarn build         # production build
yarn start         # production server
yarn lint          # ESLint
yarn format        # Prettier (write)
yarn format:check  # Prettier (check)
```

## Project structure

```text
app/
  layout.tsx              # root layout, fonts, providers
  globals.css             # global styles and theme variables
  page.tsx                # home / redirect
  meet-jack/
    page.tsx              # main portfolio page
    components/
      about.tsx
      experience.tsx
      projects.tsx
      publications.tsx
      contact.tsx
components/
  client-app-content.tsx  # navbar, theme toggle, preloader
  stars-background.tsx    # animated star field (dark mode only)
  cursor/                 # custom cursor
  layout/                 # navbar, footer
  loading/                # skeleton + preloader
  theme/                  # theme provider + toggle
  ui/                     # shadcn/ui primitives
client/                   # Sanity client config
constants/                # shared constants
context/                  # React contexts (loading)
hooks/                    # custom hooks
lib/                      # utility functions
types/                    # TypeScript types
```

## Code quality

Pre-commit hooks run automatically via Husky and lint-staged:

- **ESLint** — linting with `eslint-config-next`
- **Prettier** — formatting for JS/TS, JSON, CSS, Markdown

## Deployment

Deployed on [Vercel](https://vercel.com). Connect your repo, add the environment variables above, and deploy.

## License

MIT
