import { describe, expect, it } from "vitest";
import {
  addCustomTiming,
  createEmptySegments,
  isDayPreset,
  isFrequencyPreset,
  isMinutePreset,
  resizeSegments,
  sanitizeDaysInput,
  sanitizeDigits,
  sanitizeFrequencyInput,
  sanitizeMinutesInput,
} from "../rhythm-utils";
import { emptySegmentOverride } from "../schema";

describe("sanitizeDigits", () => {
  it("keeps digits only and strips leading zeros", () => {
    expect(sanitizeDigits("a1b2")).toBe("12");
    expect(sanitizeDigits("007")).toBe("7");
    expect(sanitizeDigits("0")).toBe("");
  });

  it("truncates to maxDigits", () => {
    expect(sanitizeDigits("12345", 3)).toBe("123");
  });
});

describe("sanitizeDaysInput", () => {
  it("clamps values above 90 to 90 silently", () => {
    expect(sanitizeDaysInput("150")).toEqual({ text: "90", value: 90 });
  });

  it("normalizes leading zeros", () => {
    expect(sanitizeDaysInput("007")).toEqual({ text: "7", value: 7 });
  });

  it("returns null for empty input", () => {
    expect(sanitizeDaysInput("")).toEqual({ text: "", value: null });
    expect(sanitizeDaysInput("abc")).toEqual({ text: "", value: null });
  });
});

describe("sanitizeMinutesInput", () => {
  it("limits to three digits", () => {
    expect(sanitizeMinutesInput("1234")).toEqual({ text: "123", value: 123 });
  });

  it("returns null when empty", () => {
    expect(sanitizeMinutesInput("0")).toEqual({ text: "", value: null });
  });
});

describe("sanitizeFrequencyInput", () => {
  it("keeps only digits and hyphens", () => {
    expect(sanitizeFrequencyInput("2~5天")).toBe("25");
    expect(sanitizeFrequencyInput("2-5")).toBe("2-5");
  });
});

describe("preset detection", () => {
  it("detects day presets", () => {
    expect(isDayPreset(7)).toBe(true);
    expect(isDayPreset(8)).toBe(false);
    expect(isDayPreset(null)).toBe(false);
  });

  it("detects minute presets", () => {
    expect(isMinutePreset(30)).toBe(true);
    expect(isMinutePreset(20)).toBe(false);
  });

  it("detects frequency presets", () => {
    expect(isFrequencyPreset("2-4")).toBe(true);
    expect(isFrequencyPreset("1-3")).toBe(false);
    expect(isFrequencyPreset("")).toBe(false);
  });
});

describe("resizeSegments", () => {
  it("keeps existing overrides and appends empty ones", () => {
    const first = { ...emptySegmentOverride(), name: "A", days: 10 };
    const result = resizeSegments([first], 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(first);
    expect(result[1]).toEqual(emptySegmentOverride());
  });

  it("drops trailing segments when shrinking", () => {
    const segments = [
      { ...emptySegmentOverride(), name: "A" },
      { ...emptySegmentOverride(), name: "B" },
      { ...emptySegmentOverride(), name: "C" },
    ];
    expect(resizeSegments(segments, 2).map((s) => s.name)).toEqual(["A", "B"]);
  });
});

describe("createEmptySegments", () => {
  it("creates distinct objects", () => {
    const [a, b] = createEmptySegments(2);
    expect(a).toEqual(emptySegmentOverride());
    expect(a).not.toBe(b);
  });
});

describe("addCustomTiming", () => {
  it("trims, ignores empty and dedupes", () => {
    expect(addCustomTiming([], "  洗澡後 ")).toEqual(["洗澡後"]);
    expect(addCustomTiming(["洗澡後"], "洗澡後")).toEqual(["洗澡後"]);
    expect(addCustomTiming(["洗澡後"], "   ")).toEqual(["洗澡後"]);
  });
});
