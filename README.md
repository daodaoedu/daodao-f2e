# 島島阿學官方網站專案 DaoDao official main website frontend project
**DaoDao網站是一個基於 Next.js 15 和 React 18 的高效能前端專案，正在將 Design System 重構為 Tailwind CSS，以提升一致性、可維護性與開發效率。專案採用 SWR 進行數據請求，並透過 Cloudflare Pages 部署，確保快速、現代且可擴展的 Web 體驗。**  
**DaoDao frontend project is a high-performance frontend project built with Next.js 15 and React 18, currently refactoring its Design System with Tailwind CSS to enhance consistency, maintainability, and development efficiency. The project leverages SWR for data fetching and is deployed via Cloudflare Pages, ensuring a fast, modern, and scalable web experience.**  

## 開發技術 | Tech Stack  

- **前端框架 / Frontend Framework**: Next.js 15 (React 18)  

- **部署環境 / Deployment Environment**: Cloudflare Pages  

- **狀態管理 / State Management**:  
  - **React Context (Main)** - 元件狀態共享 / Component state sharing  
  - **Redux + Redux Saga (Legacy)** - 舊有全局狀態管理 / Legacy global state management  

- **數據請求/Data Fetching**:  
  - **SWR (Main)** - 資料取得和緩存 / Data fetching and caching  
  - **Redux Saga (Legacy)** - 舊有非同步處理 / Legacy async processing  

- **UI 框架與樣式/UI Framework & Styling**:  
  - **Tailwind CSS (Main)** - 實用優先的 CSS 框架 / Utility-first CSS framework  
  - **自定義組件庫/Custom Component Library** - 基於 Tailwind 的手刻元件 / Handcrafted components based on Tailwind  
  - **Material-UI (MUI) v5 (Legacy)** - 舊有 UI 框架  
  - **Emotion (Legacy)** - 舊有 CSS-in-JS 方案  

- **開發語言 / Development Language**: TypeScript  

- **表單處理 / Form Handling**: React Hook Form + Zod  

- **開發規範 / Development Standards**: Airbnb ESLint  

- **API Services**: Cloudflare Workers  

- **PWA**: Supports Progressive Web Apps  

---

## 快速開始 | Quick Start  

### 環境要求 | Prerequisites  

- Node.js 20.19.4 (建議使用 nvm 進行版本管理)  
- pnpm 套件管理器  

**Node.js 20.19.4 (Recommended: Use nvm for version management)**  
**pnpm package manager**  

### 安裝依賴 | Install Dependencies  

```bash
pnpm install
```  

### 開發模式 | Development Mode  

一般開發（HTTP）:  
**Run in development mode (HTTP):**  
```bash
pnpm dev
```  

### 建置專案 | Build the Project  

```bash
pnpm build
```  

### 生產環境運行 | Run in Production  

```bash
pnpm start
```  

### 靜態檔案部署 | Static File Deployment  

1. 建置靜態檔案 | **Build static files**:  
```bash
pnpm build
```  

2. 預覽靜態檔案 | **Preview static files**:  
```bash
pnpm static
```  

### API 類型生成 | API Type Generation

本專案使用 Orval 自動生成 API 類型定義：  
**This project uses Orval to automatically generate API type definitions:**

1. **同步 OpenAPI 規格 | Sync OpenAPI Specification**:  
   - OpenAPI 規格檔案會透過 GitHub Actions 自動從後端專案同步  
   - The OpenAPI specification file is automatically synced from the backend project via GitHub Actions  

2. **生成 API 類型 | Generate API Types**:  
```bash
pnpm generate:api
```  

3. **監控模式 | Watch Mode** (開發時使用):  
```bash
pnpm generate:api:watch
```  

生成的類型檔案會放在 `services/generated/` 目錄下。  
**Generated type files will be placed in the `services/generated/` directory.**

### 國際化 (i18n) 管理 | Internationalization (i18n) Management

本專案支援多語言國際化，使用 Google App Script 進行翻譯資料管理：  
**This project supports multilingual internationalization using Google App Script for translation data management:**

1. **取得翻譯資料 | Fetch Translation Data**:  
   - 翻譯資料透過 Google Sheets 進行管理並自動同步  
   - Translation data is managed through Google Sheets and automatically synchronized  

2. **更新翻譯檔案 | Update Translation Files**:  
```bash
pnpm fetch:i18n
```

3. **開發模式監控 | Development Mode Monitoring**:  
```bash
pnpm fetch:i18n:watch
```

**配置要求 | Configuration Requirements:**  
- 需要在 `.env` 檔案中設定 `NEXT_I18N_URL` 環境變數  
- The `NEXT_I18N_URL` environment variable must be set in the `.env` file  
- 該 URL 指向包含翻譯資料的 Google App Script 端點  
- The URL points to a Google App Script endpoint containing translation data

---

## 專案架構 / Project Architecture

本專案採用 **Feature-Sliced Design (FSD) 混合架構**，結合 Next.js App Router 的特性，實現清晰的職責劃分和穩定的依賴關係。  
**This project adopts a hybrid Feature-Sliced Design (FSD) architecture combined with Next.js App Router features to achieve clear responsibility separation and stable dependency relationships.**

### 架構概述 / Architecture Overview

```
Next.js App Router → Widgets → Features → Entities → Shared
```

**依賴關係原則 / Dependency Rules:**
- ✅ 上層可以使用下層 / Upper layers can use lower layers
- ❌ 下層不能使用上層 / Lower layers cannot use upper layers  
- ⚠️ 同層之間可以相互使用，但要避免循環依賴 / Same-layer usage is allowed but avoid circular dependencies

## 專案結構 / Project Structure

```
daodao-f2e/
├── app/                    # Next.js App Router (路由與頁面層)
│   ├── [language]/         # 多語言路由 / Multi-language routing
│   │   ├── (guest)/        # 訪客頁面 / Guest pages
│   │   ├── (authenticated)/ # 認證頁面 / Authenticated pages
│   │   ├── layout.tsx      # 根布局 / Root layout
│   │   └── Providers.tsx   # 全域 Providers / Global providers
│   ├── api/               # API 路由 / API routes
│   └── global.css         # 全域樣式 / Global styles
├── widgets/               # 🧩 Widgets 層 - 大型 UI 組件集合
│   ├── layout/            # 布局相關 widgets / Layout widgets
│   ├── landing-page/      # 首頁相關 widgets / Landing page widgets
│   ├── about/             # 關於頁面 widgets / About page widgets
│   └── marathon/          # 馬拉松相關 widgets / Marathon widgets
├── features/              # ⚡ Features 層 - 具體業務功能
│   ├── circles/           # 圈子功能 / Circle features
│   ├── ideas/             # 想法功能 / Ideas features
│   ├── practice/          # 練習功能 / Practice features
│   ├── projects/          # 專案功能 / Project features
│   ├── quiz/              # 測驗功能 / Quiz features
│   ├── resources/         # 資源功能 / Resource features
│   ├── email/             # 郵件功能 / Email features
│   └── users/             # 用戶功能 / User features
├── entities/              # 🏢 Entities 層 - 業務實體抽象
│   └── marathon/          # 馬拉松實體 / Marathon entity
├── shared/                # 🔧 Shared 層 - 通用工具和組件
│   ├── ui/                # 通用 UI 組件 / Common UI components
│   ├── lib/               # 工具函數 / Utility functions
│   ├── components/        # 共享組件 / Shared components
│   ├── config/            # 配置文件 / Configuration files
│   └── constants.ts       # 常量定義 / Constants
├── components/            # Legacy 組件 (逐步遷移至 FSD)
├── contexts/              # React Context 定義 / React Context definitions
├── hooks/                 # 自定義 React Hooks / Custom React Hooks
├── layout/                # 布局組件 (遷移至 widgets/layout)
├── services/              # API 服務層 / API service layer
│   └── generated/         # OpenAPI 生成的代碼 / OpenAPI generated code
├── utils/                 # 工具函數 / Utility functions
├── constants/             # 常量定義 / Constant definitions
└── public/                # 靜態資源 / Static assets
```

## 目錄說明 / Directory Structure

### FSD 架構層級 / FSD Architecture Layers

#### 📄 Next.js App Router 層
**用途**：路由處理和頁面組件組合  
**Purpose**: Route handling and page component composition

- **`app/`**: Next.js App Router 目錄 / Next.js App Router directory
  - `[language]/`: 多語言路由支援 / Multi-language routing support
  - `layout.tsx`: 根布局組件 / Root layout component
  - `Providers.tsx`: 全域 Context Providers / Global Context Providers
  - `api/`: API 路由處理 / API route handlers

**職責 / Responsibilities:**
- 路由定義和頁面組合 / Route definition and page composition
- 組合 widgets 形成完整頁面 / Compose widgets to form complete pages
- 頁面級別的 SEO 和元數據管理 / Page-level SEO and metadata management

#### 🧩 Widgets 層
**用途**：大型的 UI 組件集合，自包含的功能模組  
**Purpose**: Large UI component collections, self-contained functional modules

- **`widgets/`**: 可重複使用的大型組件 / Reusable large components
  - `layout/`: 布局相關 widgets / Layout-related widgets
  - `landing-page/`: 首頁功能組件 / Landing page components
  - `about/`: 關於頁面組件 / About page components
  - `marathon/`: 馬拉松相關組件 / Marathon-related components

**職責 / Responsibilities:**
- 組合多個 features 和 entities / Combine multiple features and entities
- 大型 UI 組件實現 / Large UI component implementation
- 可在多個頁面重複使用 / Reusable across multiple pages

#### ⚡ Features 層
**用途**：具體的業務功能實現，用戶可執行的操作  
**Purpose**: Specific business feature implementation, user-executable operations

- **`features/`**: 業務功能模組 / Business feature modules
  - `circles/`: 圈子相關功能 / Circle-related features
  - `ideas/`: 想法管理功能 / Ideas management features
  - `practice/`: 練習相關功能 / Practice-related features
  - `projects/`: 專案管理功能 / Project management features
  - `quiz/`: 測驗功能 / Quiz features
  - `resources/`: 資源管理功能 / Resource management features
  - `email/`: 郵件功能 / Email features
  - `users/`: 用戶管理功能 / User management features

**職責 / Responsibilities:**
- 具體業務功能實現 / Specific business functionality
- 用戶交互操作處理 / User interaction handling
- 帶來業務價值的功能 / Value-bringing features

#### 🏢 Entities 層
**用途**：業務實體的抽象，數據模型和相關 UI  
**Purpose**: Business entity abstraction, data models and related UI

- **`entities/`**: 業務實體定義 / Business entity definitions
  - `marathon/`: 馬拉松業務實體 / Marathon business entity

**職責 / Responsibilities:**
- 業務實體抽象和數據模型 / Business entity abstraction and data models
- 純展示 UI 組件 / Pure presentation UI components
- 基礎 CRUD 操作 / Basic CRUD operations

#### 🔧 Shared 層
**用途**：可重複使用的通用組件、工具和應用配置  
**Purpose**: Reusable common components, utilities, and application configuration

- **`shared/`**: 通用工具和組件 / Common utilities and components
  - `ui/`: 通用 UI 組件庫 / Common UI component library
  - `lib/`: 工具函數和 hooks / Utility functions and hooks
  - `components/`: 共享組件 / Shared components
  - `config/`: 應用配置 / Application configuration
  - `constants.ts`: 全域常量 / Global constants

**職責 / Responsibilities:**
- 通用 UI 組件提供 / Common UI component provision
- 工具函數和 hooks / Utility functions and hooks
- 全域配置和常量 / Global configuration and constants
- 與業務邏輯無關的代碼 / Business-logic-agnostic code

### Legacy 目錄 (逐步遷移中) / Legacy Directories (Gradually Migrating)

#### 傳統組件和工具 / Traditional Components and Utilities

- **`components/`**: Legacy React 組件庫 (逐步遷移至 FSD) / Legacy React component library (gradually migrating to FSD)
- **`contexts/`**: React Context 定義 / React Context definitions
- **`hooks/`**: 自定義 React Hooks / Custom React Hooks  
- **`layout/`**: 布局組件 (遷移至 widgets/layout) / Layout components (migrating to widgets/layout)
- **`services/`**: API 服務層 / API service layer
  - `generated/`: OpenAPI 生成的代碼 / OpenAPI generated code
- **`utils/`**: 工具函數 / Utility functions
- **`constants/`**: 常量定義 / Constant definitions
- **`public/`**: 靜態資源 / Static assets

**遷移計劃 / Migration Plan:**
- 逐步將 `components/` 中的組件遷移至對應的 FSD 層級
- 將通用組件移至 `shared/ui/`
- 將業務組件移至 `features/` 或 `widgets/`
- 保持向下兼容直到遷移完成

---

## FSD 開發規範 / FSD Development Guidelines

### ✅ 架構原則 / Architecture Principles

1. **嚴格的依賴關係 / Strict Dependency Rules**
   - 上層可以使用下層：App Router → Widgets → Features → Entities → Shared
   - 下層不能使用上層，避免循環依賴
   - 同層之間可以相互使用，但需謹慎避免循環依賴

2. **業務導向的組織 / Business-Oriented Organization**
   - 按業務領域劃分 slice（如 auth, projects, users）
   - 按技術目的劃分 segment（如 ui, api, model, lib）
   - 保持高內聚、低耦合

3. **漸進式遷移 / Progressive Migration**
   - 新功能優先使用 FSD 架構
   - 舊功能按需遷移，不強制一次性重構
   - 保持向下兼容

### 📂 Segment 組織規範 / Segment Organization Rules

每個 slice 內部按以下 segment 組織：

- **`ui/`**: React 組件和樣式
- **`api/`**: API 請求函數和數據獲取
- **`model/`**: 狀態管理和業務邏輯  
- **`lib/`**: 工具函數和輔助函數
- **`config/`**: 配置文件和常量
- **`types/`**: TypeScript 類型定義
- **`index.ts`**: 統一導出接口

### 🔄 狀態管理策略 / State Management Strategy

1. **優先級順序 / Priority Order**
   - **Context + SWR**: 新功能的首選方案
   - **Redux + Saga**: 舊功能暫時保留，逐步遷移
   - **Component State**: 組件內部狀態

2. **使用場景 / Use Cases**
   - **Context**: UI 狀態、主題設置、用戶偏好
   - **SWR**: 數據獲取、API 請求、緩存管理
   - **Redux**: 複雜全局狀態（待遷移）

### 🎯 組件開發規範 / Component Development Guidelines

1. **FSD 層級選擇 / FSD Layer Selection**
   ```typescript
   // ✅ Shared: 通用 UI 組件
   // shared/ui/button/Button.tsx
   export const Button = ({ children, ...props }) => (
     <button className="btn" {...props}>{children}</button>
   );

   // ✅ Entities: 純展示業務實體
   // entities/user/ui/UserCard.tsx
   export const UserCard = ({ user }) => (
     <div className="user-card">
       <img src={user.avatar} alt={user.name} />
       <h3>{user.name}</h3>
     </div>
   );

   // ✅ Features: 具體業務功能
   // entities/user/ui/LoginForm.tsx
   export const LoginForm = () => {
     const { login } = useAuth();
     return <form onSubmit={login}>...</form>;
   };

   // ✅ Widgets: 組合多個功能
   // widgets/header/ui/Header.tsx
   export const Header = () => (
     <header>
       <Logo />
       <Navigation />
       <UserMenu />
     </header>
   );
   ```

2. **導出規範 / Export Standards**
   ```typescript
   // 每個 slice 的 index.ts 統一導出
   // entities/user/index.ts
   export { LoginForm } from './ui/LoginForm';
   export { useAuth } from './model/useAuth';
   export { authApi } from './api/authApi';
   ```

---

## 開發規範 / Development Guidelines

### Git 工作流程 / Git Workflow

1. **分支管理 / Branch Management**:
   - `dev`: 開發分支，用於整合功能和測試 / Development branch for feature integration and testing
   - `prod`: 生產環境分支，僅接受穩定版本更新 / Production branch, only stable updates allowed

2. **Git 工作流程 / Git Workflow**:
   - 功能開發：從 `dev` 分支建立功能分支 -> 開發 -> 合併回 `dev` / Feature development: Create feature branch from `dev` -> Develop -> Merge back to `dev`
   - 緊急修復：從 `prod` 分支建立 hotfix 分支 -> 修復 -> 合併至 `prod` 和 `dev` / Hotfix: Create hotfix branch from `prod` -> Fix -> Merge into `prod` and `dev`

### 程式碼規範 / Code Standards

3. **程式碼風格 / Code Style**:
   - 遵循 Airbnb ESLint 規範 / Follow Airbnb ESLint rules
   - 組件樣式優先使用 Tailwind CSS 類名 / Prefer Tailwind CSS class names for component styles
   - 避免使用 CSS-in-JS，除非特殊情況 / Avoid CSS-in-JS unless necessary

4. **FSD 組件開發 / FSD Component Development**:
   - 新組件優先放置在對應的 FSD 層級 / New components should be placed in appropriate FSD layers
   - Legacy 組件逐步遷移至 FSD 架構 / Legacy components should gradually migrate to FSD architecture
   - 使用 TypeScript 類型定義 / Use TypeScript type definitions
   - UI 組件開發規範 / UI Component Development Guidelines:
     - 優先使用 Tailwind CSS 類名 / Prefer Tailwind CSS class names
     - 組件應該是完全自包含的 / Components should be fully self-contained
     - 提供完整的 TypeScript 類型定義 / Provide complete TypeScript type definitions
     - 實現響應式設計 / Implement responsive design
     - 確保可訪問性 (ARIA 標籤等) / Ensure accessibility (ARIA labels, etc.)
     - 提供適當的默認值和錯誤處理 / Provide appropriate default values and error handling

5. **狀態管理規範 / State Management Guidelines**:
   - 新功能開發優先使用 React Context + SWR / New features should prioritize React Context + SWR
   - 舊有 Redux + Saga 功能按需遷移 / Migrate old Redux + Saga features as needed
   - 狀態管理選擇指南 / State Management Selection Guide:
     - 使用 Context / Use Context:
       - 組件樹內的狀態共享 / Component tree state sharing
       - UI 相關狀態 / UI-related state
       - 主題設置 / Theme settings
       - 用戶偏好 / User preferences
       - 表單狀態 / Form state
     - 使用 SWR / Use SWR:
       - 數據獲取和緩存 / Data fetching and caching
       - API 請求 / API requests
       - 實時數據更新 / Real-time data updates
       - 分頁加載 / Pagination loading
     - 暫時保留 Redux / Keep Redux temporarily:
       - 複雜的全局狀態 / Complex global state
       - 待遷移的舊功能 / Legacy features pending migration
   - 組件內部狀態使用 React Hooks / Use React Hooks for internal component state

# 狀態管理遷移指南 / State Management Migration Guide

## 1. 遷移優先順序 / Migration Priorities
- 優先遷移簡單的 API 請求至 SWR / Prioritize migrating simple API requests to SWR
- 其次是獨立的功能模塊 / Then migrate independent functional modules
- 最後是複雜的全局狀態 / Finally, migrate complex global states

## 2. Redux Saga 到 SWR 的遷移步驟 / Steps to Migrate from Redux Saga to SWR
- 識別 Saga 中的 API 請求邏輯 / Identify API request logic in Saga
- 創建對應的 SWR hooks / Create corresponding SWR hooks
- 在組件中使用 SWR hooks 替換 Redux 連接 / Replace Redux connections with SWR hooks in components
- 移除相關的 Saga 和 Redux 代碼 / Remove related Saga and Redux code
- 更新相關組件的數據獲取方式 / Update data fetching methods in related components

## 3. SWR 最佳實踐 / SWR Best Practices
- 使用 SWR 的全局配置 / Use SWR's global configuration
- 實現適當的緩存策略 / Implement appropriate caching strategies
- 處理錯誤和加載狀態 / Handle errors and loading states
- 實現數據預取 / Implement data prefetching
- 配置自動重新驗證 / Configure automatic revalidation

## 4. 注意事項 / Considerations
- 確保遷移過程中功能的穩定性 / Ensure functional stability during migration
- 添加適當的錯誤處理 / Implement proper error handling
- 保持向下兼容 / Maintain backward compatibility
- 完整測試新實現的功能 / Fully test newly implemented features
- 注意數據一致性 / Ensure data consistency

---

# UI 組件遷移指南 / UI Component Migration Guide

## 1. 遷移優先順序 / Migration Priorities
- 優先遷移簡單的展示型組件 / Prioritize migrating simple presentation components
- 其次是表單相關組件 / Then migrate form-related components
- 最後是複雜的互動組件 / Finally, migrate complex interactive components

## 2. MUI 到自定義組件的遷移步驟 / Steps to Migrate from MUI to Custom Components
- 分析現有 MUI 組件的功能和樣式 / Analyze the functionality and styles of existing MUI components
- 使用 Tailwind 創建對應的基礎樣式 / Use Tailwind to create corresponding base styles
- 實現必要的互動邏輯 / Implement necessary interaction logic
- 確保組件的可訪問性 / Ensure component accessibility
- 添加響應式設計 / Add responsive design
- 更新組件文檔 / Update component documentation

## 3. Tailwind 最佳實踐 / Tailwind Best Practices
- 使用 Tailwind 的組件類抽象 / Use Tailwind's component class abstraction
- 利用 @apply 指令組織複雜樣式 / Use @apply directive to organize complex styles
- 遵循移動優先的響應式設計 / Follow mobile-first responsive design
- 使用主題配置確保一致性 / Use theme configuration to ensure consistency
- 優化可重用的樣式模式 / Optimize reusable style patterns

## 4. 注意事項 / Considerations
- 確保遷移過程中的 UI 一致性 / Ensure UI consistency during migration
- 保持組件 API 的兼容性 / Maintain compatibility of component APIs
- 完整測試各種設備和瀏覽器 / Fully test across various devices and browsers
- 注意性能優化 / Optimize performance
- 維護良好的文檔 / Maintain well-documented code

---

## 環境變數 / Environment Variables

本專案使用 `.env` 文件管理環境變數。請參考 `.env.sample` 文件進行配置： / This project uses `.env` files to manage environment variables. Refer to `.env.sample` for configuration:

```env
# API 配置 / API Configuration
NEXT_PUBLIC_API_URL=           # API 基礎 URL / Base API URL

# 國際化配置 / Internationalization Configuration
NEXT_I18N_URL=                # Google App Script URL for i18n data fetching
```

### 環境變數使用規範 / Environment Variable Usage Guidelines

1. **命名規範 / Naming Rules**:
   - 前端可訪問的變數必須以 `NEXT_PUBLIC_` 開頭 / Variables accessible by the frontend must start with `NEXT_PUBLIC_`
   - 使用大寫字母和下劃線 / Use uppercase letters and underscores
   - 名稱應清晰表明用途 / The name should clearly indicate its purpose

2. **安全性規範 / Security Rules**:
   - 敏感信息不要以 `NEXT_PUBLIC_` 開頭 / Sensitive information should not start with `NEXT_PUBLIC_`
   - 密鑰等敏感信息使用 CI/CD 環境變數 / Use CI/CD environment variables for sensitive keys
   - 本地開發使用假數據或測試帳號 / Use mock data or test accounts for local development

3. **版本控制 / Version Control**:
   - `.env` 文件不納入版本控制 / Do not include `.env` in version control
   - 提供 `.env.sample` 作為範例 / Provide `.env.sample` as a template
   - 在文檔中說明所有必需的環境變數 / Document all required environment variables

## 部署 / Deployment

本專案使用 Cloudflare Pages 進行部署 / This project is deployed using Cloudflare Pages.


```bash
pnpm deploy
```
# CI/CD 流程 | CI/CD Workflow

本專案使用 GitHub Actions 和 Cloudflare Pages 進行持續整合和部署。
This project uses GitHub Actions and Cloudflare Pages for continuous integration and deployment.

## CI 流程 (GitHub Actions) | CI Process (GitHub Actions)

在 Pull Request 時觸發以下檢查：
The following checks are triggered on a Pull Request:

```yaml
name: Continuous Integration

jobs:
  init:
    # 初始化和依賴安裝 | Initialization and dependency installation
    - 檢出代碼 | Checkout code
    - 緩存依賴 | Cache dependencies
    - 安裝依賴 | Install dependencies

  check:
    # TypeScript 類型檢查 | TypeScript type checking
    - 運行 pnpm ts:check | Run pnpm ts:check
    - 錯誤通知（Discord） | Error notification (Discord)

  lint:
    # ESLint 代碼檢查 | ESLint code linting
    - 運行 pnpm lint | Run pnpm lint
    - 自動格式化 | Auto-format code
    - 錯誤通知（Discord） | Error notification (Discord)
```

## CD 流程 (Cloudflare Pages) | CD Process (Cloudflare Pages)

在推送到特定分支時觸發部署：
Deployment is triggered when pushing to specific branches:

```yaml
name: Continuous Delivery

on:
  push:
    branches: [prod, dev]

jobs:
  continuous_integration:
    # 運行完整的 CI 檢查 | Run full CI checks

  build_and_deploy:
    # 建置和部署流程 | Build and deploy process
    - 建置專案 | Build project
    - 部署到 Cloudflare Pages | Deploy to Cloudflare Pages
    - 生成預覽 URL | Generate preview URL

  send_result:
    # 部署結果通知 | Deployment result notification
    - 成功/失敗通知到 Discord | Success/failure notification to Discord
    - 包含預覽 URL 或錯誤信息 | Include preview URL or error messages
```

## 自動化功能 | Automation Features

1. **代碼質量控制 | Code Quality Control**
   - TypeScript 類型檢查 | TypeScript type checking
   - ESLint 代碼規範檢查 | ESLint code linting
   - 自動代碼格式化 | Automatic code formatting

2. **部署流程 | Deployment Process**
   - 自動建置 | Automated build
   - 環境變數注入 | Environment variable injection
   - Cloudflare Pages 部署 | Cloudflare Pages deployment
   - 預覽 URL 生成 | Preview URL generation

3. **通知機制 | Notification System**
   - Discord 集成 | Discord integration
   - 錯誤通知 | Error notifications
   - 部署狀態通知 | Deployment status updates
   - 預覽鏈接分享 | Preview link sharing

## 分支策略 | Branch Strategy

- `dev`: 開發環境分支 | Development branch
  - 自動部署到開發環境 | Automatically deploy to the development environment
  - 生成預覽 URL | Generate preview URL

- `prod`: 生產環境分支 | Production branch
  - 部署到正式環境 | Deploy to the production environment
  - 部署到 www.daoedu.tw | Deploy to www.daoedu.tw

## 授權 | License

本專案採用 GNU Lesser General Public License v3.0 (LGPL-3.0) 授權條款 - 詳見 [LICENSE](./license) 文件。
This project is licensed under the GNU Lesser General Public License v3.0 (LGPL-3.0) - see the [LICENSE](./license) file for details.

LGPL-3.0 授權要點 | Key points of LGPL-3.0:
- 允許將本軟體用於商業用途 | Allows commercial use
- 允許修改原始碼 | Allows modifications
- 必須開放修改後的原始碼 | Modified source code must be disclosed
- 必須包含原作者的版權聲明 | Must include the original copyright notice
- 修改後的軟體也必須使用 LGPL-3.0 授權 | Modified software must also be licensed under LGPL-3.0
- 不提供品質保證 | No warranty provided

## 貢獻指南 | Contribution Guidelines

1. Fork 本專案 | Fork this repository
2. 建立功能分支 (`git checkout -b feature/amazing-feature`) | Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`) | Commit your changes (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`) | Push to the branch (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request | Open a Pull Request

## 相關資源 | Related Resources

- [Next.js 文檔 | Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS 文檔 | Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Context 文檔 | React Context Documentation](https://react.dev/reference/react/useContext)
- [SWR 文檔 | SWR Documentation](https://swr.vercel.app/)
- [React Hook Form 文檔 | React Hook Form Documentation](https://react-hook-form.com/)
- [Zod 文檔 | Zod Documentation](https://zod.dev/)
