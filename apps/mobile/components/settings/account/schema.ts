import { z } from "zod";
import { EDUCATION_STAGE_OPTIONS } from "@/constants/education-stage";
import { AVAILABLE_FIELDS } from "@/constants/professional-fields";
import { ROLE_OPTIONS } from "@/constants/user-role";

// Re-export constants for convenience
export { AVAILABLE_FIELDS, EDUCATION_STAGE_OPTIONS, ROLE_OPTIONS };

// Date utilities (native JS implementation)
const differenceInYears = (dateA: Date, dateB: Date): number => {
  const diffMs = dateA.getTime() - dateB.getTime();
  const diffDate = new Date(diffMs);
  return Math.abs(diffDate.getUTCFullYear() - 1970);
};

// Form Schema
export const createAccountFormSchema = (
  t: (key: string, values?: Record<string, string | number>) => string
) =>
  z.object({
    email: z.string().email(),
    birthday: z
      .date()
      .refine(
        (date) => {
          const age = differenceInYears(new Date(), date);
          return age >= 16;
        },
        { message: t("birthday_age_requirement") }
      )
      .optional(),
    role: z.string().min(1, t("role_placeholder")),
    educationStage: z.string().min(1, t("education_stage_placeholder")),
    professionalFields: z
      .array(z.string())
      .max(5, t("professional_field_max_selection", { count: 5 }))
      .default([]),
    explorationFields: z
      .array(z.string())
      .max(5, t("exploration_field_max_selection", { count: 5 }))
      .default([]),
  });

export const accountFormSchema = createAccountFormSchema((key, values) => {
  if (!values) return key;
  return Object.entries(values).reduce(
    (result, [valueKey, value]) => result.replaceAll(`{${valueKey}}`, String(value)),
    key
  );
});

export type AccountFormValuesType = z.infer<typeof accountFormSchema>;
