import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const svgPath = resolve(root, 'public/favicon.svg');

// Apple touch icon: 180×180 PNG
await sharp(svgPath)
  .resize(180, 180)
  .png()
  .toFile(resolve(root, 'public/apple-touch-icon.png'));
console.log('✓ apple-touch-icon.png');

// favicon.ico: 16×16 and 32×32 embedded
const buf16 = await sharp(svgPath).resize(16, 16).png().toBuffer();
const buf32 = await sharp(svgPath).resize(32, 32).png().toBuffer();
const ico = await pngToIco([buf16, buf32]);
writeFileSync(resolve(root, 'public/favicon.ico'), ico);
console.log('✓ favicon.ico (16, 32)');
