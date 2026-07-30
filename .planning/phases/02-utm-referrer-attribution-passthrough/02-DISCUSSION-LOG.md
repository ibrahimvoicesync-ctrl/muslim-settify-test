# Phase 2: UTM/Referrer Attribution Passthrough - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-30
**Phase:** 2-UTM/Referrer Attribution Passthrough
**Areas discussed:** CTA render-site accuracy, capture scope/persistence, shared allowlist module, referrer key naming, tab-behavior scope check
**Mode:** User instructed "you decide everything" — treated as autonomous mode. No AskUserQuestion calls made; all areas below were auto-resolved and logged for audit per the auto-mode contract.

---

## CTA render-site accuracy (cta.tsx dead code)

| Option | Description | Selected |
|--------|-------------|----------|
| Trust REQUIREMENTS.md's "5 locations" literally, wire up `cta.tsx` too | Matches the doc text exactly | |
| Verify against actual render tree, exclude anything not imported by a route | Codebase scout found `cta.tsx` has zero imports anywhere — same dead-code class as `application.tsx`, which PROJECT.md explicitly excludes | ✓ |

**Selected:** Exclude `cta.tsx`. Real sites: `hero.tsx`, `navbar.tsx` (×2 buttons), `apply-cta.tsx` = 4 files, 5 buttons.
**Notes:** Flagged as a requirements-doc correction, not silently dropped — see CONTEXT.md D-01.

---

## Capture scope: single global capture vs. per-page independent capture

| Option | Description | Selected |
|--------|-------------|----------|
| Capture once on `/`, thread through client-side state/cookies to other pages | Would fully solve "More Success" nav losing attribution, but requires a persistence mechanism | |
| Capture independently on every page that renders an Apply CTA (`/` and `/more-success`), no forwarding on internal nav links | Stateless, matches ATTR-08's explicit v1 exclusion of cookie/multi-touch persistence; each page's own request supplies its own UTM/Referer | ✓ |

**Selected:** Per-page independent capture (D-02).
**Notes:** Resolves the STATE.md-flagged "Referrer ambiguity" blocker — internal navigation naturally yields an empty/internal Referer on the second page, which is accepted behavior under ATTR-04, not a defect.

---

## Shared capture/allowlist implementation shape

| Option | Description | Selected |
|--------|-------------|----------|
| Duplicate the allowlist + filter logic separately in each of the 3 read sites | Faster to write, higher drift risk | |
| Single `lib/attribution.ts` module, reused by `app/page.tsx`, `app/more-success/page.tsx`, and `app/apply/page.tsx` | Matches existing `lib/[helper-name].ts` convention (`lib/utils.ts`); one source of truth for the 6-key allowlist used on both the capture side and the redirect side | ✓ |

**Selected:** Single shared module (D-03).

---

## Claude's Discretion

- Internal function/variable naming inside `lib/attribution.ts`
- Whether attribution is passed to client components as a pre-built query string or a plain object
- Whether `searchParams`/`headers()` usage triggers explicit vs. implicit dynamic-rendering opt-in on the two page files

## Deferred Ideas

None new. Existing v2 backlog (ATTR-06 through ATTR-10) already tracked in `.planning/REQUIREMENTS.md`, unchanged by this discussion.
