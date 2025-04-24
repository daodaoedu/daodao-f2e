import { z } from 'zod';

export const notionPageSchema = z.object({
  object: z.literal('page').optional(),
  id: z.string().optional(),
  created_time: z.string().optional(),
  last_edited_time: z.string().optional(),
  created_by: z
    .object({
      object: z.string().optional(),
      id: z.string().optional(),
    })
    .optional(),
  last_edited_by: z
    .object({
      object: z.string().optional(),
      id: z.string().optional(),
    })
    .optional(),
  cover: z.any().nullable(),
  icon: z.any().nullable(),
  parent: z
    .object({
      type: z.string().optional(),
      database_id: z.string().optional(),
    })
    .optional(),
  archived: z.boolean().optional(),
  properties: z.record(z.any()).optional(),
  url: z.string().optional(),
});

// Notion 資料庫結果定義
export const notionDatabaseResultSchema = z.object({
  object: z.literal('list').optional(),
  results: z.array(notionPageSchema).optional(),
  next_cursor: z.string().nullable(),
  has_more: z.boolean().optional(),
  sponsorResults: z.array(notionPageSchema).optional(),
});

export type NotionDatabaseResultSchema = z.infer<
  typeof notionDatabaseResultSchema
>;
