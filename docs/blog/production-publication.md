# Publish approved Blog content to production

This entry updates Website only, after checking successful CI for the exact current `prod` frontend. Frontend-only releases are dispatched automatically (see "Automatic frontend releases"); content releases can be explicitly scheduled with the daily GitHub-hosted check below. It does not merge the held content migration PR9, and does not enable cross-repository automatic publishing.

## Install before first use

1. Review and merge the implementation into `dev`, then prepare a narrow release into `prod` containing the publisher, shared ownership guard and coordination lock, matching tests and the existing content contract. Do not deploy unrelated dev product changes. A dev merge alone does not install the production entry.
2. Verify both the repository's trusted default workflow source and `prod` contain the production ownership guard. Verify `production` environment permissions/reviewers and existing SSH/registry credentials with the operator. The checked-in SSH host key must match the production host; do not use `ssh-keyscan` or disable verification as a workaround.
3. Set `BLOG_PROD_RELEASE_MANAGED=true` only as an explicitly authorized cutover. Legacy CD will stop updating prod Website while retaining Product deployment. Keep the entry disabled until this installation and cutover are reviewed; do not change the flag during an active publication.
4. Drain all existing legacy production CD runs, including queued and waiting runs, without cancelling another session's work. The new entry also rejects any unfinished legacy production CD found through complete paginated inventory. Recheck after CI completes because it can trigger legacy CD.
5. Run ordinary Linode CI on the installed exact current `prod` commit. Wait for success, then wait for any resulting legacy CD to finish. PR CI, a different branch/SHA, a failed or rerunning attempt, or an unrelated workflow does not authorize publication.

## Prepare an article release

Prepare an isolated content branch from the official content revision currently published. Keep every existing bilingual article and identity, then add/edit complete `zh-tw` and `en` pairs and supported images. Use the shared content schema and validator supplied by the target frontend. Obtain real human editorial approval for each new/changed bilingual digest; an unchanged exact digest may retain its valid approval. Infrastructure approval does not grant editorial approval.

As a separately authorized operator step, set `BLOG_PROD_PUBLISHED_CONTENT_SHA` to the full content SHA currently live in `/blog-release.json`, update `BLOG_PROD_CONTENT_SHA` to the intended new official content commit, and set `BLOG_PROD_APPROVALS` to the complete approved set (`id`, `digest`, `reviewer`, `evidence`). The workflow separately checks out the published revision and uses the shared validator to bind its original IDs, publication dates and slugs; new approval does not permit changing those identities or removing an existing ID. The host verifies the previous live marker against this frozen baseline. Preserve the previous values privately for recovery. Repository variables are not secrets: use public approval references, never credentials or private source data; GitHub may display variable values in Actions step metadata. Actual snapshot files and validator evidence stay outside public output and Docker context. Keep settings unchanged until the run finishes.

After a successful release, the next run must use that newly published content SHA as `BLOG_PROD_PUBLISHED_CONTENT_SHA`; stale baselines are rejected by the host. Updating this setting is an explicit operator action, not a token-backed automatic write. The first migration from the legacy site has no valid marker: only the explicit `legacy_bootstrap=true` workflow input and the previously verified original content SHA `0daa4231bb2072657c807813e960919b982f9d8e` are accepted. Keep this input false for ordinary releases. It cannot bypass CI, approval or a present marker's baseline match.

The workflow freezes the inputs once, checks a matching successful CI attempt, stages content with the existing shared publish validator, and builds `@daodao/website`. It records frontend/content identities and pretty-route byte hashes, then builds only the Docker `website` target with a release-specific tag and deploys the registry digest. Product is not built or recreated.

## Automatic frontend releases

Frontend changes merged to `prod` no longer wait for a manual run (daodaoedu/daodao#563). After each Linode CD run finishes, and every 30 minutes, `Website managed sync` compares the public marker's `frontend_sha` with the `prod` head. It dispatches this workflow with that head's successful push Linode CI run only when all of the following hold:

- The head carries website changes.
- No legacy prod CD run is unfinished.
- The live marker `content_sha`, `BLOG_PROD_PUBLISHED_CONTENT_SHA` and `BLOG_PROD_CONTENT_SHA` are identical.

The last condition means ordinary frontend sync only moves the frontend under the articles already live. A staged content release is published only by an explicit manual invocation or a configured approved publication schedule. Ordinary sync holds pending schedules for the daily publication check; without a schedule, it retains the existing 60-minute lag alert. A failed run for the same head is retried once, and both that sync run and a second failure fail the check with a Discord alert. All gates in this workflow still apply to the dispatched run.

## Scheduled content publication

For the GitHub-hosted daily check (09:00 Taipei), setup, cancellation and verification, see [scheduled publication](scheduled-publication.md). No post is scheduled until its exact approved revision and offset-aware time are stored in the schedule variable.

## Invoke and verify

After the above prerequisites and release authorization, invoke:

```sh
gh workflow run blog-prod-publish.yml --repo daodaoedu/daodao-f2e --ref prod -f ci_run_id=<successful-prod-Linode-CI-run-ID>
```

There is no force input. The supplied CI run is checked against the canonical workflow ID/path, official repository, exact current `prod` SHA, branch, event and latest completed successful attempt. A missing/mismatching source, approval digest or unfinished legacy CD fails before host access.

The host holds the shared production deployment lock, checks current official prod HEAD again, preserves the previous Website image, and activates only `prod_website` using frozen Compose configuration. Public HTTPS verification checks the version marker, bilingual article/index routes and images against exact hashes and MIME. It rejects removal of existing published Blog HTML routes. Image URLs contain a content digest and may change during a valid article revision; the old images are captured for rollback verification rather than required in the new candidate. Nginx uses `no-transform` to prevent edge email obfuscation from changing verified HTML.

Legacy Product-only production deployments still select the `production` GitHub environment. Their successful verified revision is recorded independently at `refs/deploy/prod-product`, so a skipped managed Website does not force repeated Product rebuilds. The existing shared ref is not advanced to certify a skipped Website.

Verify the Actions run and host recovery report separately. Success requires exact public content and an unchanged Product container identity. Do not call a registry push or container start a successful publication. A new public marker at `/blog-release.json` identifies both source revisions; confirm the intended article and images as well.

## Failure and recovery

Known deployment, public verification, incomplete HTTP reads and handled termination failures attempt to restore the captured previous image and compare all previously captured public Blog HTML and image hashes and MIME. Matching only indexes or the marker is insufficient. Recovery success does not change the failed operation into a successful publication. If recovery is not verified, preserve the rollback image holder and private host report/configuration; inspect the recorded previous image and frozen Compose before any authorized recovery attempt. Never run global Docker pruning, reset the shared Git checkout, remove Product, switch a migration PR or set `force_deploy=true` to get past a failure.

The local tests and Docker checks accompanying this implementation do not prove installation or a production publication. Record first installed run, actual frontend/content identities, public readback, failure/recovery and cleanup evidence before declaring the entry operational.

