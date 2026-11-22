// Generates public/og.png (the link-preview image for LinkedIn, Slack, X, ...).
// It reads the name and headline from src/content/site.json, so changing your headline
// there updates the image on the next build. Runs automatically before `npm run build` (see "prebuild").
// Design: near-black slate background, teal accent, no photo.
import { readFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const site = JSON.parse(readFileSync('src/content/site.json', 'utf8'));

// Same colours as src/styles/global.css
const BG = '#0b1016';
const SURFACE = '#131b24';
const ACCENT = '#2dd4bf';
const TEXT = '#e6edf3';
const MUTED = '#9fb0c0';

// SVG text must be escaped (the headline contains "&").
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

const headlineLines = wrap(site.badge, 22);
const headlineSvg = headlineLines
  .map((l, i) => `<text x="100" y="${360 + i * 64}" font-size="52" font-weight="600" fill="${ACCENT}">${esc(l)}</text>`)
  .join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"
     font-family="Inter, Helvetica, Arial, sans-serif">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="40" y="40" width="1120" height="550" rx="28" fill="${SURFACE}" stroke="#243040" stroke-width="2"/>
  <rect x="100" y="150" width="90" height="8" rx="4" fill="${ACCENT}"/>
  <text x="100" y="270" font-size="92" font-weight="700" fill="${TEXT}">${esc(site.name)}</text>
  ${headlineSvg}
  <text x="100" y="540" font-size="28" fill="${MUTED}">devarshiojha.dev</text>
</svg>`;

mkdirSync('public', { recursive: true });
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('Generated public/og.png');
