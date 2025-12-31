"use client";

import { getStorage, StorageEnum } from "@daodao/shared";
import type { OAuthState } from "../types";

/**
 * OAuth State 參數有效期（毫秒）
 * 預設 10 分鐘
 */
const OAUTH_STATE_EXPIRY = 10 * 60 * 1000;

/**
 * OAuth nonce 存儲實例
 * 使用 sessionStorage 存儲，防止偽造和重放攻擊
 */
const oauthNonceStorage = getStorage<string>(StorageEnum.OAuthNonce);

/**
 * 生成隨機字串（用於 nonce）
 */
const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * 編碼 OAuth State 參數
 * @param state OAuth State 物件
 * @returns Base64 編碼的字串
 */
export const encodeOAuthState = (state: OAuthState): string => {
  const json = JSON.stringify(state);
  return btoa(json);
};

/**
 * 解碼 OAuth State 參數
 * @param encodedState Base64 編碼的字串
 * @returns OAuth State 物件
 */
export const decodeOAuthState = (encodedState: string): OAuthState | null => {
  try {
    const json = atob(encodedState);
    return JSON.parse(json) as OAuthState;
  } catch {
    return null;
  }
};

/**
 * 驗證 OAuth State 參數
 * @param state OAuth State 物件
 * @param verifyNonce 是否驗證 nonce（預設: true）
 * @returns 是否有效
 */
export const validateOAuthState = (state: OAuthState): boolean => {
  const now = Date.now();
  const elapsed = now - state.timestamp;

  // 檢查時效性（10 分鐘內有效）
  if (elapsed > OAUTH_STATE_EXPIRY) {
    return false;
  }

  // 檢查必要欄位
  if (!state.redirectUrl || !state.source || !state.nonce) {
    return false;
  }

  // 驗證 nonce 是否與存儲的值一致（防止偽造）
  const storedNonce = oauthNonceStorage.get();
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
  oauthNonceStorage.set(nonce);

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
  redirectUrl: string = "/dashboard",
  source: "website" | "app" = "app"
): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

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
  redirectUrl: string = "/dashboard",
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
    oauthNonceStorage.remove();
  }

  return isValid;
};
