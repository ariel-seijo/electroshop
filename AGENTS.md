# AGENTS.md — TypeScript Migration Guide

> Generated during incremental TS migration. Keep this file updated as each layer is completed.

## Strict Rule: Always Ask Before Modifying Repository State

**NEVER execute any of the following without explicit user authorization:**
- `git commit`
- `git merge`
- `git push`
- `git reset`
- Any operation that modifies the repository history or remote state

This is non-negotiable. No exceptions. Ask first.

---

## Overview

Migrating a production Next.js 16 (App Router) e-commerce project from plain JavaScript to TypeScript using a **bottom-up, dependency-free approach**. Runtime compatibility must be preserved at every step.

- **Styling**: CSS Modules (`*.module.css`)
- **Validation**: Zod 4 (`z.infer` used to derive TS types)
- **Database**: Prisma 5 + PostgreSQL, soft-delete extension on `User`
- **Auth**: Iron-session with `src/proxy.ts` (already in TS)
- **State**: Zustand (auth, toast), React Context (cart, checkout)

---

## Phase 1: Configuration (COMPLETED)

### Installed dev dependencies
```
typescript @types/node @types/nodemailer
```

### tsconfig.json
- `allowJs: true`, `checkJs: false` — JS files tolerated, not type-checked
- `strict: true` — full strict-mode on all `.ts`/`.tsx`
- `moduleResolution: "bundler"` — required for Next.js 16 + `@/*` aliases
- `include` targets only `**/*.ts`, `**/*.tsx`, `next-env.d.ts`, `.next/types/**/*.ts`
- `jsconfig.json` deleted (replaced by tsconfig.json)

### CSS Modules declaration
- `src/types/css.d.ts` — ambient module declaration for `*.module.css`

### Build scripts in package.json
```
"typecheck": "tsc --noEmit"
"typecheck:watch": "tsc --noEmit --watch"
```

---

## Dependency Graph (Migration Order)

Layers must be migrated in this exact order. Each layer depends only on layers above it.

```
Layer 0 (zero deps)
  └─ lib/validations/ (5 files) — Zod schemas → TS domain types via z.infer

Layer 1 (pure utilities)
  └─ lib/utils/ (7 files) — cn, currency, cloudinary-url, serialize-product, input-formatters, useDebounce

Layer 2 (core lib, imported everywhere)
  └─ lib/*.js (7 files) — prisma, session, auth-guards, cloudinary, email, sku, rate-limit, order-state

Layer 3 (features/shared state)
  └─ features/cart/ (14 files) — HIGHEST RISK: $transaction merge, idempotency
  └─ features/auth/ (6 files) — Zustand store
  └─ features/toast/ (4 files) — Tiny Zustand store

Layer 4 (features with complex state)
  └─ features/checkout/ (19 files) — Context + reducer + Zod validation
  └─ features/orders/ (21 files) — PDF generation, service layer

Layer 5 (features/presentational)
  └─ features/products/ (21 files) — Product cards, gallery, carousel
  └─ features/category/ (20 files) — Filters, sorting, URL builder
  └─ features/shop/ (11 files) — Navbar, footer, hero, brands

Layer 6 (largest feature)
  └─ features/admin/ (68 files) — Dashboard, CRUD forms, tables, services

Layer 7 (app layer)
  └─ app/api/ (17 files) — Route handlers
  └─ app/ (pages/layouts) — Page components
```

---

## Key Type Patterns

### Zod → TS types (Layer 0)
```ts
// After each schema, add:
export type FooInput = z.infer<typeof fooSchema>;
// Export from barrel index.ts
```

### Prisma client soft-delete extension (Layer 2)
```ts
// Use `as unknown as PrismaClient` cast after $extends
// Pragmatic tradeoff: Prisma loses precise types in dynamic extensions
export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();
```

### Session typing (Layer 2)
```ts
export interface SessionData {
  userId: string;
  email: string;
  role: string;
}
// Use: getIronSession<SessionData>(cookieStore, sessionOptions)
```

### Cart types (Layer 3)
```ts
export interface CartItem {
  id: number; title: string; slug: string; price: number;
  oldPrice: number | null; thumbnail: string; stock: number;
  sku: string; brand: string; categoryId: number; quantity: number;
}
export type CartState = CartItem[];
export type CartAction =
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_TO_CART"; payload: { product: CartItem; quantity?: number } }
  | { type: "INCREASE_QUANTITY"; payload: number }
  | { type: "DECREASE_QUANTITY"; payload: number }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | { type: "CLEAR_CART" };
```

### Server Actions (Layer 3+)
```ts
// Always type parameters and return values explicitly
interface SyncItem { productId: number; quantity: number }
interface SyncedCartItem { id: number; quantity: number; product: { /* full Product */ } }
export async function syncCart(items: SyncItem[]): Promise<SyncedCartItem[]> { ... }
```

### CSS Modules
```ts
// Ambient declaration in src/types/css.d.ts handles all *.module.css imports
// No per-file module declarations needed
```

---

## Phase-by-Phase Verification

After each layer completes:
```bash
npm run typecheck          # Must pass (zero errors)
```

After full migration:
```bash
npm run build              # Full production build
npm run lint               # ESLint must still pass
```

### Smoke test checklist (after Layer 3+)
- Login/logout flows work
- Cart: add, remove, increase, decrease quantities
- Cart merge: guest cart merges into authenticated cart on login
- Checkout flow completes
- Admin: product CRUD, user management, order status transitions

---

## Current Status

- [x] Phase 1 — Configuration & tooling
- [x] Phase 2 Layer 0 — Zod schemas (lib/validations/)
- [x] Phase 2 Layer 1 — Pure utilities (lib/utils/)
- [x] Phase 2 Layer 2 — Core lib (lib/\*.js → lib/\*.ts)
- [x] Phase 2 Layer 3 — Cart + Auth + Toast features
- [x] Phase 2 Layer 4 — Checkout + Orders features
- [x] Phase 2 Layer 5 — Products + Category + Shop features
- [x] Phase 2 Layer 6 — Admin services + barrels + global components
- [x] Phase 2 Layer 7 — API routes + Pages
- [x] Batch 1 — 14 foundational primitives (modals, sidebar, skeletons...)
- [x] Batch 2 — 17 core admin CRUD components (ProductForm, ProductTable, UserTable...)
- [x] Batch 3 — 21 dashboard, orders, and re-export files
- [x] Sub-batch — 3 admin action files (productActions, userActions, imageActions)

**100% migration complete — 0 JavaScript files · 213 TypeScript files**

---

## Known Risks

| Risk | Mitigation |
|---|---|
| Prisma `$extends` type loss | Cast `as unknown as PrismaClient` |
| Iron-session generic types | Use `getIronSession<SessionData>()` |
| CSS Module imports | `src/types/css.d.ts` ambient declaration |
| `z.infer` on `.transform()` | `z.infer` gives output type; use `z.input` for input |
| Build breaks over untracked JS | `include` in tsconfig excludes `*.js`/`*.jsx` |
