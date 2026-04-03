import { describe, expect, it } from "vitest";
import {
  isValidCategory,
  isValidCustomDescription,
  isValidCustomTitle,
  isValidLevel,
  isValidNickname,
  isValidTopic,
  isValidTriggerTiming,
  limits,
} from "../validation";

describe("isValidCategory", () => {
  it.each([
    "interest",
    "social",
    "health",
    "academic",
    "work",
    "finance",
  ])("returns true for valid category '%s'", (category) => {
    expect(isValidCategory(category)).toBe(true);
  });

  it.each([
    "invalid",
    "",
    123,
    null,
    undefined,
    {},
  ])("returns false for invalid value %s", (value) => {
    expect(isValidCategory(value)).toBe(false);
  });
});

describe("isValidLevel", () => {
  it.each([
    "beginner",
    "intermediate",
    "advanced",
  ])("returns true for valid level '%s'", (level) => {
    expect(isValidLevel(level)).toBe(true);
  });

  it.each(["expert", "", 1, null, undefined])("returns false for invalid value %s", (value) => {
    expect(isValidLevel(value)).toBe(false);
  });
});

describe("isValidNickname", () => {
  it("returns true for a valid nickname", () => {
    expect(isValidNickname("Alice")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidNickname("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isValidNickname("   ")).toBe(false);
  });

  it("returns false when exceeding max length", () => {
    const long = "a".repeat(limits.NICKNAME_MAX_LENGTH + 1);
    expect(isValidNickname(long)).toBe(false);
  });

  it("returns true at exactly max length", () => {
    const exact = "a".repeat(limits.NICKNAME_MAX_LENGTH);
    expect(isValidNickname(exact)).toBe(true);
  });

  it("trims whitespace before checking length", () => {
    expect(isValidNickname("  hi  ")).toBe(true);
  });
});

describe("isValidTopic", () => {
  it("returns true for a valid topic", () => {
    expect(isValidTopic("Learn TypeScript")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidTopic("")).toBe(false);
  });

  it("returns false when exceeding max length", () => {
    const long = "x".repeat(limits.TOPIC_MAX_LENGTH + 1);
    expect(isValidTopic(long)).toBe(false);
  });
});

describe("isValidTriggerTiming", () => {
  it("returns true for a valid trigger timing", () => {
    expect(isValidTriggerTiming("After breakfast")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidTriggerTiming("")).toBe(false);
  });

  it("returns false when exceeding max length", () => {
    const long = "t".repeat(limits.TRIGGER_TIMING_MAX_LENGTH + 1);
    expect(isValidTriggerTiming(long)).toBe(false);
  });
});

describe("isValidCustomTitle", () => {
  it("returns true for a valid title", () => {
    expect(isValidCustomTitle("My Action")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidCustomTitle("")).toBe(false);
  });

  it("returns false when exceeding max length", () => {
    const long = "c".repeat(limits.CUSTOM_TITLE_MAX_LENGTH + 1);
    expect(isValidCustomTitle(long)).toBe(false);
  });
});

describe("isValidCustomDescription", () => {
  it("returns true for a valid description", () => {
    expect(isValidCustomDescription("Do something useful")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidCustomDescription("")).toBe(false);
  });

  it("returns false when exceeding max length", () => {
    const long = "d".repeat(limits.CUSTOM_DESCRIPTION_MAX_LENGTH + 1);
    expect(isValidCustomDescription(long)).toBe(false);
  });
});

describe("limits", () => {
  it("exposes expected limit constants", () => {
    expect(limits.NICKNAME_MAX_LENGTH).toBe(20);
    expect(limits.TOPIC_MAX_LENGTH).toBe(100);
    expect(limits.TRIGGER_TIMING_MAX_LENGTH).toBe(100);
    expect(limits.CUSTOM_TITLE_MAX_LENGTH).toBe(30);
    expect(limits.CUSTOM_DESCRIPTION_MAX_LENGTH).toBe(200);
  });
});
