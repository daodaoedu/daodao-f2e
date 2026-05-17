# Spec: 我的小島網址使用者 ID 顯示（前端）

Issue: daodaoedu/daodao-f2e#658  
Scope: M  
Date: 2026-05-17  
Depends on: daodaoedu/daodao-server#234

---

## 1. 問題描述

使用者已設定自訂 ID（`custom_id`），但從 Feed / 打卡卡片點擊跳轉到「別人的小島」時，URL 使用的是 UUID 而非 customId。只有「自己的小島」才正確帶入 customId。

### 1.1 重現路徑

1. 使用者 A 設定 `customId = "alice"`
2. 使用者 B 在 Feed 頁看到 A 的打卡/實踐卡片
3. 點擊 A 的頭像或名稱 → 跳轉到 `/users/<uuid>` 而非 `/users/alice`

### 1.2 根本原因（前端）

多個卡片元件定義了 `getUserIslandHref` helper，但在 JSX 的 `<Link>` 中未使用該 helper，硬編碼 `user.id`（UUID）：

| 元件 | 問題行 | 說明 |
|------|--------|------|
| `PracticeShowcaseCard.tsx` | line 256 | `<Link href={/users/${user.id}>` 未使用第 62 行的 `getUserIslandHref` helper |
| `BrewingCard.tsx` | line 247 | `<Link href={/users/${user.id}>` 未使用第 56 行的 `getUserIslandHref` helper |
| `practice-overview-card.tsx` | lines 47, 56 | `<Link href={/users/${creator.id}>` 無 customId fallback |
| `browse-activity-content.tsx` | lines 54, 71 | `<Link href={/users/${follower.id}>` 無 customId fallback |

此外，`/users/[identifier]/page.tsx` 目前在以 UUID 訪問時不會重導到 customId URL，影響 SEO。

### 1.3 資料層依賴

目前 practice/check-in API 回傳的嵌入 user 物件缺少 `customId` 欄位（server-side 修復由 daodaoedu/daodao-server#234 處理）。Profile API（`/api/v1/users/profile/:identifier`）已回傳 `customId` ✅，但缺少 `canonical` 欄位（同樣由 server#234 處理）。

---

## 2. 解決方案

### 2.1 修正卡片元件的 Link href

**統一 Pattern：** 所有使用者 avatar / 名稱連結應使用 `user.customId || user.id` 作為 identifier。

#### 2.1.1 `PracticeShowcaseCard.tsx`

將 `line 256` 的 `<Link href={/users/${user.id}>` 改為使用已有的 `getUserIslandHref(user)` helper，同時在 props 型別加入 `customId`：

```tsx
// Before
<Link href={`/users/${user.id}`} prefetch className="shrink-0">

// After
<Link href={getUserIslandHref(user) ?? `/users/${user.id}`} prefetch className="shrink-0">
```

> Note: `ShowcaseCommentUser`（或對應的 user prop 型別）需加入 `customId?: string | null`，否則 helper 永遠回傳 UUID。

#### 2.1.2 `BrewingCard.tsx`

將 `line 247` 的 `<Link href={/users/${user.id}>` 改為使用已有的 `getUserIslandHref(user)` helper：

```tsx
// Before
<Link href={`/users/${user.id}`} className="shrink-0">

// After
<Link href={getUserIslandHref(user) ?? `/users/${user.id}`} className="shrink-0">
```

#### 2.1.3 `practice-overview-card.tsx`

現有介面為 `CreatorInfo`，在其中加入 `customId` 型別定義，並修正 links：

```tsx
// Type 更新
interface CreatorInfo {
  id: string;
  name: string;
  photoURL: string | null;
  roleList?: string[];
  customId?: string | null;  // 新增
}

// href 更新（lines 47 & 56）
href={`/users/${creator.customId || creator.id}`}
```

#### 2.1.4 `browse-activity-content.tsx`

`follower` 物件型別加入 `customId`，修正 links（lines 54 & 71）：

```tsx
href={`/users/${follower.customId || follower.id}`}
```

### 2.2 User Profile Page 加入 canonical redirect

在 `/users/[identifier]/page.tsx` 的 Server Component 中，從 profile API 讀取 `canonical` 欄位，若 `canonical !== identifier` 則執行 `permanentRedirect`：

```tsx
import { permanentRedirect } from 'next/navigation';

// profileData = profileResponse?.data（已解開 UserProfileResponse.data）
// 在 UserProfilePage 的 profileData 取得後直接存取 canonical
if (profileData?.canonical && profileData.canonical !== identifier) {
  permanentRedirect(`/${locale}/users/${profileData.canonical}`);
}
```

> **Note:** 此功能依賴 server#234 在 `getUserProfile` response 加入 `canonical` 欄位後才能運作。

### 2.3 API 型別更新

`packages/api/src/services/user.ts` 中：

1. `UserProfileData` interface 加入 `canonical` 欄位（供 redirect 邏輯使用）：

```typescript
export interface UserProfileData {
  // ... existing fields
  canonical?: string | null;  // 新增（server#234 後才有）
}
```

2. Practice/CheckIn user embed 型別加入 `customId`：

```typescript
// Practice user embed type（加在對應的 PracticeUser 或 inline type）
customId?: string | null;  // 新增（server#234 後才有）
```

---

## 3. 影響範圍

### 3.1 需修改的檔案

| 檔案 | 變更說明 |
|------|----------|
| `apps/product/src/components/showcase/PracticeShowcaseCard.tsx` | line 256 改用 `getUserIslandHref` helper，user 型別加入 `customId` |
| `apps/product/src/components/showcase/BrewingCard.tsx` | line 247 改用 `getUserIslandHref` helper |
| `apps/product/src/components/practice/shared/practice-overview-card.tsx` | 加入 `customId` 型別，lines 47/56 改用 `customId \|\| id` |
| `apps/product/src/components/practice/shared/browse-activity-content.tsx` | lines 54/71 改用 `customId \|\| id` |
| `apps/product/src/app/[locale]/(with-layout)/users/[identifier]/page.tsx` | 加入 canonical redirect 邏輯 |
| `packages/api/src/services/user.ts` | `UserProfileData` 加入 `canonical`；Practice user embed 型別加入 `customId` |

### 3.2 不變動的部分

- `CheckInShowcaseCard.tsx`：已正確使用 `user.customId || user.custom_id || user.id`
- `check-in-detail.tsx`：已正確使用 `customId`
- 任何 API endpoint 實作（server-side 修復在 server#234）

---

## 4. 測試計畫

- [ ] 從 Feed 點擊有 customId 的使用者頭像 → URL 使用 customId（非 UUID）
- [ ] 從 Feed 點擊無 customId 的使用者頭像 → URL 使用 UUID（fallback 正確）
- [ ] 直接訪問 `/users/<uuid>`（使用者有 customId）→ 301 redirect 到 `/users/<customId>`
- [ ] 直接訪問 `/users/<customId>` → 不重導，正常顯示
- [ ] PracticeShowcaseCard / BrewingCard / practice-overview-card / browse-activity-content 全部使用正確 identifier

---

## 5. Acceptance Criteria

- [ ] 所有卡片元件中的使用者連結使用 `customId || id`
- [ ] UUID 訪問有 customId 的使用者頁面時，301 redirect 到 customId URL
- [ ] TypeScript 型別正確反映 `customId?: string | null`
- [ ] 現有測試不受影響
