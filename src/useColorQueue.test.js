import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColorQueue } from './useColorQueue.js'

const TEST_COLORS = {
  Red:   { Hexadecimal: '#FF0000', Notes: 'test', R: '255', G: '0',   B: '0',   H: '0',   S: '100', V: '100' },
  Blue:  { Hexadecimal: '#0000FF', Notes: 'test', R: '0',   G: '0',   B: '255', H: '240', S: '100', V: '100' },
  Green: { Hexadecimal: '#00FF00', Notes: 'test', R: '0',   G: '255', B: '0',   H: '120', S: '100', V: '100' },
}

describe('useColorQueue', () => {
  it('starts with a color from the list', () => {
    const { result } = renderHook(() => useColorQueue(TEST_COLORS, null))
    expect(Object.keys(TEST_COLORS)).toContain(result.current.currentName)
  })

  it('starts with a specific color when a seed name is provided', () => {
    const { result } = renderHook(() => useColorQueue(TEST_COLORS, 'Blue'))
    expect(result.current.currentName).toBe('Blue')
  })

  it('advances to a different color on next()', () => {
    const { result } = renderHook(() => useColorQueue(TEST_COLORS, 'Red'))
    act(() => result.current.next())
    expect(result.current.currentName).not.toBe('Red')
  })

  it('goes back to the previous color on prev()', () => {
    const { result } = renderHook(() => useColorQueue(TEST_COLORS, 'Red'))
    act(() => result.current.next())
    act(() => result.current.prev())
    expect(result.current.currentName).toBe('Red')
  })

  it('prev() does nothing when at the beginning of history', () => {
    const { result } = renderHook(() => useColorQueue(TEST_COLORS, 'Red'))
    act(() => result.current.prev())
    expect(result.current.currentName).toBe('Red')
  })

  it('reshuffles when the queue is exhausted', () => {
    const { result } = renderHook(() => useColorQueue(TEST_COLORS, null))
    // Exhaust all 3 colors
    act(() => result.current.next())
    act(() => result.current.next())
    act(() => result.current.next())
    // Should still return a valid color, not crash
    expect(Object.keys(TEST_COLORS)).toContain(result.current.currentName)
  })
})
