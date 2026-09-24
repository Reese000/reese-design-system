# Design System Audit v5 — Reese Design System v1.3

**Date:** 2026-08-12
**Scope:** `tokens.css`, `index.html`, `demo.html`, `icons.svg`, `README.md`, `package.json`, `sw.js`
**Baseline:** [AUDIT-v4.md](AUDIT-v4.md) (2026-07-26)
**Status:** ✅ Complete — three parallel work streams (3D viewport & clay shading, drag & drop, AUDIT-v4 backlog), combined token validation, script-syntax checks on the merged tree, and live browser verification of every new interactive pattern. **Updated 2026-08-12** with a follow-up cleanup pass — see §4/§5/§7 for what changed.

Severity legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low
Resolution legend: ✅ Fixed · ⚠️ Partial · ❌ Not fixed · ➕ New in v5

---

## 1. Headline: all AUDIT-v4 mediums fixed; three new pattern systems added

All 5 medium-severity items from AUDIT-v4 §4 are fixed and independently verified (not just re-asserted). Three substantial additions landed on top of that: a documented **3D Viewport & Viewer** spec (camera controls, selection states, axis colors, toolpath rendering, grid convention), a Blender-inspired **Clay shading mode** (random-object-color viewport shading — spec plus a flat-SVG mock, since this repo has no real 3D renderer), and a **Drag & Drop** system (file-import dropzone + click-to-export, keyboard/ARIA-accessible feature-tree reordering).

The three work streams were built concurrently against the same three shared files (`tokens.css`, `README.md`, `demo.html`) using pre-assigned, non-overlapping anchor points. One anchor collision occurred (two streams were pointed at the same `tokens.css` insertion line); it was self-detected and resolved by re-anchoring to the next unique heading, with no data loss. The combined tree — all three streams merged — passes the validator and both HTML files' script blocks still parse cleanly.

---

## 2. Fixes shipped this session (AUDIT-v4 §4 mediums)

| # | File | Fix | AUDIT-v4 Ref |
|---|------|-----|-----------|
| 1 | `index.html` | 8 `.action-card` divs → `tabindex="0" role="button"` + Enter/Space keydown handler; verified focus-visible ring renders and mouse clicks don't trigger it | §4 medium, §3/3.2 (v1) |
| 2 | `index.html` | "12-Color Code" / "12 distinct color categories" → 13, in the Design Principles panel | §4 medium |
| 3 | `tokens.css` | `html.light{}` block: 11 of 13 `--code-*` categories get darkened, hue-preserved text variants (config/process excluded — confirmed via grep they're never used as text). Worst-case contrast 4.61:1, best-case 6.27:1, all ≥4.5:1 AA. `--code-info` was the flagged case: old `#7ce0ff` measured **1.33:1** against `#f0f1f3` (badly failing, not merely borderline); new `#0c607a` measures 6.26–4.67:1 across all light canvas tokens | §4 medium |
| 4 | `index.html` | `copySnippet()` wired to 14 new `.copy-btn` instances (13 color-token cards + the typography G-code sample) | §4 medium |
| 5 | `index.html` | Hardcoded `⌘` → `navigator.platform` detection ported from `demo.html`. Fixed 19 occurrences (17 `.kbd` + 2 non-`.kbd` spans AUDIT-v4's count missed) | §4 medium |
| 6 | `README.md` | File Structure list: added missing `AUDIT-v4.md`, `WEB-DFM-GUIDE.md`, `ADAPTIVE-FRONTEND-PATTERNS.md` entries | §4 low (doc drift) |

---

## 3. New pattern systems added (outside AUDIT-v4's scope)

**3D Viewport & Viewer Conventions** — new README section + `tokens.css` (~28 new lines): camera controls formalized (Left-drag = Orbit, Middle-drag/Shift-drag = Pan, Scroll = Zoom, Double-click = Fit all — the onboarding tour copy in `demo.html` had a self-contradiction on the pan gesture, now fixed to match); hover/selected/multi-select states; axis-color aliases (`--code-axis-x/y/z` aliasing the existing danger/success/action tokens — no new hex); a rapid/feed/plunge/live toolpath line legend (the live-position marker formalizes a pulsing dot that already existed in `demo.html`'s mock viewport); grid/floor convention documented from the existing `.grid-bg` class.

**Clay Shading Mode** — new README subsection + `tokens.css` (~34 new lines, `--clay-1` through `--clay-10` plus `-shade` variants and `--clay-bg`, deliberately named outside the `--code-*` namespace so it doesn't perturb the 13-category matrix check) + `demo.html` (5th viewport-mode toggle alongside Shaded/Wire/Hidden/X-Ray). Assignment is a **stable hash of object/body ID**, not re-randomized per render, so it stays functionally useful for distinguishing parts rather than purely decorative. Explicitly documented as *not* a replacement for the safe/warning/error semantic colors used elsewhere. This repo has zero npm dependencies and no real 3D renderer — Clay mode here is a design-token spec plus a flat-SVG proof of concept (CSS `drop-shadow` faking two-tone shading + contour lines on the existing mocked viewport shapes); a consumer project (AI CAM 3.0, Web DFM) would apply the same palette + hash rule to real mesh materials.

**Drag & Drop** — new README subsection + `tokens.css` + `demo.html` + `icons.svg` (new `icon-import`/`icon-export` symbols). Import is drag-triggered (full-viewport dropzone overlay on `dragenter`/`dragover`, confirmation toast on drop); export is click-triggered (toolbar + command palette button) — documented as an intentional asymmetry, not an omission, since drag-to-export isn't a real desktop/web convention. Feature-tree operations gained a drag handle plus a **mandatory** non-drag fallback: move-up/move-down buttons and an ARIA live-region announcement on reorder, so the pattern doesn't reintroduce the mouse-only gaps this repo's audits keep flagging elsewhere.

---

## 4. Prior-finding verification matrix (vs. AUDIT-v4 §4)

| Item | Severity | Status | Notes |
|------|----------|--------|-------|
| Action cards not focusable | 🟡 Medium | ✅ Fixed | Verified via real HTTP server, not `file://` (which silently fails to load stylesheets and would false-pass) — Tab reaches all 8, `:focus-visible` matches, Enter/Space fire `click()` |
| "12-Color" hero text | 🟡 Medium | ✅ Fixed | — |
| Light-mode semantic contrast | 🟡 Medium | ✅ Fixed | 11/13 categories, all measured ≥4.5:1 (see §2) |
| `copySnippet` unused | 🟡 Medium | ✅ Fixed | 14 call sites added |
| Platform-aware glyphs missing in index.html | 🟡 Medium | ✅ Fixed | 19 occurrences, ported from demo.html's detection |
| README Tabs docs reference nonexistent `switchTab()` | 🔵 Low | ✅ Corrected | Re-checked: README never actually contained a `switchTab()` doc reference — the only occurrence was this tracking bullet itself. Removed as a stale claim, not a code fix. |
| Icon sprite duplication (inline `<symbol>` vs. `icons.svg`) | 🔵 Low | ✅ Fixed | Re-audit found the duplication was worse than tracked — `demo.html` *and* `index.html` each hand-duplicated their own inline `<symbol>` set, and the copies had drifted from `icons.svg` and from each other (`icon-alert` vs. `icon-alert-triangle`; two different `icon-settings` glyphs). Fixed by renaming `icons.svg`'s id to `icon-alert` (matching both consumers) and having both HTML files `fetch('icons.svg')` and inject it at runtime instead of duplicating markup. |
| Hex-baseline ratchet-down opportunity | 🔵 Low | ✅ Fixed | `scripts/hex-baseline.json`: `index.html` 16 → 14, matching actual usage |
| SearchForge-UI copies tokens.css instead of importing it | 🔵 Low | ❌ Not fixed, by decision | User chose to document only, not fix, this round (AUDIT-v4 §6) — reconfirmed, still deliberately out of scope |

---

## 5. New findings this session (➕ not previously tracked)

- 🟡 **Medium**, ✅ **Fixed** — Pre-existing hardcoded `.pill`/`.alert` light-mode hex colors (predate this session, `git blame 3d275cd8`) also failed AA contrast in places, e.g. `.pill.green:#2d8a4e` measured 3.83:1 and `.pill.amber:#996600` measured 4.37:1 against composited `--canvas-raised`. Different mechanism than the §2 fix — literal hex, not `var(--code-*)` references. Fixed the same way: same-hue darkened replacements (`tokens.css` `html.light` block), each verified ≥4.5:1 against its own tinted background composited over every lighter canvas token (void/base/surface/raised), not just canvas-void. `.pill.blue`, `.alert.error`, `.alert.ai` were already ≥4.5:1 and are unchanged.
- 🔵 **Low**, corrected (not a real finding) — The v1.2 README carried a claim that `demo.html`'s keyboard-shortcut overlay "fires instantly on Ctrl/Alt hold instead of after a ~400ms delay." Re-checked the code directly: the `setTimeout(() => showShortcuts(...), 400)` delay was already present (`demo.html`, modifier-key `keydown` handler). The claim was stale documentation debt, not an actual bug — removed from README's known-remaining-work list.
- 🟢 **Import dropzone had no non-drag trigger** (found during this cleanup pass, not carried from v5's original writing) — `#dropzoneOverlay` was `aria-hidden="true"` with no `<input type="file">` or click affordance anywhere in `demo.html`; the only way to trigger import was a physical mouse/touch drag over the window, inconsistent with the mandatory keyboard fallback the sibling tree-reorder feature got in the same v5 work stream. ✅ Fixed — added an Import `.btn` (toolbar + command palette) wired to a hidden `<input type="file">`, sharing `handleImportedFile()` with the drag path.

---

## 6. Verification log (2026-08-12)

| Check | Result |
|-------|--------|
| `node scripts/validate.js` (combined tree, all 3 streams merged) | ✅ PASS — 0 errors, 1 warning (pre-existing, `index.html` hex baseline can ratchet down 14→lower) |
| `node --check` on `index.html`'s extracted script block | ✅ Syntax OK |
| `node --check` on `demo.html`'s 2 extracted script blocks | ✅ Syntax OK |
| Clay mode toggle | ✅ Live-clicked in browser; every `data-clay` shape's computed fill/stroke matched its intended `--clay-N`/`-shade` token |
| Action-card focus ring + keyboard activation | ✅ Verified over real HTTP (not `file://`); computed `outline: 2px solid var(--code-action)`; mouse clicks don't trigger the ring |
| Tree reorder keyboard/ARIA fallback | ✅ Move buttons + `aria-live` region present and wired |
| Anchor-collision self-recovery (concurrent-agent risk) | ✅ One collision on a `tokens.css` insertion point, self-detected and re-anchored with no overwrite; all three streams' sections re-verified byte-for-byte intact after merge |

---

## 7. Summary

| Severity | Count | Themes |
|----------|-------|--------|
| 🔴 Critical | 0 | — |
| 🟠 High | 0 | — |
| 🟡 Medium | 0 | `.pill`/`.alert` hardcoded-hex light-mode contrast — fixed in the follow-up cleanup pass |
| 🔵 Low | 1 | SearchForge-UI drift (documented, not fixed, by explicit user decision) |

**One-line verdict (updated after cleanup pass):** all five AUDIT-v4 mediums are fixed and independently verified; three new pattern systems (3D viewport spec, Clay shading, drag & drop) shipped clean with zero validator errors and a mandatory accessible fallback on every new interaction. A follow-up pass then fixed the `.pill`/`.alert` contrast finding, closed the import-dropzone's missing keyboard/click fallback, unified the icon sprite to a single `icons.svg` source (which turned out to have three-way drift, not two), ratcheted the hex baseline down, and corrected two stale documentation claims (`switchTab()`, shortcut-overlay delay) that turned out not to reflect real bugs. `scripts/validate.js` now passes with 0 errors and 0 warnings. Only remaining open item is the SearchForge-UI token-copy drift, deliberately left as documentation-only by user decision.
