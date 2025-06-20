/**
 * 功能開關工具
 */

export interface FeatureFlags {
  newHome: boolean;
}

/**
 * 檢查環境變數
 */
function checkEnvironmentFlag(feature: keyof FeatureFlags): boolean {
  const envKey = `NEXT_PUBLIC_${feature.toUpperCase()}_ENABLED`;
  return process.env[envKey] === 'true';
}

/**
 * 檢查 localStorage
 */
function checkLocalStorageFlag(feature: keyof FeatureFlags): boolean {
  try {
    return localStorage.getItem(`feature:${feature}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * 檢查 URL 參數
 */
function checkUrlFlag(feature: keyof FeatureFlags): boolean {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get(`enable-${feature}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * 檢查功能是否啟用
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  if (typeof window === 'undefined') {
    // SSR 環境中只檢查環境變數
    return checkEnvironmentFlag(feature);
  }

  // Client 端檢查
  return checkEnvironmentFlag(feature) || checkLocalStorageFlag(feature) || checkUrlFlag(feature);
}

/**
 * 啟用功能開關（僅客戶端）
 */
export function enableFeature(feature: keyof FeatureFlags): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`feature:${feature}`, 'true');
  }
}

/**
 * 停用功能開關（僅客戶端）
 */
export function disableFeature(feature: keyof FeatureFlags): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`feature:${feature}`);
  }
}

/**
 * 開發者工具：在 console 中使用
 *
 * 啟用新首頁：enableNewHome()
 * 停用新首頁：disableNewHome()
 */
if (typeof window !== 'undefined') {
  (window as Window & typeof globalThis & {
    enableNewHome: () => void;
    disableNewHome: () => void;
  }).enableNewHome = () => {
    enableFeature('newHome');
    console.log('新首頁已啟用，重新整理頁面生效');
  };

  (window as Window & typeof globalThis & {
    enableNewHome: () => void;
    disableNewHome: () => void;
  }).disableNewHome = () => {
    disableFeature('newHome');
    console.log('新首頁已停用，重新整理頁面生效');
  };
}

