import type { PracticeTemplateType } from "@daodao/api";
import { describe, expect, it } from "vitest";
import { ExecutionTiming } from "@/constants/practice-form";
import {
  frequencyFromRange,
  resourcesFromTemplate,
  templateToWizardValues,
  timingsFromPeriods,
} from "../template-to-values";

const baseTemplate = {
  id: "tpl-1",
  title: "每天讀 30 頁",
  practiceAction: "圖書館借閱《原子習慣》，每天閱讀 30 頁",
  frequencyMinDays: 3,
  frequencyMaxDays: 5,
  durationDays: 23,
  sessionDurationMinutes: 25,
  practiceTimePeriods: ["morning", "night", "morning", "unknown"],
  suggestedTags: ["閱讀"],
  categories: [],
  resources: [
    { id: "r-1", name: "博客來", url: "https://www.books.com.tw/" },
    { id: "r-1", name: "重複", url: "https://dup.example" },
    { id: "r-2", name: "純名稱" },
  ],
  answerCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
} as unknown as PracticeTemplateType;

describe("frequencyFromRange", () => {
  it("formats ranges and collapses equal bounds", () => {
    expect(frequencyFromRange(3, 5)).toBe("3-5");
    expect(frequencyFromRange(7, 7)).toBe("7");
    expect(frequencyFromRange(null, null)).toBe("");
    expect(frequencyFromRange(2, null)).toBe("2");
  });
});

describe("timingsFromPeriods", () => {
  it("maps known periods and dedupes / drops unknown", () => {
    expect(timingsFromPeriods(["morning", "night", "morning", "unknown"])).toEqual([
      ExecutionTiming.morning,
      ExecutionTiming.beforeSleep,
    ]);
  });
});

describe("resourcesFromTemplate", () => {
  it("dedupes by id, stringifies id, defaults url to empty", () => {
    expect(resourcesFromTemplate(baseTemplate.resources)).toEqual([
      { id: "r-1", name: "博客來", url: "https://www.books.com.tw/", segmentIndexes: [] },
      { id: "r-2", name: "純名稱", url: "", segmentIndexes: [] },
    ]);
    expect(resourcesFromTemplate(undefined)).toEqual([]);
  });
});

describe("templateToWizardValues", () => {
  it("keeps the real durationDays without snapping and fills every field", () => {
    expect(templateToWizardValues(baseTemplate)).toEqual({
      action: "圖書館借閱《原子習慣》，每天閱讀 30 頁",
      name: "每天讀 30 頁",
      durationDays: 23,
      frequency: "3-5",
      sessionMinutes: 25,
      timings: [ExecutionTiming.morning, ExecutionTiming.beforeSleep],
      tags: ["閱讀"],
      resources: [
        { id: "r-1", name: "博客來", url: "https://www.books.com.tw/", segmentIndexes: [] },
        { id: "r-2", name: "純名稱", url: "", segmentIndexes: [] },
      ],
    });
  });

  it("falls back to the title as action and nulls for missing numbers", () => {
    const values = templateToWizardValues({
      ...baseTemplate,
      practiceAction: undefined,
      durationDays: null,
      sessionDurationMinutes: null,
      frequencyMinDays: null,
      frequencyMaxDays: null,
      suggestedTags: [],
      resources: undefined,
    } as unknown as PracticeTemplateType);
    expect(values.action).toBe("每天讀 30 頁");
    expect(values.durationDays).toBeNull();
    expect(values.sessionMinutes).toBeNull();
    expect(values.frequency).toBe("");
    expect(values.tags).toEqual([]);
    expect(values.resources).toEqual([]);
  });
});
