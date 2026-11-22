// Generates public/og.png (the link-preview image for LinkedIn, Slack, X, ...).
// It reads the name and badge line ("Lead SDET · Test architecture") from src/content/site.json,
// so changing them there updates the image on the next build. Runs automatically before
// `npm run build` (see "prebuild" in package.json).
// Design: light, editorial. Near-white background with a faint violet tint, a white card,
// the black "DO" monogram, near-black name and a violet line. No photo.
import { readFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const site = JSON.parse(readFileSync('src/content/site.json', 'utf8'));

// Same colours as src/styles/global.css
const BG = '#fafafa';
const CARD = '#ffffff';
const BORDER = '#e5e5e5';
const INK = '#0a0a0a';
const MUTED = '#737373';
const VIOLET = '#7c3aed';

// SVG text must be escaped.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Very simple word wrap: SVG does not wrap text by itself.
function wrap(text, maxChars) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > maxChars) { lines.push(line); line = word; }
    else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

const badgeLines = wrap(site.badge, 34);
const badgeSvg = badgeLines
  .map((l, i) => `<text x="120" y="${425 + i * 56}" font-size="44" font-weight="600" fill="${VIOLET}">${esc(l)}</text>`)
  .join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"
     font-family="Inter, Helvetica, Arial, sans-serif">
  <defs>
    <radialGradient id="tint" cx="50%" cy="0%" r="75%">
      <stop offset="0" stop-color="${VIOLET}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#tint)"/>
  <rect x="60" y="60" width="1080" height="510" rx="32" fill="${CARD}" stroke="${BORDER}" stroke-width="2"/>
  <rect x="120" y="120" width="72" height="72" rx="18" fill="${INK}"/>
  <text x="156" y="167" font-size="30" font-weight="700" fill="#ffffff" text-anchor="middle">DO</text>
  <text x="120" y="340" font-size="104" font-weight="800" fill="${INK}" letter-spacing="-3">${esc(site.name)}</text>
  ${badgeSvg}
  <text x="120" y="528" font-size="28" fill="${MUTED}">devarshiojha.dev</text>
</svg>`;

mkdirSync('public', { recursive: true });
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('Generated public/og.png');
