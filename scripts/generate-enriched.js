/**
 * Generates src/colors-enriched.json from src/colors.json
 * Cross-referenced with Jenny's Crayon Collection and Wikipedia.
 *
 * Sources:
 *   - Production dates / name history: Wikipedia (existing colors.json)
 *   - Retirement data, variants, collections: jennyscrayoncollection.com
 *   - Hex values for special collections: W3Schools (Silver Swirls, Gem Tones),
 *     meodai color-name-list (Pearl Brite) — all approximate, not official Crayola values
 */

const fs = require('fs');
const path = require('path');

const colors = require('../src/colors.json');

// ---------------------------------------------------------------------------
// Parsers for existing Notes strings
// ---------------------------------------------------------------------------

function parseDates(notes) {
  let introduced = null;
  let retired = null;
  let status = 'unknown';

  // "Produced YYYY–circa YYYY" or "Produced YYYY–YYYY" or "Produced YYYY–present"
  const m = notes.match(/Produced (\d{4})(?:–(?:circa )?(\d{4}|present))?/);
  if (m) {
    introduced = parseInt(m[1]);
    if (!m[2] || m[2] === 'present') {
      retired = null;
      status = 'current';
    } else {
      retired = parseInt(m[2]);
      status = 'retired';
    }
  }

  // "Produced circa YYYY–..."
  const cm = notes.match(/Produced circa (\d{4})(?:–(?:circa )?(\d{4}|present))?/);
  if (cm && !introduced) {
    introduced = parseInt(cm[1]);
    if (!cm[2] || cm[2] === 'present') {
      retired = null;
      status = 'current';
    } else {
      retired = parseInt(cm[2]);
      status = 'retired';
    }
  }

  // "Part of the Munsell line, YYYY–YYYY"
  const munsell = notes.match(/Part of the Munsell line, (\d{4})–(\d{4})/);
  if (munsell) {
    introduced = parseInt(munsell[1]);
    retired = parseInt(munsell[2]);
    status = 'retired';
  }

  // "Produced only in YYYY" or "Produced YYYY." (single year, no range)
  const single = notes.match(/Produced only in (\d{4})/);
  if (single && !introduced) {
    introduced = parseInt(single[1]);
    retired = parseInt(single[1]);
    status = 'retired';
  }

  // Discontinuous production: "Produced YYYY–YYYY, YYYY." treat as current if ends in year without dash
  // e.g. "Produced 1972–2003, 2025." → introduced 1972, retired null (reintroduced), status current
  const discontinuous = notes.match(/Produced (\d{4})–(\d{4}),\s*(\d{4})\./);
  if (discontinuous) {
    introduced = parseInt(discontinuous[1]);
    retired = null;
    status = 'current';
  }

  // "Produced YYYY." alone → single year, treat as retired
  const yearDot = notes.match(/^Produced (\d{4})\./);
  if (yearDot && !introduced) {
    introduced = parseInt(yearDot[1]);
    retired = parseInt(yearDot[1]);
    status = 'retired';
  }

  return { introduced, retired, status };
}

function parseNameHistory(notes) {
  const history = [];

  // "Known as "X", YYYY–YYYY." or "Known as "X", YYYY."
  const knownRegex = /Known as "([^"]+)",\s*(\d{4})(?:–(\d{4}))?/g;
  let m;
  while ((m = knownRegex.exec(notes)) !== null) {
    history.push({
      name: m[1],
      from: parseInt(m[2]),
      to: m[3] ? parseInt(m[3]) : null,
    });
  }

  // "Renamed from X in YYYY"
  const renamed = notes.match(/Renamed from (.+?) in (\d{4})/);
  if (renamed) {
    history.push({
      name: renamed[1].replace(/\.$/, '').trim(),
      from: null,
      to: parseInt(renamed[2]),
    });
  }

  return history;
}

function getCollectionFromNotes(notes) {
  if (notes.includes('Munsell line')) return 'Munsell';
  return null;
}

// ---------------------------------------------------------------------------
// Manual enrichment — collection overrides and supplemental nameHistory
// These are data points from Jenny's that aren't in the existing Notes strings.
// All are cross-checked against the Wikipedia-sourced data where possible.
// ---------------------------------------------------------------------------

// Manual overrides for colors whose Notes strings don't parse cleanly
// Gray is a standard color produced since 1903; its Notes describe historical naming
// rather than production dates, so the parser can't extract them automatically.
const manualOverrides = {
  'Gray': { introduced: 1903, retired: null, status: 'current', collection: 'standard' },
};

// Fluorescent colors: original "Ultra..." names used before 2003 rename
// Source: jennyscrayoncollection.com — confirmed against production years in our data
const supplementalNameHistory = {
  'Razzle Dazzle Rose':  [{ name: 'Hot Magenta Fluorescent', from: 1972, to: 2003 }],
  'Shocking Pink':       [{ name: 'Ultra Pink Fluorescent', from: 1972, to: 2003 }],
  'Wild Watermelon':     [{ name: 'Ultra Red Fluorescent', from: 1972, to: 2003 }],
  'Outrageous Orange':   [{ name: 'Ultra Orange Fluorescent', from: 1998, to: 2003 }],
  'Atomic Tangerine':    [{ name: 'Ultra Yellow Fluorescent', from: 1998, to: 2003 }],
  'Laser Lemon':         [{ name: 'Chartreuse Fluorescent', from: 1990, to: 2003 }],
  "Screamin' Green":     [{ name: 'Ultra Green Fluorescent', from: 1990, to: 2003 }],
  'Hot Magenta':         [{ name: 'Hot Magenta Fluorescent', from: 1990, to: 2003 }],
  'Blizzard Blue':       [{ name: 'Ultra Blue Fluorescent', from: 1972, to: 2003 }],
  // Peach had a complex multi-name history not extractable from the parenthesis format in Notes.
  // Source: Wikipedia Notes string: Known as "Flesh Tint" (1903–1949), "Flesh" (1949–1956,
  //   1958–1962), and "Pink Beige" (1956–1958).
  'Peach': [
    { name: 'Flesh Tint', from: 1903, to: 1949 },
    { name: 'Flesh',      from: 1949, to: 1962 },
    { name: 'Pink Beige', from: 1956, to: 1958 },
  ],
};

const collectionOverrides = {
  'Razzle Dazzle Rose':  'Fluorescent',
  'Shocking Pink':       'Fluorescent',
  'Wild Watermelon':     'Fluorescent',
  'Outrageous Orange':   'Fluorescent',
  'Atomic Tangerine':    'Fluorescent',
  'Laser Lemon':         'Fluorescent',
  "Screamin' Green":     'Fluorescent',
  'Hot Magenta':         'Fluorescent',
  'Vivid Violet':        'Fluorescent',
  'Blizzard Blue':       'Fluorescent',
};

// ---------------------------------------------------------------------------
// Variants — additive (scented, glitter) versions of existing standard colors
// Source: jennyscrayoncollection.com
// Format: { [baseColorName]: [ { name, year, type, collection? } ] }
// ---------------------------------------------------------------------------

const variants = {
  'Apricot': [
    { name: 'Lumber', year: 1994, type: 'scented', collection: 'Magic Scents' },
  ],
  'Black': [
    { name: 'Leather Jacket', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Licorice', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'New Sneakers', year: 1997, type: 'scented', collection: "Color 'n Smell" },
    { name: 'Black (Glitter)', year: 1993, type: 'glitter' },
    { name: 'Black with Glitzy Gold Glitter', year: 1997, type: 'glitter' },
  ],
  'Blue': [
    { name: 'Blueberry', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'New Car', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Blue with Shimmering Silver Glitter', year: 1997, type: 'glitter' },
  ],
  'Blue-Green': [
    { name: 'Blue Green with Glitzy Gold Glitter', year: 1997, type: 'glitter' },
  ],
  'Blue-Violet': [
    { name: 'Pixie Powder', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Brick Red': [
    { name: 'Earthworm', year: 1997, type: 'scented', collection: "Color 'n Smell" },
  ],
  'Brown': [
    { name: 'Chocolate', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Pet Shop', year: 1997, type: 'scented', collection: "Color 'n Smell" },
  ],
  'Burnt Sienna': [
    { name: 'Baseball Mitt', year: 1997, type: 'scented', collection: "Color 'n Smell" },
  ],
  'Carnation Pink': [
    { name: 'Shampoo', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Carnation Pink with Lavender Glitter', year: 1997, type: 'glitter' },
  ],
  'Chestnut': [
    { name: "Giant's Club", year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Dandelion': [
    { name: 'Banana', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Wash the Dog', year: 1997, type: 'scented', collection: "Color 'n Smell" },
    { name: 'Gargoyle Gas', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Goldenrod': [
    { name: 'Sharpening Pencils', year: 1997, type: 'scented', collection: "Color 'n Smell" },
  ],
  'Gray': [
    { name: 'Smoke', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: "Mummy's Tomb", year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Green': [
    { name: 'Green with Twinkling Turquoise Glitter', year: 1997, type: 'glitter' },
  ],
  'Jungle Green': [
    { name: 'Eucalyptus', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Koala Tree', year: 1997, type: 'scented', collection: "Color 'n Smell" },
  ],
  'Mahogany': [
    { name: 'Cedar Chest', year: 1994, type: 'scented', collection: 'Magic Scents' },
  ],
  'Mango Tango': [
    { name: 'Sunburnt Cyclops', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Maroon': [
    { name: 'Cherry', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Dingy Dungeon', year: 2006, type: 'scented', collection: 'Silly Scents' },
    { name: 'Maroon with Glitzy Gold Glitter', year: 1997, type: 'glitter' },
  ],
  'Orange': [
    { name: 'Tulip', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: "Grandma's Perfume", year: 1997, type: 'scented', collection: "Color 'n Smell" },
    { name: 'Smashed Pumpkin', year: 2006, type: 'scented', collection: 'Silly Scents' },
    { name: 'Orange with Twinkling Turquoise Glitter', year: 1997, type: 'glitter' },
    { name: 'Orange (Glitter)', year: 1993, type: 'glitter' },
  ],
  'Orchid': [
    { name: 'Orchid with Twinkling Turquoise Glitter', year: 1997, type: 'glitter' },
    { name: 'Orchid (Glitter)', year: 1993, type: 'glitter' },
  ],
  'Peach': [
    { name: 'Saw Dust', year: 1997, type: 'scented', collection: "Color 'n Smell" },
  ],
  'Periwinkle': [
    { name: 'Soap', year: 1994, type: 'scented', collection: 'Magic Scents' },
  ],
  'Pine Green': [
    { name: 'Pine', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Pine Tree', year: 1997, type: 'scented', collection: "Color 'n Smell" },
  ],
  'Red': [
    { name: 'Rose', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Smell the Roses', year: 1997, type: 'scented', collection: "Color 'n Smell" },
    { name: 'Magic Potion', year: 2006, type: 'scented', collection: 'Silly Scents' },
    { name: 'Red (Glitter)', year: 1993, type: 'glitter' },
    { name: 'Red with Shimmering Silver Glitter', year: 1997, type: 'glitter' },
  ],
  'Red-Orange': [
    { name: 'Jelly Bean', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Ogre Odor', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Red-Violet': [
    { name: 'Red Violet with Glitzy Gold Glitter', year: 1997, type: 'glitter' },
  ],
  "Robin's Egg Blue": [
    { name: 'Sea Serpent', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Royal Purple': [
    { name: 'Royal Purple with Ruby Red Glitter', year: 1997, type: 'glitter' },
  ],
  'Sepia': [
    { name: 'Earth', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Dirt', year: 1994, type: 'scented', collection: 'Magic Scents' },
  ],
  'Sky Blue': [
    { name: 'Fresh Air', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Fresh Air', year: 1997, type: 'scented', collection: "Color 'n Smell" },
    { name: 'Winter Wizard', year: 2006, type: 'scented', collection: 'Silly Scents' },
    { name: 'Sky Blue with Glitzy Gold Glitter', year: 1997, type: 'glitter' },
    { name: 'Sky Blue (Glitter)', year: 1993, type: 'glitter' },
  ],
  'Spring Green': [
    { name: 'Booger Buster', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Tan': [
    { name: 'Big Foot Feet', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Tickle Me Pink': [
    { name: 'Bubble Gum', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Bubble Bath', year: 1997, type: 'scented', collection: "Color 'n Smell" },
    { name: 'Princess Perfume', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'Violet (I)': [
    { name: 'Grape', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Violet (Glitter)', year: 1993, type: 'glitter' },
  ],
  'Violet-Red': [
    { name: 'Sasquatch Socks', year: 2006, type: 'scented', collection: 'Silly Scents' },
  ],
  'White': [
    { name: 'Baby Powder', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Coconut', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: "Baby's Powder", year: 1997, type: 'scented', collection: "Color 'n Smell" },
    { name: 'White with Glitzy Gold Glitter', year: 1997, type: 'glitter' },
    { name: 'White with Confetti Glitter', year: 1997, type: 'glitter' },
  ],
  'Wisteria': [
    { name: 'Lilac', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Flower Shop', year: 1997, type: 'scented', collection: "Color 'n Smell" },
  ],
  'Yellow': [
    { name: 'Daffodil', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Lemon', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Sunny Day', year: 1997, type: 'scented', collection: "Color 'n Smell" },
    { name: 'Yellow (Glitter)', year: 1993, type: 'glitter' },
    { name: 'Yellow with Rainbow Glitter', year: 1997, type: 'glitter' },
  ],
  'Yellow-Green': [
    { name: 'Lime', year: 1994, type: 'scented', collection: 'Magic Scents' },
    { name: 'Alien Armpit', year: 2006, type: 'scented', collection: 'Silly Scents' },
    { name: 'Yellow Green (Glitter)', year: 1993, type: 'glitter' },
    { name: 'Yellow Green with Silver Glitter', year: 1997, type: 'glitter' },
  ],
};

// ---------------------------------------------------------------------------
// New color entries — special collections not in the existing 186
// Source: jennyscrayoncollection.com (names/years), W3Schools (Silver Swirls hex,
//   Gem Tones hex), meodai color-name-list (Pearl Brite hex).
// All hex values are community approximations — Crayola does not publish official hex.
// ---------------------------------------------------------------------------

const newColors = {
  // Silver Swirls — 24 glitter crayons introduced 1990
  // Hex source: W3Schools crayola reference
  'Aztec Gold':         { Hexadecimal: '#C39953', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Burnished Brown':    { Hexadecimal: '#A17A74', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Cerulean Frost':     { Hexadecimal: '#6D9BC3', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Cinnamon Satin':     { Hexadecimal: '#CD607E', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Copper Penny':       { Hexadecimal: '#AD6F69', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Cosmic Cobalt':      { Hexadecimal: '#2E2D88', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Glossy Grape':       { Hexadecimal: '#AB92B3', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Granite Gray':       { Hexadecimal: '#676767', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Green Sheen':        { Hexadecimal: '#6EAEA1', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Lilac Luster':       { Hexadecimal: '#AE98AA', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Misty Moss':         { Hexadecimal: '#BBB477', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Mystic Maroon':      { Hexadecimal: '#AD4379', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Pearly Purple':      { Hexadecimal: '#B768A2', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Pewter Blue':        { Hexadecimal: '#8BA8B7', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Polished Pine':      { Hexadecimal: '#5DA493', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Quick Silver':       { Hexadecimal: '#A6A6A6', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Rose Dust':          { Hexadecimal: '#9E5E6F', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Rusty Red':          { Hexadecimal: '#DA2C43', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Shadow Blue':        { Hexadecimal: '#778BA5', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Shiny Shamrock':     { Hexadecimal: '#5FA778', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Steel Teal':         { Hexadecimal: '#5F8A8B', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Sugar Plum':         { Hexadecimal: '#914E75', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Twilight Lavender':  { Hexadecimal: '#8A496B', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },
  'Wintergreen Dream':  { Hexadecimal: '#56887D', introduced: 1990, retired: null, status: 'current', collection: 'Silver Swirls', hexApproximate: true },

  // Gem Tones — 16 colors introduced 1993, retired 1994
  // Hex source: W3Schools crayola reference (Crayola-specific values, not generic gemstone colors)
  'Amethyst':      { Hexadecimal: '#64609A', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Citrine':       { Hexadecimal: '#933709', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Emerald':       { Hexadecimal: '#14A989', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Jade':          { Hexadecimal: '#469A84', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Jasper':        { Hexadecimal: '#D05340', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Lapis Lazuli':  { Hexadecimal: '#436CB9', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Malachite':     { Hexadecimal: '#469496', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Moonstone':     { Hexadecimal: '#3AA8C1', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Onyx':          { Hexadecimal: '#353839', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Peridot':       { Hexadecimal: '#ABAD48', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Pink Pearl':    { Hexadecimal: '#B07080', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Rose Quartz':   { Hexadecimal: '#BD559C', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Ruby':          { Hexadecimal: '#AA4069', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Sapphire':      { Hexadecimal: '#2D5DA1', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  'Smokey Topaz':  { Hexadecimal: '#832A0D', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },
  "Tiger's Eye":   { Hexadecimal: '#B56917', introduced: 1993, retired: 1994, status: 'retired', collection: 'Gem Tones', hexApproximate: true },

  // Pearl Brite — 16 pearlescent crayons, introduced 1997
  // Hex source: meodai color-name-list — less well documented; treat as rough approximations
  'Aqua Pearl':           { Hexadecimal: '#DDF2EE', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Black Coral Pearl':    { Hexadecimal: '#54617D', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Caribbean Green Pearl':{ Hexadecimal: '#54B490', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Cultured Pearl':       { Hexadecimal: '#F2F1E6', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Key Lime Pearl':       { Hexadecimal: '#D0FF14', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Mandarin Pearl':       { Hexadecimal: '#EC7042', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Midnight Pearl':       { Hexadecimal: '#38393F', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Mystic Pearl':         { Hexadecimal: '#D0D2E9', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Ocean Blue Pearl':     { Hexadecimal: '#71D9E2', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Ocean Green Pearl':    { Hexadecimal: '#BBFF99', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Orchid Pearl':         { Hexadecimal: '#D4DAE2', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Rose Pearl':           { Hexadecimal: '#E881A6', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Salmon Pearl':         { Hexadecimal: '#FBCD9F', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Sunny Pearl':          { Hexadecimal: '#F4DFA7', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Sunset Pearl':         { Hexadecimal: '#F2E3C5', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
  'Turquoise Pearl':      { Hexadecimal: '#006F72', introduced: 1997, retired: null, status: 'current', collection: 'Pearl Brite', hexApproximate: true },
};

// ---------------------------------------------------------------------------
// Build enriched output
// ---------------------------------------------------------------------------

const enriched = {};

// Transform existing 186 colors
for (const [name, data] of Object.entries(colors)) {
  const parsed = parseDates(data.Notes);
  const override = manualOverrides[name] || {};
  const introduced = override.introduced ?? parsed.introduced;
  const retired    = override.retired    ?? parsed.retired;
  const status     = override.status     ?? parsed.status;

  const nameHistory = [
    ...parseNameHistory(data.Notes),
    ...(supplementalNameHistory[name] || []),
  ];
  const collection =
    override.collection ||
    collectionOverrides[name] ||
    getCollectionFromNotes(data.Notes) ||
    'standard';

  enriched[name] = {
    H: data.H,
    S: data.S,
    V: data.V,
    R: data.R,
    G: data.G,
    B: data.B,
    Hexadecimal: data.Hexadecimal,
    introduced,
    retired,
    status,
    collection,
    nameHistory,
    variants: variants[name] || [],
    notes: data.Notes,
  };
}

// Add new special collection entries
for (const [name, data] of Object.entries(newColors)) {
  const hex = data.Hexadecimal;
  // Convert hex to approximate R/G/B
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Approximate HSV
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : Math.round((d / max) * 100);
  const v = Math.round(max * 100);

  enriched[name] = {
    H: String(h),
    S: String(s),
    V: String(v),
    R: String(r),
    G: String(g),
    B: String(b),
    Hexadecimal: hex,
    hexApproximate: true,
    introduced: data.introduced,
    retired: data.retired,
    status: data.status,
    collection: data.collection,
    nameHistory: [],
    variants: [],
    notes: null,
  };
}

// Write output
const outPath = path.join(__dirname, '../src/colors-enriched.json');
fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2));
console.log(`Written ${Object.keys(enriched).length} colors to ${outPath}`);

// Spot-check a few
const spotCheck = ['Red', 'Chestnut', 'Dandelion', 'Razzle Dazzle Rose', 'Aztec Gold', 'Amethyst'];
for (const name of spotCheck) {
  const c = enriched[name];
  if (c) {
    console.log(`\n${name}: introduced=${c.introduced} retired=${c.retired} status=${c.status} collection=${c.collection} nameHistory=${JSON.stringify(c.nameHistory)} variants=${c.variants.length}`);
  } else {
    console.log(`\n${name}: NOT FOUND`);
  }
}
