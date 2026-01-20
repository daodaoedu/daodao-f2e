import { addDays, format, isAfter, isBefore, isValid, parse, startOfDay } from "date-fns";
import { z } from "zod";

// Form Options Constants
export const DURATION_MINUTES_OPTIONS = [
  { value: 15, label: "15分鐘" },
  { value: 30, label: "30分鐘" },
  { value: 45, label: "45分鐘" },
  { value: 60, label: "60分鐘" },
] as const;

export const DURATION_DAYS_OPTIONS = [
  { value: "7", label: "7天" },
  { value: "14", label: "14天" },
  { value: "21", label: "21天" },
  { value: "30", label: "30天" },
] as const;

export const FREQUENCY_OPTIONS = [
  { value: "2-4", label: "2-4", unit: "天", description: "輕鬆起步" },
  { value: "3-5", label: "3-5", unit: "天", description: "紮實執行" },
  { value: "4-7", label: "4-7", unit: "天", description: "密集小跑" },
] as const;

export const EXECUTION_TIMING_OPTIONS = [
  { value: "morning", label: "早上" },
  { value: "lunchBreak", label: "午休" },
  { value: "commute", label: "通勤中" },
  { value: "holiday", label: "休假日" },
  { value: "evening", label: "夜晚" },
  { value: "beforeSleep", label: "睡前" },
] as const;

// Form Schema
export const manualPracticeFormSchema = z.object({
  // Step 1
  name: z.string().min(1, "請輸入名稱"),
  actionDescription: z.string().min(1, "請輸入實踐行動").max(50, "最多50字").default(""),

  // Step 2
  startDate: z
    .string()
    .min(1, "請選擇開始時間")
    .refine(
      (val) => {
        if (!val) return false;
        const date = parse(val, "yyyy-MM-dd", new Date());
        if (!isValid(date)) return false;
        const today = startOfDay(new Date());
        const maxDate = startOfDay(addDays(new Date(), 14));
        const dateStartOfDay = startOfDay(date);
        return !isBefore(dateStartOfDay, today) && !isAfter(dateStartOfDay, maxDate);
      },
      (val) => {
        if (!val) return { message: "請選擇開始時間" };
        const date = parse(val, "yyyy-MM-dd", new Date());
        if (!isValid(date)) return { message: "請選擇有效的日期" };
        const today = startOfDay(new Date());
        const maxDate = startOfDay(addDays(new Date(), 14));
        const dateStartOfDay = startOfDay(date);
        if (isBefore(dateStartOfDay, today)) {
          return { message: "日期不能早於今天" };
        }
        if (isAfter(dateStartOfDay, maxDate)) {
          const maxDateFormatted = format(maxDate, "yyyy/MM/dd");
          return { message: `日期不能晚於 ${maxDateFormatted}` };
        }
        return { message: "日期不在允許的範圍內" };
      }
    ),
  durationDays: z.enum(["7", "14", "21", "30"], { required_error: "請選擇想要持續多久" }),
  frequency: z.enum(["2-4", "3-5", "4-7"], { required_error: "請選擇每週實踐頻率" }),

  // Step 3
  durationMinutes: z.number(),
  executionTiming: z
    .array(z.enum(["morning", "lunchBreak", "commute", "holiday", "evening", "beforeSleep"]))
    .min(1, "請至少選擇一個執行時機"),
  customTiming: z.string(),

  // Step 4
  tags: z.array(z.string()).optional(),
  resources: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "請輸入資源名稱"),
        url: z
          .string()
          .url("請輸入有效的網址")
          .refine((val) => !val || val.startsWith("https://"), {
            message: "網址必須使用 HTTPS",
          })
          .optional()
          .or(z.literal("")),
      })
    )
    .optional(),
});

export type ManualPracticeFormValues = z.infer<typeof manualPracticeFormSchema>;
