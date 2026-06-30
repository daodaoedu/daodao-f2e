import type { useTranslations } from "@daodao/i18n";
import { z } from "zod";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import type { ICheckInFormData } from "../types";

type TFunction = ReturnType<typeof useTranslations<"check_in">>;

/**
 * 打卡表單驗證 schema（Phase 1：標籤、描述、媒體）
 */
export const createCheckInFormSchema = (t?: TFunction) => {
  const msg = (key: string, params?: Record<string, string | number>) => {
    if (t) return t(key as Parameters<TFunction>[0], params as never);
    return key;
  };

  return z.object({
    mood: z
      .enum(MOOD_OPTIONS.map((option) => option.id) as [MoodType, ...MoodType[]])
      .nullable()
      .default(null),
    tags: z.array(z.string()).min(1, msg("validation_tags_required")).default([]),
    description: z
      .string()
      .max(600, msg("validation_description_max", { max: 600 }))
      .default(""),
    media: z
      .array(z.instanceof(File))
      .max(3, msg("validation_media_max", { max: 3 }))
      .default([]),
  });
};

export const checkInFormSchema = createCheckInFormSchema();

export type CheckInFormValuesType = ICheckInFormData;
