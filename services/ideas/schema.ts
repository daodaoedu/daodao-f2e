import { z } from 'zod';
import { baseUserSchema } from '@/services/_shared/schema';

// 自定義 URL 驗證
const httpsUrl = z.string().url().refine(
  (url) => url.startsWith("https://"),
  { message: "URL 必須以 https:// 開頭" }
);

// Idea Resource Schema - 想法相關資源
export const ideaResourceSchema = z.object({
  name: z.string().min(1, '請輸入資源名稱'),
  url: httpsUrl,
});

export type IdeaResourceSchema = z.infer<typeof ideaResourceSchema>;

// ========================================
// 基礎實體類型 (Entity Types)
// ========================================

// 核心 Idea Schema - 完整的實體類型
export const ideaSchema = z.object({
  id: z.string(),
  content: z.string(),
  user: baseUserSchema,
  visibility: z.enum(['public', 'private']),
  status: z.enum(['active', 'draft', 'archived']),
  tags: z.array(z.string()),
  imageUrls: z.array(z.string()),
  videoUrls: z.array(z.string()),
  ideaResources: z.array(ideaResourceSchema),
  likeCount: z.number(),
  commentCount: z.number(),
  viewCount: z.number(),
  shareCount: z.number(),
  isLiked: z.boolean(),
  createdDate: z.string(),
  updatedDate: z.string(),
});

export type IdeaSchema = z.infer<typeof ideaSchema>;

// ========================================
// 表單類型 (Form Types) - 前端專用
// ========================================

// 創建表單類型 (前端專用)
export const createIdeaFormSchema = z.object({
  content: z.string().min(1, '請輸入內容').max(5000, '內容不能超過5000字'),
  visibility: z.enum(['public', 'private']),
  tags: z.array(z.string()),
  ideaResources: z.array(ideaResourceSchema),
  imageFiles: z.array(z.instanceof(File)).nullable().optional(),
  videoFiles: z.array(z.instanceof(File)).nullable().optional(),
});

export type CreateIdeaFormSchema = z.infer<typeof createIdeaFormSchema>;

// 更新表單類型 (前端專用)
export const updateIdeaFormSchema = createIdeaFormSchema.extend({
  id: z.string(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
});

export type UpdateIdeaFormSchema = z.infer<typeof updateIdeaFormSchema>;

// ========================================
// API 請求/響應類型 (API Types)
// ========================================

// API 創建請求類型
export const createIdeaRequestSchema = z.object({
  content: z.string(),
  visibility: z.enum(['public', 'private']),
  tags: z.array(z.string()),
  ideaResources: z.array(ideaResourceSchema),
  imageUrls: z.array(z.string()), // 由檔案上傳轉換而來
  videoUrls: z.array(z.string()),
});

export type CreateIdeaRequestSchema = z.infer<typeof createIdeaRequestSchema>;

// API 更新請求類型
export const updateIdeaRequestSchema = createIdeaRequestSchema.extend({
  id: z.string(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
});

export type UpdateIdeaRequestSchema = z.infer<typeof updateIdeaRequestSchema>;

// Delete Idea Schema
export const deleteIdeaSchema = z.object({
  id: z.string(),
});

export type DeleteIdeaSchema = z.infer<typeof deleteIdeaSchema>;

// Idea Search Parameters Schema
export const ideaSearchParamsSchema = z.object({
  search: z.string().optional(),
  tags: z.string().optional(), // 逗號分隔的標籤字串
  visibility: z.enum(['public', 'private', 'all']).optional().default('public'),
  sortBy: z.enum(['createdDate', 'updatedDate', 'likeCount']).optional().default('createdDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  userId: z.string().optional(),
});

export type IdeaSearchParamsSchema = z.infer<typeof ideaSearchParamsSchema>;

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  totalCount: z.number().min(0),
  totalPages: z.number().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;

// Idea List Response Schema
export const ideaListResponseSchema = z.object({
  ideas: z.array(ideaSchema),
  pagination: paginationSchema,
});

export type IdeaListResponseSchema = z.infer<typeof ideaListResponseSchema>;

// Idea Detail Response Schema
export const ideaDetailResponseSchema = ideaSchema;

export type IdeaDetailResponseSchema = z.infer<typeof ideaDetailResponseSchema>;

// Idea Mutation Response Schema
export const ideaMutationResponseSchema = z.object({
  success: z.boolean(),
  data: ideaSchema.optional(),
  message: z.string().optional(),
});

export type IdeaMutationResponseSchema = z.infer<typeof ideaMutationResponseSchema>;

// JSON-LD 相關 Schema (用於 SEO)
export const ideaJsonLdSchema = z.object({
  "@type": z.literal("CreativeWork"),
  name: z.string(),
  description: z.string(),
  author: z.object({
    "@type": z.literal("Person"),
    name: z.string(),
    image: z.string().optional(),
  }),
  dateCreated: z.string(),
  dateModified: z.string(),
  interactionStatistic: z.array(z.object({
    "@type": z.literal("InteractionCounter"),
    interactionType: z.string(),
    userInteractionCount: z.number(),
  })).optional(),
  keywords: z.array(z.string()).optional(),
  url: z.string().url().optional(),
});

export type IdeaJsonLdSchema = z.infer<typeof ideaJsonLdSchema>;
