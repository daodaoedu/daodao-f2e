# Core journeys (#324)

Run from the f2e repository:

```sh
pnpm --filter @daodao/config generate:env
pnpm test:journey-contracts
pnpm --filter @daodao/product test:e2e:journeys --list
pnpm --filter @daodao/product test:e2e:journeys
```

The dedicated config excludes the destructive future-letter SQL/Redis setup and island prototypes. It runs every selected spec at 390×844 and 1280×900. Browser UI performs the three primary creations; API calls authenticate, arrange boundary conditions, and archive only newly generated IDs. No request interception or response mocks are used.

Required runtime variables:

- `JOURNEY_PRODUCT_URL`: product origin (default http://127.0.0.1:3001).
- `JOURNEY_ADMIN_URL`: admin deployment base including `/admin` (default http://127.0.0.1:5173/admin).
- `JOURNEY_API_URL`: server origin (default http://127.0.0.1:4000).
- `JOURNEY_DEV_LOGIN_SECRET`: existing dev-login secret; never commit it.
- `JOURNEY_FIXTURES_MANIFEST`: #323 manifest path; defaults to sibling storage checkout `scripts/acceptance_fixtures/manifest.json`.

Local runs need the #323 fixture owner to have admin authorization, the owner/coach organization membership, and the fixture templates. Extend the runner manifest with `journeys.challengeTemplate: { id, title }`, identifying a dedicated reusable template in the active official organization. Current admin challenge APIs cannot use #323's private-organization template, and templates with any binding history cannot be deleted. Tests read this registered template without changing it, create UUID-scoped official programs/cohorts, then archive those records. Dev nightly uses the same explicit fixture identities and unique test-created records; do not reset shared dev fixtures. Credentials come from the manifest and environment, never fabricated accounts. Admin and product must both point to the intended API.

`practice-create` checks invalid blank action and personal-space persistence. Its wizard has URL resources and no file upload input. `challenge-join` creates/publishes in admin then joins as the learner and checks the copied practice, plus public upcoming/active/full/closed card states. Active public challenges deliberately have no join CTA for unjoined users (FR-EXP-04). `lighthouse-cohort` creates in the staff Lighthouse UI, checks consent gating and learner detail after reload, and covers upcoming/active/full/closed/closed+paused join pages. Closed+paused must show both reasons.

Outputs are under `artifacts/journeys`: HTML/JSON, failure trace and screenshot, and learner screenshots attached after each test. Use only the three named `*.spec.ts` entries in the journey registry.

Local validation: all 24 real-browser cases passed with no skipped, flaky, or unexpected results. Helper tests (8), middleware tests (18), changed-file Biome checks, and the full product TypeScript check passed. Remote CI, required-check enforcement, and deployed nightly behavior remain unverified.

Upload condition: inspected practice wizard step-tags-resources/resource-item (URL resources and OG title only), admin GroupChallengesPage program/template/cohort forms, and staff Lighthouse CohortSetupPanel. None offers file/image upload, so upload-and-readback is not applicable to these creation routes. The personal-space downstream route loads useMyPractices and renders SpacePracticeSection; it does not depend on the AI recommendations service.

Authentication is cached per API origin and fixture email in worker memory; concurrent requests share one login and rejected attempts are evicted. A passing suite normally needs at most three dev-logins per project worker, rather than one for every context. Cookies and admin token storage are installed independently in every context. Tokens are never written to a cache file.
