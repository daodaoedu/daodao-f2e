/**
 * 實踐建立精靈（四步驟）表單 schema — daodaoedu/daodao#141
 *
 * 與舊版 `../manual/schema.ts` 並存：舊 schema 仍供 /practices/[id]/edit 使用。
 * 契約以 openspec/changes/practice-create-flow/specs 為準。
 */
import type { useTranslations } from "@daodao/i18n";
import { addDays, isAfter, isBefore, isValid, parse, startOfDay } from "date-fns";
import { z } from "zod";
import { ExecutionTiming } from "@/constants/practice-form";
import { allocateSegmentDays } from "@/lib/practice-create";

type TFunction = ReturnType<typeof useTranslations<"practice">>;

// ---------------------------------------------------------------------------
// 常數（與 server validators / storage migration 083 對齊）
// ---------------------------------------------------------------------------
export const WizardMode = { personal: "personal", template: "template" } as const;
export type WizardMode = (typeof WizardMode)[keyof typeof WizardMode];

export const WIZARD_TOTAL_STEPS = 4;
export const ACTION_MAX_LENGTH = 50;
export const NAME_MAX_LENGTH = 20;
export const DAYS_MIN = 1;
export const DAYS_MAX = 90;
export const START_DATE_MAX_OFFSET_DAYS = 14;
export const MINUTES_MIN = 1;
export const MINUTES_MAX = 999;
export const SPLIT_THRESHOLD_DAYS = 30;
export const SEGMENTS_MIN = 2;
export const SEGMENTS_MAX = 3;
export const SEGMENT_TIMING_MAX_LENGTH = 40;
export const CUSTOM_TIMING_MAX_LENGTH = 20;
export const TAGS_MAX = 10;
export const RESOURCES_MAX = 10;
export const RESOURCE_NAME_MAX_LENGTH = 100;

export const DURATION_DAY_PRESETS = [7, 14, 21, 30] as const;
export const MINUTE_PRESETS = [15, 30, 45, 60] as const;
export const FREQUENCY_PRESETS = ["2-4", "3-5", "4-7"] as const;
export const TIMING_PRESETS = [
  ExecutionTiming.morning,
  ExecutionTiming.commute,
  ExecutionTiming.lunchBreak,
  ExecutionTiming.evening,
  ExecutionTiming.beforeSleep,
] as const;

/** 自訂時機串接進 otherContext 的分隔符（server 不拆，讀回時前端以此 split） */
export const CUSTOM_TIMING_SEPARATOR = "、";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const msgFactory = (t?: TFunction) => (key: string, params?: Record<string, string | number>) =>
  t ? t(key as Parameters<TFunction>[0], params as never) : key;

/** 逐段覆寫值：空字串 / null 代表「繼承全域或自動分配」 */
export const segmentOverrideSchema = z.object({
  name: z.string().max(NAME_MAX_LENGTH).default(""),
  action: z.string().max(ACTION_MAX_LENGTH).default(""),
  days: z.number().int().min(DAYS_MIN).max(DAYS_MAX).nullable().default(null),
  /** 正規化後的頻率字串（"2-5" / "7"）；"" = 繼承全域 */
  frequency: z.string().default(""),
  minutes: z.number().int().min(MINUTES_MIN).max(MINUTES_MAX).nullable().default(null),
  /** 預設時機 key（ExecutionTiming）或自訂文字；"" = 未選 */
  timing: z.string().max(SEGMENT_TIMING_MAX_LENGTH).default(""),
});
export type SegmentOverride = z.infer<typeof segmentOverrideSchema>;

export const emptySegmentOverride = (): SegmentOverride => ({
  name: "",
  action: "",
  days: null,
  frequency: "",
  minutes: null,
  timing: "",
});

export const createResourceSchema = (t?: TFunction) => {
  const msg = msgFactory(t);
  return z.object({
    id: z.string(),
    name: z
      .string()
      .trim()
      .min(1, msg("wizard_resource_name_required"))
      .max(RESOURCE_NAME_MAX_LENGTH, msg("validation_resource_name_max")),
    /** "" 代表純名稱資源 */
    url: z
      .string()
      .refine((val) => val === "" || isHttpsUrl(val), { message: msg("wizard_resource_url_https") })
      .default(""),
    /** 指派的段落 index（0-based）；空陣列 = 全部實踐 */
    segmentIndexes: z.array(z.number().int().min(0)).default([]),
  });
};
export type WizardResource = z.infer<ReturnType<typeof createResourceSchema>>;

export const isHttpsUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const isStartDateInRange = (value: string): "ok" | "invalid" | "early" | "late" => {
  const date = parse(value, "yyyy-MM-dd", new Date());
  if (!isValid(date)) return "invalid";
  const day = startOfDay(date);
  const min = startOfDay(new Date());
  const max = startOfDay(addDays(new Date(), START_DATE_MAX_OFFSET_DAYS));
  if (isBefore(day, min)) return "early";
  if (isAfter(day, max)) return "late";
  return "ok";
};

export const createWizardFormSchema = (t?: TFunction) => {
  const msg = msgFactory(t);

  return z
    .object({
      mode: z.nativeEnum(WizardMode),

      // Step 1
      action: z
        .string()
        .trim()
        .min(1, msg("wizard_validation_action_required"))
        .max(ACTION_MAX_LENGTH, msg("validation_action_max")),
      /** 使用者手動覆寫的名稱；"" = 自動推導 */
      name: z.string().max(NAME_MAX_LENGTH).default(""),

      // Step 2
      /** yyyy-MM-dd；template 模式固定 "" */
      startDate: z.string().default(""),
      durationDays: z.number().int().min(DAYS_MIN).max(DAYS_MAX).nullable().default(null),
      /** 正規化後的頻率（"2-4" / "1-3" / "7"）；"" = 未選 */
      frequency: z.string().default(""),
      sessionMinutes: z.number().int().min(MINUTES_MIN).max(MINUTES_MAX).nullable().default(null),
      timings: z.array(z.nativeEnum(ExecutionTiming)).default([]),
      customTimings: z.array(z.string().max(CUSTOM_TIMING_MAX_LENGTH)).default([]),

      // 拆段
      isSegmented: z.boolean().default(false),
      segments: z.array(segmentOverrideSchema).max(SEGMENTS_MAX).default([]),
      /** 使用者對「這個天數值」按過「維持一個實踐」 */
      rejectedDayValue: z.number().nullable().default(null),

      // Step 3
      tags: z
        .array(z.string())
        .max(TAGS_MAX, msg("validation_tags_max", { max: TAGS_MAX }))
        .default([]),
      resources: z.array(createResourceSchema(t)).max(RESOURCES_MAX).default([]),
    })
    .superRefine((data, ctx) => {
      // 開始日期（個人版必填、今日 ~ +14）
      if (data.mode === WizardMode.personal) {
        if (!data.startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startDate"],
            message: msg("validation_start_date_required"),
          });
        } else {
          const state = isStartDateInRange(data.startDate);
          if (state !== "ok") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["startDate"],
              message: msg(
                state === "invalid"
                  ? "validation_start_date_invalid"
                  : state === "early"
                    ? "validation_start_date_too_early"
                    : "validation_start_date_out_of_range"
              ),
            });
          }
        }
      }

      // 天數必填
      if (data.durationDays === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["durationDays"],
          message: msg("validation_duration_required"),
        });
        return;
      }

      if (!data.isSegmented) {
        if (!data.frequency) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["frequency"],
            message: msg("validation_frequency_required"),
          });
        }
        return;
      }

      // 拆段：段數、每段頻率、天數配額
      if (data.segments.length < SEGMENTS_MIN || data.segments.length > SEGMENTS_MAX) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["segments"],
          message: msg("wizard_validation_segment_count"),
        });
        return;
      }

      const allocated = allocateSegmentDays(data.durationDays, data.segments.length);
      let sum = 0;
      data.segments.forEach((seg, i) => {
        if (!(seg.frequency || data.frequency)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["segments", i, "frequency"],
            message: msg("wizard_validation_segment_frequency_required"),
          });
        }
        sum += seg.days ?? allocated[i] ?? 0;
      });

      if (sum !== data.durationDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["segments"],
          message: msg("wizard_validation_segment_days_sum", {
            total: data.durationDays,
            current: sum,
          }),
        });
      }
    });
};

export const wizardFormSchema = createWizardFormSchema();
export type WizardFormValues = z.infer<typeof wizardFormSchema>;

export const defaultWizardValues = (mode: WizardMode, todayIso: string): WizardFormValues => ({
  mode,
  action: "",
  name: "",
  startDate: mode === WizardMode.personal ? todayIso : "",
  durationDays: null,
  frequency: "",
  sessionMinutes: null,
  timings: [],
  customTimings: [],
  isSegmented: false,
  segments: [],
  rejectedDayValue: null,
  tags: [],
  resources: [],
});

/** 各步驟「下一步」要觸發驗證的欄位 */
export const WIZARD_STEP_FIELDS: Record<number, (keyof WizardFormValues)[]> = {
  1: ["action", "name"],
  2: ["startDate", "durationDays", "frequency", "sessionMinutes", "customTimings", "segments"],
  3: ["tags", "resources"],
  4: [],
};
