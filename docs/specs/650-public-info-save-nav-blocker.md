# Spec: 「公開資訊設定」儲存後仍顯示未儲存提醒

**Issue**: daodao-f2e #650
**Scope**: XS
**Type**: Bug Fix

## Problem

使用者在「公開資訊設定」頁面編輯資料並成功儲存後（顯示「公開資訊設定已更新」toast），
按下右上角的 X（關閉）按鈕時，仍然跳出「尚未儲存你的資料」確認對話框。

## Root Cause Analysis

`PublicInfoForm` (`apps/product/src/components/settings/public-info/public-info-form.tsx`)
在 `handleSubmit` 成功後呼叫：

```ts
form.reset(form.getValues()); // 重置 dirty 狀態
setAvatarFile(null);
await mutate(["/api/v1/users/me"] as const);
```

`mutate()` 觸發 SWR 重新抓取 `/api/v1/users/me`，當新資料回來後，
`useEffect([userData, citiesData, form.reset])` 會再次執行 `form.reset({ ...serverData })`。

若伺服器回傳的值與表單提交值有任何細微差異（字串 normalize、預設值填入等），
React Hook Form 的 `isDirty` 狀態可能在第二次 `reset` 後短暫變為 `true`，
進而觸發 `useNavigationBlockerEffect(form.formState.isDirty)` 將 blocker 重新設為 `true`。

次要原因：`avatarFile !== null` 未包含在 blocker 條件中，
但這不影響「儲存後仍警告」的核心問題。

## Proposed Fix

### 方案 A（推薦）：`isSavedSuccessfully` flag

在 `PublicInfoForm` 新增 `useState<boolean>` `isSavedSuccessfully`，
儲存成功時設為 `true`；任何表單欄位或 avatar 發生變動時重置為 `false`。

Navigation blocker 條件改為：
```ts
useNavigationBlockerEffect(
  (form.formState.isDirty || avatarFile !== null) && !isSavedSuccessfully
);
```

這樣即使 SWR 重新載入資料導致暫時性的 isDirty，blocker 也不會跳出。

### 方案 B：直接清除 blocker

儲存成功後透過 `useNavigationBlocker()` 的 `setIsBlocked(false)` 強制清除，
不依賴 form state 反應，但需 import NavigationBlocker context。

方案 A 更符合現有架構（保持 single source of truth 在 form state）。

## Files to Change

- `apps/product/src/components/settings/public-info/public-info-form.tsx`
  - 新增 `isSavedSuccessfully` state
  - 儲存成功後設 `isSavedSuccessfully = true`
  - 任何 field change / avatar change 時重置 `isSavedSuccessfully = false`
  - 調整 `useNavigationBlockerEffect` 條件

## Acceptance Criteria

- 成功儲存並顯示「公開資訊設定已更新」後，按 X 不再跳出未儲存提醒
- 未儲存時按 X 仍正常跳出提醒
- 儲存後再修改欄位，再按 X 仍會跳出提醒
