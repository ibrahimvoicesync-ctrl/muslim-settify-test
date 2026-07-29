# Feature Research

**Domain:** Lead-source attribution (UTM/referrer capture) for a server-redirect-to-Typeform apply flow
**Researched:** 2026-07-29
**Confidence:** MEDIUM (official Typeform docs + cross-checked community/staff answers + third-party implementation guides; no single authoritative source covers the exact "server redirect, no embed" case end-to-end, so specifics were triangulated across sources)

## How Typeform's Mechanism Actually Works (load-bearing findings)

This project's flow is a **full-page server-side redirect** to a Typeform-hosted URL (`https://xxx.typeform.com/to/FORM_ID`) — there is no iframe embed and no client-side JS SDK involved. This matters because most Typeform documentation defaults to describing the *embedded* case. Findings specific to the redirect case:

- Typeform's mechanism is called **"Form URL Parameters" (formerly "Hidden Fields")**: named placeholders you pre-define inside the Typeform builder, whose values get filled from the URL used to reach the form and are stored with the submission.
- **For a direct/standalone link (our case), pass values as a normal query string**: `https://xxx.typeform.com/to/FORM_ID?utm_source=fb&utm_medium=cpc&referrer=https%3A%2F%2Fgoogle.com`. Fragment syntax (`#field=value`) is also accepted by Typeform's front end and Typeform staff recommend `#` specifically for personal/sensitive data (fragments aren't sent to servers in normal HTTP requests) and `?` for general tracking data — for UTM/referrer tracking, `?` is the correct, simpler choice and is what a `Location:` redirect header naturally produces.
- **Field-name matching is exact and mandatory.** A URL param only populates the form if a Hidden Field with the *identical* name already exists in that Typeform's builder (Create panel → Logic/Hidden Fields), lowercase with underscores (e.g. `utm_source`, not `UTM-Source`). Unmatched param names are silently ignored — not stored, no error. This means **the new Typeform's hidden-field setup is a hard prerequisite**, not just a code change.
- Typeform separately offers a **native "UTM Tracking" toggle** (Settings → Tracking) that auto-captures the 5 standard UTM keys without manually defining hidden fields — but multiple sources describe this as a **paid/Business-plan-gated feature** (MEDIUM confidence on the plan-gating specifics; Typeform's plan pricing may have changed). The free Hidden Fields mechanism achieves the same practical outcome for this milestone's stated goal without depending on plan tier, so it's the safer default to build against.
- **No hard character-limit is documented for individual hidden-field values.** The real constraint is the shared browser/server **~2048-character URL length ceiling** across the whole query string — irrelevant at normal UTM value lengths, but a reason not to blindly forward arbitrarily long values (e.g. a full encoded referrer URL with its own huge query string).
- Values are plain strings; the official docs' own example (`name=Bruce Wayne`) proves text works. One old community comment claims "numerical only," but it contradicts current docs and is treated as stale/unreliable (LOW confidence, disregarded).
- Typeform reads URL-param hidden-field values **once, at form load** — they cannot be changed by anything the respondent later types into the form, and (per Typeform's own docs) this only works if the visitor reaches the form via a URL carrying those params in the *same request* — there's no server-side session on Typeform's end that would let a later, param-less visit "remember" earlier attribution.

## Feature Landscape

### Table Stakes (Users Expect These)

These are the minimum to say "the new brand's applications carry accurate attribution" — the milestone's literal Core Value statement.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Capture the 5 standard UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) from the incoming request URL | This is literally what "lead-source attribution" means in the requirement; without it there's nothing to attribute | LOW | Read from `searchParams`/`request.url` on whichever page first receives them (see dependency note below on homepage vs `/apply` landing) |
| Forward captured UTM values as matching Typeform Hidden Field URL params on the redirect `Location` | Values are worthless if not delivered to Typeform in the format it actually reads | LOW | Query-string (`?`) format on the Typeform URL; must URL-encode each value |
| Pre-create matching Hidden Fields (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, plus e.g. `referrer`, `landing_page`) in the new Typeform's builder, with exact lowercase/underscore names | Typeform silently drops any param whose name doesn't match a pre-defined hidden field — this is the single most common way this feature silently fails | LOW (manual, non-code) but **blocking**: no amount of correct redirect code works without this | Must happen as part of "new Typeform created for the 4th brand" work, not an afterthought |
| Best-effort capture of the HTTP `Referer` header and forward it as a `referrer` hidden field | Distinguishes organic/direct/social/dark-social traffic when UTMs are absent — most real traffic won't have UTMs | LOW | Referer is unreliable by nature (stripped by many browsers/ad-blockers, cross-origin policies, some social apps' in-app browsers) — treat as best-effort, not guaranteed, and don't let its absence break anything |
| Graceful handling of missing/absent UTM params (direct traffic, bookmarked links, internal testing) | Most non-ad traffic won't carry any UTMs at all; the redirect must not error, degrade, or produce a malformed Typeform URL when params are absent | LOW | Simply omit hidden-field params that have no value rather than passing `utm_source=` empty strings |
| Allowlist exactly which incoming query params get forwarded (the UTM 5 + referrer/landing-page, nothing else) | Blindly forwarding every incoming query param risks leaking internal params, PII, or unexpected data into the Typeform URL/response record, and bloats the URL | LOW | Build an explicit allowlist in the redirect logic rather than a passthrough of `req.nextUrl.searchParams` wholesale |
| Decide and implement where UTMs are captured: homepage (`/`) vs `/apply` directly | Marketing ad destination URLs will point at *one specific page* — if that's the homepage, the homepage's CTA link to `/apply` must itself forward the query string, or the UTMs never reach `/apply` at all | MEDIUM | This is a real open dependency/gap, not solved by "just read `/apply`'s own URL" — see Feature Dependencies below |
| URL-encode all forwarded values | Campaign names, referrers, and content values routinely contain spaces/`&`/`=`/unicode that will corrupt the redirect URL or misparse into extra hidden fields if not encoded | LOW | Standard `encodeURIComponent` per value before building the query string |

### Differentiators (Competitive Advantage — Not Required for v1)

Valuable, but the milestone's stated Core Value is satisfied without them. Consider only if the team specifically asks for deeper attribution later.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| First-touch attribution persistence via cookie across multiple page views before converting | Solves the case where a visitor browses `/`, `/more-success`, etc. across multiple sessions before clicking Apply, losing the original UTM params along the way | MEDIUM | Requires a cookie + read-back logic; real complexity jump from "stateless redirect" to "stateful capture." Third-party tools (Attributer, LeadSources) exist specifically to solve this — a build-vs-buy decision if it's ever needed |
| Capture ad-platform click IDs (`gclid`, `fbclid`, `msclkid`) alongside UTMs | Enables ad-platform-side conversion matching/retargeting beyond what UTM strings alone give you | LOW–MEDIUM | Same mechanical pattern as UTM capture (allowlist + forward), so cheap to add once the core pipeline exists — good v1.x candidate, not v1 |
| Typeform's native paid "UTM Tracking" toggle (Settings → Tracking) | Removes the need to manually define/maintain Hidden Fields for the 5 UTM keys | LOW if already on a qualifying plan | Don't build around this for v1 — it's plan-gated and the free Hidden Fields path already meets the requirement; treat as a possible future consolidation, not a dependency |
| Structured "landing page" hidden field capturing the full incoming URL/path (not just referrer) | Useful when several ads point at different pages/paths on the same brand domain, to disambiguate beyond just "which brand" | LOW | Nice enrichment; can piggyback on the same allowlist mechanism cheaply |
| Cross-domain session linking (GA4/GTM linker, `_ga` param passing) between the Next.js site and the `*.typeform.com` domain | Would let a full analytics platform stitch sessions across the domain hop | HIGH | Explicitly out of scope per PROJECT.md ("no analytics/error-monitoring platforms this milestone") — mentioned here only to name it as deliberately deferred, not to plan for it |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Custom in-repo database/backend to store lead + attribution records | Feels like "real" attribution tracking a team can query/report from | PROJECT.md explicitly rules this out; adds a datastore, auth, and ops surface to a static, no-backend site for a problem Typeform already solves | Let Typeform's own Responses table be the system of record for both lead data and attribution; export/report from there if needed |
| Client-side embed/JS hidden-field injection (`data-tf-hidden`, `data-tf-transitive-search-params`, Typeform embed SDK) | This is what most Typeform tutorials show, since embedding is Typeform's most common integration pattern | Irrelevant here: there is no iframe/embed in this project's flow (per PROJECT.md, the flow is a **server-side redirect**, and the homepage's inline form is explicitly decorative/out of scope). Adding embed JS would be solving a different problem than the one that exists | Build the destination URL server-side (or in the redirect handler) with plain query-string params; no client JS needed at all |
| Relying on the paywalled native Typeform "UTM Tracking" toggle as the primary mechanism | Looks like the "official"/simplest path in Typeform's UI | Adds a plan-tier dependency for a capability the free Hidden Fields mechanism already delivers; if the team isn't already on a qualifying plan, this blocks the feature entirely for no real benefit | Use manually-defined Hidden Fields (works on any plan) as described in Table Stakes |
| Forwarding every incoming query parameter unfiltered to Typeform | Feels like "don't lose any data," and is the least code to write | Risk of leaking unintended/internal params or accidental PII into a third-party tool's stored responses; also risks bloating the URL toward the ~2048-char practical ceiling with noise | Explicit allowlist of the 5 UTM keys + referrer/landing-page (+ later, click IDs) |
| Cookie-based multi-touch/cross-session attribution modeling for v1 | Sounds like "better" attribution | Solves a problem this flow likely doesn't have yet (Key Decision explicitly chose the simplest stateless query-param approach); adds cookie-consent/privacy surface area to a site that currently has none | Ship the stateless single-redirect capture first; revisit only if real data shows meaningful multi-session drop-off |

## Feature Dependencies

```
New Typeform's Hidden Fields defined (utm_source, utm_medium, utm_campaign,
utm_content, utm_term, referrer, landing_page — exact lowercase/underscore names)
    └──requires (manual setup, blocks everything below)──> Redirect logic maps
                                                            captured params onto
                                                            those exact names

Redirect logic captures UTMs + referrer from incoming request
    └──requires──> Decision: does ad traffic land on `/` or on `/apply` directly?
                       └──if `/`──requires──> Homepage CTA link forwards its own
                                              query string onto the `/apply` link
                       └──if `/apply`──requires──> nothing extra; `/apply` already
                                                    sees the params on its own URL

Allowlist-based param forwarding ──enhances──> Prevents open-ended/PII leakage
                                                (see anti-feature above)

Existing build guard (check-no-direct-typeform.mjs) ──constrains──> All attribution
                                                                    code must still
                                                                    route through
                                                                    /apply's existing
                                                                    host-resolution
                                                                    pattern, not a new
                                                                    hardcoded path
```

### Dependency Notes

- **Hidden Fields must exist before redirect logic is meaningful:** this is the single biggest risk of a silent, hard-to-detect failure — if the Typeform's builder doesn't have a Hidden Field named exactly `utm_source`, that value is dropped with no error visible anywhere. Verifying this (e.g., a test submission with `?utm_source=test123` and confirming it appears in Typeform's Responses table) should be a first-class part of this milestone's acceptance check.
- **Homepage vs `/apply` landing is an open question, not an implementation detail:** if marketing/ads point destination URLs at the bare homepage, the homepage's existing "Apply" CTA (a plain link presumably without query forwarding today) must be changed to append its own incoming `location.search`/`searchParams` onto the `/apply` href. If ads are configured to point directly at `/apply?utm_source=...`, no homepage change is needed. This should be confirmed with whoever sets up the ad destination URLs before or during phase planning — it changes whether one file (`app/apply/page.tsx`) or two files (plus the homepage CTA component) need edits.
- **Allowlist enhances safety without adding real cost:** since the allowlist is just a fixed array of expected key names checked against `URLSearchParams`, it costs nothing extra in complexity over a naive passthrough while closing off the PII/bloat risk noted in Anti-Features.
- **Build guard constrains architecture, not scope:** because the existing `scripts/check-no-direct-typeform.mjs` prebuild check blocks any hardcoded Typeform reference outside `/apply`, the attribution-forwarding logic must live inside the same host-resolution code path already in `app/apply/page.tsx` (or a helper it calls) rather than as a separate redirect elsewhere.

## MVP Definition

### Launch With (v1)

- [ ] Read the 5 standard UTM params from wherever the visitor first lands (homepage or `/apply`, per the resolved dependency above) — essential to have anything to attribute
- [ ] Best-effort capture of `Referer` header — essential fallback for the (likely majority of) traffic with no UTMs
- [ ] Explicit allowlist of forwarded param names (UTM 5 + `referrer` + optionally `landing_page`) — essential guardrail, trivial cost
- [ ] Append allowlisted, URL-encoded values as query-string hidden-field params on the `/apply` → Typeform redirect `Location` — this is the actual delivery mechanism; without it, capture is pointless
- [ ] New Typeform's Hidden Fields pre-defined with exact matching names — essential, non-code prerequisite that the code depends on
- [ ] Verify with a manual test submission that params actually appear in Typeform Responses — essential acceptance check given the silent-failure mode described above

### Add After Validation (v1.x)

- [ ] Ad-platform click ID capture (`gclid`, `fbclid`) — add once the team wants ad-platform-side conversion matching, trivial extension of the existing allowlist mechanism
- [ ] `landing_page` hidden field with full path/URL — add if multiple distinct ad landing paths per brand make "which page" ambiguous from referrer alone

### Future Consideration (v2+)

- [ ] Cookie-based first-touch persistence across multiple sessions/pages before conversion — defer until real data shows meaningful UTM loss from multi-session visitor behavior; explicitly a build-vs-buy decision against tools like Attributer if it becomes a real need
- [ ] Native Typeform paid "UTM Tracking" toggle as a consolidation/replacement for manual Hidden Fields — defer; only relevant if/when the team is already paying for a qualifying Typeform plan for other reasons
- [ ] Any GA4/GTM/analytics-platform cross-domain session linking — explicitly out of scope for this milestone per PROJECT.md; revisit only as part of a dedicated future analytics milestone

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Capture + forward 5 UTM params via Hidden Fields | HIGH | LOW | P1 |
| Pre-define matching Hidden Fields in new Typeform | HIGH | LOW (manual) | P1 |
| Referer header capture (best-effort) | MEDIUM | LOW | P1 |
| Allowlist forwarded params | MEDIUM | LOW | P1 |
| Resolve homepage-vs-`/apply` landing + forward accordingly | HIGH | MEDIUM | P1 |
| Manual test-submission verification | HIGH | LOW | P1 |
| Click ID capture (gclid/fbclid) | MEDIUM | LOW | P2 |
| `landing_page` hidden field | LOW–MEDIUM | LOW | P2 |
| Cookie-based cross-session persistence | MEDIUM | HIGH | P3 |
| Native paid UTM Tracking toggle | LOW | LOW (if already paid) | P3 |
| Cross-domain analytics session linking | LOW (for this milestone's stated goal) | HIGH | P3 (explicitly deferred) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Sources

- [Form URL Parameters (formerly Hidden Fields) — Typeform Developers](https://www.typeform.com/developers/create/url-parameters/) — official, describes hash-based embed example and hidden-field declare/reference model
- [Using URL parameters (formerly Hidden Fields) — Typeform Help Center](https://help.typeform.com/hc/en-us/articles/360052676612-Using-URL-parameters-formerly-Hidden-Fields) (indexed via search; direct fetch returned 403, content triangulated from search snippets and community threads)
- [Source tracking through URL parameters — Typeform Help Center](https://help.typeform.com/hc/en-us/articles/360050914311-Source-tracking-through-URL-parameters) (indexed via search)
- [What is UTM tracking? — Typeform Help Center](https://help.typeform.com/hc/en-us/articles/360050914311-What-is-UTM-tracking-) — native Settings → Tracking toggle, plan-gating note
- [Hidden Fields in Embedded Forms: Query String (?) vs Fragment (#) — Typeform Community](https://community.typeform.com/integrate-your-typeform-43/hidden-fields-in-embedded-forms-query-string-vs-fragment-best-practice-and-compatibility-17152) — official Typeform staff (Phoebe VA) guidance on `?` vs `#` usage
- [Hidden fields not retrieved when using query parameter — Typeform Community](https://community.typeform.com/your-typeform-results-32/hidden-fields-not-retrieved-when-using-query-parameter-9729) — Typeform staff confirmation of API limitations around hidden fields
- [Passing UTM parameters from embedded typeforms — Typeform Community](https://community.typeform.com/typeform-guides-19/passing-utm-parameters-from-embedded-typeforms-2349) — `data-tf-transitive-search-params` (embed-only; not applicable to this project's redirect flow, included to explicitly rule it out)
- [The easiest way to capture UTM parameters in Typeform — Attributer](https://attributer.io/blog/capture-utm-parameters-in-typeform) — third-party framing of hidden-field limitations (single-session capture) and the multi-touch-persistence gap
- [Typeform Conversion Tracking Guide: GTM, Hidden Fields, and CRM Integration — ceaksan.com](https://ceaksan.com/en/typeform-conversion-tracking-guide) — third-party, corroborates query-string format for redirect (non-embed) flows
- [Is there a limit to the number of hidden fields? — Typeform Community](https://community.typeform.com/build-your-typeform-7/is-there-a-limit-to-the-numer-of-hidden-fields-limit-469) — practical ~2048-char URL length ceiling
- `.planning/PROJECT.md` — milestone scope, existing architecture, and explicit out-of-scope decisions (no custom backend, no analytics platform, redirect-not-embed)

---
*Feature research for: Typeform lead-source attribution (UTM/referrer) via server-redirect apply flow*
*Researched: 2026-07-29*
