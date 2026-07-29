# Pitfalls Research

**Domain:** Multi-tenant Next.js/Vercel host routing + Vercel multi-project deployment + Typeform URL-param attribution
**Researched:** 2026-07-29
**Confidence:** MEDIUM (web-corroborated across official Vercel/Typeform docs + community reports; no project-specific incident history exists yet since this is greenfield for the 4th brand)

## Critical Pitfalls

### Pitfall 1: New brand's substring match collides with (or is swallowed by) an existing brand's

**What goes wrong:**
`resolveTypeformUrl` in `app/apply/page.tsx` uses loose `.includes("settifyhaqqan")` / `.includes("settifyowtp")` matching, not just exact/subdomain matching, specifically to tolerate Vercel preview-domain variance (comment on lines 23-25: "Vercel preview + custom domains can vary"). If the 4th brand's domain slug is a substring of an existing brand's slug (or vice versa — e.g. `settify4th.com` containing `settify`, or a brand slug that happens to contain "owtp"/"haqqan"), the `if` chain resolves to the **wrong Typeform** silently. Because checks are evaluated top-to-bottom and return on first match, an overly broad new check placed before an existing one can also silently steal traffic from an existing brand.

**Why it happens:**
The existing pattern already prioritizes convenience (surviving Vercel's non-deterministic preview subdomains) over strict correctness. Adding a 4th entry using copy-paste of the same `.includes()` idiom without checking for substring overlap against the other 3 brand slugs is the natural failure mode — nobody diffs all 4 slugs against each other before shipping.

**How to avoid:**
- Before writing the 4th branch, list all 4 domain slugs side-by-side and check for substring containment in either direction.
- Prefer exact-match + `.endsWith(".domain.com")` only; drop `.includes()` unless proven necessary for a real preview-domain case. If `.includes()` is kept for the new brand, only add it as a last resort and put the new check **last** in the chain (after all exact/subdomain checks) so it can never shadow a more specific match.
- Add the new brand's host check as a new top-level `if` block returning its own constant — never fall through into another brand's block.

**Warning signs:**
- Two brand slugs share more than ~4 contiguous characters.
- The new `if` block is inserted anywhere before an existing one without re-reading the whole function top-to-bottom.
- No manual test hit against all 4 production hostnames + at least one Vercel preview hostname for the new brand.

**Phase to address:**
Phase adding the 4th brand's host-routing entry — verification step must include a manual/scripted check resolving all 4 (or 5, counting `*.vercel.app` preview) hostnames against `resolveTypeformUrl` before merge.

---

### Pitfall 2: Attribution params are silently dropped because `/apply` doesn't read `searchParams` today

**What goes wrong:**
The current `ApplyPage` component (`app/apply/page.tsx`, lines 47-54) never reads incoming URL query parameters or the `searchParams` prop — it only reads the `host` header and calls `redirect(resolved)` with the bare Typeform base URL. Any `?utm_source=...&utm_campaign=...` a visitor arrives with is **already being thrown away today** for all 3 existing brands. Teams adding "UTM passthrough" for just the new 4th brand often patch only the new brand's branch/logic path (or add a client-side script) and don't realize the shared `resolveTypeformUrl`/redirect function needs a structural change (reading `searchParams`, building a `URL` object, appending params) that necessarily touches the shared code path used by all 4 brands.

**Why it happens:**
It's tempting to scope "just the new feature" to the new brand to minimize risk, but the redirect logic is one shared function — there's no way to add param-forwarding only for host D without changing the function all hosts pass through.

**How to avoid:**
- Treat "read `searchParams`, build target URL with `URL()`, append allowed params, redirect" as one change applied uniformly to the function, not per-brand branching logic.
- Write the forwarding logic to explicitly allowlist which params get forwarded (e.g. `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, plus a `ref`/`referrer` field) rather than blindly spreading all incoming query params — avoids forwarding unrelated or unexpected params to Typeform.
- After the change, manually hit `/apply?utm_source=test` on all 4 hostnames (or at least the 3 existing + new) and confirm the redirect Location header carries the param for every brand, not just the new one.

**Warning signs:**
- Diff only touches the new brand's `if` block, not the shared param-reading/redirect-building code.
- No regression check confirms existing 3 brands' redirects are unaffected by the new URL-building logic (e.g. an existing brand's Typeform URL already has its own query string like `?utm_source=static` embedded, and naive string concatenation instead of `URL()`/`URLSearchParams` produces a malformed `??` or duplicate `?`).

**Phase to address:**
Phase implementing UTM/attribution passthrough. Verification: test matrix covering all 4 brands × (no params / with UTM params / with params containing special characters) confirming correct single `?` and properly encoded values.

---

### Pitfall 3: Referrer is read from the wrong place, or attempted client-side when the pattern is server-side

**What goes wrong:**
Two failure modes converge here:
1. Teams try to read `document.referrer` client-side and inject it via JS before redirecting, but the existing pattern (and PROJECT.md's stated decision) is a server-side `redirect()` in a Server Component — there's no client-side hook to read `document.referrer` before the redirect fires, since `redirect()` executes server-side before any client JS runs.
2. If read server-side via `headers().get("referer")` instead, that header reflects the referrer of the request *to `/apply` itself* (e.g., the homepage the user clicked "Apply" from, which is same-site), not the **original external traffic source** (Google, Facebook ad, etc.) that brought the visitor to the site in the first place. The two are frequently conflated, producing attribution data that says "referred by muslimsettify.com" for every submission — useless for channel attribution.

**Why it happens:**
"Referrer" is an overloaded term. The business need ("which channel/campaign did this lead come from") is actually served by UTM params (captured at the *entry* page, not at `/apply`) plus, at best, the *original* document.referrer captured on first landing — not the referer header on the internal `/apply` navigation.

**How to avoid:**
- Rely primarily on UTM query params for attribution, since they survive server-side redirects cleanly and are the explicit, intentional signal.
- If true original-referrer capture is wanted, capture `document.referrer` on the **landing page** (client-side, on first page load) and persist it (e.g., as a query param appended to the internal link to `/apply`, or a short-lived cookie set client-side) — not read the `Referer` HTTP header at `/apply` time, which only shows internal navigation.
- Clarify with stakeholders in this phase whether "referrer" in the requirement means "external traffic source" (needs landing-page-time capture) vs. "the page the user clicked from" (server `Referer` header suffices) — these require different implementations.

**Warning signs:**
- Attribution data in Typeform responses shows the same internal domain as "referrer" for every single submission.
- Code reads `headers().get("referer")` inside `/apply/page.tsx` and assumes it represents ad-channel attribution.

**Phase to address:**
Phase implementing attribution passthrough — spec the exact definition of "referrer" before implementing (traffic-source vs. click-source), and place capture at the correct point in the funnel (landing page vs. `/apply`).

---

### Pitfall 4: Typeform hidden field names don't exactly match the forwarded query param names

**What goes wrong:**
Typeform requires the hidden-field name configured inside the form builder to be an **exact, case-sensitive** match to the URL query parameter name. Typeform does not support mixed-case parameter names. If the redirect appends `utm_Source` (mismatched casing) or `campaign` while the Typeform hidden field is named `utm_campaign`, the field silently arrives empty in Typeform responses — there is no error, no warning, just missing data discovered later when someone checks the results table.

**Why it happens:**
The redirect-building code and the Typeform form configuration are edited by different people/processes at different times (a developer writes the code; someone else — or the same developer weeks later — configures hidden fields in the Typeform UI) with no shared source of truth for param names, and no automated check connects the two.

**How to avoid:**
- Define the canonical list of param names (e.g., `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) once, in code (a constant array), and use that exact list both when building the redirect URL and when configuring hidden fields in the new Typeform form — copy-paste, don't retype.
- After creating the Typeform, do one live end-to-end test: hit `/apply?utm_source=qa-test&utm_campcampaign=qa-test` (deliberately including a typo'd param name in one test case) and confirm in the Typeform Results tab that the correctly-named params appear and the typo'd one does not — proves the exact-match behavior is understood, not assumed.

**Warning signs:**
- No end-to-end check of the actual Typeform Results/Responses table after wiring — checking only that the redirect Location header looks right is not sufficient, since Typeform-side field mapping is a separate configuration surface that can silently fail.
- Hidden field names in Typeform use any uppercase letters.

**Phase to address:**
Phase creating the 4th brand's Typeform + phase implementing param passthrough — both must agree on the exact param-name list; verification step must check the Typeform Results table, not just the redirect URL.

---

### Pitfall 5: Vercel's "Assign Domain" auto-defaults to `main`/production, silently repointing or missing the new branch

**What goes wrong:**
When you first add a domain in a new Vercel project, Vercel automatically assigns it to the project's default branch (`main`) rather than the intended feature/brand branch. Also, "Assign Domain" (instant, reuses the existing build) is easy to confuse with "Promote to Production" (triggers a new deployment) — using the wrong one either freezes the 4th brand's domain on a stale build or unexpectedly redeploys from the wrong ref. If the new Vercel project's "Production Branch" setting is left at `main` instead of the new dedicated branch (per PROJECT.md's explicit decision to deploy from a **new branch off main**, not `main` itself), every future push to `main` (intended for the other 3 brands' behavior) could auto-deploy to the 4th brand's domain too, or the 4th brand's branch pushes never go live because the domain is still bound to `main`.

**Why it happens:**
Vercel's project creation flow is optimized for the common case (one repo → one project → `main` is production). The 4-brand-in-one-repo, N-projects, non-`main`-branch pattern is a deliberate deviation from that default, and Vercel's UI does not proactively warn you that you're diverging from the default — you have to explicitly go into Settings > Git > Production Branch and Settings > Domains > Edit for each new project.

**How to avoid:**
- When creating the new Vercel project: (1) set the branch explicitly at import time if the UI offers it, or immediately after import go to Settings > Git > Production Branch and change it from `main` to the new brand branch; (2) go to Settings > Domains, add the domain, and explicitly click Edit to confirm it's bound to that Production Branch/environment, not left on the default.
- Verify by pushing a trivial commit to the new branch only (not `main`) and confirming the new project's domain updates, while the other 3 brands' domains/projects do NOT redeploy.
- Consider disabling "Auto-assign Custom Production Domains" if it exists in the project's Branch Tracking settings, to prevent an accidental future repoint.

**Warning signs:**
- New brand's domain still resolves to old/blank content after first deploy — check Production Branch setting first, not just DNS.
- A push to `main` (for an unrelated 3-brand change) triggers a build/deploy notification on the 4th brand's Vercel project too.

**Phase to address:**
Phase setting up the new Vercel project — explicit verification checklist item: confirm Production Branch = new branch name (not `main`), confirm domain assigned to that branch/environment, confirm a `main`-only push does not trigger the new project.

---

### Pitfall 6: Environment variables aren't independently (re)configured for the new Vercel project

**What goes wrong:**
Vercel environment variables are scoped strictly per-project — a brand-new Vercel project created against the same repo starts with **zero** environment variables; nothing carries over from the other 3 brands' projects. The existing code's fallback path (`process.env.TYPEFORM_URL`) means that if the new project's `TYPEFORM_URL` isn't set (or the new brand's host isn't yet hardcoded into `resolveTypeformUrl`), the deployed 4th brand shows the "Apply link misconfigured" error page (lines 58-84 in `app/apply/page.tsx`) in production instead of failing at build/deploy time — this is a known documented gap (see CONCERNS.md: "Missing environment variable can crash deploy").

**Why it happens:**
Teams assume "it's the same repo, so it's already configured" — but project-level env vars in Vercel are isolated by design, and there's no automatic copy step when importing the same repo a second time as a separate project.

**How to avoid:**
- Treat env var setup as a required checklist item for the new project, not an assumption: explicitly set `TYPEFORM_URL` (and any other env vars the other 3 projects have, e.g. analytics keys if added later) in the new project's Settings > Environment Variables, scoped to Production (and Preview if the new branch also gets preview deploys).
- Prefer adding the new host directly into `resolveTypeformUrl`'s hardcoded map (matching the existing pattern for the other 3 brands) rather than relying solely on the `TYPEFORM_URL` env var fallback — this keeps the guard/build-check pattern (`scripts/check-no-direct-typeform.mjs`) and code review as the source of truth, with env var as a true fallback/safety net rather than the primary mechanism.
- After deploy, actually visit `/apply` on the new brand's live domain (not just check the dashboard) — the misconfiguration only shows up as a rendered error page, not a build failure.

**Warning signs:**
- New project deployed successfully (build green) but `/apply` shows "Apply link misconfigured" in production — this is silent at build time since it's a runtime env var check, not caught by `check-no-direct-typeform.mjs`.
- New brand's host isn't yet added to the hardcoded map, so only the env var fallback is protecting it — one missed env var setup step away from breakage.

**Phase to address:**
Phase setting up the new Vercel project (env var + domain config) AND phase adding the host-routing entry — both must land together; verification step must include hitting the live `/apply` URL post-deploy, not just checking the Vercel dashboard shows a successful build.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|--------------------|-----------------|------------------|
| Relying only on `TYPEFORM_URL` env var fallback instead of adding the 4th brand to the hardcoded map | Faster to ship — no code change/PR needed | Silent runtime misconfig risk (Pitfall 6); no `check-no-direct-typeform.mjs` guard coverage; inconsistent with existing pattern for other 3 brands | Never for the 4th brand's primary path — only acceptable as the documented safety-net fallback |
| Broad `.includes()` substring host matching for the new brand (copying existing pattern) | Tolerates Vercel preview-domain variance without extra config | Risk of collision with future 5th/6th brand slugs (Pitfall 1) | Acceptable only if the new brand's slug is verified non-overlapping with all existing slugs, and the check is placed last in the chain |
| Forwarding *all* incoming query params to Typeform instead of an explicit allowlist | Less code to write | Unexpected/unwanted params (e.g. internal debug params, other trackers' params) leak into Typeform hidden fields; harder to reason about what's actually forwarded | Never — always allowlist |
| Reading `Referer` header at `/apply` instead of capturing true landing-page referrer | Simple, one-line, no new state | Produces misleading "referrer = own domain" attribution data (Pitfall 3) | Acceptable only if "referrer" is explicitly scoped to mean "the internal page the Apply button was clicked from," confirmed with stakeholders |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|------------------|-------------------|
| Typeform (URL params → hidden fields) | Assuming any query param name auto-maps to a hidden field, or using mismatched casing | Hidden field names must be created explicitly in the Typeform builder and must exactly match (case-sensitive) the forwarded param names |
| Typeform (redirect links) | Hardcoding a fixed redirect-back URL that doesn't recall/re-append the URL param values passed in | If Typeform redirects back out (e.g., to a thank-you page), recall the param value using Typeform's recall syntax rather than assuming it persists automatically |
| Vercel (same repo, multiple projects) | Assuming the GitHub integration lets one repo auto-connect to multiple projects with independent config out of the box | Import the repo again as a distinct Vercel project per brand; each has fully isolated env vars and git branch tracking that must be set explicitly |
| Vercel (domain assignment) | Adding a domain and assuming it's bound to the intended branch | Always explicitly Edit the domain's Git Branch / environment binding after adding it — it defaults to the production/default branch |
| iOS/Apple Mail link tracking protection | Assuming UTM params always survive when links are shared via iMessage/Mail on iOS 17+ | Know that Apple's Link Tracking Protection strips known tracking params from links opened via Mail/Messages; some loss is unavoidable for that channel and shouldn't be treated as an application bug |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| N/A — this is a static, zero-backend redirect; no meaningful scale trap exists for a single query-param passthrough on a server redirect | — | — | — |

(No performance traps specific to this milestone — the change is a small, stateless server redirect; existing performance concerns in CONCERNS.md, e.g. testimonial data volume, are unrelated to this milestone's scope.)

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting `Host` header (or `X-Forwarded-Host`) without an allowlist for routing decisions | A misconfigured/compromised proxy or crafted request could spoof the host and get routed to an unintended brand's Typeform, or (if ever extended to build other logic off host) enable cache-poisoning-style attacks | Continue using the existing hardcoded allowlist pattern (exact match / `endsWith` on known domains) for the new brand rather than introducing dynamic/open-ended host trust; do not add a "trust any host, look up in a dict" fallback |
| Forwarding arbitrary/unsanitized query params into a redirect Location header | Low but non-zero: forwarding attacker-controlled param values into a redirect URL without allowlisting/encoding could enable parameter injection into the destination Typeform URL (e.g. breaking out of the query string) | Explicitly allowlist which param names get forwarded; use `URL`/`URLSearchParams` APIs (which handle encoding) rather than manual string concatenation, when building the outbound redirect URL |
| Logging or storing UTM/referrer values that could contain PII (e.g. an email address accidentally passed as a query param by a malformed upstream link) | Console/log exposure of PII if params are logged for debugging (echoes the existing known issue in CONCERNS.md where `components/application.tsx` logs form PII to console) | Do not `console.log` the resolved redirect URL or param values in production code paths; if debug logging is added during implementation, strip it before merge, consistent with the existing PII console-logging concern already flagged in the codebase |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|--------------|-------------------|
| New brand's `/apply` shows the raw "Apply link misconfigured" debug page (lines 58-84) if setup is incomplete at launch | Visitors hitting a half-configured 4th brand see a broken/unprofessional internal error page instead of a graceful fallback | Treat the misconfigured-page scenario as a hard release blocker — verify live `/apply` on the new domain before announcing/driving traffic to it; do not rely on "it'll be fine once env vars are set" |
| UTM params visibly present in the browser's address bar mid-redirect / in the final Typeform URL | Minor: some users may notice tracking params in the URL bar, which can look "spammy" for a form link shared over messaging apps | Not a functional bug, but worth deciding whether to strip visually-obvious params before the destination page state settles (Typeform itself typically cleans the visible URL after load); not a blocker for this milestone |

## "Looks Done But Isn't" Checklist

- [ ] **Host routing for the 4th brand:** Often missing a check against substring-collision with the other 3 brand slugs — verify by testing all 4 production hostnames plus the new brand's Vercel preview hostname against `resolveTypeformUrl`.
- [ ] **UTM/attribution passthrough:** Often "done" only for the new brand's code path while the shared redirect-building logic is what actually changed — verify all 3 existing brands' `/apply?utm_source=test` redirects still work unmodified (no double `?`, no encoding bugs) after the change.
- [ ] **Typeform hidden field wiring:** Often verified only by inspecting the redirect Location header, not the actual Typeform Results/Responses table — verify by submitting one real test response via the redirect URL and checking the field values landed correctly in Typeform.
- [ ] **Vercel new project domain/branch binding:** Often "looks deployed" (green build, domain resolves) while actually bound to the wrong branch (`main` instead of the intended new branch) — verify by pushing a commit to the new branch only and confirming only the new project redeploys, and confirming a `main`-only push does not touch the new project.
- [ ] **Environment variables on new project:** Often assumed to inherit from the "same repo" — verify by checking the new Vercel project's Settings > Environment Variables shows `TYPEFORM_URL` (or the new brand's map entry) explicitly set, not empty.
- [ ] **Build guard (`check-no-direct-typeform.mjs`) still passes:** Often forgotten when adding a 4th Typeform URL constant — verify `npm run prebuild` (or equivalent) still passes with the new constant declared only inside `app/apply/page.tsx`.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|-----------------|-------------------|
| Pitfall 1 (host substring collision) | LOW | Reorder/tighten the `if` chain, redeploy; no data loss since it's a stateless redirect — just re-test all 4 hostnames |
| Pitfall 2 (params silently dropped) | LOW | Fix the shared redirect-building function once, redeploy; any leads submitted before the fix simply lack attribution data in Typeform (not recoverable retroactively, but not user-facing breakage) |
| Pitfall 3 (wrong referrer semantics) | MEDIUM | Requires re-clarifying the requirement and moving capture to the landing page if true external-referrer tracking is needed — a bigger change than a redirect tweak; leads submitted with wrong "referrer" data are not retroactively fixable |
| Pitfall 4 (Typeform field name mismatch) | LOW | Rename the hidden field in the Typeform builder (or the code constant) to match; existing responses before the fix are missing that field's data but not otherwise broken |
| Pitfall 5 (Vercel branch/domain misconfig) | LOW | Re-edit domain binding / Production Branch setting in Vercel dashboard; no code change needed, takes effect on next deploy |
| Pitfall 6 (missing env vars) | LOW | Add the missing env var in Vercel dashboard and redeploy; if the brand is already added to the hardcoded map this is a pure safety-net fix with no user-facing downtime expected |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|--------------------|-----------------|
| Pitfall 1: Host substring collision | Phase adding 4th brand's host-routing entry | Manually resolve all 4 production hostnames + new brand's preview hostname against `resolveTypeformUrl`; confirm each maps to its own Typeform |
| Pitfall 2: Params silently dropped by shared redirect logic | Phase implementing UTM/attribution passthrough | Test `/apply?utm_source=test` etc. on all 4 brands; confirm every brand's redirect Location header carries forwarded params correctly |
| Pitfall 3: Referrer semantics mismatch | Phase implementing UTM/attribution passthrough (spec step, before coding) | Confirm with stakeholders whether "referrer" means traffic-source (needs landing-page capture) or click-source (server Referer header suffices); implement accordingly |
| Pitfall 4: Typeform hidden field name mismatch | Phase creating 4th brand's Typeform + phase implementing passthrough (joint) | Submit one live test response through the actual redirect URL; confirm values appear correctly in Typeform's Results table |
| Pitfall 5: Vercel branch/domain misconfig | Phase setting up new Vercel project | Push to new branch only, confirm only new project redeploys; confirm `main`-only push doesn't trigger new project; confirm domain resolves to new branch's build |
| Pitfall 6: Missing env vars on new project | Phase setting up new Vercel project + phase adding host-routing entry (joint) | Visit live `/apply` URL on new brand's domain post-deploy and confirm it redirects to Typeform, not the "misconfigured" error page |

## Sources

- [Vercel: How can I serve multiple projects under a single domain?](https://vercel.com/kb/guide/how-can-i-serve-multiple-projects-under-a-single-domain) — MEDIUM (official docs)
- [Vercel: Assigning a domain to a Git branch](https://vercel.com/docs/domains/working-with-domains/assign-domain-to-a-git-branch) — MEDIUM (official docs)
- ["Assign Domain" - a frustrating experience · Issue #8282 · vercel/vercel](https://github.com/vercel/vercel/issues/8282) — MEDIUM (corroborated community + maintainer discussion)
- [Vercel: Deploying multiple production environments from one branch/repo, Discussion #4879](https://github.com/vercel/vercel/discussions/4879) — LOW-MEDIUM (community discussion)
- [Vercel: Environment variables docs](https://vercel.com/docs/environment-variables) — MEDIUM (official docs)
- [Vercel: Sharing environment variables across multiple projects in monorepos, Discussion #5469](https://github.com/vercel/vercel/discussions/5469) — LOW-MEDIUM (community discussion)
- [Typeform: Form URL Parameters (formerly Hidden Fields)](https://www.typeform.com/developers/create/url-parameters/) — MEDIUM (official docs)
- [Typeform Help Center: Using URL parameters (formerly Hidden Fields)](https://help.typeform.com/hc/en-us/articles/360052676612-Using-URL-parameters-formerly-Hidden-Fields) — MEDIUM (official docs)
- [Typeform Community: Hidden Fields not Displaying Results](https://community.typeform.com/your-typeform-results-32/hidden-fields-not-displaying-results-13031) — LOW-MEDIUM (community reports, cross-checked against official docs on exact-match requirement)
- [Typeform Community: UTM field forces its way into URL redirect and messes with hidden fields and logic jumps](https://community.typeform.com/build-your-typeform-7/utm-field-forces-its-way-into-url-redirect-and-messes-with-hidden-fields-and-logic-jumps-4729) — LOW (single community report)
- [Typeform Help Center: Use URL parameters and recall information in redirect links](https://www.typeform.com/help/a/use-hidden-fields-in-redirect-links-360050455852/) — MEDIUM (official docs)
- [vercel/next.js Discussion #34571: routing behind reverse proxies (X-Forwarded-Host)](https://github.com/vercel/next.js/discussions/34571) — MEDIUM (maintainer-corroborated)
- [vercel/next.js Issue #58295: x-forwarded-host header does not match origin](https://github.com/vercel/next.js/issues/58295) — LOW-MEDIUM (community/maintainer thread)
- Codebase inspection: `app/apply/page.tsx` (read directly, 2026-07-29) — HIGH (primary source, ground truth for current behavior)
- `.planning/codebase/CONCERNS.md` — HIGH (primary source, existing known issues: env var crash risk, PII console logging)

---
*Pitfalls research for: Multi-brand Next.js/Vercel host routing + Typeform attribution passthrough*
*Researched: 2026-07-29*
