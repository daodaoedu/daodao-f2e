import { z } from 'zod';

// Idea Resource Schema
export const ideaResourceSchema = z.object({
  name: z.string().min(1, '請輸入資源名稱'),
  url: z.string().url('請輸入有效的網址格式'),
});

export type IdeaResourceSchema = z.infer<typeof ideaResourceSchema>;

// Main Idea Schema
export const ideaSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '請輸入標題'),
  content: z.string().min(1, '請輸入內容'),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
  imageUrls: z.array(z.string()).default([]),
  videoUrls: z.array(z.string()).default([]),
  visibility: z.enum(['public', 'private']).default('public'),
  isLiked: z.boolean().default(false),
  likeCount: z.number().default(0),
  commentCount: z.number().default(0),
  viewCount: z.number().default(0),
  shareCount: z.number().default(0),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  createdDate: z.string(),
  updatedDate: z.string(),
  ideaResources: z.array(ideaResourceSchema).default([]),
});

export type IdeaSchema = z.infer<typeof ideaSchema>;

// Create Idea Schema - 移除系統生成的欄位
export const createIdeaSchema = ideaSchema.omit({
  id: true,
  authorId: true,
  authorName: true,
  authorAvatar: true,
  isLiked: true,
  likeCount: true,
  commentCount: true,
  viewCount: true,
  shareCount: true,
  status: true,
  createdDate: true,
  updatedDate: true,
}).extend({
  imageFiles: z.array(z.instanceof(File)).nullable().optional(),
  videoFiles: z.array(z.instanceof(File)).nullable().optional(),
});

export type CreateIdeaSchema = z.infer<typeof createIdeaSchema>;

// Update Idea Schema - 保留id但移除系統欄位
export const updateIdeaSchema = ideaSchema.omit({
  authorId: true,
  authorName: true,
  authorAvatar: true,
  isLiked: true,
  likeCount: true,
  commentCount: true,
  viewCount: true,
  shareCount: true,
  createdDate: true,
  updatedDate: true,
}).extend({
  imageFiles: z.array(z.instanceof(File)).nullable().optional(),
  videoFiles: z.array(z.instanceof(File)).nullable().optional(),
});

export type UpdateIdeaSchema = z.infer<typeof updateIdeaSchema>;

// Delete Idea Schema - 只需要id
export const deleteIdeaSchema = ideaSchema.pick({
  id: true,
});

export type DeleteIdeaSchema = z.infer<typeof deleteIdeaSchema>;

// Idea Query Schema - 用於搜尋和篩選
export const ideaQuerySchema = z.object({
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'all']).optional().default('public'),
  sortBy: z.enum(['createdDate', 'updatedDate', 'likeCount', 'title']).optional().default('createdDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type IdeaQuerySchema = z.infer<typeof ideaQuerySchema>;

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;

// Idea List Response Schema
export const ideaListResponseSchema = z.object({
  data: z.array(ideaSchema),
  pagination: paginationSchema,
});

export type IdeaListResponseSchema = z.infer<typeof ideaListResponseSchema>;
