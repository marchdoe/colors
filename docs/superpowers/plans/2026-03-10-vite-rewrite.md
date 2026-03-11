# Colors App — Vite Rewrite Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Colors app from React 15/CRA to Vite + React 19, preserving the design exactly while adding URL deep linking, keyboard navigation, an immersive view toggle, and updated color data.

**Architecture:** Single-page app with React Router v6 for URL-based color deep links. Color queue logic lives in a custom hook (`useColorQueue`). A single `ColorDisplay` component renders both Classic and Immersive views. View mode preference persisted in `localStorage`. All styles in plain CSS.

**Tech Stack:** Vite 5, React 19, React Router v6, Vitest + @testing-library/react, plain CSS.

---

## Chunk 1: Project Scaffold

### Task 1: Replace CRA with Vite

**Files:**
- Delete: `src/App/index.js`, `src/index.js`, `src/theme.js`, `public/index.html` (src/Color/ handled in Task 3)
- Create: `index.html` (root level, Vite convention)
- Create: `vite.config.js`
- Create: `src/test-setup.js`
- Modify: `package.json`

- [ ] **Step 1: Remove old source files**

```bash
rm -rf src/App src/index.js src/theme.js public/index.html
```

- [ ] **Step 2: Switch from yarn to npm and install dependencies**

The project uses yarn (yarn.lock present). We're moving to npm for Vite compatibility. Remove the lockfile and reinstall:

```bash
rm yarn.lock
npm install --save-dev vite @vitejs/plugin-react vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
npm install react@^19 react-dom@^19 react-router-dom
npm uninstall react-scripts rebass styled-components lodash.shuffle
```

- [ ] **Step 3: Create vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/colors/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
```

- [ ] **Step 4: Create index.html at the project root**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/colors/favicon.ico" />
    <title>Colors — by Doug March</title>
    <script>
      (function(l) {
        if (l.search[1] === '/') {
          var decoded = l.search.slice(1).split('&').map(function(s) {
            return s.replace(/~and~/g, '&')
          })
          window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded[0] +
            (decoded[1] ? '&' + decoded[1] : '') + l.hash
          )
        }
      }(window.location))
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Update package.json scripts**

Replace the `"scripts"` section with:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

- [ ] **Step 6: Create src/test-setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Verify Vite starts without error**

```bash
npm run dev
```

Expected: `VITE ready` message, dev server running (blank page is fine — no source files yet). `Ctrl+C` to stop.

- [ ] **Step 8: Commit scaffold**

```bash
git add index.html vite.config.js package.json package-lock.json src/test-setup.js
git commit -m "feat: replace CRA with Vite scaffold"
```

---

### Task 2: Add 404.html for GitHub Pages SPA routing

**Files:**
- Create: `public/404.html`

**Why:** GitHub Pages serves static files. Navigating directly to `marchdoe.github.io/colors/bluetiful` hits a 404 because there's no `bluetiful/index.html`. This file catches that 404, encodes the path into a query param, and redirects to the main `index.html`, which decodes it and restores the URL via `history.replaceState` (handled by the script already added in Task 1's `index.html`).

- [ ] **Step 1: Create public/404.html**

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Colors</title>
    <script>
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.host +
        l.pathname.split('/').slice(0, 2).join('/') +
        '/?/' +
        l.pathname.slice(1).split('/').slice(1).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/404.html
git commit -m "feat: add 404.html for GitHub Pages deep link support"
```

---

## Chunk 2: Color Data

### Task 3: Move and update color data

**Files:**
- Create: `src/colors.json` (moved from `src/Color/Color.json`, with additions)
- Delete: `src/Color/` directory

- [ ] **Step 1: Move existing color data**

```bash
cp src/Color/Color.json src/colors.json
rm -rf src/Color/
```

- [ ] **Step 2: Add missing colors to src/colors.json**

Open `src/colors.json`. Before the final closing `}`, add a comma after the last entry and then insert:

```json
  "Bluetiful": {
    "H": "211",
    "S": "51",
    "V": "86",
    "R": "108",
    "G": "160",
    "B": "220",
    "Hexadecimal": "#6CA0DC",
    "Notes": "Produced 2017–present. Replaced Dandelion in the 24-pack."
  },
  "Chestnut": {
    "H": "352",
    "S": "61",
    "V": "73",
    "R": "185",
    "G": "78",
    "B": "72",
    "Hexadecimal": "#B94E48",
    "Notes": "Produced 1999–present. Renamed from Indian Red in 1999."
  },
  "Neon Carrot": {
    "H": "27",
    "S": "100",
    "V": "100",
    "R": "255",
    "G": "163",
    "B": "67",
    "Hexadecimal": "#FFA343",
    "Notes": "Produced 1998–present."
  },
  "Atomic Tangerine": {
    "H": "16",
    "S": "100",
    "V": "100",
    "R": "255",
    "G": "164",
    "B": "116",
    "Hexadecimal": "#FF9966",
    "Notes": "Produced 1998–present."
  },
  "Sunglow": {
    "H": "44",
    "S": "100",
    "V": "100",
    "R": "255",
    "G": "204",
    "B": "51",
    "Hexadecimal": "#FFCC33",
    "Notes": "Produced 1998–present."
  },
  "Laser Lemon": {
    "H": "63",
    "S": "100",
    "V": "100",
    "R": "253",
    "G": "252",
    "B": "0",
    "Hexadecimal": "#FDFC00",
    "Notes": "Produced 1990–present."
  },
  "Screamin' Green": {
    "H": "120",
    "S": "100",
    "V": "100",
    "R": "118",
    "G": "255",
    "B": "122",
    "Hexadecimal": "#76FF7A",
    "Notes": "Produced 1990–present."
  },
  "Magic Mint": {
    "H": "146",
    "S": "49",
    "V": "100",
    "R": "170",
    "G": "240",
    "B": "209",
    "Hexadecimal": "#AAF0D1",
    "Notes": "Produced 1990–present."
  },
  "Robin Egg Blue": {
    "H": "185",
    "S": "73",
    "V": "82",
    "R": "57",
    "G": "192",
    "B": "210",
    "Hexadecimal": "#39C0D2",
    "Notes": "Produced 1993–present."
  },
  "Outrageous Orange": {
    "H": "16",
    "S": "71",
    "V": "100",
    "R": "255",
    "G": "110",
    "B": "74",
    "Hexadecimal": "#FF6E4A",
    "Notes": "Produced 1998–present."
  },
  "Hot Magenta": {
    "H": "312",
    "S": "89",
    "V": "100",
    "R": "255",
    "G": "29",
    "B": "206",
    "Hexadecimal": "#FF1DCE",
    "Notes": "Produced 1990–present."
  },
  "Piggy Pink": {
    "H": "353",
    "S": "13",
    "V": "100",
    "R": "253",
    "G": "221",
    "B": "230",
    "Hexadecimal": "#FDDDE6",
    "Notes": "Produced 1998–present."
  },
  "Electric Lime": {
    "H": "68",
    "S": "89",
    "V": "100",
    "R": "206",
    "G": "255",
    "B": "29",
    "Hexadecimal": "#CEFF1D",
    "Notes": "Produced 1990–present."
  }
```

- [ ] **Step 3: Verify the JSON is valid**

```bash
node -e "const c = require('./src/colors.json'); console.log('Colors:', Object.keys(c).length)"
```

Expected: `Colors: 176` (163 existing + 13 new = 176)

- [ ] **Step 4: Commit**

```bash
git add src/colors.json
git commit -m "feat: move and update color data, add 13 missing colors including Bluetiful"
```

---

## Chunk 3: Core Logic

### Task 4: slugify utility

**Files:**
- Create: `src/slugify.js`
- Create: `src/slugify.test.js`

- [ ] **Step 1: Write failing tests**

`src/slugify.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- slugify
```

Expected: FAIL — `Cannot find module './slugify.js'`

- [ ] **Step 3: Implement src/slugify.js**

```js
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function unslugify(slug, colors) {
  const entry = Object.keys(colors).find(name => slugify(name) === slug)
  return entry ?? null
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- slugify
```

Expected: All 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/slugify.js src/slugify.test.js
git commit -m "feat: add slugify utility with uniqueness check across all colors"
```

---

### Task 5: useColorQueue hook

**Files:**
- Create: `src/useColorQueue.js`
- Create: `src/useColorQueue.test.js`

- [ ] **Step 1: Write failing tests**

`src/useColorQueue.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- useColorQueue
```

Expected: FAIL — `Cannot find module './useColorQueue.js'`

- [ ] **Step 3: Implement src/useColorQueue.js**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- useColorQueue
```

Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/useColorQueue.js src/useColorQueue.test.js
git commit -m "feat: add useColorQueue hook with shuffle, history, and reshuffle"
```

---

## Chunk 4: UI

### Task 6: index.css — all styles

**Files:**
- Create: `src/index.css`

- [ ] **Step 1: Create src/index.css**

```css
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

*::selection {
  background: transparent;
}

/* ── Classic mode ─────────────────────────────── */

.color-page {
  min-height: 100vh;
}

.color-info {
  padding: 16px 16px 0;
  position: relative;
}

.color-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  padding-right: 40px;
}

.color-name {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 700;
  margin: 0;
  color: #111;
  line-height: 1.1;
}

.color-hex {
  font-size: clamp(0.85rem, 2vw, 1.1rem);
  color: #6f6f6f;
}

.divider {
  border: none;
  border-top: 1px solid #e3e3e3;
  margin: 10px 0;
}

.color-notes {
  font-size: clamp(0.9rem, 2.5vw, 1.25rem);
  color: #333;
  margin: 0 0 10px;
  line-height: 1.5;
  padding-right: clamp(16px, 8vw, 96px);
}

.color-values {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 12px;
}

.color-swatch {
  min-height: 80vh;
}

/* ── Toggle button ────────────────────────────── */

.view-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  color: #aaa;
  cursor: pointer;
  letter-spacing: 0.3px;
  line-height: 1;
  transition: color 0.15s, border-color 0.15s;
}

.view-toggle:hover {
  color: #666;
  border-color: #aaa;
}

/* ── Immersive mode ───────────────────────────── */

.color-page.immersive {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
}

.color-page.immersive .color-info {
  padding: 20px 20px 24px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.2));
}

.color-page.immersive .color-name {
  color: #fff;
}

.color-page.immersive .color-hex {
  color: rgba(255, 255, 255, 0.75);
}

.color-page.immersive .divider {
  border-top-color: rgba(255, 255, 255, 0.25);
}

.color-page.immersive .color-notes {
  color: rgba(255, 255, 255, 0.8);
}

.color-page.immersive .color-values {
  color: rgba(255, 255, 255, 0.65);
}

.color-page.immersive .view-toggle {
  border-color: rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.65);
}

.color-page.immersive .view-toggle:hover {
  border-color: rgba(255, 255, 255, 0.7);
  color: #fff;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: add CSS for classic and immersive view modes"
```

---

### Task 7: ColorDisplay component

**Files:**
- Create: `src/ColorDisplay.jsx`
- Create: `src/ColorDisplay.test.jsx`

- [ ] **Step 1: Write failing tests**

`src/ColorDisplay.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ColorDisplay from './ColorDisplay.jsx'

const PROPS = {
  name: 'Bluetiful',
  hex: '#6CA0DC',
  R: '108', G: '160', B: '220',
  H: '211', S: '51', V: '86',
  notes: 'Produced 2017–present.',
  mode: 'classic',
  onToggleMode: vi.fn(),
}

describe('ColorDisplay', () => {
  it('renders the color name as a heading', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByRole('heading', { name: 'Bluetiful' })).toBeInTheDocument()
  })

  it('renders the hex code', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('#6CA0DC')).toBeInTheDocument()
  })

  it('renders the notes', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('Produced 2017–present.')).toBeInTheDocument()
  })

  it('renders rgb values', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('rgb: 108, 160, 220')).toBeInTheDocument()
  })

  it('renders hsv values', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('hsv: 211, 51, 86')).toBeInTheDocument()
  })

  it('calls onToggleMode when the toggle button is clicked', async () => {
    const onToggleMode = vi.fn()
    render(<ColorDisplay {...PROPS} onToggleMode={onToggleMode} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onToggleMode).toHaveBeenCalledOnce()
  })

  it('does not propagate the toggle click to the parent', async () => {
    const onToggleMode = vi.fn()
    const onParentClick = vi.fn()
    render(
      <div onClick={onParentClick}>
        <ColorDisplay {...PROPS} onToggleMode={onToggleMode} />
      </div>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onParentClick).not.toHaveBeenCalled()
  })

  it('applies the immersive class in immersive mode', () => {
    const { container } = render(<ColorDisplay {...PROPS} mode="immersive" />)
    expect(container.firstChild).toHaveClass('immersive')
  })

  it('sets background color to the hex value in immersive mode', () => {
    const { container } = render(<ColorDisplay {...PROPS} mode="immersive" />)
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#6CA0DC' })
  })

  it('renders the color swatch in classic mode', () => {
    render(<ColorDisplay {...PROPS} mode="classic" />)
    expect(document.querySelector('.color-swatch')).toBeInTheDocument()
  })

  it('does not render the color swatch in immersive mode', () => {
    render(<ColorDisplay {...PROPS} mode="immersive" />)
    expect(document.querySelector('.color-swatch')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- ColorDisplay
```

Expected: FAIL — `Cannot find module './ColorDisplay.jsx'`

- [ ] **Step 3: Implement src/ColorDisplay.jsx**

```jsx
export default function ColorDisplay({ name, hex, R, G, B, H, S, V, notes, mode, onToggleMode }) {
  const isImmersive = mode === 'immersive'
  const pageStyle = isImmersive ? { backgroundColor: hex } : {}
  const toggleLabel = isImmersive ? '▣ classic' : '⬚ immersive'

  return (
    <div
      className={`color-page${isImmersive ? ' immersive' : ''}`}
      style={pageStyle}
    >
      <div className="color-info">
        <button
          className="view-toggle"
          onClick={e => { e.stopPropagation(); onToggleMode() }}
          title={isImmersive ? 'Switch to classic view' : 'Switch to immersive view'}
        >
          {toggleLabel}
        </button>

        <div className="color-header">
          <h1 className="color-name">{name}</h1>
          <span className="color-hex">{hex}</span>
        </div>

        <hr className="divider" />
        <p className="color-notes">{notes}</p>
        <hr className="divider" />

        <div className="color-values">
          <span>rgb: {R}, {G}, {B}</span>
          <span>hsv: {H}, {S}, {V}</span>
        </div>
      </div>

      {!isImmersive && (
        <div
          className="color-swatch"
          style={{ backgroundColor: hex }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- ColorDisplay
```

Expected: All 11 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/ColorDisplay.jsx src/ColorDisplay.test.jsx
git commit -m "feat: add ColorDisplay component with classic and immersive modes"
```

---

## Chunk 5: App, Routing & Deployment

### Task 8: useLocalStorage hook

**Files:**
- Create: `src/useLocalStorage.js`
- Create: `src/useLocalStorage.test.js`

- [ ] **Step 1: Write failing tests**

`src/useLocalStorage.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- useLocalStorage
```

Expected: FAIL — `Cannot find module './useLocalStorage.js'`

- [ ] **Step 3: Create src/useLocalStorage.js**

```js
import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  function set(updater) {
    setValue(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return [value, set]
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- useLocalStorage
```

Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/useLocalStorage.js src/useLocalStorage.test.js
git commit -m "feat: add useLocalStorage hook with tests"
```

---

### Task 9: main.jsx and App.jsx — routing, keyboard, mode persistence

**Files:**
- Create: `src/main.jsx`
- Create: `src/App.jsx`

- [ ] **Step 1: Create src/main.jsx**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/colors">
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 2: Create src/App.jsx**

```jsx
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
```

- [ ] **Step 3: Run all tests to make sure nothing is broken**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 4: Verify the app works end-to-end in dev**

```bash
npm run dev
```

Open `http://localhost:5173/colors/` and verify:
- Redirects to a random color URL like `/colors/bluetiful`
- Click anywhere advances to next color and URL updates
- `→` / `↓` / `Space` advance to next color
- `←` / `↑` go back to previous color
- `⬚ immersive` button toggles to immersive mode; `▣ classic` toggles back
- Refresh the page — view mode preference is remembered
- Navigate directly to `/colors/red` — shows Red

- [ ] **Step 5: Commit**

```bash
git add src/main.jsx src/App.jsx
git commit -m "feat: add App with routing, keyboard navigation, and view mode persistence"
```

---

### Task 10: Production build and deploy

**Files:**
- Verify: `public/favicon.ico` exists (already in place from original app)

- [ ] **Step 1: Confirm favicon is in place**

```bash
ls public/
```

Expected: `favicon.ico  404.html`

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: `dist/` folder created with no errors. Output should list `dist/index.html` and hashed JS/CSS assets.

- [ ] **Step 3: Preview the production build locally**

```bash
npm run preview
```

Open the URL shown (e.g. `http://localhost:4173/colors/`). Verify:
- Deep link works: navigate directly to `http://localhost:4173/colors/bluetiful`
- Browser back button returns to previous color
- View toggle persists across hard refresh
- No console errors

- [ ] **Step 4: Deploy to GitHub Pages**

```bash
npm run deploy
```

Expected: Deploys `dist/` to the `gh-pages` branch. Site live at `https://marchdoe.github.io/colors/`.

- [ ] **Step 5: Verify the live site**

Open `https://marchdoe.github.io/colors/` and verify:
- App loads and cycles through colors
- Deep link (e.g. `https://marchdoe.github.io/colors/bluetiful`) loads that color directly
- All keyboard shortcuts work

- [ ] **Step 6: Final commit**

```bash
git add -A
git status  # verify no unexpected files
git commit -m "chore: finalize vite rewrite — all features working"
```
