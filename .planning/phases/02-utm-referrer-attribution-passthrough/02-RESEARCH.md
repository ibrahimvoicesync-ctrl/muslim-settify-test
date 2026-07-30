# Phase 2: UTM/Referrer Attribution Passthrough - Research

**Researched:** 2026-07-30
**Domain:** Next.js App Router request-scoped data capture (searchParams/headers) + query-string forwarding
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `components/cta.tsx` is confirmed dead code (zero imports anywhere in `app/`, `components/`, `apps/`). Implement attribution passthrough on the 4 *real* render files instead: `components/hero.tsx` (1 button), `components/navbar.tsx` (2 buttons — desktop + mobile), `components/apply-cta.tsx` (1 button, rendered on both `/` and `/more-success`). Skip `cta.tsx` entirely. "5 CTA locations" in ROADMAP/REQUIREMENTS means 5 *buttons* across 4 *files*, not 5 files.
- **D-02:** Every page that renders an Apply CTA captures its **own** incoming UTM params + `Referer` header independently, at that page's own request time — not a single global capture threaded through client-side navigation. `app/page.tsx` and `app/more-success/page.tsx` (both Server Components) each read their own `searchParams` prop + `headers()` Referer, build the allowlisted query string, and pass it down as a prop to the CTA-bearing client components they render. Internal navigation to `/more-success` is a normal full-page `<a>` nav (see D-05), so that page's own capture at that point is typically empty — expected and acceptable per ATTR-04, not a bug, not to be patched with query-forwarding on internal links.
- **D-03:** Single new file `lib/attribution.ts` (matches `lib/[helper-name].ts` convention) holds: (1) the 6-key allowlist constant `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`; (2) a capture/filter function used identically in three places — `app/page.tsx` and `app/more-success/page.tsx` (build outbound query string from incoming `searchParams` + `Referer` header), and `app/apply/page.tsx` (re-filter its own incoming query string through the *same* allowlist before appending to the resolved Typeform URL).
- **D-04:** The `Referer` HTTP header value is forwarded under the query param key `referrer` (double-r, lowercase) — matches TYPE-02's exact Hidden Field naming. No other key transformation.
- **D-05:** `AnimatedButton`'s existing `target="_blank" rel="noopener noreferrer"` behavior stays unchanged — out of scope for this phase, and it's *why* per-page Referer capture works cleanly (each Apply click is a fresh top-level navigation with the Referer header stripped by `rel="noreferrer"`, not an SPA route change).

### Claude's Discretion

- Exact function/variable names inside `lib/attribution.ts`, and whether the computed value is passed down as a pre-built query string or a plain object for the CTA components to serialize.
- Whether `app/page.tsx` / `app/more-success/page.tsx` opt into dynamic rendering explicitly or implicitly via using `searchParams`/`headers()`.

### Deferred Ideas (OUT OF SCOPE)

None new from Phase 2 discussion. Already-tracked v2 deferrals (unchanged, see `.planning/REQUIREMENTS.md` §"v2 Requirements"): `gclid`/`fbclid` capture (ATTR-06), `landing_page` hidden field (ATTR-07), cookie-based multi-touch persistence (ATTR-08), Typeform's native paid UTM Tracking toggle (ATTR-09), cross-domain GA4/GTM linking (ATTR-10).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ATTR-01 | Homepage captures incoming UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) and `Referer` header at landing time | `app/page.tsx` must become `async` and accept `searchParams: Promise<{...}>`; call `await headers()` for `Referer`. See Code Examples + Common Pitfalls (async searchParams/headers). |
| ATTR-02 | All 5 Apply CTA buttons (across `hero.tsx`, `navbar.tsx` ×2, `apply-cta.tsx`) forward captured UTM/referrer values as query params on their `/apply` links | Server Component pages compute the query string once and pass it as a prop into the (Client Component) CTA components, which build `href={`/apply${qs}`}`. See Architecture Patterns + Code Examples. |
| ATTR-03 | `app/apply/page.tsx` reads its own incoming allowlisted query params, appends them as Typeform Hidden Field query params on the outbound redirect URL via `URL`/`URLSearchParams` | Reuse `lib/attribution.ts`'s filter function against `/apply`'s own `searchParams`; append via `new URL(resolved)` + `url.searchParams.set(...)`. See Code Examples. |
| ATTR-04 | Missing/absent UTM or referrer values never break the redirect — hidden fields simply omitted, no empty-string params, no error states | Allowlist filter must treat `undefined`, missing key, and empty string identically (falsy check) and never call `.set()` for those. See Common Pitfalls #3. |
| ATTR-05 | Forwarded params limited to an explicit allowlist — no blind passthrough of arbitrary query params | Single shared allowlist constant in `lib/attribution.ts`, iterated explicitly (never `Object.entries(searchParams)` spread). See Don't Hand-Roll + Security Domain. |
</phase_requirements>

## Summary

This phase is pure request-scoped plumbing on a Next.js 16 App Router site (confirmed via `package.json`: `next@^16.0.10`, `react@19.2.0`). No new dependencies are needed — everything required (`searchParams` prop, `headers()`, `URL`/`URLSearchParams`) is either a Next.js built-in or a standard Web API already available in the Node/Edge runtime.

The single most important technical fact for the planner: **in Next.js 15+ (confirmed still true in 16.2.12, the currently-published docs version), both the `searchParams` prop and the `headers()` function are asynchronous — they return Promises and must be `await`ed.** `app/apply/page.tsx` already does this correctly for `headers()` (`const h = await headers()`), but `app/page.tsx` and `app/more-success/page.tsx` are currently **non-async, prop-less** Server Components — they must be converted to `async function` components that accept a `searchParams` prop and call `await headers()`. Reading either API automatically and unconditionally opts a route into **dynamic rendering** (no static prerendering) for the entire route — this is expected and required for this phase (attribution cannot work with fully static, build-time-only HTML), and it's already true of `/apply` today.

A second load-bearing finding: `AnimatedButton` (the shared CTA component) renders `<a href rel="noopener noreferrer" target="_blank">`. The `noreferrer` value **strips the `Referer` header entirely** on the click-through navigation to `/apply`. This confirms — and explains — CONTEXT.md's D-02/D-03 design: `/apply` must never rely on its own `headers().get('referer')` for the `referrer` hidden field (it would always be `null`/absent on a real Apply click); the landing page's own incoming `Referer` (captured before the click, when the visitor first arrived) is what must be forwarded, as a `referrer=` **query parameter**, through the `/apply` link itself. `/apply`'s job is only to re-filter its own incoming query string (which already contains `referrer=...` if the landing page forwarded it) through the same allowlist — not to independently read headers for this field.

**Primary recommendation:** Build one shared module `lib/attribution.ts` exporting (1) an `ATTRIBUTION_ALLOWLIST` constant array of the 6 keys, and (2) a pure filter function `filterAttributionParams(source: URLSearchParams | {[k: string]: string|string[]|undefined}) => URLSearchParams` that only sets a key when its value is a non-empty string. Use this identically in `app/page.tsx`/`app/more-success/page.tsx` (source = incoming `searchParams`, with `referrer` manually seeded from `headers().get('referer')` before filtering) and in `app/apply/page.tsx` (source = incoming `searchParams`, no separate Referer capture). Convert the filtered result to a query string once per page and pass it as a plain string prop into the CTA components.

## Architectural Responsibility Map

This is a single-tier Next.js app with no separate API/backend layer — the "Frontend Server (SSR)" tier plays the role both a typical API layer and SSR layer would play elsewhere.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Capture incoming UTM params + `Referer` header at landing | Frontend Server (SSR) | — | `searchParams` prop and `headers()` are Server-Component-only APIs; must run server-side per request (this is also why the route becomes dynamically rendered) |
| Compute allowlisted, filtered attribution value | Frontend Server (SSR) | — | Shared `lib/attribution.ts` module runs in the same Server Component request; no API boundary exists in this app to place it behind |
| Render dynamic `/apply?...` hrefs on CTA buttons | Browser / Client | Frontend Server (SSR) | `AnimatedButton`/`Hero`/`Navbar`/`ApplyCTA` are `"use client"` components — they receive the pre-computed query string as a prop from the server and interpolate it into a plain `<a href>`; no client-side computation of attribution values |
| Re-filter `/apply`'s own incoming query string | Frontend Server (SSR) | — | `app/apply/page.tsx` is already a Server Component; re-filtering must happen before the `redirect()` call, entirely server-side |
| Outbound redirect to Typeform with hidden-field params | Frontend Server (SSR) | CDN / Static (Typeform, external) | `redirect()` issues a 307 from the Next.js server; Typeform itself is an external third-party service outside this app's tiers |

## Standard Stack

### Core

No new libraries are required for this phase. Everything is either already a project dependency or a Web-standard/Next.js built-in.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` (built-in `next/headers`, `next/navigation`) | `^16.0.10` (docs verified against 16.2.12) [VERIFIED: package.json] | `headers()` for reading `Referer`; `redirect()` for the outbound Typeform redirect (already used in `app/apply/page.tsx`) | Framework-native APIs — no alternative library exists or is appropriate |
| `URL` / `URLSearchParams` (Web API, global in Node ≥18 and the browser) | N/A (runtime built-in) [CITED: developer.mozilla.org/en-US/docs/Web/API/URLSearchParams] | Building/appending the allowlisted query string safely (correct percent-encoding, no manual string concatenation) | Standard, dependency-free, already implicitly available; matches "don't hand-roll query strings" guidance |

### Supporting

None. This phase explicitly should not add any npm packages — see PROJECT.md's "no new frameworks" constraint and the Package Legitimacy Audit below.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `URLSearchParams` | `query-string` / `qs` npm packages | Unnecessary dependency for a 6-key allowlist; native API is sufficient and this project has zero existing query-string libraries |
| Per-page independent capture (locked, D-02) | Middleware-based global capture + cookie relay | Would require introducing cookies/persistence — explicitly ruled out by ATTR-08 (deferred to v2) and PROJECT.md's stateless constraint |

**Installation:** None required — no `npm install` needed for this phase.

**Version verification:** `next@^16.0.10` confirmed directly from this repo's `package.json` [VERIFIED: package.json read directly]. The Next.js docs fetched during this research (`nextjs.org/docs/app/api-reference/...`) report `version: 16.2.12` as the current documented release, consistent with the `^16.0.10` range in this repo — the async `searchParams`/`headers()` behavior described below was introduced at `v15.0.0-RC` and is unchanged through 16.x, so this repo is well past the relevant behavior-change boundary (no legacy-sync fallback applies here). [CITED: nextjs.org/docs/app/api-reference/file-conventions/page, nextjs.org/docs/app/api-reference/functions/headers]

## Package Legitimacy Audit

**No packages are installed in this phase.** ATTR-01 through ATTR-05 are implemented entirely with existing dependencies (`next`, `react`) and Web-standard globals (`URL`, `URLSearchParams`). The Package Legitimacy Gate is not applicable — there is nothing to check against the npm registry.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | N/A — no packages installed |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
Visitor's browser
      │
      │ GET / ?utm_source=fb&utm_medium=cpc&...   (ad click lands here)
      ▼
┌───────────────────────────────────────────────────────────────┐
│  app/page.tsx  (Server Component, becomes dynamic)             │
│  1. const sp = await searchParams   → {utm_source: "fb", ...}  │
│  2. const ref = (await headers()).get("referer")               │
│  3. const qs = attributionQueryString(sp, ref)  [lib/attribution.ts]
│  4. <Navbar applyQuery={qs} /> <Hero applyQuery={qs} />         │
│     <ApplyCTA applyQuery={qs} />                                │
└───────────────────────────────────────────────────────────────┘
      │  (server renders CTA hrefs as "/apply?utm_source=fb&...")
      ▼
Browser renders page; CTA <a> tags carry the query string
      │
      │ visitor clicks "Apply Now" → new tab, rel="noreferrer" strips Referer
      ▼
GET /apply?utm_source=fb&utm_medium=cpc&...
      ▼
┌───────────────────────────────────────────────────────────────┐
│  app/apply/page.tsx  (Server Component, already dynamic)       │
│  1. const h = await headers(); host = h.get("host")            │
│  2. resolved = resolveTypeformUrl(host)   [existing logic]     │
│  3. const sp = await searchParams                              │
│  4. filtered = filterAttributionParams(sp)  [SAME lib/attribution.ts function, no Referer re-capture]
│  5. finalUrl = appendAttributionParams(resolved, filtered)      │
│  6. redirect(finalUrl)   → 307 to Typeform                     │
└───────────────────────────────────────────────────────────────┘
      │
      ▼
https://form.typeform.com/to/<id>?utm_source=fb&utm_medium=cpc&referrer=...
```

The `app/more-success/page.tsx` path mirrors `app/page.tsx`'s steps 1-4 independently (its own `searchParams`/`headers()` read), per D-02 — it is not fed by `/`'s capture.

### Recommended Project Structure

```
lib/
├── utils.ts              # existing — cn() helper
└── attribution.ts        # NEW — allowlist constant + filter/build functions
app/
├── page.tsx               # MODIFY — async, reads searchParams+headers, passes query string down
├── more-success/page.tsx  # MODIFY — same treatment
└── apply/page.tsx         # MODIFY — re-filters own searchParams, appends to resolved Typeform URL
components/
├── hero.tsx               # MODIFY — accepts applyHref/applyQuery prop, uses it in AnimatedButton href
├── navbar.tsx              # MODIFY — same, for both desktop + mobile buttons
├── apply-cta.tsx           # MODIFY — same
└── cta.tsx                 # NO CHANGE — confirmed dead code (D-01), do not touch
```

### Pattern 1: Server-computed, client-rendered query string (prop passthrough)

**What:** The Server Component page computes the final `/apply?...` query string once and passes it down as a plain string (or the pre-filtered `URLSearchParams`/plain-object equivalent) prop to each Client Component that renders an Apply CTA. The Client Components never call `searchParams`/`headers()` themselves (they can't — those are Server-Component-only APIs) and never do their own filtering.

**When to use:** Any time request-scoped server data (query params, headers) needs to reach a `"use client"` leaf component in this codebase, given there's no global state store (confirmed in ARCHITECTURE.md).

**Example:**
```tsx
// Source: Next.js official docs pattern for searchParams + Server/Client composition
// app/page.tsx
import { headers } from "next/headers";
import { buildAttributionQuery } from "@/lib/attribution";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const referer = (await headers()).get("referer");
  const applyQuery = buildAttributionQuery(sp, referer); // e.g. "?utm_source=fb&referrer=..."

  return (
    <main className="min-h-screen">
      <Navbar applyQuery={applyQuery} />
      <Hero applyQuery={applyQuery} />
      {/* ... */}
      <ApplyCTA applyQuery={applyQuery} />
      <Footer />
    </main>
  );
}
```

```tsx
// components/hero.tsx ("use client") — only the href construction changes
export function Hero({ applyQuery = "" }: { applyQuery?: string }) {
  // ...
  return (
    // ...
    <AnimatedButton href={`/apply${applyQuery}`} className="...">
      Apply Now
    </AnimatedButton>
    // ...
  );
}
```

### Pattern 2: Shared allowlist filter, reused symmetrically at both ends

**What:** A single filter function is used both when *capturing* attribution on the landing pages and when *re-filtering* it on `/apply`. This guarantees ATTR-03 and ATTR-05 hold together even if `/apply` is hit directly with unexpected/extra params — the same allowlist logic runs both times, so there is no drift between what a landing page forwards and what `/apply` accepts.

**Example:**
```typescript
// Source: derived from Next.js searchParams typing + MDN URLSearchParams
// lib/attribution.ts
const ATTRIBUTION_ALLOWLIST = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
] as const;

type AttributionKey = (typeof ATTRIBUTION_ALLOWLIST)[number];
type SearchParamsInput = { [key: string]: string | string[] | undefined };

function firstValue(v: string | string[] | undefined): string | undefined {
  const value = Array.isArray(v) ? v[0] : v;
  return value ? value : undefined; // "" and undefined both become undefined
}

/** Filters an already-resolved searchParams object down to the allowlist. */
export function filterAttributionParams(
  source: SearchParamsInput,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ATTRIBUTION_ALLOWLIST) {
    const value = firstValue(source[key]);
    if (value) params.set(key, value);
  }
  return params;
}

/** Landing-page capture: same filter, plus manually seeding `referrer` from the Referer header. */
export function buildAttributionQuery(
  source: SearchParamsInput,
  referer: string | null,
): string {
  const params = filterAttributionParams(source);
  if (referer) params.set("referrer", referer);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** /apply's outbound append: safe against an already-absolute Typeform URL. */
export function appendAttributionParams(
  baseUrl: string,
  params: URLSearchParams,
): string {
  if ([...params.keys()].length === 0) return baseUrl;
  const url = new URL(baseUrl);
  for (const [key, value] of params) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}
```

```typescript
// app/apply/page.tsx — inside ApplyPage(), after `resolved` is computed
import { filterAttributionParams, appendAttributionParams } from "@/lib/attribution";

// ...
if (resolved) {
  const sp = await searchParams; // add `searchParams` to the page's props
  const filtered = filterAttributionParams(sp);
  redirect(appendAttributionParams(resolved, filtered));
}
```

### Anti-Patterns to Avoid

- **Spreading all incoming query params onto the redirect URL:** e.g. `new URLSearchParams(await searchParams)` without filtering. Violates ATTR-05 directly and is explicitly called out in REQUIREMENTS.md's Out of Scope table ("Forwarding every incoming query parameter unfiltered").
- **Calling `headers().get('referer')` inside `app/apply/page.tsx` for the `referrer` hidden field:** because `AnimatedButton` uses `rel="noopener noreferrer"`, this will always be `null` on a real click-through — it silently produces worse data than just re-filtering the `referrer` query param already forwarded by the landing page. See Common Pitfalls.
- **Forgetting `await` on `searchParams`/`headers()`:** in Next 15+/16, both are Promises; omitting `await` yields a Promise object where a plain object/Headers instance was expected, causing either a TypeScript build error or silent `undefined` property reads at runtime depending on how strictly it's typed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Query string construction/escaping | Manual `key=value&key2=value2` string concatenation | `URLSearchParams` (Web API, already global) | Handles percent-encoding of special characters in UTM values (e.g. spaces, `&`, `#`, non-ASCII campaign names) correctly; hand-rolled concatenation is a common source of broken/malformed redirect URLs and, in the worst case, HTTP header/URL injection if a value contains unescaped control characters |
| Reading/parsing the `Referer` header | Manual header string splitting off a raw headers object | `(await headers()).get('referer')` | Next.js's `headers()` already returns a spec-compliant read-only `Headers` object; `.get()` handles case-insensitivity (`Referer` vs `referer`) automatically |
| Allowlist filtering logic | Reimplementing the same 6-key check in 3 separate files | One shared `lib/attribution.ts` function, imported everywhere (D-03, locked) | Guarantees `/apply`'s re-filter allowlist can never drift from what the landing pages forward — a single source of truth for the entire ATTR-01..05 requirement set |

**Key insight:** Every problem this phase touches (query-string encoding, header reading, allowlist filtering) already has a first-class, dependency-free solution either in the Web platform or in Next.js itself. The only genuinely new code this phase should introduce is the *allowlist itself* (`lib/attribution.ts`) and the plumbing to call it from 3 call sites — not any parsing/encoding primitives.

## Common Pitfalls

### Pitfall 1: Forgetting `searchParams` and `headers()` are async in Next 15+/16

**What goes wrong:** Code written against pre-15 Next.js docs/muscle memory (`function Page({ searchParams })` treating it as a plain sync object, or `headers()` without `await`) either fails to type-check under strict TypeScript (this repo has `"strict": true`) or, if using `.js` files, silently receives a Promise instead of the resolved value.
**Why it happens:** This is a well-known breaking change from Next.js 14 → 15 (RC) that's easy to miss if relying on older training data or muscle memory. `app/apply/page.tsx` in this repo already correctly awaits `headers()`, but `app/page.tsx` and `app/more-success/page.tsx` currently have **no** `searchParams`/`headers()` usage at all and are not `async` — both must be converted.
**How to avoid:** Always type `searchParams` as `Promise<{ [key: string]: string | string[] | undefined }>` and `await` it inside an `async function` page component; always `await headers()`.
**Warning signs:** TypeScript errors like "Property 'utm_source' does not exist on type 'Promise<...>'"; or, in non-strict code, `undefined` values everywhere attribution should be present.

### Pitfall 2: `/apply` re-reading its own `Referer` header for the `referrer` field

**What goes wrong:** A tempting-but-wrong implementation has `app/apply/page.tsx` call `(await headers()).get('referer')` to populate `referrer`, since it already calls `headers()` for host detection. Because `AnimatedButton` sets `rel="noopener noreferrer"` on all Apply links, this will **always** be `null`/absent on a real click-through, silently dropping every real referrer value that the landing page correctly captured and forwarded as a query param.
**Why it happens:** `/apply` already has a `headers()` call in scope for host detection, making it easy to reach for the same call for `referrer` too, without noticing the `noreferrer` interaction.
**How to avoid:** `/apply` must only re-filter its **own incoming query string** (which already contains `referrer=...` if the upstream landing page forwarded it) through the shared allowlist — never independently source `referrer` from its own `headers()` call. This is what D-03/D-04 already lock in; this pitfall is about not accidentally reintroducing a second, broken capture path.
**Warning signs:** `referrer` hidden field in Typeform submissions is always empty in end-to-end testing (TYPE-03, Phase 3) despite the landing page's URL clearly having a non-empty `Referer` at first landing.

### Pitfall 3: Treating empty-string query values as "present"

**What goes wrong:** A URL like `/apply?utm_source=&utm_medium=cpc` has `utm_source` technically present as a key but with an empty string value. A naive filter using `key in searchParams` or `searchParams[key] !== undefined` will forward `utm_source=` (empty) onto the Typeform redirect, violating ATTR-04's "no empty-string params" requirement.
**Why it happens:** JavaScript's `in`/`!== undefined` checks don't distinguish "key present with empty value" from "key present with meaningful value."
**How to avoid:** Use a truthy check (`if (value) params.set(key, value)`), which treats `""`, `undefined`, and a missing key identically — all become "omit this param."
**Warning signs:** Typeform Results table shows hidden fields with literal blank values instead of the field being entirely absent from that submission.

### Pitfall 4: Homepage/`/more-success` losing static prerendering

**What goes wrong:** Once `app/page.tsx` and `app/more-success/page.tsx` read `searchParams`/`headers()`, Next.js forces the **entire route** into dynamic (per-request) rendering — these pages can no longer be served as pre-built static HTML from Vercel's edge/CDN cache. This is a real, measurable change in rendering behavior, not just a type-signature change.
**Why it happens:** `searchParams`/`headers()` are explicitly documented Request-time APIs; using either is "a binary switch" (all-or-nothing) for the whole route's rendering mode.
**How to avoid:** This is an accepted, intentional tradeoff for this phase (D-02 requires per-page independent capture, which requires reading these APIs) — not a bug to fix. Flag it in the plan's success criteria review so it isn't mistaken for a regression during Phase 2 execution or later performance review. No static-vs-dynamic mitigation (e.g., isolating the read into a nested Client Component with `useSearchParams()`) is appropriate here, because the Referer header specifically is only readable server-side.
**Warning signs:** Build output (`next build`) shows `/` and `/more-success` changing from `○ (Static)` to `ƒ (Dynamic)` in the route summary — expected for this phase, not a defect.

## Code Examples

Verified patterns from official Next.js documentation, adapted to this repo's file layout:

### Awaiting `searchParams` in a Server Component page

```tsx
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/page (v16.2.12 docs)
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = (await searchParams).filters
}
```

### Awaiting `headers()` for the Referer header

```tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/headers (v16.2.12 docs)
import { headers } from 'next/headers'

export default async function Page() {
  const headersList = await headers()
  const referer = headersList.get('referer') // null if absent — never throws
}
```

### Redirecting to an external URL (existing pattern in this repo, unchanged)

```tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/redirect (v16.2.12 docs)
// app/apply/page.tsx already does this correctly — redirect() is called
// outside any try/catch, and accepts the absolute Typeform URL directly.
import { redirect } from 'next/navigation'

if (resolved) {
  redirect(resolved) // 307 by default; throws NEXT_REDIRECT internally
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `searchParams`/`params` as synchronous props; `headers()`/`cookies()` as synchronous functions | Both are now `Promise`-returning and must be `await`ed (sync access still works in v15 for backwards compat but is deprecated and slated for removal) | `v15.0.0-RC` [CITED: nextjs.org/docs/app/api-reference/file-conventions/page, "Version History"] | This repo is on `next@^16.0.10`/docs-version `16.2.12`, well past this change — no legacy sync-access fallback should be relied upon; all new/modified code must use `await` |

**Deprecated/outdated:**
- Synchronous `searchParams`/`headers()` access: still technically functional as a backwards-compat shim per the Next.js "Good to know" notes, but explicitly documented as deprecated and scheduled for removal — do not write new code that relies on synchronous access even if it happens to still work today.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The generic query-string-building "best practice" digest (URLSearchParams `.set()` guarded by truthy checks) was sourced from an unauthenticated WebSearch AI summary rather than a single canonical spec/doc page — the underlying `URLSearchParams` API itself is MDN-documented and stable, but the specific "guard with truthy check" idiom is common-knowledge JS practice, not a quoted spec requirement. | Standard Stack, Code Examples (Pattern 2) | Low — `URLSearchParams` behavior itself is not in question (Web-standard, unambiguous); only the *idiom* for skipping empty values is asserted from general knowledge. Low risk if the planner/executor implements the truthy-check guard exactly as shown in Pattern 2's `firstValue()`/`filterAttributionParams()`. |

**If this table is empty:** N/A — see A1 above. All Next.js-specific claims (async `searchParams`/`headers()`, dynamic-rendering opt-in, `redirect()` behavior) were fetched directly from `nextjs.org` official docs during this research session and are tagged `[CITED]`, not `[ASSUMED]`.

## Open Questions

1. **Should attribution values have a length cap or character sanitization beyond the allowlist itself?**
   - What we know: REQUIREMENTS.md locks the allowlist (ATTR-05) as the sole filtering mechanism; no length/character constraints are specified anywhere in REQUIREMENTS.md, ROADMAP.md, or CONTEXT.md.
   - What's unclear: Whether pathologically long or unusual UTM values (e.g., a 10,000-character `utm_campaign` from a malformed ad-platform macro) should be truncated before being placed in a redirect `Location` header, to avoid hitting browser/proxy URL-length limits (~2000-8000 chars depending on client) and producing a broken redirect (which ATTR-04 explicitly says must never happen).
   - Recommendation: Treat as out of scope for v1 unless the planner wants to add a defensive length cap (e.g., `value.slice(0, 500)`) purely as a belt-and-suspenders measure against ATTR-04's "redirect must never break" guarantee — this is a reasonable, low-risk addition but not something CONTEXT.md locked, so flag it as a discretionary addition rather than a requirement if included.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | N/A — public marketing site, no auth anywhere in this app |
| V3 Session Management | No | N/A — no sessions/cookies introduced or used by this phase |
| V4 Access Control | No | N/A — no access-control boundaries touched |
| V5 Input Validation | Yes | Explicit allowlist (`ATTRIBUTION_ALLOWLIST`, 6 fixed keys) applied identically at capture time and at `/apply`'s re-filter step — this *is* the input validation control for this phase (ATTR-05) |
| V6 Cryptography | No | N/A — no cryptographic operations in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Unfiltered query-param passthrough leaking unintended/internal params (or accidental PII) into Typeform's stored responses | Information Disclosure | Explicit allowlist, already locked (ATTR-05); never spread/forward the raw incoming `searchParams` object |
| Header/URL injection via unescaped control characters in a UTM value or Referer header, corrupting the outbound `Location` header | Tampering | Use `URL`/`URLSearchParams` (`.set()`), which percent-encodes values automatically — never manually concatenate raw string values into the redirect URL |
| Attacker-supplied/spoofed UTM values or `Referer` header (anyone can craft `/?utm_source=whatever`) | Spoofing | **Accepted by design** — this is inherent to the marketing-attribution domain everywhere (not unique to this app) and is explicitly out of scope to "validate" the *truthfulness* of attribution data; the allowlist protects the *structure* of the outbound redirect, not the *accuracy* of the values within it |
| Open redirect via user-controlled destination | Tampering / Spoofing | Not applicable here — the redirect *destination* (which Typeform URL) is resolved entirely from the hardcoded, host-based `resolveTypeformUrl()` mapping already in place from Phase 1; user-controlled query params are only ever appended as query string values on top of a server-chosen destination, never used to choose the destination itself |

## Sources

### Primary (HIGH confidence)
- `next.config.ts`, `package.json`, `app/apply/page.tsx`, `app/page.tsx`, `app/more-success/page.tsx`, `components/hero.tsx`, `components/navbar.tsx`, `components/apply-cta.tsx`, `components/cta.tsx`, `components/ui/animated-button.tsx`, `lib/utils.ts`, `scripts/check-no-direct-typeform.mjs` — read directly from this repo [VERIFIED: local filesystem read]

### Secondary (MEDIUM confidence)
- https://nextjs.org/docs/app/api-reference/file-conventions/page (fetched directly, `version: 16.2.12`, `lastUpdated: 2026-03-05`) — `searchParams`/`params` Promise typing and version history [CITED]
- https://nextjs.org/docs/app/api-reference/functions/headers (fetched directly, `version: 16.2.12`, `lastUpdated: 2026-03-03`) — `headers()` async behavior, read-only `Headers` return type [CITED]
- https://nextjs.org/docs/app/api-reference/functions/redirect (fetched directly, `version: 16.2.12`, `lastUpdated: 2026-07-22`) — `redirect()` external-URL support, 307 default, must-be-outside-try/catch behavior [CITED]

### Tertiary (LOW confidence)
- WebSearch aggregation on "Next.js App Router dynamic rendering searchParams headers opt out static generation" and the generic URLSearchParams query-string-building idiom — corroborates but does not independently establish the primary/secondary sources above; the specific dynamic-rendering claim is independently confirmed by the official docs pages themselves (secondary sources), so this tier only backs the general "truthy-check" filtering idiom (see Assumptions Log A1)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all APIs confirmed directly against this repo's `package.json` and official, freshly-fetched Next.js docs matching the installed major version
- Architecture: HIGH — directly inspected every file this phase touches; the `rel="noopener noreferrer"` Referer-stripping finding was discovered by reading `components/ui/animated-button.tsx` directly, not assumed
- Pitfalls: HIGH — all four pitfalls are either confirmed by official docs (async APIs, dynamic rendering) or directly observed in this repo's actual component code (Referer stripping, current non-async page components)

**Research date:** 2026-07-30
**Valid until:** 2026-08-29 (30 days — Next.js major-version API behavior is stable; re-verify if `package.json`'s `next` version changes before execution)
