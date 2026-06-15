import {
  EXPERIENCE_REPO_OWNER,
  EXPERIENCE_REPO_NAME,
  EXPERIENCE_DISCUSSION_NUMBER,
} from './client'

// Reads the comments on the Experience discussion. `body` carries the embedded
// exp:{...} metadata; `id` becomes the React key; minimized comments are hidden.
export function experienceQuery() {
  return `{
    repository(owner: "${EXPERIENCE_REPO_OWNER}", name: "${EXPERIENCE_REPO_NAME}") {
      discussion(number: ${EXPERIENCE_DISCUSSION_NUMBER}) {
        comments(first: 100) {
          nodes {
            id
            body
            isMinimized
          }
        }
      }
    }
  }`
}
