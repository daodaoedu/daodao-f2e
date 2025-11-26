# Orval 產碼與 API 客戶端規範

- 不修改 `generated/` 任何檔案；若需客製，於 `services/*` 建立薄封裝。
- `orval.config.ts` 為單一真實來源（SSOT）；更新 OpenAPI 後以指令重生產。
- 以 `services/_shared/*` 提供共用攔截器、錯誤處理與 `fetcher`。
- 呼叫層級：UI -> `features/*/hooks` -> `services/*` -> `generated/*`。
- 以 Zod 驗證 `generated` 回傳資料，避免信任後端契約的 runtime 正確性。

參考：
- [orval.config.ts](mdc:orval.config.ts)
- [services](mdc:services)
- [generated](mdc:generated)


## 產碼流程

1. 更新 `services/openapi.yaml` 或後端來源。
2. 執行 `pnpm generate:api`（見 `package.json`）。
3. 於 `services/*` 建立領域封裝，統一錯誤處理與 Zod 驗證。

## 呼叫範式

```ts
// services/users/index.ts
import { UsersService } from '@/generated'
import { z } from 'zod'

const UserSchema = z.object({ id: z.string(), name: z.string() })

export const getUser = async (id: string) => {
  const res = await UsersService.getUser({ id })
  return UserSchema.parse(res)
}
```

SWR 結合：

```ts
import useSWR from 'swr'
import { getUser } from '@/services/users'

export const useUser = (id?: string) => {
  return useSWR(id ? ['user', id] : null, () => getUser(id!))
}
```

