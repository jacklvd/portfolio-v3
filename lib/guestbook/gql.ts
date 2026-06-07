import {
  GUESTBOOK_REPO_OWNER,
  GUESTBOOK_REPO_NAME,
  GUESTBOOK_DISCUSSION_NUMBER,
} from './client'

// Reads the comments on the guestbook discussion. We request the raw `body`
// (markdown) so we can parse the embedded `gb:{...}` metadata, plus
// `isMinimized` so hidden/spam comments can be filtered out (free moderation).
export function notesQuery() {
  return `{
    repository(owner: "${GUESTBOOK_REPO_OWNER}", name: "${GUESTBOOK_REPO_NAME}") {
      discussion(number: ${GUESTBOOK_DISCUSSION_NUMBER}) {
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

// Appends a new note as a comment on the discussion. The body is built
// server-side; `discussionId` is the discussion's node id.
export const addNoteMutation = `
  mutation AddNote($discussionId: ID!, $body: String!) {
    addDiscussionComment(input: { discussionId: $discussionId, body: $body }) {
      comment { id }
    }
  }
`
