'use client';

import getEnv from '@/shared/config/env';

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

/** 獲取用於存儲外連結受信任網站列表的 localStorage */
export const getTrustWebsitesStorage = () =>
  createStorage<string[]>('_trustWeb');

/** 獲取用於存儲是否提醒用戶里程碑拖拽會改變日期的 localStorage */
export const getIsCheckDragMilestoneStorage = () =>
  createStorage<boolean>('_isCheckDragMilestone');

type QuizResultStorageType = Record<string, { selectedAnswer: string }>;

/** 獲取用於存儲使用者做島島測試的 sessionStorage */
export const getQuizStorage = () =>
  createStorage<QuizResultStorageType>('_quiz', StorageType.SessionStorage);
