import { z } from 'zod';

const projectNoteSchema = z.object({
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

export const projectNoteFormSchema = projectNoteSchema.omit({
  id: true,
  projectId: true,
});

export type ProjectNoteSchema = z.infer<typeof projectNoteSchema>;
export type ProjectNoteFormSchema = z.infer<typeof projectNoteFormSchema>;
