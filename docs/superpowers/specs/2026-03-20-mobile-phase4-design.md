# Mobile Phase 4 Design Spec

**Date:** 2026-03-20
**Scope:** Navigation 重構、Home tab 完整功能、Profile tab 真實資料、Practice CRUD 完善
**Prerequisites:** Plan 1（Auth Bridge）、Plan 2（Hooks Migration）、Plan 3（P0 新頁面）

---

## 目標

以 product app 的架構為基準，讓 mobile app 的核心功能與 web 版一致：

1. 導覽結構改為 4 個主 tab（Home / Notifications / Profile / Settings）
2. Home tab 包含「我的」與「靈感」兩個頁籤，皆接真實 API
3. Profile tab 以 `/users/[identifier]` 結構顯示個人資料（真實資料）
4. Practice CRUD（封存 / 刪除 / 恢復 / 編輯）補上真實 API 呼叫

跳過：Admin、Social feed、Resource、Footprints。

---

## 1. Navigation 重構

### 現狀
5 個 tab：Home、Create（獨立 tab）、Explore、Profile、（其他）

### 新結構
4 個主 tab：

| Tab | Icon | Route |
|---|---|---|
| Home | `Home` | `/(tabs)/index` |
| Notifications | `Bell` | `/(tabs)/notifications` |
| Profile | `User` | `/(tabs)/profile` |
| Settings | `Settings` | `/(tabs)/settings` |

### 變更說明
- **移除** `app/(tabs)/create.tsx`（Create Practice 改為 Home 頁面的 FAB 按鈕）
- **移除** `app/(tabs)/explore.tsx`（Explore 功能併入 Home「靈感」頁籤）
- **新增** `app/(tabs)/notifications.tsx`（取代 Plan 3 的 `app/notifications/index.tsx`）
- **更新** `app/(tabs)/_layout.tsx`：tab 定義改為 4 個

---

## 2. Home Tab

Home tab 內部有兩個頁籤（`我的` / `靈感`），以 segment control 切換。兩個頁籤都顯示 `AddTaskFAB`（右下角浮動按鈕，點擊後 push 到 `/practices/create`）。

### 2a. 「我的」頁籤

**資料來源：**
- `useMyPractices()` from `@daodao/api` — 實踐列表
- `useMyPracticeStats()` from `@daodao/api` — 統計數據

**Layout：**
```
DashboardHeader
├── 今日日期
├── 連續登入天數（currentStreak）
└── 總打卡次數（totalCheckIns）

InProgressSection（useMyPractices 過濾 active/draft/not_started）
└── 橫向滑動 practice cards
    └── 點擊 → push /practices/[id]
    └── 快速打卡按鈕

CompletedSection（useMyPractices 過濾 completed）
└── 垂直列表

[AddTaskFAB] 右下角浮動按鈕
```

**Pull-to-refresh：** 呼叫 `mutate` 重新 fetch。

### 2b. 「靈感」頁籤

**資料來源：**
- `useShowcaseFeed()` from `@daodao/api`（infinite scroll）

**Layout：**
```
SearchBar（keyword 輸入）

ShowcaseFeed（無限滾動）
├── BrewingCard（setup 階段的 practice）
└── PracticeShowcaseCard（公開分享的 practice）

[AddTaskFAB] 右下角浮動按鈕
```

**Infinite scroll：** 以 sentinel element（最後一個 item 的 `onLayout` 或 `IntersectionObserver` 替代方案：`FlatList` 的 `onEndReached`）觸發下一頁。

---

## 3. Profile Tab

Profile tab 使用與 `/users/[identifier]` 相同的頁面結構，但固定顯示當前登入用戶的資料（自己的小島）。他人 Profile 透過 push navigation 到 `/users/[identifier]` 使用相同元件，差別在 UI 狀態（自己 vs 他人）。

### 3a. IslandHeader

- **吉祥物**：依 quiz 結果載入對應 Lottie 動畫（D/O/A/L/C 五種）
- **若無 quiz 結果且是自己的 profile**：顯示所有吉祥物的 marquee 輪播
- **學習類型卡片**（左下角）：顯示類型名稱 + 說明文字 + 「立即測驗」或「觀看詳細說明」按鈕
- **滾動漸隱效果**：Banner opacity 從 1 漸變到 0.3，閾值 167px

### 3b. UserInfoCard

**自己的 Profile：**
- 頭像（96px）、姓名、個人 slogan、location（`useCurrentUser()`）
- 統計：Connections 數、Followers 數、近 7 天打卡次數
- Bio（Markdown 渲染）
- Social links（website、github、facebook、instagram、threads、linkedin、line、discord）
- **編輯按鈕** → push 到 `/settings/public-info`

**他人的 Profile（`/users/[identifier]`）：**
- 同上顯示資訊
- **Follow 按鈕**（toggle 追蹤狀態）
- **Connect 按鈕**（送出連結請求，最多 50 字 intent message）

### 3c. PracticeSection

- Tab bar：「主題實踐」（啟用）/ 「學習計劃」（disabled）/ 「想法」（disabled）
- 「包含已完成」toggle checkbox
- 實踐列表（`useUserPractices(userId)` from `@daodao/api`）
- 每個 practice item 點擊 → push `/practices/[id]`

---

## 4. Practice CRUD 完善

補上目前所有 `/* TODO */` 的真實 API 呼叫：

| 功能 | 位置 | Hook / Function | 完成後行為 |
|---|---|---|---|
| 封存 | `/practices/[id]/index.tsx` | `useArchivePractice(practiceId).archivePractice()` | `router.back()` |
| 刪除 | `/practices/[id]/index.tsx` | `useDeletePractice(practiceId).deletePractice()` | `router.replace('/')` |
| 恢復封存 | `/settings/archived.tsx` | `useUnarchivePractice().unarchivePractice(practiceId)` | 更新列表（mutate） |
| 刪除封存 | `/settings/archived.tsx` | `useDeletePractice(practiceId).deletePractice()` | 更新列表（mutate） |
| 編輯 | `/practices/[id]/edit.tsx`（已存在）| `updatePractice(id, data)` from `@daodao/api` | `router.back()` |

所有 mutation 前顯示 `Alert.alert` 確認對話框（現有邏輯保留）。Mutation 期間按鈕 disabled + Spinner。

---

## 5. 檔案變更清單

### 新增
- `apps/mobile/app/(tabs)/notifications.tsx` — 通知列表頁（**Plan 3 的 `app/notifications/index.tsx` 尚未建立，此 Plan 直接在 tabs 層建立**）
  - 使用 `useNotifications({ limit: 50 })` from `@daodao/api`
  - 顯示通知列表（title、body、isRead 指示點、timestamp）
  - Pull-to-refresh
  - Mark as read 於 Plan 7 補上；此 Plan 先做 read-only list

### 修改
- `apps/mobile/app/(tabs)/_layout.tsx` — tab 定義改為 4 個
- `apps/mobile/app/(tabs)/index.tsx` — 加入「我的」/「靈感」頁籤切換、接真實資料
- `apps/mobile/app/(tabs)/profile.tsx` — 接真實資料（IslandHeader + UserInfoCard + PracticeSection）
- `apps/mobile/app/practices/[id]/index.tsx` — 補上封存/刪除真實 API
- `apps/mobile/app/settings/archived.tsx` — 補上恢復/刪除真實 API
- `apps/mobile/app/practices/[id]/edit.tsx` — 接 `updatePractice`

### 刪除
- `apps/mobile/app/(tabs)/create.tsx`
- `apps/mobile/app/(tabs)/explore.tsx`

---

## 6. 資料層依賴

所有 hooks 已由 Plan 1 + Plan 2 配置完成：
- `useMyPractices()`、`useMyPracticeStats()` — 來自 `@daodao/api`
- `useShowcaseFeed()` — 來自 `@daodao/api`（需確認 export）
- `useCurrentUser()` — 來自 `@daodao/api`
- `useUserPractices(userId)` — 來自 `@daodao/api`
- `useArchivePractice`、`useDeletePractice`、`useUnarchivePractice` — 來自 `@daodao/api`

---

## 7. 不在此 Phase 範圍

- Auth Onboarding / Email 驗證（→ Plan 5）
- Settings 補全：preferences、public-info、following、connections、interaction（→ Plan 6）
- Notifications mark as read / deep linking（→ Plan 7）
- Social feed、Resource、Footprints、Admin（永久跳過）
