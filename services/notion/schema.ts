import { z } from 'zod';

export interface SearchResultsQuery {
  q?: string;
  tags?: string | string[];
  cats?: string | string[];
  ages?: string | string[];
  fee?: string;
  filter?: unknown;
  page_size?: number;
}

export const notionPagePropertiesSchema = z.object({
  資源類型: z
    .object({
      id: z.string(),
      type: z.literal('multi_select'),
      multi_select: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        })
      ),
    })
    .optional(),
  創建者: z
    .object({
      id: z.string(),
      type: z.literal('multi_select'),
      multi_select: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        })
      ),
    })
    .optional(),
  縮圖: z
    .object({
      id: z.string(),
      type: z.literal('files'),
      files: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          external: z
            .object({
              url: z.string(),
            })
            .optional(),
        })
      ),
    })
    .optional(),
  領域名稱: z
    .object({
      id: z.string(),
      type: z.literal('multi_select'),
      multi_select: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        })
      ),
    })
    .optional(),
  補充資源: z
    .object({
      id: z.string(),
      type: z.literal('rich_text'),
      rich_text: z.array(z.any()),
    })
    .optional(),
  連結: z
    .object({
      id: z.string(),
      type: z.literal('url'),
      url: z.string().nullable(),
    })
    .optional(),
  費用: z
    .object({
      id: z.string(),
      type: z.literal('select'),
      select: z
        .object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        })
        .nullable(),
    })
    .optional(),
  影片: z
    .object({
      id: z.string(),
      type: z.literal('url'),
      url: z.string().nullable(),
    })
    .optional(),
  介紹: z
    .object({
      id: z.string(),
      type: z.literal('rich_text'),
      rich_text: z.array(
        z.object({
          type: z.string(),
          text: z.object({
            content: z.string(),
            link: z
              .object({
                url: z.string(),
              })
              .nullable(),
          }),
          annotations: z.object({
            bold: z.boolean(),
            italic: z.boolean(),
            strikethrough: z.boolean(),
            underline: z.boolean(),
            code: z.boolean(),
            color: z.string(),
          }),
          plain_text: z.string(),
          href: z.string().nullable(),
        })
      ),
    })
    .optional(),
  標籤: z
    .object({
      id: z.string(),
      type: z.literal('multi_select'),
      multi_select: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        })
      ),
    })
    .optional(),
  地區: z
    .object({
      id: z.string(),
      type: z.literal('multi_select'),
      multi_select: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        })
      ),
    })
    .optional(),
  年齡層: z
    .object({
      id: z.string(),
      type: z.literal('multi_select'),
      multi_select: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        })
      ),
    })
    .optional(),
  資源名稱: z
    .object({
      id: z.literal('title'),
      type: z.literal('title'),
      title: z.array(
        z.object({
          type: z.string(),
          text: z.object({
            content: z.string(),
            link: z.any().nullable(),
          }),
          annotations: z.object({
            bold: z.boolean(),
            italic: z.boolean(),
            strikethrough: z.boolean(),
            underline: z.boolean(),
            code: z.boolean(),
            color: z.string(),
          }),
          plain_text: z.string(),
          href: z.string().nullable(),
        })
      ),
    })
    .optional(),
});

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
  properties: notionPagePropertiesSchema,
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

export type NotionPageSchema = z.infer<typeof notionPageSchema>;

export type NotionDatabaseResultSchema = z.infer<
  typeof notionDatabaseResultSchema
>;
