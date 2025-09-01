# Next.js 15 App Router 完整指南

## 概述

Next.js 15 引入了全新的 **App Router**，這是一個基於 React Server Components 和 React 18 的現代化路由系統。App Router 提供了更好的效能、更簡潔的開發體驗，以及更強大的功能。

## App 資料夾結構

### 基本結構

```
app/
├── global.css              # 全域樣式
├── global-error.tsx        # 全域錯誤頁面
├── global-not-found.tsx    # 全域 404 頁面
├── not-found.tsx           # 404 頁面
├── [language]/             # 動態路由 - 語言
│   ├── layout.tsx          # 語言層級佈局
│   ├── Providers.tsx       # 提供者元件
│   └── (BaseLayout)/       # 路由群組
│       ├── layout.tsx      # 基礎佈局
│       ├── page.tsx        # 首頁
│       ├── [page]/         # 動態頁面路由
│       │   └── page.tsx    # 動態頁面
│       ├── terms/          # 靜態路由
│       ├── components/     # 頁面元件
│       └── styles/         # 頁面樣式
└── ...
```

## 核心概念

### 1. 檔案系統路由 (File-system Based Routing)

App Router 使用檔案系統來定義路由，每個資料夾代表一個路由段：

- `page.tsx` - 路由頁面
- `layout.tsx` - 路由佈局
- `loading.tsx` - 載入狀態
- `error.tsx` - 錯誤處理
- `not-found.tsx` - 404 頁面

### 2. 路由群組 (Route Groups)

使用括號 `()` 來創建路由群組，不會影響 URL 結構：

```typescript
// app/(BaseLayout)/layout.tsx
// URL: /zh-TW/about (不會包含 BaseLayout)
export default function BaseLayout({ children }: LayoutProps<'/[language]'>) {
  return (
    <>
      <main className="min-h-screen bg-white">{children}</main>
    </>
  );
}
```

### 3. 動態路由 (Dynamic Routes)

使用方括號 `[]` 來創建動態路由：

```typescript
// app/[language]/[page]/page.tsx
// URL: /zh-TW/about, /en/about 等

export async function generateStaticParams() {
  return Object.keys(pageMap).flatMap((page) =>
    locales.map((language) => ({ language, page }))
  );
}

export default async function TermsPage({
  params,
}: PageProps<'/[language]/[page]'>) {
  const { page } = await params;
  const { Component } = getDynamicRoute(page, pageMap);
  return <Component />;
}
```

## 特殊檔案說明

### 1. layout.tsx

佈局檔案定義了頁面的共同結構，支援巢狀佈局：

```typescript
// app/[language]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**特點：**
- 支援巢狀佈局
- 可以包含 metadata 生成
- 支援 generateStaticParams
- 可以設定 viewport 和 theme

### 2. page.tsx

頁面檔案是路由的主要內容：

```typescript
// app/[language]/(BaseLayout)/page.tsx
export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <KeyVision />
        <div style={{ height: 80 }} />
      </main>
      <Footer />
    </>
  );
}
```

**特點：**
- 預設為 Server Component
- 支援 async/await
- 可以包含 metadata 生成
- 支援 generateStaticParams

### 3. global-error.tsx

全域錯誤處理頁面：

```typescript
// app/global-error.tsx
'use client';

export default function GlobalErrorPage() {
  return (
    <html>
      <body>
        <NotExist />
      </body>
    </html>
  );
}
```

**特點：**
- 必須是 Client Component
- 處理根層級的錯誤
- 可以重新定義 html 和 body 標籤

### 4. global-not-found.tsx

全域 404 頁面：

```typescript
// app/global-not-found.tsx
export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <NotExist />
      </body>
    </html>
  );
}
```

## 路由優先級

App Router 的路由優先級如下（從高到低）：

1. **靜態路由** - `app/about/page.tsx`
2. **動態路由** - `app/[slug]/page.tsx`
3. **捕獲所有路由** - `app/[...slug]/page.tsx`
4. **可選捕獲路由** - `app/[[...slug]]/page.tsx`

## 國際化 (i18n) 支援

### 語言路由結構

```typescript
// app/[language]/layout.tsx
export async function generateStaticParams() {
  return locales.map((language) => ({ language }));
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[language]'>): Promise<Metadata> {
  const { language } = await params;
  const { common: { title, description } } = await getDictionary(language);
  
  return {
    title: {
      template: `%s | ${websiteConfig.title}`,
      default: websiteConfig.defaultFullTitle,
    },
    description,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locate) => [locate, `/${locate}`])
      ),
    },
  };
}
```

### 語言切換

```typescript
// 支援的語言
export const locales = ['zh-TW', 'en'] as const;
export type Locale = typeof locales[number];

// 語言切換連結
const languageAlternates = Object.fromEntries(
  locales.map((locate) => [locate, `/${locate}`])
);
```

## 元資料 (Metadata) 管理

### 靜態元資料

```typescript
export const metadata: Metadata = {
  title: '頁面標題',
  description: '頁面描述',
};
```

### 動態元資料

```typescript
export async function generateMetadata({
  params,
}: PageProps<'/[language]/[page]'>): Promise<Metadata> {
  const { page } = await params;
  const { title, description } = getDynamicRoute(page, pageMap);
  
  return {
    title,
    description,
  };
}
```

## 資料獲取

### Server Components

```typescript
// 在 Server Component 中直接獲取資料
export default async function Page() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}
```

### Client Components

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ClientPage() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return <div>{data?.title}</div>;
}
```

## 效能優化

### 1. 靜態生成

```typescript
export async function generateStaticParams() {
  return [
    { language: 'zh-TW', page: 'about' },
    { language: 'en', page: 'about' },
  ];
}
```

### 2. 快取策略

```typescript
// 強制快取
const data = await fetch(url, { cache: 'force-cache' });

// 不快取
const data = await fetch(url, { cache: 'no-store' });

// 重新驗證
const data = await fetch(url, { next: { revalidate: 3600 } });
```

## 最佳實踐

### 1. 檔案命名

- 使用 `page.tsx` 作為頁面檔案
- 使用 `layout.tsx` 作為佈局檔案
- 使用 `loading.tsx` 作為載入狀態
- 使用 `error.tsx` 作為錯誤處理

### 2. 資料夾結構

- 將相關的元件放在同一資料夾
- 使用路由群組來組織相關頁面
- 保持資料夾結構清晰和一致

### 3. 效能考量

- 優先使用 Server Components
- 適當使用靜態生成
- 實作適當的快取策略
- 使用 Suspense 進行程式碼分割

### 4. 錯誤處理

- 實作適當的錯誤邊界
- 提供使用者友善的錯誤訊息
- 記錄錯誤以便除錯

## 遷移指南

### 從 Pages Router 遷移

1. **路由結構**：將 `pages/` 下的檔案移動到 `app/` 下
2. **API 路由**：將 `pages/api/` 移動到 `app/api/`
3. **佈局系統**：使用 `layout.tsx` 替代 `_app.tsx` 和 `_document.tsx`
4. **資料獲取**：使用 Server Components 或新的資料獲取方法

### 常見問題

1. **Client Component 錯誤**：確保在需要客戶端功能的元件上加上 `'use client'`
2. **路由不匹配**：檢查檔案命名和資料夾結構
3. **元資料不生效**：確保使用正確的 metadata API

## 總結

Next.js 15 的 App Router 提供了更現代化、更高效的開發體驗。通過理解檔案系統路由、Server Components、和新的 API，你可以建立更好的應用程式。記住要遵循最佳實踐，並充分利用新功能來提升效能和使用者體驗。
