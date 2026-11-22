# Narrow production publisher installation

This release ports the Website-only Blog publisher from dev PR1234 onto production base `34cc0bd981b75f5b7e8765c6031102f4266433d1`. It installs the entry and its safety prerequisites. It does not publish content, enable the managed flag, or merge held PR1199/content PR9.

## Included scope

- The reviewed publisher, exact-source/approval gate, public artifact manifest and rollback verifier.
- Existing public host-key pin, legacy Website ownership checks and shared-host deployment lock.
- A production contract suite and the same native suite as a prerequisite of canonical Linode CI. Failed typecheck, lint or test processes now produce failed CI instead of being hidden by a bare `wait`.
- Docker context exclusions for the two content checkout directories.

Production app sources, package manifests, lockfile, content schema, base Nginx configuration, Dockerfile and Compose file are unchanged. The existing Product change-detection policy is preserved; development deployment-ref infrastructure and preview/controller workflows are excluded.

## Installation and cutover are separate

1. Review this release against its exact production base, run its actual PR checks, and obtain the normal production approval. A green dev PR is supporting evidence, not production release approval.
2. After separately authorized merge, verify the installed prod revision and its canonical Linode CI result. Check any automatically triggered legacy CD and drain unfinished runs without cancelling other sessions' work.
3. Verify the ownership/lock policy exists in both trusted default-branch workflow source and installed prod source. Confirm the production environment, host key and existing credentials with the operator.
4. Only after explicit cutover authorization, preserve current variables and configure the managed flag, published content baseline, target content revision and genuine human editorial approvals. No variable changes are part of this release preparation.
5. Follow [production-publication.md](production-publication.md) for first publication. A legacy site without a valid marker requires the explicit first-cutover bootstrap and verified original baseline; ordinary releases must keep bootstrap disabled.
6. Verify the public marker, exact bilingual HTML/image bytes and unchanged Product identity. A merge, CI success or image push alone does not establish publication success.

## Recovery boundary

Before managed cutover the legacy Website policy remains active. After cutover, use the publisher's recorded previous image and complete public-byte verification for recovery. Do not re-enable competing deployment ownership during a running release, use `force_deploy=true`, or perform global Docker cleanup to bypass a failed gate.
