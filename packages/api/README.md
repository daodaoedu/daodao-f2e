# @daodao/api

API 客戶端套件，提供類型安全的 API 調用功能。

## 功能

- ✅ 基於 OpenAPI 的類型安全 API 客戶端（後端 API）
- ✅ Next.js API Routes 客戶端（前端內部 API）
- ✅ 使用 `openapi-fetch` 進行後端 API 調用
- ✅ 使用 `swr` 進行數據獲取與快取
- ✅ 統一的錯誤處理
- ✅ 認證配置支援

## 安裝

此套件已包含在 monorepo 中，無需額外安裝。

## 使用方式

### 方式 1：使用 Domain Services（推薦）

專案提供了統一的 domain-specific API 服務，建議優先使用：

#### Client Functions（Server Components 或直接調用）

```typescript
import { getUserByIdentifier, getCurrentUser, updateCurrentUser } from "@daodao/api";

// Server Component
export default async function UserPage({ params }: { params: { id: string } }) {
  const response = await getUserByIdentifier(params.id);
  const userData = response.data?.data;
  
  return <div>{userData?.name}</div>;
}

// 直接調用
const userResponse = await getCurrentUser();
const updateResponse = await updateCurrentUser({ name: "New Name" });
```

#### Hooks（Client Components）

```typescript
"use client";

import { useUserByIdentifier, useCurrentUser, useUserMutations } from "@daodao/api";

function UserProfile({ identifier }: { identifier: string }) {
  const { data, error, isLoading } = useUserByIdentifier(identifier);
  const { updateCurrentUser } = useUserMutations();

  const handleUpdate = async () => {
    await updateCurrentUser({ name: "New Name" });
  };

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;

  return (
    <div>
      <h1>{data?.data?.data?.name}</h1>
      <button onClick={handleUpdate}>更新</button>
    </div>
  );
}
```

### 方式 2：Next.js API Routes（前端內部 API）

對於 Next.js API Routes（`/api/*`），使用專門的服務：

```typescript
import { extractOgImage, useExtractOgImage } from "@daodao/api";

// Server Component
const result = await extractOgImage({ url: "https://example.com" });
if (result.success) {
  console.log(result.data.ogImageUrl);
}

// Client Component
function MyComponent() {
  const { extract, isLoading, data } = useExtractOgImage();
  
  const handleExtract = async () => {
    const result = await extract({ url: "https://example.com" });
    // ...
  };
}
```

### 方式 3：直接使用 Client 和 Hooks

如果 domain service 沒有提供您需要的功能，可以直接使用底層的 client 和 hooks：

```typescript
import { client, useQuery, useMutate } from "@daodao/api";

// 直接調用 API
const { data, error } = await client.GET("/api/v1/users/{id}", {
  params: {
    path: { id: "123" },
  },
});

// 使用 Hooks
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useQuery("/api/v1/users/{id}", {
    params: {
      path: { id: userId },
    },
  });

  const mutate = useMutate();

  const handleUpdate = async () => {
    await mutate.put("/api/v1/users/{id}", {
      params: { path: { id: userId } },
      body: { name: "New Name" },
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data?.data?.name}</div>;
}
```

### 錯誤處理

```typescript
import { handleApiError, isApiError } from "@daodao/api";

try {
  const { data, error } = await client.GET("/users/{id}", {
    params: { path: { id: "123" } },
  });
  
  if (error) {
    throw handleApiError(error);
  }
} catch (error) {
  if (isApiError(error)) {
    console.error(`API Error: ${error.status} ${error.statusText}`);
  }
}
```

## 配置

### 環境變數

#### 後端 API

- `NEXT_PUBLIC_API_URL`: 後端 API 基礎 URL（**必填**，例如: `http://localhost:3001/api`）
  
  > **注意**：這是後端 API 服務器的 URL，不是前端應用的 URL。必須在 `.env` 文件中設定此環境變數。

#### Next.js API Routes

- `NEXT_PUBLIC_APP_URL`: 前端應用 URL（可選，用於 Server-side 調用 Next.js API Routes）
- `VERCEL_URL`: Vercel 部署時自動設定的環境變數（可選）

  > **注意**：Next.js API Routes 在 Client-side 使用相對路徑，Server-side 需要完整 URL。

#### 在 Monorepo 中使用環境變數

此 package 使用 `@daodao/config` 來載入環境變數。環境變數會自動從以下位置載入：

1. **Next.js 應用目錄**：`apps/product/.env.local` 或 `apps/website/.env.local`
2. **Monorepo 根目錄**：`.env` 或 `.env.local`
3. **Package 目錄**：`packages/config/.env` 或 `packages/config/.env.local`

在 Next.js 應用中，環境變數會在 build 時被內嵌到 bundle 中，無需額外配置。

詳細說明請參考 `@daodao/config` 的文件。

#### 自訂 API Client

如果需要自訂 baseUrl，可以使用 `createApiClient` 函數：

```typescript
import { createApiClient } from "@daodao/api";

// 建立自訂的 API client
const customClient = createApiClient({
  baseUrl: "https://api.example.com",
});

// 使用自訂的 client
const { data, error } = await customClient.GET("/users/{id}", {
  params: { path: { id: "123" } },
});
```

### 認證配置

認證配置位於 `src/config/auth.ts`。需要根據實際的認證策略實作：

- `getAuthHeaders()`: 獲取認證 headers
- `setAuthToken(token)`: 設置認證 token
- `clearAuthToken()`: 清除認證 token

## OpenAPI 類型生成

OpenAPI 類型檔案 (`src/types.ts`) 會透過 GitHub Actions workflow 自動從後端同步。

手動同步方式：

```bash
# 從後端獲取 OpenAPI 類型檔案
gh api repos/daodaoedu/daodao-server/contents/generated/openapi-types.ts \
  --method GET \
  --jq '.content' \
  -f ref=dev | base64 -d > packages/api/src/types.ts
```

## 結構

```
packages/api/
├── src/
│   ├── client.ts          # API 客戶端核心
│   ├── hooks.ts           # React hooks (SWR)
│   ├── errors.ts          # 錯誤處理
│   ├── is-match.ts        # 路由匹配工具
│   ├── types.ts           # OpenAPI 生成的類型
│   ├── services/          # Domain-specific API 服務
│   │   ├── user.ts        # User API client functions
│   │   ├── user-hooks.ts  # User API React hooks
│   │   ├── index.ts       # 統一導出
│   │   └── README.md      # 服務層說明
│   ├── config/
│   │   └── auth.ts         # 認證配置
│   └── index.ts           # 導出入口
├── package.json
├── tsconfig.json
└── README.md
```

## Domain Services

專案提供了統一的 domain-specific API 服務，位於 `src/services/` 目錄：

- **User Service**: `getUserByIdentifier`, `getCurrentUser`, `useUserByIdentifier`, `useCurrentUser` 等
- 更多 domain services 將陸續添加

詳細說明請參考 [services/README.md](./src/services/README.md)

## 依賴關係

- `@daodao/shared`: 共享工具函數
- `openapi-fetch`: OpenAPI 客戶端
- `swr`: 數據獲取與快取

