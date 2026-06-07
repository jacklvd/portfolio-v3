import { urlFor } from '@/client/client'

// Resolves a project image to a URL string. Sanity projects store an image ref
// (resolved via urlFor); GitHub projects store a plain URL string. Client-safe.
export function projectImageUrl(image: unknown, width?: number): string {
  if (!image) return ''
  if (typeof image === 'string') return image
  try {
    const builder = urlFor(image)
    return width ? builder.width(width).url() : builder.url()
  } catch {
    return ''
  }
}
