import { GH_API_URL, GH_ACCESS_TOKEN } from './client'
import { experienceQuery } from './gql'

// Shape consumed by the Experience UI.
export interface Experience {
  _id: string
  id: number
  position: string
  company: string
  date: string
  url: string
  description: string[]
}

// Pull the exp:{...} JSON out of a comment body. `_id` is the comment node id
// (used as the React key). Returns null for foreign/malformed comments.
export function parseExpComment(body: string, nodeId: string): Experience | null {
  const match = body.match(/<!--\s*exp:(\{[\s\S]*?\})\s*-->/)
  if (!match) return null
  try {
    const d = JSON.parse(match[1])
    if (!d?.position || !d?.company) return null
    return {
      _id: nodeId,
      id: typeof d.id === 'number' ? d.id : 0,
      position: String(d.position),
      company: String(d.company),
      date: String(d.date ?? ''),
      url: String(d.url ?? ''),
      description: Array.isArray(d.description) ? d.description.map(String) : [],
    }
  } catch {
    return null
  }
}

interface ExperienceResponse {
  repository: {
    discussion: {
      comments: { nodes: { id: string; body: string; isMinimized: boolean }[] }
    } | null
  }
}

// All experience entries, ordered by their numeric `id` ascending.
export async function getExperiences(): Promise<Experience[]> {
  const res = await fetch(GH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${GH_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: experienceQuery() }),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '))
  }
  const nodes = (json.data as ExperienceResponse).repository.discussion?.comments.nodes ?? []
  return nodes
    .filter((n) => !n.isMinimized)
    .map((n) => parseExpComment(n.body, n.id))
    .filter((e): e is Experience => e !== null)
    .sort((a, b) => a.id - b.id)
}
