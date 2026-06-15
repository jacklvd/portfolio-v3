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
