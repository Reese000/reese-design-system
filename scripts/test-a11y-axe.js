/**
 * axe-core WCAG 2.2 AA audit for the Design System.
 *
 * Runs @axe-core/playwright against locally-served index.html and demo.html.
 * Exits non-zero on any Critical or Serious violation (STANDARDS.md floor).
 *
 * Usage:
 *   node scripts/test-a11y-axe.js            # audit both pages
 *   node scripts/test-a11y-axe.js index.html # audit one page only
 */

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8321;
const PAGES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['index.html', 'demo.html'];

// ── Simple static file server ────────────────────────────────────────────
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

async function main() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });

  let totalViolations = 0;
  const results = [];

  try {
    for (const pageName of PAGES) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const url = `http://localhost:${PORT}/${pageName}`;
      console.log(`\n═══ Scanning ${url} ═══`);

      await page.goto(url, { waitUntil: 'networkidle' });

      const resultsObj = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'])
        .analyze();

      // Print results
      if (resultsObj.violations.length === 0) {
        console.log(`  ✅ No WCAG violations found on ${pageName}`);
      } else {
        console.log(`  ❌ ${resultsObj.violations.length} violation(s) on ${pageName}:\n`);
        for (const v of resultsObj.violations) {
          const impact = v.impact.toUpperCase();
          const nodes = v.nodes.length;
          console.log(`  [${impact}] ${v.id} — ${v.help} (${nodes} element${nodes > 1 ? 's' : ''})`);
          console.log(`    Help URL: ${v.helpUrl}`);
          for (const n of v.nodes.slice(0, 5)) {
            console.log(`    • ${n.html.substring(0, 120)}`);
          }
          if (v.nodes.length > 5) {
            console.log(`    … and ${v.nodes.length - 5} more`);
          }
          console.log('');
        }
      }

      // Write JSON report
      const reportDir = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
      const reportPath = path.join(reportDir, `axe-${pageName.replace('.html', '')}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(resultsObj, null, 2));
      console.log(`  📄 Report saved: ${reportPath}`);

      // Count Critical and Serious
      const criticalSerious = resultsObj.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      totalViolations += criticalSerious.length;

      if (criticalSerious.length > 0) {
        console.log(`\n  🚫 BLOCKING: ${criticalSerious.length} Critical/Serious violation(s) — CI will fail.`);
      }

      results.push({
        page: pageName,
        total: resultsObj.violations.length,
        criticalSerious: criticalSerious.length,
        passes: resultsObj.passes.length,
        incomplete: resultsObj.incomplete.length,
      });

      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Summary
  console.log('\n═══ Axe-core Audit Summary ═══');
  console.log('Page                    Violations   Critical/Serious   Passes');
  for (const r of results) {
    const name = r.page.padEnd(24);
    const viol = String(r.total).padEnd(13);
    const cs = String(r.criticalSerious).padEnd(17);
    console.log(`${name}${viol}${cs}${r.passes}`);
  }
  console.log('');

  if (totalViolations > 0) {
    console.error(`FAIL: ${totalViolations} Critical/Serious violation(s) found. CI gate blocks.`);
    process.exit(1);
  }

  console.log('PASS: No Critical or Serious WCAG violations. Audit green.');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(2);
});
