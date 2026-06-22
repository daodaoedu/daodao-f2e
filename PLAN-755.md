# Plan: #755 未登入觀看權限

## Acceptance Criteria

- 未登入(未註冊)使用者應可看到被分享的那個頁面，不用登入即可觀看
- 若點選其他頁面則提示需註冊/登入

## Investigation Findings

### Auth Architecture

Auth is **client-side only** — the Next.js middleware (`src/middleware.ts`) only handles i18n routing. No server-side redirect to login exists in middleware or layout files.

### Route Audit

| Route | Unauthenticated access |
|-------|----------------------|
| `/users/[identifier]` | ✅ Server component; reads auth cookie optionally (`authToken ?? ""`), renders page regardless. `isAuthenticated` only gates own-profile features. |
| `(with-layout)/layout.tsx` | ✅ No auth check — renders children + Sidebar + Footer |
| `Sidebar` | ✅ Returns `null` when unauthenticated (non-blocking) |
| `Banner` | ✅ Skips quiz result fetch when unauthenticated, shows default slogan |
| `(with-layout)/mine/page.tsx` | ⚠️ Needs verification — uses `useAuth()` but may redirect or show empty state |
| `(with-layout)/page.tsx` (feed) | ⚠️ Needs verification — uses `useAuth()` |

### Likely Shared Page

The "shared page" in DaoDao is most likely the **user island page** at `/users/[identifier]`. Based on the code, this page already renders for unauthenticated users. However, child components like `PracticeSection` call authenticated APIs, which may result in empty states or redirect to login for unauthenticated visitors.

### Likely Problem Areas

1. **`PracticeSection` / `PersonaProfileUser`** — if they call protected API endpoints that return 401 and trigger a login redirect via `useAuth()` error handler
2. **`mine/page.tsx`** — may be the entry point that redirects unauthenticated users away from their intended destination
3. **Navigation links on the shared page** — clicking links to `/mine`, `/social`, `/notifications` etc. should show a login prompt rather than a silent redirect

## Proposed Fix

### 1. Ensure `/users/[identifier]` renders correctly without auth

Audit `UserInfoCard`, `UserProfileTabs`, and `PracticeSection` for any auth-gated API calls that may 401 and redirect. For unauthenticated visitors:
- API calls should be skipped or show empty states gracefully
- No redirect to `/auth/login`

### 2. Add login prompt for protected navigation

When an unauthenticated user clicks a protected navigation link (sidebar items, FAB, settings), show a toast or modal prompting registration/login — **do not redirect away from the current page**.

Use the existing `login()` from `useAuth()` rather than `router.push('/auth/login')`.

### 3. Optional: Add `?next=` redirect param

After successful login, redirect back to the originally requested shared page URL.

## Files Likely Changed

- `apps/product/src/components/user/` — audit for auth-gated calls
- `apps/product/src/components/practice/list/practice-section.tsx` — handle unauthenticated state for `isOwnData`
- `apps/product/src/components/layout/sidebar/index.tsx` — replace any hard redirects with `login()` prompt
- `apps/product/src/app/[locale]/(with-layout)/mine/page.tsx` — verify no hard redirect for unauthenticated entry

## Open Questions

1. Which exact URL is being shared? (User island `/users/[id]` or a specific check-in/practice?)
2. Is the current blocker a hard redirect to `/auth/login` or an empty/broken state?
3. Should the login prompt be a modal dialog or toast?

> ⚠️ Requires manual verification in the running app to pinpoint the exact failure point before implementation.
