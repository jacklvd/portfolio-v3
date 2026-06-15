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
