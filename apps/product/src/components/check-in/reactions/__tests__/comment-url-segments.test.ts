import { describe, expect, it } from "vitest";
import { extractCommentSegments } from "../comment-url-segments";

describe("extractCommentSegments", () => {
  it("returns plain text segment when no URL present", () => {
    expect(extractCommentSegments("hello world")).toEqual([
      { type: "text", value: "hello world" },
    ]);
  });

  it("splits text around a URL", () => {
    expect(extractCommentSegments("check https://daodao.co please")).toEqual([
      { type: "text", value: "check " },
      { type: "url", value: "https://daodao.co" },
      { type: "text", value: " please" },
    ]);
  });

  it("handles a bare URL", () => {
    expect(extractCommentSegments("https://example.com")).toEqual([
      { type: "url", value: "https://example.com" },
    ]);
  });

  it("handles a very long URL that would cause overflow", () => {
    const longUrl = "https://daodao.co/" + "a".repeat(100);
    const result = extractCommentSegments(longUrl);
    expect(result).toEqual([{ type: "url", value: longUrl }]);
  });
});
