import { describe, expect, it } from "vitest";
import { deriveResourceName } from "../derive-resource-name";

describe("deriveResourceName", () => {
  it("maps known domains, with or without www.", () => {
    expect(deriveResourceName("https://www.books.com.tw/")).toBe("博客來");
    expect(deriveResourceName("https://books.com.tw/products/0010822522")).toBe("博客來");
    expect(deriveResourceName("https://www.youtube.com/watch?v=abc")).toBe("YouTube");
    expect(deriveResourceName("https://youtu.be/abc")).toBe("YouTube");
    expect(deriveResourceName("https://hahow.in/courses/1")).toBe("Hahow");
    expect(deriveResourceName("https://www.coursera.org/learn/x")).toBe("Coursera");
    expect(deriveResourceName("https://medium.com/@someone/post")).toBe("Medium");
    expect(deriveResourceName("https://www.notion.so/page")).toBe("Notion");
    expect(deriveResourceName("https://daodao.so/")).toBe("島島阿學");
  });

  it("derives from the last path segment with hyphens/underscores as spaces", () => {
    expect(deriveResourceName("https://example.com/learn/atomic-habits")).toBe(
      "atomic habits｜example.com"
    );
    expect(deriveResourceName("https://www.example.com/a/b/deep_work/")).toBe(
      "deep work｜example.com"
    );
  });

  it("decodes URI-encoded segments", () => {
    expect(deriveResourceName("https://example.com/%E5%8E%9F%E5%AD%90%E7%BF%92%E6%85%A3")).toBe(
      "原子習慣｜example.com"
    );
  });

  it("falls back to the host when the segment is hex-like", () => {
    expect(deriveResourceName("https://example.com/x/3f2a9c1b7e5d4a6f8b1c2d3e4f5a6b7c")).toBe(
      "example.com"
    );
  });

  it("falls back to the host when the segment is longer than 40 chars", () => {
    const long = "a".repeat(41);
    expect(deriveResourceName(`https://example.com/${long}`)).toBe("example.com");
  });

  it("falls back to the host when there is no path", () => {
    expect(deriveResourceName("https://example.com")).toBe("example.com");
    expect(deriveResourceName("https://www.example.com/")).toBe("example.com");
  });

  it("returns null for unparseable input", () => {
    expect(deriveResourceName("not a url")).toBeNull();
    expect(deriveResourceName("")).toBeNull();
  });

  it("returns null for non-http(s) protocols", () => {
    expect(deriveResourceName("ftp://example.com/file")).toBeNull();
    expect(deriveResourceName("mailto:someone@example.com")).toBeNull();
  });

  it("still parses http (https enforcement is the caller's job)", () => {
    expect(deriveResourceName("http://example.com")).toBe("example.com");
  });
});
