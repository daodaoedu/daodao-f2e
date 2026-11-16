import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import type { BlogArticleType } from "../content";
import { BlogMarkdown } from "../markdown";

it("renders formatting without executing raw HTML or unsafe links", () => {
  const article: BlogArticleType = {
    file: "articles/en/test.md",
    metadata: {
      id: "test",
      lang: "en",
      slug: "test",
      title: "Test",
      description: "Test",
      author_id: "team",
      published_at: "2026-11-13",
      topic: "learning",
      tags: [],
      sources: [],
      cta: { kind: "beta_application", target_id: "beta-interest" },
    },
    body: '## Safe heading\n\n<script>alert(1)</script>\n\n[Unsafe](javascript:alert(1))\n\n| A | B |\n| --- | --- |\n| one | two |\n\n```js\nconst text = "<script>";\n```',
    images: [],
    assets: {},
  };
  const html = renderToStaticMarkup(createElement(BlogMarkdown, { article }));
  expect(html).toContain("Safe heading");
  expect(html).toContain("<table>");
  expect(html).toContain("<pre");
  expect(html).not.toContain("<script>");
  expect(html).not.toContain('href="javascript:');
  expect(html).toContain("&lt;script&gt;");
});

it("labels Chinese tables in the article language", () => {
  const article: BlogArticleType = {
    file: "articles/en/test.md",
    metadata: {
      id: "test",
      lang: "zh-TW",
      slug: "test",
      title: "Test",
      description: "Test",
      author_id: "team",
      published_at: "2026-11-13",
      topic: "learning",
      tags: [],
      sources: [],
      cta: { kind: "beta_application", target_id: "beta-interest" },
    },
    body: '## Safe heading\n\n<script>alert(1)</script>\n\n[Unsafe](javascript:alert(1))\n\n| A | B |\n| --- | --- |\n| one | two |\n\n```js\nconst text = "<script>";\n```',
    images: [],
    assets: {},
  };
  const html = renderToStaticMarkup(createElement(BlogMarkdown, { article }));
  expect(html).toContain('aria-label="表格"');
});
