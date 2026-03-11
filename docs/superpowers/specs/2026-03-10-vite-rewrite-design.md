# Colors App — Vite Rewrite Design

**Date:** 2026-03-10
**Status:** Approved

## Summary

Modernize the Colors app from React 15 / CRA to Vite + React with plain CSS. Preserve the existing design exactly. Add URL deep linking, keyboard navigation, an immersive view mode toggle, and updated color data.

## Context

The existing app is a single-page Crayola crayon color explorer. Click anywhere to cycle through colors — showing the name, hex code, production notes, RGB/HSV values, and a full-bleed color swatch. The codebase uses React 15, `React.createClass` (removed in React 16), `injectGlobal` (removed in styled-components v4), and rebass v1 (completely different API in v3+). It cannot be upgraded incrementally — a rewrite is necessary.

## Tech Stack

- **Vite** — build tool and dev server
- **React 19** — UI
- **React Router v6** — URL deep linking
- **Plain CSS** — single `index.css`, no component libraries
- **No other dependencies**

## Features

### 1. Faithful design reproduction
The existing layout is preserved exactly:
- Color name (`h1`) + hex code (`small`) on the same line, top-left
- Horizontal divider
- Production notes text
- Horizontal divider
- RGB and HSV values side by side
- Large color swatch (80vh min-height)
- White background, no chrome
- Cursor is a pointer; clicking anywhere advances

### 2. URL deep linking
- Route: `/:slug` where slug is the color name lowercased and hyphenated (e.g. `bluetiful`, `mango-tango`)
- `/` redirects to a random starting color
- Navigating (click or keyboard) pushes a new URL so the current color is always shareable
- Landing on a deep link shows that color and continues the shuffled queue from there

### 3. Keyboard navigation
| Key | Action |
|-----|--------|
| `→` `↓` `Space` | Advance to next color |
| `←` `↑` | Go back to previous color |
| Click | Advance to next color |

### 4. Immersive view toggle
- A small, subtle toggle button sits in the top-right corner of the info panel
- **Classic mode** (default): white background, info at top, swatch below
- **Immersive mode**: full-viewport color background, info overlaid at the bottom with a subtle gradient
- User's preference is persisted in `localStorage`
- The toggle button adapts its color to remain readable in both modes

### 5. Color data update
- Reconcile `colors.json` against the current Wikipedia list of Crayola crayon colors
- Add all missing colors with full R, G, B, H, S, V, hex, and notes fields
- Generate a URL-safe `slug` field for each color (or derive at runtime)

## Architecture

```
colors/
  index.html
  vite.config.js
  src/
    main.jsx            — Vite entry, mounts App
    App.jsx             — Router, color queue state, keyboard listeners
    ColorDisplay.jsx    — Single component, renders both Classic and Immersive
    colors.json         — Updated color data
    index.css           — All styles
```

### Color queue logic (in App.jsx)
- On load: shuffle all color keys into a queue
- Track current index and a history stack for back navigation
- On advance: increment index, push to history, update URL
- On back: pop from history, update URL
- When queue is exhausted: reshuffle
- Deep link on load: find the slug in the color list, set as current, continue queue from next

### ColorDisplay.jsx props
```
{
  name: string,
  hex: string,
  R, G, B: number,
  H, S, V: number,
  notes: string,
  mode: 'classic' | 'immersive',
  onToggleMode: () => void
}
```

## Color Data Schema
Each entry in `colors.json`:
```json
{
  "Bluetiful": {
    "H": "211", "S": "51", "V": "86",
    "R": "108", "G": "160", "B": "220",
    "Hexadecimal": "#6CA0DC",
    "Notes": "Produced 2017–present. Replaced Dandelion in the 24-pack."
  }
}
```
Slugs are derived at runtime: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`.

## Deployment
Same as current: `gh-pages` deploys the `dist/` folder to GitHub Pages. React Router is configured with `basename` to match the `/colors` repo path. A `404.html` redirect trick handles direct deep link loads on GitHub Pages.

## Out of Scope
- Server-side rendering
- Search / filter
- Favorites / bookmarking
- Any backend
