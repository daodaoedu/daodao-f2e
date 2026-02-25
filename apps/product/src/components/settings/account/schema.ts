import { differenceInYears } from "date-fns";
import { z } from "zod";
import { EDUCATION_STAGE_OPTIONS } from "@/constants/education-stage";
import { INTEREST_CATEGORIES } from "@/constants/interest-categories";
import { AVAILABLE_FIELDS } from "@/constants/professional-fields";
import { POSITION_OPTIONS } from "@/constants/user-position";

// Re-export constants for convenience
export { AVAILABLE_FIELDS, EDUCATION_STAGE_OPTIONS, INTEREST_CATEGORIES, POSITION_OPTIONS };

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
  position: z.array(z.string()).min(1, "請至少選擇一個身份").default([]),
  educationStage: z.string().min(1, "請選擇教育階段"),
  professionalFields: z.array(z.string()).max(5, "最多只能選擇5個專業領域").default([]),
  explorationFields: z.array(z.string()).max(5, "最多只能選擇5個探索領域").default([]),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
