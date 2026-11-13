# Dev article preview

The normal website CD can render an unapproved draft snapshot on `https://dev.daodao.so`. This is publicly reachable staging, with an editorial preview banner and `noindex`; it is not access control or editorial approval.

Set the frontend repository variable `BLOG_DEV_PREVIEW_CONTENT_SHA` to the full lowercase 40-character commit SHA from the official `daodaoedu/daodao-blog` repository. Use a reviewed draft-content PR; do not put source text or approval receipts in this variable. Only the `dev` website build consumes it. Missing configuration keeps the supported empty Blog; invalid or mismatched pins fail the build. Other branches ignore this preview variable.

Website CD selects the pin before checkout, acquires only the official repository without persisted credentials, verifies HEAD, and stages `authors.json`, `topics.json`, `articles/` and optional `images/` under a unique `RUNNER_TEMP` directory. Top-level symlinks are rejected before copying. Nested symlinks remain links for the authoritative shared content validator to reject. The original checkout stays available for action cleanup and is explicitly excluded from the Docker context and frontend Git status. Content scripts are never executed.

Before environment generation and the website build, the trusted staging helper sets `BLOG_CONTENT_DIR`, `BLOG_CONTENT_MODE=draft` and the explicit dev website origin. It clears private publication approval/baseline settings for this draft build. The existing renderer validates the snapshot, shows the preview banner, and omits canonical links, JSON-LD and article sitemap entries. A build or validation failure preserves the previously deployed image through the normal CD failure path.

The frontend checkout uses the same immutable `COMMIT_SHA` as the image tag. Record that SHA, the content pin and actual deployment revision when verifying the site. Verify both language article bodies, list/topic links, preview metadata and unknown-route 404 responses after deployment.

To stop consuming preview content, remove the variable and deploy a subsequent verified website commit through the normal pipeline. Changing the variable alone does not rebuild a static website. Formal publication uses the separate protected release workflow and genuine bilingual approval evidence; this preview does not provide a publication receipt or `/blog-release.json` marker.
