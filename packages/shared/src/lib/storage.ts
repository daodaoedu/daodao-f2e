"use client";

type StorageType = "localStorage" | "sessionStorage";

export enum StorageEnum {
  /** 用於存儲使用者做島島測試的 sessionStorage */
  Quiz = "Quiz",
  /** 用於存儲用戶令牌的 localStorage */
  Token = "Token",
  /** 用於存儲外連結受信任網站列表的 localStorage */
  Whitelist = "Whitelist",
}

const mapStorageKeyToStorageType: Record<StorageEnum, StorageType> = {
  Quiz: "sessionStorage",
  Token: "localStorage",
  Whitelist: "localStorage",
};

export function createStorage<T>(key: StorageEnum) {
  const storageType = mapStorageKeyToStorageType[key];
  const storageKey = `_${key.toLowerCase()}`;

  if (window === undefined) {
    return {
      set: () => undefined,
      get: () => undefined,
      remove: () => undefined,
    };
  }

  const storage = storageType === "localStorage" ? localStorage : sessionStorage;

  const remove = () => storage.removeItem(storageKey);

  const set = (value: T) => storage.setItem(storageKey, JSON.stringify(value));

  const get = (): T | undefined => {
    try {
      return JSON.parse(storage.getItem(storageKey) ?? "undefined");
    } catch {
      return undefined;
    }
  };

  return { set, get, remove };
}
