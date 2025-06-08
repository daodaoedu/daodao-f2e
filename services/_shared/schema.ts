import { z } from "zod";

export const baseUserSchema = z.object({
  _id: z.string(),
  id: z.string(),
  name: z.string(),
  roleList: z.array(z.string()),
  photoURL: z.string(),
});

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export const cursorsSchema = z.object({
  limit: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
  nextCursor: z.string().nullable(),
  prevCursor: z.string().nullable(),
  totalEstimate: z.number(),
});
