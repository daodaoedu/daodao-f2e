import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import type { IAuthTokens, IStoredUser } from "./auth-storage";

// Ensure WebBrowser session is properly closed
WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.daodao.so";
const API_URL = `${API_BASE_URL}/api/v1`;

interface IOAuthResult {
  tokens: IAuthTokens;
  user: IStoredUser;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateTokenFormat(token: string): boolean {
  // Basic JWT format validation (header.payload.signature)
  return token.split(".").length === 3 && token.length > 20;
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
  async signInWithGoogle(): Promise<IOAuthResult> {
    const redirectUri = `${Constants.expoConfig?.scheme}://oauth/callback`;

    const result = await WebBrowser.openAuthSessionAsync(
      `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`,
      redirectUri
    );

    if (result.type === "cancel") {
      throw new Error("oauth.cancelled");
    }

    if (result.type !== "success") {
      throw new Error("oauth.google_failed");
    }

    // Parse URL to get authorization code
    const url = new URL(result.url);
    const code = url.searchParams.get("code");

    if (!code) {
      throw new Error("oauth.missing_auth_code");
    }

    // Exchange code for tokens
    const response = await fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "oauth.google_failed");
    }

    const data = await response.json();

    // Validate response structure
    if (!data.accessToken || !data.refreshToken || !data.user) {
      throw new Error("oauth.invalid_server_response");
    }

    if (!data.user.id || !data.user.email || !data.user.name) {
      throw new Error("oauth.incomplete_user_data");
    }

    // Validate token format
    if (!validateTokenFormat(data.accessToken)) {
      throw new Error("oauth.invalid_token");
    }

    // Validate email format
    if (!validateEmail(data.user.email)) {
      throw new Error("oauth.invalid_email");
    }

    const tokens: IAuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };

    const user: IStoredUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      avatar: data.user.avatar,
      roles: data.user.roles ?? [],
    };

    return { tokens, user };
  },

  /**
   * Apple Sign In
   */
  async signInWithApple(): Promise<IOAuthResult> {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("oauth.apple_missing_identity_token");
    }

    // Exchange Apple credential with backend
    const response = await fetch(`${API_URL}/auth/apple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        fullName: credential.fullName,
        email: credential.email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "oauth.apple_failed");
    }

    const data = await response.json();

    // Validate response structure
    if (!data.accessToken || !data.refreshToken || !data.user) {
      throw new Error("oauth.apple_invalid_server_response");
    }

    if (!data.user.id || !data.user.email || !data.user.name) {
      throw new Error("oauth.apple_incomplete_user_data");
    }

    const tokens: IAuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };

    const user: IStoredUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      avatar: data.user.avatar,
      roles: data.user.roles ?? [],
    };

    return { tokens, user };
  },

  /**
   * Check if Apple Sign In is available on this device
   */
  async isAppleSignInAvailable(): Promise<boolean> {
    return AppleAuthentication.isAvailableAsync();
  },
};
