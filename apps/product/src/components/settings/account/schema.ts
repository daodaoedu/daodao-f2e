import { differenceInYears } from "date-fns";
import { z } from "zod";
import type { useTranslations } from "@daodao/i18n";
import { EDUCATION_STAGE_OPTIONS } from "@/constants/education-stage";
import { INTEREST_CATEGORIES } from "@/constants/interest-categories";
import { AVAILABLE_FIELDS } from "@/constants/professional-fields";
import { POSITION_OPTIONS } from "@/constants/user-position";

// Re-export constants for convenience
export { AVAILABLE_FIELDS, EDUCATION_STAGE_OPTIONS, INTEREST_CATEGORIES, POSITION_OPTIONS };

type TFunction = ReturnType<typeof useTranslations<"account_settings">>;

// Form Schema
export const createAccountFormSchema = (t?: TFunction) => {
  const msg = (key: string, params?: Record<string, string | number>) => {
    if (t) return t(key as Parameters<TFunction>[0], params as never);
    return key;
  };

  return z.object({
    email: z.string().email(),
    birthday: z
      .date()
      .refine(
        (date) => {
          const age = differenceInYears(new Date(), date);
          return age >= 16;
        },
        { message: msg("validation_birthdate_age") }
      )
      .optional(),
    position: z.array(z.string()).min(1, msg("validation_position_required")).default([]),
    educationStage: z.string().min(1, msg("validation_education_stage_required")),
    professionalFields: z
      .array(z.string())
      .max(5, msg("validation_professional_fields_max", { max: 5 }))
      .default([]),
    explorationFields: z
      .array(z.string())
      .max(5, msg("validation_exploration_fields_max", { max: 5 }))
      .default([]),
  });
};

export const accountFormSchema = createAccountFormSchema();

export type AccountFormValues = z.infer<typeof accountFormSchema>;
