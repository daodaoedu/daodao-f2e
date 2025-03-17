import { z } from 'zod';

const projectOutcomeSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  title: z.string(),
  week: z.number(),
  date: z.string().date(),
  content: z.string(),
  imgUrls: z.array(z.string()).nullable(),
  imgFiles: z.array(z.instanceof(File)).nullable().optional(),
  videoUrls: z.array(z.string()).nullable().optional(),
});

export type ProjectOutcomeSchema = z.infer<typeof projectOutcomeSchema>;

export const createProjectOutcomeSchema = projectOutcomeSchema.omit({
  id: true,
});

export type CreateProjectOutcomeSchema = z.infer<
  typeof createProjectOutcomeSchema
>;

export const updateProjectOutcomeSchema = projectOutcomeSchema;

export type UpdateProjectOutcomeSchema = z.infer<
  typeof updateProjectOutcomeSchema
>;
