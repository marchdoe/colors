import { useEffect } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { useLocalStorage } from './useLocalStorage.js'
import { useColorQueue } from './useColorQueue.js'
import { slugify, unslugify } from './slugify.js'
import ColorDisplay from './ColorDisplay.jsx'
import colors from './colors.json'

function ColorPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [mode, setMode] = useLocalStorage('color-view-mode', 'classic')

  const seedName = slug ? unslugify(slug, colors) : null
  const { currentName, next, prev } = useColorQueue(colors, seedName)
  const current = colors[currentName]

  // Keep URL in sync with current color.
  // Always use replace:true — this effect only syncs the address bar,
  // it does not create new browser history entries.
  useEffect(() => {
    const currentSlug = slugify(currentName)
    if (slug !== currentSlug) {
      navigate(`/${currentSlug}`, { replace: true })
    }
  }, [currentName, slug, navigate])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (['ArrowRight', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault()
        next()
      } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev])

  if (!current) return null

  return (
    <div onClick={next} style={{ minHeight: '100vh' }}>
      <ColorDisplay
        name={currentName}
        hex={current.Hexadecimal}
        R={current.R}
        G={current.G}
        B={current.B}
        H={current.H}
        S={current.S}
        V={current.V}
        notes={current.Notes}
        mode={mode}
        onToggleMode={() => setMode(m => m === 'classic' ? 'immersive' : 'classic')}
      />
    </div>
  )
}

// RandomRedirect picks a random color per render (per user session),
// not at module load time (which would give all users the same color per build).
function RandomRedirect() {
  const colorNames = Object.keys(colors)
  const randomSlug = slugify(colorNames[Math.floor(Math.random() * colorNames.length)])
  return <Navigate to={`/${randomSlug}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/:slug" element={<ColorPage />} />
      <Route path="/" element={<RandomRedirect />} />
    </Routes>
  )
}
