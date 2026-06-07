import { NextResponse } from 'next/server'

import { isProjectsSourceConfigured } from '@/lib/projects/client'
import { getGithubProjects } from '@/lib/projects'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Projects sourced from GitHub Discussions. Sanity projects are fetched
// separately (client-side) and merged in the UI.
export async function GET() {
  if (!isProjectsSourceConfigured) {
    return NextResponse.json({ projects: [] })
  }
  try {
    const projects = await getGithubProjects()
    return NextResponse.json({ projects })
  } catch (err) {
    console.error('projects GET failed:', err)
    // Non-fatal: the UI still shows Sanity projects if this source fails.
    return NextResponse.json({ projects: [] })
  }
}
