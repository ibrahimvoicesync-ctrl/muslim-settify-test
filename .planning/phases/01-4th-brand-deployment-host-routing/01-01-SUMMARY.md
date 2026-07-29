---
phase: 01-4th-brand-deployment-host-routing
plan: 01
subsystem: infra
tags: [nextjs, host-routing, typeform, redirect]

# Dependency graph
requires: []
provides:
  - "H_MUSLIMSETTIFY_TYPEFORM_URL constant in app/apply/page.tsx"
  - "Exact-match host branch for h.muslimsettify.com, first check in resolveTypeformUrl"
  - "Behavioral proof (local curl probes) that all four brands plus the parent-brand subdomain canary resolve correctly"
affects: [01-02, 01-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "4th brand added as add-alongside constant + conditional block, matching the existing 3-brand convention exactly (no generalization to a table-driven map)"

key-files:
  created: []
  modified:
    - app/apply/page.tsx

key-decisions:
  - "New host branch uses strict equality (===) against h.muslimsettify.com, not substring/includes matching, to avoid false-positive matches on a single fixed subdomain"
  - "New branch placed as the first conditional in resolveTypeformUrl, ahead of the parent muslimsettify.com subdomain-suffix fallback, since h.muslimsettify.com would otherwise satisfy .endsWith('.muslimsettify.com') and be silently swallowed by the parent brand"
  - "Placeholder Typeform URL (https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY) used per D-02 — real form ID is Phase 3's responsibility"

patterns-established:
  - "Brand routing extension pattern: one UPPERCASE_SNAKE_CASE module-level constant + one strict-equality conditional block per new brand, inserted before any looser/subdomain-matching blocks for related parent domains"

requirements-completed: [BRAND-02, BRAND-03]

coverage:
  - id: D1
    description: "h.muslimsettify.com resolves to its own dedicated placeholder Typeform URL, distinct from all three existing brands (BRAND-02)"
    requirement: "BRAND-02"
    verification:
      - kind: manual_procedural
        ref: "curl -H 'Host: h.muslimsettify.com' http://127.0.0.1:3000/apply -> 307 https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY"
        status: pass
    human_judgment: false
  - id: D2
    description: "Existing three brands (muslimsettify.com, settifyowtp.com, settifyhaqqan.com) plus an arbitrary parent-brand subdomain (www.muslimsettify.com) resolve exactly as before, with zero deletions in the diff (BRAND-03, D-04)"
    requirement: "BRAND-03"
    verification:
      - kind: manual_procedural
        ref: "curl host-header probes for all 4 legacy hosts + git diff --numstat showing 0 deletions"
        status: pass
    human_judgment: false
  - id: D3
    description: "Prebuild guard (scripts/check-no-direct-typeform.mjs) continues to pass unmodified, and npm run build succeeds"
    requirement: "BRAND-03"
    verification:
      - kind: integration
        ref: "npm run build (includes prebuild lifecycle hook) — exit 0"
        status: pass
    human_judgment: false

# Metrics
duration: 12min
completed: 2026-07-29
status: complete
---

# Phase 01 Plan 01: 4th Brand Host Routing Summary

**Added strict-equality host branch for h.muslimsettify.com in app/apply/page.tsx, positioned ahead of the parent brand's subdomain fallback, proven via five local host-header curl probes against a production build.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-29T17:28:00Z
- **Completed:** 2026-07-29T17:30:45Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added `H_MUSLIMSETTIFY_TYPEFORM_URL` placeholder constant, matching the declaration style of the three existing brand constants
- Added a new exact-match conditional branch as the FIRST check inside `resolveTypeformUrl`, with an explanatory comment on why the ordering is load-bearing
- Verified behaviorally (not just by inspection) that all four brands plus a parent-brand subdomain canary route to their correct Typeform targets on a local production build

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the 4th brand constant and its exact-match host branch** - `1c5ac96` (feat)
2. **Task 2: Prove all four brands route correctly via local host-header requests** - no commit (verification-only task, no file changes)

**Plan metadata:** (pending — this SUMMARY commit)

## Files Created/Modified
- `app/apply/page.tsx` - Added `H_MUSLIMSETTIFY_TYPEFORM_URL` constant and a new first-checked conditional branch in `resolveTypeformUrl`; zero lines deleted, three existing brand blocks untouched

## Decisions Made
- Strict equality matching (not substring/`.includes()`) for the new brand's host check, following the parent-brand's style rather than the looser `settifyhaqqan`/`settifyowtp` style, since a single fixed subdomain gains no benefit from loose matching and it would risk false positives
- New branch positioned as the very first conditional in `resolveTypeformUrl`, strictly above the parent `muslimsettify.com` block, because `h.muslimsettify.com` satisfies that block's `.endsWith(".muslimsettify.com")` condition

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Observed Host-to-Location Mappings (verbatim, for plan 01-03 comparison)

| Host | Status | Location |
|------|--------|----------|
| `h.muslimsettify.com` | 307 | `https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY` |
| `muslimsettify.com` | 307 | `https://form.typeform.com/to/ztBUiWgs` |
| `settifyowtp.com` | 307 | `https://form.typeform.com/to/jR36nOwS` |
| `settifyhaqqan.com` | 307 | `https://form.typeform.com/to/t5UXUG8L` |
| `www.muslimsettify.com` | 307 | `https://form.typeform.com/to/ztBUiWgs` (regression canary — confirms no over-capture of the parent brand's subdomain fallback) |

All five probes returned 3xx (no 200/misconfiguration fallback). Port 3000 was confirmed free (`lsof -i :3000` returned nothing) after the local server was shut down.

## User Setup Required

None - no external service configuration required. (Vercel project/branch/domain setup is scoped to plan 01-02 and 01-03.)

## Next Phase Readiness

- Code-level routing for the 4th brand is complete and verified locally; `app/apply/page.tsx` is ready to ship on whatever branch/deployment plan 01-02 creates
- Plan 01-02 can proceed to create the `h-muslimsettify` git branch and new Vercel project tracking it
- Plan 01-03 should re-run the equivalent host-header probe against the production deployment and compare against the table above
- Reminder carried forward: the placeholder Typeform URL is intentionally non-functional until Phase 3 — `h.muslimsettify.com/apply` must not be advertised or linked from ads until the real form ID is wired in

---
*Phase: 01-4th-brand-deployment-host-routing*
*Completed: 2026-07-29*

## Self-Check: PASSED

- FOUND: `.planning/phases/01-4th-brand-deployment-host-routing/01-01-SUMMARY.md`
- FOUND: commit `1c5ac96` (Task 1)
- FOUND: commit `5c59c4e` (SUMMARY doc commit)
