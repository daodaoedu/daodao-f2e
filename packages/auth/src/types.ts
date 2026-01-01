/**
 * 簡化的使用者資訊介面
 * 僅包含非敏感資料，用於存儲於 localStorage
 */
export interface StoredUser {
  id: string;
  email: string | null;
  name: string | null;
  photoUrl?: string | null;
}

/**
 * OAuth State 參數結構
 * 用於防 CSRF 和傳遞 redirectUrl
 */
export interface OAuthState {
  redirectUrl: string; // 登入後要跳轉的 URL
  source: "website" | "app"; // 來源網站
  timestamp: number; // 防重放攻擊
  nonce: string; // 隨機字串
}

/**
 * Auth Context 值介面
 */
export interface AuthContextValue {
  // 狀態
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 方法
  login: (redirectUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
