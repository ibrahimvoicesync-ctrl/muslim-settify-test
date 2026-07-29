# Roadmap: Muslim Settify — 4th Brand + Attribution

## Overview

This milestone adds a 4th brand (`h.muslimsettify.com`) to the existing 3-brand host-routed Next.js site as an independent Vercel deployment, then layers UTM/referrer lead-source attribution onto the shared `/apply` redirect so every application carries its marketing source into a dedicated Typeform. The journey runs infrastructure first (new brand deploys and resolves correctly, with zero regression to the existing 3 brands), then attribution logic (capture at landing, forward through all CTAs, append as Typeform hidden-field params on the redirect), then closes with the non-code Typeform configuration and a live end-to-end verification against the actual Results table — the step most likely to silently fail if skipped.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: 4th Brand Deployment & Host Routing** - New Vercel project for `h.muslimsettify.com` deploys from its own branch/domain and resolves to its own Typeform via `resolveTypeformUrl`, with zero regression to the existing 3 brands
- [ ] **Phase 2: UTM/Referrer Attribution Passthrough** - Incoming UTM params and referrer are captured at landing time, forwarded through every Apply CTA, and appended as an explicit allowlist of Typeform hidden-field query params on the `/apply` redirect
- [ ] **Phase 3: Typeform Configuration & End-to-End Verification** - The new brand's Typeform is built with matching fields and pre-configured Hidden Fields, and a live test submission confirms attribution data lands correctly in the Results table

## Phase Details

### Phase 1: 4th Brand Deployment & Host Routing
**Goal**: The 4th brand exists as an independent, live Vercel deployment that routes to its own Typeform through the same host-resolution pattern as the existing 3 brands, with no regression to those 3.
**Depends on**: Nothing (first phase)
**Requirements**: BRAND-01, BRAND-02, BRAND-03
**Success Criteria** (what must be TRUE):
  1. Visiting `h.muslimsettify.com/apply` redirects to the new brand's own Typeform URL, distinct from the other 3 brands' forms
  2. Visiting `muslimsettify.com/apply`, `settifyowtp.com/apply`, and `settifyhaqqan.com/apply` still redirect to their original respective Typeforms, unchanged
  3. `npm run prebuild` (`check-no-direct-typeform.mjs`) still passes after the new host entry is added
  4. The new Vercel project is live on its own branch (not `main`) with its own custom domain and env vars configured
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: UTM/Referrer Attribution Passthrough
**Goal**: Marketing attribution (UTM params + referrer) captured at landing time flows through every Apply entry point and is appended, as an explicit allowlist, to the outbound Typeform redirect URL — without ever breaking the redirect when values are absent.
**Depends on**: Phase 1
**Requirements**: ATTR-01, ATTR-02, ATTR-03, ATTR-04, ATTR-05
**Success Criteria** (what must be TRUE):
  1. Landing on the homepage with UTM query params present, all 5 Apply CTA locations (`hero.tsx`, `navbar.tsx` ×2, `cta.tsx`, `apply-cta.tsx`) carry those same params forward onto their `/apply` links
  2. Visiting `/apply` with allowlisted UTM/referrer params present redirects to the Typeform URL with matching hidden-field query params appended
  3. Visiting `/apply` with no UTM params or referrer present still redirects successfully — no errors, no empty-string params, no broken redirect
  4. Visiting `/apply` with a non-allowlisted query param (e.g. `?foo=bar`) does not forward that param onto the outbound Typeform redirect URL
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Typeform Configuration & End-to-End Verification
**Goal**: The new brand's Typeform exists with the correct fields and pre-configured Hidden Fields, and a real production test confirms attribution values land correctly in Typeform's own Results table — not just that the redirect URL looks correct.
**Depends on**: Phase 1, Phase 2
**Requirements**: TYPE-01, TYPE-02, TYPE-03
**Success Criteria** (what must be TRUE):
  1. The new Typeform recreates the existing forms' field intent (name, email, phone, current situation)
  2. The new Typeform's builder has Hidden Fields pre-defined with exact matching names (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`)
  3. A live test submission through the production redirect, with test UTM params attached, shows those exact values recorded in the new Typeform's Results table
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 4th Brand Deployment & Host Routing | 0/TBD | Not started | - |
| 2. UTM/Referrer Attribution Passthrough | 0/TBD | Not started | - |
| 3. Typeform Configuration & End-to-End Verification | 0/TBD | Not started | - |
