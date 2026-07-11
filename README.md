# DaoDao Frontend Monorepo

DaoDao 前端專案的 monorepo 架構。

## 📁 專案結構

```
daodao-f2e/
├── apps/                    # 應用程式
│   ├── website/            # 靜態官網 (Next.js, port 3000)
│   ├── product/            # 產品網站 (Next.js, port 3001)
│   └── mobile/             # 行動 App (Expo/React Native)
│
├── packages/               # 共享套件
│   ├── shared/            # 共享工具函數與 hooks
│   ├── ui/                # shadcn/ui 組件庫
│   ├── i18n/              # 多語系套件
│   ├── api/               # API 客戶端 (OpenAPI)
│   └── features/          # 業務功能模組
│       └── quiz/          # Quiz 功能
│
├── tools/                 # 開發工具腳本
│   ├── i18n-sync/        # i18n 同步腳本
│   └── typegen/          # 類型生成腳本
│
├── tsconfig.base.json     # TypeScript 基礎配置
├── postcss.config.js      # PostCSS 配置
├── turbo.json             # Turborepo 配置
└── biome.json             # Biome 配置
```

## 🚀 快速開始

### 環境需求

- Node.js >= 20.19.4
- pnpm >= 10.20.0

### 安裝依賴

```bash
pnpm install
```

### 🌐 Web 開發 (Next.js)

```bash
pnpm dev            # 啟動全部 apps
pnpm dev:website    # http://localhost:3000
pnpm dev:product    # http://localhost:3001
```

### 📱 Mobile 開發 (Expo)

**前置條件：**

```bash
# 安裝 EAS CLI (用於建置 App)
npm install -g eas-cli

# 登入 Expo 帳號
eas login
```

**日常開發（模擬器，改 code 即時熱更新）：**

```bash
cd apps/mobile && npx expo start
#   跑起來後按 i 開 iOS 模擬器、a 開 Android
```

**環境區分（正式 vs 測試）**

以 `APP_ENV`（由 `eas.json` 各 profile 設定）切成兩個獨立 app，可同時裝在同一支手機、互不污染資料：

| profile | app 名稱 | bundle id | 後端 | 發佈 |
| --- | --- | --- | --- | --- |
| `production` | Dao Dao | `com.daodao.so` | prod（`server.daodao.so` / `ai.daodao.so`） | App Store |
| `preview` | Dao Dao (Dev) | `com.daodao.so.dev` | dev（`server-dev` / `ai-dev`） | TestFlight / 內部 |
| `development` | Dao Dao (Dev) | `com.daodao.so.dev` | dev | 模擬器 dev client |

**發佈：**

```bash
# 發 dev 測試版給人（TestFlight）
eas build  -p ios --profile preview
eas submit -p ios --profile personal

# 發正式版（App Store）
eas build  -p ios --profile production
eas submit -p ios --profile personal
```

> **為什麼兩邊的 submit 一樣？** `--profile` 對 `build` 和 `submit` 是兩組不同設定：build profile 決定 bundle id / 後端（dev vs 正式的差異在這），submit profile 只決定「用哪個 Apple 帳號憑證上傳」。上傳進哪個 App Store Connect app 是由 build 的 bundle id 自動判斷，而兩個 app 都在同一個個人 Apple 帳號下，故共用 `personal` 這個 submit profile。
>
> `eas submit` 首次會在 App Store Connect 自動建立 app record。憑證由 EAS 代管，不需每次重登 Apple。

**OTA 熱更新（免重新 build / 送審）：**

JS、樣式、圖片類改動可用 EAS Update 直接推給已安裝的 build。合併到 `dev` 分支會自動觸發
`.github/workflows/mobile-deploy.yml`，把更新推到 **preview** channel（測試 app）。

> 需在 repo secret 設 `EXPO_TOKEN`。新增/移除 native 模組、改 `app.config` plugins、調高版號，仍必須跑完整 `eas build`。

**類型檢查：**

```bash
pnpm --filter @daodao/mobile typecheck
```

### 構建

```bash
# 構建所有 packages 和 apps (使用 Turborepo)
pnpm build

# 構建特定 package
pnpm --filter @daodao/shared build
```

### 🐳 Docker

```bash
# 開發環境
pnpm docker:dev        # 啟動
pnpm docker:dev:down   # 停止

# 生產環境
pnpm docker:prod       # 啟動
pnpm docker:prod:down  # 停止

# 構建專案並啟動 Docker 容器
pnpm docker:build
```

Docker Compose 會啟動兩個服務：

- **website**: 運行在 `http://localhost:3000`（使用 Nginx 服務靜態導出）
- **product**: 運行在 `http://localhost:3001`（使用 Node.js 運行 standalone 輸出）

### 代碼檢查與格式化

```bash
# 檢查代碼 (lint + format)
pnpm check

# 自動修復代碼問題
pnpm check:fix

# 僅格式化代碼
pnpm format

# 僅檢查格式
pnpm format:check

# 僅 lint
pnpm lint:fix
```

### 類型檢查

```bash
pnpm typecheck
```

## 📦 Packages

### @daodao/shared

共享工具函數、hooks 和常數定義。

### @daodao/ui

基於 shadcn/ui 的共享 UI 組件庫。

## 🔗 依賴關係

```
apps/website, apps/product
    ↓
packages/features/* (quiz, ...)
    ↓
packages/api, packages/i18n, packages/shared
    ↓
packages/ui
```

所有 packages 都繼承根目錄的 `tsconfig.base.json` 配置。

## 📝 開發指南

詳細的遷移計劃和開發指南請參考 [MONOREPO_MIGRATION_PLAN.md](.cursor/MONOREPO_MIGRATION_PLAN.md)。

## 🛠️ 技術棧

**Web:**
- **Next.js 15+**: App Router
- **React 19+**: UI 框架
- **TailwindCSS**: 樣式框架
- **shadcn/ui**: 組件庫

**Mobile:**
- **Expo**: React Native 開發框架
- **React Native**: 跨平台行動開發
- **Tamagui**: UI 組件庫

**共用:**
- **TypeScript 5.7+**: 類型安全
- **pnpm**: 套件管理
- **Turborepo**: Monorepo 構建工具（任務並行執行與快取）
- **Biome**: Linter & Formatter（替代 ESLint + Prettier）

## ⚙️ 配置檔案

所有共享配置檔案都在根目錄：

- `tsconfig.base.json` - TypeScript 基礎配置（各 package 繼承此配置）
- `postcss.config.js` - PostCSS 配置
- `biome.json` - Biome 配置
- `turbo.json` - Turborepo 配置

## 📄 License

See [license](license) file for details.

