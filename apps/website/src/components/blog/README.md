# Blog reader

The website uses the shared `@daodao/blog-content` validator. Content lives in a separate, pinned content checkout; there is no embedded published article or duplicate schema in this app.

Server-only configuration uses `@daodao/config`:

| Variable | Behavior |
| --- | --- |
| `BLOG_CONTENT_DIR` | Absolute path to the checked-out content snapshot. Unset intentionally renders an empty Blog. A configured invalid snapshot fails rather than silently rendering an empty site. |
| `BLOG_CONTENT_MODE` | Defaults to `publish`. Explicit `draft` permits editorial previews only with a configured nonproduction website origin. |
| `BLOG_APPROVALS_FILE` | Required for publish mode. Private approval evidence must resolve outside the content root, including symlinks. |
| `BLOG_PUBLISHED_BASELINE_FILE` | Trusted previous published manifest, supplied when updating an existing publication. Retrieval and pinning belong to the publication pipeline. |
| `NEXT_PUBLIC_WEBSITE_URL` | Explicit website origin. Draft mode rejects an unspecified origin and the production daodao.so hostname. |

Draft previews always show an editorial notice and emit noindex/nofollow. A passing preview is not human editorial approval or permission to publish. The prebuild command validates the configured source and stages only referenced raster images under `public/blog-images/<bilingual-content-digest>/images/...`. Published pages use these immutable static URLs; editorial previews embed validated raster bytes. Private approval records are never staged. Actual deployment, content SHA/frontend SHA pinning and rollback integration are #536. No OG/publication claim follows merely from asset staging.

The Markdown renderer skips raw HTML, sanitizes generated HAST and keeps react-markdown's safe URL transformation. The shared heading utility supplies both TOC and rendered heading IDs, including duplicate headings. Wide tables and code retain local keyboard-scrollable regions. Reading duration is derived from visible Markdown text using 350 Han characters/minute and 200 other words/minute; this is an estimate, not observed reader behavior.

`Footer` adds optional Blog props only. The homepage retains its original logo and language-switcher defaults. The Blog supplies its actual locale logo and suppresses the duplicate footer locale control. Header logos are byte-for-byte copies of the four approved project SVG assets.

Run `pnpm --filter @daodao/website test:blog` from the frontend repo. The suite covers route helpers, reading estimates, shared anchors, draft-origin boundaries, and rendered Markdown safety. Browser evidence is retained under the isolated task directory, not this content or application source.
