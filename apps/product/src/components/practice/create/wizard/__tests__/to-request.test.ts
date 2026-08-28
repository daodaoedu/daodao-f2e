import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import { ExecutionTiming } from "@/constants/practice-form";
import { getEffectiveSegments } from "../derive";
import {
  defaultWizardValues,
  emptySegmentOverride,
  type WizardFormValues,
  WizardMode,
} from "../schema";
import {
  toBatchCreatePracticeRequest,
  toBatchCreateTemplateRequest,
  toCreatePracticeRequest,
  toCreateTemplateRequest,
} from "../to-request";

const NAME_FALLBACK = "我的實踐";

const values = (overrides: Partial<WizardFormValues> = {}): WizardFormValues => ({
  ...defaultWizardValues(WizardMode.personal, "2026-09-01"),
  action: "每天早上七點起來，閱讀《原子習慣》30 頁",
  durationDays: 14,
  frequency: "3-5",
  sessionMinutes: 30,
  timings: [ExecutionTiming.morning],
  customTimings: ["洗澡後"],
  tags: ["閱讀"],
  resources: [
    { id: "a", name: "博客來", url: "https://www.books.com.tw/", segmentIndexes: [] },
    { id: "b", name: "圖書館的書", url: "", segmentIndexes: [1] },
  ],
  ...overrides,
});

describe("toCreatePracticeRequest（未拆段）", () => {
  it("maps fields, derives the title from the action, includes name-only resources", () => {
    const req = toCreatePracticeRequest(values(), {
      nameFallback: NAME_FALLBACK,
      templateId: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(req.title).toBe("閱讀《原子習慣》30 頁");
    expect(req.practiceAction).toBe("每天早上七點起來，閱讀《原子習慣》30 頁");
    expect(req.startDate).toBe("2026-09-01");
    expect(req.durationDays).toBe(14);
    expect(req.frequencyMinDays).toBe(3);
    expect(req.frequencyMaxDays).toBe(5);
    expect(req.sessionDurationMinutes).toBe(30);
    expect(req.practiceTimePeriods).toEqual(["morning"]);
    expect(req.otherContext).toBe("洗澡後");
    expect(req.tags).toEqual(["閱讀"]);
    // 未拆段：所有資源都帶上（含指派給第 2 段的，因為只有一段）
    expect(req.resources).toEqual([
      { name: "博客來", url: "https://www.books.com.tw/" },
      { name: "圖書館的書", url: "" },
    ]);
    expect(req.templateId).toBe("123e4567-e89b-12d3-a456-426614174000");
  });

  it("uses the manual name override when present and falls back when nothing derives", () => {
    expect(
      toCreatePracticeRequest(values({ name: "我的閱讀" }), { nameFallback: NAME_FALLBACK }).title
    ).toBe("我的閱讀");
    expect(
      toCreatePracticeRequest(values({ action: "，，" }), { nameFallback: NAME_FALLBACK }).title
    ).toBe(NAME_FALLBACK);
  });

  it("single-number frequency becomes min = max; omits optional fields when empty", () => {
    const req = toCreatePracticeRequest(
      values({
        frequency: "7",
        sessionMinutes: null,
        customTimings: [],
        timings: [],
        resources: [],
      }),
      { nameFallback: NAME_FALLBACK }
    );
    expect(req.frequencyMinDays).toBe(7);
    expect(req.frequencyMaxDays).toBe(7);
    expect(req.sessionDurationMinutes).toBeUndefined();
    expect(req.otherContext).toBeUndefined();
    expect(req.resources).toBeUndefined();
    expect(req.practiceTimePeriods).toEqual([]);
  });
});

describe("toBatchCreatePracticeRequest（拆段）", () => {
  const segmented = values({
    durationDays: 40,
    isSegmented: true,
    segments: [
      { ...emptySegmentOverride(), name: "起步" },
      { ...emptySegmentOverride(), frequency: "2-4", timing: "遛狗時" },
      { ...emptySegmentOverride(), timing: ExecutionTiming.beforeSleep, minutes: 45 },
    ],
  });

  it("builds 3 contiguous segments with allocated days, inherited/overridden fields and per-segment resources", () => {
    const { segments } = toBatchCreatePracticeRequest(segmented, { nameFallback: NAME_FALLBACK });
    expect(segments).toHaveLength(3);
    expect(segments.map((s) => s.durationDays)).toEqual([14, 13, 13]);
    expect(segments.map((s) => s.startDate)).toEqual(["2026-09-01", "2026-09-15", "2026-09-28"]);
    expect(segments.map((s) => s.title)).toEqual([
      "起步",
      "閱讀《原子習慣》30 頁 (2)",
      "閱讀《原子習慣》30 頁 (3)",
    ]);
    // 頻率：第 2 段覆寫，其餘繼承
    expect(segments.map((s) => [s.frequencyMinDays, s.frequencyMaxDays])).toEqual([
      [3, 5],
      [2, 4],
      [3, 5],
    ]);
    // 時機：第 1 段繼承全域 morning；第 2 段自訂文字進 otherContext；第 3 段預設 night
    expect(segments[0]?.practiceTimePeriods).toEqual(["morning"]);
    expect(segments[1]?.practiceTimePeriods).toEqual([]);
    expect(segments[1]?.otherContext).toBe("洗澡後、遛狗時");
    expect(segments[2]?.practiceTimePeriods).toEqual(["night"]);
    expect(segments[2]?.sessionDurationMinutes).toBe(45);
    // 標籤全段共用；資源依指派
    expect(segments.every((s) => s.tags?.[0] === "閱讀")).toBe(true);
    expect(segments[0]?.resources).toEqual([{ name: "博客來", url: "https://www.books.com.tw/" }]);
    expect(segments[1]?.resources).toEqual([
      { name: "博客來", url: "https://www.books.com.tw/" },
      { name: "圖書館的書", url: "" },
    ]);
    expect(segments[2]?.resources).toEqual([{ name: "博客來", url: "https://www.books.com.tw/" }]);
  });

  it("last segment ends on the overall end date", () => {
    const eff = getEffectiveSegments(segmented, NAME_FALLBACK);
    expect(eff[2]?.end ? format(eff[2].end, "yyyy-MM-dd") : null).toBe("2026-10-10"); // 2026-09-01 + 40 − 1
  });
});

describe("template mode", () => {
  it("omits startDate/resources and maps tags to suggestedTags", () => {
    const req = toCreateTemplateRequest(values({ mode: WizardMode.template, startDate: "" }), {
      nameFallback: NAME_FALLBACK,
    });
    expect(req.title).toBe("閱讀《原子習慣》30 頁");
    expect(req.durationDays).toBe(14);
    expect(req.suggestedTags).toEqual(["閱讀"]);
    expect("startDate" in req).toBe(false);
    expect("resources" in req).toBe(false);
  });

  it("batch template has no dates but still splits days", () => {
    const { segments } = toBatchCreateTemplateRequest(
      values({
        mode: WizardMode.template,
        startDate: "",
        durationDays: 60,
        isSegmented: true,
        segments: [emptySegmentOverride(), emptySegmentOverride()],
      }),
      { nameFallback: NAME_FALLBACK }
    );
    expect(segments.map((s) => s.durationDays)).toEqual([30, 30]);
    expect(segments.every((s) => !("startDate" in s))).toBe(true);
  });
});
