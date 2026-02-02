import { z } from "zod";

export { type BaseUserSchema, baseUserSchema } from "../users/schema";

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export const cursorsSchema = z.object({
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
  limit: z.number(),
  nextCursor: z.string().nullable(),
  parentTotalEstimate: z.number().nullable(),
  prevCursor: z.string().nullable(),
  totalEstimate: z.number(),
});
