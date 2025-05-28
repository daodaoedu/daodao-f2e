import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { Practice, ContentType, PracticeStatus, CheckInRecord, MoodType, ResourceType } from './schema';
import { z } from 'zod';

// 驗證 schema (用於向後相容)
const startDateValidationSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '請輸入有效的日期格式 YYYY-MM-DD');
const smallGoalValidationSchema = z.string().min(1, '請輸入目標內容').max(200, '目標內容不可超過 200 字');
const resourceValidationSchema = z.object({
  name: z.string().min(1, '請輸入資源名稱').max(100, '資源名稱不可超過 100 字'),
  url: z.string().url('請輸入有效的網址').optional().or(z.literal(''))
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

// 進度計算
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

// 內容類型工具
export function getContentTypeLabel(contentType: ContentType): string {
  const labels: Record<ContentType, string> = {
    'book': '書籍',
    'video': '影片課程',
    'articles': '文章',
    'podcast': 'Podcast',
    'course': '課程',
    'custom': '自定義'
  };
  
  return labels[contentType] || '未知';
}

export function getContentTypeUnit(contentType: ContentType): string {
  const units: Record<ContentType, string> = {
    'book': '頁',
    'video': '課',
    'articles': '篇',
    'podcast': '集',
    'course': '單元',
    'custom': '項目'
  };
  
  return units[contentType] || '項目';
}

export function getContentTypeIcon(contentType: ContentType): string {
  const icons: Record<ContentType, string> = {
    'book': '📚',
    'video': '🎬',
    'articles': '📄',
    'podcast': '🎧',
    'course': '🎓',
    'custom': '⚙️'
  };
  
  return icons[contentType] || '📝';
}

// 狀態工具
export function getStatusLabel(status: PracticeStatus): string {
  const labels: Record<PracticeStatus, string> = {
    'draft': '草稿',
    'active': '進行中',
    'paused': '暫停',
    'completed': '已完成',
    'archived': '已封存'
  };
  
  return labels[status] || '未知';
}

export function getStatusColor(status: PracticeStatus): string {
  const colors: Record<PracticeStatus, string> = {
    'draft': '#92989A',
    'active': '#16B9B3',
    'paused': '#FF9526',
    'completed': '#86C84A',
    'archived': '#536166'
  };
  
  return colors[status] || '#92989A';
}

export function canCheckIn(practice: Practice): boolean {
  return practice.status === 'active' && practice.currentProgress < practice.totalAmount;
}

export function shouldShowInActiveList(practice: Practice): boolean {
  return practice.status === 'active' || practice.status === 'paused';
}

// 搜尋和篩選工具
export function searchPractices(practices: Practice[], searchTerm: string): Practice[] {
  if (!searchTerm.trim()) return practices;
  
  const term = searchTerm.toLowerCase();
  return practices.filter(practice => 
    practice.title.toLowerCase().includes(term) ||
    (practice.description && practice.description.toLowerCase().includes(term)) ||
    practice.smallGoals.some(goal => goal.content.toLowerCase().includes(term)) ||
    practice.resources.some(resource => resource.name.toLowerCase().includes(term))
  );
}

export function sortPractices(
  practices: Practice[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc' = 'desc'
): Practice[] {
  const sorted = [...practices];
  
  sorted.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'createdAt':
        aValue = dayjs(a.createdAt);
        bValue = dayjs(b.createdAt);
        break;
      case 'updatedAt':
        aValue = dayjs(a.updatedAt);
        bValue = dayjs(b.updatedAt);
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

    if (dayjs.isDayjs(aValue) && dayjs.isDayjs(bValue)) {
      return sortOrder === 'asc' ? aValue.diff(bValue) : bValue.diff(aValue);
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

// ==================== 日期處理 ====================

export function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY年MM月DD日');
}

export function formatTime(date: string | Date): string {
  return dayjs(date).format('HH:mm');
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY年MM月DD日 HH:mm');
}

export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function daysBetween(date1: string | Date, date2: string | Date): number {
  return Math.abs(dayjs(date2).diff(dayjs(date1), 'day'));
}

export function isConsecutiveDay(lastDate: string | Date, currentDate: string | Date): boolean {
  return dayjs(currentDate).diff(dayjs(lastDate), 'day') === 1;
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

export function calculateStreak(
  checkIns: CheckInRecord[], 
  practiceId: string, 
  currentDate: Date = new Date()
): number {
  const practiceCheckIns = checkIns
    .filter(c => c.practiceId === practiceId)
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  if (practiceCheckIns.length === 0) return 0;

  let streak = 0;
  let checkDate = dayjs(currentDate).startOf('day');

  for (const checkIn of practiceCheckIns) {
    const checkinDate = dayjs(checkIn.date).startOf('day');

    if (checkinDate.isSame(checkDate)) {
      streak++;
      checkDate = checkDate.subtract(1, 'day');
    } else if (checkinDate.isBefore(checkDate)) {
      const daysDiff = checkDate.diff(checkinDate, 'day');
      if (daysDiff === 1) {
        streak++;
        checkDate = checkinDate.subtract(1, 'day');
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return '';
  
  if (streak >= 21) return '💎 習慣養成大師！';
  if (streak >= 14) return '🌟 習慣正在形成！';
  if (streak >= 7) return '⭐ 一週堅持達成！';
  if (streak >= 3) return '🔥 建立習慣中！';
  
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
    
    // 額外檢查是否為過去的日期
    const selectedDate = dayjs(date);
    const today = dayjs().startOf('day');
    
    if (selectedDate.isBefore(today)) {
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
    .filter(c => c.practiceId === practiceId)
    .slice(0, days);

  if (practiceCheckIns.length === 0) return 0;

  const totalProgress = practiceCheckIns.reduce((sum, c) => sum + c.progress, 0);
  return totalProgress / practiceCheckIns.length;
}

export function getRecentActivity(checkIns: CheckInRecord[], practiceId: string, days: number = 7): CheckInRecord[] {
  const cutoffDate = dayjs().subtract(days, 'day');

  return checkIns
    .filter(c => c.practiceId === practiceId && dayjs(c.date).isAfter(cutoffDate))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
}

export function getMostActiveDay(checkIns: CheckInRecord[]): string {
  const dayCount: { [key: string]: number } = {};

  checkIns.forEach(checkIn => {
    const day = dayjs(checkIn.date).format('dddd');
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

export function pathInfoToPractice(pathInfo: any, smallGoals: any[], resources: any[]): Omit<Practice, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date().toISOString();
  
  return {
    title: pathInfo.title,
    description: pathInfo.notes || undefined,
    contentType: pathInfo.contentType as ContentType,
    totalAmount: parseInt(pathInfo.totalAmount, 10),
    currentProgress: parseInt(pathInfo.currentProgress, 10),
    unit: getContentTypeUnit(pathInfo.contentType as ContentType),
    startDate: pathInfo.targetDate || now.split('T')[0],
    targetDate: undefined,
    status: 'active' as PracticeStatus,
    motivationType: pathInfo.motivationType || 'personal',
    customMotivation: pathInfo.customMotivation || undefined,
    isPublic: pathInfo.isPublic,
    reminderEnabled: pathInfo.reminderEnabled,
    reminderFrequency: pathInfo.reminderFrequency,
    streak: pathInfo.streak || 0,
    lastCheckinDate: pathInfo.lastStreakDate || undefined,
    smallGoals: smallGoals.map((goal, index) => ({
      id: generateId(),
      content: goal.content,
      isCompleted: false,
      order: index
    })),
    resources: resources.map((resource, index) => ({
      id: generateId(),
      name: resource.name,
      url: resource.url || undefined,
      type: 'website' as ResourceType,
      order: index
    })),
    checkIns: []
  };
}

// ==================== 導出工具 ====================

export function formatDataForExport(practices: Practice[], checkIns: CheckInRecord[]) {
  return practices.map(practice => {
    const practiceCheckIns = checkIns.filter(c => c.practiceId === practice.id);
    
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

// 支持舊版的 MainView 和 DashboardView 類型
export type MainView = 'setup' | 'dashboard' | 'list';
export type DashboardView = 'main' | 'checkin' | 'history';

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

// 支持舊版的 ContentTypeOption 和 MotivationOption
export interface ContentTypeOption {
  id: ContentTypeString;
  label: string;
  icon: any; // ComponentType 的簡化版本
}

export interface MotivationOption {
  id: MotivationTypeString;
  label: string;
}

// ==================== CheckIn 服務工具 ====================

export function hasCheckedInToday(practice: Practice): boolean {
  const today = dayjs().format('YYYY-MM-DD');
  return practice.checkIns?.some(checkIn => checkIn.date === today) || false;
}

export function getTodayCheckIn(practice: Practice): CheckInRecord | undefined {
  const today = dayjs().format('YYYY-MM-DD');
  return practice.checkIns?.find(checkIn => checkIn.date === today);
}

export function checkMilestones(newStreak: number, oldStreak: number): string[] {
  const milestones = [
    { days: 3, message: '🔥 建立習慣中！連續3天簽到' },
    { days: 7, message: '⭐ 一週堅持！你很棒' },
    { days: 14, message: '💪 兩週不間斷！習慣正在養成' },
    { days: 21, message: '💎 習慣養成！連續21天的努力' },
    { days: 30, message: '🏆 一個月達成！你是真正的學習者' },
    { days: 50, message: '🌟 50天里程碑！持續的力量' },
    { days: 100, message: '👑 百日成就！你已經成為習慣大師' }
  ];

  const achievements: string[] = [];

  milestones.forEach(milestone => {
    if (newStreak >= milestone.days && oldStreak < milestone.days) {
      achievements.push(milestone.message);
    }
  });

  return achievements;
}

export function getCheckInSuggestions(practice: Practice): string[] {
  const suggestions: string[] = [];
  const checkIns = practice.checkIns || [];
  
  // 基於歷史資料給建議
  if (checkIns.length > 0) {
    const recentCheckIns = checkIns.slice(-7); // 最近7次簽到
    const averageRecent = recentCheckIns.reduce((sum, c) => sum + c.progress, 0) / recentCheckIns.length;
    const totalAverage = calculateDailyAverage(checkIns, practice.id);
    
    if (averageRecent < totalAverage * 0.8) {
      suggestions.push('💡 最近進度有所放緩，建議調整學習計畫或休息一下');
    }
    
    const lastWeekCheckIns = getRecentActivity(checkIns, practice.id, 7).length;
    if (lastWeekCheckIns < 3) {
      suggestions.push('⏰ 本週簽到較少，試著設定固定的學習時間');
    }
  }

  // 進度建議
  const progressRatio = practice.currentProgress / practice.totalAmount;
  if (progressRatio > 0.8) {
    suggestions.push('🎉 快要完成了！保持最後的衝刺');
  } else if (progressRatio < 0.2 && checkIns.length > 10) {
    suggestions.push('🎯 進度較慢，考慮重新評估目標或調整學習方法');
  }

  // 連續天數建議
  const currentStreak = practice.streak;
  if (currentStreak === 0 && checkIns.length > 0) {
    suggestions.push('🔄 重新開始學習旅程，每一天都是新的開始');
  } else if (currentStreak >= 7) {
    suggestions.push('🔥 連續簽到表現優秀！保持這個節奏');
  }

  return suggestions;
}
