// Projects can be sourced from GitHub Discussions (in addition to Sanity). Each
// project is one discussion in the PROJECTS category of the same private repo
// used by the guestbook. Reuses the shared server-side GitHub credentials.

export {
  GH_API_URL,
  GH_ACCESS_TOKEN,
  GUESTBOOK_REPO_OWNER as PROJECTS_REPO_OWNER,
  GUESTBOOK_REPO_NAME as PROJECTS_REPO_NAME,
} from '@/lib/guestbook/client'

import {
  GH_ACCESS_TOKEN,
  GUESTBOOK_REPO_OWNER,
  GUESTBOOK_REPO_NAME,
} from '@/lib/guestbook/client'

// The discussion category that holds project entries (default: "Show and tell").
export const PROJECTS_CATEGORY_ID =
  process.env.PROJECTS_CATEGORY_ID ?? 'DIC_kwDOSzzhEc4C-tbO'

export const isProjectsSourceConfigured = Boolean(
  GH_ACCESS_TOKEN && GUESTBOOK_REPO_OWNER && GUESTBOOK_REPO_NAME && PROJECTS_CATEGORY_ID,
)
