# Spec: 打卡紀錄頁 X 按鈕返回路徑

**Issue**: daodao-f2e #648
**Scope**: XS
**Type**: Bug Fix

## Problem

從「靈感」頁面 → 實踐詳情頁 → 打卡紀錄頁，按 X 後應回到靈感頁的原始位置，
但目前打卡紀錄頁的 X 硬編碼為 `rightActionTo={practiceDetailPath}`（實踐詳情頁），
使用者按 X 只能回到實踐詳情，再按一次 X 才回到「我的」分頁（而非靈感頁）。

## Tab 命名確認

Home page 的兩個分頁（`apps/product/src/app/[locale]/(with-layout)/page.tsx`）：
- 靈感分頁：TabType = `"inspire"`（預設，URL 為 `/`，不帶 `tab` 參數）
- 我的分頁：TabType = `"mine"`（URL 為 `/?tab=mine`）

## Root Cause

`apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx`
中三處 `PageHeader` 都使用 `rightActionTo={practiceDetailPath}`，
其中 `practiceDetailPath = `/practices/${practiceId}``，沒有傳遞 `from` 來源資訊。

## Proposed Fix

### 方案：沿整條 URL 傳遞 `from` 參數

**導航路徑設計：**
```
靈感頁 /
  → /practices/:id?from=inspire          (實踐詳情)
    → /practices/:id/check-ins/:cid?from=inspire  (打卡紀錄)
      → 按 X → /practices/:id?from=inspire         (回實踐詳情)
        → 按 X → /                                  (回靈感頁)
```

**打卡紀錄頁改動（`check-ins/[checkInId]/page.tsx`）：**

```tsx
const searchParams = useSearchParams();
const from = searchParams.get("from") ?? "mine";
const practiceDetailPath = `/practices/${practiceId}?from=${from}`;
```

三處 `PageHeader` 的 `rightActionTo` 繼續使用 `practiceDetailPath`（已含 `from`）。

## Files to Change

1. `apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx`
   - 引入 `useSearchParams`，讀取 `from` param（預設 `"mine"`）
   - 更新 `practiceDetailPath` 包含 `from` 參數
   - 確保 `CheckInDateSelector` 與 `SameDayCheckInNav` 切換記錄時保留 `from`（見下）

2. `apps/product/src/app/[locale]/practices/[id]/page.tsx`（與 #649 共享）
   - 讀取 `from` param，決定 X 按鈕返回路徑（`/` 或 `/?tab=mine`）
   - 從此頁導航到打卡紀錄頁時傳遞 `from`（`PracticeDetailShell` 中的打卡紀錄連結）

3. `apps/product/src/components/check-in/date-selector/mobile.tsx` 和 `desktop.tsx`
   （⚠️ Gemini：切換日期時需保留 `from`）
   - 新增 `from` prop
   - 切換日期的 `router.push` 改為帶 `?from=${from}`：
     ```ts
     router.push(`/practices/${practiceId}/check-ins/${id}?from=${from}`)
     ```

4. `apps/product/src/components/check-in/display/same-day-check-in-nav.tsx`
   （⚠️ Gemini：同日切換時需保留 `from`）
   - 新增 `from` prop
   - 前後切換的 `router.push` 帶 `?from=${from}`

## Dependency

此 issue 完整修復依賴 #649（實踐詳情頁讀取 `from` param）。
建議合併為同一個 code PR。

## Acceptance Criteria

- 靈感頁 → 實踐詳情 → 打卡紀錄：按 X 回實踐詳情（with `?from=inspire`），再按 X 回 `/`
- 切換日期或同日打卡紀錄後，`from` 參數保持不變，X 按鈕仍能正確返回
- 我的頁面流程：返回路徑維持現有行為（`/?tab=mine`）
