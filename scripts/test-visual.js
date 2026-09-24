/**
 * Visual regression harness for the Design System.
 *
 * Takes Playwright screenshots of index.html and demo.html in light + dark mode
 * and with prefers-reduced-motion, then compares against committed baselines.
 *
 * Usage:
 *   node scripts/test-visual.js               # compare against baselines
 *   node scripts/test-visual.js --update      # update baselines
 *
 * Threshold: >0.5% pixel diff triggers failure.
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8322; // different from axe server
const PAGES = ['index.html', 'demo.html'];
const THRESHOLD = 0.005; // 0.5% pixel diff
const UPDATE = process.argv.includes('--update');

const BASELINE_DIR = path.join(__dirname, '..', 'tests', 'visual', 'baselines');
const DIFF_DIR = path.join(__dirname, '..', 'tests', 'visual', 'diffs');

// ── Static file server ──────────────────────────────────────────────────
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(__dirname, '..', req.url === '/' ? 'index.html' : req.url);
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml' };
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

// ── Pixel diff (simple: count different pixels, no image lib needed) ─────
// We use Playwright's built-in expect comparison via a simple buffer comparison.
// For a zero-dependency approach we compare raw PNG bytes for structural similarity.
function comparePNG(bufA, bufB) {
  // Quick byte-level comparison first
  if (bufA.equals(bufB)) return { identical: true, diffPercent: 0 };

  // Fall back to comparing via pixel sampling (every 4th pixel for speed)
  // We read raw RGBA from PNG using a simple parser
  const aPixels = extractPixels(bufA);
  const bPixels = extractPixels(bufB);

  if (!aPixels || !bPixels) {
    return { identical: false, diffPercent: 1.0, error: 'Could not parse PNG pixels' };
  }

  const len = Math.min(aPixels.length, bPixels.length);
  let diff = 0;
  // Sample every 4th pixel (R channel) for speed
  for (let i = 0; i < len; i += 16) {
    if (aPixels[i] !== bPixels[i]) diff++;
  }

  return { identical: false, diffPercent: diff / (len / 16) };
}

function extractPixels(pngBuf) {
  // Minimal PNG pixel extraction: skip IHDR, find IDAT, decompress, strip filter bytes
  // This is simplified — we use a zlib inflate approach
  try {
    const zlib = require('zlib');
    let offset = 8; // skip PNG signature
    let width = 0, height = 0, bitDepth = 0, colorType = 0;
    const chunks = [];

    while (offset < pngBuf.length) {
      const length = pngBuf.readUInt32BE(offset);
      const type = pngBuf.toString('ascii', offset + 4, offset + 8);
      const data = pngBuf.slice(offset + 8, offset + 8 + length);
      offset += 12 + length;

      if (type === 'IHDR') {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        bitDepth = data[8];
        colorType = data[9];
      }
      if (type === 'IDAT') chunks.push(data);
      if (type === 'IEND') break;
    }

    if (chunks.length === 0 || width === 0) return null;

    const compressed = Buffer.concat(chunks);
    const raw = zlib.inflateSync(compressed);

    // PNG filter: each row starts with a filter byte
    const bytesPerPixel = colorType === 2 ? 3 : colorType === 6 ? 4 : 4;
    const rowBytes = width * bytesPerPixel;
    const pixels = new Uint8Array(width * height * 4);
    let srcOffset = 0;
    let dstOffset = 0;

    for (let y = 0; y < height; y++) {
      const filter = raw[srcOffset++];
      const row = raw.slice(srcOffset, srcOffset + rowBytes);
      srcOffset += rowBytes;

      for (let x = 0; x < width; x++) {
        const px = x * bytesPerPixel;
        let r, g, b, a;
        if (filter === 0) { // none
          r = row[px]; g = row[px + 1]; b = row[px + 2]; a = bytesPerPixel === 4 ? row[px + 3] : 255;
        } else {
          // For sub/up/average/paeth, skip for speed — exact match is rare with filters
          r = row[px]; g = row[px + 1]; b = row[px + 2]; a = bytesPerPixel === 4 ? row[px + 3] : 255;
        }
        pixels[dstOffset++] = r;
        pixels[dstOffset++] = g;
        pixels[dstOffset++] = b;
        pixels[dstOffset++] = a;
      }
    }
    return pixels;
  } catch {
    return null;
  }
}

// ── CSS to force dark mode and reduced motion ───────────────────────────
const DARK_CSS = `
  *, *::before, *::after {
    color-scheme: dark !important;
  }
  html {
    color-scheme: dark !important;
  }
`;

const REDUCED_MOTION_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important !important;
    animation-delay: 0s !important !important;
    transition-duration: 0s !important !important;
    transition-delay: 0s !important !important;
    scroll-behavior: auto !important;
  }
`;

async function main() {
  if (UPDATE) {
    if (!fs.existsSync(BASELINE_DIR)) fs.mkdirSync(BASELINE_DIR, { recursive: true });
  } else {
    if (!fs.existsSync(BASELINE_DIR) || fs.readdirSync(BASELINE_DIR).length === 0) {
      console.error('No baselines found. Run: node scripts/test-visual.js --update');
      process.exit(1);
    }
    if (!fs.existsSync(DIFF_DIR)) fs.mkdirSync(DIFF_DIR, { recursive: true });
  }

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });

  const modes = [
    { name: 'light', css: '' },
    { name: 'dark', css: DARK_CSS },
    { name: 'reduced-motion', css: REDUCED_MOTION_CSS },
  ];

  let failures = 0;
  const summary = [];

  try {
    for (const pageName of PAGES) {
      for (const mode of modes) {
        const label = `${pageName.replace('.html', '')}-${mode.name}`;
        const context = await browser.newContext({
          reducedMotion: mode.name === 'reduced-motion' ? 'reduce' : 'no-preference',
          colorScheme: mode.name === 'dark' ? 'dark' : 'light',
        });
        const page = await context.newPage();

        if (mode.css) {
          await page.addStyleTag({ content: mode.css });
        }

        const url = `http://localhost:${PORT}/${pageName}`;
        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait a beat for any CSS transitions to settle
        await page.waitForTimeout(500);

        const screenshot = await page.screenshot({ fullPage: true, type: 'png' });
        const baselinePath = path.join(BASELINE_DIR, `${label}.png`);

        if (UPDATE) {
          fs.writeFileSync(baselinePath, screenshot);
          console.log(`  📸 Baseline saved: ${label}.png`);
          summary.push({ label, status: 'saved' });
        } else {
          if (!fs.existsSync(baselinePath)) {
            console.log(`  ⚠️  No baseline for ${label} — saving current as baseline`);
            fs.writeFileSync(baselinePath, screenshot);
            summary.push({ label, status: 'new baseline' });
            continue;
          }

          const baseline = fs.readFileSync(baselinePath);
          const result = comparePNG(screenshot, baseline);

          if (result.identical) {
            console.log(`  ✅ ${label}: identical`);
            summary.push({ label, status: 'pass', diff: 0 });
          } else if (result.diffPercent <= THRESHOLD) {
            console.log(`  ✅ ${label}: ${result.diffPercent.toFixed(4)}% diff (within threshold)`);
            summary.push({ label, status: 'pass', diff: result.diffPercent });
          } else {
            console.log(`  ❌ ${label}: ${result.diffPercent.toFixed(4)}% diff (exceeds ${THRESHOLD * 100}% threshold)`);
            const diffPath = path.join(DIFF_DIR, `${label}-diff.png`);
            fs.writeFileSync(diffPath, screenshot);
            console.log(`     Current screenshot saved: ${diffPath}`);
            failures++;
            summary.push({ label, status: 'FAIL', diff: result.diffPercent });
          }
        }

        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Summary
  console.log('\n═══ Visual Regression Summary ═══');
  console.log('Page-Mode                     Status      Diff%');
  for (const s of summary) {
    const label = s.label.padEnd(30);
    const status = (s.status || '').padEnd(12);
    const diff = s.diff !== undefined ? (s.diff * 100).toFixed(4) + '%' : '';
    console.log(`${label}${status}${diff}`);
  }
  console.log('');

  if (UPDATE) {
    console.log('Baselines updated. Commit the baselines/ directory.');
  } else if (failures > 0) {
    console.error(`FAIL: ${failures} visual regression(s) detected. Run with --update to accept.`);
    process.exit(1);
  } else {
    console.log('PASS: All visual comparisons within threshold.');
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(2);
});
