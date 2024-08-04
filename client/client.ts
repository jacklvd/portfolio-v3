import { createClient } from '@sanity/client'
import imageBuilder from '@sanity/image-url'
import { SANITY_DATASET, SANITY_PROJECT_ID, SANITY_TOKEN } from './constants'

export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: true,
  ignoreBrowserTokenWarning: true,
  token: SANITY_TOKEN,
})

const builder = imageBuilder(client)

export const urlFor = (source: any) => builder.image(source)
