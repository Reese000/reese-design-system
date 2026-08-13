# Reese Design System v1.2

## Utilitarian Interface Template for CNC CAM Software

> Every feature visible. Zero hidden menus. Maximized action space.
> Color-coded semantics. Keyboard-first. Built for complex software
> that users need to master fast.

**Purpose:** A dark-mode-first, offline-capable design system providing 13 semantic color tokens, keyboard-first navigation, density tiers, and a full component library — built to skin CNC/CAM/DFM/nesting/ML desktop tools with a consistent utilitarian aesthetic.

**Target projects:** AI CAM 3.0 · Deepnest · Web DFM · Evolution Engine · Foundry Manager · reesecnc.com

---

## Quick Start

```html
<link rel="stylesheet" href="tokens.css">
```

`tokens.css` is the single source of truth — all colors, spacing, radii, typography, and component styles. Both `index.html` and `demo.html` `<link>` it. Never inline a divergent copy.

---

## Design Principles

### 1. Maximized Action Space
- **XL buttons (52px)** for primary actions (Generate, Execute)
- **LG buttons (44px)** for secondary actions (Load, Configure)
- **MD buttons (36px)** for toolbar items
- **SM buttons (24px)** for inline / dense contexts
- Every button shows its keyboard shortcut

### 2. Zero Hidden Menus
- All features visible on screen simultaneously
- Toolbar buttons, action grids, inspector panels — one click away
- Progressive complexity through **color**, not through nesting
- No hamburger menus on desktop

### 3. Semantic Color Coding
**13 distinct colors** map every type of action and data:

| Color | Hex | Category | Use |
|-------|-----|----------|-----|
| Blue | `#6c8aff` | Action | Primary CTAs, active states |
| Red | `#ff6b6b` | Danger | Destructive actions, errors |
| Green | `#4ecb71` | Success | Completed, verified, ready |
| Amber | `#ffba42` | Warning | Caution, attention needed |
| Cyan | `#7ce0ff` | Info | Informational, reference |
| Purple | `#c084fc` | Accent | Configuration, settings |
| Orange | `#ff9a5c` | Tool | Tools, operations, machining |
| Teal | `#5ce1e6` | Material | Materials, supply chain |
| Pink | `#ff6baa` | Data | Metrics, measurements |
| Lime | `#a3e635` | View | Viewport, camera, display |
| Gold | `#fbbf24` | Config | Parameters, tuning |
| Magenta | `#f472b6` | AI | AI/ML, neural nets |
| Indigo | `#818cf8` | Process | Process/workflow |

### 4. Keyboard-First Navigation
- `Ctrl+K` opens command palette in every application
- Shortcuts displayed inline on every button
- Focus rings on all interactive elements via `:focus-visible`
- Tab order follows visual hierarchy

### 5. Density Without Clutter
- Information-dense panels use color and spacing — not cards-in-cards
- Monospace for data, proportional for labels
- Tabular alignment for numbers (`font-variant-numeric: tabular-nums`)

### 6. Dark-Mode Native
- Near-black canvas with luminance-stepped surfaces
- Semi-transparent white borders
- Never pure black (`#000`) or pure white (`#fff`)
- Eyes stay comfortable during long sessions
- Light mode available via `html.light` class or `prefers-color-scheme`

---

## Density Tiers

| Tier | Control Height | Use Case |
|------|---------------|----------|
| Hero | 52px (`--h-2xl`) | Featured CTAs, primary actions |
| Primary | 44px (`--h-xl`) | Main action buttons |
| Comfortable | 36px (`--h-lg`) | Toolbar buttons, inputs |
| Standard | 28px (`--h-md`) | Menus, tree items |
| Dense | 24px (`--h-sm`) | Table rows, compact toolbars |
| Micro | 20px (`--h-xs`) | Inline badges, status dots |

Apply dense tier: wrap container in `.dense` scope or use `--h-sm` tokens directly.

---

## Button Sizes

| Size | Height | Padding | Font | Use |
|------|--------|---------|------|-----|
| XL | 52px | 0 32px | 16px/600 | Primary actions |
| LG | 44px | 0 24px | 14px/600 | Secondary actions |
| MD | 36px | 0 16px | 13px/600 | Toolbar buttons |
| SM | 24px | 0 8px | 12px/600 | Inline actions |
| Icon | 36×36px | 0 | 14px | Icon-only |
| Icon-LG | 44×44px | 0 | 16px | Large icon-only |

---

## Component Library

### Status Indicators
```html
<!-- Status Pill -->
<div class="status-pill active">
  <span class="status-dot active"></span> Active
</div>

<!-- Status Dot -->
<span class="status-dot active"></span>
<span class="status-dot warning"></span>
<span class="status-dot error"></span>
<span class="status-dot idle"></span>
<span class="status-dot ai"></span>
```

### Alerts (5 severity levels)
```html
<div class="alert info"><div class="alert-icon">ℹ</div><div class="alert-body"><div class="alert-title">Title</div><div class="alert-msg">Message</div></div></div>
<div class="alert success">...</div>
<div class="alert warning">...</div>
<div class="alert error">...</div>
<div class="alert ai">...</div>
```

### Action Grid
```html
<div class="action-grid action-grid-4">
  <div class="action-card" data-color="blue">
    <div class="action-card-icon">⚡</div>
    <div class="action-card-label">Generate</div>
    <div class="action-card-shortcut"><span class="kbd">Ctrl+G</span></div>
  </div>
</div>
```

### Command Palette
```html
<div class="cmd-palette">
  <div class="cmd-input-wrap">
    <span class="cmd-input-icon">Ctrl</span>
    <input class="cmd-input" placeholder="Type a command...">
  </div>
  <div class="cmd-results">
    <div class="cmd-item">
      <div class="cmd-item-icon" style="background: var(--code-action-dim); color: var(--code-action);">⚡</div>
      <div class="cmd-item-text">
        <div class="cmd-item-name">Generate Toolpath</div>
        <div class="cmd-item-desc">Create cutting path</div>
      </div>
      <div class="cmd-item-shortcut"><span class="kbd">Ctrl+G</span></div>
    </div>
  </div>
</div>
```

### Number Hover Conversion
```html
<span class="num" data-mm="1200" data-unit="mm/min">1,200 mm/min<span class="num-conv">47.24 in/min</span></span>
```
Hover shows converted value. Unit toggle swaps all `.num` elements.

### Unit Toggle
```javascript
toggleUnit(); // Ctrl+U — swaps mm ↔ in project-wide
```

### Loading States
```html
<div class="spinner"></div>
<div class="loading-bar"><div class="loading-bar-fill"></div></div>
<div class="skeleton skeleton-line"></div>
<div class="fade-in">Content</div>
<div class="fade-in fade-in-delay-1">...</div>
```

### Form Controls
Text inputs, select, and slider use native elements with token styling — no JS required.
```html
<input class="input" type="text" placeholder="Untitled Project">
<div class="input-with-unit"><input class="input" type="text" value="1200"><span class="input-unit">mm/min</span></div>
<select class="select"><option>Haas — Mill</option></select>
<input class="slider" type="range" min="1000" max="24000" step="500" value="8000">
```
Checkbox and radio-group are custom ARIA widgets (not native `<input>`s — `.checkbox`/`.radio-dot` render their checked state via `::after`), wired the same way as the toggle switches in Toggles & Controls: click + Enter/Space flips state, `aria-checked` mirrors the visual state.
```html
<span class="checkbox checked" role="checkbox" aria-checked="true" aria-label="Enable collision detection" tabindex="0"></span>

<div class="radio-group" role="radiogroup" aria-label="Units">
  <div class="radio-option selected"><span class="radio-dot" role="radio" aria-checked="true" tabindex="0"></span> Metric (mm)</div>
  <div class="radio-option"><span class="radio-dot" role="radio" aria-checked="false" tabindex="-1"></span> Imperial (in)</div>
</div>
```
Radio-group implements the [ARIA APG radio pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/): roving `tabindex` (0 on the selected option, -1 on the rest) plus Arrow key navigation that both moves focus and selects.

> **Note:** a second, bare `.radio`/`.radio.checked` primitive also exists in `tokens.css` (a single unlabeled circle, no group semantics). It renders identically to `.radio-dot` and appears to predate `.radio-group` without ever being removed. Neither is deleted here — flagged for a maintainer decision on which to keep.

### Tabs
[ARIA APG tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): `role="tablist"`/`"tab"`/`"tabpanel"`, roving `tabindex`, Arrow/Home/End navigation with automatic activation.
```html
<div class="tabs" role="tablist" aria-label="Feature inspector">
  <div class="tab active" role="tab" id="tab-geo" aria-selected="true" aria-controls="panel-geo" tabindex="0">Geometry</div>
  <div class="tab" role="tab" id="tab-tool" aria-selected="false" aria-controls="panel-tool" tabindex="-1">Toolpaths</div>
</div>
<div class="tab-panel active" role="tabpanel" id="panel-geo" aria-labelledby="tab-geo">...</div>
<div class="tab-panel" role="tabpanel" id="panel-tool" aria-labelledby="tab-tool">...</div>
```

### Stepper, Breadcrumb, Empty State
```html
<div class="stepper">
  <button class="stepper-btn" data-step="-1" aria-label="Decrease depth of cut">−</button>
  <input class="stepper-value" type="text" inputmode="decimal" value="2.5" data-min="0.5" data-max="10" data-step-size="0.5">
  <button class="stepper-btn" data-step="1" aria-label="Increase depth of cut">+</button>
</div>

<nav class="breadcrumb" aria-label="Feature path">
  <button class="breadcrumb-item">Project</button>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item active" aria-current="page">Roughing Pass 1</span>
</nav>

<div class="empty-state">
  <div class="empty-state-icon">⬚</div>
  <div class="empty-state-title">No toolpaths yet</div>
  <div class="empty-state-desc">Generate a toolpath from selected geometry to see it listed here.</div>
</div>
```
Breadcrumb items are plain `<button>`s, not `href="#"` placeholder links — clicking one shouldn't jump the scroll position on a single-page app that has no real per-crumb route.

### Modal & Confirm Dialog
Full accessible dialog contract: `role="dialog"` (or `"alertdialog"` for confirms), `aria-modal`, `aria-labelledby`/`aria-describedby`, Escape closes, backdrop click closes, focus moves into the dialog on open (first focusable element), Tab is trapped and wraps inside the dialog, and focus returns to the triggering button on close.
```html
<button aria-haspopup="dialog" aria-controls="export-modal">Open Modal</button>

<div class="modal-overlay" id="export-modal-overlay">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="export-modal-title" id="export-modal" tabindex="-1">
    <div class="modal-header">
      <div class="modal-title" id="export-modal-title">Export Settings</div>
      <div class="modal-close" role="button" tabindex="0" aria-label="Close dialog" data-modal-close>✕</div>
    </div>
    <div class="modal-body">...</div>
    <div class="modal-footer">
      <button class="btn btn-md btn-ghost" data-modal-close>Cancel</button>
      <button class="btn btn-md btn-primary" data-modal-close>Export</button>
    </div>
  </div>
</div>
```
Confirm dialogs are the same `.modal` markup with `role="alertdialog"` and a `.confirm-icon`/`.confirm-title`/`.confirm-msg` body instead of `.modal-header`/`.modal-body` — see `index.html`'s Components section for the full delete-confirmation example.

### Drag & Drop
Two patterns, both with a non-drag counterpart — dragging is never the only way to do either.

**Import** has two equivalent triggers. Drag a file over the browser window and `.viewport` becomes a drop target: dashed `var(--code-action)` outline, `var(--code-action-dim)` wash, centered icon + "Drop file to import". Or click the Import `.btn` (toolbar, next to Post, and in the command palette) to open a native file picker via a hidden `<input type="file">` — this is the keyboard- and screen-reader-accessible path, since the drag gesture alone has no non-mouse equivalent. Both paths call the same `handleImportedFile()` and show the same confirmation toast (no parsing — this is a static demo, there's no backend).
```html
<button class="btn btn-md btn-ghost" onclick="triggerImport()">
  <svg class="icon icon-sm"><use href="#icon-import"/></svg> Import
</button>
<input type="file" id="importFileInput" style="display:none">

<div class="viewport drag-target">
  <div class="dropzone-overlay">
    <svg class="icon icon-xl"><use href="#icon-import"/></svg>
    <div class="dropzone-overlay-text">Drop file to import</div>
  </div>
</div>
```

**Export** is click-only — a `.btn` with `icon-export`, next to Import in the toolbar and in the command palette. There's no "drag to export" gesture on desktop or web, so export never needed a second trigger the way import did.
```html
<button class="btn btn-md btn-ghost" onclick="exportFile()">
  <svg class="icon icon-sm"><use href="#icon-export"/></svg> Export
</button>
```

**Reordering tree items** — `.tree-sortable` rows (the operations under a `tree-group-header`, e.g. Roughing/Finishing) get a `.tree-drag-grip` (⠿) that starts a mouse drag, showing a `.tree-drop-indicator` between rows as the live insertion point. A reorder is scoped to the operation's own group.
```html
<div class="tree-item tree-indent tree-child tree-sortable" tabindex="0">
  <span class="tree-drag-grip" aria-hidden="true">⠿</span>
  <span class="tree-label">Finishing</span>
  <span class="tree-move-btns">
    <button class="tree-move-btn" data-dir="-1" aria-label="Move Finishing up">▲</button>
    <button class="tree-move-btn" data-dir="1" aria-label="Move Finishing down">▼</button>
  </span>
</div>
```
Dragging is never required: every `.tree-sortable` row is keyboard-focusable and responds to `ArrowUp`/`ArrowDown`, and the `.tree-move-btn` buttons (visible on hover/focus, always in the tab order) do the same on click. Both paths call the same `moveTreeItem()` and announce the result through `#treeReorderStatus` (`.sr-only`, `aria-live="polite"`) — e.g. "Finishing moved to position 1 of 2".

---

## Tooltip Animation Behavior

Tooltips use a **120ms ease-out fade + 4px upward slide** entrance animation.
There is **no exit animation** — tooltips disappear instantly on mouse-leave
for responsive feel.

The animation respects `prefers-reduced-motion: reduce`.

**Timing:**
- Entrance: 120ms, cubic-bezier(0.16, 1, 0.3, 1) ease-out
- Exit: instant (no animation)
- Property changes: 80ms ease-out (transitions on hover states)

---

## Application Layouts

### CAM Software (Operate Surface)
```
┌─────────────────────────────────────────────────────────┐
│ Menu Bar + Quick Actions                                │
├────┬──────────┬──────────────────────┬──────────────────┤
│    │ Feature  │                      │                  │
│ T  │ Tree     │    3D Viewport       │   Inspector      │
│ o  │          │                      │   Panel          │
│ o  │          │                      │                  │
│ l  │          │                      │                  │
│ b  │          │                      │                  │
│ a  │          │                      │                  │
│ r  │          │                      │                  │
├────┴──────────┴──────────────────────┴──────────────────┤
│ Status Bar                                              │
└─────────────────────────────────────────────────────────┘
```

---

## 3D Viewport & Viewer Conventions

Formalizes the 3D viewport spec implied by `--code-view` (lime — "viewport,
camera, display" in the semantic table above): camera controls, selection
states, axis colors, toolpath line legend, and the grid convention. This
repo has zero npm dependencies and ships no renderer — these are the design
tokens and behavior contract; consumer projects (AI CAM 3.0, Web DFM) apply
them to their own WebGL/Three.js viewports.

### Camera Controls

Standard CAD/CAM convention:

| Gesture | Action |
|---------|--------|
| Left-drag | Orbit |
| Middle-drag or `Shift`+Left-drag | Pan |
| Scroll wheel | Zoom |
| Double-click | Fit all |

### Selection States

| State | Treatment |
|-------|-----------|
| Hover | Thin outline — `--code-action` ~60% opacity, 1.5px |
| Selected | Solid outline — `--code-action` 2px + `--code-action-dim` fill tint |
| Multi-select | Same per-object treatment, plus a dashed bounding-box indicator around the group |
| Flagged geometry (e.g. tight-tolerance hole) | Existing dashed warning ring — unchanged; see the Ø5mm hole in `demo.html` |

### Axis Colors

Standard red/green/blue CAD/CAM convention, aliased to existing semantic tokens — no new hex:

| Axis | Token | Alias |
|------|-------|-------|
| X | `--code-axis-x` | `--code-danger` (red) |
| Y | `--code-axis-y` | `--code-success` (green) |
| Z | `--code-axis-z` | `--code-action` (blue) |

### Toolpath Line Legend

| Move type | Style | Token |
|-----------|-------|-------|
| Rapid | Dashed, thin | `--ink-muted` |
| Feed / cut | Solid | `--code-tool` |
| Plunge | Dotted | `--code-warning` |
| Live tool position | Pulsing dot | `--code-action` — the animated SVG `<circle>` already in `demo.html` |

`tokens.css` defines `.tp-rapid` / `.tp-feed` / `.tp-plunge` / `.tp-live` utility classes for this legend. The live-position dot keeps its existing SVG `<animate>` pulse — `.tp-live` only names the fill color, it does not introduce a second animation mechanism.

### Grid / Floor

`.grid-bg` (`demo.html`) is the floor convention: a 32×32px line grid drawn with `--border-subtle` at 0.5 opacity (0.3 in light mode, via the existing `html.light .grid-bg` rule). Consumer 3D viewports should render their ground plane at this same visual weight.

### Clay Shading Mode

A 5th viewport shading mode (`Shaded → Wire → Hidden → X-Ray → Clay`), inspired by Blender's "Random Object Color" solid-shading mode — every separate body/solid/operation gets its own flat pastel color so you can tell parts apart at a glance.

- **Color assignment** — each object/body draws its color from the curated `--clay-1` … `--clay-10` palette in `tokens.css`, chosen by a **stable hash of the object/body ID**. It must not be re-randomized on every render or session — the same part keeps the same color so it stays usable for telling parts apart, not just decorative.
- **Shading** — the base `--clay-N` tone on lit surfaces, the paired `--clay-N-shade` variant (~15–20% darker, same hue) on shadow-facing surfaces. Soft two-tone, not a flat-flat fill.
- **Contour** — a thin (~1–1.5px) `--ink-primary` line traces each shape's silhouette.
- **Background** — `--clay-bg`, a muted sage-olive neutral, replaces the standard canvas behind the viewport while Clay mode is active.
- **Scope** — Clay mode is for distinguishing separate bodies/solids/operations while modeling. It does **not** replace the safe/warning/error semantic coloring used elsewhere for status — those meanings stay on `--code-success` / `--code-warning` / `--code-danger` regardless of shading mode.
- **Quality note** — this only reads as clean with the shade variant *and* the contour line both present. A flat single-tone fill by itself looks cheap, not clean — don't ship one without the other.
- **Demo** — `demo.html`'s mocked SVG viewport shapes re-color under a `.viewport.clay-mode` class toggle as a flat-SVG proof of concept, wired through the existing `cycleMode()` function. This repo has no real 3D renderer; a consumer project implementing actual 3D would apply this same palette and stable-hash-per-mesh rule to real mesh materials.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command Palette |
| `Ctrl+G` | Generate Toolpath |
| `Ctrl+⇧R` | Run Simulation |
| `Ctrl+⇧P` | Post Process |
| `Ctrl+U` | Toggle Units (mm/in) |
| `Ctrl+L` | Toggle Dark/Light |
| `Escape` | Close overlays |
| `?` or `Alt+H` | Help overlay |

---

## Cross-Project Color Mapping

| Color | AI CAM 3.0 | Deepnest | Web DFM | Evolution Engine | Foundry Manager |
|-------|-----------|----------|---------|-----------------|-----------------|
| Blue | Generate toolpath | Start nesting | Analyze part | Run cycle | Dispatch task |
| Orange | Endmill, drill | Part geometry | CAD features | Mutation ops | Executor rung |
| Teal | Stock material | Sheet size | Material type | Model arch | Project registry |
| Lime | 3D viewport | Nest preview | Three.js viewer | Training viz | Live monitor |
| Magenta | AI optimization | — | AI DFM rules | Neural net | Agent fleet |
| Pink | Cutting data | Density % | Measurements | val_loss | Task metrics |
| Gold | Machine params | Nesting params | Analysis settings | Hyperparams | Model config |

---

## Typography

### Font Stack
```css
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
font-feature-settings: 'cv01', 'cv09', 'ss03';

/* Monospace for data */
font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

### Hierarchy
| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| Display | 44px | 800 | 1.05 | -0.04em |
| H1 | 32px | 700 | 1.1 | -0.03em |
| H2 | 24px | 700 | 1.2 | -0.02em |
| H3 | 20px | 600 | 1.3 | -0.01em |
| Body | 14px | 400 | 1.5 | 0.01em |
| Small | 12px | 500 | 1.5 | normal |
| Caption | 11px | 600 | 1.4 | 0.06em |

---

## Spacing (4px Grid)

| Token | Value | Use |
|-------|-------|-----|
| `--sp-1` | 4px | Micro gap |
| `--sp-2` | 8px | Tight gap |
| `--sp-3` | 12px | Small gap |
| `--sp-4` | 16px | Default gap |
| `--sp-5` | 24px | Section gap |
| `--sp-6` | 32px | Large gap |
| `--sp-8` | 48px | Section break |
| `--sp-16` | 96px | Major break |

---

## File Structure

```
Design-System/
├── tokens.css              # Single source of truth (tokens + components + light mode)
├── icons.css               # SVG icon sizing (currentColor)
├── icons.svg               # SVG sprite definitions
├── demo.html               # Interactive CAM app demo
├── index.html              # Design system reference page
├── sw.js                   # Service worker (offline caching)
├── package.json            # v1.3.1 distribution metadata
├── README.md               # This file
├── AUDIT.md                # v1.x audit findings
├── AUDIT-v2.md             # v1.2 re-audit (pre-fix)
├── AUDIT-v3.md             # v1.2 re-audit (post-fix)
├── AUDIT-v4.md             # v1.2 re-audit (accessibility + contrast backlog)
├── AUDIT-v5.md             # v1.3 audit — 3D viewport, clay mode, drag & drop, cleanup pass
├── AUDIT-v6.md             # v1.3.1 audit (latest, authoritative) — component library showcases, focus-managed modal
├── WEB-DFM-GUIDE.md        # Guide for applying this design system to Web DFM
├── ADAPTIVE-FRONTEND-PATTERNS.md # Different product — multi-vertical shopping-search UI (CNC machines/endmills/used cars), not this design system's scope
├── scripts/
│   ├── validate.js         # Token validator (CI gate)
│   └── hex-baseline.json   # Hardcoded-hex ratchet baseline (per-file limits validate.js enforces)
└── .github/workflows/
    └── ci.yml              # CI pipeline (token validation, HTML structure, JS syntax, a11y)
```

---

## Implementation Checklist

When applying this design system to a new project:

- [ ] Import Inter + JetBrains Mono fonts
- [ ] `<link rel="stylesheet" href="tokens.css">`
- [ ] Apply dark-mode canvas colors (inherited from tokens)
- [ ] Use semantic color categories consistently
- [ ] Make primary action buttons XL (52px)
- [ ] Show keyboard shortcuts on all buttons
- [ ] Implement Ctrl+K command palette
- [ ] Use monospace for all numeric data
- [ ] Apply status dots + pills for state
- [ ] Use the 6-level surface luminance scale
- [ ] Never use pure black or pure white
- [ ] Keep all features visible on screen

---

## Current Status

**v1.3** — The token layer, component library, 3D viewport spec, and drag-and-drop patterns are complete and validated:
- 13×3 semantic color matrix (base/dim/mid for 13 categories), plus a separate `--clay-1..10` pastel matrix for Clay shading mode (kept out of the 13-category matrix by design)
- `:focus-visible` rings, `prefers-reduced-motion`, light mode support — including contrast-verified (≥4.5:1 AA) darkened text variants for 11 of 13 semantic colors
- Dense control-height tier (`--h-xs` through `--h-2xl`)
- Full component library: buttons, inputs, selects, sliders, checkbox/radio, toggle, alerts, tabs, modal, tooltip, loading states, stepper, breadcrumb, empty state, confirm dialog
- **3D Viewport & Viewer Conventions**: camera controls, hover/selected/multi-select states, axis-color aliases, toolpath rendering legend, grid/floor treatment — see the dedicated section above
- **Clay shading mode**: Blender-inspired random-object-color viewport shading, stable-hash-assigned, spec'd and mocked in the flat-SVG demo viewport (this repo has no real 3D renderer — a consumer project would apply the same palette/hash rule to actual mesh materials)
- **Drag & Drop**: file import via drag-anywhere-on-viewport *or* a keyboard/screen-reader-accessible Import button (toolbar + command palette) that opens a native file picker; click-to-export; keyboard/ARIA-accessible feature-tree operation reordering (drag is never the only way to do any of these)
- Token validator (`scripts/validate.js`) passes clean (0 errors, 0 warnings)
- CI pipeline validates tokens, HTML structure, JS syntax, and a11y
- Single-source-of-truth icon sprite: both `demo.html` and `index.html` load `icons.svg` at runtime instead of hand-duplicating `<symbol>` definitions inline

**What works:**
- `demo.html`: Full interactive CAM demo with Ctrl+K palette, arrow-nav, tooltips, coordinate readout, unit toggle, ARIA switch sync, localStorage persistence, platform-aware keyboard labels, resizable panels, browser tabs, rich tooltips, onboarding tour, Clay shading toggle, import (drag or Import button) / export, sortable operation tree
- `index.html`: Design system reference with working Ctrl+K palette, smooth-scroll nav with IntersectionObserver, toggle controls, working copy-snippet buttons, keyboard-operable action cards, platform-aware keyboard glyphs
- Both pages parse and run with zero console errors

**Known remaining work (see AUDIT-v6.md for full detail):**
- SearchForge-UI still hard-copies tokens.css rather than importing it (drift risk documented in AUDIT-v4 §6 and AUDIT-v5; fixing it means touching a second repo, deliberately deferred)
- No consumer project (AI CAM 3.0, Web DFM, Deepnest, Evolution Engine, reesecnc.com) has actually adopted these patterns yet — this repo is spec + a self-contained demo, not a shipped dependency
- `.radio` (bare primitive) duplicates `.radio-dot`/`.radio-group` (labeled-group pattern) — flagged in `tokens.css` and AUDIT-v6 §4, not deleted, pending a maintainer decision on which to keep

---

*Reese Design System v1.3.1 — Built for: AI CAM 3.0 · Deepnest · Web DFM · Evolution Engine · reesecnc.com*
