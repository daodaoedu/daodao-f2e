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
