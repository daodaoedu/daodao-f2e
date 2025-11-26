# Zod 驗證與型別推導規範

- 所有外部 I/O（API 回應、環境變數、URL 參數、表單輸入）須以 Zod 驗證。
- Schema 與型別一體化：`export const UserSchema = z.object({...})` 並以 `export type User = z.infer<typeof UserSchema>` 暴露型別。
- 錯誤處理：對使用者可見之錯誤訊息需友善；開發階段可記錄詳細 `ZodError`。
- schema 應模組化存放於領域內（例如 `features/users/types.ts` 或 `features/users/schemas.ts`）。
- 與 Orval 產碼結合：若使用 OpenAPI 型別，仍以 Zod 做 runtime 驗證，必要時建立 mapping。

參考：
- [features/*/types.ts](mdc:features)


## 常見範例

```ts
import { z } from 'zod'

export const EnvSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url(),
})

export type Env = z.infer<typeof EnvSchema>

// 轉換與清理
const RawUser = z.object({ id: z.string(), name: z.string().nullable() })
export const UserSchema = RawUser.transform((u) => ({ id: u.id, name: u.name ?? 'Anonymous' }))
```

與 React Hook Form 整合：

```ts
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const FormSchema = z.object({ email: z.string().email() })

export const useMyForm = () => {
  return useForm<z.infer<typeof FormSchema>>({ resolver: zodResolver(FormSchema) })
}
```

