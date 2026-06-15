import {
  PUBLICATIONS_REPO_OWNER,
  PUBLICATIONS_REPO_NAME,
  PUBLICATIONS_DISCUSSION_NUMBER,
} from './client'

// Reads the comments on the Publications discussion in insertion order. `body`
// carries the embedded pub:{...} metadata; minimized comments are filtered on read.
export function publicationsQuery() {
  return `{
    repository(owner: "${PUBLICATIONS_REPO_OWNER}", name: "${PUBLICATIONS_REPO_NAME}") {
      discussion(number: ${PUBLICATIONS_DISCUSSION_NUMBER}) {
        comments(first: 100) {
          nodes {
            body
            createdAt
            isMinimized
          }
        }
      }
    }
  }`
}
