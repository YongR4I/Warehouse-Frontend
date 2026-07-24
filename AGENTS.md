# Warehouse-fe Agent Instructions

## Next.js 16 Breaking Changes

This uses **Next.js 16.2.6** — APIs, file conventions, and routing may differ from older versions. Always check `node_modules/next/dist/docs/` before writing code. The App Router is used throughout.

## Quick Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run typecheck    # tsc --noEmit (run before commits)
npm run lint         # ESLint (flat config)
npm run format       # Prettier with tailwind plugin
```

Always run `npm run typecheck` and `npm run lint` after changes.

## Architecture

### Route Structure

- **`src/app/(auth)/`** — Public auth routes (login). No sidebar layout.
- **`src/app/(dashboard)/`** — Protected dashboard routes. Wrapped in `SidebarProvider` with collapsible sidebar.

Dashboard routes: `/dashboard`, `/inventory/*`, `/master/*`, `/absensi/*`, `/laporan/*`, `/pengaturan/*`

### State Management

Zustand stores in `src/store/`:
- `use-auth-store` — Auth state with persistence (token, user, isAuthenticated)
- `use-filter-store` — Global filters (search, gudang, kategori, date range)
- `use-dsb-store` — Selected warehouse context
- `use-scan-buffer-store` — Barcode scan buffer with persistence

All stores exported from `src/store/index.ts`.

### API Layer

- **`src/lib/api.ts`** — Axios instance with base URL (`NEXT_PUBLIC_API_URL` or `http://localhost:8000/api`)
- Auto-attaches Bearer token from auth store
- 401 responses trigger logout and redirect to `/login`
- **`src/hooks/use-api.ts`** — React Query wrappers: `useApiList`, `useApiDetail`, `useApiCreate`, `useApiUpdate`, `useApiDelete`

### Component System

- **shadcn/ui** with `base-rhea` style — components in `src/components/ui/`
- Add components: `npx shadcn@latest add <component>`
- Icons: `react-icons/bi` (BoxIcons) — not lucide for sidebar/nav
- Utility: `cn()` from `@/lib/utils` (clsx + tailwind-merge)

## Key Conventions

- Path alias: `@/*` → `./src/*`
- Language: Indonesian (Bahasa) for UI labels and data types
- Types defined in `src/types/index.ts`
- API response types: `ApiResponse<T>` and `PaginatedResponse<T>`
- QueryClient: 60s stale time, no refetch on window focus

## Gotchas

- Sidebar is sticky with wheel event capture — don't nest scrollable containers inside dashboard layout
- Auth persistence uses localStorage key `auth-storage`
- Scan buffer persists across sessions (`scan-buffer-storage`)
- Prettier configured with `endOfLine: "lf"` and no semicolons
- Tailwind CSS v4 — uses `@import "tailwindcss"` syntax, not v3 directives
