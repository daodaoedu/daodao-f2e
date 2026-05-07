import { z } from "zod";
import type { ICheckInFormData } from "@/components/check-in/types";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";

/**
 * 打卡表單驗證 schema
 */
export const checkInFormSchema = z.object({
  mood: z
    .enum(MOOD_OPTIONS.map((option) => option.id) as [MoodType, ...MoodType[]])
    .nullable()
    .default(null)
    .refine((val) => val !== null, { message: "請選擇心情" }),
  tags: z.array(z.string()).default([]),
  description: z.string().max(300, "最多300字").default(""),
  mediaUris: z.array(z.string()).max(3, "最多只能上傳3張圖片").default([]),
});

export type CheckInFormValuesType = ICheckInFormData;
