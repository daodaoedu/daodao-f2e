import { z } from 'zod';

export const facebookGroupPostSchema = z.object({
  created_time: z.string().optional(),
  message: z.string().optional(),
  id: z.string().optional(),
});

export type FacebookGroupPostSchema = z.infer<typeof facebookGroupPostSchema>;

export const facebookFanpagePostSchema = z.object({
  created_time: z.string().optional(),
  message: z.string().optional(),
  id: z.string().optional(),
});

export type FacebookFanpagePostSchema = z.infer<typeof facebookFanpagePostSchema>;

export const instagramPostSchema = z.object({
  id: z.string().optional(),
  media_type: z.string().optional(),
  media_url: z.string().optional(),
  permalink: z.string().optional(),
  timestamp: z.string().optional(),
  like_count: z.number().optional(),
  caption: z.string().optional(),
});

export type InstagramPostSchema = z.infer<typeof instagramPostSchema>;

export const instagramStorySchema = z.object({
  id: z.string().optional(),
  media_type: z.string().optional(),
  media_url: z.string().optional(),
  permalink: z.string().optional(),
  timestamp: z.string().optional(),
  like_count: z.number().optional(),
  caption: z.string().optional(),
});

export type InstagramStorySchema = z.infer<typeof instagramStorySchema>;
