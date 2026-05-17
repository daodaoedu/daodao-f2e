# Spec: 實踐詳情頁 X 按鈕返回路徑

**Issue**: daodao-f2e #649
**Scope**: XS
**Type**: Bug Fix

## Problem

從「靈感」（Showcase/廣場）頁面點選主題實踐，進入實踐詳情頁後，
按下 X 按鈕應回到靈感頁的原來位置，但目前硬編碼為 `/?tab=mine`（「我的」分頁）。

## Root Cause

`apps/product/src/app/[locale]/practices/[id]/page.tsx` 中，
X 按鈕的點擊行為為：

```tsx
onClick={() => router.replace("/?tab=mine")}
```

這個路徑是硬編碼的，不論使用者從哪個頁面進入，都只會回到「我的」分頁。

## Proposed Fix

### 方案：`from` Query Parameter

在從靈感/廣場頁面（或任何其他 tab）導航到實踐詳情頁時，
附加 `?from=<origin>` 參數，詳情頁讀取此參數決定返回路徑。

**導航來源 mapping：**
| 來源頁面 | from 值 | 返回路徑 |
|---------|---------|---------|
| 靈感/廣場（showcase） | `showcase` | `/?tab=showcase` |
| 我的（mine） | `mine` | `/?tab=mine` |
| 其他/未指定 | `mine`（預設） | `/?tab=mine` |

**Practice Detail Page 改動：**

```tsx
// apps/product/src/app/[locale]/practices/[id]/page.tsx
const searchParams = useSearchParams();
const from = searchParams.get("from") ?? "mine";
const backPath = from === "showcase" ? "/?tab=showcase" : "/?tab=mine";

// X 按鈕
onClick={() => router.replace(backPath)
```

**Showcase/靈感頁面改動：**

找到導向 `/practices/:id` 的連結或 `router.push` 呼叫，
加入 `?from=showcase` 參數。

## Files to Change

1. `apps/product/src/app/[locale]/practices/[id]/page.tsx`
   - 引入 `useSearchParams`
   - 讀取 `from` param，決定 `backPath`
   - 3 處 X 按鈕的 `router.replace("/?tab=mine")` 改為 `router.replace(backPath)`

2. 從靈感/廣場頁連結到實踐詳情頁時，加入 `?from=showcase`
   - 位置需確認：`apps/product/src/components/showcase/` 或
     `apps/product/src/app/[locale]/(with-layout)/page.tsx` 中的連結

## Acceptance Criteria

- 從靈感頁（showcase tab）進入實踐詳情，按 X 回到 `/?tab=showcase`
- 從我的頁面（mine tab）進入實踐詳情，按 X 回到 `/?tab=mine`
- 未帶 `from` 參數時，預設返回 `/?tab=mine`（向後相容）
