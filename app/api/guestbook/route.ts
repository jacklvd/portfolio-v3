import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  isGuestbookConfigured,
  NOTE_COLORS,
  DEFAULT_NOTE_COLOR,
} from '@/lib/guestbook/client'
import { getNotes, addNote, hasNoteFromIp, hashIp, type Note } from '@/lib/guestbook'

// GitHub GraphQL + node `crypto` need the Node runtime (not edge).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Shown when the guestbook isn't configured yet (local dev without env). Lets
// the wall render so the UI can be designed/verified without a live backend.
const DEMO_NOTES: Note[] = [
  {
    name: 'Megan',
    message: 'Love the magic-book vibe — the wavy borders are such a nice touch! ✨',
    color: 'blush',
    createdAt: '2026-06-05T10:00:00.000Z',
  },
  {
    name: 'Sam',
    message: 'Came for the portfolio, stayed for the guestbook. Keep building!',
    color: 'sky',
    createdAt: '2026-06-04T18:30:00.000Z',
  },
  {
    name: 'Aisha',
    message: 'This is the coolest contact section I have seen. Hi from Boston 👋',
    color: 'mint',
    createdAt: '2026-06-03T09:15:00.000Z',
  },
]

const noteSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(40, 'Name is too long'),
  message: z
    .string()
    .trim()
    .min(5, 'Message is too short')
    .max(280, 'Message is too long'),
  color: z.enum(NOTE_COLORS).catch(DEFAULT_NOTE_COLOR),
  // Honeypot: real users leave this empty; bots tend to fill every field.
  website: z.string().max(0).optional().or(z.literal('')),
})

function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() ?? 'unknown'
}

export async function GET() {
  if (!isGuestbookConfigured) {
    return NextResponse.json({ notes: DEMO_NOTES, demo: true })
  }
  try {
    const notes = await getNotes()
    return NextResponse.json({ notes })
  } catch (err) {
    console.error('guestbook GET failed:', err)
    return NextResponse.json({ error: 'Could not load the guestbook.' }, { status: 502 })
  }
}

export async function POST(req: Request) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = noteSchema.safeParse(json)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid note.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
  const { name, message, color, website } = parsed.data

  // Honeypot tripped — pretend success so bots don't learn anything.
  if (website) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  if (!isGuestbookConfigured) {
    return NextResponse.json(
      { error: 'The guestbook is not available right now.' },
      { status: 503 },
    )
  }

  const iph = hashIp(getClientIp(req))

  try {
    // One note per person (see lib/guestbook/client for the shared-IP caveat;
    // relax by keying on iph + a time window instead of iph alone).
    if (await hasNoteFromIp(iph)) {
      return NextResponse.json(
        { error: "Looks like you've already signed the guestbook 💛" },
        { status: 409 },
      )
    }
    const note = await addNote({ name, message, color, iph })
    return NextResponse.json({ note }, { status: 201 })
  } catch (err) {
    console.error('guestbook POST failed:', err)
    return NextResponse.json({ error: 'Could not save your note.' }, { status: 502 })
  }
}
