import { describe, expect, it } from "vitest";
import { blogPath } from "../copy";
import { articleOutline, readingMinutes } from "../helpers";

describe("article reading helpers", () => {
  it("pairs real locale routes without duplicating default locale", () => {
    expect(blogPath("zh-TW", "guide")).toBe("/blog/guide");
    expect(blogPath("en", "guide")).toBe("/en/blog/guide");
  });
  it("counts visible bilingual text instead of markup syntax or URL length", () => {
    expect(readingMinutes("word ".repeat(401))).toBe(3);
    expect(readingMinutes("字".repeat(701))).toBe(3);
    expect(readingMinutes("[word](https://example.com/" + "x".repeat(1000) + ")")).toBe(1);
  });
  it("uses stable unique heading anchors for duplicate formatted headings and excludes code", () => {
    expect(articleOutline("## **Hello**\n### Hello\n```\n## Not a heading\n```\n## Hello")).toEqual(
      [
        { id: "hello", text: "Hello", depth: 2 },
        { id: "hello-1", text: "Hello", depth: 3 },
        { id: "hello-2", text: "Hello", depth: 2 },
      ]
    );
  });
});
