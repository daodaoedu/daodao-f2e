import { z } from "zod";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import type { ICheckInFormData } from "../types";

/**
 * 打卡表單驗證 schema
 */
export const checkInFormSchema = z.object({
  mood: z
    .enum(MOOD_OPTIONS.map((option) => option.id) as [MoodType, ...MoodType[]])
    .nullable()
    .default(null),
  tags: z.array(z.string()).default([]),
  description: z.string().max(300, "最多300字").default(""),
  media: z.array(z.instanceof(File)).max(3, "最多只能上傳3張圖片").default([]),
});

export type CheckInFormValuesType = ICheckInFormData;
