import { NextResponse } from 'next/server'

import { isPublicationsSourceConfigured } from '@/lib/publications/client'
import { getPublications } from '@/lib/publications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Publications sourced from GitHub Discussions (comments on the Publications
// discussion). Empty list when unconfigured or on error.
export async function GET() {
  if (!isPublicationsSourceConfigured) {
    return NextResponse.json({ publications: [] })
  }
  try {
    const publications = await getPublications()
    return NextResponse.json({ publications })
  } catch (err) {
    console.error('publications GET failed:', err)
    return NextResponse.json({ publications: [] })
  }
}
