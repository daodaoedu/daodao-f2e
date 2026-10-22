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
    // 編輯頁曾漏傳 t，畫面直接顯示 validation_name_required；t 必填後漏傳會在 typecheck 擋下
    // @ts-expect-error t is required
    const missingT = () => createManualPracticeFormSchema({ minStartDate: new Date() });
    expect(missingT).toThrow();
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
});
