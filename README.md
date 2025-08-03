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
- Yarn 套件管理器  

**Node.js 20.19.4 (Recommended: Use nvm for version management)**  
**Yarn package manager**  

### 安裝依賴 | Install Dependencies  

```bash
yarn install
```  

### 開發模式 | Development Mode  

一般開發（HTTP）:  
**Run in development mode (HTTP):**  
```bash
yarn dev
```  

### 建置專案 | Build the Project  

```bash
yarn build
```  

### 生產環境運行 | Run in Production  

```bash
yarn start
```  

### 靜態檔案部署 | Static File Deployment  

1. 建置靜態檔案 | **Build static files**:  
```bash
yarn build
```  

2. 預覽靜態檔案 | **Preview static files**:  
```bash
yarn static
```  

### API 類型生成 | API Type Generation

本專案使用 Orval 自動生成 API 類型定義：  
**This project uses Orval to automatically generate API type definitions:**

1. **同步 OpenAPI 規格 | Sync OpenAPI Specification**:  
   - OpenAPI 規格檔案會透過 GitHub Actions 自動從後端專案同步  
   - The OpenAPI specification file is automatically synced from the backend project via GitHub Actions  

2. **生成 API 類型 | Generate API Types**:  
```bash
yarn generate:api
```  

3. **監控模式 | Watch Mode** (開發時使用):  
```bash
yarn generate:api:watch
```  

生成的類型檔案會放在 `services/generated/` 目錄下。  
**Generated type files will be placed in the `services/generated/` directory.**

---

## 專案結構 / Project Structure

```
daodao-f2e/
├── pages/                # Next.js 頁面路由 / Next.js page routes
│   ├── _app.tsx         # 應用程式入口點 / Application entry point
│   ├── _document.tsx    # 自定義 HTML 文檔 / Custom HTML document
│   ├── api/             # API 路由處理 / API route handlers
│   └── [...slug].tsx    # 動態路由頁面 / Dynamic route pages
├── components/          # 可重用的 React 元件 / Reusable React components
│   ├── common/          # 通用基礎元件（手刻）/ Basic components (custom-built)
│   ├── ui/             # UI 組件庫（手刻）/ UI component library (custom-built)
│   ├── forms/          # 表單相關組件 / Form-related components
│   └── layouts/        # 布局組件 / Layout components
├── public/             # 靜態資源文件 / Static assets
│   ├── images/         # 圖片資源 / Image assets
│   └── fonts/          # 字體文件 / Font files
├── services/           # API 服務層 / API service layer
│   ├── api/            # API 請求處理 / API request handling
│   └── types/          # API 相關類型定義 / API-related type definitions
├── hooks/              # 自定義 React Hooks / Custom React Hooks
│   ├── useAuth/        # 認證相關 hooks / Authentication hooks
│   └── useForm/        # 表單相關 hooks / Form-related hooks
├── contexts/           # React Context 定義 / React Context definitions
│   ├── AuthContext/    # 用戶認證 / User authentication
│   └── ThemeContext/   # 主題設置 / Theme settings
├── redux/              # Redux 相關文件 / Redux-related files
│   ├── store/          # Redux store 配置 / Redux store configuration
│   ├── actions/        # Action 創建器 / Action creators
│   ├── reducers/       # Reducer 函數 / Reducer functions
│   └── sagas/         # Redux Saga 非同步處理 / Redux Saga for async processing
├── utils/             # 工具函數 / Utility functions
│   ├── api/           # API 相關工具 / API utilities
│   ├── format/        # 格式化工具 / Formatting utilities
│   └── validation/    # 驗證工具 / Validation utilities
├── constants/         # 常量定義 / Constant definitions
│   ├── api/           # API 相關常量 / API-related constants
│   └── config/        # 配置常量 / Configuration constants
├── shared/            # 共享組件 / Shared components
│   ├── Nav/           # 導航組件 / Navigation components
│   └── Footer/        # 頁腳組件 / Footer components
├── styles/            # 全局樣式 / Global styles
│   ├── globals.css    # 全局 CSS / Global CSS
│   └── theme/         # 主題配置 / Theme configuration
├── types/             # TypeScript 類型定義 / TypeScript type definitions
├── config/            # 專案配置文件 / Project configuration files
│   ├── next.config.js # Next.js 配置 / Next.js configuration
│   └── tailwind.config.js # Tailwind 配置 / Tailwind configuration
└── package.json       # 專案依賴配置 / Project dependencies
```

## 目錄說明 / Directory Structure

### 核心目錄 / Core Directories

- **`/pages`**: Next.js 的檔案系統路由 / Next.js file-based routing system
  - `_app.tsx`: 應用程式的主要入口點，包含全局設置 / Main entry point of the application, includes global settings
  - `_document.tsx`: 自定義 HTML 文檔結構 / Custom HTML document structure
  - `api/`: 後端 API 路由處理 / Backend API route handling
  - 其他頁面組件 / Other page components

- **`/components`**: React 組件庫 / React component library
  - `common/`: 按鈕、輸入框等基礎組件（手刻）/ Basic components such as buttons and input fields (handcrafted)
  - `ui/`: 複雜 UI 元件（手刻）/ Complex UI components (handcrafted)
  - `forms/`: 表單相關元件 / Form-related components
  - `layouts/`: 頁面布局元件 / Layout components

- **`/services`**: 後端服務整合 / Backend service integration
  - API 請求處理 / API request handling
  - API 類型定義 / API type definitions
  - 外部服務整合 / External service integration

### 狀態管理 / State Management

- **`/contexts`**: React Context 定義（推薦使用）/ React Context definitions (recommended)
  - 用於元件內的狀態共享 / Used for component-level state sharing
  - 主要處理 UI 狀態和主題設置 / Primarily handles UI state and theme settings
  - 新功能優先使用 Context 實現 / New features should prioritize Context implementation
  - 目前已實現的 Context / Currently implemented Contexts:
    - `AuthContext`: 用戶認證狀態 / User authentication state
    - `ThemeContext`: 主題設置 / Theme settings
    - 其他業務相關 Context / Other business-related Contexts

- **`/hooks`**: 自定義 React Hooks / Custom React Hooks
  - 封裝可重用的狀態邏輯 / Encapsulates reusable state logic
  - 提供通用功能 / Provides general functionality
  - SWR 數據請求 hooks / SWR data fetching hooks:
    - `useUser`: 用戶數據 / User data
    - `usePosts`: 文章列表 / Post list
    - `useComments`: 評論數據 / Comment data

- **`/redux`**: 全局狀態管理（逐步遷移中）/ Global state management (gradually migrating)
  - `store/`: Redux store 配置 / Redux store configuration
  - `actions/`: 定義狀態變更動作 / Defines state change actions
  - `reducers/`: 處理狀態更新邏輯 / Handles state update logic
  - `sagas/`: 處理非同步操作（逐步遷移至 SWR）/ Handles asynchronous operations (gradually migrating to SWR)
  - 注意：新功能不建議使用 Redux，優先使用 Context + SWR / Note: Redux is not recommended for new features; prefer Context + SWR

### 工具和配置 / Utilities and Configuration

- **`/utils`**: 工具函數集 / Utility functions
  - API 請求輔助函數 / API request helper functions
  - 數據格式化 / Data formatting
  - 驗證函數 / Validation functions

- **`/constants`**: 常量定義 / Constant definitions
  - API 端點 / API endpoints
  - 配置常量 / Configuration constants
  - 錯誤碼 / Error codes

### 樣式和資源 / Styles and Assets

- **`/public`**: 靜態資源 / Static assets
  - 圖片、字體等靜態文件 / Static files such as images and fonts
  - PWA 相關文件 / PWA-related files

- **`/styles`**: 樣式文件 / Style files
  - 全局樣式設定 / Global style settings
  - 主題配置 / Theme configuration
  - Tailwind 自定義設置 / Tailwind custom settings

### 類型定義 / Type Definitions

- **`/types`**: TypeScript 類型定義 / TypeScript type definitions
  - 全局類型聲明 / Global type declarations
  - 模組類型定義 / Module-specific type definitions

## 開發規範 / Development Guidelines

1. **分支管理 / Branch Management**:
   - `dev`: 開發分支，用於整合功能和測試 / Development branch for feature integration and testing
   - `prod`: 生產環境分支，僅接受穩定版本更新 / Production branch, only stable updates allowed

2. **Git 工作流程 / Git Workflow**:
   - 功能開發：從 `dev` 分支建立功能分支 -> 開發 -> 合併回 `dev` / Feature development: Create feature branch from `dev` -> Develop -> Merge back to `dev`
   - 緊急修復：從 `prod` 分支建立 hotfix 分支 -> 修復 -> 合併至 `prod` 和 `dev` / Hotfix: Create hotfix branch from `prod` -> Fix -> Merge into `prod` and `dev`

3. **程式碼風格 / Code Style**:
   - 遵循 Airbnb ESLint 規範 / Follow Airbnb ESLint rules
   - 組件樣式優先使用 Tailwind CSS 類名 / Prefer Tailwind CSS class names for component styles
   - 避免使用 CSS-in-JS，除非特殊情況 / Avoid CSS-in-JS unless necessary

4. **組件開發 / Component Development**:
   - 共享元件放置在 `/shared` 目錄 / Shared components are placed in `/shared` directory
   - 頁面特定元件放置在對應的頁面目錄 / Page-specific components are placed in corresponding page directories
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
yarn deploy
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
    - 運行 yarn ts:check | Run yarn ts:check
    - 錯誤通知（Discord） | Error notification (Discord)

  lint:
    # ESLint 代碼檢查 | ESLint code linting
    - 運行 yarn lint | Run yarn lint
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
