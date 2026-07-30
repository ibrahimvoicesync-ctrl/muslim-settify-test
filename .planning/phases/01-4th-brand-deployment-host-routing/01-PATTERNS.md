# Phase 1: 4th Brand Deployment & Host Routing - Pattern Map

**Mapped:** 2026-07-29
**Files analyzed:** 1 (single-file code change) + infra config (no source files)
**Analogs found:** 1 / 1 (self-referential — the analog for the new code IS the existing code in the same file being extended)

## Summary

This phase is unusually narrow from a pattern-mapping perspective: there are **no new files**. The entire code change is an in-place extension of one existing file (`app/apply/page.tsx`), copying its own internal repeated pattern (one constant + one `if` block per brand) a 4th time. There is no separate "analog file" to search for elsewhere in the codebase — the analog *is* the file being edited, specifically the 3 existing brand blocks within it. The infra/Vercel/DNS work (BRAND-01) has no code-file representation at all — it is CLI commands and dashboard steps, already fully specified in RESEARCH.md's "Vercel Project / Branch / Domain Setup" section, and is out of scope for pattern-mapping (no source analog applies).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|------------------|----------------|
| `app/apply/page.tsx` (modified — add 1 constant + 1 conditional block) | route (Server Component, host-based redirect resolver) | request-response | `app/apply/page.tsx` itself (the 3 existing brand blocks: `MUSLIMSETTIFY_TYPEFORM_URL`, `SETTIFYHAQQAN_TYPEFORM_URL`, `SETTIFYOWTP_TYPEFORM_URL` blocks) | exact (self-analog — same file, same repeated pattern) |

No other files are created or modified. `scripts/check-no-direct-typeform.mjs` is **read but not modified** — it is a guard/config file whose behavior must remain passing; it is documented here as a shared constraint, not a file to pattern-match against.

## Pattern Assignments

### `app/apply/page.tsx` (route, request-response) — add `H_MUSLIMSETTIFY_TYPEFORM_URL` + new conditional block

**Analog:** the file's own existing pattern (`app/apply/page.tsx`, lines 4-45, read 2026-07-29 — quoted verbatim below)

**Imports pattern** (lines 1-2) — unchanged, no new imports needed:
```typescript
import { headers } from "next/headers";
import { redirect } from "next/navigation";
```

**Constant declaration pattern** (lines 4-6) — new constant goes alongside these three, same `UPPERCASE_SNAKE_CASE` naming convention, no env-var indirection:
```typescript
const MUSLIMSETTIFY_TYPEFORM_URL = "https://form.typeform.com/to/ztBUiWgs";
const SETTIFYOWTP_TYPEFORM_URL = "https://form.typeform.com/to/jR36nOwS";
const SETTIFYHAQQAN_TYPEFORM_URL = "https://form.typeform.com/to/t5UXUG8L";
```
New line to add (per D-01/D-02, placeholder value):
```typescript
const H_MUSLIMSETTIFY_TYPEFORM_URL =
  "https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY";
```

**Reused helper — do not modify** (lines 8-10):
```typescript
function normalizeHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0] ?? "";
}
```

**Core "host-match block" pattern to copy** — exact-match style, no `.includes()` (lines 12-21, the `muslimsettify.com` block is the correct style template per D-03's "exact-match plus safe subdomain" instruction — note this parent block itself is what the new block must be inserted *before*):
```typescript
function resolveTypeformUrl(host: string): string | null {
  const normalizedHost = normalizeHost(host);

  // Hard-protect the main domain so it can never "accidentally" point elsewhere.
  if (
    normalizedHost === "muslimsettify.com" ||
    normalizedHost.endsWith(".muslimsettify.com")
  ) {
    return MUSLIMSETTIFY_TYPEFORM_URL;
  }
  // ... (settifyhaqqan.com and settifyowtp.com blocks, lines 23-40, use .includes() —
  //      NOT the style to copy for this new brand, per D-03/RESEARCH anti-pattern note)
```

**New block to insert** (must be the very first `if` inside `resolveTypeformUrl`, before line 16's `muslimsettify.com` check — per D-03 and RESEARCH.md's "Pitfall 1"):
```typescript
if (normalizedHost === "h.muslimsettify.com") {
  return H_MUSLIMSETTIFY_TYPEFORM_URL;
}
```

**Fallback pattern — untouched** (lines 42-44, per D-07, new brand does not use this path):
```typescript
const configured = process.env.TYPEFORM_URL?.trim();
return configured || null;
```

**No error handling / try-catch pattern exists in this file** — it's a pure synchronous string-matching function; nothing to replicate here beyond the `if`-chain shape.

**No validation library used** — validation is implicit (exact string equality against a fixed literal), consistent across all 4 brands; do not introduce zod or any schema for this single new comparison.

**No test file exists for this route** (confirmed — no `__tests__`, no `*.test.ts` referencing `app/apply`; CONTEXT.md confirms "No test infrastructure exists"). Manual verification only: visit `h.muslimsettify.com/apply` and confirm redirect (per D-06/RESEARCH Step 7).

---

## Shared Patterns

### Brand host-block ordering constraint
**Source:** `app/apply/page.tsx` lines 12-40 (the full `if`-chain)
**Apply to:** The single new block being inserted
**Rule:** Order matters — first match wins. The new `h.muslimsettify.com` exact-match block MUST be placed before the `normalizedHost.endsWith(".muslimsettify.com")` check (line 18), or it will never be reached (RESEARCH.md Pitfall 1). No other files/blocks are affected; D-04 requires the 3 existing blocks' internal logic stay byte-for-byte unchanged, only insertion order changes.

### Prebuild guard compliance
**Source:** `scripts/check-no-direct-typeform.mjs` lines 44-51 (`isAllowed`)
**Apply to:** `app/apply/page.tsx` edit
**Rule:** The guard scans `app/`, `components/`, `lib/`, `apps/` for the literal substring `form.typeform.com/to/` and fails the build if found anywhere except `app/apply/page.tsx` or `README.md` (line 47, 49). Since the new constant's URL lives inside `app/apply/page.tsx` — the allow-listed file — `npm run prebuild` will continue to pass with no changes needed to the guard itself. Do not add the raw Typeform URL to any other file (e.g. a docs update) without also updating `isAllowed()`.

### Vercel multi-project-per-repo pattern (infra, not code)
**Source:** RESEARCH.md `## Vercel Project / Branch / Domain Setup` (Steps 0-7) — already fully detailed with exact CLI commands
**Apply to:** BRAND-01 execution (new Vercel project, `h-muslimsettify` branch tracking, `h.muslimsettify.com` domain attach, DNS CNAME)
**Note for planner:** No source-code analog applies to this half of the phase — it is Vercel CLI/dashboard operations only. Do not attempt to force-fit a "config file" pattern; there is no `vercel.json` or IaC file in this repo governing per-brand project setup (confirmed: no `vercel.json` at repo root per `ls` above). Follow RESEARCH.md's step-by-step commands directly.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Vercel project/branch/domain/DNS setup (no file — CLI/dashboard operations) | config (infra, not source) | N/A | Not a source file; no codebase analog applies. RESEARCH.md already provides the exact command sequence (Steps 0-7) and this should be used directly rather than pattern-matched. |

## Metadata

**Analog search scope:** `app/apply/page.tsx` (the only file touched by this phase); `scripts/check-no-direct-typeform.mjs` (read as a constraint, not modified); repo root (checked for `vercel.json` / IaC — none found)
**Files scanned:** 2 read in full (`app/apply/page.tsx`, `scripts/check-no-direct-typeform.mjs`), `package.json` scripts section, repo root listing
**Pattern extraction date:** 2026-07-29
