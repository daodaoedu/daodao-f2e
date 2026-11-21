import type { useTranslations } from "@daodao/i18n";
import { z } from "zod";
import { MoodType, type MoodType as MoodTypeValue } from "@/constants/mood";
import {
  CHECK_IN_ACTION_OBSERVATION_CHARACTER_LIMIT,
  CHECK_IN_ACTION_OBSERVATION_WORD_LIMIT,
  CHECK_IN_NEXT_STEP_WORD_LIMIT,
  countCheckInWords,
} from "./description-answers";

const ALL_MOOD_TYPES = Object.values(MoodType) as [MoodTypeValue, ...MoodTypeValue[]];

type TFunction = ReturnType<typeof useTranslations<"check_in">>;

/**
 * 打卡表單驗證 schema（Phase 1：標籤、描述、媒體）
 */
export const createCheckInFormSchema = (t?: TFunction, locale = "zh-TW") => {
  const msg = (key: string, params?: Record<string, string | number>) => {
    if (t) return t(key as Parameters<TFunction>[0], params as never);
    return key;
  };

  const actionObservationSchema = z
    .string()
    .trim()
    .min(1, msg("validation_description_required"));
  const localizedActionObservationSchema =
    locale === "en"
      ? actionObservationSchema.superRefine((value, context) => {
          if (countCheckInWords(value, locale) > CHECK_IN_ACTION_OBSERVATION_WORD_LIMIT) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: msg("validation_description_word_max", {
                max: CHECK_IN_ACTION_OBSERVATION_WORD_LIMIT,
              }),
            });
          }
        })
      : actionObservationSchema.max(
          CHECK_IN_ACTION_OBSERVATION_CHARACTER_LIMIT,
          msg("validation_description_max", {
            max: CHECK_IN_ACTION_OBSERVATION_CHARACTER_LIMIT,
          })
        );

  return z.object({
    mood: z
      .enum(ALL_MOOD_TYPES)
      .nullable()
      .default(null),
    tags: z.array(z.string()).min(1, msg("validation_tags_required")).default([]),
    actionObservation: localizedActionObservationSchema.default(""),
    nextStep: z.string().default("").superRefine((value, context) => {
      if (countCheckInWords(value, locale) > CHECK_IN_NEXT_STEP_WORD_LIMIT) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: msg("validation_description_word_max", { max: CHECK_IN_NEXT_STEP_WORD_LIMIT }),
        });
      }
    }),
    media: z
      .array(z.instanceof(File))
      .max(3, msg("validation_media_max", { max: 3 }))
      .default([]),
  });
};

export const checkInFormSchema = createCheckInFormSchema();

export type CheckInFormValuesType = z.infer<ReturnType<typeof createCheckInFormSchema>>;
