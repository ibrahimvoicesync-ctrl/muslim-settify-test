# Testing Patterns

**Analysis Date:** 2026-07-29

## Current State

**No testing framework configured.** This is a production application with zero automated tests.

- No Jest, Vitest, or other test runner installed
- No test files (no `.test.ts`, `.spec.ts`, `.test.tsx`, or `.spec.tsx` files found)
- No test configuration files (`jest.config.*`, `vitest.config.*`, etc.)
- No testing dependencies in `package.json`

## Test Framework

**Status:** Not Installed

To implement testing, the following setup would be recommended:

**Recommended Setup:**
```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

**Recommended Configuration:**
- Runner: Vitest (lightweight, TypeScript-native, fast)
- DOM Testing: `@testing-library/react` (follows user-centric testing patterns)
- Environment: jsdom (for React component DOM testing)
- UI: `@vitest/ui` (optional, for visual test runner)

**Run Commands (if implemented):**
```bash
npm run test                # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## Test File Organization

**Current:** No test files exist

**Recommended Pattern:**
- **Location:** Co-locate test files with source
  - Component tests: `components/__tests__/navbar.test.tsx` or `components/navbar.test.tsx`
  - Utility tests: `lib/__tests__/utils.test.ts` or `lib/utils.test.ts`
  - Hook tests: `hooks/__tests__/useCustomHook.test.ts`

**Naming:**
- Test files: `[fileName].test.tsx` or `[fileName].test.ts`
- Avoid `.spec.ts` suffix—use `.test.` for consistency

**Structure:**
```
components/
├── navbar.tsx
├── navbar.test.tsx          # Co-located test
├── application.tsx
├── application.test.tsx
└── __tests__/               # Alternative: centralized tests
    ├── navbar.test.tsx
    └── application.test.tsx
```

## Test Structure

**Recommended Pattern (if implementing):**

```typescript
// Component test example (React Testing Library)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/components/navbar";

describe("Navbar", () => {
  it("renders logo and navigation links", () => {
    render(<Navbar />);
    expect(screen.getByAltText("Muslim Settify")).toBeInTheDocument();
    expect(screen.getByText("Program")).toBeInTheDocument();
  });

  it("toggles mobile menu when menu button is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    
    const menuButton = screen.getByLabelText("Toggle menu");
    await user.click(menuButton);
    
    expect(screen.getByText("Success Stories")).toBeVisible();
  });
});
```

**Patterns:**
- Use `describe()` blocks to group related tests
- Use `it()` for individual test cases
- Use `expect()` for assertions
- Use `screen` queries (more accessible than direct DOM queries)
- User-centric testing with `userEvent` over `fireEvent`

## Mocking

**Strategy (if implemented):**
- Mock external dependencies (API calls, Next.js hooks)
- Do NOT mock components under test
- Mock at the level of imports, not individual functions

**Framework:** `vitest.mock()` or `jest.mock()` (Vitest has Jest compatibility)

**What to Mock:**
- API calls and network requests
- Next.js navigation hooks (`useRouter`, `usePathname`)
- External services (form submissions)
- Environment variables
- Child components (only when testing in isolation)

**What NOT to Mock:**
- React hooks from the component's own module
- Simple utility functions (e.g., `cn()` from `clsx` + `tailwind-merge`)
- UI libraries (use real components)
- Business logic under test

**Example (if implementing):**
```typescript
// Mock Next.js hook
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock API call
vi.mock("@/lib/api", () => ({
  submitForm: vi.fn().mockResolvedValue({ success: true }),
}));
```

## Fixtures and Factories

**Current:** None exist

**Recommended Approach (if implementing):**

Create test data factories in `__tests__/fixtures/` or `__mocks__/`:

```typescript
// fixtures/formData.ts
export const createMockFormData = (overrides = {}) => ({
  fullName: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  currentSituation: "Looking to start a new career",
  bestTime: "Mornings",
  ...overrides,
});

// fixtures/mapData.ts
export const mockMapDots = [
  {
    start: { lat: 40.7128, lng: -74.0060, label: "New York" },
    end: { lat: 34.0522, lng: -118.2437, label: "Los Angeles" },
  },
];
```

**Location:**
- `__tests__/fixtures/` for reusable test data
- `__mocks__/` for module mocks

## Coverage

**Requirements:** Not enforced

**Recommendation:** If testing is added, target:
- **Unit tests:** 70%+ for critical utilities and hooks
- **Component tests:** 80%+ for components in user flow
- Critical paths (form submission, navigation) should be 100%

**View Coverage (if implemented):**
```bash
npm run test:coverage
# Opens coverage report at ./coverage/index.html
```

## Test Types

**Unit Tests (if implemented):**
- Scope: Individual functions, utilities, hooks
- Approach: Test inputs and outputs
- Examples: `cn()` utility, Zod schema validation
- Location: `lib/__tests__/utils.test.ts`

**Component Tests (if implemented):**
- Scope: React components in isolation
- Approach: User interactions, rendered output, state changes
- Examples: Navbar toggle, form submission, modal open/close
- Location: Co-located with components

**Integration Tests (if implemented):**
- Scope: Multiple components working together
- Approach: Test user workflows (e.g., form submission flow)
- Examples: Complete application form, page navigation
- May require mock API responses

**E2E Tests:**
- **Not used** in this codebase
- If added: Use Playwright or Cypress for full end-to-end testing
- Would test: Complete user journeys in real browser

## Common Patterns

**Async Testing (if implemented):**
```typescript
// For promises and async functions
it("submits form data", async () => {
  const user = userEvent.setup();
  render(<Application />);
  
  await user.type(screen.getByLabelText("Full Name"), "John Doe");
  await user.click(screen.getByText("Submit Application"));
  
  await expect(screen.getByText("Application Submitted!")).toBeInTheDocument();
});

// For callbacks that update state
it("updates state after async operation", async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });
});
```

**Error Testing (if implemented):**
```typescript
// Test error states
it("displays error message for invalid email", async () => {
  const user = userEvent.setup();
  render(<Application />);
  
  await user.type(screen.getByLabelText("Email"), "invalid");
  await user.click(screen.getByText("Submit"));
  
  expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
});

// Test error boundaries (if implemented)
it("handles component errors gracefully", () => {
  expect(() => {
    render(<BrokenComponent />);
  }).toThrow();
});
```

---

*Testing analysis: 2026-07-29*

## Urgent: Add Testing Framework

**Priority:** High

This production application has zero automated test coverage. Recommended actions:

1. **Install Vitest + React Testing Library** for unit and component tests
2. **Add tests for critical paths:**
   - Form validation in `Application` component
   - Navigation logic in `Navbar` component
   - Zod schema validation
3. **Set up GitHub Actions** to run tests on PR
4. **Target 60%+ coverage** before adding new features

See CONCERNS.md for related issues around missing test coverage.
