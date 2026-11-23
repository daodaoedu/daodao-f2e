# Manual development website publication

The `Blog development bootstrap` workflow keeps its original `probe` operation and adds `publication-test`. The new operation installs and tests a real release on `https://dev.daodao.so`; it is engineering testing, not editorial approval or production publication. Product and production deployment remain independent.

## Installation and execution order

1. Merge this installer normally after source review and required checks. Wait for successful CI on that exact `dev` commit. Merging the installer does not publish an article.
2. Enable the DEV-only repository variable `BLOG_DEV_RELEASE_MANAGED=true` and read it back. The legacy workflow stops building/deploying the development website while preserving Product and other environments.
3. Dispatch the installed workflow on `dev`, operation `publication-test`, using a full official content commit SHA. The default content pin is the user-authorized development article commit `0daa4231bb2072657c807813e960919b982f9d8e`; it need not be content `main` for this engineering test.
4. The workflow verifies latest-dev CI, prepares both artifacts without SSH credentials, verifies the exact same-run data artifact from a fresh source checkout, drains all captured active legacy CD runs, and checks latest-dev CI again. It does not cancel an unknown or production run.
5. The privileged transport seeds official A before mounting a fresh store, recreates only `dev_website` with its existing immutable image, and performs public A/B failure, retry, stale and paired-rollback checks. The successful final site is official A. Read the actual installed run proof before claiming delivery.

Only existing `LINODE_INSTANCE_IP` and `LINODE_SSH_PRIVATE_KEY` references are used. SSH verifies the checked-in public host pin. No cross-repository token, self-hosted runner, new domain, shared-proxy modification or production operation is required.

## Data and serving boundaries

Unchanged `scripts/blog-release.py` prepares and imports both real manifests. Official A uses the requested official content commit. Synthetic B exists only in a temporary local Git repository and adds a clearly labelled bilingual test pair and image; original official bytes are verified unchanged. A private receipt records the actual manual actor and DEV engineering purpose. Receipts, source repositories, build logs and private inputs are excluded from the transferred artifact.

The persistent store is `/srv/daodao-blog-dev-releases`, outside the legacy checkout. Only its parent and the DEV-only Nginx configuration are mounted read-only into the development website container. The controller client has UID611536, no supplementary groups or capabilities, and no-new-privileges inside an owned chroot. It intentionally uses host networking for the fixed DEV HTTPS origin with system CA verification and rejects redirects. This publication client does not claim network isolation.

The DEV overlay sends `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store` on fresh responses, including errors and images. Prepared HTML retains the existing non-production metadata contract, including production canonical URLs; prepared bytes are never rewritten. Previously cached content-addressed assets can retain historical edge headers despite identical verified bytes. Proof separates those observations from fresh HTML and the new synthetic image; it does not claim a Cloudflare cache purge.

## Failure and recovery

Before an already-managed operation, the capless client binds the trusted active state and current pointer to the stored manifest and a public marker, then verifies every public file. The root-owned journal retains that exact preimage and source identity. If a client is killed, times out or encounters a failed public check, the root supervisor starts a new bounded capless recovery phase after terminating the failed phase. Unchanged controller rollback uses owned loopback TLS to the verified preimage so a public network outage cannot undo the local recovery. Public recovery readback is a separate result; the original run still fails.

If the first legacy-to-managed cutover fails, the adapter restores only the captured development website image and mount selection using an owned immutable copy of the reviewed base compose file. For an already-managed configuration update, the adapter validates the candidate with the existing immutable Nginx image before changing the service, retains the owned configuration preimage, and recreates only `dev_website` so its read-only single-file mount sees the new inode. A failed update or public verification restores the prior configuration and release together; a foreign service or configuration change fails closed and is reported as incomplete recovery. No stack-wide stop or production mutation is used.

Temporary namespaces are removed only after exact directory-identity and process-exit checks. The owned persistent store and journal remain for subsequent releases and recovery. Do not disable the DEV ownership guard until the container has been deliberately restored to legacy ownership; changing the flag alone is not a serving rollback.

## Delivery evidence

Premerge checks establish the installer source, native validator/import, routing, ownership and failure boundaries. Actual installed workflow execution, fresh builds, public cutover, all-file readback and rollback are postmerge delivery acceptance. Keep issue536/531 open until that proof exists. This manual DEV path does not automatically establish formal editorial publication or cross-repository automation.

## Updating the DEV frontend while preserving articles

The ownership guard deliberately skips legacy Website CD even when a frontend PR has merged. Product CD success does not prove that `dev.daodao.so` has received that frontend commit. Read the public `/blog-release.json` marker and the installed publication run together.

This is automatic (daodaoedu/daodao#563). After each Linode CD run finishes, and every 30 minutes, the `Website managed sync` workflow (`.github/workflows/website-managed-sync.yml`) compares the public marker's `frontend_sha` with the `dev` head. When the head carries website changes (`apps/website/`, `packages/`, root package/turbo files or `docker/`), its Linode CI succeeded and no legacy CD run is active, it dispatches this workflow with operation `frontend-refresh` and the marker's live `content_sha`.

`frontend-refresh` builds only official A from that content on the new frontend. It uses the same source, CI, drain, configuration and readback guards as `publication-test`, but no synthetic B and no rollback matrix. Before activation the trusted active release's `content_sha` must still equal the requested content; otherwise the refresh is refused without change. It never performs the first legacy cutover. On failure the supervisor restores the verified preimage, and the run fails. The input has no fixture default: an empty `content_sha` fails.

The sync retries a failed refresh for the same head once; that retry run of the sync still fails and posts to Discord, because the site kept its previous release. It also fails and alerts when the same head failed twice (no further dispatch), when a successful run left the marker unchanged, when the marker is unreadable, or when a publication or legacy CD is still pending more than 60 minutes after CI. Cancelled runs (displaced in the shared queue) do not count as failures. Any value of `BLOG_DEV_RELEASE_MANAGED` other than empty or `false` counts as managed, matching Linode CD. A newer head supersedes a waiting refresh through the workflow's concurrency group, and an older run still in progress fails its source recheck. Linode CD's step summary and Discord message name the handoff instead of reporting nothing.

To publish different articles on dev, run `publication-test` manually with that content's full SHA (it also runs the synthetic B rollback checks). Later refreshes preserve whatever content the marker then shows.

The managed DEV Nginx overlay includes the extensionless lighthouse preview Route Handler at `/dev/mock-preview/lighthouse`, `/zh-TW/dev/mock-preview/lighthouse`, and `/en/dev/mock-preview/lighthouse`, with explicit HTML UTF-8 MIME and a real 404 for missing exports. After publication, verify the frontend/content pair in the marker, the lighthouse page and `#tutorial` interaction, both language Blog routes and missing-article 404 behavior. Keep `BLOG_DEV_RELEASE_MANAGED=true`; changing that flag alone does not restore legacy serving ownership.

For an isolated local upgrade/rollback check, run `python3 .github/scripts/__tests__/integration_managed_nginx_transition.py --image <local-immutable-website-image-id>` against an image containing Alpine APK Nginx and its `/etc/nginx/http.d` include. The test uses a unique Compose project; it models host ownership for a non-root macOS test user and exercises real syntax validation, file replacement, recreation and HTTP recovery. It does not replace deployment-host ownership or public release verification.
