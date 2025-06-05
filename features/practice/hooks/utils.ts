import { mutate } from 'swr';
import { getPracticePathname } from '@/services/modules/practice/api';

// 全局快取更新函數
export const invalidateAllCaches = (practiceId?: string) => {
  // 更新主要的快取
  mutate(getPracticePathname()); // 所有實踐列表
  mutate('practice-stats'); // 統計資料
  mutate('active-practices'); // 活躍實踐列表

  // 使用更廣泛的模式來更新所有篩選相關的快取
  mutate((key) => {
    if (Array.isArray(key) && key[0] === 'filtered-practices') {
      return true;
    }
    return false;
  });

  // 更新特定實踐的快取
  if (practiceId) {
    mutate(getPracticePathname({ id: practiceId }));
  }

  // 強制刷新所有相關的頁面數據
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('practice-data-updated', {
      detail: { practiceId }
    }));
  }, 100);
};
