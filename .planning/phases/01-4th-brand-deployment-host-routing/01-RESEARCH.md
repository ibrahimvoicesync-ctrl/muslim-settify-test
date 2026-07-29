# Phase 1: 4th Brand Deployment & Host Routing - Research

**Researched:** 2026-07-29
**Domain:** Next.js host-based routing (code) + Vercel multi-project deployment & DNS (infra)
**Confidence:** MEDIUM (code portion HIGH — verified from actual source; Vercel/DNS portion MEDIUM — verified against official docs and live CLI, but blocked by an account-visibility gap discovered during research, see Open Questions)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Add a new hardcoded constant `H_MUSLIMSETTIFY_TYPEFORM_URL` in `app/apply/page.tsx`, following the exact same pattern as `MUSLIMSETTIFY_TYPEFORM_URL` / `SETTIFYOWTP_TYPEFORM_URL` / `SETTIFYHAQQAN_TYPEFORM_URL` — not env-var-driven.
- **D-02:** Value is a clearly-marked placeholder (e.g. `"https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY"`) until Phase 3 creates the real Typeform and swaps in the real ID.
- **D-03:** Add an exact-match (plus safe subdomain) check for `h.muslimsettify.com` in `resolveTypeformUrl`, placed **before** the existing `.endsWith(".muslimsettify.com")` block.
- **D-04:** Existing 3 brands' logic in `resolveTypeformUrl` is untouched except for insertion order — no rewriting of existing conditionals.
- **D-05:** New git branch name: `h-muslimsettify`, branching off `main`.
- **D-06:** Vercel project creation, branch tracking, custom domain (`h.muslimsettify.com`) attachment, and DNS records are in scope for Phase 1, but require the user's Vercel account/DNS registrar access — produce exact `vercel` CLI commands and step-by-step instructions rather than assuming autonomous execution. Treat as a guided manual step during execution.
- **D-07:** `TYPEFORM_URL` env var fallback mechanism is left as-is — the new brand does NOT rely on it.

### Claude's Discretion

User answered "you decide" for all discussion areas (Typeform placeholder strategy, deploy execution ownership, branch naming, domain/DNS readiness) rather than picking through each individually. D-01 through D-07 above are Claude's calls made on that basis — flagged in CONTEXT.md in case the user wants to override any of them before planning.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. Real Typeform creation and Hidden Field config explicitly deferred to Phase 3 (already scoped in ROADMAP.md); attribution/UTM logic explicitly deferred to Phase 2.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BRAND-01 | New Vercel project deployed for the 4th brand (`h.muslimsettify.com`), tracking a new branch off `main`, with its own custom domain and env vars | See `## Vercel Project / Branch / Domain Setup` — confirms multi-project-per-repo model is Vercel's supported pattern (and is *already* the pattern this codebase uses for its other 3 brands), gives exact CLI commands for project creation, branch tracking override, domain attach, and env var scoping |
| BRAND-02 | Exact-match host entry for `h.muslimsettify.com` added to `resolveTypeformUrl` in `app/apply/page.tsx`, placed before the `.endsWith(".muslimsettify.com")` check | See `## Code Examples` and `## Architecture Patterns` — quotes actual current source, shows exact insertion point |
| BRAND-03 | Existing 3 brands still resolve correctly and `check-no-direct-typeform.mjs` still passes | See `## Common Pitfalls` and `## Don't Hand-Roll` — explains exactly what the guard scans for and why the new constant is safe |

</phase_requirements>

## Summary

This phase has two distinct halves that must both be researched: a small, low-risk **code change** (add one new host-match branch to an existing `if`-chain in `app/apply/page.tsx`) and a **platform/infra operation** (stand up a 4th independent Vercel deployment with its own branch tracking, domain, and env vars). The code half is fully verified against the actual current file — the pattern is simple, consistent, and the new block is a pure insertion with no risk to the existing three brands as long as it goes in front of the `.muslimsettify.com` `.endsWith()` check.

The infra half is where this research earns its keep. Vercel's documented model (verified against official docs, current as of mid-2026) is: **one GitHub repository can be connected to multiple, independent Vercel Projects**, each with its own production branch (via Branch Tracking in Project Settings → Environments), its own custom domain(s), and its own environment variables. A single Project can only ever have one production branch/deployment, so "4 independent production deployments from 1 repo" requires 4 separate Vercel Projects — which, live CLI inspection confirms, is *already* the exact pattern this codebase's other 3 brands use (not a new pattern being introduced). This directly validates D-05/D-06 as stated: they are achievable, no adjustment needed.

However, live `vercel` CLI inspection of the account available in this environment surfaced an important gap that must be resolved before Phase 1 execution can proceed on the Vercel/DNS side: **the two Vercel teams visible to the currently-authenticated account only expose the `muslimsettify.com` domain — not `settifyowtp.com` or `settifyhaqqan.com`.** This means either those two domains live under a Vercel team/account this session cannot see, or a different setup is in play than PROJECT.md assumes. This does not block the code change (BRAND-02/BRAND-03), but it is a hard blocker for the domain-attach and DNS steps of BRAND-01 until a human confirms which Vercel team/account owns (or should own) the new `h.muslimsettify.com` project, and whether `muslimsettify.com`'s DNS zone is registrar-managed or Vercel-managed (this changes whether the CNAME step is manual-external or automatic).

**Primary recommendation:** Implement the code change exactly as D-01–D-04 specify (verified safe against the actual source and the build guard). For the Vercel/DNS half, follow the exact CLI command sequence in `## Vercel Project / Branch / Domain Setup` below, but insert a `checkpoint:human-verify` step before any domain/DNS action to confirm (a) which Vercel team owns/should own the new project, and (b) whether `muslimsettify.com`'s DNS is on Vercel nameservers or a third-party registrar — this determines whether the CNAME step is automatic or requires a manual registrar login.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Host header detection (`headers().get("host")`) | Frontend Server (SSR) | — | `app/apply/page.tsx` is a Next.js Server Component; host is read server-side per request, never in the browser |
| Host → Typeform URL resolution (`resolveTypeformUrl`) | Frontend Server (SSR) | — | Pure function executed server-side inside the same server component; no API route exists or is needed |
| Redirect execution (`redirect()`) | Frontend Server (SSR) | — | Next.js `redirect()` issues the HTTP 3xx response from the server component |
| Vercel project / branch tracking / domain attach | Deployment Platform (Vercel, outside the 5 standard app tiers) | — | Infra-layer configuration, not application code; done via Vercel dashboard/CLI, orthogonal to the Browser/SSR/API/CDN/DB tiers |
| DNS record (CNAME) for `h.muslimsettify.com` | External Registrar/DNS | Deployment Platform (Vercel) | The record must exist wherever `muslimsettify.com`'s authoritative nameservers are hosted — this may or may not be Vercel itself (see Open Questions) |
| Environment variables for the new brand | Deployment Platform (Vercel) | — | Per-project env vars set via `vercel env add` or dashboard; this phase's brand does not need any (D-01/D-07 — Typeform URL is hardcoded, not env-driven) |

No capability in this phase touches a database, CDN edge function, or client-side JS — it is 100% server-side redirect logic plus platform configuration, matching the existing architecture (`ARCHITECTURE.md`: "No API routes: Application flow uses HTTP redirects; no internal backend endpoints").

## Standard Stack

### Core

No new libraries are introduced by this phase. The existing stack is reused as-is:

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.0.10 (installed, per `package.json`) | App Router, `headers()`, `redirect()` | Already the framework in use; this phase extends existing code, doesn't add anything |
| react / react-dom | 19.2.0 (installed) | Server component rendering | Already in use |
| vercel (CLI) | 55.0.0 (installed locally, confirmed via `vercel --version`) [VERIFIED: local CLI] | Project creation, branch tracking, domain/DNS/env management | Official Vercel CLI, the only supported tool for scripted project/domain/env operations outside the dashboard |

**Version verification:** `next`, `react`, `react-dom` versions read directly from the project's own `package.json` — no registry check needed since these are already-installed, in-use dependencies, not new additions. `vercel --version` run locally returned `Vercel CLI 55.0.0 (Node.js 26.5.0)` [VERIFIED: local `vercel --version` invocation, 2026-07-29].

### Supporting

None — no new packages needed for this phase.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 4 independent Vercel Projects (1 per brand, all tracking their own branch) | Vercel Custom Environments (Pro/Enterprise feature) attached to branch patterns within ONE project | Custom Environments let one project serve multiple "production-like" environments each with their own domain/branch/env vars, avoiding N separate projects — but this is a Pro/Enterprise-tier feature [CITED: vercel.com/docs/git] and the existing 3 brands already use the N-separate-projects pattern (confirmed live via CLI), so switching models now would be inconsistent with established practice and out of scope for this phase |
| Hardcoded hostname branch in code | Vercel Edge Config / middleware-based routing table | Adds new infra (Edge Config) for a problem the existing `if`-chain already solves adequately at 4 brands; not justified until the number of brands grows much larger — matches CONVENTIONS.md's existing hardcoded-constant pattern |

## Package Legitimacy Audit

**Not applicable.** This phase introduces zero new npm/pip/cargo packages — it is a pure code edit (one new constant + one new conditional block in an existing file) plus Vercel platform/DNS configuration. `package.json` dependencies are unchanged.

**Packages removed due to [SLOP] verdict:** none (no packages evaluated — none introduced)
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
Visitor Browser
      │
      │  GET https://h.muslimsettify.com/apply
      ▼
┌─────────────────────────────────────────────┐
│ Vercel Edge Network                          │
│  - Routes request based on which Vercel      │
│    Project has this custom domain attached   │
│    (h.muslimsettify.com → NEW Vercel Project) │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────┐
│ NEW Vercel Project                            │
│  - Production branch: h-muslimsettify         │
│  - Serves the SAME codebase as the other 3    │
│    brands (same repo, same build)             │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────┐
│ app/apply/page.tsx (Server Component)         │
│  1. headers().get("host")                     │
│     → "h.muslimsettify.com"                   │
│  2. normalizeHost(host)                       │
│     → lowercase, strip port                   │
│  3. resolveTypeformUrl(normalizedHost)         │
│     → NEW branch checked FIRST:                │
│       exact-match "h.muslimsettify.com"        │
│       → H_MUSLIMSETTIFY_TYPEFORM_URL          │
│     → (existing checks run only if this        │
│        new block does NOT match)               │
│  4. redirect(resolved)                         │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
        External redirect to Typeform
        (placeholder URL until Phase 3)
```

A reader can trace the primary use case end-to-end: visitor hits the new subdomain → Vercel edge routes by domain-to-project mapping (not by code) → the *same* app code runs, but sees a different `Host` header → the code's own host-resolution logic (not Vercel) decides which Typeform to redirect to. This is the same flow as the existing 3 brands; only the "which Vercel Project owns this domain" mapping and the "which host string maps to which constant" table grow by one entry each.

### Recommended Project Structure

No new files or directories. Everything is confined to:

```
app/
└── apply/
    └── page.tsx        # add H_MUSLIMSETTIFY_TYPEFORM_URL constant
                         # add new host-match block inside resolveTypeformUrl()
                         # BEFORE the existing muslimsettify.com block
```

### Pattern 1: Hardcoded per-brand Typeform URL + host-match block

**What:** Each brand is represented by (1) one `UPPERCASE_SNAKE_CASE` string constant holding its Typeform URL, and (2) one `if` block inside `resolveTypeformUrl()` that returns that constant when the normalized host matches.

**When to use:** Any time a new brand/domain is added to this site, following the exact same 2-part pattern already used for the 3 existing brands.

**Example — actual current source** (`app/apply/page.tsx`, read 2026-07-29):

```typescript
// Source: app/apply/page.tsx (this repo, current HEAD)
const MUSLIMSETTIFY_TYPEFORM_URL = "https://form.typeform.com/to/ztBUiWgs";
const SETTIFYOWTP_TYPEFORM_URL = "https://form.typeform.com/to/jR36nOwS";
const SETTIFYHAQQAN_TYPEFORM_URL = "https://form.typeform.com/to/t5UXUG8L";

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0] ?? "";
}

function resolveTypeformUrl(host: string): string | null {
  const normalizedHost = normalizeHost(host);

  // Hard-protect the main domain so it can never "accidentally" point elsewhere.
  if (
    normalizedHost === "muslimsettify.com" ||
    normalizedHost.endsWith(".muslimsettify.com")
  ) {
    return MUSLIMSETTIFY_TYPEFORM_URL;
  }

  // Hard-protect the other two sites as well. We match loosely (includes)
  // because Vercel preview + custom domains can vary, but the host usually
  // includes the site slug.
  if (
    normalizedHost === "settifyhaqqan.com" ||
    normalizedHost.endsWith(".settifyhaqqan.com") ||
    normalizedHost.includes("settifyhaqqan")
  ) {
    return SETTIFYHAQQAN_TYPEFORM_URL;
  }

  if (
    normalizedHost === "settifyowtp.com" ||
    normalizedHost.endsWith(".settifyowtp.com") ||
    normalizedHost.includes("settifyowtp")
  ) {
    return SETTIFYOWTP_TYPEFORM_URL;
  }

  const configured = process.env.TYPEFORM_URL?.trim();

  return configured || null;
}
```

**Exact insertion point required by D-03/BRAND-02:** The new `h.muslimsettify.com` block must be inserted **before** the `muslimsettify.com` block (the very first `if`), because `h.muslimsettify.com` satisfies `normalizedHost.endsWith(".muslimsettify.com")` and would otherwise be silently captured by the parent brand's block. It must NOT be placed after — placing it later (e.g., after the `settifyhaqqan`/`settifyowtp` blocks but before the `muslimsettify.com` block) would still work correctly since only the `.muslimsettify.com` block poses a collision risk, but placing it as the very first check is simplest to reason about and matches D-03's literal wording ("before the existing `.endsWith(".muslimsettify.com")` block").

**Resulting shape (illustrative, not prescriptive of exact whitespace):**

```typescript
// New constant, alongside the existing three:
const H_MUSLIMSETTIFY_TYPEFORM_URL =
  "https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY";

function resolveTypeformUrl(host: string): string | null {
  const normalizedHost = normalizeHost(host);

  // NEW: must run before the muslimsettify.com check below, since
  // "h.muslimsettify.com" would otherwise match `.endsWith(".muslimsettify.com")`.
  if (normalizedHost === "h.muslimsettify.com") {
    return H_MUSLIMSETTIFY_TYPEFORM_URL;
  }

  // Existing: unchanged.
  if (
    normalizedHost === "muslimsettify.com" ||
    normalizedHost.endsWith(".muslimsettify.com")
  ) {
    return MUSLIMSETTIFY_TYPEFORM_URL;
  }

  // ... rest unchanged
}
```

`normalizeHost()` is reused as-is — it already lowercases and strips the port, which is all the new check needs (per CONTEXT.md's Reusable Assets note). No new helper function is required for a single new brand with a fixed, non-fuzzy subdomain.

### Anti-Patterns to Avoid

- **Adding `.includes("h.muslimsettify")` fuzzy matching for the new brand:** Two of the three existing brands use `.includes()` for Vercel preview-domain flexibility, but CONTEXT.md's Established Patterns note explicitly flags this as optional and not needed here — `h.muslimsettify.com` is a single fixed subdomain, not a fuzzy-matched slug. Using `.includes()` here would risk false-positive matches against unrelated hosts containing that substring. Use exact-match only, as D-03 specifies ("exact-match (plus safe subdomain)").
- **Inserting the new block after the `muslimsettify.com` block:** Would cause `h.muslimsettify.com` requests to silently redirect to the parent brand's Typeform instead of the new one — the exact regression BRAND-02 exists to prevent.
- **Making the new Typeform URL env-var-driven:** Would break consistency with D-01/D-04 and the established convention (CONVENTIONS.md: all constants are `UPPERCASE_WITH_UNDERSCORES` hardcoded, not env-configured) — reserve env vars for the existing generic `TYPEFORM_URL` fallback only, per D-07.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-brand production deployment with its own domain | A custom multi-tenant routing layer, a reverse proxy, or a middleware-based domain router | A second (third, fourth) Vercel Project connected to the same GitHub repo, each with its own Branch Tracking + Domain | This is Vercel's native, documented model for "one codebase, many independently-deployed brands" [CITED: vercel.com/docs/git — "Production branch" / "Customizing the production branch"], and it's the exact pattern the other 3 existing brands already use in this account (verified live via `vercel project ls` / `vercel domains ls`) |
| DNS record discovery for a new subdomain | Guessing the CNAME target or hardcoding a generic `cname.vercel-dns.com` value | `vercel domains add h.muslimsettify.com <project>` then `vercel domains inspect h.muslimsettify.com` (or the dashboard's Domains tab) to get the *exact* record Vercel expects for that specific domain/project pair | Vercel issues a project-specific CNAME target in some cases (e.g. `d1d4fc829fe7bc7c.vercel-dns-017.com`) rather than always the generic one — inspecting is the only way to get the authoritative value [CITED: vercel.com/docs/cli/domains] |

**Key insight:** Nothing in this phase should be custom-built. The code half reuses an existing, working pattern verbatim; the infra half reuses Vercel's own multi-project-per-repo primitive, which this codebase's own production setup already demonstrates works at scale (3 brands today, a 4th tomorrow).

## Common Pitfalls

### Pitfall 1: New brand's host check placed after the parent domain's `.endsWith()` check

**What goes wrong:** `h.muslimsettify.com` never reaches its own new block because `normalizedHost.endsWith(".muslimsettify.com")` already returned true and redirected to `MUSLIMSETTIFY_TYPEFORM_URL` instead.
**Why it happens:** JS `if/else if` chains evaluate top-to-bottom and return on first match; a broader subdomain check placed earlier will "swallow" any more specific host that happens to be a subdomain of it.
**How to avoid:** Insert the new `h.muslimsettify.com` exact-match block as the very first check in `resolveTypeformUrl`, before the `muslimsettify.com` block (per D-03, verified against actual source above).
**Warning signs:** Visiting `h.muslimsettify.com/apply` redirects to the *original* Muslim Settify Typeform instead of the new brand's — this is exactly REQUIREMENTS.md's BRAND-02 acceptance condition being violated.

### Pitfall 2: Assuming one Vercel Project can serve two independent "production" domains for two different brands

**What goes wrong:** Attempting to add `h.muslimsettify.com` as a second production domain on the *existing* `muslimsettify.com` Vercel Project, expecting it to track a different branch than `main`.
**Why it happens:** A single Vercel Project can only have one Production Branch at a time [CITED: vercel.com/docs/git — "there can be many preview branches, but only a single production branch"]. Domains can be assigned to *preview* branches within one project (via "Assign a domain to a Git branch"), but that produces a Preview deployment, not an independently-configured Production deployment with its own env-var set treated as production-grade.
**How to avoid:** Create a genuinely separate Vercel Project for the 4th brand (matches D-06 and the existing 3-brand pattern already in use in this account).
**Warning signs:** The new brand's deployment shows up under "Preview" in the Vercel dashboard instead of "Production", or env vars meant to be production-only leak into preview builds of the original brand.

### Pitfall 3: DNS record guessed instead of read from Vercel

**What goes wrong:** Manually typing a generic `cname.vercel-dns.com` value at the DNS registrar, which may not match the specific record Vercel expects for that domain+project pair, leaving the domain stuck in a "Pending" / "Invalid Configuration" state indefinitely.
**Why it happens:** Vercel sometimes issues a domain-specific CNAME target (e.g., `d1d4fc829fe7bc7c.vercel-dns-017.com`) rather than the generic shared one, depending on the project/plan.
**How to avoid:** After `vercel domains add h.muslimsettify.com <project>`, run `vercel domains inspect h.muslimsettify.com` (or check the dashboard Domains tab) to read the *exact* record Vercel is asking for, and set that value verbatim (including the trailing `.` if shown) at the DNS provider.
**Warning signs:** `vercel domains verify h.muslimsettify.com` keeps failing after DNS propagation should have completed (allow up to ~48h, though usually much faster).

### Pitfall 4 (discovered live, project-specific): Assuming the currently-authenticated Vercel account can see/manage all 3 existing brand domains

**What goes wrong:** Planning execution assumes DNS/domain steps for `h.muslimsettify.com` can proceed under whichever Vercel account is logged in locally, without confirming that account actually has visibility into the DNS zone/team that owns `muslimsettify.com`.
**Why it happens:** Live inspection during this research (see Environment Availability below) shows the locally-authenticated `vercel` CLI account belongs to two teams (`generista`, `ibrahim-7482's projects`); `muslimsettify.com` is visible under `generista`, but **`settifyowtp.com` and `settifyhaqqan.com` are not visible under either team**. This means either those two domains are owned by a Vercel team this session has no access to, or the actual production repo/account setup differs from what this local checkout represents.
**How to avoid:** Before attempting any domain/DNS step, confirm with the user which Vercel team should own the new `h.muslimsettify.com` project, and whether that team's account has the access needed to add a CNAME under `muslimsettify.com`'s DNS zone (Vercel-managed nameservers vs. third-party registrar — see Open Questions).
**Warning signs:** `vercel domains add h.muslimsettify.com <project>` fails with a permissions/ownership error, or the domain never verifies because the zone is controlled elsewhere.

## Code Examples

### Current `resolveTypeformUrl` structure (existing, unmodified logic)

```typescript
// Source: app/apply/page.tsx (this repo, read 2026-07-29 — quoted verbatim)
function resolveTypeformUrl(host: string): string | null {
  const normalizedHost = normalizeHost(host);

  if (
    normalizedHost === "muslimsettify.com" ||
    normalizedHost.endsWith(".muslimsettify.com")
  ) {
    return MUSLIMSETTIFY_TYPEFORM_URL;
  }

  if (
    normalizedHost === "settifyhaqqan.com" ||
    normalizedHost.endsWith(".settifyhaqqan.com") ||
    normalizedHost.includes("settifyhaqqan")
  ) {
    return SETTIFYHAQQAN_TYPEFORM_URL;
  }

  if (
    normalizedHost === "settifyowtp.com" ||
    normalizedHost.endsWith(".settifyowtp.com") ||
    normalizedHost.includes("settifyowtp")
  ) {
    return SETTIFYOWTP_TYPEFORM_URL;
  }

  const configured = process.env.TYPEFORM_URL?.trim();

  return configured || null;
}
```

### Prebuild guard: what it scans for and why the new constant is safe

```javascript
// Source: scripts/check-no-direct-typeform.mjs (this repo, read 2026-07-29 — quoted verbatim)
const NEEDLE = "form.typeform.com/to/";

/** @param {string} file */
function isAllowed(file) {
  const rel = toRel(file);
  // The only allowed place to contain a direct Typeform link is the server redirect endpoint.
  if (rel === "app/apply/page.tsx") return true;
  // Docs may reference the canonical link.
  if (rel === "README.md") return true;
  return false;
}
```

**Why the new brand's constant does not trip this guard:** The script walks `app`, `components`, `lib`, `apps` for any text file containing the literal substring `form.typeform.com/to/`, and fails the build if that substring appears **anywhere except** `app/apply/page.tsx` or `README.md`. Since D-01 places `H_MUSLIMSETTIFY_TYPEFORM_URL` inside `app/apply/page.tsx` — the one explicitly allow-listed file — adding it does not add a new hit anywhere disallowed. `npm run prebuild` will keep passing as long as (1) the new constant/URL stays inside `app/apply/page.tsx`, and (2) no other file (e.g. a README update mentioning the new form, if added later) introduces the substring outside the two allowed locations. The guard has no allowlist limit on *how many* Typeform links exist in the allowed file — it only cares about *location*, so a 4th hardcoded constant in the same file is unaffected.

## Vercel Project / Branch / Domain Setup

All commands verified against official Vercel docs (`vercel.com/docs/cli/*`, fetched 2026-07-29) and cross-checked against the actual installed CLI (`Vercel CLI 55.0.0`) in this environment. `[CITED: vercel.com/docs/...]` unless noted otherwise.

### Step 0 — Confirm which Vercel team owns this work (do this FIRST, see Open Questions)

```bash
vercel teams ls
# Confirm which team should own the new h-muslimsettify project —
# do NOT assume the currently-selected scope is correct.
vercel switch <team-slug>   # if needed
```

Live output from this environment (2026-07-29) showed two teams: `generista` (owns the `muslimsettify.com` domain and the `muslim-settify` project live at `muslimsettify.com`) and `ibrahim-7482's projects` (personal team). Neither team's `vercel domains ls` output included `settifyowtp.com` or `settifyhaqqan.com` — flag this to the user before proceeding (see Open Questions).

### Step 1 — Create the branch (application-level, no Vercel dependency)

```bash
git checkout main
git pull
git checkout -b h-muslimsettify
git push -u origin h-muslimsettify
```

Per D-05, branch off `main`, named `h-muslimsettify`.

### Step 2 — Create a new, independent Vercel Project tracking this branch

Two equivalent paths — CLI (recommended for reproducibility) or Dashboard.

**CLI path**, run from the repo root, on the `h-muslimsettify` branch:

```bash
# This creates a NEW project (do not link to the existing muslimsettify.com project).
# When prompted "Link to existing project?", answer No and give it a distinct name,
# e.g. "h-muslimsettify".
vercel link --scope <team-slug>
```
`[CITED: vercel.com/docs/cli/project-linking]` — `vercel link` (or bare `vercel`) prompts to link an existing project or create a new one; creating one writes `.vercel/project.json` with the new `projectId`/`orgId` and auto-detects the Next.js framework preset.

```bash
# Connect the new Vercel Project to this repo's Git remote for auto-deploys.
vercel git connect --yes
```
`[CITED: vercel.com/docs/cli/git]` — `vercel git connect` reads the local `.git` remote config and links it to the Vercel Project linked to the current directory (i.e. the one just created via `vercel link`). `--yes` skips the confirmation prompt.

**Dashboard path (equivalent, if CLI project creation is not preferred):** Vercel Dashboard → "Add New" → "Project" → select the `ibrahimvoicesync-ctrl/muslim-settify-test` GitHub repo → give it a distinct project name (e.g. `h-muslimsettify`) → **before first deploy**, do not accept `main` as production branch if this UI step allows overriding it; otherwise proceed to Step 3 immediately after creation. `[CITED: vercel.com/docs/git — "Deploying a Git repository"]`

### Step 3 — Set the Production Branch to `h-muslimsettify` (not `main`)

By default, a newly-created project's production branch defaults to `main` (or `master`, or the repo's default branch) `[CITED: vercel.com/docs/git — "Default configuration"]`. This MUST be overridden — otherwise the new project would auto-deploy `main` (the shared codebase branch that all 4 brands' work lands on), defeating the purpose of an independent per-brand branch.

**Dashboard (this step currently has no direct CLI equivalent — `vercel project` CLI does not expose a branch-tracking subcommand):**
1. Go to the new Vercel Project → Settings → **Environments**.
2. Click the **Production** environment → **Branch Tracking**.
3. Change the branch name from `main` to `h-muslimsettify` → **Save**.

`[CITED: vercel.com/docs/git — "Customizing the production branch"]`. From this point forward, only pushes to `h-muslimsettify` trigger a production deployment on this project; `main` pushes will not affect it (they'll be picked up as a non-production/preview build unless the project is also configured to ignore `main`, which is not necessary for this phase).

### Step 4 — Add the custom domain

```bash
vercel domains add h.muslimsettify.com h-muslimsettify --scope <team-slug>
```
`[CITED: vercel.com/docs/cli/domains]` — `vercel domains add [domain] [project]` attaches the domain to the specified project. If the domain is already attached elsewhere and needs to move, add `--force` (removes it from the prior project first) — do NOT use `--force` here unless explicitly confirmed the domain isn't in active use elsewhere, since forcing would detach it from wherever it currently resolves.

```bash
vercel domains inspect h.muslimsettify.com --scope <team-slug>
```
Read the exact DNS record Vercel expects (CNAME target may be domain-specific, not a fixed generic value) `[CITED: vercel.com/docs/cli/domains]`.

### Step 5 — Configure DNS for the subdomain

Because `h.muslimsettify.com` is a **subdomain** of the existing `muslimsettify.com` root domain (not a new root domain), the DNS answer is: **add a single CNAME record on the existing `muslimsettify.com` DNS zone**, not a new domain registration.

- **Record type:** `CNAME`
- **Name/Host:** `h`
- **Value:** whatever `vercel domains inspect h.muslimsettify.com` returns (commonly `cname.vercel-dns.com.` or a project-specific value like `d1d4fc829fe7bc7c.vercel-dns-017.com.` — copy exactly, including the trailing period if shown) `[CITED: community.vercel.com + vercel.com/docs/cli/domains]`
- **Where to make this change:** whoever/whatever controls the DNS zone for `muslimsettify.com` today. Live inspection during this research (`vercel domains ls`) showed `muslimsettify.com`'s Registrar/Nameservers listed as "Third Party" under the `generista` Vercel team — meaning DNS is **not** managed via Vercel's own nameservers, so this CNAME must be added manually at whatever third-party registrar/DNS provider currently hosts that zone (registrar identity itself was not determined by this research — confirm with the user, see Open Questions).

If `vercel dns` sub-commands are available for this domain (only applies if the domain's nameservers are delegated to Vercel, which live inspection suggests is NOT the case here), the equivalent CLI form would be:
```bash
vercel dns add muslimsettify.com h CNAME cname.vercel-dns.com.
```
`[CITED: vercel.com/docs/cli — vercel dns add usage]` — included for completeness, but likely not applicable given the "Third Party" nameserver finding above; the manual registrar-side CNAME is the expected path.

### Step 6 — Set environment variables (if any are needed)

Per D-07, this brand does not need any new env vars (its Typeform URL is hardcoded per D-01, not env-driven). If any project-level env vars are still desired (e.g., matching whatever baseline vars the other 3 brand projects carry, if any exist beyond `TYPEFORM_URL`):

```bash
vercel env add <NAME> production --scope <team-slug>
```
`[CITED: vercel.com/docs/cli/env]` — scopes the variable to the Production environment of the linked project; add a specific git branch as a third positional arg if scoping to `h-muslimsettify` specifically rather than "production" as a whole (equivalent here, since that branch IS this project's production branch after Step 3).

### Step 7 — Verify

```bash
vercel domains inspect h.muslimsettify.com --scope <team-slug>
# or
vercel domains verify h.muslimsettify.com --scope <team-slug> --format=json
```
Confirms DNS has propagated and the domain is correctly attached and verified `[CITED: vercel.com/docs/cli/domains]`. Then manually visit `https://h.muslimsettify.com/apply` in a browser and confirm the redirect lands on the placeholder Typeform URL (BRAND-01/BRAND-02 acceptance criteria), and re-visit `muslimsettify.com/apply`, `settifyowtp.com/apply`, `settifyhaqqan.com/apply` to confirm no regression (BRAND-03).

## Runtime State Inventory

*(Included per protocol trigger check — this phase is additive, not a rename/refactor/migration, but the questions are answered explicitly below for completeness since it touches deployment/DNS state.)*

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no database, no datastore keyed by brand name anywhere in this codebase (confirmed via ARCHITECTURE.md / INTEGRATIONS.md: static site, no backend) | None |
| Live service config | The 3 existing brand domains' DNS zones live outside this repo (at whatever registrar hosts them) — adding the 4th brand's subdomain requires a manual DNS-provider action not captured in git (see `## Vercel Project / Branch / Domain Setup` Step 5) | Manual DNS record add, tracked outside git — document the exact record added, where, in the phase's execution notes |
| OS-registered state | None — no OS-level task schedulers, services, or local daemons involved; this is a Vercel-hosted static/SSR site | None |
| Secrets/env vars | New brand introduces zero new secrets/env vars (D-07); existing `TYPEFORM_URL` fallback var, if set on other projects, is untouched | None |
| Build artifacts | None — no compiled/installed artifacts carry brand-specific names; `next build` output is generic across all 4 brand deployments (same codebase) | None |

**Nothing found in 4 of 5 categories** — verified by reading ARCHITECTURE.md, INTEGRATIONS.md, and the actual `app/apply/page.tsx` source; this is a static/no-backend site with no persisted brand-keyed state anywhere except the DNS zone itself (documented above).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev | ✓ | v26.5.0 [VERIFIED: local `node --version`] | — |
| npm | `npm run prebuild` / `npm run build` | ✓ | 11.17.0 [VERIFIED: local `npm --version`] | — |
| Vercel CLI | Project/branch/domain/env setup | ✓ | 55.0.0 [VERIFIED: local `vercel --version`] | Vercel Dashboard (all CLI steps in this research have a documented dashboard-equivalent) |
| Vercel account authentication | All Vercel CLI operations | ✓ | Logged in as `ibrahim-7482` [VERIFIED: local `vercel whoami`] | — |
| Local `.vercel` project link | `vercel git connect`, `vercel env`, etc. scoped to a specific project | ✗ (no `.vercel` directory exists yet in this repo checkout) [VERIFIED: local `ls .vercel`] | — | Run `vercel link` first (Step 2 above) — this is an expected, normal precondition, not a blocker |
| Vercel team access to `muslimsettify.com`'s DNS zone | Step 5 (CNAME record) | ⚠ UNCONFIRMED | `muslimsettify.com` shows Registrar/Nameservers = "Third Party" under the `generista` team [VERIFIED: local `vercel domains ls --scope generista`] | Human must confirm registrar/provider access before DNS step (see Open Questions) |
| Vercel team/domain visibility for `settifyowtp.com` / `settifyhaqqan.com` | Confirming BRAND-03's "no regression" requirement is even checkable by this session | ✗ — neither domain appears under either of the two teams visible to this account [VERIFIED: local `vercel domains ls --scope generista` and `--scope ibrahim-7482s-projects`] | — | Human must confirm which account/team manages these two domains, or confirm they're out of this session's reach entirely and regression-checking them is a manual/human task, not something this session's Vercel CLI can verify |

**Missing dependencies with no fallback:**
- Confirmed Vercel account/team access to manage DNS for `h.muslimsettify.com` under `muslimsettify.com`'s zone — cannot be substituted, must be resolved by the user before Step 5 can execute.

**Missing dependencies with fallback:**
- `.vercel` project link — trivially created by running `vercel link` (Step 2); not a real blocker, just an unlinked-yet state.

## Security Domain

ASVS Level 1 (per `.planning/config.json`: `security_asvs_level: 1`, `security_block_on: "high"`).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | Public marketing site, no auth anywhere in this phase or codebase |
| V3 Session Management | No | No sessions; stateless server-side redirect only |
| V4 Access Control | No | No access-controlled resources; `/apply` is public for all hosts |
| V5 Input Validation | Yes | The only "input" is the `Host` request header, already normalized via `normalizeHost()` (lowercase, strip port) and matched against a fixed allowlist of exact-match strings — never interpolated into a URL, file path, or command, so no injection surface. The new block must follow the same pattern: exact-string comparison only, no dynamic construction from the header value |
| V6 Cryptography | No | No cryptographic operations in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Host header spoofing (if behind a misconfigured proxy, an attacker-controlled `Host` header could cause an unexpected match/no-match) | Spoofing | Already mitigated by existing design: `resolveTypeformUrl` only ever *returns one of a small set of hardcoded constants* — it never uses the host value to construct a URL, filepath, or redirect target dynamically. Worst case of a spoofed/unmatched host is falling through to the generic `TYPEFORM_URL` env fallback or the "misconfigured" error page — never an open redirect to attacker-controlled input. This existing mitigation is preserved as-is by the new block (CONCERNS.md already documents this as a known, accepted risk with existing mitigation — no new risk introduced) |
| Open redirect via unvalidated redirect target | Tampering | Not applicable to the new code — the new constant, like the existing three, is a fixed literal string, never derived from request input |

No new threat surface is introduced by this phase: the new host-check block follows the exact same exact-match-only pattern as the existing three, which the codebase's own CONCERNS.md already documents as an accepted, mitigated risk (hardcoded allowlist, not free-form header trust).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|---------------|--------|
| N/A | N/A | N/A | This phase does not involve any deprecated pattern replacement — it's a straightforward extension of an already-current pattern |

**Deprecated/outdated:** None identified relevant to this phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | `h.muslimsettify.com` is intended as a subdomain of the existing `muslimsettify.com` root domain (not a new standalone domain) | Vercel Project / Branch / Domain Setup, Architectural Responsibility Map | If actually meant to be a separate root domain purchase, the entire DNS section (CNAME-on-existing-zone) is wrong and a new domain registration + full nameserver/A-record setup would be needed instead — low likelihood given the literal hostname format matches subdomain convention and REQUIREMENTS.md/ROADMAP.md consistently write it as `h.muslimsettify.com`, but not explicitly confirmed by the user as "yes, subdomain of the existing zone" |
| A2 | `muslimsettify.com`'s DNS zone is managed at a third-party registrar (not Vercel-delegated nameservers) | Vercel Project / Branch / Domain Setup Step 5, Environment Availability | Verified live via `vercel domains ls` showing "Third Party" nameservers — this is actually [VERIFIED: local CLI output] not assumed, but WHICH third-party registrar is unconfirmed, so exact login/UI steps for the DNS change can't be given, only the generic CNAME record instructions |
| A3 | The Vercel team that should own the new `h-muslimsettify` project is `generista` (the team that owns `muslimsettify.com`) | Vercel Project / Branch / Domain Setup Step 0 | If the intended team is different (e.g., a dedicated team per brand), project creation and domain-attach commands need the correct `--scope` value substituted; getting this wrong could create the project under the wrong team, requiring a transfer |
| A4 | `settifyowtp.com` and `settifyhaqqan.com` being invisible to this session's Vercel account does not indicate a broken/misconfigured existing setup, just an account-visibility gap for this research session | Common Pitfalls (Pitfall 4), Environment Availability | If it instead indicates those brands' Vercel projects were set up by a different person/account that no longer has access, or if PROJECT.md's "one repo, multiple Vercel projects" claim is inaccurate for those two brands specifically, BRAND-03's regression-check needs a different verification method (e.g., a teammate visually confirming those two redirects still work, rather than this session confirming via Vercel dashboard) |

## Open Questions

1. **Which Vercel team/account should own and can access the new `h.muslimsettify.com` deployment and DNS?**
   - What we know: The currently-authenticated Vercel account (`ibrahim-7482`) belongs to two teams — `generista` (owns `muslimsettify.com`, `successmuslimsettify.com`, `generista.co`) and a personal team (owns unrelated projects plus `muslim-settify-portal.com`, `fahrschule-bachaou.de`). This repo's own git remote (`ibrahimvoicesync-ctrl/muslim-settify-test`) matches a project name (`muslim-settify-test`) that exists under the *personal* team, not `generista`.
   - What's unclear: Neither team shows `settifyowtp.com` or `settifyhaqqan.com` in `vercel domains ls`. It's unclear whether those domains are managed by a third Vercel account/team not visible in this session, or whether this repo checkout is a sandbox/test copy separate from whatever repo is actually deployed in production for all 4 brands.
   - Recommendation: **Add a `checkpoint:human-verify` task before any Vercel project-creation or domain-attach step**, asking the user to confirm: (a) which Vercel team should own the new project, (b) whether that team's account can manage `muslimsettify.com`'s DNS zone at its actual registrar, and (c) whether this local repo checkout is the one actually connected to the live `muslimsettify.com`/`settifyowtp.com`/`settifyhaqqan.com` deployments, or a separate test/practice copy.

2. **Which registrar hosts `muslimsettify.com`'s DNS zone, and does the user/team have login access to it?**
   - What we know: `vercel domains ls` reports Registrar and Nameservers as "Third Party" for `muslimsettify.com` — i.e., DNS is not on Vercel's own nameservers, so the CNAME for `h.muslimsettify.com` must be added manually outside Vercel.
   - What's unclear: The specific registrar/DNS provider (GoDaddy, Namecheap, Cloudflare, etc.) was not discoverable via the Vercel CLI (it doesn't expose registrar identity beyond "Third Party").
   - Recommendation: Human confirms the registrar during execution; the plan should include a generic "add a CNAME record at your DNS provider" step rather than provider-specific UI instructions, with the exact record value obtained via `vercel domains inspect h.muslimsettify.com` at execution time (values can't be predicted in advance of project creation).

## Sources

### Primary (HIGH confidence)
- `app/apply/page.tsx` (this repo, read directly, 2026-07-29) — exact current `resolveTypeformUrl`/`normalizeHost` source
- `scripts/check-no-direct-typeform.mjs` (this repo, read directly, 2026-07-29) — exact prebuild guard logic
- `package.json` (this repo, read directly, 2026-07-29) — installed dependency versions
- Live `vercel` CLI output in this environment (`vercel --version`, `vercel whoami`, `vercel teams ls`, `vercel project ls`, `vercel domains ls`, `vercel project inspect`) — 2026-07-29

### Secondary (MEDIUM confidence — official Vercel documentation, fetched via WebFetch)
- [vercel.com/docs/git](https://vercel.com/docs/git) — "Deploying Git Repositories with Vercel", production branch defaults & customization, preview branches, domain-to-branch assignment
- [vercel.com/docs/cli/project-linking](https://vercel.com/docs/cli/project-linking) — `vercel link` behavior, `.vercel/project.json`
- [vercel.com/docs/cli/git](https://vercel.com/docs/cli/git) — `vercel git connect` / `disconnect`
- [vercel.com/docs/cli/domains](https://vercel.com/docs/cli/domains) — `vercel domains add/inspect/verify/rm`
- [vercel.com/docs/cli/env](https://vercel.com/docs/cli/env) — `vercel env add/ls/rm/pull/update`
- [vercel.com/docs/domains/working-with-domains/assign-domain-to-a-git-branch](https://vercel.com/docs/domains/working-with-domains/assign-domain-to-a-git-branch) — assigning a domain to a non-production branch

### Tertiary (LOW confidence — WebSearch aggregated summaries, used only to corroborate the above official-docs findings, not as standalone sources)
- WebSearch: "Vercel one GitHub repo multiple Vercel projects same repository different branches production deployment"
- WebSearch: "Vercel add subdomain to different project than root domain zone same Vercel account CNAME"
- WebSearch: "vercel CLI vercel domains add custom domain command and DNS CNAME instructions"

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages, versions read directly from `package.json`
- Architecture (code): HIGH — verified against actual current source of `app/apply/page.tsx`
- Architecture (Vercel/infra): MEDIUM — verified against official Vercel docs and live CLI state, but blocked on unresolved account/domain-visibility questions (see Open Questions)
- Pitfalls: HIGH for code pitfalls (derived directly from source); MEDIUM for infra pitfalls (derived from official docs + live CLI evidence)
- Security: HIGH — derived directly from existing, already-documented codebase mitigation (CONCERNS.md) plus direct source inspection

**Research date:** 2026-07-29
**Valid until:** 30 days for the code-pattern findings (stable); 7 days for the Vercel CLI command surface specifics (Vercel CLI/dashboard UI changes relatively often) — re-verify exact commands/flags if execution happens more than ~1-2 weeks after this research
