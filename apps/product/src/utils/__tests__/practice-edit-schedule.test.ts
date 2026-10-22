import { describe, expect, it } from "vitest";
import {
  buildScheduleUpdatePayload,
  formatFrequencyRange,
  toEditScheduleValues,
} from "../practice-edit-schedule";

// daodao#370：新建立流程可存自訂天數／頻率／分鐘，網頁詳情與編輯頁要原值顯示，沒改就不送

const customPractice = {
  durationDays: 45,
  frequencyMinDays: 1,
  frequencyMaxDays: 3,
  sessionDurationMinutes: 25,
  practiceTimePeriods: ["night"],
  otherContext: "",
};

describe("formatFrequencyRange", () => {
  it("自訂區間照原值顯示，不再一律變成 2-4", () => {
    expect(formatFrequencyRange(1, 3)).toBe("1-3");
    expect(formatFrequencyRange(2, 5)).toBe("2-5");
  });

  it("上下限相同只顯示一個數字", () => {
    expect(formatFrequencyRange(7, 7)).toBe("7");
  });

  it("沒有頻率時回傳空字串，不捏造預設值", () => {
    expect(formatFrequencyRange(null, null)).toBe("");
    expect(formatFrequencyRange(undefined, 3)).toBe("");
  });
});

describe("toEditScheduleValues", () => {
  it("自訂天數、頻率、分鐘原值帶入表單（不是 7 天、2-4、沒選）", () => {
    expect(toEditScheduleValues(customPractice)).toEqual({
      durationDays: "45",
      frequency: "1-3",
      durationMinutes: 25,
      executionTiming: ["beforeSleep"],
      customTiming: "",
    });
  });

  it("沒有執行時機時維持空陣列，不預設勾早上", () => {
    const values = toEditScheduleValues({ ...customPractice, practiceTimePeriods: [] });
    expect(values.executionTiming).toEqual([]);
  });

  it("缺值時留空，不補預設", () => {
    expect(toEditScheduleValues({})).toEqual({
      durationDays: "",
      frequency: "",
      durationMinutes: null,
      executionTiming: [],
      customTiming: "",
    });
  });
});

describe("buildScheduleUpdatePayload", () => {
  it("沒改任何節奏欄位時一個都不送，自訂值不會被蓋掉", () => {
    const values = toEditScheduleValues(customPractice);
    expect(buildScheduleUpdatePayload(values, customPractice)).toEqual({});
  });

  it("執行時機順序不同但內容相同時不送", () => {
    const original = { ...customPractice, practiceTimePeriods: ["night", "morning"] };
    const values = {
      ...toEditScheduleValues(original),
      executionTiming: ["morning", "beforeSleep"],
    };
    expect(buildScheduleUpdatePayload(values as never, original)).toEqual({});
  });

  it("只送有改的欄位", () => {
    const values = { ...toEditScheduleValues(customPractice), durationDays: "60" };
    expect(buildScheduleUpdatePayload(values, customPractice)).toEqual({ durationDays: 60 });
  });

  it("改成預設或自訂頻率都送上下限", () => {
    const base = toEditScheduleValues(customPractice);
    expect(buildScheduleUpdatePayload({ ...base, frequency: "3-5" }, customPractice)).toEqual({
      frequencyMinDays: 3,
      frequencyMaxDays: 5,
    });
    expect(buildScheduleUpdatePayload({ ...base, frequency: "7" }, customPractice)).toEqual({
      frequencyMinDays: 7,
      frequencyMaxDays: 7,
    });
  });

  it("改分鐘、時機、自訂時機時送新值", () => {
    const base = toEditScheduleValues(customPractice);
    expect(
      buildScheduleUpdatePayload(
        {
          ...base,
          durationMinutes: 40,
          executionTiming: ["morning"],
          customTiming: "通勤後",
        },
        customPractice
      )
    ).toEqual({
      sessionDurationMinutes: 40,
      practiceTimePeriods: ["morning"],
      otherContext: "通勤後",
    });
  });

  it("清空自訂時機時送空字串，讓 server 清掉", () => {
    const original = { ...customPractice, otherContext: "睡前" };
    const values = { ...toEditScheduleValues(original), customTiming: "" };
    expect(buildScheduleUpdatePayload(values, original)).toEqual({ otherContext: "" });
  });

  it("原本沒有分鐘、表單也沒選時不送", () => {
    const original = { ...customPractice, sessionDurationMinutes: null };
    const values = toEditScheduleValues(original);
    expect(buildScheduleUpdatePayload(values, original)).toEqual({});
  });
});
