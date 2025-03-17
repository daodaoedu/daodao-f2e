import { z } from 'zod';

const imageType = /image.*/;
const maxKB = 500;
const maxSize = maxKB * 1024;

const imageSchema = z
  .instanceof(File)
  .refine((file) => file.type.match(imageType), {
    message: `僅支援上傳圖片唷！`,
  })
  .refine((file) => file.size <= maxSize, {
    message: `圖片最大限制 ${maxKB} KB`,
  });

export const uploadImagesSchema = z.object({
  files: imageSchema.array().max(5, { message: '最多只能上傳 5 張圖片唷！' }),
});

export type UploadImagesSchema = z.infer<typeof uploadImagesSchema>;
