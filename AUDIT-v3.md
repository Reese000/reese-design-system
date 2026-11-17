# Design System Audit v3 — Reese Design System v1.2

**Date:** 2026-07-09
**Scope:** `index.html`, `demo.html`, `tokens.css` (committed **and** uncommitted working tree), `icons.css`, `icons.svg`, `README.md`, `scripts/validate.js`, `scripts/hex-baseline.json`, `.github/workflows/ci.yml`, `sw.js`
**Baseline:** [AUDIT-v2.md](AUDIT-v2.md) (2026-07-08) — verifying the 8 fix commits dated 2026-07-09 (`87e1d75`…`acef2b7`) plus one **uncommitted** change to tokens.css (−443 / +40 lines)
**Status:** ✅ Complete — static review of all files + validator run + CI-gate reproduction + live-browser verification of both pages in both color schemes

Severity legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low
Resolution legend: ✅ Fixed · ⚠️ Partial · ❌ Not fixed · ➕ New since v2

---

## 1. Headline: two different verdicts for two different trees

### 1.1 The committed state is the best this project has ever been
The v2 disaster class is genuinely gone. **Both pages' JavaScript parses and runs — verified live, zero console errors.** `renderCmd` was rewritten with `dataset` + `addEventListener` (exactly as recommended), killing the quote-nesting bug class rather than patching one instance. Verified working at runtime: Ctrl+K palette (both pages), arrow-nav + Escape, tooltips, coordinate readout, unit toggle, ARIA switch sync on click *and* Enter/Space, localStorage persistence, platform-aware kbd labels in the demo, 400ms overlay hold delay, IntersectionObserver nav tracking with `history.pushState`. The stale inline `:root` in index.html was deleted, so tokens.css finally wins the cascade (`--ink-muted` verifies as `#6b7088`, `--code-data-dim` as valid `#ff6baa22`). The validator was rewritten and now has real teeth (it parses definitions vs references correctly, checks HTML drift, ratchets hardcoded hex, and exits non-zero).

### 1.2 ➕🔴 The uncommitted tokens.css change breaks the system again
The working tree deletes 443 of tokens.css's 560 lines: the base reset, all four keyframe animations, **every component class** (`.btn`, `.input`, `.select`, `.slider`, `.checkbox`, `.radio`, `.toggle`, `.alert`, `.pill`, `.tabs`, `.modal`, `.tip`, `.spinner`, `.skeleton`, `.loading-bar`, `.num`, steppers, breadcrumbs, empty states, confirm dialogs), the print styles, and the **entire `html.light` block**. It keeps the token layer, adds `--w-*` weight tokens and new "Deepnest layout tokens" (`--header-h`, `--iconbar-w`, `--sidebar-w`, …).

Verified consequences as-is:
- **demo.html visibly breaks**: alerts, pills, and the spinner render unstyled (transparent background, no border, no animation) — the demo re-declares `.btn`/`.toggle` inline so those survive, but everything it borrowed from tokens.css is gone. `showToastMessage` references the now-deleted `fadeSlideIn` keyframes.
- **Manual theming is dead in all states**: with `html.light` gone, the theme toggle flips the ☀ glyph and persists to localStorage but the page never changes — a control that lies (v2 §4.3 regressed from "broken 3 of 4 quadrants" back to "manual toggle does nothing at all").
- **The project's own gates catch it** — this is the good news. `node scripts/validate.js` fails with 2 errors (missing keyframes; missing component classes), and CI would go red. The quality-gate investment from v2 §4.6 is paying off on its first real test.

This may be an *intentional* refactor — the new Deepnest layout tokens suggest tokens.css is being repurposed as a pure token file for consumption by other projects. But half a refactor is a regression: **the component layer was deleted without being relocated**, and nothing else ships it. This needs an explicit decision (see Recommendations §6.1) before anything is committed.

### 1.3 ➕🔴 index.html ships giant icons — icons.css is never linked
The 2026-07-09 commits added SVG sprite icons to index.html (v2 §2.8 follow-through), but its `<head>` links only fonts + tokens.css — **not icons.css** — and the page defines no local `.icon` rule. An SVG with no width/height/viewBox sizing renders at the browser default: **verified live at 300×150px, 6 instances**, blowing the nav brand row up to 150px tall. demo.html links icons.css and is fine. One `<link rel="stylesheet" href="icons.css">` fixes it.

### 1.4 ➕🟠 The new CI JS-syntax gate can never fail
The one check created specifically to prevent v2's disaster class is toothless. `ci.yml`'s "Check JavaScript syntax" step pipes script blocks through `node --check`, but (a) the `sed` range expression includes the literal `<script>` tag lines, so `node --check` **always** errors on the tag itself, and (b) `|| echo "⚠ JS syntax issue"` swallows the failure. **Reproduced locally: the step "warns" on both files today — files whose JS verifiably parses fine — and exits 0 regardless.** It is pure noise that would stay green through another v2-style SyntaxError. Same anti-pattern v2 flagged in §1.2 (gates that can't fail), rebuilt in a new spot.

---

## 2. Infrastructure changes since v2

- 8 commits (2026-07-09): `87e1d75` validator grouped-selector fix → `9f2f3ec` WEB-DFM-GUIDE.md → `1580fd1` weight tokens → `3888bc1` demo CSS cleanup → `1647898` v2 criticals → `6574e5c` remaining v2 items → `db6d311` hex baseline → `06c4a97`/`eb903a4`/`112c700`/`eb68087`/`acef2b7` docs consistency.
- `scripts/validate.js` fully rewritten: real def-vs-ref resolution (v2 §1.1 fixed), HTML-vs-tokens drift check, hardcoded-hex ratchet against `scripts/hex-baseline.json` (index 16 / demo 9), keyframes + component-class presence checks, a11y invariants, non-zero exit.
- `ci.yml`: validator step replaces the old toothless color/a11y greps (v2 §1.2 fixed); a11y greps can now fail; **new JS-syntax step is broken** (§1.4).
- `sw.js`: network-first for HTML (v2 §4.4 partially addressed) — but see §4.3.
- New: `WEB-DFM-GUIDE.md`; `--w-normal/medium/semibold/bold` weight tokens.

---

## 3. Prior-finding verification matrix (vs AUDIT-v2.md)

Status is for the **committed** tree; ⬅️ marks items the uncommitted tokens.css change would regress.

| # (v2) | Finding | Status | Notes |
|---|---|---|---|
| 1.1 | Validator undefined-var check is a no-op | ✅ **Fixed** | Rewritten; parses defs vs refs; verified it now actually fails (on the working tree) |
| 1.2 | CI color/a11y steps can't fail | ✅ Fixed | Replaced by validator step + greps that exit 1 — but the *new* JS step repeats the anti-pattern (§1.4) |
| 2.1 | index.html SyntaxError | ✅ **Fixed** | `renderCmd` rewritten with dataset/addEventListener; verified: script alive, palette opens on Ctrl+K, 0 console errors |
| 2.2 | demo.html SyntaxError | ✅ **Fixed** | Verified: full script runs; tooltips, coords, unit/theme handlers, persistence all live |
| 4.1 | Stale inline `:root` defeats tokens.css | ✅ **Fixed** | Deleted; verified `--ink-muted #6b7088`, `--code-data-dim` valid, radii from tokens.css |
| 4.2 | ARIA lies; no key handler | ✅ Fixed (demo) | Click + Enter/Space flip class **and** aria-checked in one handler — verified in sync. index.html toggles also wired ✅ |
| 4.3 | Theme broken 3 of 4 quadrants | ⚠️ Partial ⬅️ | Committed: `html.light` block with ~90 overrides makes the manual toggle *mostly* work (it never redefines `--canvas-*`/`--ink-*`, so coverage is per-component, and `html.light body{background:var(--canvas-void)}` is circular). Force-dark on light OS still impossible (no `.dark` mechanism anywhere). **Uncommitted tree deletes the block → toggle fully dead** |
| 4.4 | Service worker pins broken builds | ⚠️ Partial | HTML is network-first ✅; CSS/SVG still cache-first under `CACHE_NAME 'reese-ds-v1.2'` which was **never bumped across 8 fix commits** — returning visitors keep stale tokens.css indefinitely |
| 4.5 | Orphaned/phantom features | ⚠️ Partial | `closeActions` removed from Escape handler ✅; overlay 400ms hold delay ✅ (Alt still `preventDefault`'d); help-overlay "?" claim fixed ✅. Still broken: undo system (§4.5), `copySnippet` 0 callers, tabs phantom docs in README |
| 4.6 | No gate parses the JS | ⚠️ **Attempted, broken** | The added gate can never fail — §1.4 |
| 4.7 | Minor (icon dup, README drift, 9px text) | ⚠️ Partial | 9px text fixed ✅; README version/title fixed ✅; icon sprite still duplicated (inline in demo + icons.svg); README File Structure still stale |
| §3/1.4 (v1) | 12 vs 13 categories | ❌ **Not fixed** | Verified live: hero metric still "12-Color Code" (`index.html:1136`), principle 3 says "12 distinct color categories" (:1164), badge says "13" (:1189), grid has **12 cards — Process Indigo `#818cf8` still missing**, SECTIONS desc says "13" (:2298). Five mutually contradictory statements on one page. README table now has all 13 ✅ |
| §3/3.2 (v1) | index.html cards/toggles not keyboard-operable | ⚠️ Partial | Toggles: fixed ✅. Action cards: **0 of 8 focusable** — verified live |
| §3/3.4 (v1) | No `<h1>`, no skip link | ❌ Regressed | Still no `<h1>` (verified `h1Count: 0`; hero is a div). Skip link was added **twice** (`index.html:1084-1085`, duplicate IDs) with `top:-100px` and **no `:focus` rule to reveal it** — verified top stays `-100px` on focus. A skip link you can't see is worse than none |
| §3/3.5 (v1) | Mac-only ⌘ glyphs | ⚠️ Partial | demo: platform-aware replacement runs ✅ (verified). index.html: **17 hardcoded ⌘ glyphs**, no detection — verified on Windows |
| §5/5.1 (v1) | Docs vs code sizing conflict | ⚠️ Partial | Density tiers documented honestly ✅; README Button Sizes table still says SM=28px vs tokens/`--h-sm`=24px |
| §6/4.0.4 | README shortcut table stale | ⚠️ Partial | Ctrl+⇧R fixed ✅; still lists `Ctrl+P` — demo binds **Ctrl+⇧P** |

---

## 4. New findings in v3

### 4.1 ➕🔴 Uncommitted tokens.css deletion — see §1.2
Breaks demo components, kills manual theming, fails the repo's own validator (2 errors) and CI. Decision required before commit.

### 4.2 ➕🔴 index.html giant icons — see §1.3
icons.css never linked; 6 SVGs render at 300×150px; nav brand row verified 150px tall.

### 4.3 ➕🟠 `CACHE_NAME` never bumped + JS gate can't fail
Two halves of the same theme — the safety mechanisms don't fire:
- `sw.js` `CACHE_NAME = 'reese-ds-v1.2'` is unchanged across all 8 fix commits. HTML is network-first now, but **CSS is cache-first**: a returning visitor gets fresh HTML referencing behaviors whose CSS is served from a stale cache. Every tokens.css fix since the SW first registered has been invisible to returning visitors.
- CI JS-syntax step always "warns," never fails (§1.4; reproduced locally).
- Bonus edge: `sw.js`'s asset-fetch `.catch(() => {})` returns `undefined` into `respondWith` → TypeError instead of a clean failure when offline and uncached.

### 4.4 ➕🟠 Orphaned CSS declarations kill two rules in demo.html
`demo.html:96` and `:160` each contain a bare `background:…;color:…` pair at style-sheet top level (leftovers where a selector was deleted — commit `3888bc1` "fix orphaned rule" removed one instance but created/left these). Per CSS error recovery, a bare declaration is parsed as an invalid selector prelude that **consumes the next `{…}` block**, so each orphan kills the rule after it:
- Line 96 swallows **`.tree-indent`** (line 97) — tree indentation styling dead.
- Line 160 swallows **`.toggle.on`** (line 161) — the demo's own inline toggle-on style dead; `.toggle.on::after` (line 162) survives, so in the *working tree* (tokens.css `.toggle` deleted) a toggled-on switch shows the knob move with no track color change.

### 4.5 🟡 Demo logic bugs (script now alive, so these are now reachable)
- **Undo system misbehaves** (`demo.html:1000-1011`): the unit-toggle undo closure calls the *wrapped* `toggleUnit()` (not the original), so undoing re-enters the wrapper — pushing a spurious new undo entry and clearing `redoStack`. Undo→redo of a unit toggle doesn't round-trip. `wasDisplay` is captured and never used.
- **Tooltip data holes** (TIPS object, `demo.html:523-583`): `arc` has no `desc` → tooltip renders literal "undefined" (verified live); toolbar has `data-tip="circle"` (`demo.html:312`) but no `circle` key → no tooltip at all.
- **Onboarding step targets `.alert.ai`**, a selector that matches nothing in the page.

### 4.6 🟡 index.html residual gaps (all verified live)
- 8 action cards, 0 focusable; `copySnippet` (`index.html:2266`) still has 0 callers — two v1-era items still open.
- Duplicated, unrevealable skip links (§3 matrix).
- 17 ⌘ glyphs on Windows.

### 4.7 🔵 Minor
- README File Structure omits icons.css, icons.svg, package.json, scripts/, sw.js, WEB-DFM-GUIDE.md, AUDIT-v2.md — and describes tokens.css as "tokens + components," false in the working tree.
- README "New Features" still documents Tabs via the deleted `switchTab`, "Full light theme with 40+ CSS overrides," and Loading States (`.spinner`/`.skeleton`/`.loading-bar`) — all false against the working tree.
- Checklist still says "copy from Quick Start" (Quick Start now just links tokens.css).
- Icon sprite still duplicated (inline in demo.html + icons.svg).
- demo.html re-declares `.btn`/`.toggle`/`.kbd`/`.status-dot` inline — accidental insurance today (it's why the demo half-survives the working tree), drift risk long-term.

---

## 5. Browser verification log (2026-07-09, Chromium preview, Windows)

| Check | Result |
|---|---|
| index.html script parses / console errors | ✅ parses, **0 errors** |
| demo.html script parses / console errors | ✅ parses, **0 errors** |
| index: Ctrl+K opens palette / arrow-nav / Escape | ✅ / ✅ / ✅ |
| index: `--ink-muted` / `--code-data-dim` computed | ✅ `#6b7088` / ✅ `#ff6baa22` (tokens.css wins) |
| index: `svg.icon` rendered size | ❌ **300×150px** (×6); nav brand row 150px tall |
| index: skip-link `top` on focus | ❌ stays `-100px` (never revealed; duplicated) |
| index: `<h1>` count / color cards / ⌘ glyphs | ❌ 0 / ❌ 12 (no Indigo) / ❌ 17 |
| index: action cards focusable | ❌ 0 of 8 |
| demo: tooltips render / clamp | ✅ (but `arc` → literal "undefined"; `circle` → none) |
| demo: coords readout / unit toggle / persistence | ✅ / ✅ / ✅ |
| demo: toggle click & Enter/Space → aria-checked sync | ✅ / ✅ |
| demo: platform-aware kbd (Ctrl on Windows) | ✅ |
| demo (working tree): theme toggle | ❌ glyph flips, page unchanged (html.light deleted) |
| demo (working tree): alerts / pills / spinner | ❌ unstyled — transparent, no border, no animation |
| OS-light emulation (reload with emulation active) | ✅ auto-light works; force-dark still impossible |
| `node scripts/validate.js` (working tree) | ❌ **FAILS, 2 errors** (missing keyframes; missing component classes) — correct behavior |
| CI JS-syntax step (reproduced locally) | ❌ always "warns", exit 0 — **cannot fail** |

---

## 6. Recommendations (ordered)

1. **Decide the tokens.css split before committing anything.** Two valid paths: (a) revert the working-tree change; or (b) finish the extraction — move the component layer to a new `components.css`, link it from demo.html (and index.html), update validate.js's keyframe/component checks to point at the new file, update README's File Structure and "single source of truth" language, and bump the SW cache. Committing the deletion as-is ships a broken demo and a red CI.
2. **Link icons.css from index.html** — one line, fixes the 300×150 icons.
3. **Fix the CI JS-syntax step** so it can fail: extract script bodies *without* the tag lines (e.g. `sed -n '/<script>/,/<\/script>/p' | sed '1d;$d'`, or an awk/node extractor), drop the `|| echo`, and prove it works by temporarily introducing a syntax error. A gate that has never been seen red is untested.
4. **Bump `CACHE_NAME`** (and adopt a convention: bump on every asset change, or switch CSS to stale-while-revalidate). Fix the `.catch(() => {})` → return `Response.error()` or a fallback.
5. **Remove the two orphaned declaration pairs** (`demo.html:96`, `:160`) to resurrect `.tree-indent` and `.toggle.on`.
6. Close the reachable demo logic bugs: undo wrapper re-entrancy, `arc` desc, `circle` tip, onboarding `.alert.ai` target.
7. Finish the index.html accessibility backlog: real single skip link with a `:focus` reveal, an `<h1>`, focusable action cards (or `<button>`s), platform-aware kbd glyphs (port the demo's 5-line replacement), add the Process Indigo card and reconcile all five 12-vs-13 statements.
8. Reconcile README: Ctrl+⇧P, Button Sizes SM=24px, delete or reinstate Tabs/Loading/light-theme claims per the §6.1 decision, complete File Structure.

---

## 7. Summary

The 2026-07-09 commits are the first remediation round that was verifiably **tested in a browser**: both pages parse, run, and pass live checks that v1.2 failed catastrophically, and the rewritten validator caught a real regression on its first outing. Three things keep v3 from being a clean bill: an **uncommitted tokens.css deletion** that re-breaks the demo and theming (and correctly fails the project's own gates — decision needed, not just a fix), a **new visual break** in index.html from a never-linked icons.css, and a **JS CI gate that can never fail** — the one check meant to prevent a v2 recurrence. The long tail (12-vs-13, h1/skip-link, action cards, ⌘ glyphs, README drift) is unchanged from v2.

| Severity | Count | Themes |
|---|---|---|
| 🔴 Critical | 2 | Uncommitted tokens.css gutting (breaks demo + theming, fails own validator); index.html giant icons (icons.css never linked) |
| 🟠 High | 2 | JS CI gate can never fail; SW cache never bumped (returning visitors pinned to stale CSS) |
| 🟡 Medium | ~7 | Orphaned CSS killing `.tree-indent`/`.toggle.on`; undo re-entrancy; tooltip data holes; skip-link broken+duplicated; action cards unfocusable; 12-vs-13 ×5; README phantom docs |
| 🔵 Low | ~5 | File Structure stale, icon sprite duplicated, checklist stale, demo inline CSS duplication, onboarding dead target |

**One-line verdict:** the committed tree finally works — don't commit the working tree until the component layer has a home, and don't trust the JS gate until you've seen it fail.
