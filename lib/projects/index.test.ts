import { describe, it, expect } from 'vitest'
import { sortByOrder, type GithubProject } from './index'

function mk(title: string, order?: number): GithubProject {
  return {
    _id: `gh-${title}`,
    title,
    description: '',
    technologies: [],
    source: 'https://github.com/x/y',
    image: '',
    featured: false,
    order: order ?? Number.MAX_SAFE_INTEGER,
  }
}

describe('sortByOrder', () => {
  it('sorts ascending by order, undefined-order items last', () => {
    const out = sortByOrder([mk('c', 3), mk('a', 1), mk('z'), mk('b', 2)])
    expect(out.map((p) => p.title)).toEqual(['a', 'b', 'c', 'z'])
  })
})
