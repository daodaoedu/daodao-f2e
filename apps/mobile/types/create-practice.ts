import { z } from "zod";

export const createCreatePracticeSchema = (t: (key: string, values?: Record<string, string | number>) => string) =>
  z.object({
    // Step 1: 標題與描述
    title: z.string().min(1, t("validation_name_required")).max(50, t("validation_action_max")),
    description: z.string().max(200, t("validation_description_max")).optional(),

    // Step 2: 頻率與時長
    frequency: z.enum(["daily", "weekly", "custom"], {
      required_error: t("validation_frequency_required"),
    }),
    targetDays: z.number().min(1, t("validation_target_days_min")).max(365, t("validation_target_days_max")),
    customDays: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday

    // Step 3: 執行時機
    reminderTime: z.string().optional(), // HH:mm format
    reminderEnabled: z.boolean().default(false),

    // Step 4: 標籤與資源
    tags: z.array(z.string()).max(5, t("validation_tags_max", { max: 5 })).default([]),
    color: z.string().optional(),
    icon: z.string().optional(),

    // Step 5: 隱私設定
    privacy_status: z.enum(["private", "public", "delayed"]).default("private"),
  });

export const createPracticeSchema = createCreatePracticeSchema((key, values) => {
  if (!values) return key;
  return Object.entries(values).reduce(
    (result, [valueKey, value]) => result.replaceAll(`{${valueKey}}`, String(value)),
    key
  );
});

const createPracticeSchemaForType = z.object({
  // Step 1: 標題與描述
  title: z.string().min(1, "請輸入標題").max(50, "標題最多 50 字"),
  description: z.string().max(200, "描述最多 200 字").optional(),

  // Step 2: 頻率與時長
  frequency: z.enum(["daily", "weekly", "custom"], {
    required_error: "請選擇頻率",
  }),
  targetDays: z.number().min(1, "至少 1 天").max(365, "最多 365 天"),
  customDays: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday

  // Step 3: 執行時機
  reminderTime: z.string().optional(), // HH:mm format
  reminderEnabled: z.boolean().default(false),

  // Step 4: 標籤與資源
  tags: z.array(z.string()).max(5, "最多 5 個標籤").default([]),
  color: z.string().optional(),
  icon: z.string().optional(),

  // Step 5: 隱私設定
  privacy_status: z.enum(["private", "public", "delayed"]).default("private"),
});

export type CreatePracticeInputType = z.infer<typeof createPracticeSchemaForType>;

export const defaultCreatePracticeValues: CreatePracticeInputType = {
  title: "",
  description: "",
  frequency: "daily",
  targetDays: 21,
  customDays: [],
  reminderTime: "09:00",
  reminderEnabled: false,
  tags: [],
  color: undefined,
  icon: undefined,
  privacy_status: "private",
};

export interface IPracticeTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  defaultValues: Partial<CreatePracticeInputType>;
}

// 預設模板
export const practiceTemplates: IPracticeTemplate[] = [
  {
    id: "reading",
    title: "每日閱讀",
    description: "培養閱讀習慣，每天閱讀 30 分鐘",
    icon: "📚",
    color: "#4F46E5",
    category: "學習",
    defaultValues: {
      title: "每日閱讀",
      description: "每天閱讀 30 分鐘",
      frequency: "daily",
      targetDays: 30,
      tags: ["閱讀", "學習"],
    },
  },
  {
    id: "exercise",
    title: "運動健身",
    description: "保持運動習慣，每天運動 30 分鐘",
    icon: "💪",
    color: "#059669",
    category: "健康",
    defaultValues: {
      title: "運動健身",
      description: "每天運動 30 分鐘",
      frequency: "daily",
      targetDays: 30,
      tags: ["運動", "健康"],
    },
  },
  {
    id: "meditation",
    title: "冥想靜心",
    description: "每天冥想 10 分鐘，放鬆身心",
    icon: "🧘",
    color: "#7C3AED",
    category: "身心",
    defaultValues: {
      title: "冥想靜心",
      description: "每天冥想 10 分鐘",
      frequency: "daily",
      targetDays: 21,
      tags: ["冥想", "身心"],
    },
  },
  {
    id: "language",
    title: "語言學習",
    description: "每天學習外語 15 分鐘",
    icon: "🌍",
    color: "#DC2626",
    category: "學習",
    defaultValues: {
      title: "語言學習",
      description: "每天學習外語 15 分鐘",
      frequency: "daily",
      targetDays: 60,
      tags: ["語言", "學習"],
    },
  },
  {
    id: "coding",
    title: "程式練習",
    description: "每天寫程式，持續精進技術",
    icon: "💻",
    color: "#0891B2",
    category: "技能",
    defaultValues: {
      title: "程式練習",
      description: "每天寫程式 1 小時",
      frequency: "daily",
      targetDays: 100,
      tags: ["程式", "技能"],
    },
  },
  {
    id: "journal",
    title: "日記寫作",
    description: "每天記錄生活，反思成長",
    icon: "✍️",
    color: "#EA580C",
    category: "成長",
    defaultValues: {
      title: "日記寫作",
      description: "每天寫日記",
      frequency: "daily",
      targetDays: 30,
      tags: ["寫作", "反思"],
    },
  },
];
