#!/usr/bin/env node
/**
 * Reese Design System — Token Validator
 *
 * tokens.css is the single source of truth. This validator enforces:
 * - Valid hex colors in tokens.css AND in HTML inline styles
 * - Every var() reference (all files) resolves to a definition
 * - No HTML file redefines a tokens.css token with a different value (drift)
 * - Complete -dim/-mid matrix for all 13 categories
 * - No missing required tokens
 *
 * Exit code is non-zero on any error. Warnings are advisory only and are
 * reserved for style-level observations, never for resolution failures.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const tokens = read('tokens.css');
const htmlFiles = ['index.html', 'demo.html'].filter(f =>
  fs.existsSync(path.join(root, f))
);

let errors = 0;
let warnings = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log(`  ✅ ${name}`);
  } else {
    console.log(`  ❌ ${name} — ${detail}`);
    errors++;
  }
}

function warn(name, detail) {
  console.log(`  ⚠ ${name} — ${detail}`);
  warnings++;
}

// ── Parsing helpers ─────────────────────────────────────────────
// Definitions: `--name: value;` (captures value up to ; or })
function parseDefs(css) {
  const defs = new Map();
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
    // First definition wins for drift comparison (base :root block);
    // later theme-override blocks legitimately redefine values.
    if (!defs.has(m[1])) defs.set(m[1], m[2].trim());
    defs.set(m[1] + '@last', m[2].trim());
  }
  return defs;
}

// References: `var(--name)` requires a definition; `var(--name, fallback)`
// is self-resolving and exempt. Nested fallbacks match on their own.
function parseRefs(css) {
  return [...css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*([,)])/g)]
    .filter(m => m[2] === ')')
    .map(m => m[1]);
}

// HTML files: only CSS is validated — <style> blocks and style="" attributes.
// Prose like "Tool #4" and JS strings must not trip the hex/token checks.
function extractCss(html) {
  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => m[1]);
  const styleAttrs = [...html.matchAll(/style\s*=\s*"([^"]*)"/gi)]
    .map(m => m[1]);
  return styleBlocks.concat(styleAttrs).join('\n');
}

function findBadHex(text) {
  const bad = [];
  for (const m of text.matchAll(/#([0-9a-fA-F]+)\b/g)) {
    const len = m[1].length;
    if (len !== 3 && len !== 4 && len !== 6 && len !== 8) bad.push(m[0]);
  }
  return bad;
}

const tokenDefs = parseDefs(tokens);
const tokenNames = new Set(
  [...tokenDefs.keys()].filter(k => !k.endsWith('@last'))
);

// 1. Invalid hex — tokens.css and every HTML file
check('tokens.css: no invalid hex', findBadHex(tokens).length === 0,
  findBadHex(tokens).join(', '));
const htmlCss = new Map(htmlFiles.map(f => [f, extractCss(read(f))]));
for (const f of htmlFiles) {
  const bad = findBadHex(htmlCss.get(f));
  check(`${f}: no invalid hex`, bad.length === 0, bad.join(', '));
}

// 2. Check all 13 categories have -dim and -mid
const categories = ['action', 'danger', 'success', 'warning', 'info', 'accent', 'tool', 'material', 'data', 'view', 'config', 'process', 'ai'];
let missingVariants = [];
for (const cat of categories) {
  if (!tokenNames.has(`--code-${cat}`)) missingVariants.push(`${cat} (base)`);
  if (!tokenNames.has(`--code-${cat}-dim`)) missingVariants.push(`${cat}-dim`);
  if (!tokenNames.has(`--code-${cat}-mid`)) missingVariants.push(`${cat}-mid`);
}
check('13×3 color matrix complete', missingVariants.length === 0, `Missing: ${missingVariants.join(', ')}`);

// 3. Check required tokens exist
const required = [
  '--canvas-void', '--canvas-base', '--canvas-surface', '--canvas-raised', '--canvas-elevated', '--canvas-bright',
  '--ink-primary', '--ink-secondary', '--ink-tertiary', '--ink-muted', '--ink-ghost',
  '--border-subtle', '--border-default', '--border-strong',
  '--font-ui', '--font-mono',
  '--r-xs', '--r-sm', '--r-md', '--r-lg', '--r-full',
  '--h-xs', '--h-sm', '--h-md', '--h-lg', '--h-xl',
  '--ease-out', '--duration-fast',
];
let missing = required.filter(t => !tokenNames.has(t));
check('All required tokens defined', missing.length === 0, `Missing: ${missing.join(', ')}`);

// 4. Every var() reference resolves — tokens.css must be self-contained;
//    HTML files may also use their own locally-defined properties.
{
  const unresolved = [...new Set(parseRefs(tokens))].filter(v => !tokenNames.has(v));
  check('tokens.css: all var() refs defined', unresolved.length === 0,
    `Undefined: ${unresolved.join(', ')}`);
}
for (const f of htmlFiles) {
  const css = htmlCss.get(f);
  const localDefs = parseDefs(css);
  const unresolved = [...new Set(parseRefs(css))].filter(
    v => !tokenNames.has(v) && !localDefs.has(v)
  );
  check(`${f}: all var() refs defined`, unresolved.length === 0,
    `Undefined: ${unresolved.join(', ')}`);
}

// 5. Drift: HTML files must not redefine a tokens.css token to a different
//    value in their base block — tokens.css is the single source of truth.
for (const f of htmlFiles) {
  const localDefs = parseDefs(htmlCss.get(f));
  const drifted = [];
  for (const [name, value] of localDefs) {
    if (name.endsWith('@last')) continue;
    if (tokenNames.has(name) && tokenDefs.get(name) !== value) {
      drifted.push(`${name} (${f}: ${value} ≠ tokens.css: ${tokenDefs.get(name)})`);
    }
  }
  check(`${f}: no token drift vs tokens.css`, drifted.length === 0,
    drifted.slice(0, 8).join('; ') + (drifted.length > 8 ? ` …+${drifted.length - 8} more` : ''));
}

// 6. Check animation keyframes
const keyframes = ['fadeSlideIn', 'skeletonPulse', 'spin', 'progressBar'];
let missingKf = keyframes.filter(k => !tokens.includes(`@keyframes ${k}`));
check('All keyframes defined', missingKf.length === 0, `Missing: ${missingKf.join(', ')}`);

// 7. Check component classes exist
const components = ['.btn', '.input', '.select', '.slider', '.toggle', '.alert', '.tab', '.spinner', '.skeleton', '.modal', '.tip', '.num'];
let missingComp = components.filter(c => {
  // Match the class as a selector token: start-of-selector or after a
  // combinator/comma, followed by {, comma, space, pseudo, or another part.
  const re = new RegExp(`(^|[\\s,}])${c.replace('.', '\\.')}[\\s,{:.\\[]`, 'm');
  return !re.test(tokens);
});
check('All component classes defined', missingComp.length === 0, `Missing: ${missingComp.join(', ')}`);

// 8. Hardcoded-hex ratchet — HTML files should use var(); one-off hex
//    usages (excluding custom-property definitions) must not increase.
{
  const baseline = JSON.parse(read(path.join('scripts', 'hex-baseline.json')));
  for (const f of htmlFiles) {
    const stripped = htmlCss.get(f).replace(/--[a-z0-9-]+\s*:\s*[^;}]+/g, '');
    const count = [...stripped.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].length;
    const max = baseline[f];
    if (typeof max !== 'number') {
      warn(`${f}: no hex baseline`, 'add an entry to scripts/hex-baseline.json');
      continue;
    }
    check(`${f}: hardcoded hex ≤ baseline (${count}/${max})`, count <= max,
      `new hardcoded colors added — use tokens, or consciously raise the baseline`);
    if (count < max) {
      warn(`${f}: hex baseline can ratchet down`, `${count} < ${max} — lower it in scripts/hex-baseline.json`);
    }
  }
}

// 9. Accessibility invariants — these live in tokens.css and must not regress.
check('tokens.css: :focus-visible styles present', tokens.includes(':focus-visible'),
  'keyboard focus indicators were removed');
check('tokens.css: prefers-reduced-motion honored', tokens.includes('prefers-reduced-motion'),
  'reduced-motion media query was removed');

console.log(`\n  ${errors === 0 ? '✅ PASS' : '❌ FAIL'} — ${errors} errors, ${warnings} warnings`);
process.exit(errors === 0 ? 0 : 1);
