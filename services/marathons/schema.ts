import { z } from 'zod';

export const marathonSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, '請輸入標題'),
  eventId: z.string().default('2025S1'),
  userId: z.string().optional(),
  description: z.string().optional(),
  motivation: z.object({
    tags: z.array(z.string()),
    description: z.string(),
  }),
  content: z.string(),
  goals: z.string(),
  strategies: z.object({
    tags: z.array(z.string()),
    description: z.string(),
  }),
  resources: z.array(z.any()),
  milestones: z.array(z.any()),
  outcomes: z.object({
    tags: z.array(z.string()),
    description: z.string(),
  }),
  status: z.string().default('Ongoing'),
  registrationStatus: z.string().default('Open'),
  registrationDate: z.string().optional(),
  pricing: z.object({
    option: z.string().default('優惠價：8000 元'),
    price: z.number().default(0),
    email: z.array(z.string()),
    file: z.string(),
  }),
  isPublic: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type MarathonSchema = z.infer<typeof marathonSchema>;

export const createMarathonSchema = marathonSchema.omit({
  _id: true,
});

export type CreateMarathonSchema = z.infer<typeof createMarathonSchema>;

export const updateMarathonSchema = marathonSchema;

export type UpdateMarathonSchema = z.infer<typeof updateMarathonSchema>;

export const marathonQuerySchema = z.object({
  userId: z.string().optional(),
  eventId: z.string().optional(),
});

export type MarathonQuerySchema = z.infer<typeof marathonQuerySchema>;
