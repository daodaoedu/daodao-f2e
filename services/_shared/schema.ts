import { z } from "zod";

export const baseUserSchema = z.object({
  _id: z.string(),
  id: z.string(),
  name: z.string().optional(),
  roleList: z
    .array(z.string(), { required_error: "請選擇角色" })
    .min(1, "請選擇角色"),
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
