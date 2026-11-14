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

If the first legacy-to-managed cutover fails, the adapter restores only the captured development website image and mount selection using an owned immutable copy of the reviewed base compose file. An already-managed configuration change is refused rather than overwriting the recovery preimage. No stack-wide stop or production mutation is used.

Temporary namespaces are removed only after exact directory-identity and process-exit checks. The owned persistent store and journal remain for subsequent releases and recovery. Do not disable the DEV ownership guard until the container has been deliberately restored to legacy ownership; changing the flag alone is not a serving rollback.

## Delivery evidence

Premerge checks establish the installer source, native validator/import, routing, ownership and failure boundaries. Actual installed workflow execution, fresh builds, public cutover, all-file readback and rollback are postmerge delivery acceptance. Keep issue536/531 open until that proof exists. This manual DEV path does not automatically establish formal editorial publication or cross-repository automation.
