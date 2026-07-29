# Muslim Settify — Multi-Brand Landing Site

## What This Is

A Next.js 16 / React 19 marketing landing site for a remote appointment-setter training program, currently deployed under three brands/domains (muslimsettify.com, settifyowtp.com, settifyhaqqan.com) from a single codebase. Visitors land on a hero/testimonials/FAQ page and apply via a host-routed redirect to a brand-specific Typeform. This milestone adds a **4th brand** as a new Vercel deployment, with a **new Typeform form** wired to capture lead-source attribution (UTM/referrer) so the team can see which channel/campaign each application came from.

## Core Value

Every application submitted through the new brand's `/apply` flow must carry accurate attribution data (UTM/referrer) into its dedicated Typeform, without breaking the existing 3-brand routing.

## Requirements

### Validated

- ✓ Next.js App Router site renders homepage, `/apply`, `/more-success` — existing
- ✓ Host-based routing in `app/apply/page.tsx` resolves the correct hardcoded Typeform URL per domain (muslimsettify.com, settifyowtp.com, settifyhaqqan.com), with `TYPEFORM_URL` env var fallback — existing
- ✓ Build-time guard (`scripts/check-no-direct-typeform.mjs`, run via `npm run prebuild`) blocks any hardcoded Typeform link outside `/apply` — existing
- ✓ Static, no-backend architecture: all content in `data/*.ts`, no database, no auth — existing

### Active

- [ ] New 4th brand domain added to the host-resolution map in `app/apply/page.tsx` (same pattern as the existing 3)
- [ ] New Vercel project created for the 4th brand, deployed from a new branch off `main`, with its own domain
- [ ] New Typeform created for the 4th brand (same fields as the existing brands' intent: name, email, phone, current situation), replacing the inline `components/application.tsx` stub's field set conceptually — not wiring up that component itself
- [ ] UTM parameters and referrer captured and appended as query params on the `/apply` redirect so the destination Typeform receives them via its own hidden-field/URL-param mapping
- [ ] Existing 3-brand behavior unaffected — build guard still passes, no regression in host resolution for existing domains

### Out of Scope

- Wiring up `components/application.tsx` (the homepage inline form) to actually submit anywhere — it is decorative/unused per existing code; fixing it is a separate concern with its own backend/data-storage decisions
- Content or branding changes to the duplicated site — this milestone is a pure infrastructure + attribution addition, no copy/design changes
- Building a custom in-repo database or backend for lead storage — attribution flows through Typeform via URL params, not a new datastore
- Analytics/error-monitoring platforms (Sentry, GA, etc.) — noted as a gap in codebase concerns but not part of this milestone

## Context

- Existing codebase mapped in `.planning/codebase/` (STACK.md, ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, INTEGRATIONS.md, CONCERNS.md) — read before planning phases.
- The 3 existing brands are NOT separate git repos — one Next.js app, one repo, multiple Vercel domains/projects pointing at it, differentiated by `Host` header at request time in `app/apply/page.tsx`.
- `components/application.tsx` is known-dead code (confirmed via codebase mapping): form submits nowhere, only `console.log`s data, real apply flow is entirely via `/apply` → Typeform redirect.
- No analytics or error monitoring exists anywhere in the codebase today — attribution capture for this milestone is scoped narrowly to the new brand's apply flow, not a site-wide analytics rollout.
- No test infrastructure exists (no unit or E2E tests) — plan phases should not assume test scaffolding is already in place.

## Constraints

- **Tech stack**: Must extend existing Next.js 16 / React 19 / TypeScript app — no new frameworks
- **Existing guard**: `scripts/check-no-direct-typeform.mjs` prebuild check must continue to pass; any new Typeform reference must go through the `/apply` host-resolution pattern, not be hardcoded elsewhere
- **No regression**: Existing 3 brands' `/apply` routing must keep working exactly as today
- **Vercel platform**: New brand deploys as its own Vercel project/domain, per user decision, tracking a new branch off `main`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| New brand uses same host-routing pattern as existing 3, not an independent deployment | Matches established architecture, minimal new code, consistent with build guard | — Pending |
| Use Typeform (not a custom in-repo form) for the new brand | Matches existing pattern for all 3 current brands; user confirmed after initial ambiguity ("new typescript form" was a request for attribution, not a custom form) | — Pending |
| Attribution via query params on the `/apply` redirect (not client-side hidden-field JS injection) | Simplest fit for the existing server-side redirect pattern; Typeform reads params via its own URL-param-to-hidden-field mapping | — Pending |
| Leave `components/application.tsx` (homepage inline form) untouched | It's confirmed dead/decorative code; wiring it up is a separate concern with its own scope (backend, data storage) not needed for this milestone's goal | — Pending |
| New Vercel project deploys from a new branch off `main`, not `main` itself | Lets the 4th brand diverge independently without every `main` commit auto-deploying to it before it's ready | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-29 after initialization*
