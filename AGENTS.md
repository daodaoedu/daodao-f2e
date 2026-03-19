# Development Environment Configuration

## Node.js Version

- **Node.js Version**: 20.19.4
- **切換版本**：使用 `nvm use 20.19.4` 來切換到正確的 Node.js 版本

## Code Quality Checks

完成功能修改後，必須執行以下命令確保代碼品質：

- `pnpm typecheck` - 檢查 TypeScript 類型錯誤
- `pnpm check:fix` - 檢查並修復代碼品質問題（lint、format 等）

## Language Preference

- **Interaction Language**: 使用繁體中文與開發者互動
- **Code Comments**: 註解應使用英文或繁體中文

## Project Architecture & Development Guidelines

### Environment Variables

**必須使用 `@daodao/config` 來取得環境變數**

```typescript
import { getEnv, getRequiredEnv } from "@daodao/config";

const apiUrl = getEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
const apiKey = getRequiredEnv("NEXT_PUBLIC_API_KEY");
```

**禁止直接使用 `process.env`**

### Storage Operations

**必須使用 `@daodao/shared` 的 storage 來定義 localStorage 與 sessionStorage 的相關操作**

```typescript
import { getStorage, StorageEnum } from "@daodao/shared";

const userStorage = getStorage<UserInfo>(StorageEnum.UserInfo);
userStorage.set({ name: "John", email: "john@example.com" });
const userInfo = userStorage.get();
userStorage.remove();
```

**可用的 StorageEnum：**
- `StorageEnum.Quiz` - sessionStorage，用於存儲使用者做島島測試的資料
- `StorageEnum.UserInfo` - localStorage，用於存儲使用者資訊（非敏感資料）
- `StorageEnum.Whitelist` - localStorage，用於存儲外連結受信任網站列表
- `StorageEnum.OAuthNonce` - sessionStorage，用於存儲 OAuth nonce

**禁止直接使用 `localStorage` 或 `sessionStorage`**

新增 storage key 的流程：
1. 在 `packages/shared/src/lib/storage.ts` 的 `StorageEnum` 中新增 key
2. 在 `mapStorageKeyToStorageType` 中定義對應的 storage 類型
3. 添加適當的註解說明該 storage 的用途

### UI Components

**必須盡可能使用 `@daodao/ui` 提供的 UI 元件**

```typescript
import { Button } from "@daodao/ui/components/button";

<Button variant="outline" onClick={handleClick}>點擊我</Button>
```

**禁止直接使用原生 HTML 元素**（如 `<button>`, `<input>` 等），除非 `@daodao/ui` 沒有提供對應的元件。

### Shared Utilities

**必須使用 `@daodao/shared` 提供的共用方法和 Hooks**

```typescript
import { useScrollLock, useMediaQuery, formatDate } from "@daodao/shared";

const isLocked = useScrollLock(open);
const formattedDate = formatDate(date);
```

**可用的 Hooks：** `useScrollLock`, `useMediaQuery`, `useQueryState`, `useScrollVisibility`, `useAssetsLoader`

**可用的工具函數：** `formatDate`, `shareContent`, `captureElementAsImage`, `getStorage`, `StorageEnum`

**禁止重複實作** `@daodao/shared` 已經提供的功能。

### API Calls

**必須使用 `@daodao/api` 來進行 API 呼叫**

```typescript
import { useQuery, useMutate, client } from "@daodao/api";

const { data, error, isLoading } = useQuery("GET", "/api/users/{id}", {
  params: { path: { id: "123" } },
});

const response = await client.GET("/api/users/{id}", {
  params: { path: { id: "123" } },
});
```

**可用的 API Hooks：** `useQuery`, `useMutate`, `useInfinite`, `useImmutable`

**禁止直接使用 `fetch` 或 `axios`**

#### API 錯誤處理

**所有 API 呼叫都必須檢查 `response.error`，避免在錯誤情況下繼續執行後續邏輯**

使用 `@daodao/api` 的 `client` 或 API 函數時，返回的 response 物件可能包含 `error` 屬性。必須先檢查錯誤，只有在沒有錯誤時才執行成功邏輯（如導航、清除資料等）。

```typescript
import { createPractice } from "@daodao/api";
import { toast } from "@daodao/ui/components/sonner";

const response = await createPractice(apiRequest);

// ✅ 正確：先檢查錯誤
if (response.error) {
  const errorMessage =
    response.error && typeof response.error === "object" && "message" in response.error
      ? String(response.error.message)
      : "操作失敗";
  console.error("Failed to create practice:", errorMessage);
  toast.error(errorMessage);
  setIsSubmitting(false);
  return; // 重要：必須 return，避免繼續執行成功邏輯
}

// 只有在沒有錯誤時才執行成功邏輯
clearDraft();
router.push("/success");
```

**錯誤處理模式：**

1. **檢查 `response.error`**：所有 API 呼叫後必須先檢查 `response.error`
2. **提取錯誤訊息**：優先使用 `response.error.message`，如果不存在則使用預設錯誤訊息
3. **顯示錯誤提示**：使用 `toast.error()` 顯示錯誤訊息給用戶
4. **重置狀態**：錯誤時必須重置 loading/submitting 狀態（如 `setIsSubmitting(false)`）
5. **早期返回**：檢查到錯誤後必須 `return`，避免繼續執行成功邏輯（如導航、清除資料等）
6. **記錄錯誤**：使用 `console.error()` 記錄錯誤以便除錯

**處理驗證錯誤的 details 陣列：**

當 API 返回包含 `details` 陣列的驗證錯誤時（例如表單驗證失敗），必須處理每個欄位的錯誤：

```typescript
if (response.error) {
  const error = response.error;
  let errorMessage = "操作失敗";

  if (typeof error === "object" && error !== null) {
    // 檢查是否有 details 陣列
    if ("details" in error && Array.isArray(error.details)) {
      const details = error.details as Array<{ path?: string; message?: string }>;

      // 處理每個欄位錯誤
      details.forEach((detail) => {
        if (detail.path && detail.message) {
          // 將錯誤設置到對應的表單欄位
          form.setError(detail.path as keyof FormValues, {
            type: "server",
            message: detail.message,
          });
        }
      });

      // 使用第一個具體錯誤訊息作為 toast 訊息
      const firstDetail = details[0];
      if (firstDetail?.message) {
        errorMessage = firstDetail.message;
      }
    } else if ("message" in error) {
      // 如果沒有 details，使用頂層 message
      errorMessage = String(error.message);
    }
  }

  toast.error(errorMessage);
  setIsSubmitting(false);
  return;
}
```

**驗證錯誤處理原則：**

1. **處理 details 陣列**：當 `response.error.details` 存在且為陣列時，必須遍歷處理每個欄位錯誤
2. **設置表單錯誤**：使用 `form.setError()` 將每個錯誤設置到對應的表單欄位，讓用戶能看到具體的欄位錯誤
3. **顯示具體錯誤訊息**：優先使用 `details` 中第一個具體錯誤訊息作為 toast 提示，而不是只顯示頂層的通用錯誤訊息
4. **可選：跳轉到錯誤步驟**：對於多步驟表單，可以根據錯誤欄位自動跳轉到對應的步驟

**禁止：** 忽略 `response.error`、在錯誤情況下繼續執行成功邏輯、只依賴 try-catch 處理 API 錯誤（`openapi-fetch` 不會拋出異常，錯誤在 `response.error` 中）、忽略 `details` 陣列中的欄位錯誤

### Date Operations

**必須使用 `date-fns` 來處理所有日期相關的操作**

```typescript
import { format, addDays, parse, isValid } from "date-fns";

const start = parse("2026-01-01", "yyyy-MM-dd", new Date());
const formattedDate = format(new Date(), "yyyy/MM/dd");
const endDate = addDays(start, 7);
```

**禁止直接使用原生 `Date` 物件的方法**（如 `toLocaleDateString()`, `setDate()`, `getDate()` 等）

### Runtime Constants & Type Definitions

**必須使用運行時常數（Runtime Constants）來定義字面量聯合類型**

運行時常數必須放在 `apps/product/src/constants/` 目錄中，使用 `const object + type` 模式：

```typescript
export const TaskStatus = {
  draft: "draft",
  notStarted: "not-started",
  inProgress: "in-progress",
  completed: "completed",
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];
```

**命名規範：**
- 運行時常數：PascalCase，例如 `TaskStatus`, `MoodType`, `CheckInStatus`
- 類型名稱：PascalCase，以 `Type` 作為後綴（可省略），例如 `TaskStatus`, `MoodType`, `CheckInStatusType`
- 常數屬性：camelCase，例如 `notStarted`, `inProgress`, `alreadyCheckedIn`

**使用方式：**

```typescript
import { TaskStatus } from "@/constants/task-status";

const status = TaskStatus.draft;
if (status === TaskStatus.inProgress) {
  // ...
}
```

**現有的運行時常數：**
- `MoodType` - `constants/mood.ts`
- `TaskStatus` - `constants/task-status.tsx`
- `FilterStatus` - `constants/task-status.tsx`
- `CheckInStatus` - `constants/check-in-status.ts`

**禁止直接使用字串字面量**來表示這些常數值。

### Type & Interface Naming Conventions

**命名規範：**
- **Types**：PascalCase + `Type` 後綴，例如 `TaskStatusType`, `MoodType`, `CheckInStatusType`
- **Interfaces**：PascalCase + `I` 前綴，例如 `ICheckInFormData`, `IUserInfo`, `ITaskItem`
- **Component Props**：PascalCase + `ComponentProps` 後綴，例如 `ButtonProps`, `CheckInSheetProps`, `UserInfoCardProps`

```typescript
export type TaskStatusType = "draft" | "in-progress" | "completed";
export interface ICheckInFormData {
  mood: MoodType | null;
  tags: string[];
}
interface ICheckInSheetProps {
  taskTitle: string;
  onComplete: (data: ICheckInFormData) => void;
}
```

**禁止：** 不使用 `I` 前綴的 interface、不使用 `Type` 後綴的 type、不使用 `Props` 後綴的 component props

### Code Style Guidelines

#### 禁止使用 IIFE (Immediately Invoked Function Expression)

避免使用 `(() => { ... })()` 的寫法，優先使用明確的變數宣告：

```typescript
let result = false;
if (value) {
  try {
    result = processValue(value);
  } catch {
    // 處理錯誤
  }
}
```

#### 禁止使用嵌套三元運算子

優先使用 `if-else` 語句或早期返回：

```typescript
let status: string;
if (isActive) {
  status = isPremium ? "premium-active" : "active";
} else {
  status = isPremium ? "premium-inactive" : "inactive";
}
```

在 JSX 中也要避免使用嵌套三元運算子，優先使用條件渲染或提取成函數。

### API Service Files Structure

**API Service 檔案必須遵循以下結構順序：**

1. **Import 語句**：所有 import 必須放在檔案最頂端
2. **Type 定義**：類型定義放在 import 之後
3. **API Hooks/Functions**：實際的 API 函數實作放在最下面

```typescript
"use client";

/**
 * API Service 說明
 */

// ============================================================================
// Imports
// ============================================================================
import { client } from "../client";
import { useQuery } from "../hooks";
import type { SomeType } from "./types";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type CreateRequestType = components["schemas"]["CreateRequest"];
export type UpdateRequestType = paths["/api/v1/resource/{id}"]["put"]["requestBody"];

// ============================================================================
// Query Hooks
// ============================================================================

export const useResource = (id: string) => {
  return useQuery("/api/v1/resource/{id}", {
    params: { path: { id } },
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

export const createResource = async (data: CreateRequestType) => {
  return client.POST("/api/v1/resource", { body: data });
};

export const updateResource = async (id: string, data: UpdateRequestType) => {
  return client.PUT("/api/v1/resource/{id}", {
    params: { path: { id } },
    body: data,
  });
};
```

**禁止：** 將 import 語句分散在檔案中間、將 type 定義放在函數實作之後

## Commit 規範

每次執行 git commit 時，必須使用 `.claude/skills/format-commit/SKILL.md` skill 的流程來產生 commit message。
