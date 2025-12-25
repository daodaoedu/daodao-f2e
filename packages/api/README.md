# @daodao/api

API 客戶端套件，提供類型安全的 API 調用功能。

## 功能

- ✅ 基於 OpenAPI 的類型安全 API 客戶端
- ✅ 使用 `openapi-fetch` 進行 API 調用
- ✅ 使用 `swr` 進行數據獲取與快取
- ✅ 統一的錯誤處理
- ✅ 認證配置支援

## 安裝

此套件已包含在 monorepo 中，無需額外安裝。

## 使用方式

### 基本使用

```typescript
import { apiClient } from "@daodao/api";

// 直接調用 API
const { data, error } = await apiClient.GET("/users/{id}", {
  params: {
    path: { id: "123" },
  },
});
```

### 使用 Hooks

```typescript
import { useApiGet, useApiMutate } from "@daodao/api";

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useApiGet("/users/{id}", {
    params: {
      path: { id: userId },
    },
  });

  const mutate = useApiMutate();

  const handleUpdate = async () => {
    await mutate.put("/users/{id}", {
      params: { path: { id: userId } },
      body: { name: "New Name" },
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data?.name}</div>;
}
```

### 錯誤處理

```typescript
import { handleApiError, isApiError } from "@daodao/api";

try {
  const { data, error } = await apiClient.GET("/users/{id}", {
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

- `NEXT_PUBLIC_API_BASE_URL`: API 基礎 URL（預設: `http://localhost:3000/api`）

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
│   ├── config/
│   │   └── auth.ts         # 認證配置
│   └── index.ts           # 導出入口
├── package.json
├── tsconfig.json
└── README.md
```

## 依賴關係

- `@daodao/shared`: 共享工具函數
- `openapi-fetch`: OpenAPI 客戶端
- `swr`: 數據獲取與快取

