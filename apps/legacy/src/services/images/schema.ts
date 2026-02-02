import { z } from "zod";

export const uploadImagesSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, "至少需要上傳一張圖片")
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "每張圖片大小不能超過 5MB"
    )
    .refine((files) => files.every((file) => file.type.startsWith("image/")), "只能上傳圖片檔案"),
});
