# PR: feat/v3-app

## Why is this necessary?

這個 PR 實現了 V3 版本的核心功能整合，主要目的：

1. **建立 Mobile App 基礎架構**
   - 使用 Expo + React Native 建立跨平台行動應用程式
   - 整合 Tamagui UI 框架，確保與 Web 端設計一致性
   - 實作 Firebase Analytics 追蹤用戶行為

2. **API 整合與資料串接**
   - 將前端與後端 API 完整整合
   - 實現練習(Practice)、打卡(Check-in)、用戶(User)等核心功能的資料流

3. **完善打卡功能**
   - 重構打卡表單架構，提升可維護性
   - 新增打卡分享、OG Image 生成等功能

4. **練習管理功能**
   - 實作練習的建立、編輯、封存、刪除功能
   - 整合模板建立練習的完整流程

## How does it address?

### 1. Mobile App (apps/mobile)

- **技術選型**: Expo SDK 54 + React Native + Tamagui
- **架構設計**:
  - 使用 Expo Router 實現檔案系統路由
  - Tab-based navigation (首頁/探索/建立/個人)
  - 統一的 Provider 架構 (Auth, Analytics, CreatePractice)
- **核心功能**:
  - 登入/登出流程
  - 練習列表與詳情
  - 打卡功能與日曆視圖
  - 個人檔案管理
  - 設定頁面 (帳號、外觀、通知、封存)

### 2. API 整合 (packages/api)

- 新增 Service 層架構:
  - `auth.ts` / `auth-hooks.ts` - 認證相關
  - `practice.ts` / `practice-hooks.ts` - 練習相關
  - `user.ts` / `user-hooks.ts` - 用戶相關
  - `tag.ts` / `tag-hooks.ts` - 標籤相關
  - `og-image.ts` / `og-image-hooks.ts` - OG Image 相關
- 整合 SWR 進行資料快取與狀態管理
- 更新 OpenAPI 型別定義

### 3. 打卡功能重構 (apps/product/src/components/check-in)

- **目錄結構調整**:
  - `date-selector/` - 日期選擇器組件
  - `display/` - 打卡顯示組件 (Card, Detail, Stack)
  - `form/` - 打卡表單組件與 hooks
  - `share/` - 分享相關組件
- **新增功能**:
  - 心情選擇器
  - 標籤選擇器與 AI 提示
  - 圖片上傳與預覽
  - 打卡分享圖片生成

### 4. 練習管理功能 (apps/product)

- **建立練習**: 支援手動建立與模板建立
- **編輯練習**: `/practices/[id]/edit` 頁面
- **封存/取消封存**: 透過 Dialog 確認操作
- **刪除練習**: 透過 Dialog 確認操作
- **練習詳情**: 整合 API 資料顯示

### 5. 認證功能強化 (packages/auth)

- 新增 `AuthButton` 組件，統一登入/登出按鈕
- 重構 `LoginDialog` 與 `AuthProvider`
- 整合 Firebase Auth

### 6. 其他改進

- **CI/CD**: 更新 GitHub Actions workflows
- **Docker**: 修正 standalone 權限設定
- **Type Safety**: 修復 monorepo 中的型別錯誤
- **React 版本**: 同步 `react` 與 `react-dom` 版本至 19.2.3

## 變更檔案摘要

| 目錄 | 變更類型 | 說明 |
|------|----------|------|
| `apps/mobile/` | 新增 | 完整的 Mobile App 實作 |
| `apps/product/src/components/check-in/` | 重構 | 打卡功能組件 |
| `apps/product/src/app/[locale]/practices/` | 新增/修改 | 練習相關頁面 |
| `packages/api/src/services/` | 新增 | API Service 層 |
| `packages/auth/` | 修改 | 認證功能強化 |
| `pnpm-workspace.yaml` | 修改 | React 版本同步 |

## 測試清單

- [ ] Mobile App 可正常啟動 (`pnpm dev:mobile`)
- [ ] Web App 可正常建置 (`pnpm build`)
- [ ] 登入/登出流程正常
- [ ] 練習 CRUD 功能正常
- [ ] 打卡功能正常
- [ ] 打卡分享功能正常
