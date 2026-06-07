import { PROJECTS_REPO_OWNER, PROJECTS_REPO_NAME } from './client'

// Fetch all project discussions in the given category. `body` is the raw
// markdown (carries the proj:{...} metadata block); `bodyText` is the clean
// description; labels are an optional fallback for technologies.
export function projectsQuery(categoryId: string) {
  return `{
    repository(owner: "${PROJECTS_REPO_OWNER}", name: "${PROJECTS_REPO_NAME}") {
      discussions(first: 50, categoryId: "${categoryId}") {
        nodes {
          number
          title
          body
          bodyText
          createdAt
          labels(first: 20) { nodes { name } }
        }
      }
    }
  }`
}
