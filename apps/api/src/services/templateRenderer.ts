import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export interface RenderInput {
  imageBuffer: Buffer;
  headline: string;       // ~60 chars max for template display
  dealerName: string;
  city: string;
  phone: string;
  primaryColor: string;   // hex e.g. '#1877F2'
  price?: number;         // in smallest currency unit (paise)
  outputDir: string;
  filePrefix: string;
}

export interface RenderOutput {
  boldBanner: string;
  minimalShowcase: string;
  offerCard: string;
}

// Word-wrap text into lines for SVG (no native wrapping in SVG)
function wrapText(text: string, maxChars: number, maxLines = 2): string[] {
  const words = text.replace(/[\n\r]/g, ' ').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (lines.length >= maxLines) break;
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word.length > maxChars ? `${word.slice(0, maxChars - 3)}...` : word;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.slice(0, maxLines);
}

// Escape XML special characters
function x(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Parse hex color to RGB tuple
function hexRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '').match(/[0-9a-f]{2}/gi);
  if (!m || m.length < 3) return [24, 119, 242];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

// Format price in paise to display string (uses XML entity for ₹)
function fmtPrice(paise: number): string {
  return `&#x20B9;${(paise / 100000).toFixed(2)} L`;
}

// ─── Template 1: Bold Banner ──────────────────────────────────────────────────
// Car image fills 1080x1080. Dark gradient from mid → bottom. Text on bottom.
function boldBannerOverlay(input: RenderInput): Buffer {
  const { headline, dealerName, city, phone, primaryColor, price } = input;
  const lines = wrapText(headline, 27, 2);
  const hasPrice = price != null && price > 0;

  // Positions from bottom upward
  const cityY = 1052;
  const dealerY = 1008;
  const priceY = hasPrice ? 955 : null;
  const h2Y = hasPrice ? 885 : (lines.length > 1 ? 930 : 950);
  const h1Y = h2Y - (lines.length > 1 ? 56 : 0);
  const headlineStartY = lines.length > 1 ? h1Y : h2Y;

  const priceEl = priceY
    ? `<rect x="54" y="${priceY - 42}" width="288" height="52" rx="26" fill="${x(primaryColor)}"/>
       <text x="198" y="${priceY - 10}" font-family="Helvetica Neue,Arial,sans-serif" font-size="24"
         font-weight="700" fill="white" text-anchor="middle">${fmtPrice(price!)}</text>`
    : '';

  const headlineEls = lines
    .map((line, i) => `<text x="54" y="${headlineStartY + i * 56}"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="44" font-weight="800"
      fill="white">${x(line)}</text>`)
    .join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="38%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#g)"/>
  <rect y="1068" width="1080" height="12" fill="${x(primaryColor)}"/>
  ${headlineEls}
  ${priceEl}
  <text x="54" y="${dealerY}" font-family="Helvetica Neue,Arial,sans-serif" font-size="26"
    font-weight="600" fill="rgba(255,255,255,0.95)">${x(dealerName)}</text>
  <text x="54" y="${cityY}" font-family="Helvetica Neue,Arial,sans-serif" font-size="20"
    fill="rgba(255,255,255,0.68)">${x(city)} &#183; ${x(phone)}</text>
</svg>`;

  return Buffer.from(svg);
}

// ─── Template 2: Minimal Showcase ─────────────────────────────────────────────
// Car image top 580px. White card bottom 500px with branding and text.
function minimalShowcaseOverlay(input: RenderInput): Buffer {
  const { headline, dealerName, city, phone, primaryColor, price } = input;
  const [r, g, b] = hexRgb(primaryColor);
  const lines = wrapText(headline, 32, 2);
  const hasPrice = price != null && price > 0;

  const headlineY = 700;
  const priceY = hasPrice ? headlineY + lines.length * 52 + 44 : null;
  const ctaY = (priceY ?? headlineY + lines.length * 52) + 40;

  const priceEl = priceY
    ? `<text x="60" y="${priceY}" font-family="Helvetica Neue,Arial,sans-serif" font-size="30"
        font-weight="700" fill="rgb(${r},${g},${b})">${fmtPrice(price!)}</text>`
    : '';

  const headlineEls = lines
    .map((line, i) => `<text x="60" y="${headlineY + i * 52}"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="36" font-weight="700"
      fill="#1a1a2e">${x(line)}</text>`)
    .join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
  <rect y="580" width="1080" height="500" fill="white"/>
  <rect y="580" width="1080" height="6" fill="${x(primaryColor)}"/>
  <text x="60" y="644" font-family="Helvetica Neue,Arial,sans-serif" font-size="22"
    font-weight="700" fill="rgb(${r},${g},${b})">${x(dealerName)}</text>
  ${headlineEls}
  ${priceEl}
  <text x="60" y="${Math.min(ctaY, 1050)}" font-family="Helvetica Neue,Arial,sans-serif" font-size="19"
    fill="#6b7280">${x(city)} &#183; ${x(phone)}</text>
</svg>`;

  return Buffer.from(svg);
}

// ─── Template 3: Offer Card ────────────────────────────────────────────────────
// Solid primary-color background. Top header bar. Car image center. Dark footer card.
function offerCardOverlay(input: RenderInput): Buffer {
  const { headline, dealerName, city, phone, primaryColor, price } = input;
  const lines = wrapText(headline, 30, 2);
  const hasPrice = price != null && price > 0;

  const headlineY = 820;
  const priceY = hasPrice ? headlineY + lines.length * 52 + 36 : null;

  const priceEl = priceY
    ? `<text x="60" y="${priceY}" font-family="Helvetica Neue,Arial,sans-serif" font-size="28"
        font-weight="700" fill="${x(primaryColor)}">${fmtPrice(price!)}</text>`
    : '';

  const headlineEls = lines
    .map((line, i) => `<text x="60" y="${headlineY + i * 52}"
      font-family="Helvetica Neue,Arial,sans-serif" font-size="36" font-weight="800"
      fill="white">${x(line)}</text>`)
    .join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
  <rect width="1080" height="108" fill="rgba(0,0,0,0.35)"/>
  <text x="540" y="70" font-family="Helvetica Neue,Arial,sans-serif" font-size="30"
    font-weight="700" fill="white" text-anchor="middle">${x(dealerName)}</text>
  <rect y="760" width="1080" height="320" fill="rgba(0,0,0,0.82)"/>
  ${headlineEls}
  ${priceEl}
  <text x="60" y="1050" font-family="Helvetica Neue,Arial,sans-serif" font-size="19"
    fill="rgba(255,255,255,0.65)">${x(city)} &#183; ${x(phone)}</text>
</svg>`;

  return Buffer.from(svg);
}

// ─── Main render function ──────────────────────────────────────────────────────
export async function renderCreatives(input: RenderInput): Promise<RenderOutput> {
  await mkdir(input.outputDir, { recursive: true });

  const [r, g, b] = hexRgb(input.primaryColor);

  // Prepare source image variants
  const carSquare = await sharp(input.imageBuffer)
    .resize(1080, 1080, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88 })
    .toBuffer();

  const carTop = await sharp(input.imageBuffer)
    .resize(1080, 580, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88 })
    .toBuffer();

  const carContained = await sharp(input.imageBuffer)
    .resize(900, 520, { fit: 'contain', background: { r, g, b, alpha: 255 } })
    .flatten({ background: { r, g, b } })
    .jpeg({ quality: 88 })
    .toBuffer();

  // ── Template 1: Bold Banner ──
  const boldBannerBuf = await sharp(carSquare)
    .composite([{ input: boldBannerOverlay(input), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
  const boldBannerFile = `${input.filePrefix}_bold_banner.jpg`;
  await writeFile(path.join(input.outputDir, boldBannerFile), boldBannerBuf);

  // ── Template 2: Minimal Showcase ──
  const whiteCanvas = await sharp({
    create: { width: 1080, height: 1080, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .jpeg()
    .toBuffer();

  const minimalBuf = await sharp(whiteCanvas)
    .composite([
      { input: carTop, top: 0, left: 0 },
      { input: minimalShowcaseOverlay(input), top: 0, left: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
  const minimalFile = `${input.filePrefix}_minimal_showcase.jpg`;
  await writeFile(path.join(input.outputDir, minimalFile), minimalBuf);

  // ── Template 3: Offer Card ──
  const colorCanvas = await sharp({
    create: { width: 1080, height: 1080, channels: 3, background: { r, g, b } },
  })
    .jpeg()
    .toBuffer();

  const offerBuf = await sharp(colorCanvas)
    .composite([
      { input: carContained, top: 118, left: 90 },
      { input: offerCardOverlay(input), top: 0, left: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
  const offerCardFile = `${input.filePrefix}_offer_card.jpg`;
  await writeFile(path.join(input.outputDir, offerCardFile), offerBuf);

  return {
    boldBanner: boldBannerFile,
    minimalShowcase: minimalFile,
    offerCard: offerCardFile,
  };
}

// Extract a short headline from a longer caption (first sentence, max 70 chars)
export function extractHeadline(captionText: string): string {
  const first = captionText.split(/[.!?\n]/)[0]?.trim() ?? '';
  if (first.length <= 70) return first;
  const cut = captionText.slice(0, 70);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 30 ? `${cut.slice(0, lastSpace)}...` : `${cut}...`;
}
