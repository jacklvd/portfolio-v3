import { createHash } from 'crypto'

import {
  GH_API_URL,
  GH_ACCESS_TOKEN,
  GUESTBOOK_DISCUSSION_ID,
  GUESTBOOK_SALT,
  DEFAULT_NOTE_COLOR,
  NOTE_COLORS,
  type NoteColor,
} from './client'
import { notesQuery, addNoteMutation } from './gql'

// A note as exposed to the client. `iph` (hashed IP) is kept server-side only
// and never included here.
export interface Note {
  name: string
  message: string
  color: NoteColor
  createdAt: string
}

// Full record persisted in the comment body (includes the hashed IP).
interface StoredNote extends Note {
  v: number
  iph: string
}

// One-way, salted hash of a visitor IP — used to enforce one note per person
// without ever storing the raw IP.
export function hashIp(ip: string): string {
  return createHash('sha256').update(`${GUESTBOOK_SALT}:${ip}`).digest('hex')
}

function normalizeColor(value: unknown): NoteColor {
  return NOTE_COLORS.includes(value as NoteColor)
    ? (value as NoteColor)
    : DEFAULT_NOTE_COLOR
}

// Build a comment body that is both human-readable (for moderating in GitHub)
// and machine-parseable (the trailing HTML comment carries the real data).
function encodeBody(note: StoredNote): string {
  const meta = JSON.stringify(note)
  return `**${note.name}**\n\n${note.message}\n\n<!-- gb:${meta} -->`
}

// Pull the `gb:{...}` JSON back out of a comment body. Returns null if missing
// or malformed (older/foreign comments are simply ignored).
function parseBody(body: string): StoredNote | null {
  const match = body.match(/<!--\s*gb:(\{[\s\S]*?\})\s*-->/)
  if (!match) return null
  try {
    const data = JSON.parse(match[1])
    if (!data?.name || !data?.message) return null
    return {
      v: typeof data.v === 'number' ? data.v : 1,
      name: String(data.name),
      message: String(data.message),
      color: normalizeColor(data.color),
      iph: typeof data.iph === 'string' ? data.iph : '',
      createdAt: String(data.at ?? data.createdAt ?? ''),
    }
  } catch {
    return null
  }
}

async function githubGraphQL<T>(body: object): Promise<T> {
  const res = await fetch(GH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${GH_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '))
  }
  return json.data as T
}

interface NotesResponse {
  repository: {
    discussion: {
      comments: {
        nodes: { body: string; createdAt: string; isMinimized: boolean }[]
      }
    }
  }
}

// All stored notes (including hashed IPs), newest first. Minimized/hidden
// comments are filtered out — hide a comment in GitHub to remove it from the site.
async function getStoredNotes(): Promise<StoredNote[]> {
  const data = await githubGraphQL<NotesResponse>({ query: notesQuery() })
  const nodes = data.repository.discussion.comments.nodes ?? []
  const notes: StoredNote[] = []
  for (const node of nodes) {
    if (node.isMinimized) continue
    const parsed = parseBody(node.body)
    if (!parsed) continue
    // Trust the comment's own timestamp if the note didn't carry one.
    if (!parsed.createdAt) parsed.createdAt = node.createdAt
    notes.push(parsed)
  }
  return notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// Public-facing notes (no hashed IPs), newest first.
export async function getNotes(): Promise<Note[]> {
  const notes = await getStoredNotes()
  return notes.map(({ name, message, color, createdAt }) => ({
    name,
    message,
    color,
    createdAt,
  }))
}

// True if this hashed IP has already left a note.
export async function hasNoteFromIp(iph: string): Promise<boolean> {
  if (!iph) return false
  const notes = await getStoredNotes()
  return notes.some((n) => n.iph === iph)
}

// Persist a new note and return its public shape.
export async function addNote(input: {
  name: string
  message: string
  color: NoteColor
  iph: string
}): Promise<Note> {
  const createdAt = new Date().toISOString()
  const stored: StoredNote = {
    v: 1,
    name: input.name,
    message: input.message,
    color: input.color,
    iph: input.iph,
    createdAt,
  }
  await githubGraphQL({
    query: addNoteMutation,
    variables: { discussionId: GUESTBOOK_DISCUSSION_ID, body: encodeBody(stored) },
  })
  return { name: input.name, message: input.message, color: input.color, createdAt }
}
