# Coding Conventions

**Analysis Date:** 2026-07-29

## Naming Patterns

**Files:**
- Components: kebab-case (e.g., `navbar.tsx`, `application.tsx`, `video-testimonials.tsx`)
- Data files: kebab-case (e.g., `success-pictures.ts`)
- Scripts: kebab-case (e.g., `check-no-direct-typeform.mjs`, `copy-wins.mjs`)
- Config files: dash-separated or standard names (e.g., `tsconfig.json`, `eslint.config.mjs`)

**Functions:**
- Regular functions: camelCase (e.g., `handleSubmit`, `handleLinkClick`, `isAllowed`, `toRel`, `walk`)
- Async functions: camelCase (e.g., `onSubmit`, `async (data: FormData)`)
- Handler functions: prefix with `handle` (e.g., `handleScroll`, `handleLinkClick`)
- Query/getter functions: descriptive camelCase (e.g., `projectPoint`, `createCurvedPath`)

**Variables:**
- Local variables: camelCase (e.g., `mobileMenuOpen`, `scrolled`, `pathname`, `formSchema`)
- State variables: camelCase (e.g., `isSubmitting`, `isSuccess`, `theme`)
- Ref variables: camelCase (e.g., `svgRef`)

**Types:**
- Interfaces: PascalCase (e.g., `MapProps`)
- Type aliases: PascalCase (e.g., `FormData`)
- Type annotations from Zod: PascalCase (e.g., `z.object()`, `z.string()`)

**Constants:**
- Module-level constants: UPPERCASE_WITH_UNDERSCORES (e.g., `HOMEPAGE_PICTURE_LIMIT`, `TARGET_DIRS`, `NEEDLE`, `ROOT`)
- Color values: hex format inline (e.g., `#0066FF`, `#718096`)
- Configuration constants: UPPERCASE (e.g., `ROOT`, `TARGET_DIRS`)

## Code Style

**Formatting:**
- No explicit Prettier configuration found—uses Next.js defaults
- ESLint enabled with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- TypeScript strict mode enabled (`"strict": true`)
- JSX syntax: `react-jsx` (automatic imports)
- Target ES2017 with DOM and esnext libraries

**Linting:**
- ESLint config: `.eslintrc.mjs` in project root
- Extends Next.js core web vitals and TypeScript configs
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## Import Organization

**Order:**
1. Third-party packages (`next/*`, `react`, `lucide-react`, `framer-motion`, etc.)
2. Internal components and utilities using `@/` path alias
3. Type imports when needed

**Path Aliases:**
- `@/*` → root directory (defined in `tsconfig.json`)
- All internal imports use absolute paths with `@/` prefix (e.g., `@/components/navbar`, `@/components/ui/motion-presets`)

**Examples:**
```typescript
// External first
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

// Then internal
import { Navbar } from "@/components/navbar";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";
```

## Error Handling

**Patterns:**
- Throws in utility functions when critical errors occur (e.g., `throw new Error("useCarousel must be used within a <Carousel />");` in `@/components/ui/carousel.tsx`)
- Conditional rendering for validation errors in forms (e.g., checking `errors.fullName` and displaying error messages)
- Form validation using Zod schema validation before submission
- State-based error display (errors shown inline with input fields)

**Form Validation:**
- Uses `react-hook-form` with `zodResolver` for validation
- Error messages defined in Zod schema (e.g., `z.string().min(2, "Name must be at least 2 characters")`)
- Errors displayed conditionally below form fields using `errors.fieldName?.message`

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- `console.log()` used for debugging form submissions and data flow (e.g., `console.log("Form submitted:", data);`)
- `console.error()` used in build scripts for validation failures
- Informational messages via `console.log()` (e.g., `console.log("✓ No direct Typeform links found outside /apply.");`)
- No production logging infrastructure—logging is development-focused

## Comments

**When to Comment:**
- Inline comments for non-obvious logic (e.g., `// Smooth-scroll only when the target section is already on this page.`)
- Section headers for large component sections (e.g., `{/* LEFT COLUMN - WHY APPLY */}`, `{/* Desktop Navigation */}`)
- Brief explanations of workarounds or complex calculations
- Comments for build/validation rules (e.g., `// The only allowed place to contain a direct Typeform link is the server redirect endpoint.`)

**JSDoc/TSDoc:**
- Minimal usage in main component code
- Used in build scripts with parameter/type annotations (e.g., `/** @param {string} p */`, `/** @type {{file: string, count: number}[]} */`)
- Not enforced in React components

## Function Design

**Size:** Compact functions with single responsibility
- Helper functions extract common logic (e.g., `projectPoint()`, `createCurvedPath()` in world map component)
- Event handlers are typically 5-15 lines
- Complex components use multiple small functions

**Parameters:**
- Props passed via destructuring (e.g., `export function Navbar()`, `export function WorldMap({ dots = [], lineColor = "#0ea5e9" }: MapProps)`)
- Event parameters typed explicitly (e.g., `const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string)`)
- Default values in destructuring (e.g., `dots = []`, `lineColor = "#0ea5e9"`)

**Return Values:**
- React components return JSX
- Utility functions return specific types (strings, objects, SVG paths, etc.)
- Handler functions return `void`
- Query functions return typed values (e.g., `projectPoint` returns `{ x, y }`)

## Module Design

**Exports:**
- Named exports for all components and utilities (e.g., `export function Navbar()`, `export function cn()`)
- Type exports for TypeScript interfaces (e.g., `export type FormData = z.infer<typeof formSchema>`)
- Default exports not used; always named exports

**Barrel Files:**
- Not used in this codebase
- Imports are direct: `import { Navbar } from "@/components/navbar"` (not via index files)
- Path aliases enable direct imports without barrel patterns

**Client/Server Designation:**
- Interactive components: `"use client"` directive at top (e.g., navbar, application form, carousels)
- Server components: No directive (default in App Router)
- Layout components: `export default` function (e.g., `export default function RootLayout()`)

---

*Convention analysis: 2026-07-29*
