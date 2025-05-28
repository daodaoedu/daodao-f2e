// 實際的列舉值（可以作為值使用）
export enum ContentType {
  BOOK = 'book',
  VIDEO = 'video',
  ARTICLES = 'articles',
  PODCAST = 'podcast',
  COURSE = 'course',
  CUSTOM = 'custom'
}

export enum PracticeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum MotivationType {
  CAREER = 'career',
  PERSONAL = 'personal',
  PROJECT = 'project',
  REQUIRED = 'required',
  OTHER = 'other'
}

export enum ReminderFrequency {
  DAILY = 'daily',
  EVERY_OTHER_DAY = 'every-other-day',
  TWICE_WEEKLY = 'twice-weekly',
  WEEKLY = 'weekly'
}

export enum ResourceType {
  WEBSITE = 'website',
  DOCUMENT = 'document',
  VIDEO = 'video',
  TOOL = 'tool',
  REFERENCE = 'reference'
}

export enum MoodType {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  CHALLENGING = 'challenging',
  DIFFICULT = 'difficult'
}

// 基礎介面 (與 schema.ts 中的 zod 類型對應)
export interface SmallGoal {
  id: string;
  content: string;
  isCompleted: boolean;
  completedAt?: string;
  order: number;
}

export interface Resource {
  id: string;
  name: string;
  url?: string;
  type: ResourceType;
  description?: string;
  order: number;
}

export interface CheckInRecord {
  id: string;
  practiceId: string;
  date: string; // YYYY-MM-DD 格式
  progress: number;
  totalProgress: number;
  note?: string;
  mood?: MoodType;
  tags: string[];
  createdAt: string;
}

// 主要實踐介面
export interface Practice {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  totalAmount: number;
  currentProgress: number;
  unit: string;
  startDate: string;
  targetDate?: string;
  status: PracticeStatus;
  motivationType?: MotivationType;
  customMotivation?: string;
  isPublic: boolean;
  reminderEnabled: boolean;
  reminderFrequency: ReminderFrequency;
  streak: number;
  lastCheckinDate?: string;
  smallGoals: SmallGoal[];
  resources: Resource[];
  checkIns: CheckInRecord[];
  createdAt: string;
  updatedAt: string;
}

// 創建實踐輸入
export interface CreatePracticeInput {
  title: string;
  description?: string;
  contentType: ContentType;
  totalAmount: number;
  targetDate?: string;
  motivationType?: MotivationType;
  customMotivation?: string;
  reminderEnabled?: boolean;
  reminderFrequency?: ReminderFrequency;
  smallGoals?: Array<{
    content: string;
    isCompleted?: boolean;
    order: number;
  }>;
  resources?: Array<{
    name: string;
    url?: string;
    type: ResourceType;
    description?: string;
    order: number;
  }>;
}

// 更新實踐輸入
export interface UpdatePracticeInput {
  title?: string;
  description?: string;
  totalAmount?: number;
  targetDate?: string;
  motivationType?: MotivationType;
  customMotivation?: string;
  reminderEnabled?: boolean;
  reminderFrequency?: ReminderFrequency;
  status?: PracticeStatus;
  smallGoals?: SmallGoal[];
  resources?: Resource[];
}

// 簽到輸入
export interface CheckInInput {
  practiceId: string;
  progress: number;
  note?: string;
  mood?: MoodType;
  tags?: string[];
}

// 篩選條件
export interface PracticeFilter {
  searchTerm?: string;
  status?: PracticeStatus[];
  contentType?: ContentType[];
  motivationType?: MotivationType[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'progress' | 'streak';
  sortOrder?: 'asc' | 'desc';
}

// 統計資料
export interface PracticeStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  archived: number;
  totalCheckIns: number;
  longestStreak: number;
  averageProgress: number;
}

// 驗證結果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 向後相容的字串型別
export type ContentTypeString = 'book' | 'video' | 'articles' | 'podcast' | 'course' | 'custom';
export type MotivationTypeString = 'career' | 'personal' | 'project' | 'required' | 'other' | '';
export type ReminderFrequencyString = 'daily' | 'every-other-day' | 'twice-weekly' | 'weekly';

// 向後相容的介面
export interface PathInfo {
  title: string;
  contentType: ContentTypeString;
  totalAmount: string;
  currentProgress: string;
  targetDate: string;
  notes: string;
  motivationType: MotivationTypeString;
  customMotivation: string;
  lastCheckin: string;
  isPublic: boolean;
  reminderEnabled: boolean;
  reminderFrequency: ReminderFrequencyString;
  streak: number;
  lastStreakDate: string;
}

export interface CheckInEntry {
  date: string;
  time: string;
  progress: string;
  note: string;
}

// 支持舊版的 MainView 和 DashboardView 類型
export type MainView = 'setup' | 'dashboard' | 'list';
export type DashboardView = 'main' | 'checkin' | 'history';

// Context 類型定義
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

  // 便利方法（向後相容）
  createPracticeFromPathInfo: (pathInfo: any, smallGoals: any[], resources: any[]) => Promise<string>;
}
