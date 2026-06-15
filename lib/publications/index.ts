import { GH_API_URL, GH_ACCESS_TOKEN } from './client'
import { publicationsQuery } from './gql'

// Shape consumed by the Publications UI.
export interface Publication {
  title: string
  authors: string
  year: string
  url: string
  abstract?: string
}

// Pull the pub:{...} JSON out of a comment body. Returns null for
// foreign/malformed comments (must have at least a title and url).
export function parsePubComment(body: string): Publication | null {
  const match = body.match(/<!--\s*pub:(\{[\s\S]*?\})\s*-->/)
  if (!match) return null
  try {
    const d = JSON.parse(match[1])
    if (!d?.title || !d?.url) return null
    return {
      title: String(d.title),
      authors: String(d.authors ?? ''),
      year: String(d.year ?? ''),
      url: String(d.url),
      abstract: d.abstract ? String(d.abstract) : undefined,
    }
  } catch {
    return null
  }
}

interface PublicationsResponse {
  repository: {
    discussion: {
      comments: { nodes: { body: string; createdAt: string; isMinimized: boolean }[] }
    } | null
  }
}

// All publications, newest comment first (stable insertion order).
export async function getPublications(): Promise<Publication[]> {
  const res = await fetch(GH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${GH_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: publicationsQuery() }),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '))
  }
  const nodes = (json.data as PublicationsResponse).repository.discussion?.comments.nodes ?? []
  return nodes
    .filter((n) => !n.isMinimized)
    .map((n) => parsePubComment(n.body))
    .filter((p): p is Publication => p !== null)
}
