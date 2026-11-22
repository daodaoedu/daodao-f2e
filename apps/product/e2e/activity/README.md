# Activity viewer regression

Start the product dev server, then run from the repository root:

```sh
E2E_PRODUCT_BASE_URL=http://127.0.0.1:3001 pnpm --filter @daodao/product exec playwright test --config e2e/activity/playwright.config.ts
```

The suite renders the real activity pages and auth provider. HTTP fixtures replace
the API boundary, so it needs no login, database or account writes. It verifies
cross-tab account changes and logout, including hiding the previous member's CTA
and location while the next viewer's response is pending. Both membership states
must enter activity details from the activity card.

These fixtures verify frontend behavior; they do not establish backend location
privacy or replace dev acceptance with real accounts.
