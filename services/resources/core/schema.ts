import { z } from "zod";
import { baseUserSchema, cursorsSchema } from "@/services/_shared/schema";
import {
  resourceReviewSchema,
  recentResourceReviewSchema,
  resourceReviewFormSchema,
} from "../reviews/schema";

const httpsUrl = z
  .string()
  .url({ message: "請輸入正確的網址" })
  .refine((url) => url.startsWith("https://"), {
    message: "網址必須 https:// 開頭",
  });

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "請輸入資源名稱"),
  url: httpsUrl,
  imageUrl: httpsUrl.optional().nullable(),
  description: z.string().min(1, "請輸入資源描述"),
  videoUrl: httpsUrl.optional().nullable(),
  type: z.string(),
  level: z.string(),
  cost: z.string(),
  status: z.string(),
  viewCount: z.number(),
  favoriteCount: z.number(),
  shareCount: z.number(),
  reviewCount: z.number(),
  avgRating: z.number().optional().nullable(),
  majorCategory: z.string(),
  subCategory: z.string().optional().nullable(), // 資料有可能沒有 subCategory
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string()),
  user: baseUserSchema.extend({
    selfIntroduction: z.string(),
    educationStage: z.string(),
    tagList: z.array(z.string()),
  }),
});

export const resourceListResponseSchema = z.object({
  resources: z.array(resourceSchema),
  pagination: cursorsSchema.extend({
    totalEstimate: z.number(),
  }),
});

export const resourceDetailResponseSchema = resourceSchema.extend({
  recentReviews: z.array(recentResourceReviewSchema).optional(),
});

export const resourceFormSchema = resourceSchema
  .pick({
    name: true,
    url: true,
    imageUrl: true,
    description: true,
    videoUrl: true,
    type: true,
    level: true,
    cost: true,
    majorCategory: true,
    subCategory: true,
    tags: true,
  })
  .extend({
    review: resourceReviewFormSchema.optional(),
  });

export const resourceMutationResponseSchema = z.object({
  resource: resourceSchema,
  review: resourceReviewSchema.optional(),
});

export const resourceSearchParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  type: z.string().optional(),
  cost: z.string().optional(),
  level: z.string().optional(),
  majorCategory: z.string().optional(),
  subCategory: z.string().optional(),
  tags: z.string().optional(),
  sort: z.enum(["createdAt", "updatedAt", "rating", "viewCount"]).optional(),
  order: z.enum(["desc", "asc"]).optional(),
  query: z.string().optional(),
});

export type ResourceSchema = z.infer<typeof resourceSchema>;

export type ResourceListResponseSchema = {
  data: z.infer<typeof resourceListResponseSchema>;
};

export type ResourceDetailResponseSchema = {
  data: z.infer<typeof resourceDetailResponseSchema>;
};

export type ResourceFormSchema = z.infer<typeof resourceFormSchema>;

export type ResourceMutationResponseSchema = z.infer<
  typeof resourceMutationResponseSchema
>;

export type ResourceSearchParamsSchema = z.infer<
  typeof resourceSearchParamsSchema
>;
