import { describe, expect, it } from "vitest";
import { isPracticeDetailPath } from "../practice-detail-path";

describe("isPracticeDetailPath", () => {
  it("matches the practice detail page with or without a locale prefix", () => {
    expect(isPracticeDetailPath("/practices/abc123")).toBe(true);
    expect(isPracticeDetailPath("/practices/abc123/")).toBe(true);
    expect(isPracticeDetailPath("/en/practices/abc123")).toBe(true);
    expect(isPracticeDetailPath("/zh-TW/practices/abc123")).toBe(true);
  });

  it("keeps other routes, including static practice pages and sub-pages, out", () => {
    expect(isPracticeDetailPath("/")).toBe(false);
    expect(isPracticeDetailPath("/practices")).toBe(false);
    expect(isPracticeDetailPath("/practices/create")).toBe(false);
    expect(isPracticeDetailPath("/en/practices/copy-success")).toBe(false);
    expect(isPracticeDetailPath("/practices/abc123/edit")).toBe(false);
    expect(isPracticeDetailPath("/practices/abc123/check-ins/9")).toBe(false);
    expect(isPracticeDetailPath("/ja/practices/abc123")).toBe(false);
  });
});
