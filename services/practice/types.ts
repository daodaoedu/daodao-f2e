// Practice 系統型別定義

export enum ContentType {
  BOOK = 'book',
  VIDEO = 'video',
  ARTICLES = 'articles', 
  PODCAST = 'podcast',
  COURSE = 'course',
  CUSTOM = 'custom'
}

export enum PracticeStatus {
  DRAFT = 'draft',           // 草稿
  ACTIVE = 'active',         // 進行中
  PAUSED = 'paused',         // 暫停
  COMPLETED = 'completed',   // 已完成
  ARCHIVED = 'archived'      // 已封存
}

export enum MotivationType {
  CAREER = 'career',         // 職業發展
  PERSONAL = 'personal',     // 個人興趣
  PROJECT = 'project',       // 專案需求
  REQUIRED = 'required',     // 必修課程
  OTHER = 'other'            // 其他
}

export enum ReminderFrequency {
  DAILY = 'daily',           // 每日
  EVERY_OTHER_DAY = 'every-other-day', // 隔日
  TWICE_WEEKLY = 'twice-weekly',       // 每週兩次
  WEEKLY = 'weekly'          // 每週
}

export enum ResourceType {
  WEBSITE = 'website',       // 網站
  DOCUMENT = 'document',     // 文檔
  VIDEO = 'video',           // 影片
  TOOL = 'tool',             // 工具
  REFERENCE = 'reference'    // 參考資料
}

export enum MoodType {
  EXCELLENT = 'excellent',   // 優秀
  GOOD = 'good',             // 良好
  AVERAGE = 'average',       // 普通
  CHALLENGING = 'challenging', // 有挑戰
  DIFFICULT = 'difficult'    // 困難
}

// 小目標介面
export interface SmallGoal {
  id: string;                     // 目標 ID
  content: string;                // 目標內容
  isCompleted: boolean;           // 是否完成
  completedAt?: string;           // 完成時間
  order: number;                  // 排序
}

// 學習資源介面
export interface Resource {
  id: string;                     // 資源 ID
  name: string;                   // 資源名稱
  url?: string;                   // 資源連結
  type: ResourceType;             // 資源類型
  description?: string;           // 描述
  order: number;                  // 排序
}

// 簽到記錄介面
export interface CheckInRecord {
  id: string;                     // 記錄 ID
  practiceId: string;             // 所屬實踐 ID
  date: string;                   // 簽到日期
  progress: number;               // 當次進度
  totalProgress: number;          // 累計進度
  note?: string;                  // 簽到筆記
  mood?: MoodType;                // 學習心情
  tags?: string[];                // 標籤
  createdAt: string;              // 建立時間
}

// 主題實踐介面
export interface Practice {
  id: string;                     // 唯一識別碼
  title: string;                  // 實踐標題
  description?: string;           // 描述
  contentType: ContentType;       // 內容類型
  totalAmount: number;            // 總量
  currentProgress: number;        // 當前進度
  unit: string;                   // 單位（頁、集、天等）
  startDate: string;              // 開始日期
  targetDate?: string;            // 目標完成日期
  status: PracticeStatus;         // 狀態
  motivationType?: MotivationType; // 動機類型
  customMotivation?: string;      // 自定義動機
  isPublic: boolean;              // 是否公開
  reminderEnabled: boolean;       // 提醒設定
  reminderFrequency: ReminderFrequency;
  streak: number;                 // 連續天數
  lastCheckinDate?: string;       // 最後簽到日期
  smallGoals: SmallGoal[];        // 小目標
  resources: Resource[];          // 學習資源
  checkIns: CheckInRecord[];      // 簽到記錄
  createdAt: string;              // 建立時間
  updatedAt: string;              // 更新時間
}

// 統計資料介面
export interface PracticeStats {
  total: number;                  // 總實踐數
  active: number;                 // 進行中
  completed: number;              // 已完成
  paused: number;                 // 暫停
  archived: number;               // 已封存
  totalCheckIns: number;          // 總簽到次數
  longestStreak: number;          // 最長連續天數
  averageProgress: number;        // 平均進度
}

// 篩選條件介面
export interface PracticeFilter {
  searchTerm?: string;            // 搜尋關鍵字
  status?: PracticeStatus[];      // 狀態篩選
  contentType?: ContentType[];    // 內容類型篩選
  motivationType?: MotivationType[]; // 動機類型篩選
  dateRange?: {                   // 日期範圍篩選
    start?: string;
    end?: string;
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'progress' | 'streak'; // 排序欄位
  sortOrder?: 'asc' | 'desc';     // 排序方向
}

// 創建實踐的輸入介面
export interface CreatePracticeInput {
  title: string;
  description?: string;
  contentType: ContentType;
  totalAmount: number;
  targetDate?: string;
  motivationType?: MotivationType;
  customMotivation?: string;
  reminderEnabled: boolean;
  reminderFrequency: ReminderFrequency;
  smallGoals?: Omit<SmallGoal, 'id'>[];
  resources?: Omit<Resource, 'id'>[];
}

// 更新實踐的輸入介面
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

// 簽到輸入介面
export interface CheckInInput {
  practiceId: string;
  progress: number;
  note?: string;
  mood?: MoodType;
  tags?: string[];
}

// 匯出資料格式
export interface ExportData {
  version: string;
  exportDate: string;
  practices: Practice[];
  stats: PracticeStats;
}

// 檢查結果介面
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Context 相關型別
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

// Hook 回傳值型別
export interface UsePracticeResult {
  practice: Practice | null;
  loading: boolean;
  error?: string;
  checkIn: (progress: number, note?: string) => Promise<void>;
  update: (input: UpdatePracticeInput) => Promise<void>;
  canCheckInToday: boolean;
  todayCheckIn?: CheckInRecord;
}

// UI 相關型別
export type MainView = 'setup' | 'dashboard' | 'list';
export type DashboardView = 'main' | 'checkin' | 'history';

// 向後相容的型別 (暫時保留)
export type ContentTypeString = 'book' | 'video' | 'articles' | 'podcast' | 'course' | 'custom';
export type MotivationTypeString = 'career' | 'personal' | 'project' | 'required' | 'other' | '';
export type ReminderFrequencyString = 'daily' | 'every-other-day' | 'twice-weekly' | 'weekly';

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