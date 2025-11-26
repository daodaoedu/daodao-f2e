/**
 * JWT Token 工具函數
 */

import getEnv from '../config/env';

export interface JWTPayload {
  isTemp: boolean;
  exp: number;
}

export interface DecodedJWT {
  payload: JWTPayload;
}

/**
 * Base64 URL 解碼
 * @param str Base64 URL 編碼的字串
 * @returns 解碼後的字串
 */
const base64UrlDecode = (str: string): string => {
  // 將 Base64 URL 轉換為標準 Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // 補齊 padding
  while (base64.length % 4) {
    base64 += '=';
  }

  try {
    // 在瀏覽器環境中使用 atob，在 Node.js 環境中使用 Buffer
    if (getEnv().isClientSide && typeof window.atob === 'function') {
      return atob(base64);
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(base64, 'base64').toString('utf-8');
    }

    throw new Error('No base64 decoder available');
  } catch (error) {
    throw new Error(`Base64 decode failed: ${error}`);
  }
};

/**
 * 解碼 JWT Token
 * @param token JWT Token 字串
 * @returns 解碼後的 JWT 物件
 * @throws 當 token 格式不正確時拋出錯誤
 */
const decodeJWT = (token: string): DecodedJWT => {
  if (!token) {
    throw new Error('Token is required');
  }

  const parts = token.split('.');

  if (parts.length !== 3 || !parts[1]) {
    throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;

    return {
      payload,
    };
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error}`);
  }
};

/**
 * 獲取 JWT Token 的過期時間
 * @param token JWT Token 字串或已解碼的 payload
 * @returns 過期時間的 Date 物件，如果沒有過期時間則返回 null
 */
const getJWTExpiration = (token: string | JWTPayload): Date | null => {
  try {
    const payload =
      typeof token === 'string' ? decodeJWT(token).payload : token;

    if (!payload.exp) {
      return null;
    }

    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
};

/**
 * 檢查 JWT Token 是否已過期
 * @param token JWT Token 字串或已解碼的 payload
 * @returns 是否已過期
 */
const isJWTExpired = (token: string | JWTPayload): boolean => {
  try {
    const expiration = getJWTExpiration(token);

    if (!expiration) {
      return false;
    }

    return Date.now() > expiration.getTime();
  } catch {
    return true;
  }
};

/**
 * 格式化顯示 JWT Token 資訊
 * @param token JWT Token 字串
 * @returns 格式化的 Token 資訊
 */
export const formatJWTInfo = (token: string) => {
  try {
    const { payload } = decodeJWT(token);

    const expiration = getJWTExpiration(payload);
    const isExpired = isJWTExpired(payload);

    return {
      payload,
      expiration,
      isExpired,
    };
  } catch {
    return {
      isExpired: true,
      expiration: null,
      payload: null,
    };
  }
};
