import { describe, expect, it } from "vitest";
import {
  addDays,
  deriveTemplateName,
  formatFrequency,
  inferResourceName,
  isCohortStarted,
  normalizeResourceUrl,
  parseFrequency,
  templateMatches,
  todayInTaipei,
  validateResourceUrl,
} from "../template-library";

describe("deriveTemplateName", () => {
  it("takes the first segment and truncates to 20 characters", () => {
    expect(deriveTemplateName("圖書館借閱《原子習慣》，每天閱讀 30 頁")).toBe(
      "圖書館借閱《原子習慣》"
    );
    expect(deriveTemplateName("一二三四五六七八九十一二三四五六七八九十廿一")).toHaveLength(20);
  });
  it("skips a leading time word and prefers the longest content segment", () => {
    expect(deriveTemplateName("每天，寫下三件感謝的事，並記錄心情")).toBe("寫下三件感謝的事");
  });
  it("returns empty for blank input", () => {
    expect(deriveTemplateName("  ")).toBe("");
  });
});

describe("resources", () => {
  it("infers names for known hosts and falls back to path｜host", () => {
    expect(inferResourceName("https://www.books.com.tw/products/0010822522")).toBe("博客來");
    expect(inferResourceName("https://youtu.be/abc")).toBe("YouTube");
    expect(inferResourceName("https://daodao.so/practices/1")).toBe("島島阿學");
    expect(inferResourceName("https://example.com/guides/atomic-habits")).toBe(
      "atomic-habits｜example.com"
    );
    expect(inferResourceName("not a url")).toBeNull();
  });
  it("only accepts https URLs", () => {
    expect(validateResourceUrl("")).toBe("empty");
    expect(validateResourceUrl("hello")).toBe("invalid");
    expect(validateResourceUrl("http://example.com")).toBe("https");
    expect(validateResourceUrl("https://example.com/x")).toBeNull();
  });
  it("normalises host case, hash and trailing slashes for dedupe", () => {
    expect(normalizeResourceUrl("https://Example.com/card/#top")).toBe(
      normalizeResourceUrl("https://example.com/card")
    );
  });
});

describe("frequency", () => {
  it("parses ranges and single values within 1-7", () => {
    expect(parseFrequency("1-3")).toEqual({ min: 1, max: 3 });
    expect(parseFrequency(" 3 ~ 5 ")).toEqual({ min: 3, max: 5 });
    expect(parseFrequency("5")).toEqual({ min: 5, max: 5 });
    expect(parseFrequency("5-3")).toBeNull();
    expect(parseFrequency("0-8")).toBeNull();
    expect(parseFrequency("abc")).toBeNull();
  });
  it("formats min/max back to the input shape", () => {
    expect(formatFrequency(1, 3)).toBe("1-3");
    expect(formatFrequency(5, 5)).toBe("5");
    expect(formatFrequency(null, null)).toBe("");
  });
});

describe("search and dates", () => {
  const template = {
    title: "晨間書寫",
    practiceAction: "每天寫三行",
    tags: ["反思"],
    resources: [{ name: "書單", url: "https://example.com/books" }],
    status: "draft",
  };
  it("matches title, action, tags, resource name/url and status label case-insensitively", () => {
    expect(templateMatches(template, "書寫", "草稿")).toBe(true);
    expect(templateMatches(template, "三行", "草稿")).toBe(true);
    expect(templateMatches(template, "反思", "草稿")).toBe(true);
    expect(templateMatches(template, "BOOKS", "草稿")).toBe(true);
    expect(templateMatches(template, "草稿", "草稿")).toBe(true);
    expect(templateMatches(template, "不存在", "草稿")).toBe(false);
    expect(templateMatches(template, "   ", "草稿")).toBe(true);
  });
  it("uses the Taipei calendar day to decide whether a cohort has started", () => {
    const now = new Date("2026-09-11T17:00:00.000Z"); // 台北 9/12 01:00
    expect(todayInTaipei(now)).toBe("2026-09-12");
    expect(isCohortStarted("2026-09-12T00:00:00.000Z", now)).toBe(true);
    expect(isCohortStarted("2026-09-13T00:00:00.000Z", now)).toBe(false);
    expect(addDays("2026-09-01", 13)).toBe("2026-09-14");
  });
});
