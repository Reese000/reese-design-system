# Design System Audit v6 — Reese Design System v1.3.1

**Date:** 2026-08-13
**Scope:** `index.html`, `demo.html`, `tokens.css`, `README.md`
**Baseline:** [AUDIT-v5.md](AUDIT-v5.md) (2026-08-12)
**Status:** ✅ Complete — closed the "component library mostly unrendered" gap found while investigating this repo's 3D-viewport demo: 13 of the ~15 component types the README's "Full component library" bullet claims were rendered nowhere in either HTML file, meaning their CSS had never been visually or functionally verified. All 13 now have live, keyboard-operable, browser-verified examples. **Updated 2026-08-13** with a same-day follow-up: the 3D-viewport spec itself had the identical problem one level down — see §6.

Severity legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low
Resolution legend: ✅ Fixed · ⚠️ Partial · ❌ Not fixed · ➕ New in v6

---

## 1. Headline: every documented component now actually renders

A static drift-detection sweep (regex-based, matching this repo's own `scripts/validate.js` philosophy — no external deps) cross-referenced every class selector defined in `tokens.css` against actual `class="..."` usage in `index.html` and `demo.html`. It surfaced roughly 60 candidate "dead" classes; manual verification confirmed most were false positives (state modifiers, JS-only `classList` targets already covered), but one finding held up: inputs, select, checkbox, radio (both implementations), slider, tabs, four of five alert variants, loading states, stepper, breadcrumb, empty-state, modal, and confirm-dialog were defined in `tokens.css` with **zero working examples** anywhere in the repo, despite `index.html`'s own "Design system reference page" role and README's "Full component library" claim.

This audit closes that gap: four incremental batches added live examples to `index.html`'s Components section, each validated with `scripts/validate.js` and functionally verified against the running page (not just visual inspection — see §3).

---

## 2. Fixes shipped this session

| # | File | Fix |
|---|------|-----|
| 1 | `index.html` | Added Text Inputs, Select, Checkbox, Radio Group, Slider panels — checkbox and radio-group wired as custom ARIA widgets (`role="checkbox"`/`role="radiogroup"`+`role="radio"`) matching the existing `.toggle[role="switch"]` click/keydown pattern; radio-group additionally implements the ARIA APG roving-tabindex + Arrow-key pattern |
| 2 | `index.html` | Added Tabs panel — `role="tablist"`/`"tab"`/`"tabpanel"`, roving tabindex, Arrow/Home/End navigation, automatic activation |
| 3 | `index.html` | Added Alerts panel — all 5 semantic variants (`index.html` previously had none; `demo.html` only ever exercised info/warning/success), plus a working closeable instance (click and Enter/Space dismiss) |
| 4 | `index.html` | Added Loading States panel — spinner, loading-bar, skeleton (pure CSS animation, no JS needed) |
| 5 | `index.html` | Added Stepper panel — `+`/`−` buttons clamp to `data-min`/`data-max` and respect a configurable `data-step-size` |
| 6 | `index.html` | Added Breadcrumb panel — plain non-navigating `<button>`s, not `href="#"` placeholder links |
| 7 | `index.html` | Added Empty State panel |
| 8 | `index.html` | Added Modal + Confirm Dialog panel — full accessible dialog contract: `role="dialog"`/`"alertdialog"`, `aria-modal`, `aria-labelledby`/`aria-describedby`, Escape closes, backdrop click closes, focus moves into the dialog on open, Tab traps and wraps inside the dialog, focus returns to the triggering button on close |
| 9 | `index.html` | Fixed two stale `v1.2.0` version strings (top-of-file comment banner + footer) that had drifted from `package.json`'s actual `1.3.1` |
| 10 | `demo.html` | Added missing `TIPS.circle` entry — the circle-tool toolbar button had `data-tip="circle"` with no matching `TIPS` key, so its rich tooltip silently rendered nothing |
| 11 | `README.md` | Added Component Library doc sections for Form Controls, Tabs, Stepper/Breadcrumb/Empty State, and Modal & Confirm Dialog — previously undocumented despite the "Full component library" bullet claiming coverage |
| 12 | `tokens.css` | Added a code comment flagging `.radio` as a likely-redundant duplicate of `.radio-dot` (see §4) |

---

## 3. Verification log (2026-08-13)

All four component batches were verified against the live page at `http://localhost:8321` (static file server, not `file://`), using simulated DOM events rather than visual-only inspection:

| Check | Result |
|-------|--------|
| `node scripts/validate.js` after each batch | ✅ PASS — 0 errors, 0 warnings (5 runs) |
| Checkbox click toggles `.checked` + `aria-checked` | ✅ Verified via 2 sequential clicks, state confirmed both ways |
| Radio-group click selects; `.selected`/`aria-checked`/`tabindex` move correctly | ✅ Verified — clicking option 2 deselects option 1, moves roving tabindex |
| Radio-group ArrowLeft moves selection + focus | ✅ Verified |
| Tabs: click activates correct panel, deactivates others (`display:block`/`none` confirmed via `getComputedStyle`) | ✅ Verified |
| Tabs: ArrowRight moves selection + roving tabindex | ✅ Verified |
| Alert: Enter key on `.alert-close` (a `role="button"` div, not a real `<button>`) removes the alert | ✅ Verified — element count 1 → 0 |
| Stepper: `+`/`−` increment/decrement by `data-step-size`, clamp at `data-min` after 20 rapid decrements | ✅ Verified — clamped at 0.5 as configured |
| Modal: click trigger → focus moves to first focusable element in dialog (the close button) | ✅ Verified |
| Modal: Escape closes dialog and returns focus to the trigger | ✅ Verified |
| Confirm dialog: backdrop click (event target === overlay, not dialog content) closes and returns focus | ✅ Verified |
| Confirm dialog: Tab on last focusable element wraps to first; Shift+Tab on first wraps to last | ✅ Verified both directions |

---

## 4. New findings this session (➕ not previously tracked)

- 🔵 **Low, resolved** — `.radio`/`.radio.checked` (a bare, unlabeled circle primitive, `tokens.css:261-263`) rendered identically to `.radio-dot` (`tokens.css:554-556`, part of the fuller `.radio-group`/`.radio-option` labeled-group pattern used in the Checkbox & Radio showcase). Flagged (not deleted) earlier in this session pending a maintainer decision. A later pass in this same session grepped both `demo.html` and `index.html` for `class="radio` and confirmed zero usages of the bare `.radio` anywhere in either page or in any other repo file — it predated `.radio-group`, was fully superseded, and had none of `.radio-group`'s polish (no group semantics, no light-mode override, no focus-visible rule). Deleted the three `.radio`/`.radio.checked`/`.radio.checked::after` rules and their pointer comment from `tokens.css`, and removed the now-stale references from `README.md`'s Radio Group doc section and "Known remaining work" list.
- 🟢 **Uncommitted work-in-progress found and landed** — the `demo.html` TIPS.circle fix (item 10 above) had been made in an earlier session but was never actually committed; discovered via `git status` showing an unstaged `demo.html` diff at the start of this session. Committed separately with its own message rather than folded into an unrelated commit.

---

## 6. Follow-up: 3D-viewport interactivity was the same gap, one level down

A re-run of the drift-detection sweep against the post-§3 tree found the "spec written, never actually demoed" pattern repeating inside `demo.html`'s mock viewport itself. AUDIT-v5's 3D Viewport & Viewer Conventions work (camera controls, selection states, axis colors, a toolpath line legend) added `.vp-legend`/`.vp-legend-dot`, `.vp-obj-hover`/`.vp-obj-selected`/`.vp-obj-multiselect`, and `.tp-rapid`/`.tp-feed`/`.tp-plunge`/`.tp-live` to `tokens.css` — but none of them were ever applied:

- The viewport's on-screen legend (`demo.html`, top-left of the mock viewport) was hand-rolled with duplicate inline `style="..."` spans instead of using the real `.vp-legend`/`.vp-legend-dot` classes.
- The pulsing "current position" dot used a hardcoded `fill="var(--code-action)"` instead of the `.tp-live` class meant to formalize it — AUDIT-v5 §3 even said as much ("the live-position marker formalizes a pulsing dot that already existed") without the formalization actually landing.
- No toolpath line (`.tp-rapid`/`.tp-feed`/`.tp-plunge`) was drawn anywhere.
- Worse: the Select tool's own tooltip (`TIPS.select` in `demo.html`) already promised *"Click to select geometry, toolpaths, or features in the viewport. Hold Shift for multi-select. Drag a box to area-select."* — none of which the viewport actually did. The docs were ahead of the code, not describing it.

Fixed: 6 viewport shapes (Outer Profile, 3× Ø8mm holes, Ø5mm hole, Pocket) are now real selectable objects. Click selects (`.vp-obj-selected`), Shift+click toggles into a multi-selection (`.vp-obj-multiselect`), hover previews (`.vp-obj-hover`), and clicking empty viewport space clears the selection. Fully keyboard-operable — each shape is `tabindex="0" role="button"` with an `aria-label`, and Enter/Shift+Enter mirror click/Shift+click — and announced to screen readers via a new `#vpSelectionStatus` (`.sr-only`, `aria-live="polite"`) region, matching the existing `#treeReorderStatus` convention from AUDIT-v5's drag-and-drop work. The legend now uses its real classes; the live-position dot uses `.tp-live`; a short toolpath-line sample demonstrates all three line types.

**Verified live** (simulated DOM events against the running page, same method as §3): click → `vp-obj-selected` + correct `aria-live` announcement; Shift+click → both shapes become `vp-obj-multiselect` + "2 objects selected: ..." announcement; Shift+click again → correctly downgrades the remaining shape back to `vp-obj-selected` (not left as multiselect); hover adds/removes `vp-obj-hover` on enter/leave; keyboard Enter selects; click on empty viewport space clears selection and announces "Selection cleared"; legend/`.tp-live`/`.tp-rapid` computed styles confirmed matching their intended tokens.

**Deliberately not implemented:** box-drag area-select, the third behavior `TIPS.select` promises. Implementing real drag-rectangle-intersects-shape hit-testing is a disproportionate lift for a static flat-SVG mock (this repo has no real 3D renderer or scene graph — see AUDIT-v5 §3's Clay-mode caveat, same reasoning applies here). Documented here as a known, intentional gap rather than silently left unfinished; a consumer project with a real viewport (AI CAM 3.0, Web DFM) would need to implement it against actual scene geometry, not this mock.

Also fixed in the same pass: `.alert.inline` (used in `demo.html`, e.g. the toolpath inspector) had no example on the `index.html` reference page — added one to the Alerts panel from §2.

Four more `tokens.css` classes were confirmed still-unused after this pass and are lower priority than the above: `.fade-in`/`.fade-in-delay-1/2/3` (entrance-animation utility classes, documented in README with a code snippet but never applied to real content) and `.pill.amber`/`.pill.red`/`.pill.blue`/`.pill.muted` (2 of 6 `.pill` color variants — `green`/`magenta` — are used in `demo.html`; the other 4 aren't). The `.pill` vs. `index.html`'s separate hand-rolled `.status-pill` layer is **not** a new finding — it's the same divergent-component-API issue tracked since `AUDIT.md` §5.2/167 and reconfirmed in `AUDIT-v2.md`, left as-is here too.

---

## 7. 🔴 Critical: the manual theme toggle produced a broken hybrid theme for most users

While spot-checking light-mode contrast on the components added in §2-§6, several measured implausibly low ratios (e.g. `.breadcrumb-item.active` at 1.01:1, `.empty-state-title` at 1.56:1) even though their `html.light` CSS rules looked correct in isolation. Tracing the actual computed styles up the DOM found the root cause was not in any individual component — it was in how the theme itself gets applied.

`tokens.css` redefined the base surface tokens (`--canvas-*`/`--ink-*`/`--border-*`) only inside `@media(prefers-color-scheme:light){ :root:not(.dark){...} }` — driven purely by the OS/browser's color-scheme setting. Separately, `html.light{...}` (added during AUDIT-v4/v5's contrast work) redefined only the `--code-*` semantic colors, plus a long tail of `html.light .foo{color:#hardcoded}` per-component overrides. But `demo.html`'s actual theme toggle (`toggleTheme()`, bound to a toolbar button and Ctrl+L, persisted via `localStorage`) only ever manipulates the `.light` class on `<html>` — it never touches `prefers-color-scheme`, which the browser doesn't let a page override anyway.

Net effect, confirmed via the real `toggleTheme()` function (not a synthetic test) on a browser with `prefers-color-scheme: dark` — the overwhelming majority case for this "Dark-Mode Native" product's own target audience: clicking the light-mode toggle updated `--code-*` and every hardcoded per-component light-mode color, **but the canvas itself stayed pitch black**, because nothing had ever redefined `--canvas-void`/`--ink-primary`/etc. in response to the `.light` class. Text and icons rendered in colors tuned for a light background, on a background that never changed — a genuinely broken, largely illegible theme. (The bug is symmetric: a user whose OS prefers light and who explicitly picks dark mode via the toggle would hit the mirror-image failure, since the code never set a `.dark` class either — "dark" was only ever represented by the *absence* of `.light`, which the media query doesn't know how to respect.)

**Fixed:**
- Moved the full base token set into `html.light{}` so the explicit class is completely self-sufficient regardless of OS preference.
- Narrowed the media query's guard to `:root:not(.dark):not(.light)` so it only acts as a fallback for the brief pre-JS moment (or an unstyled/no-JS context) before either explicit class is set.
- Made `toggleTheme()`, `loadState()`, and the undo/redo history handlers all set an explicit `.dark` class (mirroring the existing `.light` toggle) on every code path, instead of representing "dark" as the mere absence of `.light`.
- Bumped `sw.js`'s `CACHE_NAME` (`v1.5` → `v1.6`) — the service worker caches `tokens.css` cache-first with no revalidation ever, so any returning user with the old service worker installed would never have received this fix at all without a cache-version bump. (This is also a standing gotcha for local development: editing `tokens.css` while an old service worker is installed silently serves stale CSS — worth knowing if a future fix "doesn't seem to apply" in a browser that's visited the page before.)

**Verified live** against the real code path (toolbar button click, not a simulated class change), in a fresh tab with the stale `reese-ds-v1.5` service-worker cache cleared: default state on load is fully dark (`--canvas-void:#0e1013`, `--code-action:#6c8aff`); clicking the toggle produces a fully light theme (`--canvas-void:#f0f1f3`, `--code-action:#1943e8`, body background measured `rgb(240,241,243)`); clicking again returns to fully dark. Also verified `index.html` (which has no toggle and relies purely on `prefers-color-scheme`) still resolves light mode correctly under an emulated `prefers-color-scheme: light` browser, confirming the narrowed media-query guard didn't regress the OS-driven-only path.

This is the most severe finding across AUDIT.md through AUDIT-v6 — every previous audit's light-mode contrast work (AUDIT-v4's WCAG fixes, AUDIT-v5's `.pill`/`.alert` fixes, this document's own §2-§6) was correct *in isolation* but could never actually be experienced correctly by a real user toggling themes, because the toggle itself didn't fully apply. It went unnoticed through five prior audits because verification consistently checked computed color values against token definitions rather than exercising the actual toggle end-to-end in a browser whose OS preference disagreed with the chosen in-app theme.

---

## 8. 🟠 High: the mirror-image gap — pages with no manual toggle never got `--code-*` colors either

A follow-up light-mode spot-check across `index.html` (which has no theme toggle at all — it's a static reference page driven purely by `prefers-color-scheme`) found `.tab.active` rendering at **2.22:1** contrast, well under AA, despite `tokens.css:604` explicitly setting `html.light .tab.active{color:var(--code-action)}`. Root cause is the other half of the §7 architecture bug: the `@media(prefers-color-scheme:light){:root:not(.dark):not(.light){...}}` fallback block only ever redefined the base surface tokens (`--canvas-*`/`--ink-*`/`--border-*`), never the `--code-*` semantic colors or the ~20 `html.light .foo{}` component overrides that live exclusively under the `.light` class. A page like `index.html` that never sets `.light`/`.dark` (no JS does it) gets a correctly-light canvas via the media query, but every `--code-*`-colored element — active tabs, links, primary buttons, alert accents — stays stuck on dark-mode values. Confirmed directly: with OS preference emulated light and no class on `<html>`, `--canvas-void` computed `#f0f1f3` (correct) while `--code-action` computed `#6c8aff` (the dark-mode value; light-mode is `#1943e8`).

Rather than duplicating the entire `html.light{}` block (tokens + ~20 component overrides) a second time inside the media query — which would recreate the exact two-mechanism-drift risk §7 just fixed, just with a bigger blast radius — the fix collapses to one mechanism everywhere: `index.html` now carries a tiny synchronous inline script in `<head>` (before the stylesheet link, so it runs before first paint) that adds `.light` or `.dark` to `<html>` based on `matchMedia('(prefers-color-scheme: dark)')`. Every page now sets an explicit class; the media-query block in `tokens.css` remains only as the true no-JS/pre-paint fallback its comment already described, not a second parallel theming path that has to be kept in sync by hand.

`demo.html` got the equivalent treatment for a related, lower-severity gap: its `loadState()` (which sets the `.light`/`.dark` class from `localStorage['ds-theme']`) ran from a `<script>` block near the end of `<body>`, after all markup and the linked `tokens.css` had already loaded — a brief flash-of-wrong-theme window on every load, worse the more a saved preference disagreed with the OS default. Separately, when no `ds-theme` was saved yet (first-ever visit), `loadState()` computed `isDark = theme !== 'light'`, which defaults to dark unconditionally rather than checking `prefers-color-scheme` — silently ignoring OS preference for new visitors. Fixed the same way as `index.html`: an early blocking `<head>` script now sets the class before first paint, checking `localStorage` first and falling back to `matchMedia` only when no explicit choice has been saved yet (respecting the standard priority: explicit user choice > OS preference > default). `loadState()` was simplified to read back `document.documentElement.classList.contains('dark')` as its single source of truth for the `isDark` JS variable, instead of re-deriving it with different (and now-inconsistent) fallback logic.

**Verified live:** `index.html` under emulated `prefers-color-scheme:light` with no class set now gets `class="light"` assigned by the head script, `--code-action` resolves to `#1943e8`, and `.tab.active` re-measures at **4.95:1** (passing AA, up from 2.22:1); under emulated dark preference, `class="dark"` is assigned and tokens correctly stay on their dark defaults. `demo.html` with `localStorage['ds-theme']` cleared (simulating a first visit) under OS-dark preference loads as `class="dark"` with the toggle button showing 🌙 — no flash observed, `isDark` correctly synced; the manual toggle still flips both class and all token-driven colors correctly in both directions (screenshot-confirmed full light-mode render with no residual dark-mode-tuned elements).

One tooling note worth recording: mid-investigation, `getComputedStyle` reads taken via automation against a browser tab that was open but not the *fronted*/visible tab returned stale values (a cached dark background persisted across multiple reads, contradicting the actual `--canvas-void` custom-property value, which read correctly). Explicitly fronting the tab before reading resolved it and a screenshot confirmed the true state. Distinct from the same-tick timing artifact noted in §7 — this one is about tab focus, not read/write ordering within one script.

---

## 9. Summary

| Severity | Count | Themes |
|----------|-------|--------|
| 🔴 Critical | 1 | Theme toggle applied only half the palette when it disagreed with OS `prefers-color-scheme` — fixed, see §7 |
| 🟠 High | 1 | Pages with no manual toggle (`index.html`) never got `--code-*` colors or component overrides in light mode either — fixed by unifying both pages onto one explicit-class mechanism, see §8 |
| 🟡 Medium | 0 | — |
| 🔵 Low | 1 | box-drag area-select not implemented in the static viewport mock (documented, intentional scope cut) — the `.radio` vs `.radio-group` duplication listed here in an earlier pass was resolved later this session, see §4 |

**One-line verdict:** the "Full component library" claim in README is now actually true, and so is the Select tool's own tooltip — both the top-level component showcase and the 3D-viewport's own selection/hover/toolpath-line spec had the same defect (real CSS, zero live wiring), and both are now live, keyboard-operable, and browser-verified. More significantly, this session found and fixed a two-part theming architecture bug (§7 critical + §8 high) that made the manual dark/light toggle *and* the OS-preference-only fallback each apply only half the color system in the common case — both are now unified onto a single explicit-class mechanism per page, set before first paint. `scripts/validate.js` passes with 0 errors and 0 warnings after every change. Remaining open items: box-drag select (documented scope cut, not a bug), unused `.fade-in`/`.pill` variants (cosmetic, low priority), the pre-existing `.pill`/`.status-pill` divergence (tracked since `AUDIT.md`, unchanged by design or long-standing inertia), and the SearchForge-UI token-copy drift carried forward from AUDIT-v4/v5 (documentation-only by explicit prior user decision).
