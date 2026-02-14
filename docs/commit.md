# Admin Dashboard & RBAC 支援

## Why is this necessary?

- 管理後台頁面（實踐列表、使用者列表）的 API 調用使用了錯誤的相對路徑和欄位映射，導致 404 錯誤和顯示為空/Unknown
- Admin 頁面（Dashboard、使用者管理、角色管理、Email 管理、系統監控、使用者詳情）尚未建立
- `admin.ts`、`email.ts`、`email-hooks.ts` 等 API 服務檔案未被 commit 至版控，導致 CI 編譯失敗（TS2307 找不到模組、TS2345 路徑不符合型別）
- `types.ts` 的 OpenAPI 型別定義缺少 admin API 路徑，CI 無法通過型別檢查
- AuthProvider 缺少角色（roles）與權限（permissions）支援，無法實現 RBAC（角色存取控制）
- Admin Dashboard 缺少統計卡片元件和 recharts 圖表依賴

---

## How does it address?

### 1. 修正實踐列表與熱門排行的 API 調用和欄位映射

**功能說明：** 修正 admin 實踐列表和熱門排行頁面的 API 調用路徑和欄位名稱映射。

- 實踐列表改用 `useAdminPractices` hook 取代直接 fetch 相對路徑（修正 404）
- 修正欄位名：`creatorName` → `user.name`、`totalDays` → `durationDays`、`likeCount` → `stats.likeCount`
- 修正 status 預設值，明確傳送 `"all"` 避免後端預設為 active
- 熱門排行修正欄位名：`name` → `nickname`、`total` → `totalCount`
- 修正 admin-sidebar biome-ignore 註解類別名稱

**變更位置：**
- `apps/product/src/app/[locale]/admin/practices/page.tsx` — 實踐列表頁面
- `apps/product/src/app/[locale]/admin/users/page.tsx` — 使用者列表頁面
- `apps/product/src/components/admin/admin-sidebar.tsx` — 側邊欄元件
- `packages/api/src/services/admin-hooks.ts` — Admin API hooks

### 2. 修正 Admin 頁面欄位映射與 lint 錯誤

**功能說明：** 修正 admin 頁面中裝置分析、用戶分群等 tab 的後端欄位映射問題，並修正所有 lint 錯誤。

- Device tab：映射後端欄位（`deviceType`、`browser`、`operatingSystems`）到前端格式，修正全部顯示為 Unknown 的問題
- Segmentation tab：使用後端欄位（`label`、`userCount`）取代（`key`、`count`），修正用戶數量缺失
- 增大圓餅圖半徑和高度，防止標籤被裁切
- 修正所有 lint 錯誤：未使用的 import/變數、缺少 label 的控制項、陣列 index key、非空斷言、靜態元素互動等

**新增檔案：**
- `apps/product/src/app/[locale]/admin/email/page.tsx` — Email 管理頁面
- `apps/product/src/app/[locale]/admin/layout.tsx` — Admin layout（含側邊欄）
- `apps/product/src/app/[locale]/admin/page.tsx` — Admin Dashboard 主頁
- `apps/product/src/app/[locale]/admin/roles/page.tsx` — 角色與權限管理頁面
- `apps/product/src/app/[locale]/admin/system/page.tsx` — 系統監控頁面
- `apps/product/src/app/[locale]/admin/users/[userId]/page.tsx` — 使用者詳情頁面

### 3. 補齊 Admin 與 Email API 服務和 OpenAPI 型別

**功能說明：** 將遺漏的 API 服務檔案加入版控，並更新 OpenAPI 型別定義，修正 CI 編譯失敗。

- 新增 `admin.ts`：Admin API 服務函式（使用者統計、使用者管理、角色權限、實踐統計、系統監控、匯出等）
- 新增 `email.ts`：Email API 服務函式
- 新增 `email-hooks.ts`：Email React Hooks
- 更新 `index.ts`：匯出 admin 和 email 模組
- 更新 `types.ts`：新增所有 admin API 路徑的 OpenAPI 型別定義

**新增檔案：**
- `packages/api/src/services/admin.ts` — Admin API 服務（371 行）
- `packages/api/src/services/email.ts` — Email API 服務（129 行）
- `packages/api/src/services/email-hooks.ts` — Email React Hooks（47 行）

**變更位置：**
- `packages/api/src/services/index.ts` — 新增 admin、email 導出
- `packages/api/src/types.ts` — 新增 admin API 路徑型別定義

### 4. AuthProvider 新增 RBAC 支援與 Admin StatCard 元件

**功能說明：** 在認證上下文中加入角色與權限機制，並新增 admin dashboard 統計卡片元件。

- `AuthProvider` 新增 `roles`、`permissions` state
- 新增 `hasRole(role)`、`hasPermission(permission)` 函式和 `isAdmin` 計算屬性
- 從後端 `userData.roles` / `userData.permissions` 載入角色權限資料
- `StoredUser` 和 `AuthContextValue` 型別擴充 roles/permissions 欄位
- 新增 `StatCard` 元件：顯示標題、數值、變化百分比（含箭頭圖示）
- 新增 `recharts` 依賴用於 admin dashboard 圖表

**新增檔案：**
- `apps/product/src/components/admin/stat-card.tsx` — 統計卡片元件

**變更位置：**
- `packages/auth/src/lib/auth-provider.tsx` — 新增 RBAC 邏輯
- `packages/auth/src/types.ts` — 擴充型別定義
- `apps/product/package.json` — 新增 recharts 依賴
- `pnpm-lock.yaml` — lockfile 更新

---

## 檔案變更摘要

### Commit 1: `3e621548` — fix(admin): 修正實踐列表與熱門排行的 API 調用和欄位映射

```
4 files changed, 1504 insertions(+)
```

### Commit 2: `7c449a07` — fix: correct field name mismatches and lint errors in admin pages

```
6 files changed, 1545 insertions(+)
```

### Commit 3: `dddf3251` — feat(api): add admin and email services with updated OpenAPI types

```
5 files changed, 8334 insertions(+), 6091 deletions(-)
```

### Commit 4: `f2a6ba59` — feat(auth, admin): add RBAC support and admin stat-card component

```
5 files changed, 120 insertions(+), 1 deletion(-)
```

### 新增 (13)

| 檔案 | 說明 |
|------|------|
| `apps/product/src/app/[locale]/admin/email/page.tsx` | Email 管理頁面 |
| `apps/product/src/app/[locale]/admin/layout.tsx` | Admin layout（含側邊欄） |
| `apps/product/src/app/[locale]/admin/page.tsx` | Admin Dashboard 主頁 |
| `apps/product/src/app/[locale]/admin/roles/page.tsx` | 角色與權限管理頁面 |
| `apps/product/src/app/[locale]/admin/system/page.tsx` | 系統監控頁面 |
| `apps/product/src/app/[locale]/admin/users/[userId]/page.tsx` | 使用者詳情頁面 |
| `apps/product/src/app/[locale]/admin/practices/page.tsx` | 實踐列表管理頁面 |
| `apps/product/src/app/[locale]/admin/users/page.tsx` | 使用者列表管理頁面 |
| `apps/product/src/components/admin/admin-sidebar.tsx` | Admin 側邊欄元件 |
| `apps/product/src/components/admin/stat-card.tsx` | 統計卡片元件 |
| `packages/api/src/services/admin.ts` | Admin API 服務函式 |
| `packages/api/src/services/email.ts` | Email API 服務函式 |
| `packages/api/src/services/email-hooks.ts` | Email React Hooks |

### 修改 (7)

| 檔案 | 說明 |
|------|------|
| `packages/api/src/services/admin-hooks.ts` | Admin React Hooks |
| `packages/api/src/services/index.ts` | 新增 admin、email 模組導出 |
| `packages/api/src/types.ts` | 新增 admin API OpenAPI 型別定義 |
| `packages/auth/src/lib/auth-provider.tsx` | 新增 RBAC（roles、permissions、hasRole、hasPermission、isAdmin） |
| `packages/auth/src/types.ts` | StoredUser 和 AuthContextValue 擴充 roles/permissions |
| `apps/product/package.json` | 新增 recharts 依賴 |
| `pnpm-lock.yaml` | lockfile 更新 |

---

## Commits

### 3e62154813a0116390f656abf85050d7898a6ae1

```
fix(admin): 修正實踐列表與熱門排行的 API 調用和欄位映射

- 實踐列表：改用 useAdminPractices hook 取代直接 fetch 相對路徑（修正 404）
- 實踐列表：修正欄位名（creatorName→user.name, totalDays→durationDays, likeCount→stats.likeCount）
- 實踐列表：修正 status 預設值，明確傳送 "all" 避免後端預設為 active
- 熱門排行：修正欄位名（name→nickname, total→totalCount）
- 修正 admin-sidebar biome-ignore 註解類別名稱

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 7c449a071b515cae5bc837d2c50743b93d17ca93

```
fix: correct field name mismatches and lint errors in admin pages

- Device tab: map backend fields (deviceType, browser, operatingSystems)
  to frontend format, fixing all-Unknown display
- Segmentation tab: use backend fields (label, userCount) instead of
  (key, count), fixing missing user counts
- Increase pie chart radius/height to prevent label clipping
- Fix all lint errors across admin pages: unused imports/variables,
  labels without controls, array index keys, non-null assertions,
  static element interactions

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### dddf32516261c5f31e3e820379950fcdcd2ce3ba

```
feat(api): add admin and email services with updated OpenAPI types

Add missing admin.ts, email.ts, email-hooks.ts service files and
update types.ts with admin API path definitions. These files were
referenced by the already-committed admin-hooks.ts but were not
included in the repository, causing CI build failures.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### f2a6ba5993f7e6b0ddf6657fcb61dde36821dbfe

```
feat(auth, admin): add RBAC support and admin stat-card component

Add roles, permissions, hasRole, hasPermission, and isAdmin to
AuthProvider for role-based access control. Add StatCard component
and recharts dependency for admin dashboard.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

---

# Practice Summary Page & Expired Practice UX

## Why is this necessary?

- 實踐到期後，用戶無法回顧完成的旅程，缺少總結和回顧機制
- 到期的實踐仍然顯示「打卡」按鈕，但用戶已無法打卡，造成操作上的混淆
- 公開的實踐頁面沒有顯示建立者資訊，其他用戶無法了解實踐的來源
- Dashboard 篩選標籤位於 InProgressSection 內，無法篩選「已完成」任務
- 打卡日期按鈕只有「有/無打卡」的二元顯示，無法反映同一天多次打卡的情況
- 打卡紀錄頁面的 mobile 版標題列和日期選擇器分離，滾動時行為不一致
- 進度條文字顯示使用 clampedValue，但用戶應看到實際百分比（超過 100% 也要顯示）
- 已完成的任務卡片不可直接點擊，需要額外點擊箭頭按鈕

---

## How does it address?

### 1. 實踐完成總結頁面 (Practice Summary Page)

**功能說明：** 新增實踐完成後的總結頁面，包含可分享的視覺摘要卡片。

- 建立 `/practices/[id]/summary` 頁面路由，僅實踐擁有者且實踐已到期時可訪問
- 組合實踐詳情、打卡記錄和隨機鼓勵句生成摘要資料 (`PracticeSummary`)
- 摘要卡片 (`PracticeSummaryCard`) 以 9:16 比例呈現，包含：用戶名稱、實踐期間、打卡次數（成長足跡）、心情統計（最多 2 個最常出現的心情）、打卡筆記泡泡（最多 3 則文字最長的筆記）
- 摘要頁面 (`PracticeSummaryPage`) 包含慶祝動畫（撒花效果）、摘要圖片預覽、社群分享（LINE、Threads、Facebook、X、LinkedIn）和下載功能
- 圖片生成 Hook (`usePracticeSummaryImage`) 處理元素截圖、超時控制和下載邏輯

**新增檔案：**
- `apps/product/src/app/[locale]/practices/[id]/summary/page.tsx`
- `apps/product/src/components/practice/summary/practice-summary-card.tsx`
- `apps/product/src/components/practice/summary/practice-summary-page.tsx`
- `apps/product/src/components/practice/summary/hooks/use-practice-summary-image.tsx`
- `apps/product/src/components/practice/summary/hooks/index.ts`
- `apps/product/src/components/practice/summary/index.ts`

**變更位置：**
- `packages/api/src/services/practice.ts` — 新增 `PracticeSummary`、`MoodType`、`MoodStat` 類型定義和 `getPracticeSummary` 函式
- `packages/api/src/services/practice-hooks.ts` — 新增 `usePracticeSummary` Hook（基於 SWR）
- `apps/product/src/components/practice/index.ts` — 導出 summary 模組

### 2. 到期實踐顯示「觀看總結」按鈕

**功能說明：** 當實踐已到期（endDate 已過或狀態為 completed），打卡按鈕自動切換為「觀看總結」按鈕，點擊後導向總結頁面。

- 新增 `viewSummary` 打卡狀態常量
- `useCheckInStatus` Hook 增加 `endDate` 參數，判斷是否已到期
- 區分 `canCheckIn`（可打卡）和 `canClick`（可點擊，包含觀看總結）
- `CheckInButton` 元件根據狀態顯示不同圖示（`Eye` vs `CalendarCheck`）和行為（導向總結 vs 打開打卡表單）
- `endDate` prop 從 Dashboard 任務卡片、打卡詳情頁一路傳遞到 `CheckInButton`

**變更位置：**
- `apps/product/src/constants/check-in-status.ts` — 新增 `viewSummary` 狀態
- `apps/product/src/components/check-in/form/hooks/use-check-in-status.ts` — 到期判斷邏輯
- `apps/product/src/components/check-in/form/check-in-sheet.tsx` — `CheckInButton` 支援觀看總結導向
- `apps/product/src/components/check-in/types.ts` — `ICheckInStatusOptions` 新增 `endDate`
- `apps/product/src/app/[locale]/practices/[id]/page.tsx` — 傳遞 `endDate` 和建立者資訊
- `apps/product/src/components/dashboard/in-progress-task-card.tsx` — 傳遞 `endDate`
- `apps/product/src/components/dashboard/in-progress-section.tsx` — 新增 `endDate` 到任務類型

### 3. 公開實踐頁面顯示建立者資訊

**功能說明：** 非擁有者瀏覽實踐詳情時，卡片上方顯示建立者的頭像、名稱和建立日期。

- `PracticeOverviewCard` 新增 `creator` prop，包含 `id`、`name`、`photoURL`、`date`
- 使用 `Avatar` 元件顯示頭像，並連結到建立者的個人頁面
- 進度圈位置調整為右上角（`absolute right-0 top-0`）

**變更位置：**
- `apps/product/src/components/practice/shared/practice-overview-card.tsx`
- `apps/product/src/app/[locale]/practices/[id]/page.tsx`

### 4. Dashboard 篩選標籤提升至頂層

**功能說明：** 將篩選標籤從 `InProgressSection` 提升到 Dashboard 頁面頂層，新增「已完成」篩選選項。

- `FilterStatus` 常量新增 `completed` 選項
- 篩選邏輯移至 `page.tsx`，可同時控制「進行中」和「已完成」區塊的顯示
- `InProgressSection` 簡化，只負責列表呈現，不再包含篩選邏輯

**變更位置：**
- `apps/product/src/constants/task-status.tsx` — 新增 `completed` 篩選狀態
- `apps/product/src/app/[locale]/(with-layout)/page.tsx` — 篩選邏輯上移、傳遞 `endDate`
- `apps/product/src/components/dashboard/in-progress-section.tsx` — 移除內部篩選
- `apps/product/src/components/dashboard/index.ts` — 移除 `FilterStatus` 導出

### 5. 打卡日期按鈕顏色深淺反映打卡次數

**功能說明：** 日期按鈕的橘色填充透明度根據當日打卡次數變化（1 次 = 10%、2 次 = 20%、…、10 次以上 = 100%）。

- `ICheckInDate` 新增 `checkInCount` 欄位
- `getCheckInOpacity()` 函式計算透明度
- 選中狀態改為橘色邊框（`ring`）而非橘色背景
- Product 版使用 CSS `linear-gradient` 實現填充效果
- Mobile 版使用 `fillOverlay` 絕對定位層實現

**變更位置：**
- `apps/product/src/components/check-in/date-selector/check-in-date-button.tsx`
- `apps/mobile/components/check-in/date-selector/check-in-date-button.tsx`
- `apps/product/src/components/check-in/types.ts`
- `apps/mobile/components/check-in/types.ts`
- `apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx` — 建立日期到打卡次數的映射

### 6. 打卡紀錄 Mobile 標題列整合

**功能說明：** Mobile 版本的標題列整合到日期選擇器中，共用顯示/隱藏動畫，並新增關閉按鈕。

- `ICheckInDateSelectorProps` 新增 `title` 和 `closeActionTo` props
- `MobileCheckInDateSelector` 整合標題和關閉按鈕（X 圖示）
- Desktop 版本保留獨立的 `PageHeader`
- 使用 `useSafeRouter` 替代 `useRouter`

**變更位置：**
- `apps/product/src/components/check-in/date-selector/mobile.tsx`
- `apps/product/src/components/check-in/date-selector/types.ts`
- `apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx`

### 7. 進度條文字顯示實際值

**功能說明：** 進度條文字和 aria-label 顯示實際百分比（`value`）而非限制後的值（`clampedValue`）。視覺上仍然 clamp 到 0-100%，但文字不再截斷。

**變更位置：**
- `apps/product/src/components/practice/shared/circular-progress.tsx`
- `apps/mobile/components/practice/shared/circular-progress.tsx`

### 8. 已完成任務卡片整體可點擊

**功能說明：** `CompletedTaskCard` 從 `<div>` 改為 `<CustomLink>` 包裹，整張卡片可點擊導向實踐詳情。移除內部的 `Button` + `CustomLink` 組合。

**變更位置：**
- `apps/product/src/components/dashboard/completed-task-card.tsx`

### 9. 其他小改進

- 打卡卡片內容新增 `wrap-break-word` 避免長文字溢出
- 打卡成功對話框的進度條動畫加入 `Math.min(percentage, 100)` 限制
- 新增 SVG 資源：`Vector-half-blue.svg`、`Vector.svg`、`ellipse.svg`、`mascot-basic.svg`、`title.svg`

---

## 檔案變更摘要

### Commit 1: `0b464e58` — feat: add practice summary page with shareable card

```
30 files changed, 1383 insertions(+), 108 deletions(-)
```

### Commit 2: `a7986e78` — feat: add view summary button for expired practices and show creator info

```
6 files changed, 135 insertions(+), 16 deletions(-)
```

### 新增 (10)

| 檔案 | 說明 |
|------|------|
| `apps/product/src/app/[locale]/practices/[id]/summary/page.tsx` | 實踐總結頁面路由 |
| `apps/product/src/components/practice/summary/practice-summary-card.tsx` | 可分享的摘要卡片元件 |
| `apps/product/src/components/practice/summary/practice-summary-page.tsx` | 總結頁面（慶祝動畫、分享、下載） |
| `apps/product/src/components/practice/summary/hooks/use-practice-summary-image.tsx` | 圖片生成與下載 Hook |
| `apps/product/src/components/practice/summary/hooks/index.ts` | Hook 導出 |
| `apps/product/src/components/practice/summary/index.ts` | Summary 模組導出 |
| `packages/assets/images/icon/Vector-half-blue.svg` | 淺藍色半圓裝飾 |
| `packages/assets/images/icon/Vector.svg` | 黃色半圓裝飾 |
| `packages/assets/images/icon/ellipse.svg` | 橢圓裝飾 |
| `packages/assets/images/icon/mascot-basic.svg` | 吉祥物基本圖示 |
| `packages/assets/images/icon/title.svg` | 標題裝飾 |

### 修改 (26)

| 檔案 | 說明 |
|------|------|
| `packages/api/src/services/practice.ts` | 新增 PracticeSummary 類型、getPracticeSummary、getRandomEncouragement |
| `packages/api/src/services/practice-hooks.ts` | 新增 usePracticeSummary Hook |
| `apps/product/src/app/[locale]/(with-layout)/page.tsx` | Dashboard 篩選上移，新增 completed 選項，傳遞 endDate |
| `apps/product/src/app/[locale]/practices/[id]/page.tsx` | 傳遞 creator 和 endDate |
| `apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx` | 日期打卡次數映射、mobile 標題列整合 |
| `apps/product/src/components/check-in/form/check-in-sheet.tsx` | CheckInButton 支援觀看總結 |
| `apps/product/src/components/check-in/form/hooks/use-check-in-status.ts` | 新增到期判斷和 viewSummary 狀態 |
| `apps/product/src/components/check-in/date-selector/check-in-date-button.tsx` | 橘色填充透明度隨打卡次數變化 |
| `apps/product/src/components/check-in/date-selector/mobile.tsx` | 整合標題列和關閉按鈕 |
| `apps/product/src/components/check-in/date-selector/types.ts` | 新增 title、closeActionTo props |
| `apps/product/src/components/check-in/display/check-in-card.tsx` | 新增 wrap-break-word |
| `apps/product/src/components/check-in/types.ts` | 新增 checkInCount、endDate |
| `apps/product/src/components/dashboard/completed-task-card.tsx` | 整張卡片改為可點擊連結 |
| `apps/product/src/components/dashboard/in-progress-section.tsx` | 移除內部篩選，新增 endDate |
| `apps/product/src/components/dashboard/in-progress-task-card.tsx` | 傳遞 endDate |
| `apps/product/src/components/dashboard/index.ts` | 移除 FilterStatus 導出 |
| `apps/product/src/components/practice/index.ts` | 導出 summary 模組 |
| `apps/product/src/components/practice/shared/practice-overview-card.tsx` | 新增 creator 顯示 |
| `apps/product/src/components/practice/shared/circular-progress.tsx` | 文字顯示實際值 |
| `apps/product/src/constants/check-in-status.ts` | 新增 viewSummary |
| `apps/product/src/constants/task-status.tsx` | 新增 completed 篩選狀態 |
| `apps/product/src/hooks/use-check-in-success-dialog.tsx` | 進度條 clamp 到 100% |
| `apps/mobile/components/check-in/date-selector/check-in-date-button.tsx` | 橘色填充透明度 |
| `apps/mobile/components/check-in/types.ts` | 新增 checkInCount |
| `apps/mobile/components/practice/shared/circular-progress.tsx` | 文字顯示實際值 |

---

## Commits

### 0b464e58a87443296e7a1725dd87ad1a6691f58f

```
feat: add practice summary page with shareable card

Add summary page for completed practices including a visual card with
mood stats, top notes, and social sharing. Refactor topTags to topNotes
to show check-in note content instead of tags.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### a7986e78389bced5bf01d346f71a4ad2f5a92689

```
feat: add view summary button for expired practices and show creator info

- Add "viewSummary" check-in status to navigate to summary page when practice is expired
- Display creator avatar, name, and date on public practice overview card
- Pass endDate prop through CheckInButton and InProgressTaskCard components

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

---

# Email 追蹤、Admin 圖表修正、打卡日期選擇器桌機版改版

## Why is this necessary?

- Email 管理頁面缺少開信追蹤功能，無法了解信件是否被開啟
- Admin 使用者分析頁面的圓餅圖和註冊趨勢圖在手機螢幕上被裁切，標籤文字重疊
- 打卡紀錄頁面的桌機版使用垂直左側日期選擇器，與手機版水平頂部佈局不一致，且桌機不支援拖曳滾動

---

## How does it address?

### 1. Email 開信追蹤功能

**功能說明：** 新增 Email 追蹤像素（1x1 GIF）支援和追蹤統計頁籤。

- 新增 `EmailTrackingTab` 元件，包含追蹤統計、篩選器和資料表格
- 更新 `IGetEmailHistoryParams.opened` 型別為 `"true" | "false"` 以符合 OpenAPI 規格
- 更新 OpenAPI 型別定義，加入追蹤端點和追蹤欄位

**變更位置：**
- `apps/product/src/app/[locale]/admin/email/page.tsx` — 新增 EmailTrackingTab
- `packages/api/src/services/email-hooks.ts` — 新增追蹤相關 hook
- `packages/api/src/services/email.ts` — 新增追蹤 API 函式
- `packages/api/src/types.ts` — 新增追蹤端點 OpenAPI 型別

### 2. 修正 Admin 圖表手機裁切問題

**功能說明：** 修正使用者分析頁面的圖表在手機上被裁切和文字重疊的問題。

- 為圖表容器加上 `min-w-0` 防止 grid 子元素溢出
- 縮小圓餅圖半徑讓 label 在窄螢幕不被裁切
- 註冊趨勢圖 X 軸標籤加斜角排列防止文字重疊

**變更位置：**
- `apps/product/src/app/[locale]/admin/users/page.tsx` — 圖表容器和圖表參數調整

### 3. 桌機版打卡日期選擇器改為水平頂部顯示

**功能說明：** 統一桌機與手機的打卡日期選擇器佈局，桌機版改為與手機相同的水平橫向頂部顯示，支援滑鼠左右拖曳滾動。

- `CheckInDateSelector` 移除桌機/手機分支判斷，統一使用水平橫向元件
- 新增滑鼠拖曳滾動功能（mousedown/mousemove/mouseup），超過 3px 才視為拖曳避免影響按鈕點擊
- 日期圓圈加上 `mx-auto` 置中顯示
- 調整桌機版上方間距（`md:pt-[120px]`）以配合 PageHeader 高度
- 調整主內容區域間距（`md:pt-[72px]`）避免被固定日期選擇器遮擋

**變更位置：**
- `apps/product/src/components/check-in/date-selector/index.tsx` — 移除桌機/手機分支
- `apps/product/src/components/check-in/date-selector/mobile.tsx` — 新增拖曳功能、置中、桌機間距
- `apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx` — 調整桌機版主內容間距

---

## 檔案變更摘要

### Commit 1: `f8fe0b0b` — feat(email): add email open tracking with tracking pixel

```
4 files changed, 380 insertions(+), 13 deletions(-)
```

### Commit 2: `2de64735` — fix(admin): 修正圖表在手機上被裁切的問題

```
1 file changed, 10 insertions(+), 10 deletions(-)
```

### Commit 3: `65eb9b9b` — fix(check-in): 桌機版日期選擇器改為與手機相同的水平頂部顯示

```
3 files changed, 52 insertions(+), 13 deletions(-)
```

### 修改 (8)

| 檔案 | 說明 |
|------|------|
| `apps/product/src/app/[locale]/admin/email/page.tsx` | 新增 EmailTrackingTab 追蹤統計頁籤 |
| `packages/api/src/services/email-hooks.ts` | 新增追蹤相關 hook |
| `packages/api/src/services/email.ts` | 新增追蹤 API 函式 |
| `packages/api/src/types.ts` | 新增追蹤端點 OpenAPI 型別定義 |
| `apps/product/src/app/[locale]/admin/users/page.tsx` | 修正圖表容器和參數避免手機裁切 |
| `apps/product/src/components/check-in/date-selector/index.tsx` | 移除桌機/手機分支，統一使用水平元件 |
| `apps/product/src/components/check-in/date-selector/mobile.tsx` | 新增滑鼠拖曳、置中、桌機間距 |
| `apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx` | 調整桌機版主內容間距 |

---

## Commits

### f8fe0b0b398a701cdb8314882a87452992a7d50c

```
feat(email): add email open tracking with tracking pixel

- Add tracking pixel (1x1 GIF) support for email open detection
- Add EmailTrackingTab in admin email page with stats, filters, and table
- Update IGetEmailHistoryParams.opened type to match OpenAPI spec ("true" | "false")
- Update OpenAPI types with tracking endpoint and tracking fields

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 2de6473560d1bff5677bbac205a9dcddc733643b

```
fix(admin): 修正圖表在手機上被裁切的問題

- 為圖表容器加上 min-w-0 防止 grid 子元素溢出
- 縮小圓餅圖半徑讓 label 在窄螢幕不被裁切
- 註冊趨勢圖 X 軸標籤加斜角排列防止文字重疊

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 65eb9b9bd0b47edeceb35b7468ed57dd1e17f909

```
fix(check-in): 桌機版日期選擇器改為與手機相同的水平頂部顯示

統一桌機與手機的打卡日期選擇器為水平橫向佈局，支援滑鼠左右拖曳滾動，
並置中顯示日期圓圈。

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```
