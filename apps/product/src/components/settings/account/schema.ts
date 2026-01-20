import { differenceInYears } from "date-fns";
import { z } from "zod";

// Form Options Constants
export const ROLE_OPTIONS = [
  { value: "student", label: "學生" },
  { value: "professional", label: "社會人士" },
  { value: "teacher", label: "教師" },
  { value: "other", label: "其他" },
] as const;

export const EDUCATION_STAGE_OPTIONS = [
  { value: "unlimited", label: "不設限" },
  { value: "elementary", label: "國小" },
  { value: "junior", label: "國中" },
  { value: "senior", label: "高中" },
  { value: "university", label: "大學" },
  { value: "graduate", label: "研究所" },
];

export const AVAILABLE_FIELDS = [
  "資訊與資訊通信科技(ICT)",
  "法律",
  "商業與管理",
  "資訊與電腦科學",
  "語言",
  "商管與理財",
  "社會創新與永續",
  "教育",
  "藝術與設計",
  "工程與技術",
];

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
