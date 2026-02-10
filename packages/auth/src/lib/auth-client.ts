"use client";

import { getRequiredEnv } from "@daodao/config";
import { getStorage, StorageEnum } from "@daodao/shared";
import type { OAuthState } from "../types";
import { DEFAULT_REDIRECT_URL } from "./auth-constants";

/**
 * OAuth State 參數有效期（毫秒）
 * 預設 10 分鐘
 */
const OAUTH_STATE_EXPIRY = 10 * 60 * 1000;

/**
 * 生成加密安全的隨機字串（用於 nonce）
 */
const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * 編碼 OAuth State 參數
 * 使用 base64url 編碼（與後端一致）
 * @param state OAuth State 物件
 * @returns Base64url 編碼的字串
 */
export const encodeOAuthState = (state: OAuthState): string => {
  const json = JSON.stringify(state);
  // 使用標準 base64 編碼後轉換為 base64url
  // base64url: + -> -, / -> _, 移除 = 填充
  return btoa(json)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * 解碼 OAuth State 參數
 * 使用 base64url 解碼（與後端一致）
 * @param encodedState Base64url 編碼的字串
 * @returns OAuth State 物件
 */
export const decodeOAuthState = (encodedState: string): OAuthState | null => {
  try {
    // 將 base64url 轉換回標準 base64
    // base64url: - -> +, _ -> /, 補回 = 填充
    let base64 = encodedState.replace(/-/g, "+").replace(/_/g, "/");
    // 補回填充字元
    const padding = base64.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }
    const json = atob(base64);
    return JSON.parse(json) as OAuthState;
  } catch {
    return null;
  }
};

/**
 * 驗證 OAuth State 參數
 * @param state OAuth State 物件
 * @returns 是否有效
 */
export const validateOAuthState = (state: OAuthState): boolean => {
  const now = Date.now();
  const elapsed = now - state.timestamp;

  // 檢查時效性（10 分鐘內有效，且不允許未來時間戳）
  if (elapsed < 0 || elapsed > OAUTH_STATE_EXPIRY) {
    return false;
  }

  // 檢查必要欄位
  if (!state.redirectUrl || !state.source || !state.nonce) {
    return false;
  }

  // 驗證 nonce 是否與存儲的值一致（防止偽造）
  const storedNonce = getStorage<string>(StorageEnum.OAuthNonce).get();
  if (storedNonce !== state.nonce) {
    return false;
  }

  return true;
};

/**
 * 建立 OAuth State 參數
 * @param redirectUrl 登入後要跳轉的 URL
 * @param source 來源網站
 * @returns OAuth State 物件
 */
export const createOAuthState = (
  redirectUrl: string,
  source: "website" | "app" = "app"
): OAuthState => {
  const nonce = generateNonce();

  // 存儲 nonce 到 sessionStorage（用於後續驗證）
  getStorage<string>(StorageEnum.OAuthNonce).set(nonce);

  return {
    redirectUrl,
    source,
    timestamp: Date.now(),
    nonce,
  };
};

/**
 * 取得 OAuth 登入 URL
 * @param redirectUrl 登入後要跳轉的 URL
 * @param source 來源網站
 * @returns OAuth 登入 URL
 */
export const getOAuthLoginUrl = (
  redirectUrl: string = DEFAULT_REDIRECT_URL,
  source: "website" | "app" = "app"
): string => {
  const apiUrl = getRequiredEnv("NEXT_PUBLIC_API_URL");

  // 建立 State 參數
  const state = createOAuthState(redirectUrl, source);
  const encodedState = encodeOAuthState(state);

  // 跳轉到後端 OAuth 端點
  return `${apiUrl}/api/v1/auth/google?state=${encodeURIComponent(encodedState)}`;
};

/**
 * 啟動 OAuth 登入流程
 * @param redirectUrl 登入後要跳轉的 URL
 * @param source 來源網站
 */
export const initiateOAuthLogin = (
  redirectUrl: string = DEFAULT_REDIRECT_URL,
  source: "website" | "app" = "app"
): void => {
  const oauthUrl = getOAuthLoginUrl(redirectUrl, source);
  window.location.href = oauthUrl;
};

/**
 * 驗證並清除 OAuth State（用於回調驗證）
 * 驗證成功後會清除存儲的 nonce，確保一次性使用
 * @param state OAuth State 物件
 * @returns 是否驗證成功
 */
export const verifyAndConsumeOAuthState = (state: OAuthState): boolean => {
  // 驗證 state（包含 nonce 驗證）
  const isValid = validateOAuthState(state);

  if (isValid) {
    // 驗證成功後清除存儲的 nonce（防止重放攻擊）
    getStorage<string>(StorageEnum.OAuthNonce).remove();
  }

  return isValid;
};
