import { describe, expect, it } from "vitest";
import { parseTextLinks } from "../parse-text-links";

describe("parseTextLinks", () => {
  it("returns single text segment when no URLs present", () => {
    expect(parseTextLinks("hello world")).toEqual([{ type: "text", value: "hello world" }]);
  });

  it("detects http:// URL at end of string", () => {
    expect(parseTextLinks("visit http://example.com")).toEqual([
      { type: "text", value: "visit " },
      { type: "url", value: "http://example.com" },
    ]);
  });

  it("detects https:// URL in middle of string", () => {
    expect(parseTextLinks("check https://daodao.co please")).toEqual([
      { type: "text", value: "check " },
      { type: "url", value: "https://daodao.co" },
      { type: "text", value: " please" },
    ]);
  });

  it("detects multiple URLs", () => {
    expect(parseTextLinks("http://a.com and https://b.com")).toEqual([
      { type: "url", value: "http://a.com" },
      { type: "text", value: " and " },
      { type: "url", value: "https://b.com" },
    ]);
  });

  it("handles URL with path and query params", () => {
    expect(parseTextLinks("see https://daodao.co/practices?id=123")).toEqual([
      { type: "text", value: "see " },
      { type: "url", value: "https://daodao.co/practices?id=123" },
    ]);
  });

  it("returns empty text segment for empty string", () => {
    expect(parseTextLinks("")).toEqual([{ type: "text", value: "" }]);
  });

  it("does not detect bare domain without protocol", () => {
    expect(parseTextLinks("visit example.com today")).toEqual([
      { type: "text", value: "visit example.com today" },
    ]);
  });

  it("strips trailing punctuation from URL", () => {
    expect(parseTextLinks("visit https://daodao.co.")).toEqual([
      { type: "text", value: "visit " },
      { type: "url", value: "https://daodao.co" },
      { type: "text", value: "." },
    ]);
  });
});
