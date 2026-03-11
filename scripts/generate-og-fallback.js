import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Create SVG representing the OG image layout
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <!-- Left panel: white background -->
  <rect x="0" y="0" width="660" height="630" fill="#ffffff"/>
  <!-- Title text -->
  <text x="64" y="270" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="72" font-weight="800" fill="#111111" letter-spacing="-1.44">Crayola</text>
  <text x="64" y="350" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="72" font-weight="800" fill="#111111" letter-spacing="-1.44">Colors</text>
  <!-- Subtitle -->
  <text x="64" y="400" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" fill="#999999">242 colors with full production</text>
  <text x="64" y="436" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" fill="#999999">history, variants, and color data.</text>
  <!-- Right panel: 3x4 color grid (each cell = 180x157.5) -->
  <rect x="660" y="0"   width="180" height="158" fill="#ED0A3F"/>
  <rect x="840" y="0"   width="180" height="158" fill="#FF7538"/>
  <rect x="1020" y="0"  width="180" height="158" fill="#FDDB6D"/>
  <rect x="660" y="158" width="180" height="158" fill="#1CAC78"/>
  <rect x="840" y="158" width="180" height="158" fill="#1F75FE"/>
  <rect x="1020" y="158" width="180" height="158" fill="#7442C8"/>
  <rect x="660" y="316" width="180" height="157" fill="#FFCBA4"/>
  <rect x="840" y="316" width="180" height="157" fill="#FC2847"/>
  <rect x="1020" y="316" width="180" height="157" fill="#000000"/>
  <rect x="660" y="473" width="180" height="157" fill="#8E4585"/>
  <rect x="840" y="473" width="180" height="157" fill="#29ABCA"/>
  <rect x="1020" y="473" width="180" height="157" fill="#FFFFFF"/>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(resolve(root, 'public/og-image.png'));

console.log('✓ og-image.png (1200x630)');
