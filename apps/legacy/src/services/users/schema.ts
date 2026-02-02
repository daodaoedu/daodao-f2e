import { z } from "zod";

export const baseUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  photoURL: z.string(),
  roleList: z.array(z.string()),
});

export type BaseUserSchema = z.infer<typeof baseUserSchema>;
