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
儲存成功時設為 `true`；使用者**主動互動**（欄位 onChange、avatar 檔案選擇）時重置為 `false`。

Navigation blocker 條件改為：
```ts
useNavigationBlockerEffect(
  (form.formState.isDirty || avatarFile !== null) && !isSavedSuccessfully
);
```

這樣即使 SWR 重新載入資料導致暫時性的 isDirty，blocker 也不會跳出。

**⚠️ 實作注意（Gemini review 指出）：**
`isSavedSuccessfully = false` 的重置邏輯**不可**透過監聽 `isDirty` 或 `watch` 來達成，
因為 `form.reset()` 本身（儲存成功後的程式呼叫、SWR 觸發的再次 reset）也會改變 watch/dirty 狀態，
這會使 flag 立即被重置，導致修正失效。

**正確做法：** 只透過明確的 `onChange` handler 重置 flag：

```ts
// 僅在使用者主動改變欄位時重置
const handleFieldChange = () => setIsSavedSuccessfully(false);

// 套用到每個 FormField 的 onChange，或使用 form.watch() 搭配 useEffect
// 但 useEffect 監聽 watch 會誤觸發，改用 RHF 的 formState.submitCount 判斷：
// 若 submitCount 未增加但 isDirty 變 true → 使用者主動編輯
```

**更簡潔的實作方式：** 直接在 form 的 `onChange` 事件層級重置：
```tsx
<Form {...form}>
  <form
    onChange={() => setIsSavedSuccessfully(false)}
    onSubmit={form.handleSubmit(handleSubmit)}
  >
```
HTML `<form>` 的 `onChange` 事件只由使用者互動觸發，不受 `form.reset()` 呼叫影響。

### 方案 B：直接清除 blocker

儲存成功後透過 `useNavigationBlocker()` 的 `setIsBlocked(false)` 強制清除，
不依賴 form state 反應，但需 import NavigationBlocker context。

方案 A（使用 `<form onChange>` 觸發重置）更符合現有架構且實作較簡潔。

## Files to Change

- `apps/product/src/components/settings/public-info/public-info-form.tsx`
  - 新增 `isSavedSuccessfully` state
  - 儲存成功後設 `isSavedSuccessfully = true`
  - 在 `<form>` 元素加入 `onChange={() => setIsSavedSuccessfully(false)}`（HTML 原生事件，僅使用者互動觸發）
  - 調整 `useNavigationBlockerEffect` 條件

## Acceptance Criteria

- 成功儲存並顯示「公開資訊設定已更新」後，按 X 不再跳出未儲存提醒
- 未儲存時按 X 仍正常跳出提醒
- 儲存後再修改欄位，再按 X 仍會跳出提醒
