# SWR 與資料抓取規範

- Client 端使用 SWR；`fetcher` 集中於 [services/fetcher.ts](mdc:services/fetcher.ts)。
- Key 設計：固定、可序列化、包含必要參數；避免在 render 中動態改變 key 形態。
- 型別與驗證：SWR 取得的資料需經 Zod 驗證後再下放 UI；hook 封裝 Zod 解析，回傳已型別化資料。
- 錯誤與載入：提供一致的 `isLoading`、`error` 與 Skeleton/空狀態顯示。
- 快取策略：
  - 預設 `revalidateOnFocus: false`、`revalidateOnReconnect: true`（依情境微調）。
  - 表單送出後使用 `mutate(key)` 或 `mutate(key, updater)` 進行同步。
- Server 端：偏好 `fetch` + `revalidate` 搭配 Zod 驗證；避免在 Server 端引入 SWR。

參考：
- [services/fetcher.ts](mdc:services/fetcher.ts)


## 標準 Hook 範例

```ts
import useSWR from 'swr'
import { z } from 'zod'

const ItemSchema = z.object({ id: z.string(), name: z.string() })
const ItemsSchema = z.array(ItemSchema)

export const useItems = (q: string) => {
  const key = q ? ['/items', q] : null
  const { data, error, isLoading, mutate } = useSWR(key)
  const parsed = data ? ItemsSchema.parse(data) : undefined
  return { items: parsed, error, isLoading, mutate }
}
```

## 快取與樂觀更新

```ts
// 提交後本地先行更新，失敗回滾
await mutate(async (prev) => {
  const optimistic = [...(prev ?? []), { id: 'temp', name: input }]
  try {
    const saved = await api.items.create({ name: input })
    return [...(prev ?? []), saved]
  } catch (e) {
    return prev // 失敗回滾
  }
}, { revalidate: true })
```

