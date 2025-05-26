// 工具函數
import { Practice, CheckInRecord, ContentType, PracticeStatus } from './types';

// ==================== ID 生成 ====================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePracticeId(): string {
  return `practice_${generateId()}`;
}

export function generateCheckInId(): string {
  return `checkin_${generateId()}`;
}

// ==================== 日期處理 ====================

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('zh-TW', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function isToday(date: string | Date): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getFullYear() === checkDate.getFullYear() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getDate() === checkDate.getDate();
}

export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isConsecutiveDay(lastDate: string | Date, currentDate: string | Date): boolean {
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffDays = daysBetween(last, current);
  return diffDays === 1;
}

// ==================== 進度計算 ====================

export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (practiceCheckIns.length === 0) return 0;

  let streak = 0;
  let checkDate = new Date(currentDate);
  checkDate.setHours(0, 0, 0, 0);

  for (const checkIn of practiceCheckIns) {
    const checkinDate = new Date(checkIn.date);
    checkinDate.setHours(0, 0, 0, 0);

    if (checkinDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (checkinDate.getTime() < checkDate.getTime()) {
      const daysDiff = daysBetween(checkinDate, checkDate);
      if (daysDiff === 1) {
        streak++;
        checkDate = new Date(checkinDate);
        checkDate.setDate(checkDate.getDate() - 1);
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

// ==================== 內容類型工具 ====================

export function getContentTypeLabel(contentType: ContentType): string {
  const labels = {
    book: '書籍',
    video: '影片課程',
    articles: '文章',
    podcast: 'Podcast',
    course: '課程',
    custom: '自定義'
  };
  
  return labels[contentType] || '未知';
}

export function getContentTypeUnit(contentType: ContentType): string {
  const units = {
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
  const icons = {
    book: '📚',
    video: '🎬',
    articles: '📄',
    podcast: '🎧',
    course: '🎓',
    custom: '⚙️'
  };
  
  return icons[contentType] || '📝';
}

// ==================== 狀態工具 ====================

export function getStatusLabel(status: PracticeStatus): string {
  const labels = {
    draft: '草稿',
    active: '進行中',
    paused: '暫停',
    completed: '已完成',
    archived: '已封存'
  };
  
  return labels[status] || '未知';
}

export function getStatusColor(status: PracticeStatus): string {
  const colors = {
    draft: '#92989A',      // basic-300
    active: '#16B9B3',     // primary-base
    paused: '#FF9526',     // tips
    completed: '#86C84A',  // success
    archived: '#536166'    // basic-400
  };
  
  return colors[status] || '#92989A';
}

export function canCheckIn(practice: Practice): boolean {
  return practice.status === 'active' && !isCompleted(practice.currentProgress, practice.totalAmount);
}

export function shouldShowInActiveList(practice: Practice): boolean {
  return practice.status === 'active' || practice.status === 'paused';
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
  if (!date) return '請選擇開始日期';
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) return '開始日期不能是過去的日期';
  return null;
}

export function validateSmallGoal(content: string): string | null {
  if (!content.trim()) return '請輸入小目標內容';
  if (content.length > 50) return '小目標不能超過50個字元';
  return null;
}

export function validateResource(name: string, url?: string): string | null {
  if (!name.trim()) return '請輸入資源名稱';
  if (name.length > 100) return '資源名稱不能超過100個字元';
  
  if (url && url.trim()) {
    try {
      new URL(url);
    } catch {
      return '請輸入有效的網址';
    }
  }
  
  return null;
}

// ==================== 搜尋和篩選工具 ====================

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

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
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
    startDate: pathInfo.targetDate || now,
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
      type: 'website' as any,
      order: index
    })),
    checkIns: []
  };
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
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return checkIns
    .filter(c => c.practiceId === practiceId && new Date(c.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMostActiveDay(checkIns: CheckInRecord[]): string {
  const dayCount: { [key: string]: number } = {};

  checkIns.forEach(checkIn => {
    const day = new Date(checkIn.date).toLocaleDateString('zh-TW', { weekday: 'long' });
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