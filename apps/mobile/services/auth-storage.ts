import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.daodao.so";
const REQUEST_TIMEOUT = 30000;

const KEYS = {
  ACCESS_TOKEN: "daodao_access_token",
  REFRESH_TOKEN: "daodao_refresh_token",
  USER: "daodao_user",
} as const;

export interface IStoredUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function refreshTokens(): Promise<void> {
  const refreshToken = await authStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });

    if (!response.ok) {
      await authStorage.clearAll();
      throw new Error("Token refresh failed");
    }

    const data = (await response.json()) as Partial<IAuthTokens>;
    if (!data.accessToken || !data.refreshToken) {
      await authStorage.clearAll();
      throw new Error("Token refresh response is invalid");
    }

    await authStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const authStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async getTokens(): Promise<IAuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },

  async setTokens(tokens: IAuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
  },

  async getUser(): Promise<IStoredUser | null> {
    const userJson = await SecureStore.getItemAsync(KEYS.USER);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  async setUser(user: IStoredUser): Promise<void> {
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
