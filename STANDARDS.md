# Reese Design System — STANDARDS.md

> Authoritative standards declaration for `Design-System/`. This is the root
> governance gate for the project, per the fleet-wide rule that every project
> build carried through Hermes identifies the applicable system, industry, and
> process standards, names the ideal framework, and a verifiable gate.
>
> These are the standards the Design System itself must satisfy — and, because
> this project defines the cross-project UI standard, the floors here are the
> contract every adopting project (AI CAM 3.0, Deepnest, Web DFM, Evolution
> Engine, Foundry Manager, reesecnc.com) inherits.
>
> Baseline: v1.3.1 · Last verified: 2026-08-19

---

## 1. Standards inventory

| Standard | Ideal framework / mechanism | Rationale |
|----------|------------------------------|-----------|
| **Token governance** | Single source of truth `tokens.css`; all colors/spacing/radii/type/component styles defined as `--*` CSS custom properties. Never inline divergent copies. | One authoritative token layer prevents drift across projects and guarantees a consistent look. |
| **WCAG 2.2 AA** | 13 semantic color pairs meet AA contrast (4.5:1 text, 3:1 large/UI). Enforced conceptually by hex baseline ratchet. | Every UI this system skins must be usable by users with low vision. |
| **Accessibility (interactive)** | `:focus-visible` focus rings on all interactive elements; ARIA roles (`role="checkbox"`, `radiogroup`, `tablist`, `dialog`/`alertdialog`, `switch`); roving tabindex; modal focus trap + return focus. | Keyboard-first, screen-reader-correct UI — mandated by the utilitarian goal. |
| **Reduced motion** | `prefers-reduced-motion` honored — disable/attenuate animations. | Vestibular safety; WCAG 2.3.3 / 2.2.2. |
| **Color integrity** | No invalid hex; no token drift (every `var()` ref defined; classes match usage); hardcoded hex kept ≤ committed baseline (`scripts/hex-baseline.json`). | Prevents silent visual regressions and color accidents. |
| **Versioning** | `package.json` version is canonical; every user-facing string (`index.html`, `demo.html`, `README.md` header/footer) must match it. | Recognized drift class (AUDIT-v6 §9); protects consumers pinning a version. |
| **Component rendering** | Every class in `tokens.css` must have ≥1 live, keyboard-operable example rendered in `index.html` or `demo.html` (functional, not just CSS). | Closing the "documented but never rendered" gap. |
| **Distribution** | `npm` package manifest (`package.json`, `main: tokens.css`, whitelisted `files`), published/consumable. | Adoption path for downstream projects. |
| **CI** | `.github/workflows/ci.yml` green before merge. | Enforces all above mechanically on every change. |

## 2. Baseline floors (must hold, no exception)

- **Zero** critical and **zero** high findings in any audit pass.
- **100% green CI** before merge (`node scripts/validate.js` exit 0 + structure + JS syntax + a11y checks).
- **WCAG 2.2 AA** where UI applies (all interactive components).
- **Lint/format clean** on all committed files (validator is the lint gate for CSS/HTML; JS run through `node --check` in CI).
- **Version string consistency**: `package.json` ↔ `index.html` ↔ `demo.html` ↔ `README.md` header/footer always match.
- **Hex ratchet**: never add a hardcoded hex above the committed baseline; always add new colors as tokens.

## 3. Verification gates (command / rule)

| Gate | Command / rule | Pass condition |
|------|----------------|----------------|
| Token + color validation | `node scripts/validate.js` | **0 errors, 0 warnings** (drift, invalid hex, undefined refs, hex ratchet, focus-visible, reduced-motion) |
| HTML structure | CI `for f in demo.html index.html` block | DOCTYPE + closing tags + tokens.css link + balanced `<style>` |
| JS syntax | CI `node --check` on extracted `<script>` blocks | exit 0 |
| A11y basics | CI grep for `:focus-visible`, `prefers-reduced-motion`, ARIA attrs | all present in tokens.css + both pages |
| Component rendering | Audit sweep (regex class-def vs class-usage) | every documented component has a live example (AUDIT-v6 method) |
| Version pin | `grep` package.json ↔ page/README headers | identical |

## 4. Adoption contract (for consuming projects)

A project claims this system as its UI standard only when it:
1. Links/imports a **single** copy of the Design System tokens (not a divergent fork; use the published package or a pinned submodule), and
2. Substitutes its own hardcoded color/spacing/typography literals with the `--*` tokens, and
3. Passes the same `:focus-visible` + `prefers-reduced-motion` + AA-grep gates defined above.

Adoption is verified by a per-project grep for token usage (`--ds-*` / token identifiers) in source and absence of divergent duplicated `tokens.css`. Maintained in `Design-System/README.md` "Built for" list.

## 5. Known debt (open items)

- **Fleet adoption incomplete**: only AI CAM 3.0 and Foundry Manager have verified real adoption. Deepnest/Web DFM matches are in temp/brownfield copies; Evolution Engine and reesecnc.com have none. Tracked via board adoption tasks.
- **Axe-core not wired into CI yet**: current a11y gates are grep-based; a real axe-core scan (automated WCAG audit) is the future floor. See AUDIT trail.
- **No visual regression harness**: component rendering is verified functionally by hand; a browser-level screenshot diff would close the loop.
