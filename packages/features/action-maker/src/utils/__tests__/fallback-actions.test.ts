import { describe, expect, it } from "vitest";
import type { CategoryType } from "../../types";
import { fallbackActionsMap, getFallbackActions } from "../fallback-actions";

const ALL_CATEGORIES: CategoryType[] = [
  "interest",
  "social",
  "health",
  "academic",
  "work",
  "finance",
];

describe("getFallbackActions", () => {
  it.each(ALL_CATEGORIES)("returns actions array for category '%s'", (category) => {
    const actions = getFallbackActions(category);
    expect(Array.isArray(actions)).toBe(true);
    expect(actions.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown category", () => {
    const actions = getFallbackActions("nonexistent" as CategoryType);
    expect(actions).toEqual([]);
  });

  it("each action has required fields", () => {
    for (const category of ALL_CATEGORIES) {
      const actions = getFallbackActions(category);
      for (const action of actions) {
        expect(action.id).toBeDefined();
        expect(action.categoryId).toBe(category);
        expect(["beginner", "intermediate", "advanced"]).toContain(action.level);
        expect(typeof action.title).toBe("string");
        expect(typeof action.description).toBe("string");
      }
    }
  });

  it("each category has exactly 3 levels of actions", () => {
    for (const category of ALL_CATEGORIES) {
      const actions = getFallbackActions(category);
      expect(actions).toHaveLength(3);
      const levels = actions.map((a) => a.level);
      expect(levels).toContain("beginner");
      expect(levels).toContain("intermediate");
      expect(levels).toContain("advanced");
    }
  });
});

describe("fallbackActionsMap", () => {
  it("contains all 6 categories", () => {
    expect(fallbackActionsMap.size).toBe(6);
    for (const category of ALL_CATEGORIES) {
      expect(fallbackActionsMap.has(category)).toBe(true);
    }
  });
});
