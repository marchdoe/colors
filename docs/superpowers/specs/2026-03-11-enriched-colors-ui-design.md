# Enriched Colors UI — Option A: Structured Fields

**Date:** 2026-03-11
**Status:** Approved

## Summary

Upgrade the Colors app to use `colors-enriched.json` (242 colors, vs 186 in the original), replacing the prose `Notes` string with structured, always-visible fields. The swatch in classic mode fills the full remaining viewport height. Both classic and immersive modes are supported.

## Data Source

`src/colors-enriched.json` — a strict superset of `src/colors.json`. All existing fields preserved. New fields per color:

| Field | Type | Description |
|---|---|---|
| `introduced` | `number \| null` | Year first produced |
| `retired` | `number \| null` | Year retired, or `null` if current |
| `status` | `"current" \| "retired"` | Production status |
| `collection` | `string` | `"standard"`, `"Munsell"`, `"Fluorescent"`, `"Silver Swirls"`, `"Gem Tones"`, `"Pearl Brite"` |
| `nameHistory` | `Array<{name, from, to}>` | Previous names with year ranges |
| `variants` | `Array<{name, year, type, collection?}>` | Scented/glitter variants |
| `notes` | `string \| null` | Original prose string (no longer rendered) |
| `hexApproximate` | `boolean?` | True for Silver Swirls, Gem Tones, Pearl Brite entries |

## Layout — Classic Mode

```
┌─ color-info ────────────────────────────────────┐
│  [Name]  #HEX                    [⬚ immersive]  │
│  [CURRENT] [STANDARD]  1903 – present            │  ← meta row, always shown
│  ─────────────────────────────────────────────  │
│  ALSO KNOWN AS                                   │  ← only if nameHistory.length > 0
│  1903–1949   Flesh Tint                          │
│  1949–1962   Flesh                               │
│  ─────────────────────────────────────────────  │
│  VARIANTS                                        │  ← only if variants.length > 0
│  [🌿 Saw Dust '94]  [🌿 Saw Dust '97]           │
│  ─────────────────────────────────────────────  │
│  rgb: …                             hsv: …      │
└─────────────────────────────────────────────────┘
┌─ color-swatch (flex: 1, fills to bottom) ───────┐
│                                                  │
└─────────────────────────────────────────────────┘
```

For colors with no nameHistory or variants (most standard colors), only the meta row appears — the layout looks nearly identical to today.

## Layout — Immersive Mode

Full-viewport color background. Overlay anchored to the bottom with a dark gradient. All structured fields rendered in white/translucent:

- Badges: `rgba(255,255,255,0.15)` background, white text
- Section labels: `rgba(255,255,255,0.4)`
- History rows: `rgba(255,255,255,0.8)`
- Variant pills: `rgba(255,255,255,0.1)` background, `rgba(255,255,255,0.7)` border/text
- RGB/HSV: `rgba(255,255,255,0.5)`

## Badge Colors

| Collection | Background | Text |
|---|---|---|
| Standard | `#f0f0f0` | `#888` |
| Munsell | `#eef2fb` | `#4a6abf` |
| Fluorescent | `#fffbe6` | `#b08800` |
| Gem Tones | `#f5eefb` | `#7a44b8` |
| Silver Swirls | `#f4f4f4` + border | `#777` |
| Pearl Brite | `#eef8fb` | `#3a8fa8` |
| Current (status) | `#e6f5ee` | `#2d8c5e` |
| Retired (status) | `#fdf0ed` | `#c0552a` |

## Variant Pills

- Scented: warm amber tone (`#fff8f0` bg, `#b07020` text)
- Glitter: muted gold tone (`#fafaf5` bg, `#888850` text)
- Emoji prefix: 🌿 scented, ✨ glitter

## Viewport Fix

Classic mode: `.color-page` uses `display: flex; flex-direction: column`. `.color-swatch` uses `flex: 1` (removes the `min-height: 80vh` hack). This guarantees the swatch fills all remaining space with zero white gap at any viewport height.

## Files Changed

- `src/App.jsx` — import `colors-enriched.json`, pass new props to `ColorDisplay`
- `src/ColorDisplay.jsx` — render structured fields, remove prose notes paragraph
- `src/index.css` — add badge, history list, variant pill styles; fix swatch flex layout
- No new files, no routing changes, no new hooks

## Out of Scope

- Filtering by collection (future)
- Timeline/history view mode (future)
- The `hexApproximate` flag is in the data but not surfaced in UI yet
