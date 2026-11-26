# Schedule an approved Blog publication

`Scheduled Blog publication` runs on GitHub once every 24 hours, at 01:00 UTC / 09:00 Asia/Taipei. It runs with the computer off. A release is eligible at the first daily check at or after `publish_at`; GitHub may delay scheduled runs, so this is not an exact-minute guarantee. A delayed check catches overdue work rather than missing it.

This uses the existing production publisher and supports one prepared content release at a time. That release can contain several already approved bilingual articles. There is no cross-repository token, local scheduler, new deployment adapter or automatic editorial approval.

## Prepare and schedule

1. Follow [production publication](production-publication.md) to prepare the official content revision, preserve all previously published articles, obtain exact bilingual approval and configure `BLOG_PROD_CONTENT_SHA`, `BLOG_PROD_PUBLISHED_CONTENT_SHA` and `BLOG_PROD_APPROVALS`. Prepare a normal release with `legacy_bootstrap=false`. Keep these settings fixed while the schedule is pending or a publication is running.
2. Verify the default `dev` branch contains `blog-scheduled-publish.yml` and the updated sync helper, and `prod` contains the `expected_content_sha` input and production gate. The production environment still controls the dispatched release. If it requires a reviewer at execution time, an operator must approve that run; do not disable environment protection to make a schedule unattended. Missing CI, credentials or release configuration remains a visible failure.
3. With authorization to publish this exact content at the chosen time, set the **repository** variable `BLOG_PROD_PUBLICATION_SCHEDULE` in `daodaoedu/daodao-f2e`. It is metadata, not a secret. Use the exact prepared content and published baseline SHAs; use an ISO 8601 time with an explicit UTC offset. Never put approval records or credentials in it.

```json
{
  "publish_at": "2026-12-01T09:00:00+08:00",
  "content_sha": "<full approved content commit SHA>",
  "baseline_content_sha": "<full currently published content commit SHA>"
}
```

Save the concrete JSON outside the public content tree, then set it without shell interpolation:

```sh
gh variable set BLOG_PROD_PUBLICATION_SCHEDULE --repo daodaoedu/daodao-f2e < schedule.json
```

The publisher skill resolves these technical values; the user only needs to identify the approved article and desired date/time. An article's metadata date does not itself schedule or publish it.

## Check, change or cancel

Run `Scheduled Blog publication` manually with `dry_run=true` to inspect the decision without starting a publication. Updates to the scheduler on `dev` also run this read-only check automatically; they cannot dispatch a release. Scheduled cron runs use the real dispatch path. The normal website sync still runs at its original cadence; it holds pending scheduled content and cannot publish it between daily checks.

To change the date, replace the schedule variable after checking that no publication is already pending. To cancel future checks for this release, delete the variable:

```sh
gh variable delete BLOG_PROD_PUBLICATION_SCHEDULE --repo daodaoedu/daodao-f2e
```

Deleting the variable prevents future dispatches. It does not cancel an already dispatched production run; inspect that run before attempting any separately authorized cancellation or rollback. Replacing a schedule with a different content revision requires the corresponding release settings and exact editorial approval to match.

## Publication and verification

The daily check compares the live marker with the bound content/baseline, checks the current prod CI and legacy deployment queue, then dispatches `blog-prod-publish.yml` on `prod` with `ci_run_id` and `expected_content_sha`. The production gate rejects a target changed after dispatch. It continues to validate approval digests, freeze inputs, build Website only, deploy under the existing lock and verify actual public bilingual content with rollback.

Already-live content is never dispatched again. Active production publications hold the queue; historical frontend-only releases before the scheduled time do not consume this release's retry budget. A failed publication may retry once on a subsequent daily check. Repeated failures, a mismatched live baseline or an overdue blocked release fail the check and use the existing Discord alert when configured. A successful Actions dispatch is not a successful publication: inspect the production run and `/blog-release.json`.

After verified success, advance `BLOG_PROD_PUBLISHED_CONTENT_SHA` to the newly live content revision as the existing operator process requires, then delete the completed schedule. Do not automatically rewrite release settings or approval evidence.
