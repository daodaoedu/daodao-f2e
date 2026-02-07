import * as SecureStore from 'expo-secure-store'

const KEYS = {
  ACCESS_TOKEN: 'daodao_access_token',
  REFRESH_TOKEN: 'daodao_refresh_token',
  USER: 'daodao_user',
} as const

export interface StoredUser {
  id: string
  email: string
  name: string
  avatar?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export const authStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN)
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN)
  },

  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ])

    if (!accessToken || !refreshToken) {
      return null
    }

    return { accessToken, refreshToken }
  },

  async setTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ])
  },

  async getUser(): Promise<StoredUser | null> {
    const userJson = await SecureStore.getItemAsync(KEYS.USER)
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch {
      return null
    }
  },

  async setUser(user: StoredUser): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user))
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER),
    ])
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken()
    return !!token
  },
}
