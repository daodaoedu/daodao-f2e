# @daodao/config

Shared TypeScript configurations, type definitions, and utilities for DaoDao monorepo.

## 功能

- ✅ TypeScript 配置檔案（tsconfig extends）
- ✅ 環境變數載入工具（支援 monorepo）
- ✅ 類型定義

## 安裝

此套件已包含在 monorepo 中，無需額外安裝。

## 使用方式

### TypeScript 配置

在 `tsconfig.json` 中擴展配置：

```json
{
  "extends": "@daodao/config/nextjs.json"
}
```

### 環境變數

環境變數會自動從 `.env` 檔案生成靜態配置檔案，packages 直接讀取靜態檔案，無需動態使用 fs。

#### 開發環境

在開發環境中，啟動 watch 模式自動監聽 `.env` 檔案變化：

```bash
pnpm --filter @daodao/config dev
```

這會：
- 監聽所有 `.env` 檔案變化
- 自動生成 `generated/env.ts` 靜態配置檔案
- 當 `.env` 檔案變更時自動重新生成

#### 使用方式

```typescript
import { getEnv, getRequiredEnv } from "@daodao/config";

// 取得環境變數（可選預設值）
const apiUrl = getEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001/api");

// 取得必要的環境變數（不存在時會拋出錯誤）
const requiredUrl = getRequiredEnv("NEXT_PUBLIC_API_URL");
```

#### 手動生成

如果需要手動生成靜態配置檔案：

```bash
pnpm --filter @daodao/config generate:env
```

## 環境變數載入順序

生成腳本會從以下位置載入環境變數（按優先順序）：

1. `apps/product/.env.local` 或 `apps/product/.env`
2. `apps/website/.env.local` 或 `apps/website/.env`
3. Monorepo 根目錄：`.env.local` 或 `.env`
4. 當前工作目錄：`.env.local` 或 `.env`

生成的靜態檔案只包含 `NEXT_PUBLIC_*` 開頭的環境變數。

## 優勢

- ✅ **無瀏覽器錯誤**：不依賴 Node.js 的 `fs` 模組
- ✅ **類型安全**：生成的靜態檔案有完整的 TypeScript 類型
- ✅ **自動更新**：開發時自動監聽 `.env` 檔案變化
- ✅ **Build 時生成**：在 build 時自動生成最新配置
