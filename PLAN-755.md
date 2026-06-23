# PLAN: #755 未登入觀看權限

## Problem

When an unauthenticated user visits a public shared page (e.g. `/practices/:id`) and navigates
to a protected route (e.g. the home feed `/`), `AuthProvider` hard-redirects them to
`/auth/login?redirect=...`, taking them away from the page they were viewing.

AC requires: unauthenticated users should **see** shared pages without logging in, and receive a
**dialog prompt** (not a redirect) when they try to navigate to other protected pages.

## Solution

1. Extract pure route-protection helpers (`matchesPath`, `removeLocalePrefix`, `isProtectedPath`)
   into `packages/auth/src/utils/route-protection.ts` so they are unit-testable.

2. Add `authMode?: 'redirect' | 'dialog'` prop to `AuthProvider`.
   - `'redirect'` (current behaviour): calls `onAuthRequired` → hard redirect to `/auth/login`.
   - `'dialog'`: opens the built-in `LoginDialog` with `redirectUrl` set to the requested path.

3. Set `authMode="dialog"` in `apps/product/src/app/global-provider.tsx`.

## Files Changed

| File | Type |
|------|------|
| `packages/auth/src/utils/route-protection.ts` | new |
| `packages/auth/src/__tests__/route-protection.test.ts` | new |
| `packages/auth/src/lib/auth-provider.tsx` | modify |
| `apps/product/src/app/global-provider.tsx` | modify |
