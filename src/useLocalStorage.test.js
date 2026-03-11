import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage.js'

beforeEach(() => localStorage.clear())

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'classic'))
    expect(result.current[0]).toBe('classic')
  })

  it('persists a new value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'classic'))
    act(() => result.current[1]('immersive'))
    expect(result.current[0]).toBe('immersive')
    expect(localStorage.getItem('test-key')).toBe('"immersive"')
  })

  it('reads a pre-existing value from localStorage', () => {
    localStorage.setItem('test-key', '"immersive"')
    const { result } = renderHook(() => useLocalStorage('test-key', 'classic'))
    expect(result.current[0]).toBe('immersive')
  })

  it('supports a functional updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'classic'))
    act(() => result.current[1](prev => prev === 'classic' ? 'immersive' : 'classic'))
    expect(result.current[0]).toBe('immersive')
  })
})
