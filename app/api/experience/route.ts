import { NextResponse } from 'next/server'

import { isExperienceSourceConfigured } from '@/lib/experience/client'
import { getExperiences } from '@/lib/experience'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Experience entries sourced from GitHub Discussions (comments on the Experience
// discussion). Returns an empty list when unconfigured or on error so the UI
// degrades gracefully instead of crashing.
export async function GET() {
  if (!isExperienceSourceConfigured) {
    return NextResponse.json({ experiences: [] })
  }
  try {
    const experiences = await getExperiences()
    return NextResponse.json({ experiences })
  } catch (err) {
    console.error('experience GET failed:', err)
    return NextResponse.json({ experiences: [] })
  }
}
