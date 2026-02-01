import { z } from "zod";

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

export const publicInfoFormSchema = z.object({
  photoURL: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
  name: z.string().min(1, "此為必填欄位"),
  customId: z
    .string()
    .min(1, "此為必填欄位")
    .min(3, "ID 最少需要 3 個字符")
    .max(50, "ID 最多 50 個字符")
    .refine(
      (val) => customIdRegex.test(val),
      "請依照 ID 的格式規則輸入"
    ),
  location: z.string().optional(),
  personalSlogan: z
    .string()
    .min(1, "此為必填欄位")
    .max(150, "個人標語最多 150 字"),
  selfIntroduction: z.string().max(350, "關於我最多 350 字").optional(),
  personalUrl: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
  facebook: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
  instagram: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
  linkedin: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
  github: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
  discord: z.string().optional(),
});

export type PublicInfoFormValues = z.infer<typeof publicInfoFormSchema>;
