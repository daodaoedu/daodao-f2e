import * as WebBrowser from 'expo-web-browser'
import * as AppleAuthentication from 'expo-apple-authentication'
import Constants from 'expo-constants'
import { type AuthTokens, type StoredUser } from './auth-storage'

// Ensure WebBrowser session is properly closed
WebBrowser.maybeCompleteAuthSession()

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.daodao.so'
const API_URL = `${API_BASE_URL}/api/v1`

interface OAuthResult {
  tokens: AuthTokens
  user: StoredUser
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

function validateTokenFormat(token: string): boolean {
  // Basic JWT format validation (header.payload.signature)
  return token.split('.').length === 3 && token.length > 20
}

export const oauthService = {
  /**
   * Google OAuth Sign In
   *
   * SECURITY NOTE: Current implementation receives tokens via URL parameters.
   * For production, consider implementing Authorization Code Flow where:
   * 1. Client receives authorization code via URL
   * 2. Client exchanges code for tokens via secure backend call
   *
   * This requires backend API changes to support the code exchange endpoint.
   */
  async signInWithGoogle(): Promise<OAuthResult> {
    const redirectUri = `${Constants.expoConfig?.scheme}://oauth/callback`

    const result = await WebBrowser.openAuthSessionAsync(
      `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`,
      redirectUri
    )

    if (result.type === 'cancel') {
      throw new Error('登入已取消')
    }

    if (result.type !== 'success') {
      throw new Error('Google 登入失敗')
    }

    // Parse URL to get authorization code
    const url = new URL(result.url)
    const code = url.searchParams.get('code')

    if (!code) {
      throw new Error('登入失敗：未取得授權碼')
    }

    // Exchange code for tokens
    const response = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Google 登入失敗')
    }

    const data = await response.json()

    // Validate response structure
    if (!data.accessToken || !data.refreshToken || !data.user) {
      throw new Error('登入失敗：伺服器回應格式錯誤')
    }

    if (!data.user.id || !data.user.email || !data.user.name) {
      throw new Error('登入失敗：用戶資料不完整')
    }

    // Validate token format
    if (!validateTokenFormat(data.accessToken)) {
      throw new Error('登入失敗：無效的認證令牌')
    }

    // Validate email format
    if (!validateEmail(data.user.email)) {
      throw new Error('登入失敗：無效的電子郵件格式')
    }

    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }

    const user: StoredUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      avatar: data.user.avatar,
    }

    return { tokens, user }
  },

  /**
   * Apple Sign In
   */
  async signInWithApple(): Promise<OAuthResult> {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })

    if (!credential.identityToken) {
      throw new Error('Apple 登入失敗：未取得身份令牌')
    }

    // Exchange Apple credential with backend
    const response = await fetch(`${API_URL}/auth/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        fullName: credential.fullName,
        email: credential.email,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Apple 登入失敗')
    }

    const data = await response.json()

    // Validate response structure
    if (!data.accessToken || !data.refreshToken || !data.user) {
      throw new Error('Apple 登入失敗：伺服器回應格式錯誤')
    }

    if (!data.user.id || !data.user.email || !data.user.name) {
      throw new Error('Apple 登入失敗：用戶資料不完整')
    }

    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }

    const user: StoredUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      avatar: data.user.avatar,
    }

    return { tokens, user }
  },

  /**
   * Check if Apple Sign In is available on this device
   */
  async isAppleSignInAvailable(): Promise<boolean> {
    return AppleAuthentication.isAvailableAsync()
  },
}
