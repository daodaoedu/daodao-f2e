# @daodao/blog-content

Single read-only contract for the website loader, CI and blog-publisher. This package does not publish content, render Markdown, or establish who is authorized to approve an article.

## Public content tree

```
authors.json
topics.json
articles/zh-tw/<stable-id>.md
articles/en/<stable-id>.md
images/<optional-raster-image>.png
```

Both languages are required. Each Markdown file has YAML frontmatter validated by the exported `articleSchema`; author/topic registries use exported `authorsSchema`/`topicsSchema`. Paths must match the stable id and language: metadata `lang: zh-TW` maps to the `zh-tw` folder, and `lang: en` maps to `en`. Slugs are unique per language. The two translations share the original publication date. Dates are valid calendar dates; `updated_at` cannot precede `published_at`. Cover images are optional. A cover requires meaningful `alt`, or an explicit `decorative: true` with `alt: ""`; empty alt without that marker is rejected.

Frontmatter example:

```yaml
---
id: learning-check-in
lang: en
slug: learning-check-in
title: A learning check-in
description: A draft example for editors.
author_id: daodao-team
published_at: 2026-11-12
topic: learning-design
tags: []
cta:
  kind: beta_application
  target_id: beta-interest
sources: []
---
Draft body.
```

`authors.json` is an array of `{id,name:{"zh-TW":"…",en:"…"},bio:{"zh-TW":"…",en:"…"}}`. `topics.json` is an array of `{id,name:{"zh-TW":"…",en:"…"}}`. The only currently confirmed CTA is `beta_application` / `beta-interest`, mapping to `https://tally.so/r/44WXdk`. Additional real direct-action destinations need a registry/schema change after their availability is confirmed.

Markdown links support HTTP(S), fragment anchors and rooted `/blog` or `/en/blog` routes. External body links must match `sources`, excluding the primary CTA URL. This validates source consistency, not factual accuracy or URL availability. Inline and reference-style images require alt text and local `images/` paths. Supported raster formats are PNG, JPEG, WebP, AVIF and GIF. File signatures, format/extension agreement and positive dimensions are checked; this is header/dimension validation, not full decoding or malware scanning. Raw HTML is rejected; callers must render Markdown as Markdown, never execute MDX.

## CLI

Run from daodao-f2e:

```sh
pnpm --filter @daodao/blog-content validate --root /absolute/daodao-blog --mode draft
pnpm --filter @daodao/blog-content validate --root /absolute/daodao-blog --approvals /private/approvals.json --baseline /private/published-baseline.json
```

The default mode is `publish`. Publish requires an explicit approval file outside the public content root. Draft mode does not imply approval. The CLI prints a JSON result and exits 1 on failure. Validation never writes files. No article list or digest is exposed on a failed validation.

Approval evidence is private input, not a public blog asset. Its JSON shape is:

```json
[{"id":"learning-check-in","digest":"<64 lowercase SHA-256 characters>","reviewer":"actual reviewer identity","evidence":"review record reference"}]
```

This is a shape illustration, not a valid approval. After an actual human review, the authorized publisher binds that review to the digest returned by draft validation. Each digest includes both Markdown files, all referenced image bytes, and the author/topic registries, with stable sorted paths. Any of those inputs changing invalidates the receipt. The evidence's authenticity and human authorization are the publisher's responsibility; writing a matching hash is not evidence of a review.

A prior published baseline has shape:

```json
{"learning-check-in":{"published_at":"2026-11-12","slugs":{"zh-TW":"learning-check-in","en":"learning-check-in"}}}
```

The publisher/CI must supply the trusted baseline from the pinned previous published manifest when updating existing articles. The validator then rejects changed original publication dates or slugs. Without that baseline, the validator cannot distinguish a new draft from a modified published article. Baseline retrieval and artifact pinning are publishing integration work (#536), not a claim made by this package.

## API

```ts
import { validateRepository } from "@daodao/blog-content";
const result = await validateRepository(contentRoot, {
  mode: "publish",
  approvals: privateApprovalEvidence,
  publishedBaseline: trustedPreviousManifest,
});
if (!result.ok) throw new Error(JSON.stringify(result.errors));
// Consume result.articles only after success. Each entry has metadata, body and image dimensions.
```

Use this exact validator for every consumer; do not copy its schema into a skill or website. This card exports the integration API; website rendering, CI publication and the publisher skill are separate child issues. Local tests are not deployment evidence.
