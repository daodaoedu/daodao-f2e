import { z } from 'zod';
import { baseUserSchema } from '../users';

export const circleQuerySchema = z.object({
  area: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  activityCategory: z.array(z.string()).optional(),
  partnerEducationStep: z.array(z.string()).optional(),
  isGrouping: z.boolean().optional(),
  search: z.string().optional(),
});

export type CircleQuerySchema = z.infer<typeof circleQuerySchema>;

export const userSchema = z
  .object({
    email: z.string(),
    userId: z.string(),
  })
  .extend(baseUserSchema.shape);

export const circleSchema = z.object({
  _id: z.string().optional(),
  user: userSchema,
  title: z.string().min(1, '請輸入標題').max(50, '請勿輸入超過 50 字'),
  photoURL: z.string().or(z.instanceof(Blob)),
  photoAlt: z.string(),
  activityCategory: z.array(z.string()),
  category: z.array(z.string()).min(1, '請選擇學習領域'),
  participator: z
    .string()
    .regex(/^(100|[1-9]\d|[1-9])$/, '請輸入整數，需大於 0，不可超過 100')
    .or(z.number().min(1).max(100)),
  area: z.array(z.string()).min(1, '請選擇地點'),
  time: z.string().max(50, '請勿輸入超過 50 字'),
  partnerStyle: z
    .string()
    .max(50, '請勿輸入超過 50 字')
    .min(1, '請輸入想找的夥伴類型'),
  partnerEducationStep: z.array(z.string()).min(1, '請選擇適合的教育階段'),
  motivation: z.string().max(50, '請勿輸入超過 50 字').min(1, '請輸入揪團動機'),
  content: z
    .string()
    .min(1, '請輸入揪團內容與運作方式')
    .max(2000, '請勿輸入超過 2000 字'),
  outcome: z.string().max(50, '請勿輸入超過 50 字').min(1, '請輸入期待成果'),
  notice: z.string().min(1, '請輸入注意事項').max(2000, '請勿輸入超過 2000 字'),
  deadline: z.any(),
  isNeedDeadline: z.boolean(),
  tagList: z.array(z.string()),
  isGrouping: z.boolean(),
  createdDate: z.string().optional(),
  updatedDate: z.string().optional(),
  /** @deprecated 不再使用，請使用 content 代替 */
  description: z.string().optional(),
});

export type CircleSchema = z.infer<typeof circleSchema>;

export const createCircleSchema = circleSchema.omit({
  _id: true,
  createdDate: true,
  updatedDate: true,
  description: true,
});

export type CreateCircleSchema = z.infer<typeof createCircleSchema>;

export const updateCircleSchema = circleSchema.omit({
  createdDate: true,
  updatedDate: true,
  description: true,
});

export type UpdateCircleSchema = z.infer<typeof updateCircleSchema>;
