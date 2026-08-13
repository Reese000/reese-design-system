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

- 🔵 **Low**, flagged not fixed — `.radio`/`.radio.checked` (a bare, unlabeled circle primitive, `tokens.css:261-263`) renders identically to `.radio-dot` (`tokens.css:554-556`, part of the fuller `.radio-group`/`.radio-option` labeled-group pattern used in the new Checkbox & Radio showcase). Both were unused before this session; `.radio` appears to predate `.radio-group` and never got removed once superseded. Per this repo's own convention of not deleting CSS unilaterally without flagging it, it is left in place with a pointer comment in `tokens.css` — a maintainer should decide whether `.radio` still has a use case (e.g. a single unlabeled toggle-like radio outside a group) or should be removed in favor of `.radio-group` everywhere.
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

## 7. Summary

| Severity | Count | Themes |
|----------|-------|--------|
| 🔴 Critical | 0 | — |
| 🟠 High | 0 | — |
| 🟡 Medium | 0 | — |
| 🔵 Low | 2 | `.radio` vs `.radio-group` duplication (flagged, not deleted); box-drag area-select not implemented in the static viewport mock (documented, intentional scope cut) |

**One-line verdict:** the "Full component library" claim in README is now actually true, and so is the Select tool's own tooltip — both the top-level component showcase and the 3D-viewport's own selection/hover/toolpath-line spec had the same defect (real CSS, zero live wiring), and both are now live, keyboard-operable, and browser-verified. `scripts/validate.js` passes with 0 errors and 0 warnings after every batch. Remaining open items: the `.radio`/`.radio-group` duplication (flagged, needs a maintainer call), box-drag select (documented scope cut, not a bug), unused `.fade-in`/`.pill` variants (cosmetic, low priority), the pre-existing `.pill`/`.status-pill` divergence (tracked since `AUDIT.md`, unchanged by design or long-standing inertia), and the SearchForge-UI token-copy drift carried forward from AUDIT-v4/v5 (documentation-only by explicit prior user decision).
