import { ResultType } from '@/features/quiz';
import getEnv from './env';

const fn = () => undefined;

enum StorageType {
  LocalStorage = 'localStorage',
  SessionStorage = 'sessionStorage',
}

export default function createStorage<T>(
  key: string,
  storageType: StorageType = StorageType.LocalStorage
) {
  if (getEnv().isServerSide) return { set: fn, get: fn, remove: fn };

  const storage =
    storageType === StorageType.LocalStorage ? localStorage : sessionStorage;

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

/** 獲取用於存儲重定向 URL 的 localStorage，僅允許以 `/` 開頭的 pathname 字串 */
export const getRedirectionStorage = () => {
  const storage = createStorage<string>('_r');
  const get = () => {
    const value = storage.get();
    if (value?.startsWith('/')) return value;
    return undefined;
  };
  return { ...storage, get };
};

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

/** 獲取用於存儲使用者做島島測試的 sessionStorage */
export const getQuizStorage = () =>
  createStorage<ResultType>('_quiz', StorageType.SessionStorage);
