/**
 * 環境變數配置
 * 讀取靜態生成的環境變數檔案（由 scripts/generate-env.ts 生成）
 */

// 載入靜態生成的環境變數配置
let staticEnv: Record<string, string> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const staticModule = require("../generated/env");
  staticEnv = staticModule.env || null;
} catch (error) {
  // 靜態檔案不存在時，在開發環境給出提示
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    console.warn(
      "[@daodao/config] Static env file not found. Run 'pnpm --filter @daodao/config generate:env' to generate it."
    );
  }
}

/**
 * 取得環境變數值
 * @param key 環境變數名稱
 * @param defaultValue 預設值（可選）
 * @returns 環境變數值或預設值
 */
export const getEnv = (key: string, defaultValue?: string): string | undefined => {
  // 優先使用靜態配置
  if (staticEnv && key in staticEnv) {
    const value = staticEnv[key];
    return value || defaultValue;
  }

  // 回退到 process.env（用於 Next.js build 時）
  if (typeof process !== "undefined") {
    return process.env[key] ?? defaultValue;
  }

  return defaultValue;
};

/**
 * 取得必要的環境變數值
 * 如果環境變數不存在，會拋出錯誤
 * @param key 環境變數名稱
 * @returns 環境變數值
 * @throws Error 如果環境變數不存在
 */
export const getRequiredEnv = (key: string): string => {
  // 優先使用靜態配置
  if (staticEnv && key in staticEnv && staticEnv[key]) {
    return staticEnv[key];
  }

  // 回退到 process.env（用於 Next.js build 時）
  if (typeof process !== "undefined") {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }

  throw new Error(`Required environment variable ${key} is not defined`);
};

