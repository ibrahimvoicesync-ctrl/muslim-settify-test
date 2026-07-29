# Phase 1: 4th Brand Deployment & Host Routing - Context

**Gathered:** 2026-07-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the 4th brand (`h.muslimsettify.com`) as an independently deployed Vercel project — its own branch, domain, and env vars — that resolves through the same `resolveTypeformUrl` host-routing pattern in `app/apply/page.tsx` as the existing 3 brands, with zero regression to `muslimsettify.com`, `settifyowtp.com`, `settifyhaqqan.com`. Covers BRAND-01, BRAND-02, BRAND-03 only — no attribution logic (Phase 2) and no real Typeform creation (Phase 3).

User delegated all implementation gray areas ("you decide") — decisions below are Claude's calls, made for consistency with existing codebase conventions and to keep Phase 3 a low-risk follow-up.

</domain>

<decisions>
## Implementation Decisions

### New Typeform URL before Phase 3 exists
- **D-01:** Add a new hardcoded constant `H_MUSLIMSETTIFY_TYPEFORM_URL` in `app/apply/page.tsx`, following the exact same pattern as `MUSLIMSETTIFY_TYPEFORM_URL` / `SETTIFYOWTP_TYPEFORM_URL` / `SETTIFYHAQQAN_TYPEFORM_URL` — not env-var-driven. Matches existing codebase convention (all 3 brand URLs are hardcoded, not env vars) and keeps host-resolution logic uniform.
- **D-02:** Value is a clearly-marked placeholder (e.g. `"https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY"`) until Phase 3 creates the real Typeform and swaps in the real ID. This is a one-line, low-risk edit deferred to Phase 3 — do not block Phase 1 on Typeform creation.

### Host resolution placement
- **D-03:** Add an exact-match (plus safe subdomain) check for `h.muslimsettify.com` in `resolveTypeformUrl`, placed **before** the existing `.endsWith(".muslimsettify.com")` block — required because `h.muslimsettify.com` would otherwise incorrectly match the parent brand's fallback (per REQUIREMENTS BRAND-02, already locked).
- **D-04:** Existing 3 brands' logic in `resolveTypeformUrl` is untouched except for insertion order — no rewriting of existing conditionals.

### Vercel project / branch / domain
- **D-05:** New git branch name: `h-muslimsettify` (short, maps directly to the subdomain, easy to identify in the Vercel dashboard). Branches off `main` per PROJECT.md's locked decision.
- **D-06:** Vercel project creation, branch tracking, custom domain (`h.muslimsettify.com`) attachment, and DNS records are in scope for Phase 1 (per ROADMAP Phase 1 success criteria #4) but require the user's Vercel account/DNS registrar access — Claude will produce exact `vercel` CLI commands and step-by-step instructions (CLI is installed locally, not yet linked to a project) rather than assuming it can execute account-level/DNS actions autonomously. Treat as a guided manual step during execution, not something to skip.
- **D-07:** `TYPEFORM_URL` env var fallback mechanism (existing, generic, used for unmatched hosts) is left as-is — the new brand does NOT rely on it, since it gets its own explicit host-resolution branch (D-01/D-03).

### Claude's Discretion
User answered "you decide" for all discussion areas (Typeform placeholder strategy, deploy execution ownership, branch naming, domain/DNS readiness) rather than picking through each individually. All decisions above (D-01 through D-07) are Claude's calls made on that basis — flagged here in case the user wants to override any of them before planning.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — BRAND-01, BRAND-02, BRAND-03 (locked v1 requirements for this phase)
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, dependencies
- `.planning/PROJECT.md` — Key Decisions table (host-routing pattern, Vercel-per-brand, branch-off-main)

### Codebase maps
- `.planning/codebase/ARCHITECTURE.md` — host-routing architecture
- `.planning/codebase/CONVENTIONS.md` — hardcoded-constant pattern for brand Typeform URLs
- `.planning/codebase/STRUCTURE.md` — file layout
- `.planning/codebase/INTEGRATIONS.md` — Typeform integration points
- `.planning/codebase/CONCERNS.md` — known gaps (no tests, no analytics)

### Code touched by this phase
- `app/apply/page.tsx` — `resolveTypeformUrl`, host-matching logic to extend
- `scripts/check-no-direct-typeform.mjs` — prebuild guard that must keep passing

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `normalizeHost()` in `app/apply/page.tsx` — already lowercases/strips port, reuse as-is for the new host check.
- `resolveTypeformUrl()` — extend with one new conditional block; no new helper functions needed for a single new brand.

### Established Patterns
- Each brand = one hardcoded `..._TYPEFORM_URL` constant + one conditional block checking exact host, `.endsWith()`, and (for 2 of 3 brands) `.includes()` for Vercel preview domain flexibility. New brand should follow the exact-match + `.endsWith()` style; `.includes()` fallback optional since `h.muslimsettify.com` is a single fixed subdomain, not a fuzzy-matched slug.
- No test infrastructure exists — this phase's manual verification is "visit the URL, confirm redirect," not automated tests (per TESTING.md / PROJECT.md note).

### Integration Points
- Single integration point: the `if` chain inside `resolveTypeformUrl`. New brand's block must be inserted before the `muslimsettify.com` block per D-03.

</code_context>

<specifics>
## Specific Ideas

No specific UI/behavior requirements — this phase is pure routing/infra, no visible UI change. Open to standard approach: extend the existing conditional chain, no refactor.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Real Typeform creation and Hidden Field config explicitly deferred to Phase 3 (already scoped there in ROADMAP.md); attribution/UTM logic explicitly deferred to Phase 2.

</deferred>

---

*Phase: 1-4th-brand-deployment-host-routing*
*Context gathered: 2026-07-29*
