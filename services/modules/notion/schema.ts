import { z } from 'zod';

// Notion 基本屬性定義
export const notionPropertySchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
});

// Notion 多選屬性定義
export const notionMultiSelectSchema = notionPropertySchema.extend({
  multi_select: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .optional(),
});

// Notion 標題屬性定義
export const notionTitleSchema = notionPropertySchema.extend({
  title: z
    .array(
      z.object({
        type: z.string().optional(),
        text: z
          .object({
            content: z.string().optional(),
            link: z.any().nullable(),
          })
          .optional(),
        annotations: z
          .object({
            bold: z.boolean().optional(),
            italic: z.boolean().optional(),
            strikethrough: z.boolean().optional(),
            underline: z.boolean().optional(),
            code: z.boolean().optional(),
            color: z.string().optional(),
          })
          .optional(),
        plain_text: z.string().optional(),
        href: z.any().nullable(),
      })
    )
    .optional(),
});

// Notion 豐富文字屬性定義
export const notionRichTextSchema = notionPropertySchema.extend({
  rich_text: z
    .array(
      z.object({
        type: z.string().optional(),
        text: z
          .object({
            content: z.string().optional(),
            link: z.any().nullable(),
          })
          .optional(),
        annotations: z
          .object({
            bold: z.boolean().optional(),
            italic: z.boolean().optional(),
            strikethrough: z.boolean().optional(),
            underline: z.boolean().optional(),
            code: z.boolean().optional(),
            color: z.string().optional(),
          })
          .optional(),
        plain_text: z.string().optional(),
        href: z.any().nullable(),
      })
    )
    .optional(),
});

// Notion 頁面物件定義
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

// 匯出類型定義
export type NotionPropertySchema = z.infer<typeof notionPropertySchema>;
export type NotionMultiSelectSchema = z.infer<typeof notionMultiSelectSchema>;
export type NotionTitleSchema = z.infer<typeof notionTitleSchema>;
export type NotionRichTextSchema = z.infer<typeof notionRichTextSchema>;
export type NotionPageSchema = z.infer<typeof notionPageSchema>;
export type NotionDatabaseResultSchema = z.infer<
  typeof notionDatabaseResultSchema
>;
