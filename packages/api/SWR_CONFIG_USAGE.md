# SWRConfig 設定與使用指南

本文件說明如何在專案中設定和使用 `SWRConfig`。

## 目錄

1. [全域 SWRConfig 設定](#全域-swrconfig-設定)
2. [Server Components 中使用 SWRConfig](#server-components-中使用-swrconfig)
3. [完整範例](#完整範例)

## 全域 SWRConfig 設定

`@daodao/api` package 提供了 `SwrConfigProvider` 組件和 `defaultSwrConfig` 配置，用於統一管理 SWR 的全域設定。

### 使用 SwrConfigProvider

在應用程式的 `GlobalProvider` 中使用 `SwrConfigProvider`：

```typescript
import { SwrConfigProvider } from "@daodao/api";

function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <SwrConfigProvider>
      {children}
    </SwrConfigProvider>
  );
}
```

### 預設配置

`defaultSwrConfig` 提供以下預設選項：

- `revalidateOnFocus: true` - 視窗聚焦時重新驗證
- `revalidateOnReconnect: true` - 網路重新連線時重新驗證
- `revalidateIfStale: true` - 如果資料過期則重新驗證
- `shouldRetryOnError: true` - 發生錯誤時重試
- `errorRetryCount: 3` - 最多重試 3 次
- `errorRetryInterval: 5000` - 重試間隔 5 秒
- `dedupingInterval: 2000` - 2 秒內相同請求會被去重
- `keepPreviousData: true` - 保持前一次的資料，避免閃爍

### 自訂配置

如果需要覆蓋預設配置，可以傳入 `value` prop：

```typescript
import { SwrConfigProvider, defaultSwrConfig } from "@daodao/api";

function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <SwrConfigProvider
      value={{
        ...defaultSwrConfig,
        revalidateOnFocus: false, // 覆蓋預設值
      }}
    >
      {children}
    </SwrConfigProvider>
  );
}
```

這些設定會套用到所有使用 `@daodao/api` hooks 的組件。

## Server Components 中使用 SWRConfig

在 Server Components 中，可以使用 `getSwrKeyWithResponse` 來預先獲取資料，並透過 `SWRConfig` 的 `fallback` 選項將資料傳遞給 Client Components，避免客戶端重複請求。

### 基本用法

```typescript
import { SWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { getSwrKeyWithResponse } from "@daodao/api";

// Server Component
export default async function UserPage({ params }: { params: { id: string } }) {
  // 使用 getSwrKeyWithResponse 同時獲取 cache key 和資料
  const [swrKey, response] = await getSwrKeyWithResponse("/api/v1/users/{id}", {
    params: { path: { id: params.id } },
  });

  // 使用 SWRConfig 提供 fallback data
  return (
    <SWRConfig value={{ fallback: { [unstable_serialize(swrKey)]: response } }}>
      <UserProfileClient userId={params.id} />
    </SWRConfig>
  );
}
```

### 多個資料來源

```typescript
import { SWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { getSwrKeyWithResponse } from "@daodao/api";

export default async function UserDashboardPage({ params }: { params: { id: string } }) {
  // 並行獲取多個資料
  const [userKey, userResponse] = await getSwrKeyWithResponse("/api/v1/users/{id}", {
    params: { path: { id: params.id } },
  });

  const [tasksKey, tasksResponse] = await getSwrKeyWithResponse("/api/v1/users/{id}/tasks", {
    params: { path: { id: params.id } },
  });

  // 合併多個 fallback
  const fallback = {
    [unstable_serialize(userKey)]: userResponse,
    [unstable_serialize(tasksKey)]: tasksResponse,
  };

  return (
    <SWRConfig value={{ fallback }}>
      <UserDashboardClient userId={params.id} />
    </SWRConfig>
  );
}
```

### 使用 getSwrKey（手動獲取資料）

如果已經有資料或需要自訂獲取邏輯，可以使用 `getSwrKey` 來生成 cache key：

```typescript
import { SWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { client, getSwrKey } from "@daodao/api";

export default async function UserPage({ params }: { params: { id: string } }) {
  // 手動獲取資料
  const response = await client.GET("/api/v1/users/{id}", {
    params: { path: { id: params.id } },
  });

  // 生成 cache key
  const swrKey = getSwrKey("/api/v1/users/{id}", {
    params: { path: { id: params.id } },
  });

  return (
    <SWRConfig value={{ fallback: { [unstable_serialize(swrKey)]: response } }}>
      <UserProfileClient userId={params.id} />
    </SWRConfig>
  );
}
```

## 完整範例

### Server Component（預先獲取資料）

```typescript
// apps/product/src/app/[locale]/(with-layout)/users/[identifier]/page-server.tsx
import { SWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { getSwrKeyWithResponse } from "@daodao/api";
import UserProfileClient from "./page-client";

export default async function UserProfilePage({ params }: { params: { identifier: string } }) {
  const { identifier } = await params;

  // 預先獲取用戶資料
  const [swrKey, userResponse] = await getSwrKeyWithResponse(
    "/api/v1/users/custom-id/{customId}",
    {
      params: { path: { customId: identifier } },
    }
  );

  // 如果 customId 查詢失敗，嘗試用 ID 查詢
  let finalKey = swrKey;
  let finalResponse = userResponse;

  if (!userResponse.data || !userResponse.response.ok) {
    const [idKey, idResponse] = await getSwrKeyWithResponse("/api/v1/users/{id}", {
      params: { path: { id: identifier } },
    });
    finalKey = idKey;
    finalResponse = idResponse;
  }

  return (
    <SWRConfig value={{ fallback: { [unstable_serialize(finalKey)]: finalResponse } }}>
      <UserProfileClient identifier={identifier} />
    </SWRConfig>
  );
}
```

### Client Component（使用 Hook）

```typescript
// apps/product/src/app/[locale]/(with-layout)/users/[identifier]/page-client.tsx
"use client";

import { useUserByIdentifier } from "@daodao/api";

export default function UserProfileClient({ identifier }: { identifier: string }) {
  // 這個 hook 會使用 Server Component 提供的 fallback data
  // 不會再次發送請求，除非資料過期或需要重新驗證
  const { data: userResponse, error, isLoading } = useUserByIdentifier(identifier);

  const userData = userResponse?.data;

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>載入失敗</div>;
  if (!userData) return <div>找不到用戶</div>;

  return (
    <div>
      <h1>{userData.name}</h1>
      {/* 其他 UI */}
    </div>
  );
}
```

## 注意事項

1. **unstable_serialize 導入**：`unstable_serialize` 需要從 `swr/infinite` 導入，用於序列化 SWR cache key。

2. **錯誤處理**：在 Server Component 中獲取資料時，應該處理錯誤情況，避免將錯誤響應傳遞給 Client Component。

3. **類型安全**：`getSwrKey` 和 `getSwrKeyWithResponse` 會自動推斷類型，確保參數類型正確。

4. **效能考量**：使用 fallback data 可以減少客戶端的初始請求，提升頁面載入速度。

5. **重新驗證**：即使提供了 fallback data，SWR 仍會根據全域設定自動重新驗證資料（例如視窗聚焦時）。

## 參考資源

- [SWR 官方文件](https://swr.vercel.app)
- [swr-openapi 文件](https://openapi-ts.dev/swr-openapi)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
