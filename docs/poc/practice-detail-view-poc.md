# Practice detail view POC

Engineering review reference, based on `dev` at `22d30ef8` (2026-11-26).

## Entry points

Run the product app with the normal development API configuration. Use an existing practice that the signed-in account can access and that has check-in records:

- Owner: `/practices/<practice-external-id>`
- Visitor preview: `/practices/<practice-external-id>?view=visitor`
- English uses the equivalent `/en/` routes.

Current dev uses `localePrefix: "as-needed"`; Traditional Chinese is the default without a locale prefix. The original localhost prototype used `/zh-TW/` URLs.

`view=visitor` changes presentation while keeping the current session. It does not impersonate another account, change API authorization, or demonstrate anonymous access. Reactions, comments, follow/report and copy actions retain the current account and existing server policy. Remove the query parameter to return to the normal view.

## Settled behavior

- Check-ins default to List. Tablet and desktop show List/Bubbles controls for owner and visitor views; mobile continues using the existing list presentation.
- Practice information starts expanded on compact screens. After collapsing, the summary shows the creator avatar (or fallback), name and action description when a creator is available. The collapse control sits inside the expanded card rather than in a separate bar.
- Visitor preview hides practice editing, resource editing, archive/delete and owner check-in controls; it shows the creator profile and existing visitor actions. Preview context survives navigation into a check-in and back, in both list and bubble modes.
- The mobile/tablet navigation logo scrolls with the practice detail page instead of remaining fixed. Other routes and the desktop sidebar retain their existing behavior.
- Resources without a scheduled day no longer show the all-period tag. Scheduled resources keep their date/day label.

## Scope and validation

Only five product source files and this note are included. Newer dev behavior is preserved, including accessible tabs, API error/retry states, cohort context, and server copy restrictions. No API/schema, demo-data, dependency, or local-service configuration changes are included.

Earlier interactive checks on the local mixed prototype confirmed desktop/tablet list and bubble switching, list expansion, visitor check-in navigation, compact avatar summary and its expand/collapse behavior. Those observations are prototype evidence, not a full validation of this port. The final default-state and resource-label tweaks were made afterward.

Current handoff checks:

- `pnpm install --frozen-lockfile --ignore-scripts`: passed; dependency manifests and lockfile unchanged.
- Biome format and lint for the five changed source files: passed.
- `git diff --check`: passed.
- `pnpm run lint`: attempted; failed in unchanged `packages/blog-content` files because its `biome check` script flags CRLF checkout line endings. Unrelated files were not reformatted for this POC.
- Workspace typecheck: passed, 18/18 tasks (`pnpm exec turbo run typecheck --concurrency=2`, final log `poc-typecheck-final.log`). The first default-concurrency run was interrupted due to resource pressure. The next run exposed missing generated website `PageProps`/`LayoutProps`; `pnpm --filter @daodao/website exec next typegen` supplied those local build prerequisites, and the final run passed. Generated files are not included in the POC commit.
- `pnpm --filter @daodao/product exec vitest run src/components/layout/__tests__/sidebar-menu.test.ts src/components/layout/__tests__/sidebar-gutter.test.ts --maxWorkers=1`: 2 files and 9 tests passed. These cover existing sidebar behavior, not the whole practice flow.
- Browser smoke attempt on the isolated port `3002`: blocked by `ERR_TOO_MANY_REDIRECTS` before rendering the practice page. The canonical default-locale route was also attempted. Ported UI behavior remains unverified in this isolated runtime; the previous prototype observations are listed separately above. Temporary preview processes were stopped after the attempt.

No production deployment or acceptance result is implied.

## Known limits

- Review needs a running API, valid session and accessible practice data; this branch includes no seeded records or local login bypass.
- Visitor preview keeps the real account's comment ownership and interaction permissions. Do not use it as an authorization test.
- Existing `md` responsive boundaries are retained. Wider tablets that use the desktop sidebar have the always-expanded desktop overview.
- The original localhost API repeatedly stopped; the existing local watchdog was started during the design session. That environment repair is outside this branch.
- No related issue or FRD was supplied in this chat.
