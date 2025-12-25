# DaoDao Frontend Monorepo

DaoDao 前端專案的 monorepo 架構。

## 📁 專案結構

```
daodao-f2e/
├── apps/                    # 應用程式
│   ├── website/            # 靜態官網 (Next.js)
│   └── product/            # 產品網站 (Next.js)
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

### 安裝依賴

```bash
pnpm install
```

### 開發

```bash
# 開發所有 apps (使用 Turborepo)
pnpm dev

# 開發特定 app
pnpm --filter website dev
```

### 構建

```bash
# 構建所有 packages 和 apps (使用 Turborepo)
pnpm build

# 構建特定 package
pnpm --filter @daodao/shared build
```

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

- **Next.js 15+**: App Router
- **React 19+**: UI 框架
- **TypeScript 5.7+**: 類型安全
- **TailwindCSS**: 樣式框架
- **shadcn/ui**: 組件庫
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

