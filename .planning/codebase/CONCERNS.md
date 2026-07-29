# Codebase Concerns

**Analysis Date:** 2026-07-29

## Tech Debt

**Inline testimonial data arrays:**
- Issue: `components/video-testimonials.tsx` contains 268 lines of hard-coded testimonial data (14 full stories) instead of importing from a shared data source
- Files: `components/video-testimonials.tsx` (lines 9-329), `data/success-pictures.ts` (265 lines of data), `apps/testimonials/data/video-testimonials.ts` (255 lines)
- Impact: Data duplication across three locations creates maintenance burden. Updates must be made in multiple places, risk of version skew
- Fix approach: Extract all testimonial data to a single source of truth in `data/` directory with unified types. Both main component and `/apps/testimonials` should import from shared location

**Placeholder captions in success pictures:**
- Issue: All success picture captions in `data/success-pictures.ts` are hardcoded to "This is a placeholder caption" (see lines 12, 15, 18, etc.)
- Files: `data/success-pictures.ts` (265 entries), `scripts/copy-wins.mjs` (line 9 - intentional)
- Impact: Homepage and /more-success page display generic placeholder text instead of real captions describing student wins
- Fix approach: Enhance `copy-wins.mjs` script to extract real captions from source data. Store captions in wins.json export. Update success-pictures.ts generation

**Monorepo without clear separation:**
- Issue: `apps/testimonials/` is excluded from main tsconfig.json (line 48) but shares component imports from root via path aliases
- Files: `tsconfig.json` (exclude line), `apps/testimonials/app/page.tsx` (imports from `@/data/` and `@/lib/`)
- Impact: Unclear whether apps/testimonials is a separate deployment or shared code. Path aliases point across TypeScript boundary
- Fix approach: Either include apps/testimonials in main tsconfig with proper monorepo setup, or move it to separate package with explicit dependencies

**Large component files:**
- Issue: Components exceed recommended size limits with embedded business logic and styling
  - `components/video-testimonials.tsx`: 503 lines (includes data array + component)
  - `components/application.tsx`: 344 lines (large form with repeated field definitions)
  - `components/curriculum.tsx`: 294 lines (large data array)
- Files: `components/video-testimonials.tsx`, `components/application.tsx`, `components/curriculum.tsx`
- Impact: Harder to test, reuse, and maintain. Side effects on full page load even if component not visible
- Fix approach: Extract data to separate files. Break components into smaller focused pieces (e.g., TestimonialCard, CurriculumModule). Consider dynamic imports for below-fold content

## Known Bugs

**Application form doesn't collect data:**
- Symptoms: User submits form → success message displays → data is lost. Only logged to console. Form data never reaches backend/email
- Files: `components/application.tsx` (lines 34-46)
- Trigger: User fills Application form fields and clicks "Submit Your Application"
- Context: The actual application flow uses `/apply` route (line 50-87) which redirects to Typeform. This component appears to be decorative/abandoned code
- Workaround: Users see the form but actual applications must go through /apply link or other CTAs that point to Typeform

**Memory leak in Application component:**
- Symptoms: If user navigates away during form submission, setTimeout callbacks fire after unmount
- Files: `components/application.tsx` (lines 38, 46)
- Cause: `setTimeout` for success message timeout (line 46) not cleaned up on unmount
- Impact: Minor - only affects in-flight submissions on navigation
- Fix approach: Store timeouts in useRef, clear in useEffect cleanup

**Missing environment variable can crash deploy:**
- Symptoms: If TYPEFORM_URL env var not set for unknown host, /apply shows "misconfigured" error page instead of graceful redirect
- Files: `app/apply/page.tsx` (lines 42-54, 58-82)
- Trigger: Deploy to new host without setting TYPEFORM_URL
- Workaround: Always set TYPEFORM_URL in Vercel for fallback

## Security Considerations

**Host-based routing relies on request headers:**
- Risk: `/apply` route uses `headers().get("host")` to determine Typeform URL. Could be spoofed if behind misconfigured proxy
- Files: `app/apply/page.tsx` (lines 8-44)
- Current mitigation: Hard-coded host checks for known domains (muslimsettify.com, settifyhaqqan.com, settifyowtp.com) provide fallback
- Recommendations: Document proxy requirement. Consider X-Forwarded-Host header validation if behind load balancer

**Console logging of form data:**
- Risk: User PII logged to console (name, email, phone, current situation text)
- Files: `components/application.tsx` (line 40)
- Current mitigation: Only logs in development, unlikely exposed in production
- Recommendations: Remove console.log or replace with structured logger that doesn't include PII. Use error tracking service (Sentry) for production debugging

**No CSRF protection on form:**
- Risk: Application form doesn't validate origin, though it's client-side only and data is discarded
- Files: `components/application.tsx`
- Current mitigation: Form is non-functional (data not persisted), so actual risk is low
- Recommendations: If Application form is repurposed for actual data collection, add CSRF tokens

**Hard-coded video IDs exposed:**
- Risk: YouTube/Loom embed IDs are public constants, but not a security risk (videos are meant to be public)
- Files: `components/video-testimonials.tsx` (YOUTUBE_VIDEO_IDS array, LOOM_THUMBNAILS object)
- Current mitigation: URLs are meant for public sharing
- Recommendations: No action needed - this is intentional

## Performance Bottlenecks

**Large data arrays loaded with components:**
- Problem: 268 lines of video testimonial data and 265 lines of success pictures loaded eagerly on page navigation
- Files: `components/video-testimonials.tsx`, `data/success-pictures.ts`
- Cause: Data arrays included in component modules, preventing tree-shaking
- Improvement path: Extract to separate JSON/TS files. Use dynamic imports with React.lazy() for below-fold content. Consider pagination/virtualization for success pictures grid

**No image optimization for success pictures:**
- Problem: 150+ success pictures loaded in grid without explicit sizing or lazy loading strategy
- Files: `components/success-pictures.tsx`, `data/success-pictures.ts`
- Cause: Unknown image dimensions, no responsive srcset, no native lazy loading hints
- Improvement path: Use Next.js Image component with proper width/height. Implement react-window for virtual scrolling. Add blur-up placeholders

**Loom/YouTube thumbnails not cached efficiently:**
- Problem: `components/prefetch-below-fold.tsx` prefetches thumbnails, but no cache control headers specified
- Files: `components/prefetch-below-fold.tsx` (lines 58-72)
- Cause: External URLs (cdn.loom.com, i.ytimg.com) may have conservative cache headers
- Improvement path: Verify CDN cache headers. Download and serve thumbnails locally if cache TTL is short

**Motion animations on all video cards:**
- Problem: Each video testimonial card animates independently, staggered over 1.4 seconds (14 cards × 0.1s delay)
- Files: `components/video-testimonials.tsx` (lines 358-370, 374-386)
- Cause: StaggerChildren transition without reducedMotion preference
- Impact: Poor performance on low-end devices, battery drain on mobile
- Fix approach: Respect `prefers-reduced-motion` media query. Consider disabling stagger on mobile

## Fragile Areas

**Testimonial data structure mismatch:**
- Files: `components/video-testimonials.tsx` vs `apps/testimonials/data/video-testimonials.ts`
- Why fragile: Two different type definitions for testimonials (VideoTestimonial in components, different VideoTestimonial in apps/testimonials). IDs don't align. Video ID "cjDPLAlrLIM" for Mohamad Hussein in components isn't in YOUTUBE_VIDEO_IDS constant
- Safe modification: Before editing testimonials, audit both files. Create shared type definitions. Add type tests to catch drift
- Test coverage: None - untested data structures

**Prefetch component has timing assumptions:**
- Files: `components/prefetch-below-fold.tsx`
- Why fragile: Uses requestIdleCallback with 2500ms timeout, fallback to setTimeout(1200ms). If page load is slow, prefetch delays further. If browser prioritizes images, requestIdleCallback never fires
- Safe modification: Add metrics to measure prefetch timing. Consider IntersectionObserver for visibility-based prefetch instead
- Test coverage: None - no unit tests for prefetch logic

**Carousel component with mutation:**
- Files: `components/ui/carousel.tsx` (line 39), `components/ui/cases-with-infinite-scroll.tsx`
- Why fragile: Carousel exposes API object that can be null. If api state not synchronized, scrollTo() calls fail silently
- Safe modification: Check all carousel usage to ensure api is gated properly. Add error boundaries
- Test coverage: None

**Loom URL parsing with silent failures:**
- Files: `apps/testimonials/lib/loom.ts` (line 29 - catch block silently returns input)
- Why fragile: If URL is malformed, function returns original string without indication of parse failure. Downstream code can't distinguish user error from system error
- Safe modification: Log parse failures. Return Result type (either parsed URL or error) instead of silently returning input
- Test coverage: None - no unit tests for URL parsing edge cases

## Scaling Limits

**Testimonials grid without pagination:**
- Current capacity: 14 video testimonials render at once, 150+ success pictures render on /more-success page
- Limit: At 15+ testimonials, page becomes sluggish. At 200+ pictures, grid rendering becomes janky
- Scaling path: Implement pagination or virtual scrolling. Split video testimonials into tabs/categories. Load pictures on demand

**No database for content:**
- Current capacity: All content hard-coded in TS files
- Limit: Adding/updating testimonials requires code change + rebuild + redeploy
- Scaling path: Build admin CMS for testimonials. Store in database or headless CMS (Sanity, Contentful, Strapi). Add API routes to fetch content

**Single-threaded form submission:**
- Current capacity: Application form processes one submission at a time (simulated 1500ms delay)
- Limit: If form becomes real backend, concurrent submissions could overwhelm server
- Scaling path: Add request queuing, implement rate limiting, use serverless workers if on Vercel

## Dependencies at Risk

**React 19 + Next.js 16 early adopter stack:**
- Risk: React 19 is very recent (released Feb 2024). Next.js 16 has turbopack which is still stabilizing
- Impact: Unexpected bugs, API changes, community package incompatibility
- Migration plan: Monitor security advisories. Consider staying on React 18.x LTS until ecosystem stabilizes. Keep dev dependencies fresh with `npm audit`

**Framer Motion animations on all pages:**
- Risk: ~30 components use framer-motion. Large bundle impact if user navigates multiple pages
- Impact: JS bundle size, especially on slow networks
- Migration plan: Audit which animations are user-perceptible. Replace purely decorative animations with CSS. Consider code-splitting framer-motion

**Missing type safety for YouTube/Loom IDs:**
- Risk: YOUTUBE_VIDEO_IDS is string[], no way to verify IDs are valid or correspond to uploaded videos
- Impact: Dead/private videos break embeds silently
- Migration plan: Add validation utility to test video IDs on build (YouTube API, Loom API). Store metadata (title, duration, privacy) alongside IDs

## Missing Critical Features

**No analytics:**
- Problem: No tracking of page views, click events, form submissions, video plays, or conversion funnel
- Blocks: Can't measure which content resonates with users. Can't track application drop-off
- Impact: Marketing decisions made blind

**No error monitoring:**
- Problem: No error tracking (Sentry, Datadog, etc.). Production bugs only discovered via user complaints
- Blocks: Can't detect broken video embeds, failed image loads, or JavaScript errors in production
- Impact: Silent failures go undetected for days

**No backend for applications:**
- Problem: Application form component doesn't submit anywhere. Real flow uses Typeform, but decoupled from main site
- Blocks: Can't collect applications directly. Dependent on Typeform's uptime/reliability
- Impact: Loss of control over lead data pipeline

**No email notifications:**
- Problem: No sendgrid/mailgun integration. No confirmation emails for applicants
- Blocks: Can't notify users of application receipt. Can't build email nurture sequences
- Impact: Reduced user confidence in application process

## Test Coverage Gaps

**No unit tests:**
- What's not tested: All components, utilities, and data transformations are untested
- Files: Entire `components/`, `app/`, `lib/`, `data/` directories
- Risk: Refactoring risks breaking features. Regressions go undetected. New contributor confidence is low
- Priority: **High** - should establish test infrastructure immediately
- Approach: Start with critical paths (Application form, testimonial rendering, prefetch logic). Use Vitest + React Testing Library

**No E2E tests:**
- What's not tested: Page navigation, hero-to-application flow, video playback, external link validity
- Risk: Broken links discovered in production. Hero CTA buttons might not work in deployed version
- Priority: **Medium** - add Playwright E2E tests for critical user journeys
- Approach: Test signup flow (/apply redirect), video embed loads, success pictures grid pagination

**No performance tests:**
- What's not tested: Lighthouse scores, bundle size, Core Web Vitals, animation frame rates
- Risk: Performance regressions go undetected. Slow deployments surprise users
- Priority: **Medium** - integrate Lighthouse CI or Web Vitals monitoring
- Approach: Add performance budget. CI checks for bundle size regressions

**No accessibility tests:**
- What's not tested: Keyboard navigation, screen reader compatibility, color contrast, focus states
- Files: All components, especially forms and navigation
- Risk: Site inaccessible to users with disabilities. Legal/compliance exposure
- Priority: **High** - add axe/Pa11y accessibility checks to CI
- Approach: Audit manual first. Add automated checks to CI

---

*Concerns audit: 2026-07-29*
