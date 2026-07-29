# External Integrations

**Analysis Date:** 2026-07-29

## APIs & External Services

**Lead Capture & Forms:**
- Typeform - Application form platform
  - Service URLs (hard-coded, routed via `/apply` endpoint):
    - Muslim Settify: `https://form.typeform.com/to/ztBUiWgs`
    - Settify OWTP: `https://form.typeform.com/to/jR36nOwS`
    - Settify Haqqan: `https://form.typeform.com/to/t5UXUG8L`
  - Environment variable fallback: `TYPEFORM_URL`
  - Usage: `app/apply/page.tsx` - Server-side host-based routing to prevent form misrouting

**Video Content:**
- YouTube - Video embeds and thumbnails
  - Thumbnails sourced from: `https://i.ytimg.com/vi/{id}/hqdefault.jpg`
  - Embed player: `https://www.youtube-nocookie.com/embed/{id}?autoplay=1`
  - Used in testimonials (`components/video-testimonials.tsx`)
  - Footer social link: `https://www.youtube.com/@Jamilb2b`

- Loom - Recorded video testimonials
  - Thumbnail CDN: `https://cdn.loom.com/sessions/thumbnails/[session-id].gif`
  - Embed player: `https://www.loom.com/embed/{id}?autoplay=1`
  - Used in testimonials and education sections

**Social & Communication:**
- Telegram - Social channel link
  - Link: `https://t.me/jamilschannel`
  - Used in more-success section

**Documentation:**
- Google Docs - Policy and resource documents
  - Links: Multiple Google Drive document links in footer
  - Example: `https://docs.google.com/document/d/1-n-lWvxPboEynrJeECea9pnwaxq94FLfz2YEIOFCe4o/edit`

## Content Delivery

**Image CDN:**
- Loom CDN - Video thumbnail delivery
- YouTube CDN - Video thumbnail delivery
- Next.js Image Optimization - Built-in image optimization for local assets

**Fonts:**
- Google Fonts (via Next.js) - Inter font family loaded via `next/font/google`

## Data Storage

**Database:**
- Not applicable - This is a static/marketing site with no backend database

**Session/State:**
- Client-side only (React state via hooks)
- No server-side session storage detected

**Caching:**
- Next.js built-in caching strategies (image optimization, static rendering)

## Authentication & Identity

**Auth Provider:**
- Not implemented - This is a public marketing site with no authentication

**Form Security:**
- Typeform handles form submission and validation server-side
- Host-based routing logic in `app/apply/page.tsx` prevents form targeting errors

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Server logs via Next.js/Vercel (if deployed on Vercel)
- Client-side console logs only

**Performance Monitoring:**
- Next.js Core Web Vitals optimizations built-in
- Image prefetching optimization (`components/prefetch-below-fold.tsx`)

## CI/CD & Deployment

**Hosting Platform:**
- Vercel (primary, recommended in README)
- Compatible with any Node.js host

**CI Pipeline:**
- Vercel Preview Deployments (if deployed on Vercel)
- Pre-build validation: `npm run prebuild` executes `scripts/check-no-direct-typeform.mjs`

**Build Process:**
```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint checks
npm run prebuild # Pre-build validation (runs before npm run build)
```

## Environment Configuration

**Required Environment Variables:**
- `TYPEFORM_URL` (optional) - Fallback Typeform URL for unmapped hosts
  - Used when host does not match hardcoded domains
  - If not set, `/apply` displays configuration error

**Environment Variable Handling:**
- Checked at runtime in `app/apply/page.tsx` via `process.env.TYPEFORM_URL`
- Host-based routing logic reads request headers to determine correct form

## Webhooks & Callbacks

**Incoming:**
- None (this is a static site)

**Outgoing:**
- Typeform submission - User's form data sent to Typeform
- No custom webhooks implemented

## Security Considerations

**Direct Typeform URL Protection:**
- Build-time validation (`scripts/check-no-direct-typeform.mjs`) prevents hardcoding Typeform links outside `/apply`
- Enforces routing through `/apply` endpoint
- Hardcoded domain mapping prevents accidental form targeting:
  - `muslimsettify.com/*` → Muslim Settify form
  - `settifyowtp*` → OWTP form
  - `settifyhaqqan*` → Haqqan form

**Third-Party Integrations:**
- YouTube: Privacy-focused embed with `youtube-nocookie.com`
- Loom: Direct embed with auto-play capability
- Typeform: Form security handled by Typeform (HTTPS, data protection)

## External Domains Contacted

**Production (Client-Side):**
- `form.typeform.com` - Form submissions
- `cdn.loom.com` - Video thumbnails and embeds
- `www.loom.com` - Loom embed player
- `i.ytimg.com` - YouTube thumbnails
- `www.youtube-nocookie.com` - YouTube embed player (privacy-focused)
- `docs.google.com` - Policy documents
- `t.me` - Telegram social link

**CDN & Static:**
- `fonts.googleapis.com` - Google Fonts (Inter)
- `fonts.gstatic.com` - Google Fonts files

---

*Integration audit: 2026-07-29*
