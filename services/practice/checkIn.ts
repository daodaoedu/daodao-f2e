import { Practice, CheckInRecord, CheckInInput, MoodType } from './types';

// 簽到服務類
export class CheckInService {
  // 執行簽到
  static createCheckIn(practice: Practice, input: CheckInInput): CheckInRecord {
    const now = new Date();
    const checkInRecord: CheckInRecord = {
      id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      practiceId: practice.id,
      date: now.toISOString().split('T')[0], // YYYY-MM-DD 格式
      progress: input.progress,
      totalProgress: practice.currentProgress + input.progress,
      note: input.note || '',
      mood: input.mood,
      tags: input.tags || [],
      createdAt: now.toISOString()
    };

    return checkInRecord;
  }

  // 檢查今日是否已簽到
  static hasCheckedInToday(practice: Practice): boolean {
    const today = new Date().toISOString().split('T')[0];
    return practice.checkIns?.some(checkIn => checkIn.date === today) || false;
  }

  // 取得今日簽到記錄
  static getTodayCheckIn(practice: Practice): CheckInRecord | undefined {
    const today = new Date().toISOString().split('T')[0];
    return practice.checkIns?.find(checkIn => checkIn.date === today);
  }

  // 計算連續天數
  static calculateStreak(practice: Practice): number {
    if (!practice.checkIns || practice.checkIns.length === 0) {
      return 0;
    }

    // 按日期排序（最新的在前）
    const sortedCheckIns = [...practice.checkIns].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    // 檢查是否有今日簽到
    const todayString = today.toISOString().split('T')[0];
    let hasCheckedInToday = sortedCheckIns.some(checkIn => checkIn.date === todayString);

    // 如果今天還沒簽到，從昨天開始算
    if (!hasCheckedInToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // 往回檢查連續天數
    for (const checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);

      if (checkInDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (checkInDate.getTime() < currentDate.getTime()) {
        // 如果簽到日期比預期的早，說明中間有斷開
        break;
      }
      // 如果簽到日期比預期的晚，繼續檢查下一個記錄
    }

    return streak;
  }

  // 檢查是否達成里程碑
  static checkMilestones(newStreak: number, oldStreak: number): string[] {
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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const lastWeekCheckIns = checkIns.filter(checkIn => 
      new Date(checkIn.date) >= oneWeekAgo
    ).length;

    // 心情分佈
    const moodDistribution: Record<MoodType, number> = {
      excellent: 0,
      good: 0,
      average: 0,
      challenging: 0,
      difficult: 0
    };

    checkIns.forEach(checkIn => {
      if (checkIn.mood) {
        moodDistribution[checkIn.mood]++;
      }
    });

    // 最近4週的進度趨勢
    const weeklyProgress: number[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekCheckIns = checkIns.filter(checkIn => {
        const checkInDate = new Date(checkIn.date);
        return checkInDate >= weekStart && checkInDate < weekEnd;
      });

      const weekProgress = weekCheckIns.reduce((sum, checkIn) => sum + checkIn.progress, 0);
      weeklyProgress.push(weekProgress);
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
        suggestions.push('💡 最近進度有所放緩，建議調整學習計劃或休息一下');
      }
      
      if (stats.lastWeekCheckIns < 3) {
        suggestions.push('⏰ 本週簽到較少，試著設定固定的學習時間');
      }
      
      // 心情建議
      const negativeRatio = (stats.moodDistribution.challenging + stats.moodDistribution.difficult) / stats.totalCheckIns;
      if (negativeRatio > 0.5) {
        suggestions.push('🌟 最近學習感覺有挑戰性，可以考慮降低目標或尋求幫助');
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
    const currentStreak = this.calculateStreak(practice);
    if (currentStreak === 0 && checkIns.length > 0) {
      suggestions.push('🔄 重新開始學習旅程，每一天都是新的開始');
    } else if (currentStreak >= 7) {
      suggestions.push('🔥 連續簽到表現優秀！保持這個節奏');
    }

    return suggestions;
  }

  // 驗證簽到輸入
  static validateCheckInInput(practice: Practice, input: CheckInInput): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 檢查是否今日已簽到
    if (this.hasCheckedInToday(practice)) {
      errors.push('今天已經簽到過了');
    }

    // 檢查進度是否合理
    if (input.progress <= 0) {
      errors.push('進度必須大於0');
    }

    if (input.progress > practice.totalAmount) {
      errors.push('單次進度不能超過總目標');
    }

    const newTotal = practice.currentProgress + input.progress;
    if (newTotal > practice.totalAmount) {
      errors.push(`總進度將超過目標（${newTotal}/${practice.totalAmount}）`);
    }

    // 檢查筆記長度
    if (input.note && input.note.length > 500) {
      errors.push('簽到筆記不能超過500字元');
    }

    // 檢查標籤
    if (input.tags && input.tags.length > 5) {
      errors.push('標籤不能超過5個');
    }

    if (input.tags) {
      const invalidTags = input.tags.filter(tag => tag.length > 20);
      if (invalidTags.length > 0) {
        errors.push('單個標籤不能超過20字元');
      }
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
    const today = new Date().toISOString().split('T')[0];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const moodEmojis: Record<MoodType, string> = {
      excellent: '😄',
      good: '😊',
      average: '😐',
      challenging: '😤',
      difficult: '😰'
    };

    return checkIns
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(checkIn => ({
        date: checkIn.date,
        displayDate: this.formatDisplayDate(checkIn.date),
        progress: checkIn.progress,
        totalProgress: checkIn.totalProgress,
        note: checkIn.note || '',
        mood: checkIn.mood,
        moodEmoji: checkIn.mood ? moodEmojis[checkIn.mood] : undefined,
        tags: checkIn.tags || [],
        isToday: checkIn.date === today,
        isRecent: new Date(checkIn.date) >= threeDaysAgo
      }));
  }

  // 格式化顯示日期
  private static formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) {
      return '今天';
    } else if (dateStr === yesterdayStr) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
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