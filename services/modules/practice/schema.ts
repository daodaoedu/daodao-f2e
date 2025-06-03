import { z } from 'zod';

// 列舉型別的 zod schema
export const contentTypeSchema = z.enum([
  'book',
  'video', 
  'articles',
  'podcast',
  'course',
  'custom'
]);

export const practiceStatusSchema = z.enum([
  'draft',
  'active', 
  'paused',
  'completed',
  'archived'
]);

export const motivationTypeSchema = z.enum([
  'career',
  'personal',
  'project', 
  'required',
  'other'
]);

export const reminderFrequencySchema = z.enum([
  'daily',
  'every-other-day',
  'twice-weekly',
  'weekly'
]);

export const resourceTypeSchema = z.enum([
  'website',
  'document',
  'video',
  'tool',
  'reference'
]);

export const moodTypeSchema = z.enum([
  'excellent',
  'good',
  'average',
  'challenging',
  'difficult'
]);

// 基礎 schema
export const smallGoalSchema = z.object({
  id: z.string(),
  content: z.string().min(1, '請輸入目標內容').max(200, '目標內容不可超過 200 字'),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().optional(),
  order: z.number().min(0, '排序必須大於等於 0')
});

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '請輸入資源名稱').max(100, '資源名稱不可超過 100 字'),
  url: z.string().url('請輸入有效的網址').optional().or(z.literal('')),
  type: resourceTypeSchema,
  description: z.string().max(500, '描述不可超過 500 字').optional(),
  order: z.number().min(0, '排序必須大於等於 0')
});

export const checkInRecordSchema = z.object({
  id: z.string(),
  practiceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的日期格式 YYYY-MM-DD'),
  progress: z.number().min(0, '進度必須大於等於 0'),
  totalProgress: z.number().min(0, '總進度必須大於等於 0'),
  note: z.string().max(1000, '筆記不可超過 1000 字').optional(),
  mood: moodTypeSchema.optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string()
});

// 主要實踐 schema
export const practiceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '請輸入標題').max(100, '標題不可超過 100 字'),
  description: z.string().max(2000, '描述不可超過 2000 字').optional(),
  contentType: contentTypeSchema,
  totalAmount: z.number().min(1, '總量必須大於 0').max(999999, '總量不可超過 999999'),
  currentProgress: z.number().min(0, '當前進度必須大於等於 0').default(0),
  unit: z.string().min(1, '請輸入單位').max(20, '單位不可超過 20 字'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的開始日期格式 YYYY-MM-DD'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的目標日期格式 YYYY-MM-DD').optional(),
  status: practiceStatusSchema.default('active'),
  motivationType: motivationTypeSchema.optional(),
  customMotivation: z.string().max(200, '自定義動機不可超過 200 字').optional(),
  isPublic: z.boolean().default(true),
  reminderEnabled: z.boolean().default(false),
  reminderFrequency: reminderFrequencySchema.default('daily'),
  streak: z.number().min(0, '連續天數必須大於等於 0').default(0),
  lastCheckinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的日期格式 YYYY-MM-DD').optional(),
  smallGoals: z.array(smallGoalSchema).default([]),
  resources: z.array(resourceSchema).default([]),
  checkIns: z.array(checkInRecordSchema).default([]),
  tags: z.array(z.string()).default([]),
  // 新增：每日目標設定
  dailyGoal: z.object({
    type: z.enum(['time', 'completion']).default('time'),
    timeMinutes: z.number().optional(),
    amount: z.number().optional(),
    unit: z.string().optional()
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// 操作相關 schema
export const createPracticeSchema = z.object({
  title: z.string().min(1, '請輸入標題').max(100, '標題不可超過 100 字'),
  description: z.string().max(2000, '描述不可超過 2000 字').optional(),
  contentType: contentTypeSchema,
  totalAmount: z.number().min(1, '總量必須大於 0').max(999999, '總量不可超過 999999'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的目標日期格式 YYYY-MM-DD').optional(),
  motivationType: motivationTypeSchema.optional(),
  customMotivation: z.string().max(200, '自定義動機不可超過 200 字').optional(),
  reminderEnabled: z.boolean().default(false),
  reminderFrequency: reminderFrequencySchema.default('daily'),
  smallGoals: z.array(
    z.object({
      content: z.string().min(1, '請輸入目標內容').max(200, '目標內容不可超過 200 字'),
      isCompleted: z.boolean().default(false),
      order: z.number().min(0, '排序必須大於等於 0')
    })
  ).default([]),
  resources: z.array(
    z.object({
      name: z.string().min(1, '請輸入資源名稱').max(100, '資源名稱不可超過 100 字'),
      url: z.string().url('請輸入有效的網址').optional().or(z.literal('')),
      type: resourceTypeSchema,
      description: z.string().max(500, '描述不可超過 500 字').optional(),
      order: z.number().min(0, '排序必須大於等於 0')
    })
  ).default([]),
  tags: z.array(z.string()).default([]),
  // 新增：每日目標設定
  dailyGoal: z.object({
    type: z.enum(['time', 'completion']).default('time'),
    timeMinutes: z.number().optional(),
    amount: z.number().optional(),
    unit: z.string().optional()
  }).optional()
});

export const updatePracticeSchema = z.object({
  title: z.string().min(1, '請輸入標題').max(100, '標題不可超過 100 字').optional(),
  description: z.string().max(2000, '描述不可超過 2000 字').optional(),
  totalAmount: z.number().min(1, '總量必須大於 0').max(999999, '總量不可超過 999999').optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的目標日期格式 YYYY-MM-DD').optional(),
  motivationType: motivationTypeSchema.optional(),
  customMotivation: z.string().max(200, '自定義動機不可超過 200 字').optional(),
  reminderEnabled: z.boolean().optional(),
  reminderFrequency: reminderFrequencySchema.optional(),
  status: practiceStatusSchema.optional(),
  smallGoals: z.array(smallGoalSchema).optional(),
  resources: z.array(resourceSchema).optional(),
  tags: z.array(z.string()).optional(),
  dailyGoal: z.object({
    type: z.enum(['time', 'completion']).default('time'),
    timeMinutes: z.number().optional(),
    amount: z.number().optional(),
    unit: z.string().optional()
  }).optional()
});

export const checkInInputSchema = z.object({
  practiceId: z.string().min(1, '請提供實踐 ID'),
  progress: z.number().min(0, '進度必須大於等於 0'),
  note: z.string().max(1000, '筆記不可超過 1000 字').optional(),
  mood: moodTypeSchema.optional(),
  tags: z.array(z.string()).default([])
});

// 篩選相關 schema
export const practiceFilterSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.array(practiceStatusSchema).optional(),
  contentType: z.array(contentTypeSchema).optional(),
  motivationType: z.array(motivationTypeSchema).optional(),
  dateRange: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的開始日期格式 YYYY-MM-DD').optional(),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的結束日期格式 YYYY-MM-DD').optional()
  }).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'progress', 'streak']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// 統計相關 schema
export const practiceStatsSchema = z.object({
  total: z.number().min(0, '總數必須大於等於 0'),
  active: z.number().min(0, '進行中數量必須大於等於 0'),
  completed: z.number().min(0, '已完成數量必須大於等於 0'),
  paused: z.number().min(0, '暫停數量必須大於等於 0'),
  archived: z.number().min(0, '封存數量必須大於等於 0'),
  totalCheckIns: z.number().min(0, '總簽到次數必須大於等於 0'),
  longestStreak: z.number().min(0, '最長連續天數必須大於等於 0'),
  averageProgress: z.number().min(0, '平均進度必須大於等於 0').max(100, '平均進度不可超過 100')
});

// 匯出資料相關 schema
export const exportDataSchema = z.object({
  version: z.string(),
  exportDate: z.string(),
  practices: z.array(practiceSchema),
  stats: practiceStatsSchema
});

// 驗證結果 schema
export const validationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string())
});

// 向後相容的字串型別 schema
export const pathInfoSchema = z.object({
  title: z.string().min(1, '請輸入標題'),
  contentType: z.enum(['book', 'video', 'articles', 'podcast', 'course', 'custom']),
  totalAmount: z.string().min(1, '請輸入總量'),
  currentProgress: z.string(),
  targetDate: z.string(),
  notes: z.string(),
  motivationType: z.enum(['career', 'personal', 'project', 'required', 'other', '']),
  customMotivation: z.string(),
  lastCheckin: z.string(),
  isPublic: z.boolean(),
  reminderEnabled: z.boolean(),
  reminderFrequency: z.enum(['daily', 'every-other-day', 'twice-weekly', 'weekly']),
  streak: z.number().min(0),
  lastStreakDate: z.string()
});

export const checkInEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的日期格式 YYYY-MM-DD'),
  time: z.string(),
  progress: z.string(),
  note: z.string()
});

// 型別匯出
export type ContentType = z.infer<typeof contentTypeSchema>;
export type PracticeStatus = z.infer<typeof practiceStatusSchema>;
export type MotivationType = z.infer<typeof motivationTypeSchema>;
export type ReminderFrequency = z.infer<typeof reminderFrequencySchema>;
export type ResourceType = z.infer<typeof resourceTypeSchema>;
export type MoodType = z.infer<typeof moodTypeSchema>;

export type SmallGoal = z.infer<typeof smallGoalSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type CheckInRecord = z.infer<typeof checkInRecordSchema>;
export type Practice = z.infer<typeof practiceSchema>;

export type CreatePracticeInput = z.infer<typeof createPracticeSchema>;
export type UpdatePracticeInput = z.infer<typeof updatePracticeSchema>;
export type CheckInInput = z.infer<typeof checkInInputSchema>;

export type PracticeFilter = z.infer<typeof practiceFilterSchema>;
export type PracticeStats = z.infer<typeof practiceStatsSchema>;
export type ExportData = z.infer<typeof exportDataSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;

export type PathInfo = z.infer<typeof pathInfoSchema>;
export type CheckInEntry = z.infer<typeof checkInEntrySchema>;

// 向後相容的字串型別
export type ContentTypeString = z.infer<typeof contentTypeSchema>;
export type MotivationTypeString = z.infer<typeof motivationTypeSchema> | '';
export type ReminderFrequencyString = z.infer<typeof reminderFrequencySchema>;
