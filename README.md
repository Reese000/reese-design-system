# Reese Design System v1.2.0

## Utilitarian Interface Template

> Every feature visible. Zero hidden menus. Maximized action space.
> Color-coded semantics. Keyboard-first. Built for complex software
> that users need to master fast.

---

## Quick Start

### CSS Variables (copy into any project)

```css
:root {
  /* Canvas */
/* tokens.css is the single source of truth for all tokens. */
/* Copy the :root block from there into your project. */
/* See: https://github.com/Reese000/reese-design-system/tokens.css}
}
```

---

## Design Principles

### 1. Maximized Action Space
- **XL buttons (52px)** for primary actions (Generate, Execute)
- **LG buttons (44px)** for secondary actions (Load, Configure)
- **MD buttons (36px)** for toolbar items
- **SM buttons (28px)** for inline actions
- `--h-sm: 24px` as the dense minimum; `--h-md: 28px` as the standard minimum for primary UI
- Every button shows its keyboard shortcut

### 2. Zero Hidden Menus
- All features visible on screen simultaneously
- Toolbar buttons, action grids, inspector panels — one click away
- Progressive complexity through **color**, not through nesting
- No hamburger menus on desktop

### 3. Semantic Color Coding
#### 13 distinct colors map every type of action and data.

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
| `Ctrl+K` opens command palette in every application
- Shortcuts displayed inline on every button
- Focus rings on all interactive elements
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

---

### Density Tiers

| Tier | Control Height | Use Case |
|------|---------------|----------|
| Hero | 52px (`--h-2xl`) | Featured CTAs, primary actions |
| Primary | 44px (`--h-xl`) | Main action buttons |
| Comfortable | 36px (`--h-lg`) | Toolbar buttons, inputs |
| Standard | 28px (`--h-md`) | Menus, tree items |
| Dense | 24px (`--h-sm`) | Table rows, compact toolbars |
| Micro | 20px (`--h-xs`) | Inline badges, status dots |

Apply dense tier: wrap container in `.dense` scope or use `--h-sm` tokens directly.

### Button Sizes

| Size | Height | Padding | Font | Use |
|------|--------|---------|------|-----|
| XL | 52px | 0 32px | 16px/600 | Primary actions |
| LG | 44px | 0 24px | 14px/600 | Secondary actions |
| MD | 36px | 0 16px | 13px/600 | Toolbar buttons |
| SM | 28px | 0 12px | 12px/600 | Inline actions |
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

### Metric Cards
```html
<div class="metric-card" data-color="blue">
  <div class="metric-label">Feed Rate</div>
  <div class="metric-value">1200</div>
  <div class="metric-change up">mm/min</div>
</div>
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

### Dashboard (Monitor Surface)
```
┌─────────────────────────────────────────────────────────┐
│ Title Bar + Status Pills                                │
├──────┬──────┬──────┬──────┬──────┬──────────────────────┤
│ M1   │ M2   │ M3   │ M4   │ M5   │ M6                 │
│metric│metric│metric│metric│metric│metric               │
├──────┴──────┴──────┴──────┴──────┴──────────────────────┤
│                                                         │
│ Data Table / Visualization                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Cross-Project Color Mapping

| Color | AI CAM 3.0 | Deepnest | Web DFM | Evolution Engine |
|-------|-----------|----------|---------|-----------------|
| Blue | Generate toolpath | Start nesting | Analyze part | Run cycle |
| Orange | Endmill, drill | Part geometry | CAD features | Mutation ops |
| Teal | Stock material | Sheet size | Material type | Model arch |
| Lime | 3D viewport | Nest preview | Three.js viewer | Training viz |
| Magenta | AI optimization | — | AI DFM rules | Neural net |
| Pink | Cutting data | Density % | Measurements | val_loss |
| Gold | Machine params | Nesting params | Analysis settings | Hyperparams |

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
| --sp-1 | 4px | Micro gap |
| --sp-2 | 8px | Tight gap |
| --sp-3 | 12px | Small gap |
| --sp-4 | 16px | Default gap |
| --sp-6 | 24px | Section gap |
| --sp-8 | 32px | Large gap |
| --sp-12 | 48px | Section break |
| --sp-16 | 64px | Major break |

---

## Implementation Checklist

When applying this design system to a new project:

- [ ] Import Inter + JetBrains Mono fonts
- [ ] Set up CSS custom properties (copy from Quick Start)
- [ ] Apply dark-mode canvas colors
- [ ] Use semantic color categories consistently
- [ ] Make primary action buttons XL (52px)
- [ ] Show keyboard shortcuts on all buttons
- [ ] Implement Ctrl+K command palette
- [ ] Use monospace for all numeric data
- [ ] Apply status dots + pills for state
- [ ] Use the 6-level surface luminance scale
- [ ] Never use pure black or pure white
- [ ] Keep all features visible on screen

## New Features

### Dark/Light Mode
```html
<button onclick="document.documentElement.classList.toggle('light')">Toggle</button>
```
Full light theme with 40+ CSS overrides for every component.

### Tabs
```html
<div class="tabs">
  <div class="tab active" onclick="switchTab(this,'panel1')">Tab 1</div>
  <div class="tab" onclick="switchTab(this,'panel2')">Tab 2</div>
</div>
<div class="tab-panel active" id="panel1">Content 1</div>
<div class="tab-panel" id="panel2">Content 2</div>
```

### Alerts (5 severity levels)
```html
<div class="alert info"><div class="alert-icon">ℹ</div><div class="alert-body"><div class="alert-title">Title</div><div class="alert-msg">Message</div></div></div>
<div class="alert success">...</div>
<div class="alert warning">...</div>
<div class="alert error">...</div>
<div class="alert ai">...</div>
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
Updates all `.num` elements, viewport stats, and inspector values.

### Loading States
```html
<div class="spinner"></div>                    <!-- Spinning circle -->
<div class="loading-bar"><div class="loading-bar-fill"></div></div>  <!-- Progress -->
<div class="skeleton skeleton-line"></div>     <!-- Pulsing placeholder -->
<div class="fade-in">Content</div>             <!-- Fade-in with slide -->
<div class="fade-in fade-in-delay-1">...</div> <!-- Staggered -->
```

### Responsive / Mobile
- **≤900px**: Panels collapse, slide-in toggle buttons appear
- **≤600px**: Compact titlebar, smaller toolbar, hidden keyboard shortcuts
- Panels open as overlays with shadow, tap outside to close

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command Palette |
| `Ctrl+G` | Generate Toolpath |
| `Ctrl+⇧R` | Run Simulation |
| `Ctrl+P` | Post Process |
| `Ctrl+U` | Toggle Units (mm/in) |
| `Ctrl+L` | Toggle Dark/Light |
| `Escape` | Close overlays |

---

## File Structure

```
Design-System/
├── tokens.css          # Single source of truth (tokens + components)
├── demo.html           # Interactive CAM app demo
├── index.html          # Design system reference page
├── README.md           # This file
└── AUDIT.md            # Audit findings and fixes
```

---

*Reese Design System v1.2.0 — Built for: AI CAM 3.0 • Deepnest • Web DFM • Evolution Engine • reesecnc.com*
