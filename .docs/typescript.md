# TypeScript 嚴格型別規範

- 嚴禁 `any`。若需未知型別以 `unknown`，必要時窄化。
- 匯出函式、元件、公用常數需明確標註型別或使用 `as const`/`satisfies` 確保型別安全。
- 避免不必要的型別斷言；若需，優先使用 `satisfies` 驗證物件結構。
- 以 `zod` schemas 作為 runtime 邊界驗證，型別以 `z.infer<typeof Schema>` 推導。
- 事件處理以具名函式常數宣告：`const handleClick = (event: MouseEvent<HTMLButtonElement>) => {}`。
- 物件常數使用 `as const` 鎖定 literal types。
- 嚴禁隱式 `any`，啟用 `strict`，遵循專案 `tsconfig.json`。

參考：
- [tsconfig.json](mdc:tsconfig.json)


## 實務建議

- 公開 API（匯出元件/函式）一律宣告回傳型別，避免由實作推斷。
- React 元件 props 建立 `Props` 型別別名；事件處理以 DOM 型別精確標註。
- Utility 型別偏好具名型別，避免巢狀複雜泛型影響可讀性。
- 以窄化守衛取代非必要 `!` 斷言；避免 `as unknown as T`。

## 片段範例

```ts
// zod schema 與型別推導
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
})

export type User = z.infer<typeof UserSchema>

// React 元件 with Props 型別
type UserCardProps = {
  user: User
  onSelect?: (userId: string) => void
}

export const UserCard = ({ user, onSelect }: UserCardProps) => {
  const handleClick = () => {
    if (!onSelect) return
    onSelect(user.id)
  }
  return (
    <button type="button" onClick={handleClick}>
      {user.name}
    </button>
  )
}
```

