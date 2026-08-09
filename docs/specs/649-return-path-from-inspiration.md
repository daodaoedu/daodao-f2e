# Spec: 實踐詳情頁 X 按鈕返回路徑

**Issue**: daodao-f2e #649
**Scope**: XS
**Type**: Bug Fix

## Problem

從「靈感」頁面點選主題實踐，進入實踐詳情頁後，
按下 X 按鈕應回到靈感頁的原來位置，但目前硬編碼為 `/?tab=mine`（「我的」分頁）。

## Root Cause

`apps/product/src/app/[locale]/practices/[id]/page.tsx` 中，
X 按鈕的點擊行為為：

```tsx
onClick={() => router.replace("/?tab=mine")}
```

這個路徑是硬編碼的，不論使用者從哪個頁面進入，都只會回到「我的」分頁。

## Tab 命名確認

Home page 的兩個分頁（`apps/product/src/app/[locale]/(with-layout)/page.tsx`）：
- 靈感分頁：TabType = `"inspire"`（預設，URL 不帶 `tab` 參數）
- 我的分頁：TabType = `"mine"`（URL 為 `/?tab=mine`）

## Proposed Fix

### 方案：`from` Query Parameter

在從靈感頁導航到實踐詳情頁時，附加 `?from=inspire` 參數，
詳情頁讀取此參數決定返回路徑。

**導航來源 mapping：**
| 來源頁面 | from 值 | 返回路徑 |
|---------|---------|---------|
| 靈感（inspire tab） | `inspire` | `/`（inspire 為預設 tab，不帶 tab 參數） |
| 我的（mine tab） | `mine` | `/?tab=mine` |
| 其他/未指定 | `mine`（預設） | `/?tab=mine` |

**Practice Detail Page 改動：**

```tsx
// apps/product/src/app/[locale]/practices/[id]/page.tsx
const searchParams = useSearchParams();
const from = searchParams.get("from") ?? "mine";
const backPath = from === "inspire" ? "/" : "/?tab=mine";

// X 按鈕（3 處）
onClick={() => router.replace(backPath)
```

**靈感頁 PracticeShowcaseCard 改動：**

`apps/product/src/components/showcase/PracticeShowcaseCard.tsx` line 170：
```tsx
// 原本
onClick={() => router.push(`/practices/${id}`)}

// 改為
onClick={() => router.push(`/practices/${id}?from=inspire`)}
```

並同步更新 line 311 的連結（`href={`/practices/${id}?tab=comments``）也帶上 `from=inspire`。

## Files to Change

1. `apps/product/src/app/[locale]/practices/[id]/page.tsx`
   - 引入 `useSearchParams`
   - 讀取 `from` param，決定 `backPath`
   - 3 處 X 按鈕的 `router.replace("/?tab=mine")` 改為 `router.replace(backPath)`

2. `apps/product/src/components/showcase/PracticeShowcaseCard.tsx`
   - 導向 `/practices/:id` 時加入 `?from=inspire`

## Acceptance Criteria

- 從靈感頁（inspire tab）進入實踐詳情，按 X 回到 `/`（靈感頁預設路徑）
- 從我的頁面（mine tab）進入實踐詳情，按 X 回到 `/?tab=mine`
- 未帶 `from` 參數時，預設返回 `/?tab=mine`（向後相容）
