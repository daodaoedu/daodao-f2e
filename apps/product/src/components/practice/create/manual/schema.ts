import { addDays, format, isAfter, isBefore, isValid, parse, startOfDay } from "date-fns";
import { z } from "zod";
import type { useTranslations } from "@daodao/i18n";
import {
  DurationDays,
  ExecutionTiming,
  Frequency,
  MAX_PRACTICE_TAGS,
} from "@/constants/practice-form";

type TFunction = ReturnType<typeof useTranslations<"practice">>;

// Form Options Constants (static keys for non-translated use)
export const DURATION_MINUTES_OPTIONS = [
  { value: 15, labelKey: "duration_15min" as const },
  { value: 30, labelKey: "duration_30min" as const },
  { value: 45, labelKey: "duration_45min" as const },
  { value: 60, labelKey: "duration_60min" as const },
] as const;

export const DURATION_DAYS_OPTIONS = [
  { value: DurationDays.seven, labelKey: "duration_7days" as const },
  { value: DurationDays.fourteen, labelKey: "duration_14days" as const },
  { value: DurationDays.twentyOne, labelKey: "duration_21days" as const },
  { value: DurationDays.thirty, labelKey: "duration_30days" as const },
] as const;

export const FREQUENCY_OPTIONS = [
  {
    value: Frequency.twoToFour,
    label: "2-4",
    unitKey: "frequency_unit" as const,
    descriptionKey: "frequency_easy" as const,
  },
  {
    value: Frequency.threeToFive,
    label: "3-5",
    unitKey: "frequency_unit" as const,
    descriptionKey: "frequency_solid" as const,
  },
  {
    value: Frequency.fourToSeven,
    label: "4-7",
    unitKey: "frequency_unit" as const,
    descriptionKey: "frequency_intensive" as const,
  },
] as const;

export const EXECUTION_TIMING_OPTIONS = [
  { value: ExecutionTiming.morning, labelKey: "timing_morning" as const },
  { value: ExecutionTiming.commute, labelKey: "timing_commute" as const },
  { value: ExecutionTiming.lunchBreak, labelKey: "timing_lunch" as const },
  { value: ExecutionTiming.evening, labelKey: "timing_evening" as const },
  { value: ExecutionTiming.beforeSleep, labelKey: "timing_before_sleep" as const },
] as const;

// Schema 選項
export interface ManualPracticeSchemaOptions {
  // 開始日期的最小日期限制
  // 編輯模式時可設為實踐的創建日期，允許保留原有的開始日期
  // 如果未提供，驗證時會動態使用當前日期
  minStartDate?: Date;
}

// 建立開始日期驗證 schema
// minDate 為可選參數，若未提供則在驗證時使用當前日期（確保跨午夜時仍正確）
const createStartDateSchema = (minDate?: Date, t?: TFunction) => {
  const msg = (key: string, params?: Record<string, string>) => {
    if (t) return t(key as Parameters<TFunction>[0], params as never);
    return key;
  };

  return z
    .string()
    .min(1, msg("validation_start_date_required"))
    .refine(
      (val) => {
        if (!val) return false;
        const date = parse(val, "yyyy-MM-dd", new Date());
        if (!isValid(date)) return false;
        // 若有指定 minDate 則使用，否則使用當前日期
        const minDateStartOfDay = startOfDay(minDate ?? new Date());
        const maxDate = startOfDay(addDays(new Date(), 14));
        const dateStartOfDay = startOfDay(date);
        return !isBefore(dateStartOfDay, minDateStartOfDay) && !isAfter(dateStartOfDay, maxDate);
      },
      (val) => {
        if (!val) return { message: msg("validation_start_date_required") };
        const date = parse(val, "yyyy-MM-dd", new Date());
        if (!isValid(date)) return { message: msg("validation_start_date_invalid") };
        // 若有指定 minDate 則使用，否則使用當前日期
        const minDateStartOfDay = startOfDay(minDate ?? new Date());
        const maxDate = startOfDay(addDays(new Date(), 14));
        const dateStartOfDay = startOfDay(date);
        if (isBefore(dateStartOfDay, minDateStartOfDay)) {
          // 若是動態日期（今天），顯示「今天」；若是指定日期，顯示具體日期
          if (!minDate) {
            return { message: msg("validation_start_date_too_early") };
          }
          const minDateFormatted = format(minDateStartOfDay, "yyyy/MM/dd");
          return { message: msg("validation_start_date_too_early_min", { minDate: minDateFormatted }) };
        }
        if (isAfter(dateStartOfDay, maxDate)) {
          const maxDateFormatted = format(maxDate, "yyyy/MM/dd");
          return { message: msg("validation_start_date_too_late", { maxDate: maxDateFormatted }) };
        }
        return { message: msg("validation_start_date_out_of_range") };
      }
    );
};

// Form Schema 工廠函數
export const createManualPracticeFormSchema = (options?: ManualPracticeSchemaOptions, t?: TFunction) => {
  // 不提供預設值，讓 createStartDateSchema 在驗證時動態決定
  const minStartDate = options?.minStartDate;

  const msg = (key: string, params?: Record<string, string | number>) => {
    if (t) return t(key as Parameters<TFunction>[0], params as never);
    return key;
  };

  return z
    .object({
      // Step 1
      name: z.string().min(1, msg("validation_name_required")),
      actionDescription: z
        .string()
        .min(1, msg("validation_action_required"))
        .max(50, msg("validation_action_max"))
        .default(""),

      // Step 2
      startDate: createStartDateSchema(minStartDate, t),
      durationDays: z.nativeEnum(DurationDays, {
        required_error: msg("validation_duration_required"),
      }),
      frequency: z.nativeEnum(Frequency, {
        required_error: msg("validation_frequency_required"),
      }),

      // Step 3
      durationMinutes: z.number(),
      executionTiming: z.array(z.nativeEnum(ExecutionTiming)),
      customTiming: z.string(),

      // Step 4
      tags: z
        .array(z.string())
        .max(MAX_PRACTICE_TAGS, msg("validation_tags_max", { max: MAX_PRACTICE_TAGS }))
        .optional(),
      resources: z
        .array(
          z.object({
            id: z.string(),
            name: z
              .string()
              .min(1, msg("validation_resource_name_required"))
              .max(100, msg("validation_resource_name_max")),
            url: z
              .string()
              .url(msg("validation_resource_url_invalid"))
              .refine((val) => !val || val.startsWith("https://"), {
                message: msg("step4_url_https_required"),
              })
              .optional()
              .or(z.literal("")),
          })
        )
        .optional(),
    })
    .refine((data) => data.executionTiming.length > 0 || data.customTiming.trim().length > 0, {
      message: msg("validation_execution_timing_required"),
      path: ["executionTiming"],
    });
};

// 預設 schema（用於創建模式）
export const manualPracticeFormSchema = createManualPracticeFormSchema();

export type ManualPracticeFormValues = z.infer<typeof manualPracticeFormSchema>;
