import { differenceInYears } from "date-fns";
import { z } from "zod";
import { EDUCATION_STAGE_OPTIONS } from "../../../constants/education-stage";
import { AVAILABLE_FIELDS } from "../../../constants/professional-fields";
import { ROLE_OPTIONS } from "../../../constants/user-role";

// Re-export constants for convenience
export { AVAILABLE_FIELDS, EDUCATION_STAGE_OPTIONS, ROLE_OPTIONS };

// Form Schema
export const accountFormSchema = z.object({
  email: z.string().email(),
  birthday: z
    .date()
    .refine(
      (date) => {
        const age = differenceInYears(new Date(), date);
        return age >= 16;
      },
      { message: "必須年滿16歲" }
    )
    .optional(),
  role: z.string().min(1, "請選擇身份"),
  educationStage: z.string().min(1, "請選擇教育階段"),
  professionalFields: z.array(z.string()).max(5, "最多只能選擇5個專業領域").default([]),
  explorationFields: z.array(z.string()).max(5, "最多只能選擇5個探索領域").default([]),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
