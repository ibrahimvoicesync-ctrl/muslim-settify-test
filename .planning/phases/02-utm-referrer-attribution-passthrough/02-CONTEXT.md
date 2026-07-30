# Phase 2: UTM/Referrer Attribution Passthrough - Context

**Gathered:** 2026-07-30
**Status:** Ready for planning
**Mode:** Autonomous (`--auto`-equivalent — user requested "you decide everything"; no interactive questions asked, all gray areas resolved by Claude and logged below for audit)

<domain>
## Phase Boundary

Marketing attribution (UTM params + Referer header) is captured at landing time on every page that renders an Apply CTA, and forwarded — as an explicit allowlisted query string — onto the outbound `/apply` → Typeform redirect. No new capability, no persistence layer, no analytics platform: pure request-scoped plumbing on top of the existing host-routing redirect from Phase 1.

</domain>

<decisions>
## Implementation Decisions

### Requirement-vs-code discrepancy: `components/cta.tsx` is dead code
- **D-01:** REQUIREMENTS.md (ATTR-02) lists `components/cta.tsx` as one of "5 existing Apply CTA link locations." Codebase scout (`grep -rn "components/cta"` across `app/`, `components/`, `apps/`) found **zero imports of `cta.tsx` anywhere** — it is not rendered by any route, same class of dead code as `components/application.tsx`. The real render sites are **4 files / 5 buttons**: `components/hero.tsx` (1), `components/navbar.tsx` (2 — desktop + mobile), `components/apply-cta.tsx` (1, rendered on both `/` and `/more-success`). Decision: implement attribution passthrough on these 4 real files; skip `cta.tsx` entirely (wiring up unused code is out of scope, same rationale REQUIREMENTS.md already applies to `application.tsx`). Planner should treat "5 CTA locations" in ROADMAP/REQUIREMENTS as describing 5 *buttons* across 4 *files*, not 5 files.

### Capture scope: per-page, stateless, no cross-navigation forwarding
- **D-02:** Every page that renders an Apply CTA captures its **own** incoming UTM params + `Referer` header independently, at that page's own request time — not a single global capture on `/` that's threaded through client-side navigation. Concretely: `app/page.tsx` and `app/more-success/page.tsx` (both Server Components) each read their own `searchParams` prop + `headers()` Referer, build the allowlisted query string, and pass it down as a prop to the CTA-bearing client components they render.
- **Why:** REQUIREMENTS.md explicitly rules out cookie-based/multi-touch persistence for v1 (ATTR-08, deferred to v2) and states "stateless single-redirect capture is sufficient." Per-page independent capture satisfies every locked ATTR-01..05 requirement and the 4 ROADMAP success criteria without inventing a persistence mechanism.
- **Practical consequence (resolves the STATE.md "Referrer ambiguity" blocker):** attribution captured on `/` forwards correctly to CTAs also rendered on `/`. If a visitor navigates internally to `/more-success` (a normal `<a>` full-page nav, not a client-side route change — see D-05) and then clicks Apply there, that click's attribution reflects `/more-success`'s own incoming URL/Referer at that request (typically empty on internal nav). This is expected and acceptable per ATTR-04 ("missing values never break the redirect") — not a bug, and explicitly not something to patch with query-forwarding on internal links (that would be scope creep toward the deferred persistence problem).

### Shared allowlist + capture logic: one module, reused on both ends
- **D-03:** Single new file `lib/attribution.ts` (matches existing `lib/utils.ts` convention per CONVENTIONS.md's `lib/[helper-name].ts` pattern) holds:
  - The 6-key allowlist constant: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`
  - A capture/filter function used identically in three places: `app/page.tsx` and `app/more-success/page.tsx` (build the outbound query string from incoming `searchParams` + `Referer` header), and `app/apply/page.tsx` (re-filter its own incoming query string through the *same* allowlist before appending to the resolved Typeform URL — this is what makes ATTR-03 + ATTR-05 hold together even if someone hits `/apply?...` directly with unexpected params).
- **D-04:** The `Referer` HTTP header value is forwarded under the query param key `referrer` (double-r, lowercase) — matches TYPE-02's exact Hidden Field naming in REQUIREMENTS.md. No other key transformation.

### Unrelated to this phase — explicitly left alone
- **D-05:** `AnimatedButton`'s existing `target="_blank" rel="noopener noreferrer"` behavior (Apply links currently open in a new tab via a plain `<a href>`, not `next/link`) stays unchanged. Not part of this phase's scope, and it's actually why per-page Referer capture works cleanly — each Apply click is effectively a fresh top-level navigation, not an SPA route change.

### Claude's Discretion
- Exact function/variable names inside `lib/attribution.ts`, and whether the computed value is passed down as a pre-built query string or a plain object for the CTA components to serialize — left to planner/executor, no user preference expressed.
- Whether `app/page.tsx` / `app/more-success/page.tsx` opt into dynamic rendering explicitly or implicitly via using `searchParams`/`headers()` — implementation detail, not a product decision.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked requirements (this phase)
- `.planning/REQUIREMENTS.md` §"Attribution Capture & Forwarding" — ATTR-01 through ATTR-05, the binding spec for this phase (no formal SPEC.md exists for Phase 2; REQUIREMENTS.md is the closest locked source and should be treated as such)
- `.planning/ROADMAP.md` §"Phase 2: UTM/Referrer Attribution Passthrough" — goal + 4 success criteria
- `.planning/PROJECT.md` — milestone-level constraints (no new frameworks, no regression to existing 3 brands, no in-repo datastore)
- `.planning/STATE.md` §"Blockers/Concerns" — the two open questions this discussion resolved (ad-landing-page assumption, Referrer definition ambiguity)

### Codebase maps
- `.planning/codebase/ARCHITECTURE.md` — Apply Flow data-flow section, Server/Client component split
- `.planning/codebase/INTEGRATIONS.md` — existing Typeform URL mapping, env var fallback pattern
- `.planning/codebase/CONVENTIONS.md` — `lib/[helper-name].ts` pattern, naming conventions

### Files this phase touches
- `app/apply/page.tsx` — existing host-routing + redirect logic; extend to append allowlisted params onto the resolved Typeform URL
- `app/page.tsx` — homepage Server Component; needs to read `searchParams` + `headers()` and pass attribution down
- `app/more-success/page.tsx` — same treatment (it also renders `ApplyCTA`)
- `components/hero.tsx`, `components/navbar.tsx`, `components/apply-cta.tsx` — the 4 real files with 5 Apply buttons needing dynamic `/apply?...` hrefs
- `components/ui/animated-button.tsx` — already accepts an `href` prop; no change needed to this file itself, just what callers pass in
- `components/cta.tsx` — confirmed unused (D-01); do not modify
- `lib/utils.ts` — existing `lib/` convention to mirror for the new `lib/attribution.ts`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AnimatedButton` (`components/ui/animated-button.tsx`) already takes an `href` prop and renders a plain `<a>` — no structural change needed, callers just need to compute a dynamic href instead of the current static `"/apply"` string
- `lib/utils.ts`'s `cn()` helper establishes the `lib/[helper-name].ts` pattern to follow for the new attribution module

### Established Patterns
- Server Components own request-scoped data: `app/apply/page.tsx` already calls `headers()` server-side for host detection — same pattern extends naturally to reading `Referer` there and in the two page-level captures
- Client components stay presentational and receive data via props — no global state manager exists (confirmed in ARCHITECTURE.md), so attribution flows down as props, not context/store
- UPPERCASE_WITH_UNDERSCORES for module-level constants (matches the allowlist constant naming)

### Integration Points
- `app/page.tsx` and `app/more-success/page.tsx`: currently prop-less Server Components (no `searchParams`, no `headers()` calls) — both need to opt into reading request data and pass a computed attribution value down to `Navbar`, `Hero`, `ApplyCTA`
- `app/apply/page.tsx`'s `resolveTypeformUrl()` returns a bare URL string today; the redirect call needs to append the filtered query params before calling `redirect()`

</code_context>

<specifics>
## Specific Ideas

No particular visual/UX requirements — this phase is pure plumbing (query param capture and forwarding), no copy or design changes per PROJECT.md's Out of Scope section.

</specifics>

<deferred>
## Deferred Ideas

None new from this discussion. Already-tracked v2 deferrals (unchanged, see `.planning/REQUIREMENTS.md` §"v2 Requirements"): `gclid`/`fbclid` capture (ATTR-06), `landing_page` hidden field (ATTR-07), cookie-based multi-touch persistence (ATTR-08), Typeform's native paid UTM Tracking toggle (ATTR-09), cross-domain GA4/GTM linking (ATTR-10).

### Reviewed Todos (not folded)
None — `todo.match-phase` query for Phase 2 returned zero matches.

</deferred>

---

*Phase: 2-UTM/Referrer Attribution Passthrough*
*Context gathered: 2026-07-30*
