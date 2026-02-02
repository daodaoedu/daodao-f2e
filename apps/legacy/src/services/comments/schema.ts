import { z } from "zod";
import type { BaseUserSchema } from "../_shared/schema";

export enum CommentType {
  Note = "note",
  Outcome = "outcome",
  Review = "review",
  Idea = "idea",
  Resource = "resource",
  ResourceReview = "resource-review",
  Practice = "practice",
  Project = "project",
}

export enum CommentVisibility {
  Public = "public",
  Private = "private",
}

const baseCommentSchema = z.object({
  id: z.number(),
  content: z.string(),
  visibility: z.nativeEnum(CommentVisibility),
  parentId: z.number().nullable().optional(),
  user: z.custom<BaseUserSchema>(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CommentSchema = z.infer<typeof baseCommentSchema> & {
  replies: CommentSchema[];
};

export const createCommentSchema = baseCommentSchema
  .extend({
    targetType: z.nativeEnum(CommentType),
    targetId: z.string(),
  })
  .omit({
    id: true,
    user: true,
    createdAt: true,
    updatedAt: true,
  });

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = baseCommentSchema.omit({
  parentId: true,
  user: true,
  createdAt: true,
  updatedAt: true,
});

export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>;
