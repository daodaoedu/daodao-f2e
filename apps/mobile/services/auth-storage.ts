import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://server-dev.daodao.so";
const REQUEST_TIMEOUT = 30_000; // 30 秒，與原 api-client.ts 一致

const KEYS = {
  ACCESS_TOKEN: "daodao_access_token",
  REFRESH_TOKEN: "daodao_refresh_token",
  USER: "daodao_user",
} as const;

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },

  async setTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
  },

  async getUser(): Promise<StoredUser | null> {
    const userJson = await SecureStore.getItemAsync(KEYS.USER);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  async setUser(user: StoredUser): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER),
    ]);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  },
};

/**
 * 使用 refresh token 取得新的 access token 並存回 SecureStore。
 * 含 30 秒 timeout（與原 api-client.ts 的 refreshAccessToken 一致）。
 * 若刷新失敗，清除所有 auth 資料（強制登出）。
 */
export async function refreshTokens(): Promise<void> {
  const refreshToken = await authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await authStorage.clearAll();
      throw new Error("Token refresh failed");
    }

    const data: { accessToken: string; refreshToken: string } = await response.json();
    await authStorage.setTokens(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Token refresh timeout");
    }
    throw error;
  }
}
