---
phase: 01-4th-brand-deployment-host-routing
plan: 02
subsystem: infra
tags: [vercel, deployment, git-branching]

# Dependency graph
requires:
  - phase: 01-4th-brand-deployment-host-routing
    provides: "H_MUSLIMSETTIFY_TYPEFORM_URL routing branch in app/apply/page.tsx (plan 01-01)"
provides: []
affects: [01-03]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified: []

key-decisions: []

patterns-established: []

requirements-completed: []  # BRAND-01 not yet complete — plan paused at Task 1 checkpoint:decision

coverage: []

# Metrics
duration: in-progress
completed: null
status: paused
---

# Phase 01 Plan 02: Vercel Project + Branch Setup (PAUSED at Task 1 checkpoint)

**Live Vercel CLI evidence gathered (whoami/teams/projects/domains across both visible teams); execution paused before any platform mutation, awaiting the user's team-slug / repo-identity / DNS-provider decision required by Task 1.**

## Performance

- **Duration:** in progress (paused)
- **Started:** 2026-07-29T17:32:51Z
- **Tasks:** 0/3 complete (Task 1 evidence gathered, decision pending; Tasks 2-3 not started)
- **Files modified:** 0

## Accomplishments (so far)
- Ran the four required live Vercel CLI probes (`vercel whoami`, `vercel teams ls`, `vercel project ls` per team, `vercel domains ls` per team) and captured raw output for the user's decision
- Confirmed zero Vercel resources were created, linked, or modified — Task 1 is read-only by design
- Confirmed this is genuinely a sequential main-worktree execution (not a git worktree), so no worktree-safety branch checks applied

## Task Commits

No commits made yet — Task 1 (`checkpoint:decision`) performs no repository or platform mutation by design. This SUMMARY.md itself will be committed as a `docs` commit to record paused-execution progress.

## Live Evidence Gathered (Task 1)

### `vercel whoami`
```
ibrahim-7482
```

### `vercel teams ls`
```
  id                         Team name
✔ generista                  Generista
  ibrahim-7482s-projects     ibrahim-7482's projects
```

### `vercel project ls --scope generista`
```
Project Name                 Latest Production URL                    Updated   Node Version
muslim-settify-portal-dev    https://dev.muslimsettify.com            7d        24.x
muslim-settify-portal-main   https://portal.muslimsettify.com         8d        24.x
generista-co                 https://generista.co                     10d       20.x
muslim-settify-gt56          https://muslim-settify-gt56.vercel.app   55d       24.x
muslim-settify               https://muslimsettify.com                55d       24.x
```

### `vercel project ls --scope ibrahim-7482s-projects`
```
Project Name                          Latest Production URL                                            Updated   Node Version
al-rahmah                             https://al-rahmah.vercel.app                                     3d        24.x
muslim-settify-test                   https://muslim-settify-test.vercel.app                           15d       24.x
fahrstark                             https://fahrstark.vercel.app                                     21d       24.x
ryiahen-aloud                         https://ryiahen-aloud.vercel.app                                 26d       24.x
success-page-preview                  https://success-page-preview-ibrahim-7482s-projects.vercel.app   26d       24.x
muslim-settify-webinar-landing-page   https://muslim-settify-webinar-landing-page.vercel.app           26d       24.x
fahrschule_bachaou                    https://www.fahrschule-bachaou.de                                26d       24.x
al-mansurah                           https://al-mansurah.vercel.app                                   26d       24.x
al-mansurah-2                         https://al-mansurah-2.vercel.app                                 26d       24.x
ima-accelerator-v1                    https://ima-accelerator-v1.vercel.app                            26d       24.x
vorschau                              https://vorschau-eight.vercel.app                                26d       24.x
muslim-settify-landingpage            --                                                                26d       24.x
mentorship-saas                       --                                                                26d       24.x
muslim-settify-blog                   https://muslim-settify-blog.vercel.app                           26d       24.x
```

### `vercel domains ls --scope generista`
```
Domain                      Registrar           Nameservers         Expiration Date    Creator             Age
muslimsettify.com           Third Party         Third Party         -                  jamil-7850          76d
successmuslimsettify.com    Third Party         Third Party         -                  jamil-7850          103d
generista.co                Third Party         Third Party         -                  jamil-7850          659d
```

### `vercel domains ls --scope ibrahim-7482s-projects`
```
Domain                             Registrar           Nameservers         Expiration Date    Creator             Age
muslim-settify-portal.com          Third Party         Third Party         -                  ibrahim-7482        125d
fahrschule-bachaou.de              Third Party         Third Party         -                  ibrahim-7482        154d
```

### `git remote -v` (for repo-identity cross-check)
```
origin  https://github.com/ibrahimvoicesync-ctrl/muslim-settify-test.git (fetch)
origin  https://github.com/ibrahimvoicesync-ctrl/muslim-settify-test.git (push)
```

## Evidence Interpretation (not a decision — presented to the user for the checkpoint)

- `muslimsettify.com` is confirmed under **`generista`**, owned/created by `jamil-7850`, with third-party (non-Vercel) nameservers — consistent with RESEARCH.md.
- **Neither `settifyowtp.com` nor `settifyhaqqan.com` appears in `vercel domains ls` under either visible team.** This matches RESEARCH.md's flagged unknown and is not resolved by this session's evidence — those two brand domains remain invisible to this account.
- This repo's git remote (`ibrahimvoicesync-ctrl/muslim-settify-test`) matches project name `muslim-settify-test`, which is visible only under the **personal team** (`ibrahim-7482s-projects`), not under `generista`. A separate project, `muslim-settify` (no `-test` suffix), exists under `generista` and points at the live `muslimsettify.com` domain.
- This raises the exact ambiguity Task 1 exists to resolve: it is not yet established whether this checkout (`muslim-settify-test`) is the same repository backing the live `muslimsettify.com` / `settifyowtp.com` / `settifyhaqqan.com` deployments, or a separate/practice copy. The `-test` suffix on both the repo name and its matching Vercel project name is itself a signal worth the user's explicit attention.

## Decisions Made

None yet — this is the exact three-part decision Task 1's `checkpoint:decision` exists to gate:
1. Which Vercel team should own the new `h-muslimsettify` project (`generista`, `ibrahim-7482s-projects`, or another account/team not visible to this session)
2. Whether this checkout is the repository that actually serves the live muslimsettify.com / settifyowtp.com / settifyhaqqan.com brands (yes/no — a "no" halts the phase)
3. Which DNS provider holds the `muslimsettify.com` zone (needed by plan 01-03; may be deferred)

## Deviations from Plan

None — Task 1 executed exactly as written: live evidence gathered, presented, zero mutations performed, execution paused for the decision.

## Issues Encountered

None. The account-visibility gap RESEARCH.md flagged (Open Questions 1 and 2) is confirmed to still be present in live data as of this session.

## User Setup Required

Awaiting the Task 1 `checkpoint:decision` response (see PLAN.md Task 1 `<resume-signal>`): team slug, yes/no on repo identity, and DNS provider name (or explicit deferral of the DNS answer to plan 01-03).

## Next Phase Readiness

- **Not ready to proceed** — Task 2 (branch + Vercel project creation) and Task 3 (Production Branch Tracking override) are both blocked on Task 1's answer.
- No Vercel resource was created, linked, or modified during this session; no risk of having repointed an existing brand's deployment source.
- Once the user answers, a continuation agent should resume at Task 2 using the confirmed team slug as `--scope` on every subsequent Vercel command, per the plan's explicit instruction not to rely on ambient CLI scope state.

---

## POST-CHECKPOINT UPDATE (same session, after Task 1 decision was answered)

**Task 1 decision, answered:**
1. Team: `generista`
2. Repo identity: **NO** — this checkout (`ibrahimvoicesync-ctrl/muslim-settify-test`) is confirmed NOT the production repo. The real repo is `https://github.com/jamilkarabaev/muslim-settify`. Confirmed by: its pre-change `app/apply/page.tsx` matches this checkout byte-for-byte before plan 01-01's edit; its `main` (829e1aa) is an ancestor-equivalent of this checkout's pre-phase history; live `muslimsettify.com` deployments in `vercel ls muslim-settify --scope generista` were pushed by GitHub user `jamil-7850`, not this session's account. `gh api repos/jamilkarabaev/muslim-settify` shows this session's GitHub account (`ibrahimvoicesync-ctrl`) as a collaborator with `push: true`, though the fine-grained PAT initially used lacked write scope (see below).
3. DNS: **Porkbun** (nameservers confirmed via `vercel domains inspect`: `curitiba.ns.porkbun.com` etc.)

**Given the repo pivot, the rest of plan 01-02 executed manually (not via gsd-executor subagent) directly against the real repo, cloned fresh to `/Users/ibrahimawwad/muslim-settify` (sibling directory, NOT inside this checkout):**

1. Cloned `https://github.com/jamilkarabaev/muslim-settify.git` to `/Users/ibrahimawwad/muslim-settify`.
2. Created branch `h-muslimsettify` off `main` (829e1aa) there.
3. Reapplied plan 01-01's exact diff (`H_MUSLIMSETTIFY_TYPEFORM_URL` constant + first-position exact-match branch) to `app/apply/page.tsx` — verified `npx tsc --noEmit`, `npm run prebuild`, `npm run build`, and the same 5-host local probe as plan 01-01 (all 5 matched: `h.muslimsettify.com` → placeholder, 3 existing brands + `www.muslimsettify.com` canary → unchanged). Committed as `ef7a8f2`.
4. **Push was denied (403)** for `ibrahimvoicesync-ctrl` via the default `gh`-configured credential (fine-grained PAT lacked Contents:write scope for this specific external repo, despite the account showing `push: true` on the repo's `/permissions` API field). User supplied a classic PAT (`ghp_...`) which was used once, inline, to push — not persisted to git config, not committed anywhere. **Recommend the user rotate/revoke that token after this session, since it was pasted in plaintext chat.**
5. Branch `h-muslimsettify` is now on `origin` (`jamilkarabaev/muslim-settify`), confirmed via `git ls-remote`.
6. **Plan deviation, per explicit user instruction:** the plan as written called for a brand-new, independent Vercel Project (matching the existing 3-brand pattern). User overrode this: reuse the **existing** `muslim-settify` project (team `generista`, the one that already serves `muslimsettify.com`), and instead of Production Branch Tracking, use Vercel's **per-domain Git Branch assignment** — attach `h.muslimsettify.com` to that project and set its Git Branch to `h-muslimsettify`, leaving the project's actual Production branch as `main` (still serving the 3 existing brands, untouched).
   - A standalone project `h-muslimsettify` WAS created first (per the original plan), then confirmed unnecessary, then **deleted** (`vercel project rm h-muslimsettify --scope generista`) once the simpler approach was confirmed. No domains or deployments existed on it at deletion time.
   - Pushing to `h-muslimsettify` auto-triggered a Preview deployment on the *existing* `muslim-settify` project (confirms its GitHub integration already has access to the real repo — no `vercel git connect` needed, unlike the abandoned standalone-project path which hit a 400 from Vercel's `/link` API due to missing GitHub App repo access under this session's account).
   - Domain `h.muslimsettify.com` added to the existing `muslim-settify` project: `vercel domains add h.muslimsettify.com muslim-settify --scope generista` — succeeded.
   - `vercel domains inspect` says Vercel wants an **A record** (`h.muslimsettify.com` → `76.76.21.21`), **not a CNAME** as the original PLAN.md text assumed (RESEARCH.md/PLAN.md's CNAME assumption for A1 is superseded by live evidence — Vercel offered A-record-on-existing-nameservers instead of CNAME/nameserver-delegation, since the zone's nameservers are third-party/Porkbun and not Vercel's).

**Requirements status:** BRAND-01 still NOT complete — the domain is attached but not yet routed to the right branch (no Git Branch assignment yet) and DNS doesn't resolve yet (both are human actions, see below). BRAND-02/BRAND-03 remain satisfied per plan 01-01 (unaffected by this plan).

## Human actions pending (blocking resume — user said "I will do it tmr")

1. **Vercel Dashboard** (no CLI path): team `generista` → project `muslim-settify` → Settings → Domains → `h.muslimsettify.com` → set **Git Branch** field to `h-muslimsettify` → save. Without this, the domain serves the `main` production branch's build (old 3-brand-only code), not the new routing.
2. **Porkbun DNS** (no CLI path, third-party registrar, Claude has no credentials): add DNS record on the `muslimsettify.com` zone — Type `A`, Host `h`, Value `76.76.21.21`. Additive only; do not touch existing records.

## Resume verification (once both human actions are done)

1. `dig +short A h.muslimsettify.com` (from `/Users/ibrahimawwad/muslim-settify` or anywhere) should resolve to `76.76.21.21` or a Vercel-fronting IP.
2. `vercel domains inspect h.muslimsettify.com --scope generista` should report valid configuration (not pending/misconfigured).
3. `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://h.muslimsettify.com/apply` should return `3xx` → `https://form.typeform.com/to/PLACEHOLDER_H_MUSLIMSETTIFY`.
4. Regression-check the 3 existing brands over public HTTPS (`muslimsettify.com`, `settifyowtp.com`, `settifyhaqqan.com`) against the values recorded in `01-01-SUMMARY.md` — this doubles as plan 01-03 Task 3's production check, since the existing project/domains were never touched.
5. If all pass: this closes out plan 01-02 AND most of plan 01-03 (both were folded into this session's work). Update `01-03-PLAN.md`'s Task 1 as "already done, different mechanism" — no separate project, no `vercel domains add` needed there (already done here), just the verification task remains.
6. Update STATE.md / ROADMAP.md plan progress once verified. Mark BRAND-01 complete.

## Deviations from Plan (supersedes the "None" note above — that was true only up to the checkpoint)

- Repo target changed entirely: real work happens in `/Users/ibrahimawwad/muslim-settify` (branch `h-muslimsettify`), NOT in this checkout. This checkout's plan 01-01 commits (`1c5ac96` etc.) are sandbox-only and not part of the real deployment — they were useful as a verified reference diff, nothing more.
- No new Vercel Project was created (one was created then deleted). BRAND-01's "own Vercel Project" framing in the original PLAN.md/ROADMAP wording is superseded by the user's simpler branch-scoped-domain approach on the existing project — still satisfies "its own branch, not main" in spirit (the domain routes to a dedicated branch), just not via a dedicated project.
- DNS record type is A, not CNAME.

---
*Phase: 01-4th-brand-deployment-host-routing*
*Paused: 2026-07-29 (mid plan 01-02, both remaining blockers are human-only dashboard/registrar actions)*
