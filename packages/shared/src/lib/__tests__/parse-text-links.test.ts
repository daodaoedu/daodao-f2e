import { describe, expect, it } from "vitest";
import type { TextSegment } from "../parse-text-links";
import { parseTextLinks } from "../parse-text-links";

describe("parseTextLinks", () => {
  const cases: [string, string, TextSegment[]][] = [
    ["no URLs", "hello world", [{ type: "text", value: "hello world" }]],
    [
      "http URL at end",
      "visit http://example.com",
      [
        { type: "text", value: "visit " },
        { type: "url", value: "http://example.com" },
      ],
    ],
    [
      "https URL in middle",
      "check https://daodao.co please",
      [
        { type: "text", value: "check " },
        { type: "url", value: "https://daodao.co" },
        { type: "text", value: " please" },
      ],
    ],
    [
      "multiple URLs",
      "http://a.com and https://b.com",
      [
        { type: "url", value: "http://a.com" },
        { type: "text", value: " and " },
        { type: "url", value: "https://b.com" },
      ],
    ],
    [
      "URL with path and query params",
      "see https://daodao.co/practices?id=123",
      [
        { type: "text", value: "see " },
        { type: "url", value: "https://daodao.co/practices?id=123" },
      ],
    ],
    ["empty string", "", [{ type: "text", value: "" }]],
    [
      "bare domain treated as plain text",
      "visit example.com today",
      [{ type: "text", value: "visit example.com today" }],
    ],
    [
      "trailing punctuation stripped",
      "visit https://daodao.co.",
      [
        { type: "text", value: "visit " },
        { type: "url", value: "https://daodao.co" },
        { type: "text", value: "." },
      ],
    ],
  ];

  it.each(cases)("%s", (_, input, expected) => {
    expect(parseTextLinks(input)).toEqual(expected);
  });

  it("網址後面直接接全形標點時，標點不算進連結（zh-TW）", () => {
    const urls = parseTextLinks(
      "我的日記 https://app-dev.daodao.so/practices/1。下次見，https://daodao.so！"
    )
      .filter((segment) => segment.type === "url")
      .map((segment) => segment.value);
    expect(urls).toEqual(["https://app-dev.daodao.so/practices/1", "https://daodao.so"]);
  });

  it("非 http(s) 的 scheme 不產生連結", () => {
    expect(
      parseTextLinks("看 javascript:alert(1) 這個").every((segment) => segment.type === "text")
    ).toBe(true);
  });
});
