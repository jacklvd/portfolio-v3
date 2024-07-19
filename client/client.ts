import { createClient } from '@sanity/client'
import imageBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID as string,
  dataset: process.env.SANITY_DATASET as string,
  apiVersion: '2024-05-01',
  useCdn: true,
  ignoreBrowserTokenWarning: true,
  token: process.env.SANITY_TOKEN as string,
})

const builder = imageBuilder(client)

export const urlFor = (source: any) => builder.image(source)
