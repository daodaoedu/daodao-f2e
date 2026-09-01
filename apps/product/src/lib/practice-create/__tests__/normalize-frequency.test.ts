import { describe, expect, it } from "vitest";
import { frequencyToRange, normalizeFrequency } from "../normalize-frequency";

describe("normalizeFrequency", () => {
  it("normalizes tilde, 至, and dashes to a hyphen", () => {
    expect(normalizeFrequency("2~5")).toBe("2-5");
    expect(normalizeFrequency("2～5")).toBe("2-5");
    expect(normalizeFrequency("2至5")).toBe("2-5");
    expect(normalizeFrequency("2到5")).toBe("2-5");
    expect(normalizeFrequency("2–5")).toBe("2-5");
    expect(normalizeFrequency("2—5")).toBe("2-5");
    expect(normalizeFrequency("2−5")).toBe("2-5");
  });

  it("clamps each segment to 7 and collapses equal bounds", () => {
    expect(normalizeFrequency("8-9")).toBe("7");
    expect(normalizeFrequency("7-7")).toBe("7");
    expect(normalizeFrequency("12")).toBe("7");
  });

  it("keeps at most two segments", () => {
    expect(normalizeFrequency("1-2-3")).toBe("1-2");
  });

  it("strips non-digit characters", () => {
    expect(normalizeFrequency("abc3中文")).toBe("3");
    expect(normalizeFrequency("每週 2 - 4 天")).toBe("2-4");
  });

  it("collapses repeated hyphens and trims leading/trailing hyphens", () => {
    expect(normalizeFrequency("--2---5--")).toBe("2-5");
    expect(normalizeFrequency("-3")).toBe("3");
  });

  it("raises 0 to 1 and swaps a descending range", () => {
    expect(normalizeFrequency("0")).toBe("1");
    expect(normalizeFrequency("0-3")).toBe("1-3");
    expect(normalizeFrequency("5-2")).toBe("2-5");
  });

  it("returns an empty string when there are no digits", () => {
    expect(normalizeFrequency("")).toBe("");
    expect(normalizeFrequency("abc")).toBe("");
    expect(normalizeFrequency("---")).toBe("");
  });

  it("produces output matching the backend format ^\\d(-\\d)?$", () => {
    for (const input of ["2~5", "8-9", "1-2-3", "abc3中文", "0-9", "77-1"]) {
      expect(normalizeFrequency(input)).toMatch(/^\d(-\d)?$/);
    }
  });
});

describe("frequencyToRange", () => {
  it("parses a range", () => {
    expect(frequencyToRange("2-5")).toEqual({ min: 2, max: 5 });
  });

  it("parses a single number as a degenerate range", () => {
    expect(frequencyToRange("7")).toEqual({ min: 7, max: 7 });
  });

  it("returns null for an empty string", () => {
    expect(frequencyToRange("")).toBeNull();
  });
});
