import { describe, it, expect } from 'vitest'
import { parsePubComment } from './index'

describe('parsePubComment', () => {
  it('parses a well-formed pub metadata block', () => {
    const body = [
      '**Medical Spoken Named Entity Recognition** (2024)',
      '',
      'Spoken NER aims to extract named entities from speech.',
      '',
      '<!-- pub:{"title":"Medical Spoken Named Entity Recognition","authors":"Co-author — Jack Vo","year":"2024","url":"https://arxiv.org/abs/2406.13337","abstract":"Spoken NER aims to extract named entities from speech."} -->',
    ].join('\n')
    const pub = parsePubComment(body)
    expect(pub).not.toBeNull()
    expect(pub!.title).toBe('Medical Spoken Named Entity Recognition')
    expect(pub!.year).toBe('2024')
    expect(pub!.url).toBe('https://arxiv.org/abs/2406.13337')
    expect(pub!.abstract).toContain('Spoken NER')
  })

  it('returns null when there is no pub block', () => {
    expect(parsePubComment('just a normal comment')).toBeNull()
  })

  it('returns null when title or url is missing', () => {
    expect(parsePubComment('<!-- pub:{"year":"2024"} -->')).toBeNull()
  })

  it('returns null when the pub block contains invalid JSON', () => {
    expect(parsePubComment('<!-- pub:{title: "X", url: "y"} -->')).toBeNull()
  })
})
