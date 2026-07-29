# Project Research Summary

**Project:** muslim-settify-test (multi-brand Next.js apply-redirect site)
**Domain:** Multi-tenant Next.js/Vercel host routing + Vercel multi-project deployment + Typeform URL-parameter lead-source attribution
**Researched:** 2026-07-29
**Confidence:** HIGH

## Executive Summary

This milestone has two tightly coupled parts: (1) deploying a 4th brand as an independent Vercel Project on the same repository, and (2) adding UTM/referrer attribution passthrough to the shared `/apply` server-redirect flow so leads carry their marketing source into Typeform. Both are achievable entirely with the tools already in place -- no new npm dependencies, no new services, no new architecture. The 4th brand follows the exact existing pattern (new Vercel Project -> same repo -> new Production Branch -> own domain -> new `if` branch in `resolveTypeformUrl`), and attribution passthrough is a small, additive change to the same `app/apply/page.tsx` Server Component that already awaits `headers()` -- just add `await searchParams`, read the `Referer` header, and build the outbound URL with `URL`/`URLSearchParams` before calling the existing `redirect()`.

The recommended approach is deliberately conservative: keep all new code inside `app/apply/page.tsx` (the only file the `check-no-direct-typeform.mjs` build guard allowlists), use an explicit allowlist of forwarded param names rather than a passthrough of all query params, and treat attribution as a pure, stateless, server-side transform with no cookies, no client JS, and no new data store. Typeform's own Hidden Fields mechanism (not the paid native UTM Tracking toggle) is the correct free-tier delivery mechanism, but it has a hard, silent-failure prerequisite: the new Typeform's hidden field names must exactly (case-sensitively) match the forwarded param names, or values vanish with no error.

The key risks are non-code and easy to miss: (a) the existing redirect logic reads no query params at all today, so attribution must be added to the *shared* function used by all 4 brands, not scoped only to the new brand; (b) "referrer" is ambiguous -- the `Referer` HTTP header at `/apply` reflects internal same-site navigation, not the true external traffic source, so this needs an explicit product decision; (c) Vercel's new-project defaults (Production Branch = `main`, empty env vars) actively work against the intended one-repo/N-branches/N-domains pattern and must be explicitly reconfigured; and (d) every "looks done" check must include a real Typeform Results table submission and a live production `/apply` hit -- build success and correct-looking code are not sufficient verification.

## Key Findings

### Recommended Stack

No new frameworks, libraries, or paid tools are required. Everything is achieved with Next.js 16 built-ins (`headers()`, `searchParams` page prop -- both async/awaited, consistent with the existing codebase pattern), the native `URL`/`URLSearchParams` Web APIs, the existing `redirect()` call, and Vercel's native multi-project-per-repo Git integration (new Project -> same repo -> Production Branch set explicitly -> own custom domain).

**Core technologies:**
- Vercel Git integration (multi-project) -- deploy the 4th brand as an independent Project pointed at the same repo -- this is Vercel's officially supported pattern, already used for the existing 3 brands
- `next/headers` `headers()` (already imported) -- read `Referer` header server-side, same call site already used for `Host` detection
- `searchParams` page prop (Promise-based in Next.js 15+) -- read incoming UTM query params in the existing async `ApplyPage()` component
- `URL`/`URLSearchParams` (native Web API) -- build the outbound Typeform redirect URL with correctly encoded attribution params, avoiding manual string concatenation bugs

### Expected Features

Lead-source attribution here means: capture the 5 standard UTM params + best-effort `Referer`, forward them as Typeform Hidden Field query params on the redirect, with an explicit allowlist and graceful degradation when absent. The single biggest risk of silent failure is non-code: Typeform's Hidden Fields must be pre-created in the new form's builder with exact, case-sensitive matching names, or values are dropped with zero error signal anywhere.

**Must have (table stakes):**
- Capture the 5 UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) from the incoming request
- Forward them as Typeform Hidden Field query params via the redirect `Location`
- Pre-create matching Hidden Fields in the new Typeform with exact lowercase/underscore names
- Best-effort `Referer` header capture as a `referrer` field
- Explicit allowlist of forwarded params (never blind passthrough)
- Resolve the open question of whether ad traffic lands on `/` or `/apply` directly (determines whether the homepage CTA link also needs to forward query strings)
- Manual test-submission verification against the actual Typeform Results table

**Should have (competitive, not required for v1):**
- Ad-platform click ID capture (`gclid`, `fbclid`) -- cheap extension of the same allowlist mechanism
- `landing_page` hidden field for full path/URL context

**Defer (v2+):**
- Cookie-based first-touch/multi-session attribution persistence
- Typeform's native paid UTM Tracking toggle
- Any cross-domain analytics/GA4/GTM session linking (explicitly out of scope per PROJECT.md)

### Architecture Approach

Both new capabilities layer additively onto the existing single-file, host-routed Server Component redirect in `app/apply/page.tsx` -- no new routes, no new modules, no client-side code. Attribution capture and host resolution must remain two independently composed concerns (`resolveTypeformUrl(host)` untouched in signature; a new `withAttribution(baseUrl, params, referer)` composed around it in `ApplyPage()`), so the 4th-domain diff and the attribution diff stay independently reviewable and low-risk.

**Major components:**
1. `resolveTypeformUrl(host)` -- unchanged contract, gets one new `if` branch for the 4th brand (same three-tier match shape as the existing 3)
2. `readAttribution()` / inline logic -- new: reads `searchParams` (UTM params) and `headers().get("referer")`, both already-awaited APIs in this file
3. `withAttribution(baseUrl, attribution)` -- new: pure function building the final redirect URL via `URL`/`URLSearchParams`, called from `ApplyPage()` only inside the existing `if (resolved)` branch

### Critical Pitfalls

1. **Attribution logic only added for the new brand's code path, not the shared redirect function** -- since `/apply` currently reads zero query params for any brand, the fix must touch the one shared function all 4 brands pass through; verify all 4 brands' redirects still work correctly after the change, not just the new one.
2. **New brand's host substring collides with an existing brand's `.includes()` match** -- list all 4 domain slugs side-by-side before adding the 4th `if` branch; prefer exact-match/`.endsWith()` and place any `.includes()` fallback last in the chain.
3. **"Referrer" ambiguity** -- the `Referer` header at `/apply` reflects internal same-site navigation, not true external traffic source; must be explicitly scoped with stakeholders before implementation, since the two require different capture points (server header vs. landing-page client capture).
4. **Typeform Hidden Field name mismatch** -- exact, case-sensitive match required between forwarded param names and Typeform's configured hidden fields; failures are silent (no error, just missing data) -- must verify against the actual Typeform Results table, not just the redirect Location header.
5. **Vercel new-project defaults fight the intended pattern** -- Production Branch defaults to `main`, domains default-bind to the default branch, and env vars start empty and don't carry over from other projects on the same repo -- all three must be explicitly reconfigured and verified live, not assumed.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: 4th Brand Vercel Project & Host Routing
**Rationale:** Infrastructure must exist before attribution passthrough can be tested end-to-end on all 4 brands; also isolates the host-substring-collision and Vercel-misconfiguration risks into one reviewable, low-risk change.
**Delivers:** New Vercel Project (same repo, new branch, explicit Production Branch setting, own domain, own env vars), plus one new `if` branch in `resolveTypeformUrl` for the 4th brand's host(s).
**Addresses:** Table-stakes requirement that the new brand deploys and resolves to its own Typeform, following the existing host-routing pattern.
**Avoids:** Pitfall 1 (host substring collision), Pitfall 5 (Vercel branch/domain default misconfig), Pitfall 6 (missing env vars on new project).

### Phase 2: UTM/Referrer Attribution Passthrough
**Rationale:** Comes after (or in parallel with, but merges after) Phase 1 so it can be tested against all 4 live brands at once; this is a shared-code change (`ApplyPage()`), not brand-specific, so it should be scoped and reviewed independently of the new-domain diff.
**Delivers:** `readAttribution()`/`withAttribution()` additions to `app/apply/page.tsx`, reading `searchParams` + `Referer` header and appending an explicit allowlist of UTM + referrer params onto the outbound Typeform redirect URL via `URL`/`URLSearchParams`.
**Uses:** `next/headers` `headers()`, `searchParams` page prop, native `URL`/`URLSearchParams`, existing `redirect()`.
**Implements:** Architecture Pattern 1 (server-side-only capture) and Pattern 2 (additive URL merge, not string concatenation).

### Phase 3: Typeform Hidden Field Configuration & End-to-End Verification
**Rationale:** This is a non-code, out-of-repo prerequisite that the code in Phase 2 depends on but cannot itself verify -- must be its own explicit phase/checklist so it isn't silently skipped as "someone else's job."
**Delivers:** New Typeform's Hidden Fields created with exact-matching lowercase/underscore names (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer`); a real test submission through the live redirect URL confirming values land correctly in Typeform's Results table on all 4 brands.
**Addresses:** The "must-verify against Typeform Results, not just the redirect URL" table-stakes requirement.
**Avoids:** Pitfall 4 (Typeform hidden field name mismatch -- Typeform's single most common silent-failure mode).

### Phase Ordering Rationale

- Infrastructure (Phase 1) must land before attribution (Phase 2) can be meaningfully tested across all 4 brands -- testing attribution requires 4 live, correctly-routed domains.
- Attribution code (Phase 2) and Typeform-side configuration (Phase 3) are two different surfaces edited by potentially different people at different times; keeping them as distinct, explicitly-sequenced phases (with Phase 3 depending on Phase 2's exact param name list) directly targets Pitfall 4, the highest-risk silent failure mode in this research.
- Every phase's "done" definition must include a live-URL check (production `/apply` hit, and for Phase 3, an actual Typeform Results table row) rather than a green build -- this is the single strongest theme across PITFALLS.md's "Looks Done But Isn't" checklist.

### Research Flags

Phases likely needing deeper research during planning:
- **None strongly flagged.** All 4 research files converge on HIGH/MEDIUM confidence with primary-source verification (official Vercel docs, official Next.js docs read directly, the actual codebase read directly). The one genuinely open question -- whether ad traffic lands on `/` or `/apply` directly, which determines if the homepage CTA also needs query-string forwarding -- is a stakeholder/product decision, not a research gap, and should be resolved during phase discussion/planning rather than via further technical research.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Vercel project/host routing):** Directly evidenced by the existing 3-brand pattern already in the codebase; well-documented in official Vercel docs.
- **Phase 2 (attribution passthrough):** Directly evidenced by the existing `headers()` usage in the same file; official Next.js docs confirm the async `searchParams` contract.
- **Phase 3 (Typeform config/verification):** Procedural/manual, well-documented in Typeform's official help center.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified directly against official Vercel and Next.js 16 docs, plus the actual current codebase (`app/apply/page.tsx`) -- no new dependencies needed, all APIs already in use or documented as stable. |
| Features | MEDIUM | Typeform's exact behavior for the non-embedded (redirect-only) case had to be triangulated across official help articles, developer docs, and community threads rather than one authoritative source; core mechanism (Hidden Fields via query string) is solidly corroborated. |
| Architecture | HIGH | Derived directly from reading the current `app/apply/page.tsx` and `scripts/check-no-direct-typeform.mjs` source; recommendations are additive extensions of code already in place, not speculative design. |
| Pitfalls | MEDIUM | Corroborated across official Vercel/Typeform docs plus community/GitHub issue reports; no project-specific incident history exists yet since the 4th brand and attribution passthrough are both greenfield for this codebase. |

**Overall confidence:** HIGH

### Gaps to Address

- **Homepage vs. `/apply` landing page:** Whether marketing/ad destination URLs point at the bare homepage or directly at `/apply` changes whether one file or two files need edits (homepage CTA link may need to forward its own query string). Must be confirmed with whoever configures ad destination URLs before or during Phase 2 planning.
- **Definition of "referrer":** Whether the requirement means true external traffic source (needs landing-page-time client capture, a bigger change) or simply the internal page the Apply button was clicked from (server `Referer` header suffices, matches current recommendation). Must be explicitly clarified with stakeholders before Phase 2 implementation.
- **Typeform plan tier:** Whether the team is already on a Typeform plan that includes native paid UTM Tracking is unconfirmed; irrelevant to v1 since the free Hidden Fields mechanism is the recommended primary path regardless, but worth noting as a possible future consolidation.

## Sources

### Primary (HIGH confidence)
- https://vercel.com/docs/git -- official Vercel docs, multi-project-per-repo, Production Branch configuration
- https://nextjs.org/docs/app/api-reference/functions/headers -- official Next.js 16.2.12 docs, async `headers()` contract
- `app/apply/page.tsx`, `scripts/check-no-direct-typeform.mjs` (repo, read directly) -- ground truth for current implementation and build guard behavior
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONCERNS.md` -- curated internal codebase mapping

### Secondary (MEDIUM confidence)
- https://help.typeform.com/hc/en-us/articles/360052676612-Using-URL-parameters-formerly-Hidden-Fields -- official Typeform help center, URL parameter/hidden field mechanism
- https://www.typeform.com/developers/create/url-parameters/ -- official Typeform developer docs
- Typeform Community threads (Phoebe VA staff guidance on `?` vs `#` syntax; hidden field exact-match behavior) -- official-staff-corroborated community sources
- Vercel KB/GitHub discussions on domain-to-branch assignment and environment variable scoping -- official docs cross-checked with maintainer/community threads

### Tertiary (LOW confidence)
- Attributer.io and ceaksan.com blog posts on Typeform UTM capture patterns -- third-party framing, used only to corroborate, not as primary basis for recommendations
- Single community reports on Typeform UTM/hidden-field edge cases (e.g. "numerical only" claim, disregarded as stale/contradicted by official docs)

---
*Research completed: 2026-07-29*
*Ready for roadmap: yes*
