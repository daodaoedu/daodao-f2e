import { z } from "zod";
import type { useTranslations } from "@daodao/i18n";

/**
 * CustomId 驗證規則
 * - 最少 3 個字符，最多 50 個字符
 * - 開頭及結尾僅可使用英文字母 (a-z) 與數字
 * - 中間可包含底線 (_) 與連字符 (-)
 */
// 正則表達式說明：
// ^[a-zA-Z0-9] - 開頭必須是英文字母或數字
// ([a-zA-Z0-9_-]*[a-zA-Z0-9])? - 可選的中間部分：中間可以是英文字母、數字、底線或連字符，結尾必須是英文字母或數字
// 注意：由於有 .min(3) 驗證，單個或兩個字符的情況會被拒絕
const customIdRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/;

type TFunction = ReturnType<typeof useTranslations<"app_product">>;

export const createPublicInfoFormSchema = (t?: TFunction) => {
  const msg = (key: string, params?: Record<string, string | number>) => {
    if (t) return t(key as Parameters<TFunction>[0], params as never);
    return key;
  };

  return z.object({
    photoURL: z.string().url(msg("validation_url_invalid")).optional().or(z.literal("")),
    name: z.string().min(1, msg("validation_required")),
    customId: z
      .string()
      .min(1, msg("validation_required"))
      .min(3, msg("validation_id_min", { min: 3 }))
      .max(50, msg("validation_id_max", { max: 50 }))
      .refine((val) => customIdRegex.test(val), msg("validation_custom_id_format")),
    country: z.string().optional(),
    location: z.string().optional(),
    personalSlogan: z
      .string()
      .min(1, msg("validation_required"))
      .max(150, msg("validation_personal_slogan_max", { max: 150 })),
    selfIntroduction: z
      .string()
      .max(350, msg("validation_self_introduction_max", { max: 350 }))
      .optional(),
    personalUrl: z.string().url(msg("validation_url_invalid")).optional().or(z.literal("")),
    facebook: z.string().url(msg("validation_url_invalid")).optional().or(z.literal("")),
    instagram: z.string().url(msg("validation_url_invalid")).optional().or(z.literal("")),
    linkedin: z.string().url(msg("validation_url_invalid")).optional().or(z.literal("")),
    github: z.string().url(msg("validation_url_invalid")).optional().or(z.literal("")),
    discord: z.string().optional(),
    line: z.string().optional(),
    threads: z.string().url(msg("validation_url_invalid")).optional().or(z.literal("")),
    hideConnectionsCount: z.boolean().optional(),
  });
};

export const publicInfoFormSchema = createPublicInfoFormSchema();

export type PublicInfoFormValues = z.infer<typeof publicInfoFormSchema>;
