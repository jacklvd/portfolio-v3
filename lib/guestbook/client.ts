// Server-only config for the guestbook, which stores visitor notes as comments
// on a single GitHub Discussion in a (private) repo. Mirrors the myblog
// `server/client/client.ts` pattern. The token is read server-side only (in the
// API route) and is NEVER added to next.config's `env` block, so it is never
// shipped to the browser.

export const GH_API_URL = process.env.GH_API_URL ?? 'https://api.github.com/graphql'
export const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
export const GUESTBOOK_REPO_OWNER = process.env.GUESTBOOK_REPO_OWNER
export const GUESTBOOK_REPO_NAME = process.env.GUESTBOOK_REPO_NAME
// The discussion the notes are posted to: number for reads, node id for the mutation.
export const GUESTBOOK_DISCUSSION_NUMBER = process.env.GUESTBOOK_DISCUSSION_NUMBER
export const GUESTBOOK_DISCUSSION_ID = process.env.GUESTBOOK_DISCUSSION_ID
// Salt for hashing visitor IPs (one-note-per-person). Any random string.
export const GUESTBOOK_SALT = process.env.GUESTBOOK_SALT ?? ''

// True only when everything needed to read AND write is present. When false the
// API route falls back to seeded demo notes so the UI still renders locally.
export const isGuestbookConfigured = Boolean(
  GH_ACCESS_TOKEN &&
    GUESTBOOK_REPO_OWNER &&
    GUESTBOOK_REPO_NAME &&
    GUESTBOOK_DISCUSSION_NUMBER &&
    GUESTBOOK_DISCUSSION_ID,
)

// Paper-color palette lives in a client-safe module (shared with the UI).
export { NOTE_COLORS, DEFAULT_NOTE_COLOR, type NoteColor } from './colors'
