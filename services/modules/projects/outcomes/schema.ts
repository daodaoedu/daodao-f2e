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

export const projectOutcomeFormSchema = projectOutcomeSchema.omit({
  id: true,
  projectId: true,
});

export type ProjectOutcomeSchema = z.infer<typeof projectOutcomeSchema>;
export type ProjectOutcomeFormSchema = z.infer<typeof projectOutcomeFormSchema>;
