import { z } from "zod";
import type { ICheckInFormData } from "@/components/check-in/types";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";

/**
 * 打卡表單驗證 schema
 */
export const createCheckInFormSchema = (t: (key: string) => string) =>
  z.object({
    mood: z
      .enum(MOOD_OPTIONS.map((option) => option.id) as [MoodType, ...MoodType[]])
      .nullable()
      .default(null)
      .refine((val) => val !== null, { message: t("validation_mood_required") }),
    tags: z.array(z.string()).default([]),
    description: z.string().max(300, t("validation_description_max")).default(""),
    mediaUris: z.array(z.string()).max(3, t("validation_media_max")).default([]),
  });

export const checkInFormSchema = createCheckInFormSchema((key) => key);

export type CheckInFormValuesType = ICheckInFormData;
