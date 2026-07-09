# Design System Re-Audit — Reese Design System v1.2

**Date:** 2026-07-08
**Scope:** `index.html`, `demo.html`, `tokens.css`, `icons.css`, `icons.svg`, `README.md`, `scripts/validate.js`, `.github/workflows/ci.yml`
**Baseline:** [AUDIT.md](AUDIT.md) (v1.x audit, 2026-07-06)
**Status:** ✅ Complete — static review of all files + live-browser verification (script parsing, token cascade, keyboard, theme quadrants, ARIA state)

Severity legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low
Resolution legend: ✅ Fixed · ⚠️ Partial · ❌ Not fixed · ➕ New in v1.2

---

## 1. Infrastructure (new in v1.2)

Observed so far:
- `tokens.css` v1.2 is declared the single source of truth; 13×3 color matrix complete and valid; `:focus-visible`, `prefers-reduced-motion`, `prefers-color-scheme`, dense control-height tier (`--h-xs`…`--h-2xl`), and full component layer (inputs, selects, sliders, checkbox/radio, toggle, alerts, tabs, modal, tooltip, loading states) added.
- `scripts/validate.js` token validator — **runs clean (0 errors, 0 warnings)**.
- `.github/workflows/ci.yml` CI pipeline (token validation, HTML structure, hardcoded-color scan, a11y grep).
- `package.json` v1.2.0 for distribution; `icons.css` + `icons.svg` SVG sprite (currentColor).

### 1.1 ➕🟡 Validator has a self-neutralizing check
`scripts/validate.js:71-78` — the undefined-`var()` check filters `undefined.filter(v => tokens.includes(v))`, but any `var(--x)` reference by definition makes `tokens.includes('--x')` true (the reference itself is in the text), so `crossFile` can never catch a genuinely undefined variable that appears only as a reference… it flags everything or nothing depending on ordering — in practice the check can't fail. It also skips all `--code-*` names explicitly. The headline check ("every var() reference is defined") is a no-op.

### 1.2 ➕🟡 CI "hardcoded colors" and a11y steps can't fail
`ci.yml:38-41` — the hardcoded-color grep only prints a warning (never exits non-zero), and its `grep -v 'canvas-\|--code-'` filter doesn't do what it intends (it filters display lines, not semantics). `ci.yml:48` — the focus check passes if the file merely *links* tokens.css, which the previous step already guarantees, so the a11y step is always green. These gates give false confidence — the exact failure mode the first audit flagged (§6.9) they were meant to prevent.

---

## 2. Headline: both pages ship unparseable JavaScript

**The v1.2 remediation was clearly never loaded in a browser.** Both HTML files contain a quote-nesting SyntaxError in their main `<script>` block, so **every** JavaScript feature — including all the newly written fixes — is dead at runtime. **[verified in browser]**

### 2.1 🔴 index.html: `SyntaxError: missing ) after argument list`
`index.html:2399` — `renderCmd` builds the palette item HTML in a single-quoted string containing `getElementById('' + s.id + '')` and `{behavior:'smooth'}`; the inner single quotes terminate the outer string. The whole block fails to compile. Verified consequences: the new Ctrl+K palette never gets created (`scriptAlive: false`), smooth-scroll/`history.pushState` nav is dead, toggle clicks are dead, `copySnippet` is dead. The spec page has **zero working JavaScript**.

### 2.2 🔴 demo.html: `SyntaxError: Unexpected string`
`demo.html:1045` — `toggleHelp` embeds `this.closest('.fixed')` inside a single-quoted concatenated string; same class of bug. The entire ~700-line main script is dead. Verified at runtime: `toggleUnit`, `toggleTheme`, `openCmd`, `filterCmd`, `showToast`, `cycleMode` are all `undefined`; Ctrl+K does nothing; tooltips never render; coordinate readout is frozen; resizable panels, localStorage persistence, platform-aware kbd labels, shortcut overlay, undo system, and onboarding tour never run. Every `onclick` that references those functions now **throws** on click. Only the second script block (service-worker registration) survives.

**Net effect: v1.2 is functionally worse than v1.0.** In v1.0 the demo's JS ran (with bugs); in v1.2 nothing runs. All 10+ correctly-rewritten fixes (clamped tooltips, `parseFloat().toFixed(3)` coords, guarded Ctrl+L, palette arrow-nav, structure-preserving `applyAI`, aria-checked updater, persistence) are verified-correct **as source code** and verified-dead **as a product**.

---

## 3. Prior-finding verification matrix

| # (AUDIT.md) | Finding | Status | Notes |
|---|---|---|---|
| 1.1 | Invalid `#ff6baaa22` hex | ⚠️ **Partial** | Fixed in tokens.css; **still present at `index.html:58`**, and the inline copy overrides tokens.css — verified resolving to `transparent` at use |
| 1.2 | Three divergent token sources | ❌ **Not fixed** | tokens.css declared canonical and linked ✅, but index.html keeps its full stale `:root` **after** the link (wins the cascade: old `--ink-muted #5a5f72`, old radii verified) and README Quick Start still ships the **v1.0 palette** (`#08090b`…). Still three conflicting sources |
| 1.3 | Incomplete dim/mid matrix | ✅ Fixed | 13×3 complete in tokens.css; validator passes; `--code-material-mid` verified resolving |
| 1.4 | 12 vs 13 categories | ⚠️ Partial | Badge now "13 categories", but hero still says "12-Color Code" (`index.html:1211`), the grid still has 12 cards (no Process Indigo), README table still 12 |
| 1.5 | Stale file structure in README | ✅ Mostly | Updated; omits icons.css/icons.svg/package.json/scripts/sw.js |
| 2.1 | Wrong hex labels in luminance scale | ✅ Fixed | Old values no longer present |
| 2.3 | Stray `;6` typo | ✅ Fixed | |
| 2.4 | Missing button states | ✅ Fixed (tokens) | `:disabled`, `.loading`, `.btn-warning:hover` in tokens.css |
| 2.5 | Missing workhorse components | ⚠️ Partial | tokens.css adds input/select/slider/checkbox/radio/modal/tooltip ✅ — but the spec page documents **none** of them (no specimens), and demo uses few. Steppers, breadcrumbs, empty/error states still absent |
| 2.6 | v1.1 features absent from spec page | ❌ Not fixed | index.html still has no tabs/alerts/loading specimens; its new palette is dead code |
| 2.8 | Emoji icon system | ⚠️ Partial | demo.html converted to a proper inline SVG sprite ✅; index.html still 100% emoji; the `TIPS` data still uses emoji |
| 3.1 | No focus styles on spec page | ✅ Fixed | Inherited from linked tokens.css — rule verified present |
| 3.2 | Controls not keyboard-operable | ⚠️ Partial | demo toolbar = real `<button>`+`aria-label` ✅; toggles got `role="switch"`+`tabindex` but **no key handler** (Space/Enter still do nothing) and the aria-checked updater is in the dead script — see §4.2. index.html unchanged: 0/4 toggles, 0/8 action cards focusable **[verified]** |
| 3.3 | Contrast failures | ⚠️ Partial | tokens.css raised `--ink-muted`/`--ink-ghost` ✅ — but index.html's inline copy overrides them back to the failing values **[verified `#5a5f72`]**, and light-mode semantic colors are still unadjusted (cyan `#7ce0ff` alert text on `#f0f1f3` verified in light emulation) |
| 3.4 | Structural HTML gaps | ❌ Mostly not fixed | Still no `<h1>`, no skip link, no ARIA in index.html; `prefers-reduced-motion` now provided by tokens.css ✅ |
| 3.5 | Mac-only shortcut glyphs | ⚠️ Partial | demo has `navigator.platform` detection ✅ — in the dead script, so labels never localize; index.html still hardcodes ⌘ everywhere; README table stale |
| 4.0.1 | Tooltips off-screen | ⚠️ Rewritten correctly, dead | New fixed-position + viewport clamping code is right; tooltips now never appear at all **[verified]** |
| 4.0.2 | Plain-`l` toggles theme | ✅ Code fixed (dead) | Condition now requires Ctrl/Meta |
| 4.0.3 | `45.3.000` coordinates | ✅ Code fixed (dead) | `parseFloat(x).toFixed(3)`; readout frozen at runtime |
| 4.0.4 | Unbound/conflicting shortcuts | ⚠️ Partial | Rebound to Ctrl+⇧R / Ctrl+⇧P with preventDefault ✅; README still documents Ctrl+R/Ctrl+P; handlers are stubs; all dead |
| 4.0.5 | Palette not keyboard-navigable | ✅ Code added (dead) | Arrow/Enter/highlight logic present in both files |
| 4.0.6 | `applyAI` breaks unit conversion | ✅ Code fixed (dead) | Preserves `.num` structure, updates `data-mm` |
| 4.1 | Nav doesn't update hash | ✅ Code added (dead) | `history.pushState` in the dead block |
| 5.1 | Demo violates 28px sizing rule | ⚠️ Partial | Dense tier `--h-*` tokens added ✅; but tokens.css `.btn-sm` is 24px, no `.btn-xl` exists in tokens at all, and README still says "XL 52px / nothing smaller than 28px" — docs and code still contradict |
| 5.2 | Divergent component APIs | ⚠️ Partial | demo now consumes tokens.css classes ✅; index.html keeps its own parallel `.btn-xl`/`.status-pill` layer |
| 5.3 | Light theme broken | ❌ **Worse** — see §4.3 | |
| 5.4 | No state persistence | ✅ Code added (dead) | localStorage save/load — never runs |

---

## 4. New findings in v1.2

### 4.1 🔴 Stale inline `:root` in index.html silently defeats the token unification
`index.html` links tokens.css (line 8) and then re-declares the entire old `:root` inline (lines 17–112), which wins the cascade. Verified live: `--code-data-dim` is the invalid 9-digit hex again (resolves `transparent`), `--ink-muted` is back to the low-contrast `#5a5f72`, radii differ from tokens.css. The "single source of truth" holds only for tokens the inline copy doesn't mention. **Fix:** delete the inline `:root` block entirely (and the duplicated reset/scrollbar/component styles that tokens.css now owns).

### 4.2 🟠 ARIA now actively lies
Toggles ship `aria-checked` in static HTML and flip visually via inline `onclick="this.classList.toggle('on')"`, but the script that syncs `aria-checked` is dead. Verified: after clicking, visual state and `aria-checked` disagree. For screen-reader users this is worse than having no ARIA. Also: `role="switch"` elements still have no Space/Enter key handling.

### 4.3 🟠 Theme system is broken in three of four quadrants **[verified]**
tokens.css puts the light palette **only** inside `@media(prefers-color-scheme:light)`, guarded by `:root:not(.dark)` — but nothing ever sets a `.dark` class, and the `html.light` class only restyles alerts/tabs/focus. Verified matrix: OS-dark + toggle light → **nothing changes** (bg stays `#0e1013`); OS-light → page is light, and removing `.light` **cannot force dark**; OS-light semantic colors → still raw cyan/lime (`.alert.info` text verified `#7ce0ff` on `#f0f1f3`, ≈1.7:1). Only "follow the OS" works. The manual toggle, persistence, and the README's "full light theme" claim are all non-functional. **Fix:** define the light palette once under both `html.light` and the media query (or set `data-theme` via JS before paint), and add light-adjusted `--code-*` values.

### 4.4 🟠 Service worker pins the broken build
`sw.js` is cache-first with `skipWaiting()`/`clients.claim()` and no HTML network-first or cache-busting beyond the manual `CACHE_NAME`. Any visitor caches the current (broken) HTML/JS; after a fix ships they keep getting the broken version until `CACHE_NAME` is manually bumped and the SW updates. It also caches `README.md` (never fetched by the app). Registering an aggressive SW during active development is a footgun — recommend removing it until the system stabilizes, or switching HTML to network-first.

### 4.5 🟡 Orphaned and phantom features
- **Tabs:** markup removed from demo, `switchTab` deleted, but README still documents the tabs API (referencing the deleted function) and tokens.css still styles it. No page demonstrates tabs.
- **`closeActions()`** is called in the Escape handler (`demo.html:649`) but defined nowhere — once the SyntaxError is fixed, every Escape press will throw.
- **Undo/redo** is scaffolding: the unit-toggle undo/redo bodies are comments (`demo.html:1009-1010`), theme undo bypasses `saveState`, and `toggleTheme` gets double-wrapped (persistence wrapper, then undo wrapper) — undo of a theme toggle leaves localStorage stale.
- **`copySnippet`** (`index.html:2341`) has no callers — no copy buttons were added to any snippet.
- **Help overlay** text promises "Press ? … for this help" but no `?` binding exists.
- **Alt/Ctrl hold** shows the shortcut overlay instantly on keydown — it will flash during every Ctrl+C/Ctrl+F and `preventDefault()` on Alt blocks browser menu access. Needs a ~400ms hold delay.

### 4.6 🟡 Quality gates can't catch any of this
Beyond §1.1/§1.2 (validator's undefined-var check is a no-op; CI color/a11y steps can't fail): **no gate parses the JavaScript**, which is the single check that would have caught both fatal SyntaxErrors — e.g. `node --check` per extracted script block, or loading each page in headless Chrome and failing on console errors. The CI also never runs the pages, so "tooltips render", "palette opens" have no coverage.

### 4.7 🔵 Minor
- Icon sprite is duplicated: inline `<symbol>` set in demo.html *and* a separate `icons.svg` file (drift risk); index.html uses neither.
- README front matter still says v1.0 (package.json says 1.2.0); "New Features (v1.1)" section describes the current feature set; checklist still says "copy from Quick Start" and "Cmd+K".
- `scripts/validate.js:73` declares a variable named `undefined` — legal but hazardous.
- demo's `viewport-stats`/`vs-row` text is still 9px in the ≤900px breakpoint.

---

## 5. Browser verification log (2026-07-08, Chromium preview)

| Check | Result |
|---|---|
| index.html script parses | ❌ `SyntaxError: missing ) after argument list` |
| demo.html main script parses | ❌ `SyntaxError: Unexpected string` |
| index.html `cmdPalette` created | ❌ never (script dead) |
| `--code-data-dim` computed (index) | `#ff6baaa22` → `rgba(0,0,0,0)` at use |
| `--ink-muted` computed (index) | `#5a5f72` (stale inline wins over tokens.css `#6b7088`) |
| `--code-material-mid` (index) | ✅ `#5ce1e655` (falls through to tokens.css) |
| Focusable toggles / action cards (index) | 0/4, 0/8 |
| demo: `toggleUnit toggleTheme openCmd filterCmd showToast cycleMode switchTab` | all `undefined` |
| demo: Ctrl+K opens palette | ❌ |
| demo: tooltip on hover | ❌ never renders |
| demo: coordinate readout updates | ❌ frozen |
| demo: inline toggle flips visually / aria-checked syncs | ✅ / ❌ (state lies) |
| demo: `html.light` with dark OS | no visual change (bg stays `rgb(14,16,19)`) |
| demo: force dark with light OS | impossible (no `.dark` mechanism) |
| demo: `.alert.info` text color in light mode | `rgb(124,224,255)` on `rgb(240,241,243)` — fails contrast |
| `node scripts/validate.js` | ✅ passes (but see §4.6 — it cannot catch any of the above) |

---

## 6. Recommendations (ordered)

1. **Fix the two SyntaxErrors first** — everything else in v1.2 is gated behind them. Replace the quote-nested inline `onclick` strings with `addEventListener`/`dataset` wiring (in `renderCmd` and `toggleHelp`), which removes the whole bug class. Then re-test *in a browser* before calling it done.
2. **Delete index.html's inline `:root`** (and its duplicated reset/component CSS) so tokens.css actually is the single source; regenerate the README Quick Start block from tokens.css.
3. **Rewire theming**: light palette under `html.light` *and* the media query; light-adjusted `--code-*` variants; make the toggle set/remove classes both ways.
4. **Finish the ARIA switch pattern**: keydown (Space/Enter) handler + aria-checked sync in one place; apply the same treatment to index.html's toggles/action cards (or make them `<button>`s).
5. **Add a JS gate to CI**: extract each `<script>` and `node --check` it (or run both pages headless and fail on any console error); make the color/a11y steps actually `exit 1`; fix the validator's undefined-var check (resolve references against declarations, not raw `includes`).
6. **Remove or defang sw.js** until the system is stable (network-first for HTML at minimum) — otherwise every future fix fights the cache.
7. Reconcile docs: README version/title, shortcut table (Ctrl+⇧R/⇧P), delete or re-implement tabs, update the sizing rule to describe the dense tier honestly, add the Process Indigo card + fix "12-Color Code".
8. Then resume the v1 backlog that remains untouched: spec-page specimens for the new components, `<h1>`/skip link, index.html icon adoption, platform-aware kbd on index.

---

## 7. Summary

v1.2 attempted essentially every recommendation from the first audit — and the CSS/token layer genuinely improved (complete color matrix, focus styles, reduced motion, dense tier, new components, SVG icons in the demo, CI scaffolding). But **both HTML pages ship JavaScript that does not parse**, so at runtime the system regressed below v1.0: no tooltips, no palette, no theme/unit toggles, no persistence, frozen coordinates, and ARIA that misreports state. The stale inline `:root` in index.html additionally resurrects the invalid hex and low-contrast inks that tokens.css fixed, and the README still distributes the v1.0 palette. The new CI/validator would catch none of this.

| Severity | Count | Themes |
|---|---|---|
| 🔴 Critical | 3 | Two page-wide SyntaxErrors; stale inline `:root` defeating token unification |
| 🟠 High | 4 | Lying ARIA state, theme broken 3-of-4 quadrants, build-pinning service worker, light-mode contrast still failing |
| 🟡 Medium | ~9 | Orphaned tabs/undo/help features, undefined `closeActions`, toothless CI, stale README, docs-vs-code sizing conflict |
| 🔵 Low | ~4 | Icon duplication, version drift, 9px text, validator style |

**One-line verdict:** merge nothing until the two script blocks parse and both pages have been opened in a real browser; the fix-work is ~80% written and 0% shipped.
