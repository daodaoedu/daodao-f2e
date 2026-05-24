# Spec: 後端需紀錄資料 (#687)

## Background

目前缺乏以下使用者行為的追蹤資料：
1. 使用者由哪個來源（Landing page、測驗、Action Maker）註冊
2. 主題實踐如何被建立（自建、複製、行動產生器）
3. 使用者是否完成 onboarding 並獲得 badge
4. 使用者花幾天完成任務

## Scope

本 spec 聚焦在 **daodao-f2e 端**所需的變更，包含：
- 傳送追蹤資料到後端 API
- 前端狀態的標記與管理

後端 API schema 擴充屬於 daodao-server 的工作，需配合本 spec 另開 server issue。

---

## 1. 使用者註冊來源追蹤

### 需求

辨識使用者從以下哪個入口完成註冊：
- `landing_page`：一般官網首頁
- `quiz`：測驗頁面點擊「看詳細說明」後進入
- `action_maker`：行動產生器完成後進入

### 實作方案

**a. sessionStorage 標記（前端）**

在使用者進入登入/註冊流程前，根據來源頁面寫入 sessionStorage：

```ts
// packages/auth/src/lib/auth-constants.ts（擴充）
export const REGISTRATION_SOURCE_KEY = "daodao_registration_source";
export type RegistrationSource = "landing_page" | "quiz" | "action_maker";
```

- Landing page → 寫入 `landing_page`（預設，若無其他標記）
- Quiz 結果頁進入 → 寫入 `quiz`（於 `packages/features/quiz/src/` 的 CTA 按鈕）
- Action Maker 結果頁進入 → 寫入 `action_maker`（於 `packages/features/action-maker/src/components/action-maker-result.tsx`）

**b. 註冊後傳送（前端）**

在 `apps/product/src/components/onboarding/onboarding-form.tsx` 的 `onSubmit` 完成後，讀取 sessionStorage 並呼叫 API：

```ts
const source = sessionStorage.getItem(REGISTRATION_SOURCE_KEY) ?? "landing_page";
await updateUserRegistrationSource(source); // PATCH /api/v1/me/registration-source
sessionStorage.removeItem(REGISTRATION_SOURCE_KEY);
```

**c. 後端 API（需 daodao-server 配合）**

```
PATCH /api/v1/me/registration-source
Body: { source: "landing_page" | "quiz" | "action_maker" }
```

Users table 新增欄位：`registration_source VARCHAR(20) DEFAULT NULL`

---

## 2. 主題實踐建立方式追蹤

### 需求

記錄每個實踐是透過哪種方式建立的：
- `self_created`：使用者自行新增
- `copied`：複製他人的實踐（`/api/v1/practices/{id}/copy`）
- `action_maker`：由行動產生器（Action Maker）產生

### 實作方案

**a. 在建立實踐時帶入 `created_from` 欄位**

前端呼叫 `POST /api/v1/practices` 時加上新欄位：

```ts
// 自建
{ ...practiceData, created_from: "self_created" }

// 複製
{ ...practiceData, created_from: "copied" }

// Action Maker 產生
{ ...practiceData, created_from: "action_maker" }
```

**b. 後端 API（需 daodao-server 配合）**

`practices` table 新增欄位：`created_from VARCHAR(20) DEFAULT 'self_created'`

---

## 3. Onboarding Badge 完成追蹤

### 需求

記錄使用者是否通過完成所有 onboarding 任務而獲得 badge。

### 實作方案

**a. badge 取得時機**

在 `apps/product/src/components/task-guide/onboarding-progress-context.tsx` 中，當所有任務狀態為完成時觸發：

```ts
const allDone = tasks.every(t => t.isDone);
if (allDone && !hasBadgeBeenAwarded) {
  await awardOnboardingBadge(); // POST /api/v1/me/onboarding-badge
}
```

**b. 後端 API（需 daodao-server 配合）**

```
POST /api/v1/me/onboarding-badge
```

Users table 新增欄位：`onboarding_badge_awarded_at TIMESTAMP DEFAULT NULL`

---

## 4. 任務完成天數追蹤

### 需求

記錄使用者從加入到完成所有 onboarding 任務花了幾天。

### 實作方案

- 後端自動計算：`days_to_complete = onboarding_badge_awarded_at - created_at`
- 不需要前端額外傳送，由後端在 `POST /api/v1/me/onboarding-badge` 被呼叫時自動記錄

---

## API 變更摘要（需 daodao-server 實作）

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/v1/me/registration-source` | PATCH | 更新使用者註冊來源 |
| `/api/v1/me/onboarding-badge` | POST | 標記 onboarding badge 完成 |
| `POST /api/v1/practices` | 擴充 body | 新增 `created_from` 欄位 |

## DB Schema 變更（需 daodao-server 實作）

```sql
ALTER TABLE users ADD COLUMN registration_source VARCHAR(20) DEFAULT NULL;
ALTER TABLE users ADD COLUMN onboarding_badge_awarded_at TIMESTAMP DEFAULT NULL;
ALTER TABLE practices ADD COLUMN created_from VARCHAR(20) DEFAULT 'self_created';
```

## daodao-f2e 涉及檔案

- `packages/auth/src/lib/auth-constants.ts` — 新增 `REGISTRATION_SOURCE_KEY`
- `packages/features/quiz/src/` — 進入登入時寫入 sessionStorage
- `packages/features/action-maker/src/components/action-maker-result.tsx` — 進入登入時寫入 sessionStorage
- `apps/product/src/components/onboarding/onboarding-form.tsx` — 提交後傳送 registration source
- `apps/product/src/components/task-guide/onboarding-progress-context.tsx` — 偵測 badge 完成並呼叫 API
- `packages/api/src/services/user.ts` — 新增 API call 函式

## 依賴關係

本 spec 的程式碼實作（needs-code）需等待 daodao-server 端 API 完成後才能進行。
建議先開 daodao-server issue 實作 DB migration 與 API endpoint，再回頭實作前端部分。
