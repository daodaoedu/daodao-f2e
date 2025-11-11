import {
  Practice,
  PracticeFilter,
  PracticeStats
} from './schema';

// 本地儲存鍵
const STORAGE_KEYS = {
  PRACTICES: 'practices',
  SETTINGS: 'practice_settings'
} as const;

// 設定介面
interface PracticeSettings {
  reminderEnabled: boolean;
  reminderTime: string;
  autoBackup: boolean;
  theme: 'light' | 'dark' | 'system';
}

// 儲存服務類
export class PracticeStorage {
  // ==================== 實踐管理 ====================

  static async getAllPractices(): Promise<Practice[]> {
    try {
      if (typeof window === 'undefined') {
        return [];
      }

      const stored = localStorage.getItem(STORAGE_KEYS.PRACTICES);
      if (!stored) {
        return [];
      }

      const practices = JSON.parse(stored) as Practice[];
      return practices.map((practice) => ({
        ...practice,
        practiceAction: practice.practiceAction || undefined,
        resources: practice.resources || [],
        checkIns: practice.checkIns || [],
        tags: practice.tags || [],
        dailyGoal: practice.dailyGoal || undefined
      }));
    } catch (error) {
      console.error('Error loading practices:', error);
      return [];
    }
  }

  static async savePractices(practices: Practice[]): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      localStorage.setItem(STORAGE_KEYS.PRACTICES, JSON.stringify(practices));
    } catch (error) {
      console.error('Error saving practices:', error);
      throw new Error('儲存實踐失敗');
    }
  }

  static async getPracticeById(id: string): Promise<Practice | null> {
    const practices = await this.getAllPractices();
    return practices.find((p) => p.id === id) || null;
  }

  static async createPractice(practice: Practice): Promise<Practice> {
    const practices = await this.getAllPractices();
    practices.push(practice);
    await this.savePractices(practices);
    return practice;
  }

  static async updatePractice(id: string, updates: Partial<Practice>): Promise<Practice | null> {
    const practices = await this.getAllPractices();
    const index = practices.findIndex((p) => p.id === id);

    if (index === -1 || !practices[index]) {
      return null;
    }

    const updatedPractice = {
      ...practices[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    practices[index] = updatedPractice;

    await this.savePractices(practices);
    return practices[index] ?? null;
  }

  static async deletePractice(id: string): Promise<boolean> {
    const practices = await this.getAllPractices();
    const filteredPractices = practices.filter((p) => p.id !== id);

    if (filteredPractices.length === practices.length) {
      return false; // 沒有找到要刪除的實踐
    }

    await this.savePractices(filteredPractices);
    return true;
  }

  // ==================== 篩選和查詢 ====================

  static async filterPractices(filter: PracticeFilter): Promise<Practice[]> {
    let practices = await this.getAllPractices();

    // 搜尋關鍵字
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      practices = practices.filter((practice) =>
        practice.title.toLowerCase().includes(term) ||
        (practice.description && practice.description.toLowerCase().includes(term)) ||
        (practice.practiceAction && practice.practiceAction.toLowerCase().includes(term)) ||
        practice.resources.some((resource) => resource.name.toLowerCase().includes(term)) ||
        (practice.tags && practice.tags.some((tag) => tag.toLowerCase().includes(term)))
      );
    }

    // 狀態篩選
    if (filter.status && filter.status.length > 0) {
      practices = practices.filter((practice) => filter.status!.includes(practice.status));
    }

    // 內容類型篩選
    if (filter.contentType && filter.contentType.length > 0) {
      practices = practices.filter((practice) => filter.contentType!.includes(practice.contentType));
    }

    // 動機類型篩選
    if (filter.motivationType && filter.motivationType.length > 0) {
      practices = practices.filter((practice) =>
        practice.motivationType && filter.motivationType!.includes(practice.motivationType)
      );
    }

    // 日期範圍篩選
    if (filter.dateRange) {
      if (filter.dateRange.start) {
        practices = practices.filter((practice) => practice.createdAt >= filter.dateRange!.start!);
      }
      if (filter.dateRange.end) {
        practices = practices.filter((practice) => practice.createdAt <= filter.dateRange!.end!);
      }
    }

    // 排序
    if (filter.sortBy) {
      practices.sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (filter.sortBy) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          case 'progress':
            aValue = (a.currentProgress / a.totalAmount) * 100;
            bValue = (b.currentProgress / b.totalAmount) * 100;
            break;
          case 'streak':
            aValue = a.streak;
            bValue = b.streak;
            break;
          default:
            return 0;
        }

        if (filter.sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    return practices;
  }

  // ==================== 統計資料 ====================

  static async getPracticeStats(): Promise<PracticeStats> {
    const practices = await this.getAllPractices();

    const stats: PracticeStats = {
      total: practices.length,
      active: practices.filter((p) => p.status === 'active').length,
      completed: practices.filter((p) => p.status === 'completed').length,
      paused: practices.filter((p) => p.status === 'paused').length,
      archived: practices.filter((p) => p.status === 'archived').length,
      totalCheckIns: practices.reduce((sum, p) => sum + (p.checkIns?.length || 0), 0),
      longestStreak: practices.reduce((max, p) => Math.max(max, p.streak), 0),
      averageProgress: practices.length > 0
        ? practices.reduce((sum, p) => sum + ((p.currentProgress / p.totalAmount) * 100), 0) / practices.length
        : 0
    };

    return stats;
  }

  static async clearAllData(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.PRACTICES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }

  // ==================== 設定管理 ====================

  static async getSettings(): Promise<PracticeSettings> {
    try {
      if (typeof window === 'undefined') {
        return this.getDefaultSettings();
      }

      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) {
        return this.getDefaultSettings();
      }

      return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  static async saveSettings(settings: Partial<PracticeSettings>): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('儲存設定失敗');
    }
  }

  // 向後相容的方法
  static async load(): Promise<Practice[]> {
    return this.getAllPractices();
  }

  static async save(practices: Practice[]): Promise<void> {
    return this.savePractices(practices);
  }

  static exportData(practices: Practice[]): string {
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      practices,
      stats: {
        total: practices.length,
        active: practices.filter((p) => p.status === 'active').length,
        completed: practices.filter((p) => p.status === 'completed').length,
        paused: practices.filter((p) => p.status === 'paused').length,
        archived: practices.filter((p) => p.status === 'archived').length,
        totalCheckIns: practices.reduce((sum, p) => sum + (p.checkIns?.length || 0), 0),
        longestStreak: Math.max(0, ...practices.map((p) => p.streak)),
        averageProgress: practices.length > 0
          ? practices.reduce((sum, p) => sum + ((p.currentProgress / p.totalAmount) * 100), 0) / practices.length
          : 0
      }
    };
    return JSON.stringify(exportData, null, 2);
  }

  static async importData(dataString: string): Promise<Practice[]> {
    try {
      const data = JSON.parse(dataString);
      return data.practices || [];
    } catch {
      throw new Error('匯入資料格式錯誤');
    }
  }

  private static getDefaultSettings(): PracticeSettings {
    return {
      reminderEnabled: false,
      reminderTime: '09:00',
      autoBackup: true,
      theme: 'system'
    };
  }
}
