# Requirements: Muslim Settify — Multi-Brand Landing Site

**Defined:** 2026-07-29
**Core Value:** Every application submitted through the new brand's `/apply` flow must carry accurate attribution data (UTM/referrer) into its dedicated Typeform, without breaking the existing 3-brand routing.

## v1 Requirements

### Brand Deployment & Routing

- [ ] **BRAND-01**: New Vercel project deployed for the 4th brand (`h.muslimsettify.com`), tracking a new branch off `main`, with its own custom domain and env vars
- [ ] **BRAND-02**: Exact-match host entry for `h.muslimsettify.com` added to `resolveTypeformUrl` in `app/apply/page.tsx`, placed **before** the existing `.endsWith(".muslimsettify.com")` check so the subdomain resolves to the new brand's Typeform, not the original
- [ ] **BRAND-03**: Existing 3 brands (muslimsettify.com, settifyowtp.com, settifyhaqqan.com) still resolve correctly and the `check-no-direct-typeform.mjs` build guard still passes after the change

### Attribution Capture & Forwarding

- [ ] **ATTR-01**: Homepage captures incoming UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) and `Referer` header at landing time (ads point at the homepage, not `/apply` directly)
- [ ] **ATTR-02**: All 5 existing Apply CTA link locations (`components/hero.tsx`, `components/navbar.tsx` ×2, `components/cta.tsx`, `components/apply-cta.tsx`) forward the captured UTM/referrer values as query params on their `/apply` links
- [ ] **ATTR-03**: `app/apply/page.tsx` reads its own incoming allowlisted query params, appends them as Typeform Hidden Field query params (exact lowercase/underscore names) on the outbound redirect URL via `URL`/`URLSearchParams`
- [ ] **ATTR-04**: Missing/absent UTM or referrer values never break the redirect — hidden fields are simply omitted, no empty-string params, no error states
- [ ] **ATTR-05**: Forwarded params are limited to an explicit allowlist (the 5 UTM keys + `referrer`) — no blind passthrough of arbitrary query params

### Typeform Setup & Verification

- [ ] **TYPE-01**: New Typeform created for the 4th brand recreating the existing form's field intent (name, email, phone, current situation)
- [ ] **TYPE-02**: New Typeform's builder has pre-defined Hidden Fields with exact matching names (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`)
- [ ] **TYPE-03**: End-to-end verification: a live test submission through the redirect with test UTM params confirms values land correctly in the new Typeform's Results table

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Attribution Enhancements

- **ATTR-06**: Ad-platform click ID capture (`gclid`, `fbclid`) alongside UTM params
- **ATTR-07**: `landing_page` hidden field capturing full incoming path/URL

### Persistence & Analytics

- **ATTR-08**: Cookie-based first-touch/multi-session attribution persistence
- **ATTR-09**: Typeform's native paid "UTM Tracking" toggle as a consolidation of manual Hidden Fields
- **ATTR-10**: Cross-domain analytics/GA4/GTM session linking

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Wiring up `components/application.tsx` (homepage inline form) | Confirmed dead/decorative code — form submits nowhere, only `console.log`s. Fixing it is a separate concern with its own backend/data-storage decisions, not needed for this milestone's attribution goal |
| Content or branding changes to the new brand's site | Pure infrastructure + attribution addition; no copy/design changes this milestone |
| Custom in-repo database/backend for lead storage | PROJECT.md explicitly rules this out — Typeform's own Results table is the system of record; adds unnecessary datastore/ops surface to a static, no-backend site |
| Client-side embed/JS hidden-field injection (Typeform embed SDK) | Not applicable — flow is a server-side redirect, not an iframe embed; would solve a different problem than the one that exists |
| Typeform's native paid UTM Tracking toggle as primary mechanism | Plan-tier dependency for a capability the free Hidden Fields mechanism already delivers without one |
| Forwarding every incoming query parameter unfiltered | Risk of leaking unintended/internal params or PII into Typeform's stored responses; explicit allowlist used instead |
| Cookie-based multi-touch/cross-session attribution for v1 | Adds cookie-consent/privacy surface area not currently present; stateless single-redirect capture is sufficient for the stated goal |
| Analytics/error-monitoring platforms (Sentry, GA, etc.) | Noted as a pre-existing codebase gap, but out of scope for this milestone — narrowly scoped to the new brand's apply flow attribution |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | Phase 1 | Pending |
| BRAND-02 | Phase 1 | Pending |
| BRAND-03 | Phase 1 | Pending |
| ATTR-01 | Phase 2 | Pending |
| ATTR-02 | Phase 2 | Pending |
| ATTR-03 | Phase 2 | Pending |
| ATTR-04 | Phase 2 | Pending |
| ATTR-05 | Phase 2 | Pending |
| TYPE-01 | Phase 3 | Pending |
| TYPE-02 | Phase 3 | Pending |
| TYPE-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11/11 ✓
- Unmapped: 0

---
*Requirements defined: 2026-07-29*
*Last updated: 2026-07-29 after roadmap creation (3 phases, 11/11 requirements mapped)*
