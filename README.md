# DaoDao 前端專案 (daodao-f2e)

DaoDao 是一個使用現代前端技術開發的網站專案。本專案採用 React 18 和 Next.js 框架。

## 開發技術

- **前端框架**: Next.js 15 (React 18)
- **部署環境**: Cloudflare Pages
- **狀態管理**: 
  - React Context (主推) - 元件狀態共享
  - Redux + Redux Saga (逐步遷移中) - 舊有全局狀態管理
- **數據請求**: 
  - SWR (主推) - 資料取得和緩存
  - Redux Saga (逐步淘汰) - 舊有非同步處理
- **UI 框架與樣式**: 
  - Tailwind CSS (主推) - 實用優先的 CSS 框架
  - 自定義組件庫 - 基於 Tailwind 的手刻元件
  - Material-UI (MUI) v5 (逐步淘汰) - 舊有 UI 框架
  - Emotion (逐步淘汰) - 舊有 CSS-in-JS 方案
- **開發語言**: TypeScript
- **表單處理**: React Hook Form + Zod
- **開發規範**: Airbnb ESLint
- **API 服務**: Cloudflare Workers
- **PWA**: 支援漸進式網頁應用程式

## 快速開始

### 環境要求

- Node.js 16.14.0 (建議使用 nvm 進行版本管理)
- Yarn 套件管理器

### 安裝依賴

```bash
yarn install
```

### 開發模式

一般開發（HTTP）:
```bash
yarn dev
```

### 建置專案

```bash
yarn build
```

### 生產環境運行

```bash
yarn start
```

### 靜態檔案部署

1. 建置靜態檔案：
```bash
yarn build
```

2. 預覽靜態檔案：
```bash
yarn static
```

## 專案結構

```
daodao-f2e/
├── pages/                # Next.js 頁面路由
│   ├── _app.tsx         # 應用程式入口點
│   ├── _document.tsx    # 自定義 HTML 文檔
│   ├── api/             # API 路由處理
│   └── [...slug].tsx    # 動態路由頁面
├── components/          # 可重用的 React 元件
│   ├── common/          # 通用基礎元件（手刻）
│   ├── ui/             # UI 組件庫（手刻）
│   ├── forms/          # 表單相關組件
│   └── layouts/        # 布局組件
├── public/             # 靜態資源文件
│   ├── images/         # 圖片資源
│   └── fonts/          # 字體文件
├── services/           # API 服務層
│   ├── api/            # API 請求處理
│   └── types/          # API 相關類型定義
├── hooks/              # 自定義 React Hooks
│   ├── useAuth/        # 認證相關 hooks
│   └── useForm/        # 表單相關 hooks
├── contexts/           # React Context 定義
│   ├── AuthContext/    # 用戶認證
│   └── ThemeContext/   # 主題設置
├── redux/              # Redux 相關文件
│   ├── store/          # Redux store 配置
│   ├── actions/        # Action 創建器
│   ├── reducers/       # Reducer 函數
│   └── sagas/         # Redux Saga 非同步處理
├── utils/             # 工具函數
│   ├── api/           # API 相關工具
│   ├── format/        # 格式化工具
│   └── validation/    # 驗證工具
├── constants/         # 常量定義
│   ├── api/           # API 相關常量
│   └── config/        # 配置常量
├── shared/            # 共享組件
│   ├── Nav/           # 導航組件
│   └── Footer/        # 頁腳組件
├── styles/            # 全局樣式
│   ├── globals.css    # 全局 CSS
│   └── theme/         # 主題配置
├── types/             # TypeScript 類型定義
├── config/            # 專案配置文件
│   ├── next.config.js # Next.js 配置
│   └── tailwind.config.js # Tailwind 配置
└── package.json       # 專案依賴配置
```

### 目錄說明

#### 核心目錄

- **`/pages`**: Next.js 的檔案系統路由
  - `_app.tsx`: 應用程式的主要入口點，包含全局設置
  - `_document.tsx`: 自定義 HTML 文檔結構
  - `api/`: 後端 API 路由處理
  - 其他頁面組件

- **`/components`**: React 組件庫
  - `common/`: 按鈕、輸入框等基礎組件（手刻）
  - `ui/`: 複雜 UI 元件（手刻）
  - `forms/`: 表單相關元件
  - `layouts/`: 頁面布局元件

- **`/services`**: 後端服務整合
  - API 請求處理
  - API 類型定義
  - 外部服務整合

#### 狀態管理

- **`/contexts`**: React Context 定義（推薦使用）
  - 用於元件內的狀態共享
  - 主要處理 UI 狀態和主題設置
  - 新功能優先使用 Context 實現
  - 目前已實現的 Context：
    - `AuthContext`: 用戶認證狀態
    - `ThemeContext`: 主題設置
    - 其他業務相關 Context

- **`/hooks`**: 自定義 React Hooks
  - 封裝可重用的狀態邏輯
  - 提供通用功能
  - SWR 數據請求 hooks
    - `useUser`: 用戶數據
    - `usePosts`: 文章列表
    - `useComments`: 評論數據

- **`/redux`**: 全局狀態管理（逐步遷移中）
  - `store/`: Redux store 配置
  - `actions/`: 定義狀態變更動作
  - `reducers/`: 處理狀態更新邏輯
  - `sagas/`: 處理非同步操作（逐步遷移至 SWR）
  - 注意：新功能不建議使用 Redux，優先使用 Context + SWR

#### 工具和配置

- **`/utils`**: 工具函數集
  - API 請求輔助函數
  - 數據格式化
  - 驗證函數

- **`/constants`**: 常量定義
  - API 端點
  - 配置常量
  - 錯誤碼

#### 樣式和資源

- **`/public`**: 靜態資源
  - 圖片、字體等靜態文件
  - PWA 相關文件

- **`/styles`**: 樣式文件
  - 全局樣式設定
  - 主題配置
  - Tailwind 自定義設置

#### 類型定義

- **`/types`**: TypeScript 類型定義
  - 全局類型聲明
  - 模組類型定義

## 開發規範

1. **分支管理**:
   - `dev`: 開發分支，用於整合功能和測試
   - `prod`: 生產環境分支，僅接受穩定版本更新

2. **Git 工作流程**:
   - 功能開發：從 `dev` 分支建立功能分支 -> 開發 -> 合併回 `dev`
   - 緊急修復：從 `prod` 分支建立 hotfix 分支 -> 修復 -> 合併至 `prod` 和 `dev`

3. **程式碼風格**:
   - 遵循 Airbnb ESLint 規範
   - 組件樣式優先使用 Tailwind CSS 類名
   - 避免使用 CSS-in-JS，除非特殊情況

4. **組件開發**:
   - 共享元件放置在 `/shared` 目錄
   - 頁面特定元件放置在對應的頁面目錄
   - 使用 TypeScript 類型定義
   - UI 組件開發規範：
     - 優先使用 Tailwind CSS 類名
     - 組件應該是完全自包含的
     - 提供完整的 TypeScript 類型定義
     - 實現響應式設計
     - 確保可訪問性 (ARIA 標籤等)
     - 提供適當的默認值和錯誤處理

5. **狀態管理規範**:
   - 新功能開發優先使用 React Context + SWR
   - 舊有 Redux + Saga 功能按需遷移
   - 狀態管理選擇指南：
     - 使用 Context:
       - 組件樹內的狀態共享
       - UI 相關狀態
       - 主題設置
       - 用戶偏好
       - 表單狀態
     - 使用 SWR:
       - 數據獲取和緩存
       - API 請求
       - 實時數據更新
       - 分頁加載
     - 暫時保留 Redux:
       - 複雜的全局狀態
       - 待遷移的舊功能
   - 組件內部狀態使用 React Hooks

### 狀態管理遷移指南

1. **遷移優先順序**
   - 優先遷移簡單的 API 請求至 SWR
   - 其次是獨立的功能模塊
   - 最後是複雜的全局狀態

2. **Redux Saga 到 SWR 的遷移步驟**
   - 識別 Saga 中的 API 請求邏輯
   - 創建對應的 SWR hooks
   - 在組件中使用 SWR hooks 替換 Redux 連接
   - 移除相關的 Saga 和 Redux 代碼
   - 更新相關組件的數據獲取方式

3. **SWR 最佳實踐**
   - 使用 SWR 的全局配置
   - 實現適當的緩存策略
   - 處理錯誤和加載狀態
   - 實現數據預取
   - 配置自動重新驗證

4. **注意事項**
   - 確保遷移過程中功能的穩定性
   - 添加適當的錯誤處理
   - 保持向下兼容
   - 完整測試新實現的功能
   - 注意數據一致性

### UI 組件遷移指南

1. **遷移優先順序**
   - 優先遷移簡單的展示型組件
   - 其次是表單相關組件
   - 最後是複雜的互動組件

2. **MUI 到自定義組件的遷移步驟**
   - 分析現有 MUI 組件的功能和樣式
   - 使用 Tailwind 創建對應的基礎樣式
   - 實現必要的互動邏輯
   - 確保組件的可訪問性
   - 添加響應式設計
   - 更新組件文檔

3. **Tailwind 最佳實踐**
   - 使用 Tailwind 的組件類抽象
   - 利用 @apply 指令組織複雜樣式
   - 遵循移動優先的響應式設計
   - 使用主題配置確保一致性
   - 優化可重用的樣式模式

4. **注意事項**
   - 確保遷移過程中的 UI 一致性
   - 保持組件 API 的兼容性
   - 完整測試各種設備和瀏覽器
   - 注意性能優化
   - 維護良好的文檔

## 環境變數

本專案使用 `.env` 文件管理環境變數。請參考 `.env.sample` 文件進行配置：

```env
# API 配置
NEXT_PUBLIC_API_URL=           # API 基礎 URL
```

### 環境變數使用規範

1. **命名規範**
   - 前端可訪問的變數必須以 `NEXT_PUBLIC_` 開頭
   - 使用大寫字母和下劃線
   - 名稱應清晰表明用途

2. **安全性規範**
   - 敏感信息不要以 `NEXT_PUBLIC_` 開頭
   - 密鑰等敏感信息使用 CI/CD 環境變數
   - 本地開發使用假數據或測試帳號

3. **版本控制**
   - `.env` 文件不納入版本控制
   - 提供 `.env.sample` 作為範例
   - 在文檔中說明所有必需的環境變數

## 部署

本專案使用 Cloudflare Pages 進行部署：

```bash
yarn deploy
```
## CI/CD 流程

本專案使用 GitHub Actions 和 Cloudflare Pages 進行持續整合和部署。

### CI 流程 (GitHub Actions)

在 Pull Request 時觸發以下檢查：

```yaml
name: Continuous Integration

jobs:
  init:
    # 初始化和依賴安裝
    - 檢出代碼
    - 緩存依賴
    - 安裝依賴

  check:
    # TypeScript 類型檢查
    - 運行 yarn ts:check
    - 錯誤通知（Discord）

  lint:
    # ESLint 代碼檢查
    - 運行 yarn lint
    - 自動格式化
    - 錯誤通知（Discord）
```

### CD 流程 (Cloudflare Pages)

在推送到特定分支時觸發部署：

```yaml
name: Continuous Delivery

on:
  push:
    branches: [prod, dev]

jobs:
  continuous_integration:
    # 運行完整的 CI 檢查

  build_and_deploy:
    # 建置和部署流程
    - 建置專案
    - 部署到 Cloudflare Pages
    - 生成預覽 URL

  send_result:
    # 部署結果通知
    - 成功/失敗通知到 Discord
    - 包含預覽 URL 或錯誤信息
```

### 自動化功能

1. **代碼質量控制**
   - TypeScript 類型檢查
   - ESLint 代碼規範檢查
   - 自動代碼格式化

2. **部署流程**
   - 自動建置
   - 環境變數注入
   - Cloudflare Pages 部署
   - 預覽 URL 生成

3. **通知機制**
   - Discord 集成
   - 錯誤通知
   - 部署狀態通知
   - 預覽鏈接分享

### 分支策略

- `dev`: 開發環境分支
  - 自動部署到開發環境
  - 生成預覽 URL

- `prod`: 生產環境分支
  - 部署到正式環境
  - 部署到 www.daoedu.tw

## 授權

本專案採用 GNU Lesser General Public License v3.0 (LGPL-3.0) 授權條款 - 詳見 [LICENSE](./license) 文件

LGPL-3.0 授權要點：
- 允許將本軟體用於商業用途
- 允許修改原始碼
- 必須開放修改後的原始碼
- 必須包含原作者的版權聲明
- 修改後的軟體也必須使用 LGPL-3.0 授權
- 不提供品質保證

## 貢獻指南

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 相關資源

- [Next.js 文檔](https://nextjs.org/docs)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [React Context 文檔](https://react.dev/reference/react/useContext)
- [SWR 文檔](https://swr.vercel.app/)
- [React Hook Form 文檔](https://react-hook-form.com/)
- [Zod 文檔](https://zod.dev/)
