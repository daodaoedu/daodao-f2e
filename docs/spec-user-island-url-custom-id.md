# Spec: 我的小島網址使用者 ID 顯示（Frontend）

Issue: daodaoedu/daodao-f2e#654  
Scope: M  
Date: 2026-05-16

---

## 1. 問題描述

使用者已設定自訂 ID，但從 Feed / 廣場瀏覽「別人的小島」時，網址顯示的是 UUID（`external_id`）而非自訂 ID。只有點擊自己的小島（從 sidebar）才正確顯示自訂 ID。

**期望行為：** 每個使用者的小島網址一律以其自訂 ID 結尾（`/users/<customId>`）。若使用者未設定自訂 ID，才退而使用 UUID。

---

## 2. 根本原因分析（Frontend）

### 2.1 PracticeShowcaseCard — user prop 不含 `customId`

```tsx
// apps/product/src/components/showcase/PracticeShowcaseCard.tsx
interface PracticeShowcaseCardProps {
  user?: {
    id: string;
    name: string;
    photoUrl?: string | null;
    // ❌ 缺少 customId
  };
}

// 連結生成
<Link href={`/users/${user.id}`} ...>  // ❌ 直接使用 UUID
```

### 2.2 Feed 頁面 adapter — 未傳遞 `customId`

Feed 頁從 `IShowcasePractice`（AI backend 回傳，含 `customId`）映射到 `PracticeShowcaseCardProps` 時，沒有帶入 `customId`。

### 2.3 ContributorInfo — 使用舊路徑且不含 `customId`

```tsx
// apps/product/src/components/resource/contributor-info.tsx
function getUserProfileBasePath(user: UserInfo): string {
  return `/user/${user.id}`;  // ❌ 舊路徑 /user/ 且無 customId
}
```

### 2.4 Profile page — UUID 訪問無 canonical redirect

`/users/[identifier]/page.tsx` 以 UUID 訪問時，即使後端 profile API 回傳了 `canonical`（customId），頁面不會 redirect 到 `/users/<customId>`。

---

## 3. 解決方案

### 3.1 PracticeShowcaseCard — 加入 `customId` 至 user prop

```tsx
// 修改 prop type
interface PracticeShowcaseCardProps {
  user?: {
    id: string;
    name: string;
    photoUrl?: string | null;
    customId?: string | null;  // 新增
  };
}

// 修改連結生成（與 CheckInShowcaseCard 一致）
function getUserIslandHref(user?: { id?: string; customId?: string | null } | null) {
  const identifier = user?.customId || user?.id;
  return identifier ? `/users/${identifier}` : null;
}

// 應用
const userIslandHref = getUserIslandHref(user);
// ...
{user && userIslandHref ? (
  <Link href={userIslandHref} ...>
    <Avatar ...> ... </Avatar>
  </Link>
) : (
  <Avatar ...> ... </Avatar>
)}
```

### 3.2 Feed 頁面 adapter — 傳遞 `customId`

找到 Feed page 中將 `IShowcasePractice` 映射到 `PracticeShowcaseCardProps` 的 adapter，補上 `customId`：

```tsx
// 對應的 adapter（根據 FeedPage 中的映射邏輯）
<PracticeShowcaseCard
  id={practice.id}
  title={practice.title}
  status={practice.status}
  user={practice.user ? {
    id: practice.user.id,
    name: practice.user.name,
    photoUrl: practice.user.photo_url,
    customId: practice.user.customId ?? practice.user.custom_id ?? null,  // 新增
  } : undefined}
  // ... other props
/>
```

> 注意：需等後端（daodao-server#232 + daodao-ai-backend）回傳 `customId`/`custom_id` 後才完全生效。前端先補型別，後端補資料。

### 3.3 ContributorInfo — 修正路徑並加入 `customId`

```tsx
// apps/product/src/components/resource/contributor-info.tsx

interface UserInfo {
  id: string;
  name: string;
  photoURL?: string | null;
  customId?: string | null;  // 新增
  educationStage?: string | null;
  roleList?: string[];
  tagList?: string[];
  selfIntroduction?: string | null;
}

function getUserProfileBasePath(user: UserInfo): string {
  const identifier = user.customId || user.id;
  return `/users/${identifier}`;  // 修正路徑：/user/ → /users/，使用 customId
}
```

### 3.4 Profile page — canonical redirect

```tsx
// apps/product/src/app/[locale]/(with-layout)/users/[identifier]/page.tsx

export default async function UserProfilePage({
  params,
}: PageProps<"/[locale]/users/[identifier]">) {
  const { identifier, locale } = await params;

  const [userResponse, profileResponse, currentUserResponse] = await Promise.all([
    getCachedUserByIdentifier(identifier),
    getCachedUserProfile(identifier),
    getCachedCurrentUser(),
  ]);

  if (!userResponse.data || !userResponse.response.ok) {
    notFound();
  }

  // 新增：canonical redirect
  // 若以 UUID 訪問且使用者有 customId，則 redirect 到 customId URL
  const canonical = profileResponse?.data?.customId;
  if (canonical && canonical !== identifier) {
    redirect(`/${locale}/users/${canonical}`);
  }

  // ... 其餘邏輯不變
}
```

> 使用 Next.js `redirect()` 做 server-side 302 redirect，不需要 client-side router.replace。

---

## 4. 影響範圍

### 4.1 需修改的檔案

| 檔案 | 變更說明 |
|------|----------|
| `apps/product/src/components/showcase/PracticeShowcaseCard.tsx` | user prop 加 `customId`，連結改用 `getUserIslandHref` |
| `apps/product/src/components/resource/contributor-info.tsx` | 修正路徑 `/user/` → `/users/`，加入 `customId` |
| `apps/product/src/app/[locale]/(with-layout)/users/[identifier]/page.tsx` | 加入 canonical redirect 邏輯 |
| 含有 Feed/Showcase adapter 的 page 元件 | 傳遞 `customId` 給 `PracticeShowcaseCard` |

### 4.2 不變動的部分

- `CheckInShowcaseCard.tsx`：已正確使用 `getUserIslandHref()`，不需修改
- `Sidebar`：已正確使用 `currentUserData.customId ?? authUser.id`，不需修改
- i18n 鍵值：無需新增
- API service layer：無需修改（`getUserProfileByIdentifier` 已含 `customId`）

---

## 5. 依賴關係

- **daodao-server#232** 需先或同步完成，以確保 practices API 回傳 `customId`
- **daodao-ai-backend**（未追蹤 issue）：feed API 的 practice/checkin user 物件需包含 `custom_id`

---

## 6. 測試計畫

### 6.1 Unit Tests（packages/api）

- [ ] `getUserIslandHref()` — 有 `customId` 時回傳 `/users/<customId>`
- [ ] `getUserIslandHref()` — 無 `customId` 時回傳 `/users/<id>`
- [ ] `getUserIslandHref()` — user 為 null 時回傳 null
- [ ] `ContributorInfo` — `getUserProfileBasePath` 有 `customId` 時使用 customId

### 6.2 Integration / E2E

- [ ] Feed 頁點擊他人打卡卡片頭像 → URL 為 `/users/<customId>`
- [ ] Feed 頁點擊他人實踐卡片頭像 → URL 為 `/users/<customId>`
- [ ] 直接訪問 `/users/<uuid>` → 若使用者有 customId 則 redirect 到 `/users/<customId>`
- [ ] 直接訪問 `/users/<customId>` → 正常顯示，不 redirect
- [ ] 無 customId 的使用者 → URL 使用 UUID，不 redirect

---

## 7. Acceptance Criteria

- [ ] 從 Feed 點擊任何使用者頭像/名稱，皆前往 `/users/<customId>`（若有設定）
- [ ] 直接訪問 `/users/<uuid>` 且使用者有 customId → server-side redirect 到 `/users/<customId>`
- [ ] `ContributorInfo` 連結正確使用 `/users/<customId>`
- [ ] 無 customId 的使用者行為不受影響（退回 UUID）
