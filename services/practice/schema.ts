import { z } from 'zod';
import { baseUserSchema } from '../_shared/schema';

// ==================== 列舉型別的 zod schema ====================
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

// ==================== 實際的列舉值（可以作為值使用） ====================
export const ContentType = {
  BOOK: 'book' as const,
  VIDEO: 'video' as const,
  ARTICLES: 'articles' as const,
  PODCAST: 'podcast' as const,
  COURSE: 'course' as const,
  CUSTOM: 'custom' as const
} as const;

export const PracticeStatus = {
  DRAFT: 'draft' as const,
  ACTIVE: 'active' as const,
  PAUSED: 'paused' as const,
  COMPLETED: 'completed' as const,
  ARCHIVED: 'archived' as const
} as const;

export const MotivationType = {
  CAREER: 'career' as const,
  PERSONAL: 'personal' as const,
  PROJECT: 'project' as const,
  REQUIRED: 'required' as const,
  OTHER: 'other' as const
} as const;

export const ReminderFrequency = {
  DAILY: 'daily' as const,
  EVERY_OTHER_DAY: 'every-other-day' as const,
  TWICE_WEEKLY: 'twice-weekly' as const,
  WEEKLY: 'weekly' as const
} as const;

export const ResourceType = {
  WEBSITE: 'website' as const,
  DOCUMENT: 'document' as const,
  VIDEO: 'video' as const,
  TOOL: 'tool' as const,
  REFERENCE: 'reference' as const
} as const;

export const MoodType = {
  EXCELLENT: 'excellent' as const,
  GOOD: 'good' as const,
  AVERAGE: 'average' as const,
  CHALLENGING: 'challenging' as const,
  DIFFICULT: 'difficult' as const
} as const;

// ==================== 基礎 schema ====================

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '請輸入資源名稱').max(100, '資源名稱不可超過 100 字'),
  url: z.string().optional().refine(
    (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
    { message: '請輸入有效的網址' }
  ),
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

// ==================== 主要實踐 schema ====================
export const practiceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '請輸入標題').max(100, '標題不可超過 100 字'),
  description: z.string().max(2000, '描述不可超過 2000 字').optional(),
  contentType: contentTypeSchema,
  customContentType: z.string().max(20, '自定義類型名稱不可超過 20 字').optional(),
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
  practiceAction: z.string().max(200, '實踐行動不可超過 200 字').optional(),
  resources: z.array(resourceSchema).default([]),
  checkIns: z.array(checkInRecordSchema).default([]),
  tags: z.array(z.string()).default([]),
  // 每日目標設定
  dailyGoal: z.object({
    type: z.enum(['time', 'completion']).default('time'),
    timeMinutes: z.number().optional(),
    amount: z.number().optional(),
    unit: z.string().optional()
  }).optional(),
  // 社群互動統計
  likeCount: z.number().min(0).default(0),
  commentCount: z.number().min(0).default(0),
  viewCount: z.number().min(0).default(0),
  shareCount: z.number().min(0).default(0),
  createdAt: z.string(),
  updatedAt: z.string()
});

// 擴展的實踐 schema - 包含使用者資訊 (用於公開列表等場景)
export const practiceWithUserSchema = practiceSchema.extend({
  user: baseUserSchema.extend({
    _id: z.string().optional(),
    photoURL: z.string().optional(),
    roleList: z.array(z.string()).optional(),
  }).optional(),
});

// ==================== 操作相關 schema ====================
export const createPracticeSchema = z.object({
  title: z.string().min(1, '請輸入標題').max(100, '標題不可超過 100 字'),
  description: z.string().max(2000, '描述不可超過 2000 字').optional(),
  contentType: contentTypeSchema,
  customContentType: z.string().max(20, '自定義類型名稱不可超過 20 字').optional(),
  totalAmount: z.number().min(1, '總量必須大於 0').max(999999, '總量不可超過 999999'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的目標日期格式 YYYY-MM-DD').optional(),
  motivationType: motivationTypeSchema.optional(),
  customMotivation: z.string().max(200, '自定義動機不可超過 200 字').optional(),
  reminderEnabled: z.boolean().default(false),
  reminderFrequency: reminderFrequencySchema.default('daily'),
  practiceAction: z.string().max(200, '實踐行動不可超過 200 字').optional(),
  resources: z.array(
    z.object({
      name: z.string().min(1, '請輸入資源名稱').max(100, '資源名稱不可超過 100 字'),
      url: z.string().optional().refine(
    (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
    { message: '請輸入有效的網址' }
  ),
      type: resourceTypeSchema,
      description: z.string().max(500, '描述不可超過 500 字').optional(),
      order: z.number().min(0, '排序必須大於等於 0')
    })
  ).default([]),
  tags: z.array(z.string()).default([]),
  // 每日目標設定
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
  customContentType: z.string().max(20, '自定義類型名稱不可超過 20 字').optional(),
  totalAmount: z.number().min(1, '總量必須大於 0').max(999999, '總量不可超過 999999').optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的目標日期格式 YYYY-MM-DD').optional(),
  motivationType: motivationTypeSchema.optional(),
  customMotivation: z.string().max(200, '自定義動機不可超過 200 字').optional(),
  reminderEnabled: z.boolean().optional(),
  reminderFrequency: reminderFrequencySchema.optional(),
  status: practiceStatusSchema.optional(),
  practiceAction: z.string().max(200, '實踐行動不可超過 200 字').optional(),
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

// ==================== 篩選相關 schema ====================
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

// ==================== 統計相關 schema ====================
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

// ==================== 匯出資料相關 schema ====================
export const exportDataSchema = z.object({
  version: z.string(),
  exportDate: z.string(),
  practices: z.array(practiceSchema),
  stats: practiceStatsSchema
});

// ==================== 驗證結果 schema ====================
export const validationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string())
});

// ==================== 向後相容的字串型別 schema ====================
export const pathInfoSchema = z.object({
  title: z.string().min(1, '請輸入標題'),
  contentType: z.enum(['book', 'video', 'articles', 'podcast', 'course', 'custom']),
  customContentType: z.string().optional(),
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

// ==================== 從 Zod schema 推導的主要型別 ====================
export type ContentType = z.infer<typeof contentTypeSchema>;
export type PracticeStatus = z.infer<typeof practiceStatusSchema>;
export type MotivationType = z.infer<typeof motivationTypeSchema>;
export type ReminderFrequency = z.infer<typeof reminderFrequencySchema>;
export type ResourceType = z.infer<typeof resourceTypeSchema>;
export type MoodType = z.infer<typeof moodTypeSchema>;

export type Resource = z.infer<typeof resourceSchema>;
export type CheckInRecord = z.infer<typeof checkInRecordSchema>;
export type Practice = z.infer<typeof practiceSchema>;
export type PracticeWithUser = z.infer<typeof practiceWithUserSchema>;

export type CreatePracticeInput = z.infer<typeof createPracticeSchema>;
export type UpdatePracticeInput = z.infer<typeof updatePracticeSchema>;
export type CheckInInput = z.infer<typeof checkInInputSchema>;

export type PracticeFilter = z.infer<typeof practiceFilterSchema>;
export type PracticeStats = z.infer<typeof practiceStatsSchema>;
export type ExportData = z.infer<typeof exportDataSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;

export type PathInfo = z.infer<typeof pathInfoSchema>;
export type CheckInEntry = z.infer<typeof checkInEntrySchema>;

// ==================== 向後相容的字串型別 ====================
export type ContentTypeString = z.infer<typeof contentTypeSchema>;
export type MotivationTypeString = z.infer<typeof motivationTypeSchema> | '';
export type ReminderFrequencyString = z.infer<typeof reminderFrequencySchema>;

// ==================== 附加型別定義====================
// UI 視圖型別
export type MainView = 'setup' | 'dashboard' | 'list';
export type DashboardView = 'main' | 'checkin' | 'history';

// Context 型別定義
export interface PracticeContextType {
  // 狀態
  practices: Practice[];
  currentPractice: Practice | null;
  filter: PracticeFilter;
  stats: PracticeStats;
  loading: boolean;
  error?: string;

  // 操作方法
  createPractice: (input: CreatePracticeInput) => Promise<Practice>;
  updatePractice: (id: string, input: UpdatePracticeInput) => Promise<Practice>;
  deletePractice: (id: string) => Promise<void>;
  checkIn: (input: CheckInInput) => Promise<CheckInRecord>;

  // 查詢方法
  getPractice: (id: string) => Practice | undefined;
  getCheckInHistory: (practiceId: string) => CheckInRecord[];

  // 篩選和搜尋
  setFilter: (filter: Partial<PracticeFilter>) => void;
  resetFilter: () => void;

  // 資料管理
  exportData: () => string;
  importData: (data: string) => Promise<void>;

  // 工具方法
  calculateStreak: (practiceId: string) => number;
  getProgress: (practiceId: string) => number;
  canCheckInToday: (practiceId: string) => boolean;

  // 便利方法
  createPracticeFromPathInfo: (
    pathInfo: Record<string, unknown>,
    practiceAction: string,
    resources: Array<{name: string, url: string}>
  ) => Promise<string>;
}
