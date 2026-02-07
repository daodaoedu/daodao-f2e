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
    .refine((val) => val !== null, {
      message: "請選擇心情",
    }),
  tags: z.array(z.string()).min(1, "請至少選擇一個標籤"),
  description: z.string().min(1, "請輸入描述").max(300, "最多300字"),
  mediaUris: z.array(z.string()).max(3, "最多只能上傳3張圖片").default([]),
});

export type CheckInFormValuesType = ICheckInFormData;
