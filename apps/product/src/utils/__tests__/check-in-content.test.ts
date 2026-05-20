import { describe, expect, it } from "vitest";
import { isBlankContent } from "../check-in-content";

describe("isBlankContent", () => {
  it("returns true for empty string", () => {
    expect(isBlankContent("")).toBe(true);
  });

  it("returns true for whitespace-only string", () => {
    expect(isBlankContent("   ")).toBe(true);
  });

  it("returns true for null", () => {
    expect(isBlankContent(null)).toBe(true);
  });

  it("returns true for undefined", () => {
    expect(isBlankContent(undefined)).toBe(true);
  });

  it("returns false for non-empty string", () => {
    expect(isBlankContent("今天完成了學習")).toBe(false);
  });

  it("returns false for string with leading/trailing spaces but real content", () => {
    expect(isBlankContent("  學習中  ")).toBe(false);
  });
});
