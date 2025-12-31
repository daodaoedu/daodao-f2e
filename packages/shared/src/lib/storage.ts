"use client";

type StorageType = "localStorage" | "sessionStorage";

export enum StorageEnum {
  /** 用於存儲使用者做島島測試的 sessionStorage */
  Quiz = "Quiz",
  /** 用於存儲使用者資訊的 localStorage（非敏感資料） */
  UserInfo = "UserInfo",
  /** 用於存儲外連結受信任網站列表的 localStorage */
  Whitelist = "Whitelist",
  /** 用於存儲 OAuth nonce 的 sessionStorage（防止偽造和重放攻擊） */
  OAuthNonce = "OAuthNonce",
}

const mapStorageKeyToStorageType: Record<StorageEnum, StorageType> = {
  Quiz: "sessionStorage",
  UserInfo: "localStorage",
  Whitelist: "localStorage",
  OAuthNonce: "sessionStorage",
};

export interface StorageInstance<T> {
  set: (value: T) => void;
  get: () => T | undefined;
  remove: () => void;
}

export function getStorageKey(key: StorageEnum): string {
  return `_${key.toLowerCase()}`;
}

/**
 * 獲取指定 key 的 storage 實例
 * @param key StorageEnum 中的 key
 * @returns Storage 實例，包含 set、get、remove 方法
 */
export function getStorage<T>(key: StorageEnum): StorageInstance<T> {
  const storageType = mapStorageKeyToStorageType[key];
  const storageKey = getStorageKey(key);

  if (window === undefined) {
    return {
      set: () => undefined,
      get: () => undefined,
      remove: () => undefined,
    };
  }

  const storage = storageType === "localStorage" ? localStorage : sessionStorage;

  const remove = () => storage.removeItem(storageKey);

  const set = (value: T) => {
    storage.setItem(storageKey, JSON.stringify(value));
  };

  const get = (): T | undefined => {
    try {
      const item = storage.getItem(storageKey);
      return item ? JSON.parse(item) : undefined;
    } catch {
      return undefined;
    }
  };

  return { set, get, remove };
}
