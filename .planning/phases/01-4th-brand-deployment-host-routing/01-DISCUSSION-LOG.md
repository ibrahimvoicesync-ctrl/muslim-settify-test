# Phase 1: 4th Brand Deployment & Host Routing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-29
**Phase:** 1-4th-brand-deployment-host-routing
**Areas discussed:** New Typeform URL placeholder, Vercel deploy execution, New branch name, Domain/DNS readiness

---

## New Typeform URL placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded placeholder constant | Same pattern as existing 3 brands; swapped for real URL in Phase 3 | ✓ (Claude's discretion) |
| Env var (e.g. `H_MUSLIMSETTIFY_TYPEFORM_URL`) | Set later in Vercel, no redeploy needed for the swap | |

**User's choice:** "you decide" (delegated to Claude for all 4 presented areas)
**Notes:** Claude picked hardcoded placeholder for consistency with existing codebase convention (all 3 current brand URLs are hardcoded, not env-driven).

---

## Vercel deploy execution

| Option | Description | Selected |
|--------|-------------|----------|
| Claude runs `vercel` CLI | CLI installed locally, not yet linked to a project | |
| Manual / user-driven with Claude documenting steps | Account-level and DNS actions require user's Vercel/registrar access | ✓ (Claude's discretion) |

**User's choice:** "you decide"
**Notes:** Claude will produce exact CLI commands and steps; execution treated as a guided manual step during phase execution since it touches the user's external Vercel account and DNS.

---

## New branch name

| Option | Description | Selected |
|--------|-------------|----------|
| `h-muslimsettify` | Maps directly to the new subdomain | ✓ (Claude's discretion) |
| Other naming (e.g. `brand-4`, `4th-brand`) | Less directly tied to the domain | |

**User's choice:** "you decide"
**Notes:** Chosen for clarity in the Vercel dashboard.

---

## Domain/DNS readiness

| Option | Description | Selected |
|--------|-------------|----------|
| In scope for Phase 1 | Matches ROADMAP Phase 1 success criteria #4 (custom domain configured) | ✓ (Claude's discretion) |
| Out of scope / assumed pre-existing | Not supported by any evidence in repo (no `.vercel/` dir found) | |

**User's choice:** "you decide"
**Notes:** No `.vercel/project.json` exists yet — domain/DNS attachment has not been done, so it stays in Phase 1 scope per the roadmap's own success criteria.

---

## Claude's Discretion

All four areas above — user responded "you decide" to the batch selection question rather than discussing individually. See CONTEXT.md `<decisions>` D-01 through D-07 for the full rationale behind each call.

## Deferred Ideas

None — discussion stayed within Phase 1 scope. Real Typeform creation/Hidden Fields (Phase 3) and UTM/attribution logic (Phase 2) were confirmed as already scoped elsewhere, not pulled into this phase.
