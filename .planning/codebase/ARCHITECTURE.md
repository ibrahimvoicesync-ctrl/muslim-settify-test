<!-- refreshed: 2026-07-29 -->
# Architecture

**Analysis Date:** 2026-07-29

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App Router Layer                   │
│    Pages: page.tsx (/) | apply | more-success               │
│          Root Layout: `app/layout.tsx`                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Feature Components Layer                        │
│  Navbar | Hero | CombinedOverview | VideoTestimonials       │
│  SocialProof | FAQ | ApplyCTA | Footer | WorldMapSection    │
│  SuccessPictures | Application                              │
│          Location: `components/*.tsx`                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│  UI Layer   │ │  Data Layer  │ │ Utilities    │
│ `components/│ │  `data/*.ts` │ │ `lib/*.ts`   │
│  ui/*.tsx`  │ │              │ │              │
└─────────────┘ └──────────────┘ └──────────────┘
    • Buttons      • successPictures  • cn()
    • Carousel     • videoTestimonials
    • Motion       • textTestimonials
    • EmbedFrame
    • TextCarousel
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Page Layout** | Root HTML structure, global styles, metadata | `app/layout.tsx` |
| **Homepage** | Orchestrates all feature sections in sequence | `app/page.tsx` |
| **Apply Page** | Routes to Typeform based on host header | `app/apply/page.tsx` |
| **More Success Page** | Displays success picture gallery | `app/more-success/page.tsx` |
| **Navbar** | Navigation header with logo and links | `components/navbar.tsx` |
| **Hero** | Main headline, video intro, CTA buttons | `components/hero.tsx` |
| **CombinedOverview** | Six-card feature showcase | `components/combined-overview.tsx` |
| **VideoTestimonials** | Video testimonials from students | `components/video-testimonials.tsx` |
| **SocialProof** | Text testimonial cards with earnings | `components/social-proof.tsx` |
| **FAQ** | Frequently asked questions section | `components/faq.tsx` |
| **ApplyCTA** | Final call-to-action before footer | `components/apply-cta.tsx` |
| **Footer** | Copyright and links | `components/footer.tsx` |
| **WorldMapSection** | Geographic visualization | `components/world-map-section.tsx` |
| **SuccessPictures** | Gallery of student win photos | `components/success-pictures.tsx` |
| **Application** | Form with react-hook-form (not currently used) | `components/application.tsx` |

## Pattern Overview

**Overall:** Next.js App Router with server-side layouts and client-side feature components

**Key Characteristics:**
- **Monorepo structure:** Main app (`/`) and testimonials subapp (`apps/testimonials/`)
- **Server-side by default:** Layouts and pages are server components unless marked `"use client"`
- **Client rendering for interactivity:** Feature components use `"use client"` for Framer Motion animations
- **Static data:** All testimonials, success pictures, and content stored in TypeScript files
- **No backend:** External redirect to Typeform for application flow
- **Motion presets abstraction:** Shared animation patterns for consistency and accessibility

## Layers

**App Router (Next.js):**
- Purpose: Provide pages, routing, and server-side layouts
- Location: `app/`
- Contains: Page files (`page.tsx`), root layout (`layout.tsx`), CSS (`globals.css`)
- Depends on: React, Next.js
- Used by: Visitor browsers

**Feature Components:**
- Purpose: Render page sections with animations, forms, and interactivity
- Location: `components/*.tsx`
- Contains: Navbar, Hero, testimonial sections, FAQ, CTA, footer
- Depends on: React, Framer Motion, Lucide icons, UI components, data files
- Used by: Page components to build the homepage and other pages

**UI Components:**
- Purpose: Reusable low-level UI primitives and interactive elements
- Location: `components/ui/*.tsx`
- Contains: Button, Carousel, Lite embed frames, motion presets, case demo, world map
- Depends on: React, Framer Motion, Lucide icons, TailwindCSS
- Used by: Feature components

**Data Layer:**
- Purpose: Store static content, testimonials, and media references
- Location: `data/*.ts`
- Contains: Success pictures array, video testimonials, text testimonials
- Depends on: TypeScript types
- Used by: Feature components to populate sections

**Utilities:**
- Purpose: Shared helpers and helper functions
- Location: `lib/*.ts`
- Contains: `cn()` for className merging (Tailwind + clsx)
- Depends on: clsx, tailwind-merge
- Used by: Components throughout the codebase

## Data Flow

### Primary Request Path (Homepage)

1. **Request** → Browser requests `/` (entry point: `app/page.tsx`)
2. **Root Layout** → `app/layout.tsx` sets up HTML, metadata, global CSS (`app/globals.css`)
3. **Page Compose** → `app/page.tsx` imports 11 feature components
4. **Component Render** → Each component (`Hero`, `Navbar`, etc.):
   - Marked `"use client"` for animation capability
   - Imports motion presets from `components/ui/motion-presets.tsx`
   - Uses Framer Motion `whileInView` to animate on scroll
   - Renders static HTML with fallback for reduced motion
5. **Data Load** → Components like `VideoTestimonials` and `SocialProof` import data directly from `data/*.ts`
6. **Output** → Browser renders complete landing page with animations

### Apply Flow

1. **Click Apply/Apply CTA** → Routes to `/apply`
2. **Server Component** → `app/apply/page.tsx` runs server-side
3. **Host Detection** → Reads `Host` header via `headers()` API
4. **Routing Logic** → Resolves Typeform URL based on host:
   - `muslimsettify.com` → `MUSLIMSETTIFY_TYPEFORM_URL`
   - `settifyhaqqan.com` → `SETTIFYHAQQAN_TYPEFORM_URL`
   - `settifyowtp.com` → `SETTIFYOWTP_TYPEFORM_URL`
   - Fallback: `TYPEFORM_URL` env var
5. **Redirect** → Server redirects with `redirect()` to external Typeform
6. **Error Fallback** → If no URL configured, shows error message with env var instructions

### More Success Page

1. **Click "More Success" link** → Routes to `/more-success`
2. **Page Load** → `app/more-success/page.tsx` imports `successPictures` data
3. **Gallery Render** → `SuccessPictures` component displays photos
4. **External Link** → "See more" button links to external Telegram channel

**State Management:**
- **No global state manager:** Uses local React state (`useState`) within components
- **Form state:** `react-hook-form` manages `Application` component form state
- **Animation state:** Framer Motion handles scroll-based animation state internally
- **Motion preference:** `useReducedMotion()` hook detects accessibility preference and swaps animation variants

## Key Abstractions

**Motion Presets (`components/ui/motion-presets.tsx`):**
- Purpose: Provide consistent, accessible animation variants across sections
- Examples: `fadeIn`, `rise`, `zoomIn`, `slideFromLeft`, `slideFromRight`, `stagger`, `reduced`
- Pattern: Exported Framer Motion `Variants` objects used with `motion.div` and `motion.h2`, etc.
- Accessibility: `reduced` variant has no movement (respects `prefers-reduced-motion`)

**Color System:**
- Primary: `#0066FF` (blue)
- Accent: `#00D4AA` (teal/aqua)
- Dark: `#1A202C` (near-black)
- Light: `#F7FAFC` (off-white)
- Gray scale: `#718096` (body text), `#A0AEC0` (footnotes)
- All defined in component `className` attributes using TailwindCSS

**Form Validation:**
- Pattern: Zod schema + react-hook-form resolver
- Example: `Application` component validates fullName, email, phone, currentSituation
- Error handling: Inline error messages below inputs

## Entry Points

**Homepage (`/`):**
- Location: `app/page.tsx`
- Triggers: Direct navigation, links from external sites
- Responsibilities: Compose all feature sections, call-to-action flow

**Application (`/apply`):**
- Location: `app/apply/page.tsx`
- Triggers: "Apply Now" button, CTA sections
- Responsibilities: Detect host header, resolve Typeform URL, redirect or show error

**Success Gallery (`/more-success`):**
- Location: `app/more-success/page.tsx`
- Triggers: "See More Success" navigation link
- Responsibilities: Display success picture gallery, "See more" link to external platform

**Testimonials App (`apps/testimonials/`):**
- Location: `apps/testimonials/app/page.tsx`
- Triggers: Separate deployment/subdomain
- Responsibilities: Post-apply onboarding page with training videos and testimonials

## Architectural Constraints

- **Threading:** Single-threaded JavaScript execution (Node.js event loop on server, browser main thread on client)
- **Global state:** No Redux, Zustand, or Context API used. Component-level `useState` only.
- **Circular imports:** None detected; imports flow downward (pages → components → ui/data/lib)
- **No API routes:** Application flow uses HTTP redirects; no internal backend endpoints
- **Client-only interactivity:** All animations and form interactions happen client-side
- **Static rendering:** No dynamic data fetching at request time (data files are bundled)
- **Environment configuration:** Typeform URL is only dynamic value, passed via env vars

## Anti-Patterns

### Inline Motion Variants

**What happens:** Some components define motion variants inline (e.g., `initial={{ opacity: 1 }}`), while others import presets

**Why it's wrong:** Inconsistent animation behavior, harder to maintain, difficult to apply global accessibility rules

**Do this instead:** Use presets from `components/ui/motion-presets.tsx` and import via `const variants = prefersReduced ? reduced : fadeIn`; see `components/hero.tsx` line 6-24 for correct pattern

### Unreachable Layout Provider

**What happens:** `theme-provider.tsx` imports `next-themes` but is never used in `layout.tsx` (never wrapped around children)

**Why it's wrong:** Dark mode theme switching is initialized but never mounted, wasting bundle size and causing potential hydration issues

**Do this instead:** Either (1) wrap root layout children with `<ThemeProvider>`, or (2) remove the file and theme-related imports if dark mode isn't needed

## Error Handling

**Strategy:** Server-side validation with inline form error display; graceful fallbacks for missing config

**Patterns:**
- **Form validation:** Zod schema errors collected and displayed inline next to input fields
- **Apply page misconfiguration:** Returns readable error page with instructions instead of 500 error
- **Fallback rendering:** Components use `prefersReducedMotion` to skip animations gracefully
- **No try-catch in features:** Errors bubble up to Next.js error boundary (not custom-handled in components)

## Cross-Cutting Concerns

**Logging:** `console.log()` only (e.g., form submission in `Application` component line 40); no structured logging framework

**Validation:** Zod schema in `Application` component for form inputs; no runtime validation in other areas

**Authentication:** None. All pages are public; Typeform handles gated access after application

**Performance Optimization:**
- `PrefetchBelowFold` component preloads below-the-fold sections
- `LiteEmbed` uses lazy loading for video frames
- Images in success gallery use responsive public asset paths
- No image optimization library (next/image) currently used

---

*Architecture analysis: 2026-07-29*
