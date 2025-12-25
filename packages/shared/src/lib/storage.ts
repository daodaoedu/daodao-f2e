"use client";

type StorageType = "localStorage" | "sessionStorage";

export const StorageKey = {
  /** 用於存儲使用者做島島測試的 sessionStorage */
  Quiz: "_quiz",
  /** 用於存儲用戶令牌的 localStorage */
  Token: "_token",
  /** 用於存儲外連結受信任網站列表的 localStorage */
  Whitelist: "_whitelist",
};

export type StorageKeyType = keyof typeof StorageKey;

const mapStorageKeyToStorageType: Record<StorageKeyType, StorageType> = {
  Quiz: "sessionStorage",
  Token: "localStorage",
  Whitelist: "localStorage",
};

export function createStorage<T>(key: StorageKeyType) {
  const storageType = mapStorageKeyToStorageType[key];

  if (window === undefined) {
    return {
      set: () => undefined,
      get: () => undefined,
      remove: () => undefined,
    };
  }

  const storage = storageType === "localStorage" ? localStorage : sessionStorage;

  const remove = () => storage.removeItem(key);

  const set = (value: T) => storage.setItem(key, JSON.stringify(value));

  const get = (): T | undefined => {
    try {
      return JSON.parse(storage.getItem(key) ?? "undefined");
    } catch {
      return undefined;
    }
  };

  return { set, get, remove };
}
