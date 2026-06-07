// Public identifiers only — safe to expose to the browser. No token here: the
// production dataset is public and we only read published content, so an auth
// token is unnecessary (and must never be shipped client-side).
export const SANITY_DATASET = process.env.SANITY_DATASET
export const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID
