# Development Environment Configuration

## Node.js Version

- **Node.js Version**: 20.19.4
- **Switch Command**: `nvm use 20.19.4`

## Code Quality Checks

After completing any feature modifications, the following commands must be executed to ensure code quality:

- `pnpm format` - Format code
- `pnpm lint:fix` - Fix lint errors
- `pnpm typecheck` - Check TypeScript type errors

## Language Preference

- **Interaction Language**: Use Traditional Chinese when interacting with developers
- **Code Comments**: Comments should be written in English or Traditional Chinese

## Project Architecture & Development Guidelines

### Environment Variables

**必須使用 `@daodao/config` 來取得環境變數**

- 使用 `getEnv(key, defaultValue?)` 來取得可選的環境變數
- 使用 `getRequiredEnv(key)` 來取得必要的環境變數（如果不存在會拋出錯誤）

```typescript
import { getEnv, getRequiredEnv } from "@daodao/config";

// 取得可選的環境變數
const apiUrl = getEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");

// 取得必要的環境變數
const apiKey = getRequiredEnv("NEXT_PUBLIC_API_KEY");
```

**禁止直接使用 `process.env`**，請統一使用 `@daodao/config` 提供的函數。

### Storage Operations

**必須使用 `@daodao/shared` 的 storage 來定義 localStorage 與 sessionStorage 的相關操作**

- 使用 `getStorage<T>(key)` 來取得 storage 實例
- 使用 `StorageEnum` 來定義 storage key，避免直接使用字串
- 每個 storage key 都會自動對應到正確的 storage 類型（localStorage 或 sessionStorage）

```typescript
import { getStorage, StorageEnum } from "@daodao/shared";

// 取得 storage 實例
const userStorage = getStorage<UserInfo>(StorageEnum.UserInfo);

// 設定值
userStorage.set({ name: "John", email: "john@example.com" });

// 取得值
const userInfo = userStorage.get();

// 移除值
userStorage.remove();
```

**可用的 StorageEnum：**
- `StorageEnum.Quiz` - sessionStorage，用於存儲使用者做島島測試的資料
- `StorageEnum.UserInfo` - localStorage，用於存儲使用者資訊（非敏感資料）
- `StorageEnum.Whitelist` - localStorage，用於存儲外連結受信任網站列表
- `StorageEnum.OAuthNonce` - sessionStorage，用於存儲 OAuth nonce（防止偽造和重放攻擊）

**禁止直接使用 `localStorage` 或 `sessionStorage`**，請統一使用 `@daodao/shared` 提供的 storage 函數。

**新增 storage key 的流程：**
1. 在 `packages/shared/src/lib/storage.ts` 的 `StorageEnum` 中新增 key
2. 在 `mapStorageKeyToStorageType` 中定義對應的 storage 類型（localStorage 或 sessionStorage）
3. 添加適當的註解說明該 storage 的用途

### UI Components

**必須盡可能使用 `@daodao/ui` 提供的 UI 元件**

- 優先使用 `@daodao/ui` 的元件，避免自行實作或使用原生 HTML 元素
- 使用 `@daodao/ui` 的元件可以確保設計系統的一致性、可訪問性和樣式統一

```typescript
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { Badge } from "@daodao/ui/components/badge";
import { Avatar } from "@daodao/ui/components/avatar";

// ✅ 正確：使用 daodao/ui 的 Button
<Button variant="outline" onClick={handleClick}>
  點擊我
</Button>

// ❌ 錯誤：使用原生 button
<button onClick={handleClick}>點擊我</button>
```

- 更多元件請參考 `packages/ui/src/components/`

**禁止直接使用原生 HTML 元素**（如 `<button>`, `<input>` 等），除非 `@daodao/ui` 沒有提供對應的元件。

### Shared Utilities

**必須使用 `@daodao/shared` 提供的共用方法和 Hooks**

- 優先使用 `@daodao/shared` 提供的共用功能，避免重複實作
- 使用共用方法可以確保行為一致性和可維護性

```typescript
import { useScrollLock } from "@daodao/shared";
import { useMediaQuery } from "@daodao/shared";
import { useQueryState } from "@daodao/shared";
import { formatDate } from "@daodao/shared";
import { shareContent } from "@daodao/shared";

// ✅ 正確：使用 daodao/shared 的 hook
const isLocked = useScrollLock(open);

// ✅ 正確：使用 daodao/shared 的工具函數
const formattedDate = formatDate(date);
```

**可用的 Hooks：**
- `useScrollLock` - 鎖定頁面滾動
- `useMediaQuery` - 響應式媒體查詢
- `useQueryState` - URL query 參數狀態管理
- `useScrollVisibility` - 滾動可見性檢測
- `useAssetsLoader` - 資源載入器

**可用的工具函數：**
- `formatDate` - 日期格式化
- `shareContent` - 分享內容功能
- `captureElementAsImage` - 將元素轉換為圖片
- `getStorage`, `StorageEnum` - Storage 操作（見上方 Storage Operations 章節）

**禁止重複實作** `@daodao/shared` 已經提供的功能。

### API Calls

**必須使用 `@daodao/api` 來進行 API 呼叫**

- 使用 `@daodao/api` 提供的 hooks 和 client 來發送 API 請求
- 使用 `@daodao/api` 可以確保 API 呼叫的一致性、錯誤處理和類型安全

```typescript
import { useQuery, useMutate, useInfinite } from "@daodao/api";
import { client } from "@daodao/api";

// ✅ 正確：使用 daodao/api 的 hooks
const { data, error, isLoading } = useQuery("GET", "/api/users/{id}", {
  params: { path: { id: "123" } },
});

const { trigger, isMutating } = useMutate("POST", "/api/users");

// ✅ 正確：使用 daodao/api 的 client（在 Server Component 或非 React 環境）
const response = await client.GET("/api/users/{id}", {
  params: { path: { id: "123" } },
});
```

**可用的 API Hooks：**
- `useQuery` - 查詢資料（GET 請求）
- `useMutate` - 變更資料（POST, PUT, DELETE 等請求）
- `useInfinite` - 無限滾動查詢
- `useImmutable` - 不可變資料查詢

**可用的 API Client：**
- `client` - 用於 Server Component 或非 React 環境的 API 客戶端

**禁止直接使用 `fetch` 或 `axios`**，請統一使用 `@daodao/api` 提供的 API 客戶端和 hooks。
