import { Practice, CheckInRecord, PracticeStats, ExportData, ValidationResult } from './types';

// 本地儲存管理類
export class PracticeStorage {
  private static readonly STORAGE_KEY = 'daodao_practices';
  private static readonly BACKUP_KEY = 'daodao_practices_backup';
  private static readonly VERSION = '1.0.0';

  // 儲存實踐資料
  static async save(practices: Practice[]): Promise<void> {
    try {
      const data: ExportData = {
        version: this.VERSION,
        exportDate: new Date().toISOString(),
        practices,
        stats: this.calculateStats(practices)
      };

      const jsonString = JSON.stringify(data, null, 2);
      localStorage.setItem(this.STORAGE_KEY, jsonString);
      
      // 自動備份
      this.createBackup(jsonString);
    } catch (error) {
      console.error('儲存失敗:', error);
      throw new Error('無法儲存資料到本地儲存');
    }
  }

  // 載入實踐資料
  static async load(): Promise<Practice[]> {
    try {
      const jsonString = localStorage.getItem(this.STORAGE_KEY);
      
      if (!jsonString) {
        return [];
      }

      const data: ExportData = JSON.parse(jsonString);
      
      // 版本檢查和資料遷移
      if (data.version !== this.VERSION) {
        const migratedData = await this.migrateData(data);
        await this.save(migratedData);
        return migratedData;
      }

      // 資料驗證
      const validationResult = this.validateData(data.practices);
      if (!validationResult.isValid) {
        console.warn('資料驗證失敗:', validationResult.errors);
        // 嘗試從備份還原
        return this.loadFromBackup();
      }

      return data.practices;
    } catch (error) {
      console.error('載入失敗:', error);
      // 嘗試從備份還原
      return this.loadFromBackup();
    }
  }

  // 建立備份
  private static createBackup(data: string): void {
    try {
      const backupData = {
        timestamp: Date.now(),
        data
      };
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));
    } catch (error) {
      console.warn('備份建立失敗:', error);
    }
  }

  // 從備份還原
  private static loadFromBackup(): Practice[] {
    try {
      const backupString = localStorage.getItem(this.BACKUP_KEY);
      if (!backupString) {
        return [];
      }

      const backup = JSON.parse(backupString);
      const data: ExportData = JSON.parse(backup.data);
      
      console.info('從備份還原資料');
      return data.practices || [];
    } catch (error) {
      console.error('備份還原失敗:', error);
      return [];
    }
  }

  // 匯出資料
  static exportData(practices: Practice[]): string {
    const data: ExportData = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      practices,
      stats: this.calculateStats(practices)
    };

    return JSON.stringify(data, null, 2);
  }

  // 匯入資料
  static async importData(jsonString: string): Promise<Practice[]> {
    try {
      const data: ExportData = JSON.parse(jsonString);
      
      // 資料驗證
      const validationResult = this.validateData(data.practices);
      if (!validationResult.isValid) {
        throw new Error(`資料格式錯誤: ${validationResult.errors.join(', ')}`);
      }

      // 版本檢查
      if (data.version !== this.VERSION) {
        return this.migrateData(data);
      }

      return data.practices;
    } catch (error) {
      throw new Error(`匯入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  // 資料驗證
  private static validateData(practices: Practice[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(practices)) {
      errors.push('實踐資料必須是陣列格式');
      return { isValid: false, errors, warnings };
    }

    practices.forEach((practice, index) => {
      // 必要欄位檢查
      if (!practice.id) {
        errors.push(`實踐 ${index + 1} 缺少 ID`);
      }
      if (!practice.title) {
        errors.push(`實踐 ${index + 1} 缺少標題`);
      }
      if (!practice.contentType) {
        errors.push(`實踐 ${index + 1} 缺少內容類型`);
      }
      if (typeof practice.totalAmount !== 'number' || practice.totalAmount < 1) {
        errors.push(`實踐 ${index + 1} 總量設定不正確`);
      }
      if (typeof practice.currentProgress !== 'number' || practice.currentProgress < 0) {
        errors.push(`實踐 ${index + 1} 當前進度設定不正確`);
      }

      // 日期格式檢查
      if (practice.targetDate && isNaN(Date.parse(practice.targetDate))) {
        warnings.push(`實踐 ${index + 1} 目標日期格式不正確`);
      }

      // 小目標檢查
      if (!Array.isArray(practice.smallGoals)) {
        errors.push(`實踐 ${index + 1} 小目標必須是陣列格式`);
      }

      // 學習資源檢查
      if (!Array.isArray(practice.resources)) {
        errors.push(`實踐 ${index + 1} 學習資源必須是陣列格式`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 資料遷移
  private static async migrateData(data: ExportData): Promise<Practice[]> {
    console.info(`正在從版本 ${data.version} 遷移到 ${this.VERSION}`);
    
    // 這裡可以添加不同版本之間的遷移邏輯
    // 目前只是簡單返回原資料
    return data.practices || [];
  }

  // 計算統計資料
  private static calculateStats(practices: Practice[]): PracticeStats {
    const stats: PracticeStats = {
      total: practices.length,
      active: 0,
      completed: 0,
      paused: 0,
      archived: 0,
      totalCheckIns: 0,
      longestStreak: 0,
      averageProgress: 0
    };

    if (practices.length === 0) {
      return stats;
    }

    let totalProgress = 0;

    practices.forEach(practice => {
      // 狀態統計
      switch (practice.status) {
        case 'active':
          stats.active++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'paused':
          stats.paused++;
          break;
        case 'archived':
          stats.archived++;
          break;
      }

      // 簽到統計
      stats.totalCheckIns += practice.checkIns?.length || 0;

      // 連續天數統計
      if (practice.streak > stats.longestStreak) {
        stats.longestStreak = practice.streak;
      }

      // 進度統計
      const progressPercentage = practice.totalAmount > 0 
        ? (practice.currentProgress / practice.totalAmount) * 100 
        : 0;
      totalProgress += progressPercentage;
    });

    stats.averageProgress = Math.round(totalProgress / practices.length);

    return stats;
  }

  // 清除所有資料
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.BACKUP_KEY);
  }

  // 取得儲存空間使用情況
  static getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY) || '';
      const backup = localStorage.getItem(this.BACKUP_KEY) || '';
      const used = (data.length + backup.length) * 2; // UTF-16 編碼，每字元2位元組
      
      // 估計瀏覽器 localStorage 限制約 5-10MB
      const total = 5 * 1024 * 1024; // 5MB
      const percentage = Math.round((used / total) * 100);

      return { used, total, percentage };
    } catch (error) {
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  // 壓縮舊資料
  static async compressOldData(): Promise<void> {
    try {
      const practices = await this.load();
      
      // 移除超過一年的簽到記錄
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const compressedPractices = practices.map(practice => ({
        ...practice,
        checkIns: practice.checkIns?.filter(checkIn => 
          new Date(checkIn.createdAt) > oneYearAgo
        ) || []
      }));

      await this.save(compressedPractices);
      console.info('舊資料壓縮完成');
    } catch (error) {
      console.error('資料壓縮失敗:', error);
    }
  }
}