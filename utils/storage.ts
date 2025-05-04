const fn = () => undefined;

export default function createStorage<T>(key: string, storage = localStorage) {
  if (!storage) return { set: fn, get: fn, remove: fn };

  const remove = () => storage.removeItem(key);
  const set = (value: T) => storage.setItem(key, JSON.stringify(value));
  const get = (): T | undefined => {
    try {
      return JSON.parse(storage.getItem(key) ?? 'undefined');
    } catch {
      return undefined;
    }
  };

  return { set, get, remove };
}

/** 獲取用於存儲用戶令牌的 localStorage */
export const getTokenStorage = () => createStorage<string>('_token');

/** 獲取用於存儲重定向URL的 localStorage */
export const getRedirectionStorage = () => createStorage<string>('_r');

/** 獲取用於存儲外連結受信任網站列表的 localStorage */
export const getTrustWebsitesStorage = () =>
  createStorage<string[]>('_trustWeb');

/** 獲取用於存儲提醒填寫完整資料的 localStorage */
export const getReminderStorage = () => createStorage<number>('_reminder');

/** 獲取用於存儲馬拉松表單錯誤的 localStorage */
export const getMarathonErrorsStorage = () =>
  createStorage('_marathonFormErrors');

/** 獲取用於存儲開發環境來源地址的 localStorage */
export const getDevOriginStorage = () =>
  createStorage<string | null>('_devOrigin');

/** 獲取用於存儲是否提醒用戶里程碑拖拽會改變日期的 localStorage */
export const getIsCheckDragMilestoneStorage = () =>
  createStorage<boolean>('_isCheckDragMilestone');
