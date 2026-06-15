import { describe, it, expect } from 'vitest'
import { parseExpComment } from './index'

describe('parseExpComment', () => {
  it('parses a well-formed exp metadata block', () => {
    const body = [
      '**Software Engineer Intern — Shopify Inc** (June, 2026 - August, 2026)',
      '',
      '- Currently work in Banking Security team!',
      '',
      '<!-- exp:{"id":1,"position":"Software Engineer Intern","company":"Shopify Inc","date":"June, 2026 - August, 2026","url":"https://www.shopify.com/","description":["Currently work in Banking Security team!"]} -->',
    ].join('\n')
    const exp = parseExpComment(body, 'C_node1')
    expect(exp).not.toBeNull()
    expect(exp!._id).toBe('C_node1')
    expect(exp!.id).toBe(1)
    expect(exp!.company).toBe('Shopify Inc')
    expect(exp!.description).toEqual(['Currently work in Banking Security team!'])
  })

  it('returns null when there is no exp block', () => {
    expect(parseExpComment('just a normal comment', 'C_x')).toBeNull()
  })

  it('returns null when required fields are missing', () => {
    const body = '<!-- exp:{"id":2,"company":"X"} -->'
    expect(parseExpComment(body, 'C_y')).toBeNull()
  })

  it('returns null when the exp block contains invalid JSON', () => {
    const body = '<!-- exp:{position: "Intern", company: "X"} -->' // unquoted keys
    expect(parseExpComment(body, 'C_z')).toBeNull()
  })
})
