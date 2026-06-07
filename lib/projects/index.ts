import { GH_API_URL, GH_ACCESS_TOKEN, PROJECTS_CATEGORY_ID } from './client'
import { projectsQuery } from './gql'

// Shape matches the global `Work` type used by the projects UI, so GitHub
// projects merge seamlessly with Sanity ones. `image` is a plain URL string
// here (Sanity ones are image refs resolved via urlFor).
export interface GithubProject {
  _id: string
  title: string
  description: string
  technologies: string[]
  source: string
  demo?: string
  image: string
  featured: boolean
}

interface ProjectMeta {
  technologies?: string[]
  source?: string
  demo?: string | null
  image?: string | null
  featured?: boolean
}

// GitHub's auto-generated social preview image for a repo, derived from its URL.
function githubOgImage(source: string): string {
  const m = source.match(/github\.com\/([^/]+)\/([^/?#]+)/)
  if (!m) return ''
  return `https://opengraph.githubassets.com/1/${m[1]}/${m[2].replace(/\.git$/, '')}`
}

function parseMeta(body: string): ProjectMeta {
  const match = body.match(/<!--\s*proj:(\{[\s\S]*?\})\s*-->/)
  if (!match) return {}
  try {
    return JSON.parse(match[1]) as ProjectMeta
  } catch {
    return {}
  }
}

// Strip the metadata comment to leave a clean description (bodyText already
// excludes HTML comments, but guard anyway).
function cleanDescription(bodyText: string): string {
  return bodyText.replace(/<!--\s*proj:[\s\S]*?-->/, '').trim()
}

interface ProjectsResponse {
  repository: {
    discussions: {
      nodes: {
        number: number
        title: string
        body: string
        bodyText: string
        labels: { nodes: { name: string }[] }
      }[]
    }
  }
}

export async function getGithubProjects(): Promise<GithubProject[]> {
  const res = await fetch(GH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${GH_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: projectsQuery(PROJECTS_CATEGORY_ID) }),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '))
  }

  const nodes = (json.data as ProjectsResponse).repository.discussions.nodes ?? []
  return nodes
    .map((node): GithubProject | null => {
      const meta = parseMeta(node.body)
      const source = meta.source ?? ''
      if (!source) return null // a project must have a source link
      const technologies =
        meta.technologies && meta.technologies.length > 0
          ? meta.technologies
          : node.labels.nodes.map((l) => l.name)
      return {
        _id: `gh-${node.number}`,
        title: node.title,
        description: cleanDescription(node.bodyText),
        technologies,
        source,
        demo: meta.demo ?? undefined,
        image: meta.image || githubOgImage(source),
        featured: Boolean(meta.featured),
      }
    })
    .filter((p): p is GithubProject => p !== null)
}
