# Product Playwright E2E

Future Letter FRD tests intentionally fail fast unless they are pointed at isolated test
infrastructure. They never fall back to a developer or production database, Redis database 0,
or a hardcoded local user.

## Required environment

```bash
E2E_PRODUCT_BASE_URL=http://127.0.0.1:3001
E2E_API_BASE_URL=http://127.0.0.1:4000
E2E_TEST_DATABASE_URL=postgresql://test:test@127.0.0.1:5432/daodao_e2e
E2E_REDIS_URL=redis://127.0.0.1:6379/15
E2E_USER_A_ID=<disposable owner internal id>
E2E_USER_A_TOKEN=<JWT accepted by the test server>
E2E_USER_B_ID=<different disposable user internal id>
E2E_USER_B_TOKEN=<JWT accepted by the test server>
```

The server and real Future Letter worker must be running against the same database and Redis
database. Product, API, PostgreSQL, and Redis default to loopback-only. If test infrastructure
uses a remote host or a local VM alias, each remote target must be opted into independently:

```bash
E2E_ALLOW_REMOTE_PRODUCT=true
E2E_ALLOW_REMOTE_API=true
E2E_ALLOW_REMOTE_TEST_DATABASE=true
E2E_ALLOW_REMOTE_TEST_REDIS=true
```

Never point these switches at production. The database name must still contain a dedicated
`test` or `e2e` segment, and Redis must use a non-zero logical database.

The practice snapshot spec also requires a disposable practice owned by user A:

```bash
E2E_PRACTICE_ID=<practice external UUID>
E2E_PRACTICE_TITLE=<expected immutable title>
```

Optional evidence inputs:

```bash
E2E_SERVER_LOG_PATH=/absolute/path/to/server.log
E2E_WORKER_LOG_PATH=/absolute/path/to/worker.log
E2E_ARTIFACTS_DIR=artifacts/future-letter-playwright
```

Each test uses unique sentinel content, tracks every letter it creates, removes its BullMQ job,
notification rows, event rows, and database row during teardown, and attaches captured API
response bodies plus browser errors. Playwright records video for every run and keeps traces and
screenshots for failures.

## Commands

From `daodao-f2e`:

```bash
pnpm --filter @daodao/product exec playwright install chromium
pnpm --filter @daodao/product test:e2e:future-letter
pnpm --filter @daodao/product test:e2e --list
pnpm --filter @daodao/product typecheck:e2e
```

The tests assert the FRD contract, so they are expected to fail against the legacy implementation.
That is intentional: a missing selector, redacted field, open endpoint, unique draft behavior, or
safe confirmation dialog must not be reported as a pass.
