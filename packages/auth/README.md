# @daodao/auth

認證與授權模組套件，提供完整的 OAuth 2.0 登入流程、路由保護和認證狀態管理功能。

## 功能

- ✅ Google OAuth 2.0 登入流程
- ✅ HTTP-only Cookie 認證（後端設定）
- ✅ 跨域登入支援（Cookie domain 共享）
- ✅ React Context 認證狀態管理
- ✅ 路由保護（Middleware 和組件層級）
- ✅ Token 自動刷新（後端處理）
- ✅ 跨 Tab 同步（使用者資訊）

## 安裝

此套件已包含在 monorepo 中，無需額外安裝。

## 使用方式

### 基本使用（Client Component）

```typescript
'use client';
import { useAuth } from '@daodao/auth';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Welcome, {user?.name}</div>;
}
```

### 路由保護（Server Component）

```typescript
import { AuthGuard } from '@daodao/auth';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>Protected Content</div>
    </AuthGuard>
  );
}
```

### 登入按鈕

```typescript
import { LoginButton } from '@daodao/auth';

export default function HomePage() {
  return (
    <LoginButton redirectUrl="/dashboard">
      Enter App
    </LoginButton>
  );
}
```

## 配置

### 環境變數

- `NEXT_PUBLIC_API_URL`: API 基礎 URL
- `NEXT_PUBLIC_APP_URL`: App 域名（如 `app.daodao.so`）
- `NEXT_PUBLIC_WEBSITE_URL`: Website 域名（如 `daodao.so`）
- `NEXT_PUBLIC_AUTH_CALLBACK_URL`: OAuth 回調路徑（預設: `/auth/callback`）

## 架構

- **Token 存儲**: HTTP-only Cookie（後端設定，前端無法直接讀取）
- **使用者資訊**: localStorage（非敏感資料）
- **認證方式**: Cookie-based（不使用 Authorization Bearer Token）
- **跨域支援**: Cookie domain `.daodao.so` 實現跨子域名共享

