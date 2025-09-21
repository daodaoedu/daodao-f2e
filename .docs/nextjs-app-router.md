# Next.js App Router 規範

- 新頁面與路由一律建立於 `app/`。Server Components 為預設，僅在有互動/瀏覽器 API 時加上 `'use client'`。
- 資料擷取：
  - Server：使用 `fetch` 並設定 `next:{ revalidate }` 或 `cache: 'no-store'` 視需求。
  - Client：使用 SWR，封裝於自訂 hooks（例如 `features/*/hooks`）。
- API Route 使用 `app/api/*/route.ts`。
- SEO 與 Metadata 使用 App Router metadata API；共用設定集中於 `components/SEOConfig.tsx` 或 layout。
- 多語路由：沿用 `app/[language]/*`，跨頁共享 UI 放於 `(public)`、受保護區塊放於 `(protected)`。
- 錯誤與 404：使用 `app/global-error.tsx`、`app/global-not-found.tsx`。

### 登入與權限

- 權限以 `(protected)` 分組 + `ProtectedComponent` 落實；公開頁維持於 `(public)`。
- 權限細節與範例見：[auth-and-app-router.md](mdc:.docs/auth-and-app-router.md)

參考：
- [app/[language]/(public)/(default-layout)/page.tsx](mdc:app/[language]/(public)/(default-layout)/page.tsx)
- [app/global-error.tsx](mdc:app/global-error.tsx)
- [app/global-not-found.tsx](mdc:app/global-not-found.tsx)
- [middleware.ts](mdc:middleware.ts)


## 資料擷取實務

Server 範例：

```ts
export async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
```

Client 範例（於 `features/*/hooks`）：

```ts
import useSWR from 'swr'
import { z } from 'zod'

const DataSchema = z.object({ items: z.array(z.string()) })

export const useData = () => {
  const { data, error, isLoading, mutate } = useSWR('/data')
  const parsed = data ? DataSchema.parse(data) : undefined
  return { data: parsed, error, isLoading, mutate }
}
```

