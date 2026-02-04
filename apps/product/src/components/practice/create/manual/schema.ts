import { addDays, format, isAfter, isBefore, isValid, parse, startOfDay } from "date-fns";
import { z } from "zod";
import {
  DurationDays,
  ExecutionTiming,
  Frequency,
  MAX_PRACTICE_TAGS,
} from "@/constants/practice-form";

// Form Options Constants
// 這些選項使用 constants 中的值，確保與 schema 驗證一致
export const DURATION_MINUTES_OPTIONS = [
  { value: 15, label: "15分鐘" },
  { value: 30, label: "30分鐘" },
  { value: 45, label: "45分鐘" },
  { value: 60, label: "60分鐘" },
] as const;

export const DURATION_DAYS_OPTIONS = [
  { value: DurationDays.seven, label: "7天" },
  { value: DurationDays.fourteen, label: "14天" },
  { value: DurationDays.twentyOne, label: "21天" },
  { value: DurationDays.thirty, label: "30天" },
] as const;

export const FREQUENCY_OPTIONS = [
  {
    value: Frequency.twoToFour,
    label: "2-4",
    unit: "天",
    description: "輕鬆起步",
  },
  {
    value: Frequency.threeToFive,
    label: "3-5",
    unit: "天",
    description: "紮實執行",
  },
  {
    value: Frequency.fourToSeven,
    label: "4-7",
    unit: "天",
    description: "密集小跑",
  },
] as const;

export const EXECUTION_TIMING_OPTIONS = [
  { value: ExecutionTiming.morning, label: "早餐前" },
  { value: ExecutionTiming.commute, label: "通勤時" },
  { value: ExecutionTiming.lunchBreak, label: "午休時" },
  { value: ExecutionTiming.evening, label: "晚餐後" },
  { value: ExecutionTiming.beforeSleep, label: "睡前" },
] as const;

// Schema 選項
export interface ManualPracticeSchemaOptions {
  // 開始日期的最小日期限制（預設為今天）
  // 編輯模式時可設為實踐的創建日期，允許保留原有的開始日期
  minStartDate?: Date;
}

// 建立開始日期驗證 schema
const createStartDateSchema = (minDate: Date) => {
  return z
    .string()
    .min(1, "請選擇開始時間")
    .refine(
      (val) => {
        if (!val) return false;
        const date = parse(val, "yyyy-MM-dd", new Date());
        if (!isValid(date)) return false;
        const minDateStartOfDay = startOfDay(minDate);
        const maxDate = startOfDay(addDays(new Date(), 14));
        const dateStartOfDay = startOfDay(date);
        return !isBefore(dateStartOfDay, minDateStartOfDay) && !isAfter(dateStartOfDay, maxDate);
      },
      (val) => {
        if (!val) return { message: "請選擇開始時間" };
        const date = parse(val, "yyyy-MM-dd", new Date());
        if (!isValid(date)) return { message: "請選擇有效的日期" };
        const minDateStartOfDay = startOfDay(minDate);
        const maxDate = startOfDay(addDays(new Date(), 14));
        const dateStartOfDay = startOfDay(date);
        if (isBefore(dateStartOfDay, minDateStartOfDay)) {
          const minDateFormatted = format(minDateStartOfDay, "yyyy/MM/dd");
          return { message: `日期不能早於 ${minDateFormatted}` };
        }
        if (isAfter(dateStartOfDay, maxDate)) {
          const maxDateFormatted = format(maxDate, "yyyy/MM/dd");
          return { message: `日期不能晚於 ${maxDateFormatted}` };
        }
        return { message: "日期不在允許的範圍內" };
      }
    );
};

// Form Schema 工廠函數
export const createManualPracticeFormSchema = (options?: ManualPracticeSchemaOptions) => {
  const minStartDate = options?.minStartDate ?? new Date();

  return z.object({
    // Step 1
    name: z.string().min(1, "請輸入名稱"),
    actionDescription: z.string().min(1, "請輸入實踐行動").max(50, "最多50字").default(""),

    // Step 2
    startDate: createStartDateSchema(minStartDate),
    durationDays: z.nativeEnum(DurationDays, {
      required_error: "請選擇想要持續多久",
    }),
    frequency: z.nativeEnum(Frequency, {
      required_error: "請選擇每週實踐頻率",
    }),

    // Step 3
    durationMinutes: z.number(),
    executionTiming: z.array(z.nativeEnum(ExecutionTiming)).min(1, "請至少選擇一個執行時機"),
    customTiming: z.string(),

    // Step 4
    tags: z.array(z.string()).max(MAX_PRACTICE_TAGS, `標籤最多 ${MAX_PRACTICE_TAGS} 個`).optional(),
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
};

// 預設 schema（用於創建模式）
export const manualPracticeFormSchema = createManualPracticeFormSchema();

export type ManualPracticeFormValues = z.infer<typeof manualPracticeFormSchema>;
