# Pinned Blog website releases

This workflow is website-only. It does not call `linode-cd.yml` force deployment, deploy product, change Cloudflare settings, or authenticate editorial approval by itself. Deployment targets **development**; production cutover is separate.

## Commands

```sh
export BLOG_EVIDENCE_ROOT=/private/approved-release-inputs
export BLOG_RELEASE_BASE_URL=https://verified-development-origin
python3 scripts/blog-release.py prepare \
  --frontend-repo /path/to/daodao-f2e --frontend-sha FULL_SHA \
  --approved-frontend-sha TRUSTED_PROTECTED_PIN \
  --content-repo /path/to/daodao-blog --content-sha FULL_SHA \
  --approvals /private/approved-release-inputs/approvals.json --baseline /private/approved-release-inputs/previous-baseline.json \
  --build-env /private/approved-release-inputs/approved-public-build-env.json --store /path/to/store
python3 scripts/blog-release.py import --store /path/to/deployment-store --artifact /path/to/downloaded-release --manifest-sha256 TRUSTED_PREPARE_JOB_HASH
python3 scripts/blog-release.py activate --store /path/to/deployment-store --release RELEASE_ID --generation MONOTONIC_INTEGER --base-url https://verified-development-origin
python3 scripts/blog-release.py rollback --store /path/to/deployment-store --release PREVIOUS_RELEASE_ID --generation NEWER_INTEGER --base-url https://verified-development-origin
```

Remote sources are limited to `https://github.com/daodaoedu/daodao-f2e.git` and `https://github.com/daodaoedu/daodao-blog.git`. Caller-owned local Git checkouts/fixtures remain supported. Local repository paths are used only as subprocess working directories, not Git option arguments. Other HTTPS repositories are rejected before clone.

`prepare` is not deployment. It checks out both full40-character SHAs (dirty source worktrees are ignored), compares the frontend to a trusted caller-supplied pin, installs frozen dependencies, runs the single publish validator and `pnpm --filter @daodao/website build`. The website's own prebuild stages validated images at `public/blog-images/<pair-digest>/images/...`; the runner verifies staged bytes, not a second content schema. No product build is invoked.

CLI string equality is not human authorization. A direct caller must obtain `--approved-frontend-sha` from a protected reviewed manifest; taking both values from the same untrusted request is invalid. The GitHub workflow obtains the pin from protected configuration, uses protected `BLOG_FRONTEND_CHANNEL`: `approved-dev-bootstrap` requires reachability from dev and successful dev-push Linode CI; `formal-prod` requires prod ancestry and successful prod-push CI. The channel is independent of dispatch input. Bootstrap permits reviewed development proof before any production promotion. The repo has dev/prod and no main branch. No bypass flag is provided.

The shared validator authenticates neither reviewer identity nor who created a receipt. Approval evidence must come from the actual authorized editorial process, remain outside source content, and match the complete reviewed pair. Test-only receipts prove rejection/acceptance behavior, not a real human approval.

Build environment JSON accepts explicit `NEXT_PUBLIC_*` string values only and requires credential-free HTTPS origins for `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_WEBSITE_URL`; missing navigation configuration stops before build. values are recorded by hash in artifact identity. Ambient public variables are removed before applying that map. Content/frontend SHAs and a stable build ID are supplied to the loader. Approval/baseline bytes are privately snapshotted for the invocation and never copied into website output. Build/install logs stay private under `store/logs`; do not publish them without inspection.

## Immutable artifacts and atomic activation

`store/releases/<id>/` holds `release.json` plus `site/`. The ID binds frontend/content SHAs, approval/baseline bytes and public build configuration. The manifest records SHA-256 for every output file, source pair, validated content digests, original dates/slugs, and HTTP smoke mappings. Symlinks and escaping artifact paths are rejected. Artifact hashes identify integrity relative to the trusted manifest; they do not sign an attacker-writable store. Keep store ownership and artifact download provenance trusted.

`activate` verifies candidate files and serves a temporary candidate HTTP origin before swapping the `current` symlink atomically. It then reads list pages, both-language articles, referenced images, and version/baseline markers from the configured target origin and compares exact bytes. A failed readback restores the previous pointer and verifies it again. Existing unmanaged pointers are never overwritten. Corrupt files or missing static routes stop before activation.

A file lock serializes activations. `generation.json` retains the greatest accepted request, even when that request fails; an older queued job cannot subsequently replace it. Retrying the same generation/release is allowed; a different release cannot reuse the generation. Same artifact retries reuse the immutable directory. Rollback selects the previous complete source pair with a newer generation and repeats validation/readback. Dates/slugs are also checked against the actual active baseline, so omitting an input baseline cannot silently change an existing published identity.

Public `/blog-release.json` identifies source pair and baseline hash. `/blog-published-baseline.json` contains only public original dates/slugs, bound to that marker. `fetch-baseline` verifies their version relationship before saving input for the single validator. First release is allowed only when the marker is genuinely absent and explicitly configured as first; network failure or a corrupt/missing second file is not an empty baseline fallback.

For a controlled local adapter, run:

```sh
python3 scripts/blog-release.py serve --store /path/to/store --host 127.0.0.1 --port 8536 \
  --tls-cert /private/server-cert.pem --tls-key /private/server-key.pem
```

The `serve` command requires caller-provided `--tls-cert /private/server-cert.pem --tls-key /private/server-key.pem` and serves HTTPS on literal `127.0.0.1` only, with TLS 1.2 or newer. There is no plaintext fallback; missing, invalid or mismatched credentials stop before binding. Keep the private key outside the release store/web root, and configure clients to trust the issuing CA instead of disabling certificate verification. The short-lived internal candidate smoke server remains loopback-only and does not expose the persistent serving endpoint.

This Python static server is a test/readback adapter, **not evidence of a cloud development deployment**. A real development host must serve `store/current/site` while following the current symlink for each request. Mount the store parent read-only into the web server, not the resolved symlink target (a mount of the target will stay on the old release). Keep logs, source workspaces and private inputs outside the web root. Existing Linode containers are image-backed and have no verified release mount; no such mount or self-hosted runner was installed by this PR.

## GitHub setup — not yet performed

The content repo has no configured secrets at audit time. Its data-only branch workflow validates using a fixed reviewed schema-owner SHA, then dispatches `blog-release.yml` on the protected `BLOG_FRONTEND_REF` (`dev` for approved bootstrap, `prod` for steady formal releases) for main content pushes. `BLOG_FRONTEND_DISPATCH_TOKEN` must be a narrowly scoped token allowed to run that frontend workflow; missing token stops. It was not provisioned or tested here. PR branches do not dispatch releases.

The frontend workflow requires all of the following before activation:

| Protected setting | Purpose |
|---|---|
| repository `BLOG_RELEASE_MANAGED=true` | Disables legacy website ownership; must remain enabled after adoption |
| development `BLOG_FRONTEND_CHANNEL` | `approved-dev-bootstrap` or `formal-prod`, independent of request |
| development `BLOG_APPROVED_RUNNER_SHA` | Independently reviewed release-controller SHA on the channel branch with matching successful push CI; used for prepare/import/activate/rollback code checkout |
| development `BLOG_APPROVED_FRONTEND_SHA` | Exact reviewed frontend pin reachable from the channel branch and with successful matching push CI |
| development `BLOG_DEPLOY_RUNNER_ENABLED=true` | Operator confirmation that the isolated deployment adapter is installed and tested |
| development `BLOG_RELEASE_STORE` | Existing absolute persistent store path on the deployment runner |
| development `BLOG_RELEASE_BASE_URL` | Verified HTTPS development website origin |
| development `BLOG_PUBLIC_BUILD_ENV_JSON` | Reviewed public build variables, no secrets |
| development secret `BLOG_POLICY_READ_TOKEN` (optional when github.token cannot read policy) | Narrow read access for repository variables and environment policy; unavailable reads fail closed |
| development secret `BLOG_APPROVALS_JSON` | Exact authorized private approval records for this content version |
| development `BLOG_FIRST_RELEASE=true` | Permits only the genuinely absent initial marker; clear after first release |

An isolated, least-privileged self-hosted runner with label `blog-development` must be able to write only the persistent release store while the serving process reads it. Environment approval/protection must be configured before enabling this runner. Do not expose a privileged host runner to PR code. The workflow accepts only dev/prod dispatch matching the protected channel and never runs from feature/PR pushes. Required reviewers and custom dev/prod branch restrictions are read back before build. None of these setup assertions are inferred from a local test or a variable merely existing.

Current setup evidence: f2e has existing BOT_PAT/Docker/ENV_DEV secret names, but no Blog release variables or Blog approval secret were observed; development secret listing was empty; org secret names could not be read (403), and no scope refresh was requested. The development environment currently has no required-reviewer or deployment-branch policy; the new workflow therefore fails closed until operators configure them. No credential values were read or printed. These facts are not proof that an external runner/mount exists.

## Coexistence with legacy CD

The legacy website job now checks out the CI SHA, not a moving branch, and refuses a Blog-enabled ordinary build before any empty-content deployment. Managed mode skips that job. A live API ownership check immediately before legacy deploy forces the actual website flag false on managed or unreadable policy, while the product flag remains independent. With no authorized app, remote mutations do not run. Verification and notifications use actual deployment flags, and the shared deploy ref never advances for a requested app that was not deployed. Product-only prod uses the protected production environment even if website was skipped.

The shared ref rule is conservative: a skipped requested website can leave the global ref behind and cause a later product rebuild. It avoids falsely certifying a website deployment; separate per-app refs are not introduced here.

At cutover, drain all pre-patch/in-flight legacy website jobs, enable and read back the repository ownership guard, install/verify the serving mount and least-privileged runner, and run the complete development failure/retry/rollback matrix. The new runner alone cannot prevent a privileged old job that never contained the guard from writing the old deployment.

## Content repository conversion

The pure-content branch removes legacy Next/Notion code, package/yarn.lock and old build workflow while preserving Git history. Cloudflare Pages still binds main production and all-branch previews to the old command. **Do not merge that PR until the approved cutover policy disables old Git builds and the settings are read back.** No external settings were changed. Seven obsolete dependency PRs overlap the removed manifest/lock and remain for maintainers to handle during cutover; they were not closed automatically.

## Evidence boundaries

Tests cover immutable checkout/approval-pin rejection/fetch-validation-build failure, actual local HTTP activation, corrupt artifacts, concurrent generations, idempotent retry, readback failure restoration and complete-pair rollback. Pipeline unit tests use a controlled fake pnpm process for stage failure injection; they are not real website builds. The separate actual frontend/content build and HTTP smoke record is the evidence for real static output. Neither is cloud dev deployment, actual editorial approval, cross-repo dispatch permission, production cutover, or PM acceptance.

## Trigger and stale-job checks

GitHub requires the workflow file on default branch dev for workflow_dispatch discovery, and on prod before the formal-prod channel is enabled. Approved bootstrap dispatches dev without requiring a prod merge. Install both through reviewed PR/release flow; neither currently exists from this feature branch alone. See [GitHub workflow_dispatch reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch). GitHub concurrency does not guarantee dispatch order, so the file-lock/high-water check is authoritative, not queue order.

A publish request must still match current content main both before build and immediately before activation; activation also rechecks the protected approved frontend pin via API. An old long-running job is rejected when either has advanced, regardless of GitHub queue order. Explicit rollback instead selects a previously verified active artifact recorded in persistent history; an unactivated prepared artifact cannot be smuggled through rollback. No force option exists.

`BLOG_EVIDENCE_ROOT` is set to the controlled private snapshot directory for the child validator/website loader. This is a real private directory created by the runner, not derived from an untrusted file argument; the shared reader owns descriptor/no-follow confinement. Original receipt identity still belongs to the trusted caller. Bootstrap config generation runs before the validator, then website prebuild regenerates config/assets as usual.

Rollback does not rebuild/fetch content or depend on a new frontend approval pin/CI: it uses only a previously verified active artifact from persistent history. Managed serving ownership and deployment environment protection still apply.

## Artifact provenance and interrupted activation

`prepare` returns manifest_sha256 from the trusted producer. The workflow forwards that job output separately from the artifact; import requires it. Never calculate the expected value from an untrusted downloaded manifest. Import snapshots the pinned manifest and streams only its whitelisted files through no-follow directory/file descriptors, rejects symlinks/hardlinks, and checks every copied byte hash. Registered manifest hashes live in a separate trusted store catalog; activation/rollback verify that catalog before using an artifact. This closes self-resigning payload substitution while preserving the explicit assumption that the deployment store and producer/job outputs remain trusted. Required list/article/version smoke routes cannot be empty.

Before pointer swap, a persistent pending journal records old/new versions and generation. On retry after ungraceful process termination, the runner either verifies an already committed same-version state or restores the journaled old state before retrying. The high-water mark is retained. Tests include actual child-process exit after pointer replacement, not only caught Python exceptions. This is process-interruption recovery, not a claim of tested host power-loss durability.

Manual legacy app=website/product deployments never advance the single shared deploy ref, because the other app may have undeployed changes. Only fully requested/all-app automatic cases can advance it. This conservative rule may rebuild already deployed product changes later, but does not silently discard pending website changes.

Original receipt, optional baseline and public-build-config files must all stay inside caller-configured BLOG_EVIDENCE_ROOT, disjoint from public source content. The runner reads those inputs through no-follow confined descriptors before creating the controlled child snapshot; it does not grant scope merely by copying an arbitrary requested file. The child validator also receives BLOG_CONTENT_DIR from the verified pinned checkout, independently of the raw CLI path argument.

Builder subprocesses receive a small tooling-environment allowlist plus explicit public configuration and controlled Blog scopes. Unrelated CI tokens, raw approval-secret environment values and GITHUB_OUTPUT are not inherited by dependency hooks or Next build. This reduces ambient exposure; it does not turn an untrusted frontend/dependency into trusted code. The approved-source and locked-dependency assumptions still apply.

The runner checkout is independently pinned by BLOG_APPROVED_RUNNER_SHA, including rollback; it is not the moving workflow github.sha. Workflow policy itself must be merged through the reviewed dev/prod flow. Publication rechecks content main and the protected frontend pin inside the store activation lock, after import and candidate smoke, immediately before pointer swap. This is a bounded external read, not an atomic transaction with a concurrent GitHub variable/ref update. Generation ordering serializes accepted deployment requests; a newly advanced external ref becomes visible on the next read/request. Redirects are never followed, including marker404 fallback. The local adapter supplies MIME/nosniff headers for browser assets.

Legacy ownership API capability must be established before adopting this workflow change. If policy cannot be read, website skips fail closed with an Actions warning and explicit partial notification; independent product deployment and verification continue. This is not a successful website deployment. No token capability is inferred from its name.

Ordinary publication cannot remove currently published article IDs; unpublishing requires a separately designed explicit approval path. Previously published dates/slugs are also checked against verified activation history across rollback. An authorized rollback may restore an earlier article set, while preserving historical identity constraints for any reintroduced article. Required HTTP smoke includes both-language website homepages in addition to Blog routes/images/version markers. The store must remain outside /root/daodao-f2e, whose legacy product CD runs git clean; workflow and controller both reject that location.

Readback requires caller-configured `BLOG_RELEASE_BASE_URL` independently of the requested `--base-url`. They must match exactly apart from a trailing slash. The origin must be credential-free HTTPS without a path/query/fragment; literal `127.0.0.1` or `::1` HTTP is allowed for controlled local tests only. This capability also applies to `fetch-baseline` and recovery. The temporary candidate server selects its own loopback origin inside the controller. Requests cannot authorize another origin merely by passing a URL argument, and redirects remain disabled.

Source snapshots use native `git fsck --strict --no-reflogs` followed by `git cat-file --batch` over the pinned tree, rather than archive export attributes or checkout filters. Git replace refs are disabled for every tooling subprocess. Corrupt object bytes and replacement commits must therefore fail or retain the original fixed source; regression tests cover both cases. Only regular Git blobs with supported file modes are materialized.
