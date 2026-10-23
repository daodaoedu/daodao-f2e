import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import { createManualPracticeFormSchema, type ManualPracticeFormValues } from "../schema";

// 模擬 next-intl 的 t：回傳可辨識的翻譯文字，帶參數時一併附上
const t = ((key: string, params?: Record<string, unknown>) =>
  params ? `譯:${key}:${JSON.stringify(params)}` : `譯:${key}`) as unknown as Parameters<
  typeof createManualPracticeFormSchema
>[1];

const invalidValues = {
  name: "",
  actionDescription: "",
  startDate: "",
  durationDays: "7",
  frequency: "2-4",
  durationMinutes: 30,
  executionTiming: [],
  customTiming: "",
  tags: [],
  resources: [{ id: "r1", name: "", url: "http://insecure.example.com" }],
} as unknown as ManualPracticeFormValues;

const messagesOf = (schema: ReturnType<typeof createManualPracticeFormSchema>) => {
  const result = schema.safeParse(invalidValues);
  if (result.success) throw new Error("expected validation to fail");
  return result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
};

describe("createManualPracticeFormSchema messages (daodao#334)", () => {
  it("requires t so callers cannot fall back to raw keys", () => {
    // 編輯頁曾漏傳 t，畫面直接顯示 validation_name_required；t 必填後漏傳會在 typecheck 擋下。
    // 這裡只做編譯期守門：t 改回選填時 @ts-expect-error 會變成未使用而讓 typecheck 失敗
    const missingT = () =>
      // @ts-expect-error t is required
      createManualPracticeFormSchema({ minStartDate: new Date() });
    expect(typeof missingT).toBe("function");
  });

  it("translates every validation message when t is given", () => {
    const issues = messagesOf(createManualPracticeFormSchema({ minStartDate: new Date() }, t));

    expect(issues).toEqual(
      expect.arrayContaining([
        { path: "name", message: "譯:validation_name_required" },
        { path: "actionDescription", message: "譯:validation_action_required" },
        { path: "startDate", message: "譯:validation_start_date_required" },
        { path: "resources.0.name", message: "譯:validation_resource_name_required" },
        { path: "resources.0.url", message: "譯:step4_url_https_required" },
      ])
    );
    expect(issues.every((issue) => issue.message.startsWith("譯:"))).toBe(true);
  });

  it("accepts dayNumber on resources so the edit form keeps it (daodao#332)", () => {
    const result = createManualPracticeFormSchema({}, t).safeParse({
      ...invalidValues,
      name: "每日閱讀",
      actionDescription: "讀 10 頁",
      startDate: format(new Date(), "yyyy-MM-dd"),
      executionTiming: ["morning"],
      resources: [
        { id: "r1", name: "覆盤模板", url: "", dayNumber: 2 },
        { id: "r2", name: "整段可用", url: "", dayNumber: null },
      ],
    });
    expect(result.success && result.data.resources).toEqual([
      { id: "r1", name: "覆盤模板", url: "", dayNumber: 2 },
      { id: "r2", name: "整段可用", url: "", dayNumber: null },
    ]);
  });

  it("accepts custom days, frequency and minutes from the new create flow (daodao#370)", () => {
    const result = createManualPracticeFormSchema({}, t).safeParse({
      ...invalidValues,
      name: "每日閱讀",
      actionDescription: "讀 10 頁",
      startDate: format(new Date(), "yyyy-MM-dd"),
      durationDays: "45",
      frequency: "1-3",
      durationMinutes: 25,
      executionTiming: [],
      resources: [],
    });
    expect(result.success).toBe(true);
  });

  it("allows missing days and frequency when the schedule is locked (daodao#370)", () => {
    // 共同挑戰或已打卡的實踐，天數／頻率欄位鎖住無法填；原值是 null 時仍要能改名稱、標籤等其他欄位
    const result = createManualPracticeFormSchema({ scheduleLocked: true }, t).safeParse({
      ...invalidValues,
      name: "每日閱讀",
      actionDescription: "讀 10 頁",
      startDate: format(new Date(), "yyyy-MM-dd"),
      durationDays: "",
      frequency: "",
      durationMinutes: null,
      resources: [],
    });
    expect(result.success).toBe(true);
  });

  it("still requires frequency when only the period is locked (daodao#385)", () => {
    // 共同挑戰還沒打卡：期間鎖住、頻率可改，頻率清空不能默默存成「沒改」
    const result = createManualPracticeFormSchema(
      { scheduleLocked: true, frequencyLocked: false },
      t
    ).safeParse({
      ...invalidValues,
      name: "每日閱讀",
      actionDescription: "讀 10 頁",
      startDate: format(new Date(), "yyyy-MM-dd"),
      durationDays: "",
      frequency: "",
      durationMinutes: null,
      resources: [],
    });
    if (result.success) throw new Error("expected validation to fail");
    const paths = result.error.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(["frequency"]);
  });

  it("still requires days and frequency (daodao#370)", () => {
    const result = createManualPracticeFormSchema({}, t).safeParse({
      ...invalidValues,
      durationDays: "",
      frequency: "",
    });
    if (result.success) throw new Error("expected validation to fail");
    const paths = result.error.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["durationDays", "frequency"]));
  });
});
