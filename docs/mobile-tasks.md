# DaoDao Mobile App 任務清單

> 來源：`docs/mobile.md`
> 建立日期：2026-01-30
> 總時程：18 週

---

## 任務狀態說明

- [ ] 待開始
- [x] 已完成
- 🚧 進行中

---

## Phase 0: 環境建置 (Week 1-2)

### Monorepo 設定

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 0.1 | 建立 `apps/mobile` 目錄結構 | P0 | Claude | [x] |
| 0.2 | 初始化 Expo 專案 (`npx create-expo-app`) | P0 | Claude | [x] |
| 0.3 | 配置 `pnpm-workspace.yaml` 支援 mobile | P0 | Claude | [x] |
| 0.4 | 設定 `apps/mobile/tsconfig.json` 路徑映射 | P0 | Claude | [x] |
| 0.5 | 配置 Metro bundler 支援 monorepo | P0 | Claude | [x] |

### Design Tokens 設定

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 0.6 | 建立 `packages/design-tokens/` 套件 | P0 | Claude | [x] |
| 0.7 | 從 `globals.css` 提取色彩定義到 `colors.ts` | P0 | Claude | [x] |
| 0.8 | 建立 `spacing.ts` 間距系統 | P0 | Claude | [x] |
| 0.9 | 建立 `typography.ts` 字體系統 | P0 | Claude | [x] |
| 0.10 | 建立 `radius.ts` 圓角系統 | P0 | Claude | [x] |
| 0.11 | 撰寫 `scripts/generate-mobile.ts` 轉換腳本 | P0 | Claude | [x] |
| 0.12 | 設定 `generated/design-tokens/` 自動生成目錄 | P0 | Claude | [x] |

### Tamagui 配置

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 0.13 | 安裝 Tamagui 相關套件 | P0 | Claude | [x] |
| 0.14 | 建立 `tamagui.config.ts` 主配置 | P0 | Claude | [x] |
| 0.15 | 配置字體 (Inter) 與 face 映射 | P0 | Claude | [x] |
| 0.16 | 設定 Light/Dark 主題 | P0 | Claude | [x] |
| 0.17 | 配置 `babel.config.js` | P0 | Claude | [x] |
| 0.18 | 配置 `metro.config.js` | P0 | Claude | [x] |

### Expo Router 設定

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 0.19 | 安裝 Expo Router | P0 | Claude | [x] |
| 0.20 | 建立 `app/_layout.tsx` 根佈局 | P0 | Claude | [x] |
| 0.21 | 建立 `app/index.tsx` 入口重導向 | P0 | Claude | [x] |
| 0.22 | 配置 `app.config.ts` | P0 | Claude | [x] |
| 0.23 | 設定 typed routes | P0 | Claude | [x] |

### CI/CD 基礎建置

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 0.24 | 設定 EAS Build 配置 (`eas.json`) | P1 | Claude | [x] |
| 0.25 | 設定 GitHub Actions 自動化測試 | P1 | Claude | [x] |
| 0.26 | 設定 tokens 自動生成 workflow | P1 | Claude | [x] |

---

## Phase 1: MVP 核心功能 (Week 3-7)

### Week 3: 認證流程

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 1.1 | 建立 `app/(auth)/_layout.tsx` 認證佈局 | P0 | Claude | [x] |
| 1.2 | 建立登入頁面 `app/(auth)/login.tsx` | P0 | Claude | [x] |
| 1.3 | ~~建立註冊頁面~~ (僅社群登入，不需要) | P0 | - | N/A |
| 1.4 | 實作 Google OAuth 整合 | P0 | Claude | [x] |
| 1.5 | 實作 Apple Sign In 整合 | P0 | Claude | [x] |
| 1.6 | 建立 `services/auth-storage.ts` Token 管理 | P0 | Claude | [x] |
| 1.7 | 實作 SecureStore Token 儲存/讀取 | P0 | Claude | [x] |
| 1.8 | 實作 401 自動刷新 Token 機制 | P0 | Claude | [x] |
| 1.9 | 建立 OAuth callback 頁面 | P0 | Claude | [x] |
| 1.10 | ~~建立忘記密碼頁面~~ (僅社群登入，不需要) | P1 | - | N/A |

### Week 4: 首頁 Dashboard

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 1.11 | 建立 `app/(tabs)/_layout.tsx` Tab 導航佈局 | P0 | Claude | [x] |
| 1.12 | 建立首頁 `app/(tabs)/index.tsx` | P0 | Claude | [x] |
| 1.13 | 實作 `usePractices` hook (SWR) | P0 | Claude | [x] |
| 1.14 | 建立 `PracticeCard` 實踐卡片元件 | P0 | Claude | [x] |
| 1.15 | 建立進行中/已完成實踐列表 | P0 | Claude | [x] |
| 1.16 | 建立 `StatCard` 統計卡片元件 | P0 | Claude | [x] |
| 1.17 | 實作今日打卡進度顯示 | P0 | Claude | [x] |
| 1.18 | 建立探索頁面 `app/(tabs)/explore.tsx` (空殼) | P1 | Claude | [x] |
| 1.19 | 建立快速建立入口 `app/(tabs)/create.tsx` | P1 | Claude | [x] |

### Week 5: 打卡功能

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 1.20 | 建立打卡頁面（整合至詳情頁的 CheckInSheet） | P0 | Claude | [x] |
| 1.21 | 建立 `CheckInSheet` 打卡 Bottom Sheet | P0 | Claude | [x] |
| 1.22 | 實作 `useCheckIn` mutation hook | P0 | Claude | [x] |
| 1.23 | 實作一鍵打卡功能 | P0 | Claude | [x] |
| 1.24 | 實作打卡心得輸入 | P0 | Claude | [x] |
| 1.25 | 建立打卡成功動畫/反饋 | P0 | Claude | [x] |
| 1.26 | 實作打卡紀錄列表 | P0 | Claude | [x] |
| 1.27 | 建立 `ProgressRing` 進度圓環元件 | P0 | Claude | [x] |

### Week 6: 實踐詳情

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 1.28 | 建立實踐詳情頁 `app/practices/[id]/index.tsx` | P0 | Claude | [x] |
| 1.29 | 實作 `usePractice(id)` hook | P0 | Claude | [x] |
| 1.30 | 建立日曆視圖 `app/practices/[id]/calendar.tsx` | P0 | Claude | [x] |
| 1.31 | 建立 `CheckInCalendar` 日曆元件 | P0 | Claude | [x] |
| 1.32 | 整合 `react-native-calendars` | P0 | Claude | [x] |
| 1.33 | 實作連續打卡天數統計 | P0 | Claude | [x] |
| 1.34 | 實作完成率統計圖表 | P0 | Claude | [x] |
| 1.35 | 建立編輯頁面 `app/practices/[id]/edit.tsx` | P1 | Claude | [x] |

### Week 7: 個人檔案 + QA

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 1.36 | 建立個人檔案頁 `app/(tabs)/profile.tsx` | P0 | Claude | [x] |
| 1.37 | 實作 `useCurrentUser` hook | P0 | Claude | [x] |
| 1.38 | 建立 `Avatar` 頭像元件 | P0 | Claude | [x] |
| 1.39 | 建立 `IslandCard` 島嶼卡片元件 | P0 | Claude | [x] |
| 1.40 | 實作學習島嶼展示 | P0 | Claude | [x] |
| 1.41 | 實作社群連結展示 | P1 | Claude | [x] |
| 1.42 | 執行整體 QA 測試 | P0 | | [ ] |
| 1.43 | 修復 Bug | P0 | | [ ] |
| 1.44 | 建立 TestFlight / Internal Testing 版本 | P0 | | [ ] |

---

## Phase 2: 完整功能 (Week 8-12)

### Week 8-9: 建立實踐

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 2.1 | 建立模板選擇頁 `app/practices/create/index.tsx` | P1 | Claude | [x] |
| 2.2 | 建立模板預覽頁 `app/practices/create/[templateId].tsx` | P1 | Claude | [x] |
| 2.3 | 建立多步驟表單佈局 `app/practices/create/manual/_layout.tsx` | P1 | Claude | [x] |
| 2.4 | 建立 Step 1: 標題與描述 | P1 | Claude | [x] |
| 2.5 | 建立 Step 2: 頻率與時長 | P1 | Claude | [x] |
| 2.6 | 建立 Step 3: 執行時機 | P1 | Claude | [x] |
| 2.7 | 建立 Step 4: 標籤與資源 | P1 | Claude | [x] |
| 2.8 | 建立 Step 5: 確認送出 | P1 | Claude | [x] |
| 2.9 | 共用 Zod schemas（建立 `types/create-practice.ts`） | P1 | Claude | [x] |
| 2.10 | 整合 React Hook Form | P1 | Claude | [x] |
| 2.11 | 建立標籤選擇器（整合於 Step 4） | P1 | Claude | [x] |
| 2.12 | 實作表單驗證與錯誤提示 | P1 | Claude | [x] |

### Week 10: 性格測驗

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 2.13 | 建立 Quiz 入口 `app/quiz/index.tsx` | P1 | Claude | [x] |
| 2.14 | 建立 Quiz 開始頁 `app/quiz/[quizId]/index.tsx` | P1 | Claude | [x] |
| 2.15 | 建立題目頁 `app/quiz/[quizId]/questions.tsx` | P1 | Claude | [x] |
| 2.16 | 建立結果頁 `app/quiz/[quizId]/result.tsx` | P1 | Claude | [x] |
| 2.17 | 整合 Quiz 邏輯（建立 `types/quiz.ts` mock data） | P1 | Claude | [x] |
| 2.18 | 實作題目進度指示 | P1 | Claude | [x] |
| 2.19 | 實作島嶼結果動畫 | P1 | Claude | [x] |

### Week 11: 推播通知

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 2.20 | 安裝 `expo-notifications` | P1 | Claude | [x] |
| 2.21 | 建立 `services/notifications.ts` | P1 | Claude | [x] |
| 2.22 | 實作通知權限請求流程 | P1 | Claude | [x] |
| 2.23 | 實作每日打卡提醒排程 | P1 | Claude | [x] |
| 2.24 | 實作成就通知 | P1 | Claude | [x] |
| 2.25 | 設定 Android Notification Channel | P1 | Claude | [x] |
| 2.26 | 實作通知點擊導航 | P1 | Claude | [x] |

### Week 12: 設定 + 上架

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 2.27 | 建立設定主頁 `app/settings/index.tsx` | P2 | Claude | [x] |
| 2.28 | 建立帳號設定 `app/settings/account.tsx` | P2 | Claude | [x] |
| 2.29 | 建立通知設定 `app/settings/notifications.tsx` | P2 | Claude | [x] |
| 2.30 | 建立外觀設定 `app/settings/appearance.tsx` | P2 | Claude | [x] |
| 2.31 | 建立已封存實踐 `app/settings/archived.tsx` | P2 | Claude | [x] |
| 2.32 | 實作深色模式切換 | P2 | Claude | [x] |
| 2.33 | 實作登出功能 | P2 | Claude | [x] |
| 2.34 | 準備 App Store 送審素材 | P1 | | [ ] |
| 2.35 | 準備 Play Store 送審素材 | P1 | | [ ] |
| 2.36 | 執行正式版 QA | P0 | | [ ] |
| 2.37 | 送審 App Store | P0 | | [ ] |
| 2.38 | 送審 Play Store | P0 | | [ ] |

---

## Phase 3: 進階功能 (Week 13-18)

### Week 13-14: 社群功能

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 3.1 | 建立探索/社群頁面內容 | P2 | | [ ] |
| 3.2 | 實作瀏覽他人實踐 | P2 | | [ ] |
| 3.3 | 建立他人檔案頁 `app/users/[id].tsx` | P2 | | [ ] |
| 3.4 | 實作追蹤/取消追蹤功能 | P2 | | [ ] |

### Week 15: 數據分析

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 3.5 | 建立學習報告頁面 | P3 | | [ ] |
| 3.6 | 實作趨勢圖表 | P3 | | [ ] |
| 3.7 | 整合 `victory-native` 或 `react-native-chart-kit` | P3 | | [ ] |

### Week 16: 成就系統

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 3.8 | 建立成就/徽章頁面 | P3 | | [ ] |
| 3.9 | 實作連續天數獎勵 | P3 | | [ ] |
| 3.10 | 實作成就解鎖通知 | P3 | | [ ] |

### Week 17: Widget

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 3.11 | 研究 `expo-widgets` 或原生模組 | P3 | | [ ] |
| 3.12 | 實作 iOS Widget (今日待打卡) | P3 | | [ ] |
| 3.13 | 實作 Android Widget | P3 | | [ ] |
| 3.14 | 實作快速打卡按鈕 | P3 | | [ ] |

### Week 18: 離線模式 + 優化

| # | 任務 | 優先級 | 負責人 | 狀態 |
|---|------|--------|--------|------|
| 3.15 | 建立 `services/offline-checkin.ts` | P3 | | [ ] |
| 3.16 | 實作離線打卡資料儲存 | P3 | | [ ] |
| 3.17 | 實作網路恢復後自動同步 | P3 | | [ ] |
| 3.18 | 建立 `SyncStatusBanner` 同步狀態元件 | P3 | | [ ] |
| 3.19 | 整合 `@react-native-community/netinfo` | P3 | | [ ] |
| 3.20 | 效能優化與最終測試 | P3 | | [ ] |

---

## 里程碑

| 里程碑 | 週數 | 交付物 | 狀態 |
|--------|------|--------|------|
| M1: 環境就緒 | Week 2 | 可執行的空專案 + CI | [x] |
| M2: Alpha | Week 7 | 內部測試版 (TestFlight) | [ ] |
| M3: Beta | Week 12 | 公開測試版 | [ ] |
| M4: Launch | Week 12 | App Store / Play Store 上架 | [ ] |
| M5: v1.1 | Week 18 | 進階功能更新 | [ ] |

---

## 技術債與注意事項

| # | 項目 | 說明 | 優先級 |
|---|------|------|--------|
| T1 | 型別安全 | 確保 API client 型別與後端一致 | P1 |
| T2 | 錯誤處理 | 統一 API 錯誤處理與 Toast 提示 | P1 |
| T3 | 無障礙 | 確保元件支援 accessibility | P2 |
| T4 | 國際化 | 預留多語系架構 | P3 |
| T5 | 測試覆蓋 | 核心功能單元測試 | P2 |

---

## 附註

- 所有 `generated/` 目錄下的檔案由腳本自動生成，請勿手動修改
- Design tokens 修改請在 `packages/design-tokens/src/` 進行，然後執行 `pnpm run generate:mobile`
- 詳細技術規格請參考 `docs/mobile.md`
