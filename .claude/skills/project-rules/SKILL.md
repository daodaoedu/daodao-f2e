---
name: project-rules
description: daodao-f2e 專案開發規範，涵蓋 package 使用、API 錯誤處理、命名慣例、程式碼風格
---

# daodao-f2e 專案規範

## 環境

- Node.js 20.19.4（`nvm use 20.19.4`）
- 繁體中文互動，註解用英文或繁體中文

## Package 使用規範

### 環境變數

必須用 `@daodao/config`，禁止 `process.env`。

```typescript
import { getEnv, getRequiredEnv } from "@daodao/config";
const apiUrl = getEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
```

### Storage

必須用 `@daodao/shared` 的 `getStorage`，禁止直接用 `localStorage` / `sessionStorage`。

```typescript
import { getStorage, StorageEnum } from "@daodao/shared";
const userStorage = getStorage<UserInfo>(StorageEnum.UserInfo);
```

**可用 key 的權威清單在 `packages/shared/src/lib/storage.ts` 的 `StorageEnum`**（本文件不窮舉，清單會過時——盤點時已有 11 個 key，如 `UserInfo`、`Quiz`、`ManualPracticeDraft`、`ActionMaker`、`AuthSignal` 等）。

新增 key：在 `StorageEnum` 加 key → `mapStorageKeyToStorageType` 定義 local/session 類型。

注意：`getStorage` 是 SSR-safe 且靜默失敗（SSR 或例外時回 no-op），呼叫端不可假設寫入成功。

### UI 元件

必須用 `@daodao/ui`，禁止直接用原生 HTML 元素（`<button>`、`<input>` 等），除非 `@daodao/ui` 沒有。

```typescript
import { Button } from "@daodao/ui/components/button";
```

### 共用工具

必須用 `@daodao/shared`，禁止重複實作。**匯出的權威清單在 `packages/shared/src/index.ts`**（本文件不窮舉）。寫新 hook/util 前先 grep 該檔確認是否已存在。

- Hooks 例：`useScrollLock`、`useMediaQuery`（含 `useIsMobile` 等 breakpoint 變體）、`useQueryState`、`useFormDraft`
- 工具例：`getStorage`、`captureElementAsImage`、`parseTextLinks`、`getShareAPI`

### API 呼叫

必須用 `@daodao/api`，禁止 `fetch` / `axios`。

**App 端**只 import domain 匯出與 `useMutate`（`useQuery`/`client` 沒有從 package 對外匯出）：

```typescript
import { useCurrentUser, createPractice, useMutate } from "@daodao/api";
```

**`packages/api/src/services/` 內部**才用相對路徑取 `client` 與 hooks 工廠：

```typescript
import { client } from "../client";
import { useQuery } from "../hooks";
```

已知例外（歷史債務，不可仿效）：action-maker feature 直接 `fetch` worker、recommendation/showcase hooks 直接 `fetch` ai-backend。新程式碼一律走 `@daodao/api` 的模式。

### 日期處理

必須用 `date-fns`，禁止原生 Date 方法（`toLocaleDateString()`、`setDate()` 等）。

```typescript
import { format, addDays, parse } from "date-fns";
```

## API 錯誤處理

所有 API 呼叫必須檢查 `response.error`。`openapi-fetch` 不拋異常，錯誤在 `response.error` 裡。

```typescript
const response = await createPractice(apiRequest);

if (response.error) {
  const errorMessage =
    response.error && typeof response.error === "object" && "message" in response.error
      ? String(response.error.message)
      : "操作失敗";
  toast.error(errorMessage);
  setIsSubmitting(false);
  return; // 必須 return
}

// 成功邏輯
clearDraft();
router.push("/success");
```

### 錯誤處理模式

1. 檢查 `response.error`
2. 提取錯誤訊息（優先 `response.error.message`）
3. `toast.error()` 顯示
4. 重置 loading/submitting 狀態
5. `return` 避免執行成功邏輯
6. `console.error()` 記錄

### 驗證錯誤（details 陣列）

```typescript
if ("details" in error && Array.isArray(error.details)) {
  const details = error.details as Array<{ path?: string; message?: string }>;
  details.forEach((detail) => {
    if (detail.path && detail.message) {
      form.setError(detail.path as keyof FormValues, {
        type: "server",
        message: detail.message,
      });
    }
  });
}
```

## 命名慣例

### Runtime Constants

放在 `apps/product/src/constants/`，`const object + type` 模式：

```typescript
export const TaskStatus = {
  draft: "draft",
  notStarted: "not-started",
  inProgress: "in-progress",
  completed: "completed",
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];
```

禁止直接用字串字面量表示常數值。

**現有常數以 `apps/product/src/constants/` 目錄為準**（本文件不窮舉——盤點時已有十多個，如 `MoodType`、`TaskStatus`、`PracticeStatus`、`NotificationType`、`ReactionType` 等）。新增前先 grep 該目錄避免重複。

### Type & Interface

- Types：PascalCase + `Type` 後綴（`TaskStatusType`）
- Interfaces：PascalCase + `I` 前綴（`ICheckInFormData`）
- Component Props：PascalCase + `Props` 後綴（`ButtonProps`）

## 程式碼風格

- 禁止 IIFE `(() => { ... })()`
- 禁止嵌套三元運算子（JSX 中也是）

### API Service 檔案結構

順序：Imports → Types → Query Hooks → Mutation Hooks

```typescript
"use client";

// Imports
import { client } from "../client";
import { useQuery } from "../hooks";

// Types
export type CreateRequestType = components["schemas"]["CreateRequest"];

// Query Hooks
export const useResource = (id: string) => useQuery("/api/v1/resource/{id}", { params: { path: { id } } });

// Mutation Hooks
export const createResource = async (data: CreateRequestType) => client.POST("/api/v1/resource", { body: data });
```
