# Spec: 打卡紀錄頁 X 按鈕返回路徑

**Issue**: daodao-f2e #648
**Scope**: XS
**Type**: Bug Fix

## Problem

從「靈感」頁面 → 實踐詳情頁 → 打卡紀錄頁，按 X 後應回到靈感頁的原始位置，
但目前打卡紀錄頁的 X 硬編碼為 `rightActionTo={practiceDetailPath}`（實踐詳情頁），
使用者按 X 只能回到實踐詳情，再按一次 X 才回到「我的」分頁（而非靈感頁）。

## Root Cause

`apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx`
中三處 `PageHeader` 都使用：

```tsx
rightActionTo={practiceDetailPath}
```

其中 `practiceDetailPath = `/practices/${practiceId}``，
沒有傳遞原始來源資訊，也沒有 `from` 參數。

## Proposed Fix

### 方案：傳遞 `from` 參數到打卡紀錄頁

打卡紀錄頁讀取 URL 的 `from` 參數，並在 X 按鈕中帶回給實踐詳情頁。

**導航路徑設計：**
```
靈感頁 /?tab=showcase
  → /practices/:id?from=showcase          (實踐詳情)
    → /practices/:id/check-ins/:cid?from=showcase  (打卡紀錄)
      → 按 X → /practices/:id?from=showcase         (回實踐詳情)
        → 按 X → /?tab=showcase                      (回靈感頁)
```

**打卡紀錄頁改動（`check-ins/[checkInId]/page.tsx`）：**

```tsx
const searchParams = useSearchParams();
const from = searchParams.get("from") ?? "mine";
// practiceDetailPath 加上 from 參數
const practiceDetailPath = `/practices/${practiceId}?from=${from}`;
```

三處 `PageHeader` 的 `rightActionTo` 繼續使用 `practiceDetailPath`，
但因為 `practiceDetailPath` 現在包含 `from` 參數，實踐詳情頁也會正確返回。

**`CheckInDateSelector` 的 `closeActionTo` 也需同步更新：**

```tsx
closeActionTo={practiceDetailPath}
```

## Files to Change

1. `apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx`
   - 引入 `useSearchParams`
   - 讀取 `from` param
   - 更新 `practiceDetailPath` 包含 `from` 參數

2. `apps/product/src/app/[locale]/practices/[id]/page.tsx`
   （此與 issue #649 共享改動）
   - 讀取 `from` param，決定 X 按鈕返回路徑

## Dependency

此 issue 的完整修復依賴 #649 的改動（實踐詳情頁讀取 `from` param）。
兩個 issue 的 code PR 可合併為同一個 PR，或確保 #649 先合併。

## Acceptance Criteria

- 靈感頁 → 實踐詳情 → 打卡紀錄，按 X 回到實踐詳情（with `?from=showcase`）
- 再按 X 回到 `/?tab=showcase`（靈感頁）
- 我的頁面 → 實踐詳情 → 打卡紀錄，按 X 返回路徑仍維持現有行為（`/?tab=mine`）
