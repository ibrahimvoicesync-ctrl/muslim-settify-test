# Codebase Structure

**Analysis Date:** 2026-07-29

## Directory Layout

```
muslim-settify-test/
├── app/                          # Next.js app router pages
│   ├── layout.tsx               # Root layout, global setup
│   ├── globals.css              # Global styles (TailwindCSS)
│   ├── page.tsx                 # Homepage (/)
│   ├── icon.png                 # Favicon
│   ├── apply/
│   │   └── page.tsx             # Apply/redirect page (/apply)
│   └── more-success/
│       └── page.tsx             # Success gallery page (/more-success)
├── components/                   # React feature components
│   ├── navbar.tsx               # Navigation header
│   ├── hero.tsx                 # Hero section with video
│   ├── combined-overview.tsx    # Six-card feature grid
│   ├── curriculum.tsx           # Curriculum section
│   ├── education.tsx            # Education/background section
│   ├── exclusive-community.tsx  # Community features section
│   ├── faq.tsx                  # FAQ accordion
│   ├── features.tsx             # Features list
│   ├── video-testimonials.tsx   # Video testimonials section
│   ├── testimonials.tsx         # Testimonials section
│   ├── social-proof.tsx         # Text testimonial cards
│   ├── success-pictures.tsx     # Photo gallery component
│   ├── world-map-section.tsx    # Geographic map
│   ├── application.tsx          # Application form (unused)
│   ├── apply-cta.tsx            # Apply call-to-action
│   ├── cta.tsx                  # Generic CTA section
│   ├── how-it-works.tsx         # "How it works" explainer
│   ├── prefetch-below-fold.tsx  # Performance optimization
│   ├── theme-provider.tsx       # Next-themes wrapper (unused)
│   └── ui/                       # Reusable UI components
│       ├── button.tsx           # Styled button
│       ├── animated-button.tsx  # Button with animation
│       ├── carousel.tsx         # Image carousel (Embla)
│       ├── cases-with-infinite-scroll.tsx # Case studies
│       ├── case-demo.tsx        # Single case demo
│       ├── lite-embed.tsx       # Video embed wrapper
│       ├── motion-presets.tsx   # Framer Motion variants
│       ├── text-carousel.tsx    # Text/quote carousel
│       ├── world-map.tsx        # World map visualization
│       └── world-map-demo.tsx   # Map demo component
├── apps/                        # Monorepo apps
│   └── testimonials/            # Testimonials subapp
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx         # Post-apply onboarding
│       ├── components/
│       │   ├── VideoFrame.tsx
│       │   └── Logo.tsx
│       ├── data/
│       │   ├── video-testimonials.ts
│       │   └── text-testimonials.ts
│       ├── lib/
│       │   └── loom.ts          # Loom URL helper
│       ├── public/              # Subapp static assets
│       ├── tsconfig.json
│       ├── package.json
│       └── next.config.ts
├── data/                        # Static content data
│   └── success-pictures.ts      # Array of photo references + captions
├── lib/                         # Shared utilities
│   └── utils.ts                 # `cn()` classname helper
├── public/                      # Static assets
│   ├── icon/                    # Logo variants
│   ├── log/                     # Logo variants
│   ├── videos/                  # Video files
│   ├── wins/                    # Success/win photos (150+ images)
│   ├── muslim-settify-logo.png
│   ├── settify-bg.png
│   ├── globe.svg
│   ├── window.svg
│   └── file.svg
├── scripts/                     # Build & utility scripts
│   ├── check-no-direct-typeform.mjs  # Prebuild check
│   ├── blur-phone-numbers.py        # Photo processing
│   ├── copy-wins.mjs                # Copy win photos
│   ├── filter-wins.mjs              # Filter photos
│   └── match-not-needed.py
├── .planning/                   # GSD planning directory
│   └── codebase/                # Architecture docs
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js config
├── package.json                 # Dependencies (main app)
├── package-lock.json
├── bun.lock                     # Bun package manager lock
├── components.json              # UI component catalog config
├── eslint.config.mjs            # ESLint configuration
├── postcss.config.mjs           # PostCSS/TailwindCSS config
├── README.md                    # Project documentation
└── .gitignore
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router pages and layouts
- Contains: Route files (`page.tsx`), layout definitions, global styles, favicon
- Key files: `page.tsx` (homepage), `apply/page.tsx` (redirect), `more-success/page.tsx` (gallery)

**`components/`:**
- Purpose: All React feature and UI components
- Contains: Page sections (Navbar, Hero, sections), UI primitives (Button, Carousel), helper components
- Key files: See component responsibilities table in ARCHITECTURE.md

**`components/ui/`:**
- Purpose: Reusable UI components and design abstractions
- Contains: Buttons, carousels, motion presets, video embeds, maps, animations
- Import pattern: `import { Button } from "@/components/ui/button"`

**`apps/testimonials/`:**
- Purpose: Separate Next.js app for post-apply onboarding
- Contains: Full Next.js structure with own `package.json`, `tsconfig.json`, routes
- Independence: Deployable as separate subdomain (e.g., `success.muslimsettify.com`)

**`data/`:**
- Purpose: Static content and testimonial data
- Contains: `success-pictures.ts` (array of photo references with captions), video/text testimonials in subapp
- Schema: Arrays of typed objects (SuccessPicture, testimonial records)

**`lib/`:**
- Purpose: Shared utility functions and helpers
- Contains: `cn()` for className merging, (loom URL helpers in subapp)
- Import pattern: `import { cn } from "@/lib/utils"`

**`public/`:**
- Purpose: Static assets served directly by Next.js
- Contains: Images (logo, background), icons, video files, 150+ student win photos
- Access: Referenced in components via `/path/to/asset` (next.config.ts handles serving)

**`scripts/`:**
- Purpose: Build-time and development utilities
- Contains: Prebuild typeform URL check, photo processing (blur, copy, filter), win data processing
- Usage: Called via `npm run prebuild` or manually

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root HTML, metadata, global styles
- `app/page.tsx`: Homepage composition
- `app/apply/page.tsx`: Application redirect logic
- `apps/testimonials/app/page.tsx`: Onboarding/testimonials page

**Configuration:**
- `tsconfig.json`: TypeScript settings, path aliases (`@/*`)
- `next.config.ts`: Next.js config (currently minimal)
- `package.json`: Dependencies (main app)
- `apps/testimonials/package.json`: Dependencies (testimonials app)
- `postcss.config.mjs`: TailwindCSS build
- `eslint.config.mjs`: Linting rules

**Core Logic:**
- `app/apply/page.tsx`: Host-based Typeform URL routing logic
- `components/application.tsx`: React form validation (unused)
- `components/ui/motion-presets.tsx`: Shared animation definitions

**Testing:**
- Not found (no test files detected)

## Naming Conventions

**Files:**
- **Feature components:** kebab-case (e.g., `combined-overview.tsx`, `social-proof.tsx`)
- **UI components:** kebab-case (e.g., `animated-button.tsx`, `text-carousel.tsx`)
- **Utilities:** kebab-case (e.g., `motion-presets.tsx`, `lite-embed.tsx`)
- **Routes:** kebab-case folders (e.g., `apply/`, `more-success/`)
- **Data files:** kebab-case (e.g., `success-pictures.ts`, `video-testimonials.ts`)

**Directories:**
- **Feature groups:** lowercase plural (e.g., `components/`, `scripts/`, `apps/`)
- **Route segments:** lowercase kebab-case (e.g., `apply/`, `more-success/`)

**Exports:**
- **Components:** PascalCase (e.g., `export function Hero()`, `export function CombinedOverview()`)
- **Types:** PascalCase (e.g., `type SuccessPicture = { ... }`)
- **Constants/Data:** camelCase (e.g., `const successPictures = [...]`, `const overviewItems = [...]`)
- **Functions:** camelCase (e.g., `cn()`, `resolveTypeformUrl()`)

## Where to Add New Code

**New Feature Section:**
- Primary code: `components/[section-name].tsx` (marked `"use client"`)
- Import motion presets: `import { fadeIn, zoomIn } from "@/components/ui/motion-presets"`
- Add to homepage: Import and add component to `app/page.tsx` composition
- Data: If needed, add to `data/[data-name].ts`
- Test by adding to page and viewing in browser

**New UI Component:**
- Implementation: `components/ui/[component-name].tsx`
- Pattern: Export named component, mark `"use client"` if using hooks/interactivity
- Reusable: Use with `import { ComponentName } from "@/components/ui/component-name"`
- Example: See `components/ui/button.tsx` and `components/ui/animated-button.tsx`

**New Route/Page:**
- Create folder: `app/[route-name]/`
- Create file: `app/[route-name]/page.tsx`
- Layout: Reuse `app/layout.tsx` or create `app/[route-name]/layout.tsx`
- Metadata: Add `export const metadata = { title: "...", description: "..." }`
- Compose sections: Import and arrange components similar to `app/page.tsx`

**New Static Data:**
- File: `data/[data-name].ts`
- Type: Export TypeScript type (e.g., `export type ItemType = { ... }`)
- Array: Export array constant (e.g., `export const items: ItemType[] = [...]`)
- Import in component: `import { items } from "@/data/data-name"`

**Utilities & Helpers:**
- Shared helpers: `lib/[helper-name].ts`
- Component-local helpers: Define in component file directly
- Export pattern: Named exports (e.g., `export function cn() {}`)

**Configuration Changes:**
- TypeScript paths: Edit `tsconfig.json` `compilerOptions.paths`
- Next.js settings: Edit `next.config.ts`
- Tailwind config: Modify in `postcss.config.mjs` and component classes
- Environment variables: Set in deployment platform or `.env` (local development)

**Subapp Development:**
- All files: Under `apps/testimonials/`
- Package management: Has own `package.json`, `package-lock.json`
- Deployment: Separate `next build` and `next start` per subapp
- Imports: Use local path aliases in subapp's `tsconfig.json`

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase mapping and architecture documentation
- Generated: By GSD tools (`/gsd-map-codebase`)
- Committed: Yes (tracked in git)
- Contents: ARCHITECTURE.md, STRUCTURE.md, and other analysis docs

**`.next/`:**
- Purpose: Next.js build output and cached build information
- Generated: Yes (`next build` creates this)
- Committed: No (in .gitignore)
- Clean: `rm -rf .next` to rebuild from scratch

**`public/wins/`:**
- Purpose: Student success/win photos (150+ images)
- Generated: Yes (scripts copy and process photos)
- Committed: Likely yes (large asset directory)
- Processing: `scripts/blur-phone-numbers.py`, `scripts/filter-wins.mjs` manipulate these

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (`npm install` or `bun install`)
- Committed: No (in .gitignore)
- Scope: Main app dependencies; subapp has own `node_modules` under `apps/testimonials/`

---

*Structure analysis: 2026-07-29*
