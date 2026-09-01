"use client";

type StorageType = "localStorage" | "sessionStorage";

export enum StorageEnum {
  /** 用於存儲使用者做島島測試的 sessionStorage */
  Quiz = "Quiz",
  /** 用於存儲使用者資訊的 localStorage（非敏感資料） */
  UserInfo = "UserInfo",
  /** 用於存儲外連結受信任網站列表的 localStorage */
  Whitelist = "Whitelist",
  /**
   * 用於存儲 OAuth nonce（防止偽造和重放攻擊）
   * 使用 localStorage 而非 sessionStorage：iOS Safari ITP / Android Chrome Custom Tab
   * 場景下 sessionStorage 在 OAuth 跨域 redirect 後可能被清空或不共享，
   * 導致 callback 端 state 驗證失敗、redirectUrl 被丟掉、使用者被踢回登入頁。
   * 安全性仍由 timestamp（10 分鐘 TTL）+ 一次性消費保障。
   */
  OAuthNonce = "OAuthNonce",
  /** 用於存儲手動建立實踐表單草稿的 sessionStorage */
  ManualPracticeDraft = "ManualPracticeDraft",
  /** 四步驟實踐建立精靈（#141）草稿的 sessionStorage；欄位結構與舊版不相容故另開 key */
  PracticeWizardDraft = "PracticeWizardDraft",
  /** 用於存儲 Action Maker 流程進度的 sessionStorage */
  ActionMaker = "ActionMaker",
  /** 用於跨 tab 通知 OAuth 完成（Android Chrome Custom Tab 場景） */
  AuthSignal = "AuthSignal",
  /** 用於還原主頁 feed 位置：點擊卡片時存卡片 ID，回到主頁時 scrollIntoView */
  HomeFeedAnchor = "HomeFeedAnchor",
  /** 用於記錄註冊來源流程 */
  RegistrationFlow = "RegistrationFlow",
  /** 用於記錄新手任務面板是否收合的 sessionStorage */
  TaskGuideCollapsed = "TaskGuideCollapsed",
  /** 用於記錄 PWA 安裝橫幅被關閉的時間點的 localStorage */
  PwaInstallDismissedAt = "PwaInstallDismissedAt",
  /** 用於記錄燈塔側邊欄是否收合的 localStorage */
  LighthouseSidebarCollapsed = "LighthouseSidebarCollapsed",
}

const mapStorageKeyToStorageType: Record<StorageEnum, StorageType> = {
  Quiz: "sessionStorage",
  UserInfo: "localStorage",
  Whitelist: "localStorage",
  OAuthNonce: "localStorage",
  ManualPracticeDraft: "sessionStorage",
  PracticeWizardDraft: "sessionStorage",
  ActionMaker: "sessionStorage",
  AuthSignal: "localStorage",
  HomeFeedAnchor: "sessionStorage",
  RegistrationFlow: "localStorage",
  TaskGuideCollapsed: "sessionStorage",
  PwaInstallDismissedAt: "localStorage",
  LighthouseSidebarCollapsed: "localStorage",
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

  if (typeof window === "undefined") {
    return {
      set: () => undefined,
      get: () => undefined,
      remove: () => undefined,
    };
  }

  let storage: Storage;
  try {
    storage = storageType === "localStorage" ? localStorage : sessionStorage;
  } catch {
    return {
      set: () => undefined,
      get: () => undefined,
      remove: () => undefined,
    };
  }

  const remove = () => {
    try {
      storage.removeItem(storageKey);
    } catch {
      return undefined;
    }
  };

  const set = (value: T) => {
    try {
      storage.setItem(storageKey, JSON.stringify(value));
    } catch {
      return undefined;
    }
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
