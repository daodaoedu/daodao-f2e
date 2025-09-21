# 登入權限與 App Router 關聯

## 路由分組與保護

- 受保護頁放於 `app/[language]/(protected)/*`，其 `layout.tsx` 以 `ProtectedComponent` 包覆。
- 公開頁放於 `app/[language]/(public)/*`，不做登入限制。

參考：
- [app/[language]/(protected)/layout.tsx](mdc:app/[language]/(protected)/layout.tsx)
- [contexts/Auth/ProtectedComponent.tsx](mdc:contexts/Auth/ProtectedComponent.tsx)

## 權限檢查流程（Client）

1. `AuthProvider` 透過 `useGetApiV1UsersMe` 嘗試取得使用者，並根據 token 設定登入狀態。
2. 受保護區域由 `ProtectedComponent` 檢查 `isLoggedIn` 或 `token`（when `onlyCheckToken`）。
3. 可選擇 `checkUserAuthorized` 進一步判斷角色/權限，失敗顯示 `noPermissionFallback`。

## 使用範例

頁面層級保護：

```tsx
// app/[language]/(protected)/page.tsx
export default function ProtectedHome() {
  return <div>僅登入可見</div>
}
```

細粒度保護（元件內）：

```tsx
import { ProtectedComponent } from '@/contexts/Auth'

export default function SecretBlock() {
  return (
    <ProtectedComponent>
      <div>僅登入可見區塊</div>
    </ProtectedComponent>
  )
}
```

角色授權檢查：

```tsx
import { ProtectedComponent, RoleEnum } from '@/contexts/Auth'

export default function AdminOnly() {
  return (
    <ProtectedComponent
      checkUserAuthorized={(user) => user.roleList?.includes(RoleEnum.ADMIN) ?? false}
    >
      <div>Admin 專區</div>
    </ProtectedComponent>
  )
}
```

## Middleware 與語系

`middleware.ts` 負責語系前綴導向，不處理登入權限。權限由 Client AuthContext 與 `(protected)` 分組共同落實。


