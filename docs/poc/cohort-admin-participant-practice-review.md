# Cohort admin participant practice review

Requirements: [#546](https://github.com/daodaoedu/daodao/issues/546), [FRD](https://docs.google.com/document/d/1ebQ3vQMkImLO7zx5hdYJKne15gBfCPwX0kZstfzEvLk/edit). The interface builds on [POC PR #1218](https://github.com/daodaoedu/daodao-f2e/pull/1218); its earlier smoke report is historical evidence for that version.

## Behavior

Organization managers open `/en/cohorts/<cohortId>?programId=<programId>`, search joined members by name/email, filter practice titles, and sort check-in counts or latest activity. All practices aggregates each participant's records and opens the most recently active practice, with ascending practice title as the tie-breaker.

Joined enrollment identities remain visible while practice data loads, fails, or is unavailable. Failed reads offer Retry; unavailable practices cannot open. Review defaults to Check-ins/List, supports previous/next and Back to list, and preserves review context when opening check-ins. Counts include all check-in pages and both practice and check-in comments that the actor may read. Partial or failed comment reads do not masquerade as complete totals.

Manager navigation is enabled only after a successful server-authorized Lighthouse lookup matches the current practice. URL parameters are untrusted presentation/navigation data. Ordinary owner/visitor views retain their existing layout and navigation.

## Backend dependency and boundaries

This integration also requires the #546 server changes. `isCopyRestricted` is a separate response flag from `isCohortPractice` (resource locking). Copy is rejected server-side for linked cohort practices and detached `cohort_template` practices; the client suppresses the corresponding menu/CTA for all viewers. The client also understands the previous linked-cohort flags during rollout.

The confirmed draft rule permits same-organization managers to read a joined learner's Lighthouse draft within the retention period. It does not grant draft access to peers, outsiders, or managers of a different organization. Existing private-comment visibility and delayed-publication rules remain in force. Editing, archiving, and deletion still require ownership.

Deploy the server change before relying on draft navigation or detached-practice copy flags in the frontend. An older backend can still return 403 for a roster member's draft. Neither local tests nor a POC preview establish deployed availability or PM acceptance.

## Verification commands

Frontend pure-logic suites are under `apps/product/src/lib/__tests__/` (roster, participant context, copy policy); page-merging regression tests are under `packages/api/src/services/__tests__/`.

```sh
pnpm --filter @daodao/product test
pnpm --filter @daodao/api test
pnpm run typecheck
pnpm run lint
```

Server regression files: `src/services/__tests__/cohort-practice-copy.test.ts`, `cohort-practice-read-access.test.ts`, and `cohort-admin-draft.pg.integration.ts`. The final file intentionally requires the disposable PostgreSQL runner and canonical storage checkout:

```sh
pnpm test:local --schema-repo <storage-checkout> -- --runInBand --testMatch '**/cohort-admin-draft.pg.integration.ts'
```

Rendered checks cover roster recovery, empty/unavailable/loading states, desktop/mobile layout, manager and ordinary navigation, icon labels, and complete comment counts across multiple pages. Controlled response tests establish client behavior; production controllers against disposable PostgreSQL establish the draft authorization boundary. Deployment smoke and formal PM acceptance remain separate steps.
