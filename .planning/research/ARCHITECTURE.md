# Architecture Research

**Domain:** Attribution passthrough integration into an existing Next.js host-routed redirect page
**Researched:** 2026-07-29
**Confidence:** HIGH (derived directly from reading the current `app/apply/page.tsx` and `scripts/check-no-direct-typeform.mjs` source, cross-checked against documented Next.js 15/16 async dynamic-API behavior)

This file scopes narrowly to the milestone's two integration points — a 4th domain entry and UTM/referrer passthrough — layered onto the *existing* apply-page architecture. It does not re-derive base architecture (see `.planning/codebase/ARCHITECTURE.md` for that).

## Standard Architecture

### System Overview (current, with new step highlighted)

```
┌─────────────────────────────────────────────────────────────┐
│  Browser navigates to https://<brand-domain>/apply           │
│  ?utm_source=...&utm_campaign=...   (+ Referer request header)│
└──────────────────────┬────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│  app/apply/page.tsx  (Server Component, runs on Vercel)        │
│                                                                 │
│  1. host = (await headers()).get("host")                       │
│  2. resolved = resolveTypeformUrl(host)      ← UNCHANGED        │
│                  (4th brand = one new branch, same shape)       │
│                                                                 │
│  3. NEW: read attribution                                       │
│     - utm params  ← (await searchParams) promise prop           │
│     - referrer     ← (await headers()).get("referer")           │
│                                                                 │
│  4. NEW: buildOutboundUrl(resolved, attribution)                │
│         → appends utm_*/referrer as query params to `resolved`  │
│                                                                 │
│  5. redirect(outboundUrl)               ← same redirect() call, │
│                                            new argument value    │
└──────────────────────┬────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│  Typeform (brand-specific form)                                 │
│  Reads utm_source / utm_campaign / referrer via its own          │
│  URL-param → hidden-field mapping (configured in Typeform UI,    │
│  not in this repo)                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Status |
|-----------|----------------|--------|
| `normalizeHost(host)` | Lowercase/strip-port a raw `Host` header value | **Unchanged** |
| `resolveTypeformUrl(host)` | Map normalized host → brand's base Typeform URL string, or `null` | **Modified** — one new `if` branch for the 4th domain, same shape as the existing 3; return type and signature untouched |
| `ApplyPage()` (default export) | Orchestrate: read host → resolve URL → **NEW: read attribution → build outbound URL** → redirect or render error | **Modified** — 2 new lines of orchestration, no change to existing control flow (still `if (resolved) { redirect(...) }` else render fallback) |
| New: attribution reader (inline in same file, or a small named function e.g. `readAttribution()`) | Read UTM params from `searchParams` and `referer` from `headers()` | **New** |
| New: URL builder (e.g. `withAttribution(baseUrl, attribution)`) | Merge attribution key/values onto `resolved`'s query string via `URL`/`URLSearchParams`, return final string | **New** |
| `scripts/check-no-direct-typeform.mjs` | Prebuild guard: fail build if `form.typeform.com/to/` literal appears outside `app/apply/page.tsx` (and `README.md`) | **Unchanged** — see Integration Points below for why this must stay true |

## Recommended Project Structure

No new files or folders are required. Keep every new function **inside `app/apply/page.tsx`**, colocated with `resolveTypeformUrl` and `normalizeHost`.

```
app/
└── apply/
    └── page.tsx   # normalizeHost() + resolveTypeformUrl() [existing, +1 branch]
                    # readAttribution() + withAttribution() [new, same file]
                    # ApplyPage() [existing, +2 lines of orchestration]
```

### Structure Rationale

- **Single file, no new module:** The only reason to extract attribution logic into `lib/` would be reuse elsewhere — there is no other call site (per PROJECT.md, `components/application.tsx` is confirmed dead code and out of scope). Extracting prematurely creates a second file that could contain the string `form.typeform.com/to/` in a future refactor and silently fail the guard's allowlist, which only permits `app/apply/page.tsx` and `README.md` (`scripts/check-no-direct-typeform.mjs:47-49`). Keeping the URL-building logic in the same file the guard already allowlists is the path of least resistance.
- **No new route, no new API endpoint:** This remains a pure server-redirect flow. There is no reason to introduce a Route Handler (`app/apply/route.ts`) — the existing page-based redirect pattern already runs server-side and already has access to both `headers()` and (via the page's `searchParams` prop) the incoming query string.

## Architectural Patterns

### Pattern 1: Server-side-only attribution capture (no client-side code needed)

**What:** Both attribution sources the milestone needs — UTM query params and referrer — are available synchronously to the server component, before any HTML reaches the browser. There is no gap that requires client-side JavaScript.

- **UTM params:** Since Next.js 15, and continuing in Next.js 16 (confirmed installed: `next@^16.0.10`), the `searchParams` prop passed to a page component is a `Promise` that must be awaited — exactly the same pattern already used for `headers()` in this file (`const h = await headers();`, line 48). Add a second prop, `searchParams`, typed `Promise<{ [key: string]: string | string[] | undefined }>`, and `await` it the same way.
- **Referrer:** The HTTP `Referer` request header (`headers().get("referer")`) is available through the exact same `headers()` call already on line 48 — no new API surface, no `document.referrer`. **`document.referrer` is a browser-only API and is never reachable here anyway**, because this page's success path never renders client HTML: `redirect()` throws a Next.js control-flow signal and the response is a 307/303 redirect before any client JS would execute. Client-side capture is not just unnecessary, it's architecturally impossible to reach on the happy path.

**When to use:** Any time a Next.js Server Component redirect needs to forward request-time context (query params, headers, cookies) to an external destination — always prefer reading it server-side in the same function that already has `headers()`/`searchParams` in scope, rather than adding a client component solely to read `document.referrer` or `window.location.search`.

**Trade-off:** The `Referer` header is browser/referrer-policy dependent — if the referring page sets a strict `Referrer-Policy` (e.g. `no-referrer` or cross-origin restrictions), the header may arrive empty even server-side. This is a data-completeness gotcha, not an architecture gap — it affects both server- and client-side capture equally, so it doesn't change the recommendation.

**Example (illustrative, not final code):**
```typescript
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const h = await headers();
  const host = h.get("host") ?? "";
  const resolved = resolveTypeformUrl(host); // unchanged

  if (resolved) {
    const sp = await searchParams;
    const referer = h.get("referer") ?? "";
    redirect(withAttribution(resolved, sp, referer)); // new: wraps existing redirect target
  }
  // ...unchanged fallback branch
}
```

### Pattern 2: Additive query-string merge via `URL`/`URLSearchParams`, not string concatenation

**What:** Build the outbound URL with `new URL(baseUrl)` and `url.searchParams.set(...)` rather than manually concatenating `?`/`&`. The base Typeform URLs today have no query string (`https://form.typeform.com/to/ztBUiWgs`), but using `URL`/`URLSearchParams` is correct regardless of whether a `?` is already present, and avoids double-`?` bugs if a base URL ever changes.

**When to use:** Whenever appending known-shape query params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer`) to a URL that's a plain string today.

**Trade-off:** None meaningful at this scale — this is strictly safer than string concatenation for negligible extra code.

**Example:**
```typescript
function withAttribution(
  baseUrl: string,
  sp: Record<string, string | string[] | undefined>,
  referer: string
): string {
  const url = new URL(baseUrl);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  for (const key of utmKeys) {
    const value = sp[key];
    if (typeof value === "string" && value.length > 0) {
      url.searchParams.set(key, value);
    }
  }
  if (referer) url.searchParams.set("referrer", referer);
  return url.toString();
}
```

### Pattern 3: 4th-domain addition follows the exact existing branch shape (no abstraction change)

**What:** `resolveTypeformUrl` currently has 3 sequential `if` blocks, each matching exact host, `.endsWith(".<domain>")`, and (for 2 of the 3) a loose `.includes("<slug>")` match, then falls through to the `TYPEFORM_URL` env fallback. Add the 4th brand as a 4th `if` block in the same position (before the fallback), reading a new env var (e.g. `SETTIFY<BRAND>_TYPEFORM_URL`), matching the same three-tier pattern (`===`, `.endsWith`, `.includes`) already used for `settifyhaqqan`/`settifyowtp`.

**When to use:** This is a closed pattern — resist the urge to refactor the 3 (soon 4) near-identical `if` blocks into a lookup table/map *in this same change*. That refactor is safe to do later but is a separate, higher-risk change (touches all 4 brands' routing at once) and should not be bundled with the attribution feature. Keep the two concerns (new domain, new attribution logic) as independently reviewable diffs.

**Trade-off:** Slight repetition (4 similar `if` blocks) vs. introducing a data structure change that touches all existing brand routing in the same commit as new functionality.

## Data Flow

### Request Flow (attribution passthrough)

```
Browser click on brand-domain link
  (e.g. https://newbrand.com/apply?utm_source=fb&utm_campaign=q3)
    ↓
Next.js routes to app/apply/page.tsx (Server Component)
    ↓
await headers()          → Host header    → normalizeHost() → resolveTypeformUrl()
await headers()          → Referer header → referrer string
await searchParams (prop)→ utm_* key/values
    ↓
withAttribution(resolved, utmParams, referrer)
    ↓ (pure string transform, no I/O)
redirect(<typeform-base-url>?utm_source=fb&utm_campaign=q3&referrer=...)
    ↓
Browser receives 307/303 → navigates to Typeform
    ↓
Typeform's own URL-param → hidden-field mapping (configured in Typeform UI)
  reads utm_source, utm_campaign, referrer from the URL and stores them
  against the submission
```

### Key Data Flows

1. **Host → brand resolution (unchanged):** `Host` header → `normalizeHost` → `resolveTypeformUrl` → base Typeform URL string or `null`. This flow is completely independent of attribution and must not be touched when adding UTM/referrer logic — it's the thing the build guard and existing 3-brand behavior depend on.
2. **Request context → attribution string (new):** `searchParams` promise + `Referer` header → filtered/whitelisted key-value pairs → appended to the base URL from flow #1. This flow is purely additive and only executes *after* `resolved` is confirmed non-null (i.e., inside the existing `if (resolved) { ... }` branch) — it never runs on the misconfigured-host error path, so it cannot affect that fallback's rendering.

## Scaling Considerations

Not applicable at meaningful scale for this milestone — this remains a single stateless server-rendered redirect per request, no new state, no new dependency, no new network call. The only "scale" axis worth naming: adding a 5th, 6th brand later should reconsider the `if`/`if`/`if`/`if` shape → lookup table (see Pattern 3), but that's an explicit non-goal for this milestone.

## Anti-Patterns

### Anti-Pattern 1: Adding a `"use client"` component to read `document.referrer` or `window.location.search`

**What people do:** Assume attribution capture needs a client-side effect because "browser APIs" feel like a client concern.
**Why it's wrong:** On the success path this page never renders to the client before redirecting — `redirect()` is called during server render and short-circuits the response. A client component would either never mount (redirect happens first) or would require deliberately delaying the redirect to let client JS run and re-navigate, which is slower, adds a visible flash, and duplicates data the server already has via `headers()`/`searchParams`.
**Do this instead:** Read everything server-side in `ApplyPage()`, exactly like the existing `headers()` call.

### Anti-Pattern 2: Extracting URL-building logic into a new `lib/typeform.ts` (or similar) module

**What people do:** Refactor for "cleanliness" by moving `resolveTypeformUrl`/`withAttribution` into a shared lib file, especially once the function list in `app/apply/page.tsx` grows past 2 functions.
**Why it's wrong:** `scripts/check-no-direct-typeform.mjs`'s `isAllowed()` (lines 44-50) allowlists exactly two paths: `app/apply/page.tsx` and `README.md`. The base Typeform URL constants (`MUSLIMSETTIFY_TYPEFORM_URL`, etc., and the new 4th) contain the literal substring `form.typeform.com/to/` that the guard scans for. Moving those constants — or any function that embeds them as a fallback/default — into a new file outside the allowlist will fail `npm run prebuild` the next time CI runs, with no code-level error, only the guard's exit code 1. If a future refactor genuinely needs a separate module, the guard's `TARGET_DIRS`/`isAllowed()` must be updated in the *same* change, not after the fact.
**Do this instead:** Keep all Typeform-URL-touching code (host resolution, 4th-domain branch, attribution query-building) inside `app/apply/page.tsx` for this milestone.

### Anti-Pattern 3: Passing attribution params through `resolveTypeformUrl(host)`'s signature

**What people do:** Thread `searchParams`/`referer` into `resolveTypeformUrl(host, searchParams)` so "everything URL-related" lives in one function.
**Why it's wrong:** Mixes two independent concerns (host→brand mapping vs. request→query-string decoration) into one function, making the 4th-domain diff and the attribution diff harder to review/test independently, and increases the risk of a typo in the new domain branch also breaking attribution for all 4 brands at once.
**Do this instead:** Keep `resolveTypeformUrl(host): string | null` exactly as-is (signature unchanged). Compose the two concerns in `ApplyPage()` itself: `redirect(withAttribution(resolveTypeformUrl(host), ...))`.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Typeform (4th brand's new form) | Query-string → Typeform's own "hidden fields from URL parameters" mapping, configured per-form in the Typeform UI (not in this repo) | This repo's only job is to produce a well-formed URL with the right query keys; the Typeform-side field mapping (e.g. mapping `utm_source` URL param to a hidden field) is an out-of-repo configuration step that must match whatever key names `withAttribution()` emits |
| Vercel (new project/domain for 4th brand) | New env vars for the 4th brand's base Typeform URL, set in that Vercel project's settings, following the existing `<BRAND>_TYPEFORM_URL` naming convention | No code change needed per-deployment beyond the one new `if` branch in `resolveTypeformUrl` — same env-var-per-brand pattern as the existing 3 |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `normalizeHost`/`resolveTypeformUrl` ↔ `ApplyPage()` | Direct function call, unchanged return contract (`string \| null`) | Host-resolution logic remains untouched by this milestone; the 4th-domain branch is additive within the same function |
| `ApplyPage()` ↔ new attribution functions | Direct function call within the same file, plain data (strings/URLSearchParams) — no shared state, no async I/O beyond the two `await`s Next.js already requires | New functions should be pure (given a URL string + params, return a new URL string) so they're trivially unit-testable in isolation from the host-matching logic, even though no test infra currently exists (per PROJECT.md) |
| `app/apply/page.tsx` ↔ `scripts/check-no-direct-typeform.mjs` | Build-time static text scan (`prebuild` script), not a runtime import | This is the boundary most at risk of silent breakage: any new file that contains the literal `form.typeform.com/to/` substring (e.g. a copy-pasted base URL constant) fails the build unless that file is `app/apply/page.tsx` itself or `README.md`. Verify this boundary explicitly in the phase that adds the 4th domain by running `npm run prebuild` (or the guard script directly) before considering the phase done |

## Sources

- `app/apply/page.tsx` (repo, read directly) — current `normalizeHost`/`resolveTypeformUrl`/`ApplyPage` implementation; confidence HIGH (primary source, current codebase state)
- `scripts/check-no-direct-typeform.mjs` (repo, read directly) — guard's `isAllowed()` allowlist and scan target dirs; confidence HIGH (primary source)
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md` (GSD codebase mapping) — confirms no API routes, no global state, static/server-redirect-only apply flow; confidence HIGH (curated internal source)
- Next.js documentation on async `params`/`searchParams` in Server Components (Next.js 15 introduced awaited `searchParams`; Next.js 16 extended the same requirement to `params`) — confirms the `Promise<...>` typing needed for the new `searchParams` prop; confidence MEDIUM (community secondary sources on general web search), corroborated HIGH by the fact that this exact codebase already awaits `headers()` on line 48, which only became necessary under the same Next.js 15+ async-dynamic-API change — so the pattern is directly evidenced in the installed `next@^16.0.10` codebase, not just inferred from external docs.

---
*Architecture research for: Attribution passthrough + 4th brand integration onto existing host-routed `/apply` redirect*
*Researched: 2026-07-29*
