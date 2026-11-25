# Practice expiration visibility POC

This branch shows how expired practices disappear from Your Day, including the adjacent check-in button, and how cohort practice visibility follows the cohort's date window.

The check-in button in Your Day lets users check in directly after logging in, reducing the steps needed to reach the action from the home page.

## Behavior to review

- Cohort practice rows use the cohort start and end dates.
- Individual practices and challenges use their practice end date, falling back to start date plus duration when no end date is stored.
- Your Day shows one row and check-in action per cohort. It selects the active practice with the latest practice start date; creation time breaks ties. The button submits check-ins for that selected practice ID.
- The cohort member page hides its practice list when the cohort date window has ended.
- Your Day uses a compact 32px-high check-in button with a smaller label and icon.

## Review steps

Open the product home page and a cohort member page with active and expired date windows. For a cohort with multiple active practices, confirm Your Day has one cohort practice row and that its check-in button targets the most recently started practice. Confirm expired items and their check-in buttons are absent.

## Current limitation

The `MyPracticeItem` API contract on `dev` does not currently define `cohortId`, `cohortStartDate`, `cohortEndDate`, or `isChallenge`. Your Day needs those fields to associate practice rows with cohorts and apply the correct date window, so backend/OpenAPI support is required before this behavior can be fully exercised against dev data. The cohort member home response already includes cohort-level dates.

This is an engineer review reference, not production-ready or fully validated.

## Validation recorded

- Reviewed the complete staged diff; it contains only the three source files and this note.
- `git diff --cached --check`: passed.
- Targeted Biome check for the three changed source files: no errors; one existing `useExhaustiveDependencies` warning for the `today` effect in Your Day.
- Product TypeScript check: failed because the isolated worktree has no installed dependencies or generated Next route types; unresolved workspace packages and missing global types prevent a meaningful typecheck. Package installation via Corepack was blocked by registry DNS resolution.
- Local preview in the original checkout returned HTTP 200 at `/zh-TW`, including the compact button change. This is a different, mixed checkout and does not validate the isolated POC branch or its API-dependent behavior.
- Automated tests and complete UI/date-boundary acceptance were not run.
