# Web DFM — Design System Implementation Guide

**Target**: Apply Reese Design System v1.2.0 to Web DFM  
**Current state**: Partially implemented with legacy tokens, inline styles, different naming  
**Goal**: Unified look with AI CAM 3.0 and all other apps

---

## 1. Current State Analysis

### What Exists
- `web/css/style.css` (37KB) — legacy design tokens with different names (`--bg`, `--surface`, `--primary`)
- `web/dfm/index.html` — inline styles mixing old and new token names
- `web/js/*.js` — 8 JS files (130KB total) — no CSS dependencies
- Dark/light theme via `data-theme` attribute (different from `html.light` class)

### Token Mapping (Old → New)

| Legacy (style.css) | Reese Design System | Notes |
|---------------------|-------------------|-------|
| `--bg` | `--canvas-void` | `#08090b` → `#0e1013` |
| `--surface` | `--canvas-surface` | `#13141a` → `#1b1d24` |
| `--surface-alt` | `--canvas-raised` | `#1a1b22` → `#23252d` |
| `--border` | `--border-default` | `rgba(255,255,255,0.07)` → `0.09` |
| `--border-light` | `--border-subtle` | `rgba(255,255,255,0.04)` → `0.06` |
| `--primary` | `--code-action` | `#6c8aff` (same) |
| `--text` | `--ink-primary` | `#eef0f4` → `#e8eaef` |
| `--muted` | `--ink-secondary` | `#b0b4c0` (same) |
| `--dim` | `--ink-tertiary` | `#787c8a` (same) |
| `--green` | `--code-success` | `#4ecb71` (same) |
| `--yellow` | `--code-warning` | `#ffba42` (same) |
| `--red` | `--code-danger` | `#ff6b6b` (same) |
| `--orange` | `--code-tool` | `#ff9a5c` (same) |
| `--radius` | `--r-lg` | `6px` (same) |
| `data-theme="dark"` | `html.light` class | Different mechanism |

---

## 2. Migration Steps

### Step 1: Copy tokens.css to Web DFM

```bash
cp C:/Users/reese/Projects/Design-System/tokens.css C:/Users/reese/Projects/Web\ DFM/web/css/tokens.css
cp C:/Users/reese/Projects/Design-System/icons.css C:/Users/reese/Projects/Web\ DFM/web/css/icons.css
cp C:/Users/reese/Projects/Design-System/icons.svg C:/Users/reese/Projects/Web\ DFM/web/icons.svg
```

### Step 2: Update HTML to link tokens.css

In `web/dfm/index.html`, replace the font import with:

```html
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/icons.css">
<!-- Keep style.css for DFM-specific overrides only -->
<link rel="stylesheet" href="/css/style.css?v=4">
```

### Step 3: Replace legacy tokens in style.css

Do a global find-replace in `web/css/style.css`:

```bash
# Remove the old :root block (lines 14-35)
# Keep only DFM-specific component styles

# Find-replace mappings:
sed -i 's/var(--bg)/var(--canvas-void)/g' web/css/style.css
sed -i 's/var(--surface)/var(--canvas-surface)/g' web/css/style.css
sed -i 's/var(--surface-alt)/var(--canvas-raised)/g' web/css/style.css
sed -i 's/var(--border)/var(--border-default)/g' web/css/style.css
sed -i 's/var(--border-light)/var(--border-subtle)/g' web/css/style.css
sed -i 's/var(--primary)/var(--code-action)/g' web/css/style.css
sed -i 's/var(--text)/var(--ink-primary)/g' web/css/style.css
sed -i 's/var(--muted)/var(--ink-secondary)/g' web/css/style.css
sed -i 's/var(--dim)/var(--ink-tertiary)/g' web/css/style.css
sed -i 's/var(--green)/var(--code-success)/g' web/css/style.css
sed -i 's/var(--yellow)/var(--code-warning)/g' web/css/style.css
sed -i 's/var(--red)/var(--code-danger)/g' web/css/style.css
sed -i 's/var(--orange)/var(--code-tool)/g' web/css/style.css
sed -i 's/var(--radius)/var(--r-lg)/g' web/css/style.css
```

### Step 4: Replace hardcoded colors in inline styles

Search `web/dfm/index.html` for:

```bash
grep -n 'background:#[0-9a-f]\{6\}' web/dfm/index.html
grep -n 'color:#[0-9a-f]\{6\}' web/dfm/index.html
grep -n 'border.*#[0-9a-f]\{6\}' web/dfm/index.html
```

Replace with token references. Common patterns:

| Hardcoded | Replace With |
|-----------|-------------|
| `background:#08090b` | `background:var(--canvas-void)` |
| `background:#13141a` | `background:var(--canvas-surface)` |
| `color:#eef0f4` | `color:var(--ink-primary)` |
| `border:1px solid #1a1b22` | `border:1px solid var(--border-default)` |
| `background:#6c8aff` | `background:var(--code-action)` |

### Step 5: Fix theme switching mechanism

Current: `data-theme="dark"` / `data-theme="light"` on `<html>`  
Target: `html.light` class (matches Reese Design System)

In `web/js/api.js`, find the theme toggle function and update:

```javascript
// OLD
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// NEW
function setTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem('ds-theme', theme);
}
```

In `web/css/style.css`, replace:

```css
/* OLD */
[data-theme="light"] { ... }

/* NEW — tokens.css handles this via html.light */
/* Remove all [data-theme="light"] overrides */
```

### Step 6: Add DFM-specific tokens to tokens.css

Add these to the end of tokens.css (before light mode section):

```css
/* ═══════════════════════════════════════════════════════════════
   DFM-SPECIFIC TOKENS
   ═══════════════════════════════════════════════════════════════ */

/* DFM Analysis Colors */
--dfm-pass: var(--code-success);
--dfm-warn: var(--code-warning);
--dfm-fail: var(--code-danger);
--dfm-info: var(--code-info);

/* Upload Zone */
--upload-bg: var(--canvas-surface);
--upload-border: var(--border-default);
--upload-hover: var(--code-action);

/* 3D Viewer */
--viewer-bg: #070809;
--viewer-grid: var(--border-subtle);
--viewer-axis-x: #ff6b6b;
--viewer-axis-y: #4ecb71;
--viewer-axis-z: #6c8aff;

/* Cost Breakdown */
--cost-material: var(--code-material);
--cost-labor: var(--code-tool);
--cost-setup: var(--code-config);
--cost-finish: var(--code-accent);
```

### Step 7: Update CSS class names

Web DFM uses some non-standard class names. Map them:

| DFM Class | Design System Class |
|-----------|-------------------|
| `.dfm-flag` | `.alert` (with severity class) |
| `.dfm-pass` | `.alert.success` |
| `.dfm-warn` | `.alert.warning` |
| `.dfm-fail` | `.alert.error` |
| `.cost-bar` | `.loading-bar` |
| `.upload-btn` | `.btn.btn-primary` |
| `.material-chip` | `.pill` |

### Step 8: Add missing component classes

Web DFM needs these from tokens.css (already defined):

- `.btn` — all action buttons
- `.input` — material selector, quantity input
- `.select` — machine dropdown
- `.slider` — tolerance adjustment
- `.toggle` — display options
- `.alert` — DFM flags
- `.tab` — analysis sections
- `.modal` — export dialogs
- `.tooltip` — parameter hints

---

## 3. File-by-File Changes

### `web/dfm/index.html`
- [ ] Add `<link rel="stylesheet" href="/css/tokens.css">` before style.css
- [ ] Add `<link rel="stylesheet" href="/css/icons.svg">` for SVG sprites
- [ ] Replace 50+ hardcoded hex colors with token references
- [ ] Replace emoji icons with SVG `<use>` references
- [ ] Add `aria-label` to all icon-only buttons
- [ ] Add `role="switch"` + `aria-checked` to toggles
- [ ] Add `tabindex="0"` to interactive divs
- [ ] Remove `[data-theme="light"]` CSS (tokens.css handles it)

### `web/css/style.css`
- [ ] Remove old `:root` token block (lines 14-35)
- [ ] Remove `[data-theme="light"]` overrides
- [ ] Replace all `var(--legacy)` with `var(--code-*)` tokens
- [ ] Add DFM-specific token definitions
- [ ] Add `@media print` rules
- [ ] Add `:focus-visible` styles
- [ ] Add `@media(prefers-reduced-motion:reduce)` guards
- [ ] Add `@media(prefers-color-scheme:light)` auto-detect

### `web/js/api.js`
- [ ] Update `setTheme()` to use `html.light` class
- [ ] Add service worker registration
- [ ] Add localStorage persistence for theme

### `web/js/controls.js`
- [ ] Add keyboard shortcut overlay (Ctrl+K palette)
- [ ] Add undo/redo for parameter changes
- [ ] Replace emoji in toolbar with SVG icons

### `web/js/viewer.js`
- [ ] Update viewer background to use `--viewer-bg` token
- [ ] Update axis colors to use viewer tokens
- [ ] Add viewport validation legend (safe/warning/error)

### `web/js/report.js`
- [ ] Replace hardcoded cost colors with `--cost-*` tokens
- [ ] Add print-friendly report styles

---

## 4. Verification Checklist

After migration, verify:

```bash
# 1. No legacy tokens remain
grep -r 'var(--bg)' web/ --include="*.css" --include="*.html" --include="*.js"
grep -r 'var(--surface)' web/ --include="*.css" --include="*.html" --include="*.js"
grep -r 'var(--primary)' web/ --include="*.css" --include="*.html" --include="*.js"

# 2. No hardcoded hex in HTML
grep -n 'background:#[0-9a-f]\{6\}' web/dfm/index.html
grep -n 'color:#[0-9a-f]\{6\}' web/dfm/index.html

# 3. tokens.css is linked
grep 'tokens.css' web/dfm/index.html

# 4. Light mode works
# Toggle theme in browser, check all panels switch

# 5. No console errors
# Open browser DevTools, check Console tab

# 6. Accessibility
# Tab through all interactive elements — focus rings visible
```

---

## 5. Priority Order

| Priority | Task | Impact |
|----------|------|--------|
| **1** | Link tokens.css, remove old tokens | Foundation — everything else depends on this |
| **2** | Fix theme switching mechanism | Light/dark mode must work |
| **3** | Replace hardcoded hex in HTML | Consistency with design system |
| **4** | Replace emoji with SVG icons | Professional appearance |
| **5** | Add ARIA attributes | Accessibility compliance |
| **6** | Add print styles | Report printing |
| **7** | Add keyboard shortcuts | Power user efficiency |
| **8** | Add undo/redo | Error recovery |
| **9** | Add service worker | Offline support |

---

## 6. Estimated Effort

| Phase | Files Changed | Lines Changed | Time |
|-------|--------------|---------------|------|
| Token migration | 3 | ~200 | 30min |
| HTML cleanup | 1 | ~150 | 45min |
| JS updates | 3 | ~100 | 30min |
| New features | 2 | ~300 | 1hr |
| Testing | — | — | 30min |
| **Total** | **9 files** | **~750 lines** | **~3hrs** |

---

## 7. Rollback Plan

If anything breaks:

```bash
cd C:/Users/reese/Projects/Web\ DFM
git stash  # Save current changes
git checkout -- .  # Restore to last commit
```

The original `style.css` is preserved as `style.css.bak` before migration.

---

*Generated from Reese Design System v1.2.0 — https://github.com/Reese000/reese-design-system*
