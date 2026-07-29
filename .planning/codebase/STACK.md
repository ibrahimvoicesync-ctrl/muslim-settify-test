# Technology Stack

**Analysis Date:** 2026-07-29

## Languages

**Primary:**
- TypeScript 5.x - All source code (`.ts`, `.tsx`)
- JavaScript - Build scripts (`.mjs`)

**Secondary:**
- CSS/PostCSS - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js (version not explicitly pinned; uses modern ES2017 target)

**Package Manager:**
- npm - Primary (package-lock.json present)
- Bun - Supported (bun.lock present)

## Frameworks

**Core:**
- Next.js 16.0.10 - Full-stack React framework (App Router)
- React 19.2.0 - UI library
- React DOM 19.2.0 - DOM rendering

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind
- tw-animate-css 1.4.0 - Animation utilities
- Class Variance Authority (CVA) 0.7.1 - Component variant patterns
- Tailwind Merge 3.3.1 - Merge utility classes without conflicts

**UI Components:**
- shadcn/ui - Component library (via components.json config)
- @radix-ui/react-slot 1.2.3 - Slot pattern for composable components
- Lucide React 0.552.0 - Icon library

**Forms & Validation:**
- React Hook Form 7.66.0 - Form state management
- @hookform/resolvers 5.2.2 - Form validation resolvers
- Zod 4.1.12 - TypeScript-first schema validation

**Animation & Motion:**
- Framer Motion 12.23.24 - Animation library
- motion - Built-in animation capabilities

**Other UI Libraries:**
- Embla Carousel React 8.6.0 - Carousel component
- React CountUp 6.5.3 - Number animation component
- Cobe 0.6.5 - 3D globe visualization
- Dotted Map 2.2.3 - Map visualization
- Next Themes 0.4.6 - Dark mode/theme management

**Fonts:**
- Inter (from next/font/google) - System font, optimized via Next.js

## Build & Development Tools

**Compiler:**
- TypeScript 5.x - Type checking and transpilation

**Linting:**
- ESLint 9.x - Code quality
- eslint-config-next 16.0.10 - Next.js-specific ESLint configuration
- next/typescript - TypeScript support for Next.js linting

**Formatting:**
- Prettier (configured via postcss.config.mjs) - Not explicit, but imported patterns suggest usage

**PostCSS:**
- PostCSS 4 - CSS processing pipeline
- postcss.config.mjs - Configuration at `/Users/ibrahimawwad/muslim-settify-test/postcss.config.mjs`

**Type Definitions:**
- @types/node 20.x - Node.js types
- @types/react 19.x - React types
- @types/react-dom 19.x - React DOM types

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Compiler options, path aliases (@/* for root imports)
- Target: ES2017
- Module: esnext
- Isolated modules: true

**Next.js:**
- `next.config.ts` - Minimal configuration (empty config object)

**PostCSS:**
- `postcss.config.mjs` - Tailwind CSS PostCSS plugin configuration

**ESLint:**
- `eslint.config.mjs` - Extends Next.js core Web Vitals + TypeScript configs

**shadcn/ui:**
- `components.json` - UI component registry configuration
  - Style: new-york
  - Icon library: lucide
  - Base color: neutral
  - CSS variables: enabled
  - Tailwind CSS: enabled with variables

## Environment Requirements

**Development:**
- Node.js runtime (specific version not pinned)
- npm or bun package manager
- Modern terminal (Unix-like or Windows with WSL)

**Build Prerequisites:**
- Pre-build script: `scripts/check-no-direct-typeform.mjs` validates no direct Typeform links outside `/apply` endpoint

**Production:**
- Vercel platform (recommended; see README.md)
- Environment variable: `TYPEFORM_URL` (fallback for unknown hosts)

## Platform & Deployment Target

**Hosting:**
- Vercel (primary recommendation in README)
- Compatible with any Node.js hosting (self-hosted servers, cloud providers)

**Build Output:**
- Next.js static + server-side rendering
- .next directory (generated, not committed)

---

*Stack analysis: 2026-07-29*
