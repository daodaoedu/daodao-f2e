import { z } from "zod";
import { isValid, differenceInDays } from "date-fns";
import { projectTaskSchema } from "../tasks";

export const projectMilestoneSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  position: z
    .number()
    .optional()
    .transform((val) =>
      typeof val === "number" && Number.isInteger(val) && val > 0 ? val : 1000
    ),
  name: z.string().min(1, "請輸入名稱"),
  startDate: z
    .string()
    .optional()
    .refine((val) => val !== undefined && isValid(new Date(val)), {
      message: "請輸入有效的日期",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => val !== undefined && isValid(new Date(val)), {
      message: "請輸入有效的日期",
    }),
  isCompleted: z.boolean(),
  isDeleted: z.boolean(),
  tasks: z.array(projectTaskSchema),
});

const validateDateRange = (
  startDate: string | undefined,
  endDate: string | undefined,
  ctx: z.RefinementCtx
) => {
  if (!startDate || !endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "請輸入日期",
    });
    return;
  }
  if (differenceInDays(new Date(endDate), new Date(startDate)) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "時間間隔不能小於 1 天",
    });
  }
};

export const projectMilestoneFormSchema = projectMilestoneSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isDeleted: true,
    tasks: true,
  })
  .superRefine((data, ctx) =>
    validateDateRange(data.startDate, data.endDate, ctx)
  );

export type ProjectMilestoneSchema = z.infer<typeof projectMilestoneSchema>;
export type ProjectMilestoneFormSchema = z.infer<
  typeof projectMilestoneFormSchema
>;
