# Enriched Colors UI Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Colors app to display structured historical data (status, collection, name history, variants) from `colors-enriched.json` instead of the prose `Notes` string, with the swatch filling the full viewport in classic mode.

**Architecture:** Swap the data source to `colors-enriched.json` in `App.jsx`, pass the new structured props to `ColorDisplay`, update `ColorDisplay` to render badges/history/variants, and fix the swatch flex layout. Both classic and immersive modes are fully styled.

**Tech Stack:** React, Vite, Vitest, @testing-library/react, plain CSS

---

## Chunk 1: Data + Props

### Task 1: Switch data source and pass new props

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update the import and the props passed to ColorDisplay**

Replace in `src/App.jsx`:
```jsx
import colors from './colors.json'
```
with:
```jsx
import colors from './colors-enriched.json'
```

In the `ColorPage` component, the `current` object already has all the new fields.
Update the `<ColorDisplay>` render call — replace the `notes` prop with the new structured props:

```jsx
<ColorDisplay
  name={currentName}
  hex={current.Hexadecimal}
  R={current.R}
  G={current.G}
  B={current.B}
  H={current.H}
  S={current.S}
  V={current.V}
  introduced={current.introduced}
  retired={current.retired}
  status={current.status}
  collection={current.collection}
  nameHistory={current.nameHistory ?? []}
  variants={current.variants ?? []}
  mode={mode}
  onToggleMode={() => setMode(m => m === 'classic' ? 'immersive' : 'classic')}
/>
```

- [ ] **Step 2: Verify the dev server still loads without errors**

```bash
npm run dev
```
Open http://localhost:5173/colors/ — should still render a color page (data will look broken until Task 3, but no JS errors).

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: switch to colors-enriched.json and pass structured props"
```

---

## Chunk 2: Tests

### Task 2: Update ColorDisplay tests for the new prop API

**Files:**
- Modify: `src/ColorDisplay.test.jsx`

The existing test file uses a `notes` prop and tests that it renders. We need to:
1. Remove the `notes` prop from `PROPS`
2. Remove the test that checks `notes` renders
3. Add tests for the new structured fields

- [ ] **Step 1: Write the updated test file**

Replace the entire contents of `src/ColorDisplay.test.jsx`:

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
  introduced: 2017,
  retired: null,
  status: 'current',
  collection: 'standard',
  nameHistory: [],
  variants: [],
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

  it('renders the year range for a current color', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('2017 – present')).toBeInTheDocument()
  })

  it('renders the year range for a retired color', () => {
    render(<ColorDisplay {...PROPS} introduced={1990} retired={2017} status="retired" />)
    expect(screen.getByText('1990 – 2017')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('renders the collection badge', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('Standard')).toBeInTheDocument()
  })

  it('does not render the name history section when nameHistory is empty', () => {
    render(<ColorDisplay {...PROPS} nameHistory={[]} />)
    expect(screen.queryByText(/also known as/i)).not.toBeInTheDocument()
  })

  it('renders the name history section when nameHistory has entries', () => {
    const nameHistory = [
      { name: 'Flesh Tint', from: 1903, to: 1949 },
      { name: 'Flesh', from: 1949, to: 1962 },
    ]
    render(<ColorDisplay {...PROPS} nameHistory={nameHistory} />)
    expect(screen.getByText(/also known as/i)).toBeInTheDocument()
    expect(screen.getByText('Flesh Tint')).toBeInTheDocument()
    expect(screen.getByText('Flesh')).toBeInTheDocument()
    expect(screen.getByText('1903 – 1949')).toBeInTheDocument()
    expect(screen.getByText('1949 – 1962')).toBeInTheDocument()
  })

  it('does not render the variants section when variants is empty', () => {
    render(<ColorDisplay {...PROPS} variants={[]} />)
    expect(screen.queryByText(/variants/i)).not.toBeInTheDocument()
  })

  it('renders the variants section when variants has entries', () => {
    const variants = [
      { name: 'Banana', year: 1994, type: 'scented', collection: 'Magic Scents' },
    ]
    render(<ColorDisplay {...PROPS} variants={variants} />)
    expect(screen.getByText(/variants/i)).toBeInTheDocument()
    expect(screen.getByText(/Banana/)).toBeInTheDocument()
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

- [ ] **Step 2: Run the tests — expect failures**

```bash
npm test
```
Expected: multiple failures — ColorDisplay still renders the old `notes` prop, doesn't render the new fields yet.

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/ColorDisplay.test.jsx
git commit -m "test: update ColorDisplay tests for structured props (red)"
```

---

## Chunk 3: Implementation

### Task 3: Implement the structured ColorDisplay

**Files:**
- Modify: `src/ColorDisplay.jsx`

- [ ] **Step 1: Replace ColorDisplay with the structured implementation**

Replace the entire contents of `src/ColorDisplay.jsx`:

```jsx
const COLLECTION_LABELS = {
  standard:       'Standard',
  Munsell:        'Munsell',
  Fluorescent:    'Fluorescent',
  'Silver Swirls':'Silver Swirls',
  'Gem Tones':    'Gem Tones',
  'Pearl Brite':  'Pearl Brite',
}

function YearRange({ introduced, retired }) {
  if (!introduced) return null
  const end = retired ? retired : 'present'
  return <span className="color-years">{introduced} – {end}</span>
}

function StatusBadge({ status }) {
  const label = status === 'current' ? 'Current' : 'Retired'
  return <span className={`badge badge-status badge-${status}`}>{label}</span>
}

function CollectionBadge({ collection }) {
  const label = COLLECTION_LABELS[collection] ?? collection
  return <span className={`badge badge-collection badge-coll-${collection.toLowerCase().replace(/\s+/g, '-')}`}>{label}</span>
}

function NameHistorySection({ nameHistory }) {
  if (!nameHistory || nameHistory.length === 0) return null
  return (
    <>
      <hr className="divider" />
      <p className="section-label">Also known as</p>
      <ul className="history-list">
        {nameHistory.map((entry, i) => (
          <li key={i}>
            <span className="history-years">
              {entry.from ?? '?'} – {entry.to ?? 'present'}
            </span>
            {entry.name}
          </li>
        ))}
      </ul>
    </>
  )
}

function VariantsSection({ variants }) {
  if (!variants || variants.length === 0) return null
  return (
    <>
      <hr className="divider" />
      <p className="section-label">Variants</p>
      <div className="variants-row">
        {variants.map((v, i) => {
          const icon = v.type === 'scented' ? '🌿' : '✨'
          const label = `${icon} ${v.name} '${String(v.year).slice(2)}`
          return (
            <span key={i} className={`variant-pill variant-${v.type}`}>
              {label}
            </span>
          )
        })}
      </div>
    </>
  )
}

export default function ColorDisplay({
  name, hex, R, G, B, H, S, V,
  introduced, retired, status, collection,
  nameHistory, variants,
  mode, onToggleMode,
}) {
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

        <div className="color-meta">
          <StatusBadge status={status} />
          <CollectionBadge collection={collection} />
          <YearRange introduced={introduced} retired={retired} />
        </div>

        <NameHistorySection nameHistory={nameHistory} />
        <VariantsSection variants={variants} />

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

- [ ] **Step 2: Run the tests — expect most to pass, some CSS-class tests may still fail**

```bash
npm test
```
Expected: most tests pass. If any fail, read the error message carefully and fix the implementation — do not modify the tests.

- [ ] **Step 3: Commit**

```bash
git add src/ColorDisplay.jsx
git commit -m "feat: render structured fields in ColorDisplay"
```

---

### Task 4: Add CSS for badges, history list, variants, and viewport fix

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Update the swatch and page rules, and remove the stale `.color-notes` rule**

In `src/index.css`:

1. Find `.color-page` and add flex layout:
```css
.color-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

2. Find `.color-swatch` and replace `min-height: 80vh` with flex fill:
```css
.color-swatch {
  flex: 1;
  min-height: 0;
}
```

3. Delete the entire `.color-notes` rule (lines ~56-62). It is no longer used — `ColorDisplay` no longer renders a `.color-notes` element:
```css
/* DELETE this entire block */
.color-notes {
  font-size: clamp(0.9rem, 2.5vw, 1.25rem);
  color: #333;
  margin: 0 0 10px;
  line-height: 1.5;
  padding-right: clamp(16px, 8vw, 96px);
}
```
Also delete the corresponding immersive override for `.color-notes` in the immersive section near the bottom of the file:
```css
/* DELETE this block too */
.color-page.immersive .color-notes {
  color: rgba(255, 255, 255, 0.8);
}
```

- [ ] **Step 2: Add the new component styles**

Append to the end of `src/index.css`:

```css
/* ── Meta row ─────────────────────────────────── */

.color-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 8px 0 4px;
  flex-wrap: wrap;
}

.color-years {
  font-size: 0.8rem;
  color: #bbb;
}

/* ── Badges ───────────────────────────────────── */

.badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border-radius: 4px;
  padding: 2px 7px;
  flex-shrink: 0;
}

.badge-current  { background: #e6f5ee; color: #2d8c5e; }
.badge-retired  { background: #fdf0ed; color: #c0552a; }

.badge-coll-standard      { background: #f0f0f0; color: #888; }
.badge-coll-munsell       { background: #eef2fb; color: #4a6abf; }
.badge-coll-fluorescent   { background: #fffbe6; color: #b08800; }
.badge-coll-gem-tones     { background: #f5eefb; color: #7a44b8; }
.badge-coll-silver-swirls { background: #f4f4f4; color: #777; border: 1px solid #ddd; }
.badge-coll-pearl-brite   { background: #eef8fb; color: #3a8fa8; }

/* ── Name history list ────────────────────────── */

.section-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ccc;
  margin: 0 0 5px;
}

.history-list {
  margin: 0 0 8px;
  padding: 0;
  list-style: none;
}

.history-list li {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 0.82rem;
  color: #555;
  padding: 3px 0;
  border-bottom: 1px solid #f7f7f7;
}

.history-list li:last-child { border-bottom: none; }

.history-years {
  color: #ccc;
  font-size: 0.75rem;
  flex-shrink: 0;
  width: 88px;
}

/* ── Variant pills ────────────────────────────── */

.variants-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}

.variant-pill {
  font-size: 10px;
  padding: 3px 9px;
  border-radius: 20px;
  border: 1px solid #eee;
  color: #999;
}

.variant-scented { background: #fff8f0; border-color: #f5dfc0; color: #b07020; }
.variant-glitter { background: #fafaf5; border-color: #e0e0c0; color: #888850; }

/* ── Immersive overrides for new elements ─────── */

.color-page.immersive .color-years {
  color: rgba(255,255,255,0.5);
}

.color-page.immersive .badge {
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.8);
  border-color: transparent;
}

.color-page.immersive .section-label {
  color: rgba(255,255,255,0.4);
}

.color-page.immersive .history-list li {
  color: rgba(255,255,255,0.8);
  border-bottom-color: rgba(255,255,255,0.1);
}

.color-page.immersive .history-years {
  color: rgba(255,255,255,0.4);
}

.color-page.immersive .variant-pill {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.7);
  color: rgba(255,255,255,0.7);
}
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 4: Manual visual check — classic mode**

Open http://localhost:5173/colors/peach
- Meta row shows green "Current" badge, gray "Standard" badge, "1903 – present"
- "Also known as" section lists Flesh Tint, Flesh, Pink Beige with year ranges
- "Variants" section shows 🌿 Saw Dust pills in warm amber
- Swatch fills all the way to the bottom — no white gap

- [ ] **Step 5: Manual visual check — immersive mode**

Click the immersive toggle on Peach:
- Full peach-color background
- All text in white/translucent, badges use translucent white style
- No white gap

- [ ] **Step 6: Manual check — simple color**

Navigate to http://localhost:5173/colors/red
- Only meta row visible (no "Also known as", no "Variants" sections)
- Swatch fills to bottom

- [ ] **Step 7: Manual check — retired color**

Navigate to http://localhost:5173/colors/maize
- Orange "Retired" badge, year range "1903 – 1990"
- No "Also known as" section, no "Variants" section
- Swatch fills to bottom

- [ ] **Step 8: Commit**

```bash
git add src/index.css
git commit -m "feat: add badge, history, variant styles and fix swatch viewport fill"
```

---

## Chunk 4: Cleanup

### Task 5: Remove the mockup file

**Files:**
- Delete: `public/ui-options.html`

- [ ] **Step 1: Delete the mockup**

```bash
rm public/ui-options.html
```

- [ ] **Step 2: Run all tests one final time**

```bash
npm test
```
Expected: all pass.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: remove ui-options mockup"
```
