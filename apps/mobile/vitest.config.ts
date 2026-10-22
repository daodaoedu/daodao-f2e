import { defineConfig } from "vitest/config";

// 只跑不依賴 React Native runtime 的純 Node 測試（例：i18n key 檢查）
export default defineConfig({ test: { include: ["__tests__/**/*.test.ts"] } });
