import { v4 as uuid } from 'uuid';
import { format, parseISO, startOfDay, differenceInDays, isAfter, isBefore, isSameDay, subDays, isValid } from 'date-fns';
import { z } from 'zod';
import { Practice, ContentType, PracticeStatus, CheckInRecord } from './schema';

// 驗證 schema
const startDateValidationSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的日期格式 YYYY-MM-DD');
const smallGoalValidationSchema = z.string().min(1, '請輸入目標內容').max(200, '目標內容不可超過 200 字');
const resourceValidationSchema = z.object({
  name: z.string().min(1, '請輸入資源名稱').max(100, '資源名稱不可超過 100 字'),
  url: z.string().optional().refine(
    (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
    { message: '請輸入有效的網址' }
  )
});

export function generateId(): string {
  return uuid();
}

export function generatePracticeId(): string {
  return `practice_${generateId()}`;
}

export function generateCheckInId(): string {
  return `checkin_${generateId()}`;
}

// ==================== 進度計算 ====================
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

// ==================== 內容類型工具 ====================
export function getContentTypeLabel(contentType: ContentType, customContentType?: string): string {
  const labels: Record<ContentType, string> = {
    book: '書籍',
    video: '影片課程',
    articles: '文章',
    podcast: 'Podcast',
    course: '課程',
    custom: customContentType || '自定義'
  };

  return labels[contentType] || '未知';
}

export function getContentTypeUnit(contentType: ContentType): string {
  const units: Record<ContentType, string> = {
    book: '頁',
    video: '課',
    articles: '篇',
    podcast: '集',
    course: '單元',
    custom: '項目'
  };

  return units[contentType] || '項目';
}

export function getContentTypeIcon(contentType: ContentType): string {
  const icons: Record<ContentType, string> = {
    book: 'Book',
    video: 'Video',
    articles: 'FileText',
    podcast: 'Headphones',
    course: 'GraduationCap',
    custom: 'Settings'
  };

  return icons[contentType] || 'Book';
}

// ==================== 狀態工具 ====================
export function getStatusLabel(status: PracticeStatus): string {
  const labels: Record<PracticeStatus, string> = {
    draft: '草稿',
    active: '進行中',
    paused: '暫停',
    completed: '已完成',
    archived: '已封存'
  };

  return labels[status] || '未知';
}

export function getStatusColor(status: PracticeStatus): string {
  const colors: Record<PracticeStatus, string> = {
    draft: '#92989A',
    active: '#16B9B3',
    paused: '#FF9526',
    completed: '#86C84A',
    archived: '#536166'
  };

  return colors[status] || '#92989A';
}

export function getStatusColorClass(status: PracticeStatus): string {
  const colorClasses: Record<PracticeStatus, string> = {
    draft: 'text-basic-300',
    active: 'text-primary-base',
    paused: 'text-tips',
    completed: 'text-success',
    archived: 'text-basic-400'
  };

  return colorClasses[status] || 'text-basic-300';
}

export function getStatusBgClass(status: PracticeStatus): string {
  const bgClasses: Record<PracticeStatus, string> = {
    draft: 'bg-basic-300',
    active: 'bg-primary-base',
    paused: 'bg-tips',
    completed: 'bg-success',
    archived: 'bg-basic-400'
  };

  return bgClasses[status] || 'bg-basic-300';
}

export function canCheckIn(practice: Practice): boolean {
  return practice.status === 'active' && practice.currentProgress < practice.totalAmount;
}

export function shouldShowInActiveList(practice: Practice): boolean {
  return practice.status === 'active' || practice.status === 'paused';
}

// ==================== 搜尋和篩選工具 ====================
export function searchPractices(practices: Practice[], searchTerm: string): Practice[] {
  if (!searchTerm.trim()) return practices;

  const term = searchTerm.toLowerCase();
  return practices.filter((practice) =>
    practice.title.toLowerCase().includes(term) ||
    (practice.description && practice.description.toLowerCase().includes(term)) ||
    (practice.practiceAction && practice.practiceAction.toLowerCase().includes(term)) ||
    practice.resources.some((resource) => resource.name.toLowerCase().includes(term))
  );
}

export function sortPractices(
  practices: Practice[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): Practice[] {
  const sorted = [...practices];

  sorted.sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      case 'progress':
        aValue = calculateProgress(a.currentProgress, a.totalAmount);
        bValue = calculateProgress(b.currentProgress, b.totalAmount);
        break;
      case 'streak':
        aValue = a.streak;
        bValue = b.streak;
        break;
      default:
        return 0;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

// ==================== 日期處理 ====================

/**
 * 安全地解析日期，統一處理字串和 Date 對象
 */
export function parseDate(date: string | Date | undefined | null): Date {
  if (!date) {
    return new Date();
  }

  if (date instanceof Date) {
    return isValid(date) ? date : new Date();
  }

  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : new Date();
}

/**
 * 格式化日期為數字格式
 */
export function formatDate(date: string | Date | undefined | null): string {
  const dateObj = parseDate(date);
  return format(dateObj, 'yyyy/MM/dd');
}

/**
 * 格式化時間
 */
export function formatTime(date: string | Date | undefined | null): string {
  const dateObj = parseDate(date);
  return format(dateObj, 'HH:mm');
}

/**
 * 格式化日期時間
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  const dateObj = parseDate(date);
  return format(dateObj, 'yyyy/MM/dd HH:mm');
}

/**
 * 格式化為 ISO 日期字串 (YYYY-MM-DD)
 */
export function formatDateISO(date: string | Date | undefined | null): string {
  const dateObj = parseDate(date);
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * 格式化相對時間（數字格式）
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  const dateObj = parseDate(date);
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'just now';
  }
}

/**
 * 智能日期顯示：today/yesterday/具體日期
 */
export function formatSmartDate(date: string | Date | undefined | null): string {
  const dateObj = parseDate(date);
  const today = startOfDay(new Date());
  const targetDate = startOfDay(dateObj);

  const diffDays = differenceInDays(today, targetDate);

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays === -1) return 'tomorrow';

  return formatDate(dateObj);
}

/**
 * 檢查是否為今天
 */
export function isToday(date: string | Date | undefined | null): boolean {
  const dateObj = parseDate(date);
  return isSameDay(dateObj, new Date());
}

/**
 * 計算兩個日期之間的天數差
 */
export function daysBetween(date1: string | Date | undefined | null, date2: string | Date | undefined | null): number {
  const date1Obj = parseDate(date1);
  const date2Obj = parseDate(date2);
  return Math.abs(differenceInDays(date2Obj, date1Obj));
}

/**
 * 檢查兩個日期是否為連續天數
 */
export function isConsecutiveDay(lastDate: string | Date | undefined | null, currentDate: string | Date | undefined | null): boolean {
  const lastDateObj = parseDate(lastDate);
  const currentDateObj = parseDate(currentDate);
  return differenceInDays(currentDateObj, lastDateObj) === 1;
}

/**
 * 獲取當前日期的 ISO 字串 (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * 獲取當前時間的 ISO 字串
 */
export function getCurrentTimeISO(): string {
  return new Date().toISOString();
}

/**
 * 驗證日期字串格式 (YYYY-MM-DD)
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = parseISO(dateString);
  return isValid(date);
}

// ==================== 時區處理 ====================

/**
 * 獲取使用者時區
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * 格式化日期為使用者時區
 */
export function formatDateInUserTimezone(date: string | Date | undefined | null, formatStr: string = 'yyyy-MM-dd HH:mm'): string {
  const dateObj = parseDate(date);
  return format(dateObj, formatStr);
}

/**
 * 獲取 UTC 偏移量（分鐘）
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * 將日期轉換為 UTC
 */
export function toUTC(date: string | Date | undefined | null): Date {
  const dateObj = parseDate(date);
  return new Date(dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000));
}

/**
 * 將 UTC 日期轉換為地方時間
 */
export function fromUTC(utcDate: string | Date | undefined | null): Date {
  const dateObj = parseDate(utcDate);
  return new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
}

/**
 * 檢查兩個日期是否在同一時區的同一天
 */
export function isSameDayInTimezone(date1: string | Date | undefined | null, date2: string | Date | undefined | null): boolean {
  const d1 = startOfDay(parseDate(date1));
  const d2 = startOfDay(parseDate(date2));
  return isSameDay(d1, d2);
}

// ==================== 進度計算增強 ====================

export function calculateProgressText(current: number, total: number): string {
  const percentage = calculateProgress(current, total);
  return `${percentage}% (${current}/${total})`;
}

export function isCompleted(current: number, total: number): boolean {
  return current >= total;
}

export function remainingAmount(current: number, total: number): number {
  return Math.max(total - current, 0);
}

export function estimatedDaysToComplete(
  current: number,
  total: number,
  dailyAverage: number
): number {
  const remaining = remainingAmount(current, total);
  if (dailyAverage <= 0) return Infinity;
  return Math.ceil(remaining / dailyAverage);
}

// ==================== 連續天數計算 ====================

// 注意：連續天數計算現在統一由 CheckInService 處理
// 此函數保留作為向後相容接口，但建議直接使用 CheckInService.calculateStreak()
export function calculateStreak(
  checkIns: CheckInRecord[],
  practiceId: string,
  currentDate: Date = new Date()
): number {
  const practiceCheckIns = checkIns.filter((c) => c.practiceId === practiceId);

  if (practiceCheckIns.length === 0) return 0;

  // 按日期排序（最新的在前）
  const sortedCheckIns = [...practiceCheckIns].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = startOfDay(currentDate);
  let streak = 0;
  let expectedDate = today;

  // 檢查是否有今日簽到
  const todayString = format(today, 'yyyy-MM-dd');
  const hasCheckedInToday = sortedCheckIns.some((checkIn) => checkIn.date === todayString);

  // 如果今天還沒簽到，從昨天開始算
  if (!hasCheckedInToday) {
    expectedDate = subDays(expectedDate, 1);
  }

  // 使用 while 循環替代 for...of 循環
  let index = 0;
  while (index < sortedCheckIns.length) {
    const checkIn = sortedCheckIns[index];
    const checkInDate = startOfDay(parseISO(checkIn.date));

    if (isSameDay(checkInDate, expectedDate)) {
      streak += 1;
      expectedDate = subDays(expectedDate, 1);
    } else if (isBefore(checkInDate, expectedDate)) {
      const daysDiff = differenceInDays(expectedDate, checkInDate);
      if (daysDiff === 1) {
        // 只相差一天，繼續累積
        streak += 1;
        expectedDate = subDays(checkInDate, 1);
      } else {
        // 相差超過一天，連續中斷，提早退出
        break;
      }
    }
    // 如果簽到日期比預期的晚，繼續檢查下一個記錄
    index += 1;
  }

  return streak;
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return '';

  if (streak >= 21) return '習慣養成大師！';
  if (streak >= 14) return '習慣正在形成！';
  if (streak >= 7) return '一週堅持達成！';
  if (streak >= 3) return '建立習慣中！';

  return `${streak}天連續！`;
}

// ==================== 驗證工具 ====================

export function validatePracticeTitle(title: string): string | null {
  if (!title.trim()) return '請輸入標題';
  if (title.length > 100) return '標題不能超過100個字元';
  return null;
}

export function validatePracticeAmount(amount: number): string | null {
  if (!amount || amount < 1) return '總量必須大於0';
  if (amount > 10000) return '總量不能超過10000';
  return null;
}

export function validateStartDate(date: string): string | null {
  try {
    startDateValidationSchema.parse(date);

    // 額外檢查是否為過去的日期（使用統一的日期處理）
    const selectedDate = parseDate(date);
    const today = startOfDay(new Date());

    if (isBefore(selectedDate, today)) {
      return '開始日期不能是過去的日期';
    }

    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || '日期格式錯誤';
    }
    return '日期驗證失敗';
  }
}

export function validateSmallGoal(content: string): string | null {
  try {
    smallGoalValidationSchema.parse(content);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || '小目標格式錯誤';
    }
    return '小目標驗證失敗';
  }
}

export function validateResource(name: string, url?: string): string | null {
  try {
    resourceValidationSchema.parse({ name, url: url || '' });
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || '資源格式錯誤';
    }
    return '資源驗證失敗';
  }
}

// ==================== 統計工具 ====================

export function calculateDailyAverage(checkIns: CheckInRecord[], practiceId: string, days: number = 7): number {
  const practiceCheckIns = checkIns
    .filter((c) => c.practiceId === practiceId)
    .slice(0, days);

  if (practiceCheckIns.length === 0) return 0;

  const totalProgress = practiceCheckIns.reduce((sum, c) => sum + c.progress, 0);
  return totalProgress / practiceCheckIns.length;
}

export function getRecentActivity(checkIns: CheckInRecord[], practiceId: string, days: number = 7): CheckInRecord[] {
  const cutoffDate = subDays(new Date(), days);

  return checkIns
    .filter((c) => c.practiceId === practiceId && isAfter(parseISO(c.date), cutoffDate))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMostActiveDay(checkIns: CheckInRecord[]): string {
  const dayCount: { [key: string]: number } = {};

  checkIns.forEach((checkIn) => {
    const day = format(parseISO(checkIn.date), 'EEEE'); // 移除中文 locale，使用英文星期
    dayCount[day] = (dayCount[day] || 0) + 1;
  });

  let maxDay = '';
  let maxCount = 0;

  Object.entries(dayCount).forEach(([day, count]) => {
    if (count > maxCount) {
      maxDay = day;
      maxCount = count;
    }
  });

  return maxDay;
}

// ==================== 資料轉換工具 ====================

export function practiceToListItem(practice: Practice) {
  return {
    id: practice.id,
    title: practice.title,
    contentType: practice.contentType,
    status: practice.status,
    currentProgress: practice.currentProgress,
    totalAmount: practice.totalAmount,
    streak: practice.streak,
    lastCheckinDate: practice.lastCheckinDate,
    createdAt: practice.createdAt,
    updatedAt: practice.updatedAt,
    progressPercentage: calculateProgress(practice.currentProgress, practice.totalAmount),
    unit: getContentTypeUnit(practice.contentType),
    statusLabel: getStatusLabel(practice.status),
    statusColor: getStatusColor(practice.status)
  };
}

// 通用的 PathInfo 轉換函數，支持完整的參數
export function pathInfoToCreatePracticeInput(
  pathInfo: Record<string, unknown>,
  practiceAction: string,
  resources: Array<{name: string, url: string}>,
  tags: string[] = [],
  dailyGoalConfig: Record<string, unknown> | null = null
): import('./schema').CreatePracticeInput {
  const contentTypeMap: Record<string, ContentType> = {
    book: 'book',
    video: 'video',
    articles: 'articles',
    podcast: 'podcast',
    course: 'course',
    custom: 'custom'
  };

  const reminderFrequencyMap: Record<string, import('./schema').ReminderFrequency> = {
    daily: 'daily',
    'every-other-day': 'every-other-day',
    'twice-weekly': 'twice-weekly',
    weekly: 'weekly'
  };

  const motivationTypeMap: Record<string, import('./schema').MotivationType> = {
    career: 'career',
    personal: 'personal',
    project: 'project',
    required: 'required',
    other: 'other'
  };

  const contentType = contentTypeMap[String(pathInfo.contentType)] || 'custom';

  // 根據 dailyGoalType 決定 totalAmount 和 unit
  const dailyGoalType = dailyGoalConfig?.type;
  const practiceDays = parseInt(String(pathInfo.totalAmount), 10) || 1;

  let totalAmount: number;
  let unit: string | null;

  if (dailyGoalType === 'time' && dailyGoalConfig) {
    // 時間目標：totalAmount = 實踐天數，unit = null
    totalAmount = practiceDays;
    unit = null;
  } else if (dailyGoalType === 'completion' && dailyGoalConfig) {
    // 完成目標：totalAmount = 天數，unit = 自定義單位
    totalAmount = practiceDays;
    unit = String(dailyGoalConfig.unit || '');
  } else {
    // 預設：使用內容類型的單位
    totalAmount = practiceDays;
    unit = getContentTypeUnit(contentType);
  }

  return {
    title: String(pathInfo.title || ''),
    description: pathInfo.notes ? String(pathInfo.notes) : undefined,
    contentType,
    customContentType: pathInfo.customContentType ? String(pathInfo.customContentType) : undefined,
    totalAmount,
    unit: unit || undefined,
    targetDate: pathInfo.targetDate ? String(pathInfo.targetDate) : undefined,
    motivationType: pathInfo.motivationType ? motivationTypeMap[String(pathInfo.motivationType)] : undefined,
    customMotivation: pathInfo.customMotivation ? String(pathInfo.customMotivation) : undefined,
    reminderEnabled: Boolean(pathInfo.reminderEnabled),
    reminderFrequency: reminderFrequencyMap[String(pathInfo.reminderFrequency)] || 'daily',
    practiceAction,
    resources: resources.map((resource, index) => ({
      name: resource.name,
      url: resource.url,
      type: 'website' as import('./schema').ResourceType,
      order: index
    })),
    tags,
    dailyGoal: dailyGoalConfig && typeof dailyGoalConfig === 'object' ? dailyGoalConfig as {
      type: 'time' | 'completion';
      timeMinutes?: number;
      amount?: number;
      unit?: string;
    } : undefined
  };
}

// 舊版相容函數，保留為向後相容性（但標記為過期）
// @deprecated 使用 pathInfoToCreatePracticeInput 代替
export function pathInfoToPractice(pathInfo: Record<string, unknown>, practiceAction: string, resources: Array<{name: string, url: string}>): Omit<Practice, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date().toISOString();

  return {
    title: String(pathInfo.title || ''),
    description: pathInfo.notes ? String(pathInfo.notes) : undefined,
    contentType: (pathInfo.contentType as ContentType) || 'custom',
    totalAmount: parseInt(String(pathInfo.totalAmount), 10) || 1,
    currentProgress: parseInt(String(pathInfo.currentProgress), 10) || 0,
    unit: getContentTypeUnit((pathInfo.contentType as ContentType) || 'custom'),
    startDate: String(pathInfo.targetDate) || now.split('T')[0],
    targetDate: undefined,
    status: 'active' as PracticeStatus,
    motivationType: String(pathInfo.motivationType) ? (
      ['career', 'personal', 'project', 'required', 'other'].includes(String(pathInfo.motivationType))
        ? String(pathInfo.motivationType) as import('./schema').MotivationType
        : 'personal' as import('./schema').MotivationType
    ) : 'personal' as import('./schema').MotivationType,
    customMotivation: pathInfo.customMotivation ? String(pathInfo.customMotivation) : undefined,
    isPublic: Boolean(pathInfo.isPublic),
    reminderEnabled: Boolean(pathInfo.reminderEnabled),
    reminderFrequency: ['daily', 'every-other-day', 'twice-weekly', 'weekly'].includes(String(pathInfo.reminderFrequency))
      ? String(pathInfo.reminderFrequency) as import('./schema').ReminderFrequency
      : 'daily' as import('./schema').ReminderFrequency,
    streak: Number(pathInfo.streak) || 0,
    lastCheckinDate: pathInfo.lastStreakDate ? String(pathInfo.lastStreakDate) : undefined,
    practiceAction,
    resources: resources.map((resource, index) => ({
      id: generateId(),
      name: resource.name,
      url: resource.url || undefined,
      type: 'website' as import('./schema').ResourceType,
      order: index
    })),
    checkIns: [],
    tags: [],
    likeCount: 0,
    viewCount: 0,
    commentCount: 0,
    shareCount: 0,
  };
}

// ==================== 導出工具 ====================

export function formatDataForExport(practices: Practice[], checkIns: CheckInRecord[]) {
  return practices.map((practice) => {
    const practiceCheckIns = checkIns.filter((c) => c.practiceId === practice.id);

    return {
      標題: practice.title,
      類型: getContentTypeLabel(practice.contentType),
      狀態: getStatusLabel(practice.status),
      進度: `${practice.currentProgress}/${practice.totalAmount} ${practice.unit}`,
      完成率: `${calculateProgress(practice.currentProgress, practice.totalAmount)}%`,
      連續天數: practice.streak,
      建立日期: formatDate(practice.createdAt),
      最後更新: formatDate(practice.updatedAt),
      簽到次數: practiceCheckIns.length,
      平均每日進度: calculateDailyAverage(checkIns, practice.id).toFixed(1)
    };
  });
}

// ==================== 向後相容性工具 ====================

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

// 支持舊版的 ContentTypeOption 和 MotivationOption
export interface ContentTypeOption {
  id: ContentTypeString;
  label: string;
  icon: unknown; // ComponentType 的簡化版本
}

export interface MotivationOption {
  id: MotivationTypeString;
  label: string;
}
