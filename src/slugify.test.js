import { describe, it, expect } from 'vitest'
import { slugify, unslugify } from './slugify.js'
import colors from './colors.json'

describe('slugify', () => {
  it('lowercases the name', () => {
    expect(slugify('Red')).toBe('red')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('Mango Tango')).toBe('mango-tango')
  })

  it('strips apostrophes', () => {
    expect(slugify("Screamin' Green")).toBe('screamin-green')
  })

  it('handles names with parentheses', () => {
    expect(slugify('Blue (I)')).toBe('blue-i')
  })

  it('handles hyphenated names', () => {
    expect(slugify('Blue-Gray')).toBe('blue-gray')
  })

  it('produces unique slugs for all colors in colors.json', () => {
    const names = Object.keys(colors)
    const slugs = names.map(slugify)
    const unique = new Set(slugs)
    expect(unique.size).toBe(names.length)
  })
})

describe('unslugify', () => {
  it('finds a color name by its slug', () => {
    expect(unslugify('red', colors)).toBe('Red')
  })

  it('finds a multi-word color name', () => {
    expect(unslugify('mango-tango', colors)).toBe('Mango Tango')
  })

  it('returns null for an unknown slug', () => {
    expect(unslugify('not-a-color', colors)).toBeNull()
  })
})
