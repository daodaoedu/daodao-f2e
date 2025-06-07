import { z } from "zod";

export const baseUserSchema = z.object({
  _id: z.string(),
  id: z.string(),
  name: z.string(),
  roleList: z.array(z.string()),
  photoURL: z.string(),
});
