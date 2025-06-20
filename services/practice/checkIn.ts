import { z } from 'zod';
import { parseISO, startOfDay, subDays, isAfter, isBefore, isSameDay, differenceInDays, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Practice, CheckInRecord, CheckInInput, MoodType } from './schema';
import { getRecentActivity, generateCheckInId, getCurrentDateISO, getCurrentTimeISO } from './utils';

// 簽到輸入驗證 schema
const checkInInputValidationSchema = z.object({
  practiceId: z.string().min(1, '請提供實踐 ID'),
  progress: z.number().min(0, '進度必須大於等於 0'),
  note: z.string().max(1000, '簽到筆記不能超過 1000 字元').optional(),
  mood: z.enum(['excellent', 'good', 'average', 'challenging', 'difficult']).optional(),
  tags: z.array(z.string().max(20, '單個標籤不能超過 20 字元')).max(5, '標籤不能超過 5 個').default([])
});

// 簽到服務類
export class CheckInService {
  // 執行簽到
  static createCheckIn(practice: Practice, input: CheckInInput): CheckInRecord {
    const checkInRecord: CheckInRecord = {
      id: generateCheckInId(),
      practiceId: practice.id,
      date: getCurrentDateISO(),
      progress: input.progress,
      totalProgress: practice.currentProgress + input.progress,
      note: input.note || '',
      mood: input.mood,
      tags: input.tags || [],
      createdAt: getCurrentTimeISO()
    };

    return checkInRecord;
  }

  // 檢查今日是否已簽到
  static hasCheckedInToday(practice: Practice): boolean {
    const today = getCurrentDateISO();
    return practice.checkIns?.some((checkIn) => checkIn.date === today) || false;
  }

  // 取得今日簽到記錄
  static getTodayCheckIn(practice: Practice): CheckInRecord | undefined {
    const today = getCurrentDateISO();
    return practice.checkIns?.find((checkIn) => checkIn.date === today);
  }

  // 計算連續天數
  static calculateStreak(practice: Practice): number {
    if (!practice.checkIns || practice.checkIns.length === 0) {
      return 0;
    }

    // 按日期排序（最新的在前）
    const sortedCheckIns = [...practice.checkIns].sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    const today = startOfDay(new Date());

    let streak = 0;
    let currentDate = today;

    // 檢查是否有今日簽到
    const todayString = getCurrentDateISO();
    const hasCheckedInToday = sortedCheckIns.some((checkIn) => checkIn.date === todayString);

    // 如果今天還沒簽到，從昨天開始算
    if (!hasCheckedInToday) {
      currentDate = subDays(currentDate, 1);
    }

    // 使用 Array.some() 或 Array.every() 替代 for...of 循環
    let index = 0;
    while (index < sortedCheckIns.length) {
      const checkIn = sortedCheckIns[index];
      const checkInDate = startOfDay(parseISO(checkIn.date));

      if (isSameDay(checkInDate, currentDate)) {
        streak += 1;
        currentDate = subDays(currentDate, 1);
      } else if (isBefore(checkInDate, currentDate)) {
        // 如果簽到日期比預期的早，說明中間有斷開
        const daysDiff = differenceInDays(currentDate, checkInDate);
        if (daysDiff === 1) {
          // 如果只相差一天，繼續累積
          streak += 1;
          currentDate = subDays(checkInDate, 1);
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

  // 檢查是否達成里程碑
  static checkMilestones(newStreak: number, oldStreak: number): string[] {
    const milestones = [
      { days: 3, message: '建立習慣中！連續3天簽到', icon: 'flame' },
      { days: 7, message: '一週堅持！你很棒', icon: 'star' },
      { days: 14, message: '兩週不間斷！習慣正在養成', icon: 'zap' },
      { days: 21, message: '習慣養成！連續21天的努力', icon: 'gem' },
      { days: 30, message: '一個月達成！你是真正的學習者', icon: 'trophy' },
      { days: 50, message: '50天里程碑！持續的力量', icon: 'sparkles' },
      { days: 100, message: '百日成就！你已經成為習慣大師', icon: 'crown' }
    ];

    const achievements: string[] = [];

    milestones.forEach((milestone) => {
      if (newStreak >= milestone.days && oldStreak < milestone.days) {
        achievements.push(milestone.message);
      }
    });

    return achievements;
  }

  // 取得簽到歷史統計
  static getCheckInStats(practice: Practice): {
    totalCheckIns: number;
    averageProgress: number;
    lastWeekCheckIns: number;
    moodDistribution: Record<MoodType, number>;
    weeklyProgress: number[];
  } {
    const checkIns = practice.checkIns || [];

    if (checkIns.length === 0) {
      return {
        totalCheckIns: 0,
        averageProgress: 0,
        lastWeekCheckIns: 0,
        moodDistribution: {
          excellent: 0,
          good: 0,
          average: 0,
          challenging: 0,
          difficult: 0
        },
        weeklyProgress: []
      };
    }

    // 總簽到次數
    const totalCheckIns = checkIns.length;

    // 平均進度
    const totalProgress = checkIns.reduce((sum, checkIn) => sum + checkIn.progress, 0);
    const averageProgress = Math.round(totalProgress / totalCheckIns);

    // 最近一週簽到次數
    const lastWeekCheckIns = getRecentActivity(checkIns, practice.id, 7).length;

    // 心情分佈
    const moodDistribution: Record<MoodType, number> = {
      excellent: 0,
      good: 0,
      average: 0,
      challenging: 0,
      difficult: 0
    };

    checkIns.forEach((checkIn) => {
      if (checkIn.mood) {
        moodDistribution[checkIn.mood] += 1;
      }
    });

    // 最近4週的進度趨勢
    const weeklyProgress: number[] = [];
    let i = 3;
    while (i >= 0) {
      const weekStart = subDays(new Date(), (i + 1) * 7);
      const weekEnd = subDays(new Date(), i * 7);

      const weekCheckIns = checkIns.filter((checkIn) => {
        const checkInDate = parseISO(checkIn.date);
        return isAfter(checkInDate, weekStart) && isBefore(checkInDate, weekEnd);
      });

      const weekProgress = weekCheckIns.reduce((sum, checkIn) => sum + checkIn.progress, 0);
      weeklyProgress.push(weekProgress);
      i -= 1;
    }

    return {
      totalCheckIns,
      averageProgress,
      lastWeekCheckIns,
      moodDistribution,
      weeklyProgress
    };
  }

  // 取得簽到建議
  static getCheckInSuggestions(practice: Practice): string[] {
    const suggestions: string[] = [];
    const checkIns = practice.checkIns || [];
    const stats = this.getCheckInStats(practice);

    // 基於歷史資料給建議
    if (checkIns.length > 0) {
      const recentCheckIns = checkIns.slice(-7); // 最近7次簽到
      const averageRecent = recentCheckIns.reduce((sum, c) => sum + c.progress, 0) / recentCheckIns.length;

      if (averageRecent < stats.averageProgress * 0.8) {
        suggestions.push('最近進度有所放緩，建議調整學習計畫或休息一下');
      }

      if (stats.lastWeekCheckIns < 3) {
        suggestions.push('本週簽到較少，試著設定固定的學習時間');
      }

      // 心情建議
      const negativeRatio = (stats.moodDistribution.challenging + stats.moodDistribution.difficult) / stats.totalCheckIns;
      if (negativeRatio > 0.5) {
        suggestions.push('最近學習感覺有挑戰性，可以考慮降低目標或尋求幫助');
      }
    }

    // 進度建議
    const progressRatio = practice.currentProgress / practice.totalAmount;
    if (progressRatio > 0.8) {
      suggestions.push('快要完成了！保持最後的衝刺');
    } else if (progressRatio < 0.2 && checkIns.length > 10) {
      suggestions.push('進度較慢，考慮重新評估目標或調整學習方法');
    }

    // 連續天數建議
    const currentStreak = this.calculateStreak(practice);
    if (currentStreak === 0 && checkIns.length > 0) {
      suggestions.push('重新開始學習旅程，每一天都是新的開始');
    } else if (currentStreak >= 7) {
      suggestions.push('連續簽到表現優秀！保持這個節奏');
    }

    return suggestions;
  }

  // 驗證簽到輸入
  static validateCheckInInput(practice: Practice, input: CheckInInput): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 使用 zod 驗證基本輸入格式
    try {
      checkInInputValidationSchema.parse(input);
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        zodError.errors.forEach((error) => {
          errors.push(error.message);
        });
      }
    }

    // 業務邏輯驗證
    // 檢查是否今日已簽到
    if (this.hasCheckedInToday(practice)) {
      errors.push('今天已經簽到過了');
    }

    // 檢查進度是否合理
    if (input.progress > practice.totalAmount) {
      errors.push('單次進度不能超過總目標');
    }

    const newTotal = practice.currentProgress + input.progress;
    if (newTotal > practice.totalAmount) {
      errors.push(`總進度將超過目標（${newTotal}/${practice.totalAmount}）`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 格式化簽到歷史用於顯示
  static formatCheckInHistory(practice: Practice): Array<{
    date: string;
    displayDate: string;
    progress: number;
    totalProgress: number;
    note: string;
    mood?: MoodType;
    moodEmoji?: string;
    tags: string[];
    isToday: boolean;
    isRecent: boolean;
  }> {
    const checkIns = practice.checkIns || [];
    const today = format(new Date(), 'yyyy-MM-dd');
    const threeDaysAgo = subDays(new Date(), 3);

    const moodLabels: Record<MoodType, string> = {
      excellent: '極佳',
      good: '良好',
      average: '普通',
      challenging: '有挑戰',
      difficult: '困難'
    };

    return checkIns
      .sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .map((checkIn) => ({
        date: checkIn.date,
        displayDate: this.formatDisplayDate(checkIn.date),
        progress: checkIn.progress,
        totalProgress: checkIn.totalProgress,
        note: checkIn.note || '',
        mood: checkIn.mood,
        moodLabel: checkIn.mood ? moodLabels[checkIn.mood] : undefined,
        tags: checkIn.tags || [],
        isToday: checkIn.date === today,
        isRecent: isAfter(parseISO(checkIn.date), threeDaysAgo)
      }));
  }

  // 格式化顯示日期
  private static formatDisplayDate(dateString: string): string {
    const date = parseISO(dateString);
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);

    if (isSameDay(date, today)) {
      return '今天';
    } else if (isSameDay(date, yesterday)) {
      return '昨天';
    } else {
      return format(date, 'MM月dd日 EEEE', { locale: zhTW });
    }
  }

  // 產生簽到摘要
  static generateCheckInSummary(practice: Practice): string {
    const stats = this.getCheckInStats(practice);
    const streak = this.calculateStreak(practice);
    const progressPercent = Math.round((practice.currentProgress / practice.totalAmount) * 100);

    let summary = `📊 學習摘要\n`;
    summary += `• 總進度: ${practice.currentProgress}/${practice.totalAmount} (${progressPercent}%)\n`;
    summary += `• 簽到次數: ${stats.totalCheckIns} 次\n`;
    summary += `• 連續天數: ${streak} 天\n`;
    summary += `• 平均進度: ${stats.averageProgress} ${practice.unit}/次\n`;

    if (stats.totalCheckIns > 0) {
      const dominantMood = Object.entries(stats.moodDistribution)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0] as MoodType;

      const moodLabels: Record<MoodType, string> = {
        excellent: '優秀',
        good: '良好',
        average: '普通',
        challenging: '有挑戰',
        difficult: '困難'
      };

      summary += `• 主要心情: ${moodLabels[dominantMood]}\n`;
    }

    return summary;
  }
}
