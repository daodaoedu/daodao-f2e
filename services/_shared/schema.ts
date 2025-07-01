import { z } from "zod";

export { baseUserSchema, type BaseUserSchema } from "../users/schema";

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export const cursorsSchema = z.object({
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
});
