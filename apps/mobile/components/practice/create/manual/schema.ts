import { z } from "zod";
import {
  DurationDays,
  ExecutionTiming,
  Frequency,
  MAX_PRACTICE_TAGS,
} from "@/constants/practice-form";

// Date utilities (native JS implementation)
const parseDate = (dateStr: string): Date | null => {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// Form Options Constants
// 這些選項使用 constants 中的值，確保與 schema 驗證一致
export const DURATION_MINUTES_OPTIONS = [
  { value: 15, labelKey: "duration_15min" },
  { value: 30, labelKey: "duration_30min" },
  { value: 45, labelKey: "duration_45min" },
  { value: 60, labelKey: "duration_60min" },
] as const;

export const DURATION_DAYS_OPTIONS = [
  { value: DurationDays.seven, labelKey: "duration_7days" },
  { value: DurationDays.fourteen, labelKey: "duration_14days" },
  { value: DurationDays.twentyOne, labelKey: "duration_21days" },
  { value: DurationDays.thirty, labelKey: "duration_30days" },
] as const;

export const FREQUENCY_OPTIONS = [
  {
    value: Frequency.twoToFour,
    label: "2-4",
    unitKey: "frequency_unit",
    descriptionKey: "frequency_easy",
  },
  {
    value: Frequency.threeToFive,
    label: "3-5",
    unitKey: "frequency_unit",
    descriptionKey: "frequency_solid",
  },
  {
    value: Frequency.fourToSeven,
    label: "4-7",
    unitKey: "frequency_unit",
    descriptionKey: "frequency_intensive",
  },
] as const;

export const EXECUTION_TIMING_OPTIONS = [
  { value: ExecutionTiming.morning, labelKey: "timing_morning" },
  { value: ExecutionTiming.commute, labelKey: "timing_commute" },
  { value: ExecutionTiming.lunchBreak, labelKey: "timing_lunch" },
  { value: ExecutionTiming.evening, labelKey: "timing_evening" },
  { value: ExecutionTiming.beforeSleep, labelKey: "timing_before_sleep" },
] as const;

type PracticeTranslator = (key: string, values?: Record<string, string | number>) => string;

const passthroughTranslator: PracticeTranslator = (key, values) => {
  if (!values) return key;
  return Object.entries(values).reduce(
    (result, [valueKey, value]) => result.replaceAll(`{${valueKey}}`, String(value)),
    key
  );
};

export const createManualPracticeFormSchema = (t: PracticeTranslator) =>
  z
    .object({
      // Step 1
      name: z.string().min(1, t("validation_name_required")),
      actionDescription: z
        .string()
        .min(1, t("validation_action_required"))
        .max(50, t("validation_action_max"))
        .default(""),

      // Step 2
      startDate: z
        .string()
        .min(1, t("validation_start_date_required"))
        .refine(
          (val) => {
            if (!val) return false;
            const date = parseDate(val);
            if (!date) return false;
            const today = startOfDay(new Date());
            const maxDate = startOfDay(addDays(new Date(), 14));
            const dateStartOfDay = startOfDay(date);
            return dateStartOfDay >= today && dateStartOfDay <= maxDate;
          },
          (val) => {
            if (!val) return { message: t("validation_start_date_required") };
            const date = parseDate(val);
            if (!date) return { message: t("validation_start_date_invalid") };
            const today = startOfDay(new Date());
            const maxDate = startOfDay(addDays(new Date(), 14));
            const dateStartOfDay = startOfDay(date);
            if (dateStartOfDay < today) {
              return { message: t("validation_start_date_too_early") };
            }
            if (dateStartOfDay > maxDate) {
              return {
                message: t("validation_start_date_too_late", { maxDate: formatDate(maxDate) }),
              };
            }
            return { message: t("validation_start_date_out_of_range") };
          }
        ),
      durationDays: z.nativeEnum(DurationDays, {
        required_error: t("validation_duration_required"),
      }),
      frequency: z.nativeEnum(Frequency, {
        required_error: t("validation_frequency_required"),
      }),

      // Step 3
      durationMinutes: z.number(),
      executionTiming: z.array(z.nativeEnum(ExecutionTiming)),
      customTiming: z.string(),

      // Step 4
      tags: z
        .array(z.string())
        .max(MAX_PRACTICE_TAGS, t("validation_tags_max", { max: MAX_PRACTICE_TAGS }))
        .optional(),
      resources: z
        .array(
          z.object({
            id: z.string(),
            name: z.string().min(1, t("validation_resource_name_required")),
            url: z
              .string()
              .url(t("validation_resource_url_invalid"))
              .refine((val) => !val || val.startsWith("https://"), {
                message: t("step4_url_https_required"),
              })
              .optional()
              .or(z.literal("")),
          })
        )
        .optional(),
    })
    .refine((data) => data.executionTiming.length > 0 || data.customTiming.trim().length > 0, {
      message: t("validation_execution_timing_required"),
      path: ["executionTiming"],
    });

export const manualPracticeFormSchema = createManualPracticeFormSchema(passthroughTranslator);
export type ManualPracticeFormValuesType = z.infer<typeof manualPracticeFormSchema>;
