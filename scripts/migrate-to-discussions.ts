/**
 * One-time, idempotent migration: seeds GitHub Discussions from the current
 * Sanity data (projects + experience) and the hard-coded publications list.
 *
 * Run:  npx -y tsx scripts/migrate-to-discussions.ts
 *
 * Safe to re-run: existing project discussions (matched by title) and existing
 * experience/publication comments (matched by exp.id / pub.url) are skipped.
 * Prints the Experience/Publications discussion numbers + node ids to paste
 * into .env afterwards.
 */
import { readFileSync } from 'fs'

// --- tiny .env loader (no dependency) ---------------------------------------
function loadEnv() {
  let raw = ''
  try {
    raw = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  } catch {
    return
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}
loadEnv()

const TOKEN = process.env.GH_ACCESS_TOKEN
const REPO_OWNER = process.env.GUESTBOOK_REPO_OWNER
const REPO_NAME = process.env.GUESTBOOK_REPO_NAME
const PROJECTS_CATEGORY_ID = process.env.PROJECTS_CATEGORY_ID ?? 'DIC_kwDOSzzhEc4C-tbO'
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID
const SANITY_DATASET = process.env.SANITY_DATASET

if (!TOKEN || !REPO_OWNER || !REPO_NAME) {
  throw new Error('Missing GH_ACCESS_TOKEN / GUESTBOOK_REPO_OWNER / GUESTBOOK_REPO_NAME in .env')
}
if (!SANITY_PROJECT_ID || !SANITY_DATASET) {
  throw new Error('Missing SANITY_PROJECT_ID / SANITY_DATASET in .env')
}

const GH_API = process.env.GH_API_URL ?? 'https://api.github.com/graphql'

async function gh<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(GH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `token ${TOKEN}` },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data as T
}

// --- Sanity reads -----------------------------------------------------------
async function sanityQuery<T>(groq: string): Promise<T> {
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v2024-05-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.error) throw new Error(JSON.stringify(json.error))
  return json.result as T
}

interface SanityWork {
  title: string
  description: string
  technologies: string[]
  source: string
  demo: string | null
  img: string | null
}
interface SanityExp {
  id: number
  position: string
  company: string
  date: string
  url: string
  description: string[]
}

// Publications are currently hard-coded in publications.tsx — mirrored here.
const PUBLICATIONS = [
  {
    title: 'Real-time Speech Summarization for Medical Conversations',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.15888',
    abstract:
      'In doctor-patient conversations, identifying medically relevant information is crucial, posing the need for conversation summarization. We propose the first deployable real-time speech summarization system for real-world applications in industry, generating a local summary after every N speech utterances and a global summary at the end of a conversation.',
  },
  {
    title: 'Medical Spoken Named Entity Recognition',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.13337',
    abstract:
      'Spoken Named Entity Recognition (NER) aims to extract named entities from speech and categorize them into types like person, location, organization, etc. We present VietMed-NER — the first spoken NER dataset in the medical domain.',
  },
  {
    title: 'Sentiment Reasoning for Healthcare',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2407.21054',
    abstract:
      'Transparency in AI healthcare decision-making is crucial for building trust. Incorporating reasoning capabilities enables Large Language Models to understand emotions in context, handle nuanced language, and infer unstated sentiments.',
  },
]

// --- repo lookup ------------------------------------------------------------
interface RepoInfo {
  repository: {
    id: string
    discussionCategories: { nodes: { id: string; name: string }[] }
    discussions: { nodes: { number: number; id: string; title: string }[] }
  }
}

async function getRepoInfo(): Promise<RepoInfo['repository']> {
  const data = await gh<RepoInfo>(`{
    repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
      id
      discussionCategories(first: 25) { nodes { id name } }
      discussions(first: 100) { nodes { number id title } }
    }
  }`)
  return data.repository
}

async function getCommentBodies(discussionNumber: number): Promise<string[]> {
  const data = await gh<{
    repository: { discussion: { comments: { nodes: { body: string }[] } } | null }
  }>(`{
    repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
      discussion(number: ${discussionNumber}) { comments(first: 100) { nodes { body } } }
    }
  }`)
  return data.repository.discussion?.comments.nodes.map((n) => n.body) ?? []
}

const CREATE_DISCUSSION = `
  mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }) {
      discussion { number id }
    }
  }`

const ADD_COMMENT = `
  mutation($discussionId: ID!, $body: String!) {
    addDiscussionComment(input: { discussionId: $discussionId, body: $body }) { comment { id } }
  }`

async function main() {
  const repo = await getRepoInfo()
  const categories = repo.discussionCategories.nodes
  const generalCat = categories.find((c) => c.name === 'General')
  if (!generalCat) throw new Error(`No "General" category. Found: ${categories.map((c) => c.name).join(', ')}`)

  // ---- Projects: one discussion per work, in "Show and tell" --------------
  const works = await sanityQuery<SanityWork[]>(
    '*[_type=="work"]|order(orderRank){title,description,technologies,source,demo,"img":image.asset->url}',
  )
  const existingTitles = new Set(repo.discussions.nodes.map((d) => d.title))
  let projOrder = 1
  for (const w of works) {
    const featured = projOrder <= 4
    const meta = {
      technologies: w.technologies ?? [],
      source: w.source,
      demo: w.demo ?? null,
      image: w.img ?? null,
      featured,
      order: projOrder,
    }
    if (existingTitles.has(w.title)) {
      console.log(`SKIP project (exists): ${w.title}`)
    } else {
      const body = `${w.description}\n\n<!-- proj:${JSON.stringify(meta)} -->`
      await gh(CREATE_DISCUSSION, {
        repositoryId: repo.id,
        categoryId: PROJECTS_CATEGORY_ID,
        title: w.title,
        body,
      })
      console.log(`CREATED project: ${w.title} (order ${projOrder}, featured ${featured})`)
    }
    projOrder++
  }

  // ---- helper: ensure a parent discussion exists in General ---------------
  async function ensureParent(title: string, intro: string) {
    const existing = repo.discussions.nodes.find((d) => d.title === title)
    if (existing) {
      console.log(`Parent exists: ${title} (#${existing.number})`)
      return existing
    }
    const data = await gh<{ createDiscussion: { discussion: { number: number; id: string } } }>(
      CREATE_DISCUSSION,
      { repositoryId: repo.id, categoryId: generalCat!.id, title, body: intro },
    )
    const d = data.createDiscussion.discussion
    console.log(`CREATED parent: ${title} (#${d.number})`)
    return d
  }

  // ---- Experience: one comment per job ------------------------------------
  const exps = await sanityQuery<SanityExp[]>(
    '*[_type=="experience"]|order(id){id,position,company,date,url,description}',
  )
  const expParent = await ensureParent(
    'Experience',
    'Work experience entries. Each comment is one role; edit the `exp:{...}` block to update the site.',
  )
  const expBodies = await getCommentBodies(expParent.number)
  for (const e of exps) {
    if (expBodies.some((b) => b.includes('exp:') && b.includes(`"id":${e.id},`))) {
      console.log(`SKIP experience (exists): ${e.company} #${e.id}`)
      continue
    }
    const meta = {
      id: e.id,
      position: e.position,
      company: e.company,
      date: e.date,
      url: e.url,
      description: e.description ?? [],
    }
    const bullets = (e.description ?? []).map((d) => `- ${d}`).join('\n')
    const body = `**${e.position} — ${e.company}** (${e.date})\n\n${bullets}\n\n<!-- exp:${JSON.stringify(meta)} -->`
    await gh(ADD_COMMENT, { discussionId: expParent.id, body })
    console.log(`ADDED experience: ${e.company} #${e.id}`)
  }

  // ---- Publications: one comment per paper --------------------------------
  const pubParent = await ensureParent(
    'Publications',
    'Publication entries. Each comment is one paper; edit the `pub:{...}` block to update the site.',
  )
  const pubBodies = await getCommentBodies(pubParent.number)
  for (const p of PUBLICATIONS) {
    if (pubBodies.some((b) => b.includes(p.url) && b.includes('pub:'))) {
      console.log(`SKIP publication (exists): ${p.title}`)
      continue
    }
    const body = `**${p.title}** (${p.year})\n\n${p.abstract}\n\n<!-- pub:${JSON.stringify(p)} -->`
    await gh(ADD_COMMENT, { discussionId: pubParent.id, body })
    console.log(`ADDED publication: ${p.title}`)
  }

  console.log('\n=== Add these to .env ===')
  console.log(`EXPERIENCE_DISCUSSION_NUMBER=${expParent.number}`)
  console.log(`EXPERIENCE_DISCUSSION_ID=${expParent.id}`)
  console.log(`PUBLICATIONS_DISCUSSION_NUMBER=${pubParent.number}`)
  console.log(`PUBLICATIONS_DISCUSSION_ID=${pubParent.id}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
