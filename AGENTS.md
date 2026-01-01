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
