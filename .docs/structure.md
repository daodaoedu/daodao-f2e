# Feature-Sliced Design (FSD) 混合架構規範

原則：業務導向（business-first）、層級依賴管理、可測試性、可重用性。

## FSD 混合架構結構

```
app/                    # Next.js App Router (路由與頁面層)
  [language]/(guest)/   # 訪客頁面
  [language]/(authenticated)/ # 認證頁面
  api/                  # API 路由
widgets/                # 🧩 Widgets 層 - 大型 UI 組件集合
  layout/               # 布局相關 widgets
  landing-page/         # 首頁相關 widgets
  about/                # 關於頁面 widgets
  marathon/             # 馬拉松相關 widgets
features/               # ⚡ Features 層 - 具體業務功能
  <domain>/
    components/         # 業務組件
    hooks/              # 業務 hooks
    utils/              # 業務工具函數
    types.ts            # 業務類型定義
entities/               # 🏢 Entities 層 - 業務實體抽象
  <entity>/
    ui/                 # 純展示組件
    model/              # 數據模型
    api/                # 基礎 API
    lib/                # 實體工具函數
shared/                 # 🔧 Shared 層 - 通用工具和組件
  ui/                   # 通用 UI 組件 (shadcn/ui)
  lib/                  # 工具函數
  components/           # 共享組件
  config/               # 配置文件
  constants.ts          # 常量定義
services/               # API 服務層 (Legacy，逐步遷移)
  _shared/              # fetcher / 攔截器 / 公用錯誤處理
  <domain>/             # 以 generated 封裝出的呼叫層
generated/              # orval 產碼（勿改）
utils/                  # 通用工具（cn, date, env...）
constants/              # 常數與設定 (Legacy，逐步遷移至 shared/)
```

## 依賴關係規則

```
Next.js App Router → Widgets → Features → Entities → Shared
```

**嚴格規則**：

- ✅ 上層可以使用下層
- ❌ 下層不能使用上層
- ⚠️ 同層之間可以相互使用，但要避免循環依賴

## Segment 組織規範

每個 slice 內部按以下 segment 組織：

- **`ui/`**: React 組件和樣式
- **`api/`**: API 請求函數和數據獲取
- **`model/`**: 狀態管理和業務邏輯
- **`lib/`**: 工具函數和輔助函數
- **`config/`**: 配置文件和常量
- **`types/`**: TypeScript 類型定義
- **`index.ts`**: 統一導出接口

## 命名與邏輯切分

- 檔名：以職責命名，避免縮寫；元件使用 PascalCase，hook/useXxx。
- hooks：只做資料/狀態取得與封裝；UI 邏輯放元件。
- utils：純函式、無副作用，覆用於多領域。

## FSD 層級選擇指南

### Shared 層

適用於：

- 通用 UI 組件（Button, Input, Modal 等）
- 工具函數（date, format, validation 等）
- 全域配置和常量
- 與業務邏輯無關的代碼

### Entities 層

適用於：

- 業務實體的純展示組件
- 數據模型定義
- 基礎 CRUD 操作
- 不包含用戶操作的組件

### Features 層

適用於：

- 具體的業務功能實現
- 用戶可執行的操作
- 帶來業務價值的功能
- 包含業務邏輯和狀態管理

### Widgets 層

適用於：

- 組合多個 features 和 entities
- 大型 UI 組件集合
- 可在多個頁面重複使用的組件模組
- 自包含的功能模組

## 範例路徑

- `features/projects/hooks/useProjects.ts`：SWR 取數 + Zod 驗證。
- `features/projects/components/ProjectList.tsx`：展示與互動。
- `entities/user/ui/UserCard.tsx`：純展示用戶卡片。
- `widgets/header/ui/Header.tsx`：組合導航、用戶選單等功能。
- `shared/ui/button/Button.tsx`：通用按鈕組件。

## 遷移策略

### 階段性遷移

1. **新功能**：直接使用 FSD 架構
2. **既有功能**：按需遷移，不強制一次性重構
3. **Legacy 目錄**：保持向下兼容，逐步遷移

### 遷移優先順序

1. 通用組件 → `shared/ui/`
2. 業務實體 → `entities/`
3. 業務功能 → `features/`
4. 大型組件 → `widgets/`
