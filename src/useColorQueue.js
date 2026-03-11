import { useState, useCallback } from 'react'

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(colorNames, seedName) {
  const rest = shuffled(colorNames.filter(n => n !== seedName))
  return seedName ? [seedName, ...rest] : rest
}

export function useColorQueue(colors, seedName) {
  const [state, setState] = useState(() => {
    const queue = buildQueue(Object.keys(colors), seedName)
    return { queue, index: 0, history: [] }
  })

  const currentName = state.queue[state.index]

  const next = useCallback(() => {
    setState(s => {
      const nextIndex = s.index + 1
      if (nextIndex < s.queue.length) {
        return { ...s, index: nextIndex, history: [...s.history, s.index] }
      }
      // Reshuffle when exhausted
      const queue = shuffled(Object.keys(colors))
      return { queue, index: 0, history: [] }
    })
  }, [colors])

  const prev = useCallback(() => {
    setState(s => {
      if (s.history.length === 0) return s
      const prevIndex = s.history[s.history.length - 1]
      return { ...s, index: prevIndex, history: s.history.slice(0, -1) }
    })
  }, [])

  return { currentName, next, prev }
}
