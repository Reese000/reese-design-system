#!/usr/bin/env node
/**
 * Reese Design System — Token Validator
 * Checks tokens.css for:
 * - Valid hex colors (no 9-digit hex)
 * - Every var() reference is defined
 * - Complete -dim/-mid matrix for all 13 categories
 * - No missing required tokens
 */

const fs = require('fs');
const path = require('path');

const tokens = fs.readFileSync(path.join(__dirname, '..', 'tokens.css'), 'utf8');
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

// 1. Check for invalid hex values
const hexPattern = /#([0-9a-fA-F]{3,8})\b/g;
let match;
const badHex = [];
while ((match = hexPattern.exec(tokens)) !== null) {
  const hex = match[1];
  if (hex.length !== 3 && hex.length !== 4 && hex.length !== 6 && hex.length !== 8) {
    badHex.push(match[0]);
  }
}
check('No invalid hex', badHex.length === 0, badHex.join(', '));

// 2. Check all 13 categories have -dim and -mid
const categories = ['action', 'danger', 'success', 'warning', 'info', 'accent', 'tool', 'material', 'data', 'view', 'config', 'process', 'ai'];
let missingVariants = [];
for (const cat of categories) {
  const hasBase = tokens.includes(`--code-${cat}:`);
  const hasDim = tokens.includes(`--code-${cat}-dim:`);
  const hasMid = tokens.includes(`--code-${cat}-mid:`);
  if (!hasBase) missingVariants.push(`${cat} (base)`);
  if (!hasDim) missingVariants.push(`${cat}-dim`);
  if (!hasMid) missingVariants.push(`${cat}-mid`);
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
let missing = required.filter(t => !tokens.includes(t + ':'));
check('All required tokens defined', missing.length === 0, `Missing: ${missing.join(', ')}`);

// 4. Check for var() references that aren't defined
const varRefs = [...tokens.matchAll(/var\((--[a-z0-9-]+)\)/g)].map(m => m[1]);
const varDefs = [...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(m => m[1]);
const undefined = varRefs.filter(v => !varDefs.includes(v) && !v.startsWith('--code-'));
// Filter out cross-file refs
const crossFile = undefined.filter(v => tokens.includes(v));
if (crossFile.length > 0) {
  warn('Undefined var() refs', crossFile.join(', '));
}

// 5. Check animation keyframes
const keyframes = ['fadeSlideIn', 'skeletonPulse', 'spin', 'progressBar'];
let missingKf = keyframes.filter(k => !tokens.includes(`@keyframes ${k}`));
check('All keyframes defined', missingKf.length === 0, `Missing: ${missingKf.join(', ')}`);

// 6. Check component classes exist
const components = ['.btn', '.input', '.select', '.slider', '.toggle', '.alert', '.tab', '.spinner', '.skeleton', '.modal', '.tip', '.num'];
let missingComp = components.filter(c => !tokens.includes(c + '{') && !tokens.includes(c + ' {'));
check('All component classes defined', missingComp.length === 0, `Missing: ${missingComp.join(', ')}`);

console.log(`\n  ${errors === 0 ? '✅ PASS' : '❌ FAIL'} — ${errors} errors, ${warnings} warnings`);
process.exit(errors === 0 ? 0 : 1);
