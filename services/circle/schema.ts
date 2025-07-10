import { z } from "zod";
import { baseUserSchema, paginationSchema } from "../_shared/schema";

const arrayOrString = z
  .array(z.string())
  .or(z.string())
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
  });

export const circleSearchParamsSchema = z.object({
  area: arrayOrString,
  category: arrayOrString,
  activityCategory: arrayOrString,
  partnerEducationStep: arrayOrString,
  isGrouping: z
    .boolean()
    .or(z.string())
    .optional()
    .transform((value) => {
      if (value?.toString() === "false") return false;
      return undefined;
    }),
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export const circleSchema = z.object({
  _id: z.string(),
  user: baseUserSchema.extend({
    email: z.string(),
    userId: z.string(),
  }),
  title: z.string().min(1, "請輸入標題").max(50, "請勿輸入超過 50 字"),
  photoURL: z.string(),
  photoAlt: z.string(),
  activityCategory: z.array(z.string()),
  category: z.array(z.string()).min(1, "請選擇學習領域"),
  participator: z
    .string()
    .regex(/^(100|[1-9]\d|[1-9])$/, "請輸入整數，需大於 0，不可超過 100")
    .or(z.number().min(1).max(100)),
  area: z.array(z.string()).min(1, "請選擇地點"),
  time: z.string().max(50, "請勿輸入超過 50 字"),
  partnerStyle: z
    .string()
    .max(50, "請勿輸入超過 50 字")
    .min(1, "請輸入想找的夥伴類型"),
  partnerEducationStep: z.array(z.string()).min(1, "請選擇適合的教育階段"),
  motivation: z.string().max(50, "請勿輸入超過 50 字").min(1, "請輸入揪團動機"),
  content: z
    .string()
    .min(1, "請輸入揪團內容與運作方式")
    .max(2000, "請勿輸入超過 2000 字"),
  outcome: z.string().max(50, "請勿輸入超過 50 字").min(1, "請輸入期待成果"),
  notice: z.string().min(1, "請輸入注意事項").max(2000, "請勿輸入超過 2000 字"),
  deadline: z.any(),
  isNeedDeadline: z.boolean(),
  tagList: z.array(z.string()),
  isGrouping: z.boolean(),
  createdDate: z.string(),
  updatedDate: z.string(),
  /** @deprecated 不再使用，請使用 content 代替 */
  description: z.string().optional(),
});

export const circleListResponseSchema = z
  .object({
    data: z.array(circleSchema),
  })
  .extend(paginationSchema.shape);

export const circleDetailResponseSchema = z.object({
  data: z.array(circleSchema),
});

export const circleFormSchema = circleSchema.omit({
  _id: true,
  createdDate: true,
  updatedDate: true,
});

export type CircleSchema = z.infer<typeof circleSchema>;
export type CircleFormSchema = z.infer<typeof circleFormSchema>;
export type CircleListResponseSchema = z.infer<typeof circleListResponseSchema>;
export type CircleDetailResponseSchema = z.infer<
  typeof circleDetailResponseSchema
>;
export type CircleSearchParamsSchema = z.infer<typeof circleSearchParamsSchema>;
