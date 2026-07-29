# Stack Research

**Domain:** Multi-project Vercel deployment + client/server UTM attribution passthrough (Next.js 16 App Router → Typeform redirect)
**Researched:** 2026-07-29
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

No new frameworks, runtimes, or paid services are required. Both new capabilities (4th Vercel project, UTM/referrer passthrough) are achieved entirely with the platform and dependencies already in place.

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|------------------|
| Vercel Git integration (multi-project) | N/A (platform feature, current) | Deploy the 4th brand as an independent Vercel Project pointed at the same GitHub repo | Vercel officially supports linking multiple separate Projects to one repository, each with its own **Production Branch** and its own custom domain assigned at the Project level — exactly the pattern the existing 3 brands already use, just with a 4th Project added via "New Project" → same repo → set Production Branch to the new branch. No forking, no separate repo, no monorepo tooling needed. |
| `next/headers` `headers()` | Bundled with Next.js 16.0.10 (already installed) | Read the `Referer` request header server-side | Already used in `app/apply/page.tsx` for `Host` detection. In Next.js 15+, `headers()` is **async** (`await headers()`) — confirmed current in Next.js 16.2.12 official docs. Same call site, same pattern, just add `.get("referer")`. |
| `searchParams` page prop | Bundled with Next.js 16.0.10 (already installed) | Read incoming UTM query params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) on the `/apply` request | Next.js App Router passes `searchParams` to `page.tsx` as a `Promise<{ [key: string]: string | string[] | undefined }>` in v15+ (App Router convention already in effect for Next.js 16). Await it in the existing `async function ApplyPage()` alongside the existing `await headers()` call — no new API surface. |
| `URL` / `URLSearchParams` (Web API, global) | Native to the JS runtime (no install) | Build the outgoing Typeform URL with attribution params appended | Standard, globally available in Node.js and the Edge runtime Next.js targets. Use `new URL(resolvedTypeformUrl)` then `url.searchParams.set(...)` for each captured param, then `redirect(url.toString())`. Handles encoding correctly (no manual `encodeURIComponent` string-building needed). |
| `redirect()` from `next/navigation` | Bundled with Next.js 16.0.10 (already installed) | Issue the external HTTP redirect to Typeform with attribution params attached | Already the exact mechanism `app/apply/page.tsx` uses to send visitors to Typeform. `redirect()` accepts any absolute URL, including external domains — this is standard, documented App Router behavior, not a workaround. Only change needed: pass the URL *with* appended query params instead of the bare hardcoded Typeform URL. |

### Supporting Libraries

None needed. This is the key finding: no npm install is required for either half of this milestone.

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| — | — | — | No supporting library applies. UTM capture, referrer capture, and query-string construction are all covered by Next.js built-ins + the Web `URL`/`URLSearchParams` APIs already available in the runtime. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `scripts/check-no-direct-typeform.mjs` (existing) | Prebuild guard blocking hardcoded Typeform links outside `/apply` | No changes needed to the script itself. The new brand's Typeform URL must be added as a 4th hardcoded constant inside `app/apply/page.tsx` (same pattern as the existing 3), which the guard already permits since it only flags Typeform references *outside* that file/route. |
| Vercel Dashboard → Project Settings → Git → **Production Branch** | Configure the new Vercel Project's production branch | Default production branch selection order is `main` → `master` → repo default branch. Must be explicitly changed to the new branch (e.g. `brand-4`) via Project Settings → Environments → Production → Branch Tracking, or every `main` commit will deploy to it prematurely — this is exactly the risk flagged in PROJECT.md's Key Decisions. |
| Vercel Dashboard → Domains | Assign the 4th brand's custom domain to the new Project | A production custom domain can only be assigned to a single Project (not shared/split), which is why a genuinely separate Vercel Project — not a domain alias on an existing project — is the correct approach here. |

## Installation

```bash
# No new dependencies for either capability in this milestone.
# Everything needed (headers(), searchParams, URL/URLSearchParams, redirect())
# ships with Next.js 16.0.10 / the JS runtime already in package.json.
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| 4th independent Vercel Project (same repo, new branch, new Production Branch setting, own domain) | Vercel Microfrontends / path-based rewrites to serve multiple projects under one domain | Only relevant if the 4th brand needed to share a domain with an existing brand or be composed into one app shell — not the case here; each brand has its own distinct domain, so this adds complexity for no benefit. |
| Query-string (`?utm_source=...`) attribution params appended to the Typeform redirect URL | Hash-fragment (`#utm_source=...`) params | Typeform's current docs primarily demonstrate the `#` hash syntax and recommend it for *sensitive* hidden-field values (hash fragments never reach the server/logs). For UTM values and `referrer` — non-sensitive attribution data — Typeform explicitly supports `?` query-string params on hosted (non-embedded) form links too, and query-string is what a `next/navigation` `redirect()` naturally produces via `URL`/`URLSearchParams`. Switch to `#` only if a future field is genuinely sensitive (e.g. an email or ID you don't want in server access logs). |
| Typeform's built-in **Source tracking** (Settings → Tracking) for the 5 standard UTM params | Manually declaring `utm_source`/`utm_medium`/etc. as custom "URL parameters" (Workflow → Pull data in) | Manual declaration is only needed for the *custom* `referrer` value, which has no built-in Typeform concept. The 5 standard UTM params are captured automatically by Typeform's native tracking as long as they're present in the query string of the URL the browser loads — which they will be, since the `/apply` redirect appends them. Don't manually redeclare UTM fields as hidden fields; that's redundant with the native feature. |
| Reading `Referer` via `next/headers` `headers()` in the existing Server Component | Client-side capture (`document.referrer` in a `"use client"` component, then forwarding via a client-side `fetch`/redirect) | Only needed if `/apply` ever becomes a client-rendered page (it isn't — it's a Server Component redirect today). Server-side header read is strictly simpler: one `await headers()` call already present, zero client JS added, zero flash-of-content before redirect. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| A UTM-tracking npm package (e.g. `next-utm`, custom middleware libraries, analytics SDKs) | Adds a dependency, a client-side script, and often cookie/localStorage persistence logic to solve a problem that's fully solvable with two built-in Next.js APIs already used in the codebase. Also contradicts PROJECT.md's explicit note that analytics platforms are out of scope for this milestone. | `searchParams` (App Router page prop) + `headers()` (already imported in `app/apply/page.tsx`) |
| Next.js Middleware (`middleware.ts`) to intercept and rewrite the attribution params | Over-engineered for this case — a `middleware.ts` file adds an edge-runtime execution hop, a new file/pattern not currently in the codebase, and doesn't simplify anything the existing `page.tsx` Server Component can't already do with one extra `await searchParams` line. | Keep the logic inline in `app/apply/page.tsx`, consistent with the existing single-file host-routing pattern |
| Manual string concatenation for the redirect URL (e.g. `` `${typeformUrl}?utm_source=${source}` ``) | Doesn't handle URL-encoding of param values (spaces, `&`, `#`, non-ASCII campaign names) and risks producing a malformed URL or a broken redirect if a param value contains a reserved character. | `new URL(typeformUrl)` + `url.searchParams.set(key, value)` — handles encoding automatically |
| A separate/forked repo for the 4th brand | Directly contradicts the existing architecture (one repo, host/branch-differentiated deployments) and the explicit Key Decision in PROJECT.md ("New brand uses same host-routing pattern as existing 3, not an independent deployment") | Same repo, new branch, new Vercel Project, new Production Branch setting |
| Declaring UTM params as Typeform "hidden fields"/URL parameters in addition to relying on native Source Tracking | Redundant — creates two overlapping mechanisms capturing the same data, doubling the surface area for the "why did this UTM value not show up" debugging problem | Use Typeform's built-in Settings → Tracking for the 5 standard UTM params; only declare a custom URL parameter for `referrer` |

## Stack Patterns by Variant

**If the new brand's `/apply` redirect needs to forward attribution params (this milestone's actual requirement):**
- In `app/apply/page.tsx`, extend the existing `async function ApplyPage()` to accept and `await` a `searchParams` prop, and extend the existing `await headers()` call to also read `referer`.
- Build the final redirect target with `new URL(resolvedTypeformUrl)`, then set `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` (only if present in the incoming `searchParams`) and `referrer` (from the `Referer` header, only if present) onto the URL's `searchParams`.
- Call `redirect(url.toString())` exactly as today.
- Because this reuses the exact same async Server Component + `headers()` + `redirect()` primitives already in the file — the diff is additive, not a rewrite.

**If a future brand needs a *different* Typeform field set/UTM schema than the others:**
- Keep the per-host `resolveTypeformUrl` mapping (unchanged pattern), but note that which incoming query params get forwarded is a per-request decision, not per-host — so if forwarding logic ever needs to differ by brand, that would be an explicit branch inside the `if (resolved)` block, not a new architecture.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| Next.js 16.0.10 | `headers()` / `searchParams` async (Promise-based) dynamic APIs | This became async starting Next.js 15.0.0-RC; Next.js 16 keeps the same async contract (confirmed against Next.js 16.2.12 official docs, 2026-03-03). The codebase already awaits `headers()` in `app/apply/page.tsx`, so no migration is needed — just extend the existing awaited call and add the equivalent `await searchParams`. |
| Next.js 16.0.10 | `redirect()` to external absolute URLs | Documented, stable App Router behavior — already exercised today by the 3 existing hardcoded Typeform redirects; unaffected by adding query params to the target URL. |
| Vercel Git integration | GitHub repo with 3 existing Projects/branches already attached | Adding a 4th Project pointed at the same repo is additive and does not affect the existing 3 Projects' branch tracking, domains, or env vars — each Project's Git/Domain/Environment-Variable configuration is fully independent even when they share a repo. Hobby plan supports up to 10 Projects/account and 50 domains/Project, well above the 4 needed here. |

## Sources

- https://vercel.com/docs/git — official Vercel docs (fetched directly), confirmed: multiple Projects can attach to one repo, Production Branch is configured per-Project via Settings → Environments → Branch Tracking, custom domains assign per-Project. HIGH confidence (primary source).
- https://vercel.com/blog/custom-production-branch, https://vercel.com/kb/guide/can-i-use-a-non-default-branch-for-production — corroborating official Vercel sources on non-default production branches. HIGH confidence.
- Vercel Hobby plan limits (10 projects/account, 50 domains/project) — cross-checked via web search against Vercel plan/limits pages. MEDIUM-HIGH confidence (not directly fetched from vercel.com/docs/limits, but consistent across multiple sources).
- https://nextjs.org/docs/app/api-reference/functions/headers — official Next.js docs (fetched directly), version 16.2.12, confirms `headers()` is async and must be awaited. HIGH confidence (primary source).
- Next.js 15 upgrade guide / async dynamic APIs (`searchParams`, `params`, `cookies()`, `headers()`) — cross-checked via web search against nextjs.org/docs/app/guides/upgrading/version-15 and nextjs.org/docs/messages/sync-dynamic-apis. HIGH confidence.
- https://help.typeform.com/hc/en-us/articles/360052676612-Using-URL-parameters-formerly-Hidden-Fields (fetched via reader proxy after direct fetch was blocked by Typeform's WAF) — confirms URL parameter declaration via Workflow → Pull data in, both `?` query string and `#` hash supported for hosted (non-embedded) form links, hash recommended for sensitive data. HIGH confidence (official Typeform help center content, content retrieved successfully).
- Typeform community thread "Hidden Fields in Embedded Forms: Query String (?) vs Fragment (#)" and Typeform Source/UTM tracking help articles — cross-checked via web search, confirms native UTM auto-capture via Settings → Tracking is separate from custom hidden-field/URL-parameter declaration. MEDIUM confidence (community-sourced but consistent with official help center language).
- Existing codebase: `app/apply/page.tsx` (read directly) — grounds all recommendations in the actual current implementation pattern (async Server Component, `await headers()`, hardcoded per-host Typeform URLs, `redirect()`).

---
*Stack research for: Multi-brand Vercel deployment + UTM/referrer attribution passthrough*
*Researched: 2026-07-29*
