# Feature-Sliced Design (FSD) 架構指南

## 概述

Feature-Sliced Design (FSD) 是一種前端應用程式的架構方法論，旨在透過明確的規則和約定來組織程式碼，使專案在面對不斷變化的業務需求時更易於理解和維護。

## 核心概念

### 三層結構
- **Layer（層）**：最高層級的組織結構
- **Slice（切片）**：按業務領域劃分的功能模組
- **Segment（段）**：按技術目的劃分的程式碼組織

## 架構選擇

### Next.js 混合架構（採用）
本專案採用混合架構，適合中大型專案的靈活性需求：
- 將 Next.js 的 `app/` 目錄保持在根層級處理路由和頁面組件
- 在 `src/` 目錄下實作簡化的 FSD 四層架構
- 直接在 Next.js 頁面中組合 widgets，實現清晰的職責分離

### 依賴關係
```
Next.js App Router → Widgets → Features → Entities → Shared
```

**重要原則**：
- ✅ 上層可以使用下層
- ❌ 下層不能使用上層
- ⚠️ 同層之間可以相互使用，但要避免循環依賴

### 目錄結構
```
project/
├── app/                    # Next.js App Router（路由與頁面層）
│   └── [language]/
│       └── (guest)/
│           └── page.tsx    # 直接組合 widgets
├── widgets/               # Widgets 層（組件集合）
├── features/              # Features 層（業務功能）
├── entities/              # Entities 層（業務實體）
└── shared/                # Shared 層（通用工具）
```

### 混合架構優勢
- **簡化結構**：減少不必要的抽象層級
- **開發效率**：更直接的組件組合方式
- **維護性**：保持 FSD 核心原則的同時降低複雜度
- **靈活性**：適應 Next.js App Router 的特性

---

## 📄 Next.js 頁面層（App Router）
**用途**：路由處理和頁面組件組合

在混合架構中，Next.js 的 `app/` 目錄直接承擔頁面組件的職責：

**職責**：
- 路由處理和頁面定義
- 組合 widgets 形成完整頁面
- 路由參數處理和數據獲取
- 頁面級別的 SEO 和元數據管理
- 全域 Providers 設定（在 layout.tsx 中）

**範例**：
```typescript
// app/[language]/(guest)/page.tsx
import { HeroWidget } from '@/widgets/hero';
import { FeaturesWidget } from '@/widgets/features';
import { ProjectListWidget } from '@/widgets/project-list';

export default function HomePage() {
  return (
    <main>
      <HeroWidget />
      <FeaturesWidget />
      <ProjectListWidget />
    </main>
  );
}

// app/[language]/(guest)/about/page.tsx
import { AboutHeroWidget } from '@/widgets/about-hero';
import { TeamWidget } from '@/widgets/team';

export default function AboutPage() {
  return (
    <main>
      <AboutHeroWidget />
      <TeamWidget />
    </main>
  );
}

// app/[language]/layout.tsx
import { Providers } from '@/shared/providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**優勢**：
- 直接利用 Next.js App Router 特性
- 減少抽象層級，提高開發效率
- 保持路由與頁面的直接對應關係

---

## 🧩 Widgets 層
**用途**：大型的 UI 組件集合，自包含的功能模組

```
widgets/
├── header/
│   ├── ui/           # Header UI 組件
│   ├── model/        # Header 狀態
│   ├── api/          # Header 相關 API
│   └── index.ts
├── sidebar/
├── project-card/
└── user-profile/
```

**職責**：
- 大型 UI 組件
- 組合多個 features 和 entities
- 可在多個頁面重複使用
- 自包含的業務邏輯

**範例**：
```typescript
// widgets/project-card/ui/ProjectCard.tsx
import { ProjectEntity } from '@/entities/project';
import { LikeFeature } from '@/features/like-project';
import { ShareFeature } from '@/features/share-project';

export const ProjectCard = ({ project }) => (
  <div className="project-card">
    <ProjectEntity.UI.ProjectInfo project={project} />
    <div className="actions">
      <LikeFeature.UI.LikeButton projectId={project.id} />
      <ShareFeature.UI.ShareButton project={project} />
    </div>
  </div>
);
```

---

## ⚡ Features 層
**用途**：具體的業務功能實現，用戶可執行的操作

```
features/
├── auth/
│   ├── ui/           # 登入表單、按鈕等
│   ├── model/        # 認證狀態管理
│   ├── api/          # 登入/登出 API
│   ├── lib/          # 認證工具函數
│   └── index.ts
├── search/
├── add-to-cart/
└── like-post/
```

**職責**：
- 具體業務功能
- 用戶交互操作
- 帶來業務價值的功能
- 可重複使用的功能模組

**特點**：
- 包含業務邏輯和用戶操作
- 有狀態管理
- 可以組合 entities

**範例**：
```typescript
// features/auth/ui/LoginForm.tsx
import { UserEntity } from '@/entities/user';

export const LoginForm = () => {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (data) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit" disabled={isLoading}>
        登入
      </button>
    </form>
  );
};
```

---

## 🏢 Entities 層
**用途**：業務實體的抽象，數據模型和相關 UI

```
entities/
├── user/
│   ├── ui/           # 用戶相關 UI 組件
│   ├── model/        # 用戶數據模型和狀態
│   ├── api/          # 用戶 API
│   ├── lib/          # 用戶相關工具函數
│   └── index.ts
├── project/
├── task/
└── comment/
```

**職責**：
- 業務實體抽象
- 數據模型定義
- 純展示 UI 組件
- 基礎 CRUD 操作

**特點**：
- UI 組件只負責展示，無業務邏輯
- 不包含用戶操作
- 可被 features 重複使用

**範例**：
```typescript
// entities/user/ui/UserCard.tsx
interface UserCardProps {
  user: User;
  size?: 'small' | 'medium' | 'large';
}

export const UserCard = ({ user, size = 'medium' }: UserCardProps) => (
  <div className={`user-card user-card--${size}`}>
    <img src={user.avatar} alt={user.name} />
    <h3>{user.name}</h3>
    <p>{user.email}</p>
    <span className="role">{user.role}</span>
  </div>
);
```

---

## 🔧 Shared 層
**用途**：可重複使用的通用組件、工具和應用配置

```
shared/
├── ui/              # 通用 UI 組件
│   ├── button/
│   ├── input/
│   ├── modal/
│   └── index.ts
├── lib/             # 工具函數
│   ├── utils/
│   ├── hooks/
│   └── helpers/
├── api/             # API 基礎設施
│   ├── base/
│   ├── generated/   # OpenAPI 生成的代碼
│   └── types/
├── providers/       # 全域 Providers
│   ├── QueryProvider/
│   ├── ThemeProvider/
│   └── index.tsx
├── config/          # 配置文件
├── constants/       # 常數定義
└── types/           # 全域類型定義
```

**職責**：
- 通用 UI 組件
- 工具函數和 hooks
- API 基礎設施
- 全域 Providers 和應用配置
- 配置和常數
- 全域類型定義
- 與業務邏輯無關的代碼

**範例**：
```typescript
// shared/providers/index.tsx
export const Providers = ({ children }) => (
  <QueryProvider>
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          {children}
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryProvider>
);

// shared/config/app.ts
export const appConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  environment: process.env.NODE_ENV,
  defaultLanguage: 'zh-TW',
  supportedLanguages: ['zh-TW', 'en'],
};
```

---

## Segments (段) 分類

每個 slice 內部按技術目的劃分：

### 🎨 ui/
- React 組件
- 樣式文件
- 組件的視覺表現

### 🔌 api/
- API 請求函數
- 數據獲取邏輯
- 外部服務整合

### 📊 model/
- 狀態管理 (Redux, Zustand)
- 業務邏輯
- 數據轉換

### 🛠️ lib/
- 工具函數
- 輔助函數
- 純函數邏輯

### ⚙️ config/
- 配置文件
- 環境變數
- 設定參數

### 📝 types/
- TypeScript 類型定義
- 接口定義

---

## 實際應用指南

### 🚀 OpenAPI 整合策略

#### 1. Generated API 放置位置
```
shared/api/
├── generated/        # OpenAPI 生成的代碼
│   ├── endpoints/
│   ├── models/
│   └── types/
├── base/            # API 基礎配置
│   ├── client.ts
│   └── config.ts
└── index.ts
```

#### 2. 依賴反轉策略

**核心實體**：定義領域模型
```typescript
// entities/user/model/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}
```

**簡單實體**：直接使用 generated 類型
```typescript
// entities/tag/api/tagApi.ts
export type { Tag } from '@/shared/api/generated';
```

#### 3. 映射層實作
```typescript
// entities/user/api/mappers.ts
import type { User as ApiUser } from '@/shared/api/generated';
import type { User } from '../model/types';

export const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.full_name,
  email: apiUser.email_address,
  isActive: apiUser.status === 'active',
});
```

---

## 開發規範

### ✅ 最佳實踐

1. **命名規範**
   - 使用業務語言命名 slice
   - segment 使用技術術語
   - 保持命名一致性

2. **依賴管理**
   - 嚴格遵循層級依賴規則
   - 避免循環依賴
   - 使用 index.ts 統一導出

3. **代碼組織**
   - 每個 slice 保持高內聚
   - 相關功能放在同一個 slice
   - 通用功能放在 shared 層

### ❌ 常見錯誤

1. **違反依賴規則**
   ```typescript
   // ❌ entities 不能使用 features
   import { LoginFeature } from '@/features/auth';
   
   // ✅ features 可以使用 entities
   import { UserEntity } from '@/entities/user';
   ```

2. **錯誤的層級劃分**
   ```typescript
   // ❌ 業務邏輯放在 entities
   export const UserCard = ({ user, onEdit }) => (
     <div>
       {user.name}
       <button onClick={onEdit}>編輯</button> {/* 這是 feature */}
     </div>
   );
   
   // ✅ entities 只負責展示
   export const UserCard = ({ user }) => (
     <div>{user.name}</div>
   );
   ```

3. **過度抽象**
   - 不要為了 FSD 而過度拆分
   - 簡單功能可以直接實作
   - 根據實際需求調整架構

---

## 遷移策略

### 階段一：基礎設施建立
1. **建立混合架構目錄結構**
   ```bash
   mkdir -p {widgets,features,entities,shared}
   mkdir -p shared/{ui,lib,api,config,constants,providers,types}
   ```

2. **建立 `shared` 層**
   - 遷移通用 UI 組件到 `shared/ui/`
   - 遷移工具函數到 `shared/lib/`
   - 整理 API 基礎設施到 `shared/api/`
   - 遷移全域 Providers 到 `shared/providers/`
   - 整理應用配置到 `shared/config/`

3. **設定 TypeScript 路徑別名**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/widgets/*": ["./widgets/*"],
         "@/features/*": ["./features/*"],
         "@/entities/*": ["./entities/*"],
         "@/shared/*": ["./shared/*"]
       }
     }
   }
   ```

### 階段二：實體抽象
1. **識別核心業務實體**
   - User, Project, Task, Comment 等
2. **建立 `entities` 層**
   - 定義數據模型和類型
   - 創建純展示 UI 組件
   - 實作基礎 API 函數

### 階段三：功能模組
1. **識別具體業務功能**
   - 認證登入、搜尋、按讚、分享等
2. **建立 `features` 層**
   - 實作用戶可執行的操作
   - 包含業務邏輯和狀態管理
   - 組合 entities 完成功能

### 階段四：組件組合
1. **建立 `widgets` 層**
   - 組合 features 和 entities
   - 創建大型 UI 組件集合
   - 實作可重複使用的組件模組

### 階段五：頁面整合
1. **更新 Next.js 頁面**
   - 在 `app/` 目錄中的頁面組件直接使用 widgets
   - 在 layout.tsx 中使用 shared 層的 Providers
   - 確保路由正確對應到 widgets 組合

---

## 工具和檢查

### ESLint 規則
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // 禁止向上依賴
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './shared',
            from: './',
            except: ['./shared'],
          },
          {
            target: './entities',
            from: './',
            except: ['./shared', './entities'],
          },
          {
            target: './features',
            from: './',
            except: ['./shared', './entities', './features'],
          },
          {
            target: './widgets',
            from: './',
            except: ['./shared', './entities', './features', './widgets'],
          },
          // Next.js App Router 可以使用所有 FSD 層
          {
            target: './app',
            from: './',
            except: ['./shared', './entities', './features', './widgets', './app'],
            message: 'App Router 頁面可以使用所有 FSD 層級',
          },
        ],
      },
    ],
  },
};
```

### 目錄結構檢查
```bash
# 使用 tree 命令檢查結構
tree . -I 'node_modules|.next|out' -L 2
```

---

## 總結

混合 FSD 架構的核心價值在於：

1. **清晰的職責劃分**：四個層級各司其職，職責邊界明確
2. **穩定的依賴關係**：單向依賴流，避免循環依賴
3. **高度的可重用性**：通過分層實現最大化代碼重用
4. **業務導向的組織**：按業務領域組織代碼，易於理解和維護
5. **可預測的架構**：團隊成員可以快速定位和修改代碼
6. **漸進式遷移**：可以階段性地實施，降低遷移風險

### 混合 FSD 架構的優勢

- **簡化結構**：減少不必要的抽象層級，提高開發效率
- **Next.js 整合**：充分利用 Next.js App Router 的特性和優勢
- **靈活性**：適合中大型專案的快速迭代需求
- **維護性**：保持 FSD 核心原則的同時降低學習成本
- **測試友好**：分層結構便於單元測試和集成測試

### 實施建議

1. **循序漸進**：按照五個階段逐步實施，避免一次性重構
2. **團隊培訓**：確保所有開發者理解混合架構原則
3. **工具支持**：配置 ESLint 規則強制執行架構約束
4. **持續改進**：根據實際使用情況調整和優化架構

### 混合架構適用場景

- **中大型 Next.js 專案**：需要清晰架構但不希望過度抽象
- **快速迭代項目**：需要在架構約束和開發效率間取得平衡
- **多團隊協作**：需要統一的代碼組織標準
- **長期維護項目**：需要可持續發展的架構設計

記住，混合 FSD 架構是在保持 FSD 核心原則的基礎上，結合 Next.js 特性的實用性選擇。根據專案規模和團隊情況，靈活應用這些原則，確保架構為業務服務，而不是成為開發負擔。
