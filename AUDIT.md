# Design System Audit — Reese Design System v1.x

**Date:** 2026-07-06
**Scope:** `index.html`, `demo.html`, `tokens.css`, `README.md`
**Status:** ✅ Complete — static review of all four files + live-browser verification of key findings (Chromium preview, dark & light modes, both pages)

Severity legend: 🔴 Critical (broken/blocking) · 🟠 High (visible defect or UX blocker) · 🟡 Medium (inconsistency, papercut) · 🔵 Low (polish, future-proofing)

---

## 1. Token Layer

### 1.1 🔴 Invalid hex value in `tokens.css` and `index.html`
`--code-data-dim: #ff6baaa22;` is a 9-digit hex (extra `a`). Invalid — the property is dropped by the CSS parser, so every component using `--code-data-dim` (pink/data category dim backgrounds) silently renders with no background.
- `tokens.css:54`
- `index.html:57`
- **Fix:** `#ff6baa22`.

### 1.2 🟠 Three sources of truth for tokens — all disagree
Tokens are defined independently in `README.md`, `tokens.css`, and `index.html`, and they have drifted:

| Token | README.md | tokens.css | index.html |
|---|---|---|---|
| `--canvas-void` | `#08090b` | `#0e1013` | `#0e1013` |
| `--canvas-base` | `#0d0e11` | `#14161b` | `#14161b` |
| (all 6 canvas steps) | darker scale | lighter scale | lighter scale |
| `--ink-primary` | `#eef0f4` | `#e8eaef` | `#e8eaef` |
| (all 5 ink steps) | differ | — | matches tokens.css |
| `--border-subtle` | `0.04` alpha | `0.06` alpha | `0.06` alpha |
| `--border-default` | `0.07` alpha | `0.09` alpha | `0.09` alpha |
| `--r-sm` | `4px` | `3px` | `4px` |
| `--r-md` | `6px` | `4px` | `6px` |
| `--r-lg` | `8px` | `6px` | `8px` |
| `--r-xl` | `12px` | *(missing)* | `12px` |
| `--r-xs` | *(missing)* | `2px` | *(missing)* |

A project importing `tokens.css` gets different radii and colors than the reference implementation (`index.html`) demonstrates.
- **Fix:** make `tokens.css` the single source of truth; have `index.html` and `demo.html` `<link>` it instead of inlining a divergent copy; generate the README table from it (or at minimum reconcile once and note tokens.css as canonical).

### 1.3 🟡 Incomplete `-dim`/`-mid` variant coverage
`index.html`/`tokens.css` define `-mid` variants only for action, danger, success, warning, info, accent, tool. Missing: `--code-material-mid`, `--code-data-mid`, `--code-view-mid`, `--code-config-mid`, `--code-process-mid`, `--code-ai-mid`. But `index.html:501` uses `var(--code-material-mid)` for cyan action cards — an undefined variable, so the border falls back to the default subtle border.
- **Fix:** define the full 12×3 matrix (base/dim/mid) for every semantic category, or generate them with `color-mix(in srgb, var(--code-x) 13%, transparent)`.

### 1.4 🟡 README color table says 12 categories; the system has 13
`--code-process` (indigo `#818cf8`) exists in tokens.css and index.html but is absent from the README table and the "12 distinct colors" claim.

### 1.5 🔵 README "File Structure" section is stale
Lists `tokens.css` under "(future files)" though it exists; `components.css` and `templates/` do not exist; `demo.html` is not mentioned at all.

---

## 2. Components (index.html)

### 2.1 🟠 Documentation UI displays wrong hex values
The "Surface Luminance Scale" swatches (`index.html:1358-1387`) label the swatches `#08090b`, `#0d0e11`, `#13141a`, `#1a1b22`, `#22232c`, `#2a2c36` — the *old* README palette — while the swatches actually render the current variables (`#0e1013`, `#14161b`, …). Anyone copying hex values from the rendered spec page gets colors that don't exist in the system.

### 2.2 🟡 Color grid shows 12 categories; 13 exist
The badge says "12 categories" (`index.html:1263`) and the grid has 12 cards, but `--code-process` (indigo `#818cf8`) is defined and never documented. Either remove the token or add the card and update all "12-color" copy (hero metric card, principle #3, README).

### 2.3 🟡 Stray text typo breaks a style attribute
`index.html:1249`: `style="...margin-bottom: var(--sp-1);6"` — a stray `6` inside the style attribute of principle "6. Dark-Mode Native". The invalid declaration is silently dropped; the heading loses no styling today but the markup is malformed.

### 2.4 🟡 Incomplete interactive states on buttons
- `.btn-warning` has no `:hover` state (all other filled variants do).
- No `:disabled` style for any button variant.
- No `:focus-visible` ring on `.btn` (see §3.1).
- No loading/busy state — README v1.1 documents spinners, but there is no `.btn.loading` pattern.

### 2.5 🟡 Component gaps for the target applications
For a system meant to skin CAM/DFM/nesting/ML tools, the following primitives are absent from the spec page: text inputs, number steppers, selects/dropdowns, sliders (feeds/speeds are continuous values), checkboxes/radios, modal dialogs, toasts/notifications, tooltips (only a `title` attribute is used; `.hint` is a static label, not a tooltip), breadcrumbs, and empty states. The command palette is rendered as a static specimen only.

### 2.6 🟡 v1.1 features are documented but absent from index.html
README v1.1 documents tabs, alerts, light mode, unit toggle, `.num` hover conversion, spinner/skeleton/loading-bar, and responsive panel collapse. None of these exist in `index.html` (no light-theme CSS, no media queries besides `@media print`, no tabs/alert/spinner classes, no Ctrl+K handler). They appear to live only in `demo.html` — so the "design system reference" page and the "demo" have diverged into two different systems (§5).

### 2.7 🔵 Hard-coded values bypass the token system inside the spec itself
Many specimen blocks use raw values instead of tokens, e.g. `rgba(244,114,182,0.2)` borders (`index.html:1948`), inline `height: 26px`/`22px`/`24px` buttons (below the documented 28px SM minimum — the system violates its own "nothing smaller than 28px" rule in the menubar and table rows), font sizes of 9px/10px (below the documented 11px minimum `--text-xs`), and the viewport background `#0b0c10` which is not a canvas token.

### 2.8 🔵 Emoji as icon system
Icons are emoji (⚡ 📂 💾 🔧 🤖 ⚙). Rendering varies per OS (Windows Segoe UI Emoji vs. macOS), colors can't be themed by tokens, and screen readers read them aloud ("high voltage sign"). Recommend an SVG icon set (e.g. inline sprites or Lucide) with `aria-hidden` and consistent sizing.

---

## 3. Accessibility

### 3.1 🔴 No focus styles in index.html despite "keyboard-first" claim
README/principles promise "Focus rings on all interactive elements", and `tokens.css` defines `:focus-visible`, but `index.html` inlines its own CSS and includes **no focus styles whatsoever**. Tabbing through the reference page shows only default (or suppressed) outlines. Since projects are told to copy from index.html, the flagship claim of the system is not implemented in its own reference.

### 3.2 🔴 Core controls are not keyboard-operable
- `.toggle` is a `<div>` — no `role="switch"`, no `tabindex`, no `aria-checked`, click-only (`index.html:1691-1703`, JS at `2337-2340`). Keyboard users cannot reach or flip any toggle.
- `.action-card` is a `<div>` with `cursor: pointer` — not focusable, not activatable with Enter/Space, no `role="button"` (`index.html:1506-1545`).
- `.tree-item`, `.cam-menu-item`, `.cmd-item` — same pattern: clickable `<div>`/`<span>` with no keyboard semantics.
- **Fix:** use `<button>`/`<input type="checkbox" role="switch">` under the hood, or add `tabindex="0"` + key handlers + ARIA roles. This directly contradicts design principle #4.

### 3.3 🟠 Contrast failures at small sizes
- `--ink-muted` (`#5a5f72`) on `--canvas-base` (`#14161b`) ≈ 3.4:1, used for 9–11px text (kbd hints, viewport stats, status bar) — fails WCAG AA (needs 4.5:1 at that size).
- `--ink-ghost` (`#42465a`) ≈ 2.1:1, used for footer text and `.vs-conv` conversion hints — fails even AA Large.
- Semantic color on `-dim` background pills (e.g. `--code-info` `#7ce0ff` on `#7ce0ff22`) are fine, but `--code-view` lime and `--code-warning` amber as *text on filled buttons* use dark ink — good — while `#fff` on `--code-action` `#6c8aff` ≈ 3.0:1 — borderline for 13–14px 600-weight text.
- **Fix:** bump muted/ghost one step for small sizes, or reserve them for ≥12px decorative text; verify all pairs with a contrast checker and record ratios in the spec.

### 3.4 🟠 Semantic/structural HTML gaps
- No `<h1>` on the page — the hero title is a styled `<div>`; sections use `<h2>` only.
- Icon-only buttons rely on `title` alone; need `aria-label`.
- Status is conveyed by color+dot alone in tables/pills; add text or `aria-label` for color-blind users (the dot glyphs are identical shapes).
- `.status-pill.info` is paired with an "Idle" dot/label (`index.html:1571`) — semantic mismatch.
- No skip-to-content link; fixed nav traps Tab users through 9 links on every page.
- No `prefers-reduced-motion` media query — pulse/spin/fade animations cannot be disabled.

### 3.5 🟡 Platform-wrong shortcut glyphs
Every `.kbd` shows Mac glyphs (⌘G, ⌘⇧A, ⌘⌫) while the README and demo.html JS bind **Ctrl**+key, and the primary platform is Windows 11. Shortcuts as rendered are untrue on the user's own machine. Recommend a small JS helper that renders `Ctrl`/`⌘` based on `navigator.platform`, and standardizing README ↔ UI.

---

## 4. Interaction & JS Behavior

> Items marked **[verified in browser]** were reproduced in a live Chromium preview on 2026-07-06.

### 4.0 demo.html — verified functional bugs

#### 4.0.1 🔴 The entire rich-tooltip system renders off-screen **[verified in browser]**
Tooltips are appended to the global `#tooltipContainer` (`demo.html:756`), but the `.tip-content` CSS (`demo.html:277-280`) positions them with `left: calc(100% + 8px)` etc., written for a parent `.tip { position: relative }` element. Since the container is a static, full-width, zero-height div, "100%" is the page width: the tooltip's measured position was `left: 605px` in a 597px viewport — fully off-screen. The system's flagship learnability feature (rich tooltips with descriptions, shortcuts, use cases, video thumbnails — ~70 lines of content in `TIPS`) is **completely invisible to users**. The buttons also carry `title=""` (empty), so there's no fallback either.
- **Fix:** append the tooltip inside the hovered `.tip` element, or position it from `getBoundingClientRect()` with `position: fixed`.

#### 4.0.2 🔴 Typing the letter "l" anywhere toggles the theme **[verified in browser]**
`demo.html:947`: `if ((e.ctrlKey || e.key === 'l') && e.key === 'l')` — the condition is true for a **plain** `l` keypress (no modifier), and it calls `preventDefault()`. Consequences: pressing `l` while using the app flips dark/light mode, and it is impossible to type "l" into the command palette search (try searching "toolpath"… you can, but "line"/"simulate"→"simul" works while any word needs `l` breaks). Should be `(e.ctrlKey || e.metaKey) && e.key === 'l'`.

#### 4.0.3 🟠 Coordinate readout prints malformed numbers **[verified in browser]**
`demo.html:793-796`: `x` is already `toFixed(1)` and then `'.000'` is concatenated — the X/Y readout displays `45.3.000` instead of `45.300`. Verified live.

#### 4.0.4 🟠 Advertised shortcuts are not bound
Buttons and the README table advertise `Ctrl+R` (Simulate), `Ctrl+P` (Post), `Ctrl+⇧A` (AI Optimize), `Ctrl+,` (Settings) — none have handlers. In a browser, `Ctrl+R` **reloads the page** and `Ctrl+P` opens the print dialog. `Ctrl+G` is bound but shows the AI toast rather than anything "Generate"-like. For web-deployed apps (Web DFM), the chosen set collides with browser defaults (`Ctrl+K`, `Ctrl+L`, `Ctrl+U`, `Ctrl+R`, `Ctrl+P`) — worth choosing an alternate scheme or reserving these for the desktop/Electron context.

#### 4.0.5 🟠 Command palette has no keyboard navigation
`Ctrl+K` opens it and focuses the input, but there are no ArrowUp/ArrowDown/Enter handlers — the `.sel` highlight is static HTML and executing a command requires the mouse. For a "keyboard-first" system, the palette must support arrow selection + Enter, and ideally fuzzy matching and description-text matching (current filter matches name only).

#### 4.0.6 🟡 "Apply" for the AI suggestion breaks the unit-conversion feature
`applyAI()` (`demo.html:816-820`) replaces the feed-rate field's `textContent`, destroying the `.num` child element. After applying, the feed rate no longer participates in `Ctrl+U` unit toggling or hover conversion, and it shows stale "1,400 mm/min" forever in inch mode. It also selects the field by index (`querySelectorAll('.insp-field-v')[1]`) — brittle against any markup change.

#### 4.0.7 🟡 Smaller correctness papercuts
- Duplicate `keydown` listeners registered in two places (`demo.html:768`, `demo.html:945`).
- `e.key === 'k'` misses CapsLock/Shift variants (`K`).
- `data-in-per-mm` attributes are written into markup but never read by JS; `--unit` CSS var is set but unused.
- Unit conversion formats values twice (`toFixed` then `formatNum`) producing inconsistent decimal precision.
- Rapid mouse movement across `.tip` buttons can orphan a tooltip (mouseenter for the next element can fire before the previous `activeTip` is removed; single shared variable).
- README claims mobile overlay panels close on "tap outside" — no such handler exists; only the toggle buttons close them.

### 4.1 (index.html) 🟡 Nav clicks don't update the URL hash

### 4.1 🟡 Nav clicks don't update the URL hash
The smooth-scroll handler calls `preventDefault()` and never writes `location.hash` (`index.html:2313-2321`), so sections can't be deep-linked/bookmarked after clicking. Use `history.pushState`/`replaceState` after scroll.

### 4.2 🟡 The command palette is a picture, not a feature
`index.html` promises "⌘K Command Palette" in the CAM status bar and principles, but no key handler exists on the spec page. The palette is a static specimen with a `readonly` input. Since this page is itself a "complex tool users must master," it should dogfood the pattern (working Ctrl+K palette that jumps to sections/components).

### 4.3 🔵 Toggle state changes have no announced feedback
The click handler flips a class only; combined with §3.2 there is no `aria-checked` change, so assistive tech hears nothing.

---

## 5. demo.html ↔ index.html Consistency

The demo is not built from the system it demonstrates — it re-implements everything inline with different values.

### 5.1 🟠 The demo violates the system's own core sizing rule
README: "Nothing smaller than 28px — ever." demo.html redefines the button scale as `btn-lg: 36px`, `btn-md: 28px`, `btn-sm: 22px` (`demo.html:245-247`) — there is no XL at all and SM is 22px. Inline table/menubar buttons in index.html also go down to 22-26px. Either the rule is real (then the components must obey it) or the scale needs an honest "compact/dense" tier documented for desktop-tool contexts (probably the right answer for CAM UIs — 52px primary buttons are tablet-sized).

### 5.2 🟡 Divergent component APIs for the same components
Same concepts, different class names and metrics between the two files: `.status-pill.active` vs `.pill.green`; `.status-dot.active` vs `.status-dot.on`; `.inspector-field-value` vs `.insp-field-v`; radii (`--r-lg` 8px vs 6px); `.kbd` (20px/11px vs 16px/9px); demo drops all `-dim`/`-mid` tokens and hardcodes `rgba(...)` equivalents ~40 times. A project copying from the demo and a project copying from the spec will produce visibly different UIs.

### 5.3 🟠 Light theme is demo-only and fails contrast **[verified in browser]**
Screenshot-verified in light mode: semantic text colors are not adjusted per theme, so `--code-info` cyan alert text and `--code-view` lime tree labels are unreadable on `#f0f1f3` (≈1.5-2:1). The `.tabs` strip keeps its dark-mode background inside the light inspector. The light theme is also 60+ hand-written per-component overrides in demo.html only — index.html (the reference) has no light mode at all. A theme belongs in the token layer: define `html.light { --canvas-*: …; --ink-*: …; --code-*: darker variants }` once, and components inherit it for free.

### 5.4 🟡 State is not persisted
Theme, units, panel widths, and active tool all reset on reload. For daily-driver tooling these belong in `localStorage` (and units/theme arguably in a project file).

---

## 6. UX & Usability Improvement Recommendations

Ordered roughly by leverage: fixes that make the promised experience real first, then additions.

### 6.1 Make the "keyboard-first" promise true (highest leverage)
The system's identity is keyboard-first, but today: no focus rings (index), div controls unreachable by Tab, palette needs a mouse, most shortcuts unbound, and Mac glyphs shown to Windows users. Concretely:
1. Add `:focus-visible` rings to every interactive element in both files (already in tokens.css — adopt it).
2. Convert `.toggle`, `.action-card`, `.tree-item`, `.tab`, `.cmd-item`, `.win-btn`, menu items to `<button>` (or add `role` + `tabindex` + key handlers).
3. Command palette: ArrowUp/Down + Enter + fuzzy match; make it the universal entry point it claims to be.
4. Bind every advertised shortcut; render `Ctrl`/`⌘` dynamically by platform; add a `?` shortcut-cheatsheet overlay.
5. Roving tab-index in the feature tree with Arrow keys + Home/End (standard tree widget pattern).

### 6.2 Single source of truth for tokens
Make `tokens.css` canonical; have `index.html` and `demo.html` `<link>` it; generate the README tables from it. Fix the invalid `#ff6baaa22`, complete the 13×3 base/dim/mid matrix (or derive dim/mid with `color-mix()` so they can never drift), reconcile radii, and document `--code-process` or delete it.

### 6.3 Ship the missing workhorse components
The target apps are parameter-heavy engineering tools; the highest-value additions are: text/number inputs with unit suffixes, steppers, sliders (feeds/speeds/stepover), selects, checkbox/radio, modal dialog + confirm pattern (destructive actions currently have no confirmation pattern despite a "danger" color), generic toast system (only an AI-specific toast exists), tooltip (fixed, keyboard-triggerable), breadcrumbs, empty states, and error/validation states for fields. Also: button `disabled` + `loading` states, `.btn-warning:hover`.

### 6.4 Fix the theme system properly
Per-theme semantic palettes at the token layer (dark values as-is; light values darkened for contrast); `prefers-color-scheme` default with manual override; persist in `localStorage`; run every text/background pair through a contrast check and publish the ratios in the spec page. Add `prefers-reduced-motion` guards around pulse/spin/fade.

### 6.5 Replace emoji with a real icon system
One SVG icon set (e.g. Lucide), `currentColor` fills so the semantic color tokens theme them, `aria-hidden="true"` + `aria-label` on icon-only buttons. Eliminates cross-OS emoji rendering drift (this system targets Windows primarily, where several of the chosen glyphs render poorly or in emoji-color style).

### 6.6 Upgrade the spec page into a working tool
- Dogfood: working Ctrl+K palette on index.html that jumps to sections.
- Copy-to-clipboard buttons on every token/snippet (a design system's #1 daily interaction).
- Fix the stale luminance-scale hex labels (§2.1) and "12 categories" copy (§2.2, §1.4).
- Live component playground states (hover/focus/disabled/loading shown side-by-side).
- A component status table (stable / demo-only / planned) so consumers know what's safe to copy — today tabs/alerts/loading/tooltips/palette exist only in demo.html with no documentation page.
- Add the demo's components (tabs, alerts, toast, tooltip, resizable panels, unit toggle) to the spec page as documented, copyable patterns.

### 6.7 Density tier instead of ad-hoc shrinking
Both files repeatedly hand-shrink controls below documented minimums (22-26px buttons, 9-10px text). Codify a **dense** variant (`.dense` scope or `--control-h-*` tokens) with honest minimums for desktop pro tools, and keep the touch-size scale for touch/primary actions. This resolves the rule-vs-reality conflict instead of pretending 52px buttons fit a CAM inspector.

### 6.8 Distribution & adoption for the 5 target projects
- Split `components.css` out of the demo pages (README already promises this file).
- Version the CSS (`/* v1.1.0 */` + changelog section in README) so downstream projects can track upgrades.
- Per-project starter templates (the README layout diagrams as actual HTML files under `templates/`).
- Optionally publish as a private npm package or git submodule so AI CAM 3.0 / Web DFM / Deepnest / Evolution Engine consume one artifact instead of copy-paste (copy-paste is how the three-way token drift in §1.2 happened).

### 6.9 Quality gates
- Add a tiny CI/pre-commit check: CSS custom-property lint (valid hex, every `var()` reference defined), axe-core accessibility scan of both pages, and a Playwright smoke test for the keyboard flows (Ctrl+K → arrow → Enter). The bugs in §1.1, §1.3 and §4.0 would all have been caught mechanically.

---

## 7. Summary

| Severity | Count | Themes |
|---|---|---|
| 🔴 Critical | 5 | Invalid token, no focus styles, non-keyboard-operable controls, off-screen tooltip system, plain-`l` theme toggle |
| 🟠 High | 9 | Token drift ×3 sources, wrong hex labels in spec, contrast failures, unbound shortcuts, mouse-only palette, demo violates sizing rule, broken light-theme contrast |
| 🟡 Medium | ~14 | Variant/state gaps, component API divergence, platform-wrong glyphs, brittle JS, stale docs |
| 🔵 Low | ~6 | Emoji icons, hardcoded values, minor polish |

**Biggest single insight:** the system's differentiators — keyboard-first, learn-fast tooltips, semantic color language — are all *documented* but not *functioning*: focus/keyboard support is absent, the tooltip system renders off-screen, and the token layer has drifted into three conflicting copies. Making the existing promises true (§6.1, §6.2) is worth more than any new component.

**Verified in a live browser this session:** invalid `--code-data-dim` resolving to transparent; undefined `--code-material-mid` falling back to `currentColor`; 0 of 12 div-based controls focusable; tooltip at `left: 605px` in a 597px viewport; `45.3.000` coordinate readout; plain-`l` theme toggle; light-mode contrast failures (screenshot).
