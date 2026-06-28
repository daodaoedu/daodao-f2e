# PLAN.md — Issue #738 人物誌題目修正

## 問題描述
選擇題 (choice type) 中，當使用者選擇「其他」選項後，缺少 free text box 供填寫自訂答案。

## 影響範圍 (S 級別，≤ 5 檔案)
| 檔案 | 類型 |
|---|---|
| `apps/product/src/components/persona/other-option-utils.ts` | 新建 — 可測試的純邏輯函式 |
| `apps/product/src/components/persona/__tests__/other-option.test.ts` | 新建 — 單元測試 |
| `apps/product/src/components/persona/persona-profile-me.tsx` | 修改 — `InlineAnswerForm` |
| `apps/product/src/app/[locale]/persona/[id]/page.tsx` | 修改 — `InlineFlipCard` |
| `PLAN.md` | 本檔案 |

## 實作策略

### 核心邏輯（抽成 util 利於測試）
```typescript
export const OTHER_OPTION_VALUE = "其他";

export function isOtherOption(value: string): boolean {
  return value === OTHER_OPTION_VALUE;
}

export function buildPersonaAnswerBody(
  questionId: number,
  isChoice: boolean,
  selectedValue: string,
  textAnswer: string,
  otherText: string
) {
  if (!isChoice) return { questionId, textAnswer: textAnswer.trim() || undefined };
  if (isOtherOption(selectedValue)) return { questionId, textAnswer: otherText.trim() || undefined };
  return { questionId, selectedValue: selectedValue || undefined };
}
```

### InlineAnswerForm（persona-profile-me.tsx）
1. 新增 `otherText` state
2. 計算 `isOtherSelected = isChoice && selectedValue === OTHER_OPTION_VALUE`
3. 選項按鈕 onClick：切換選項時若不是「其他」則清空 `otherText`
4. 當 `isOtherSelected` 顯示 `<Textarea>` 在選項下方
5. Submit 按鈕 disabled：`!selectedValue || (isOtherSelected && !otherText.trim())`
6. handleSubmit：使用 `buildPersonaAnswerBody()`

### InlineFlipCard（persona/[id]/page.tsx）
1. 新增 `otherText` state、`isOtherSelected` 計算值
2. 在 Back panel choice 列表後，若 `isOtherSelected` 顯示 `<textarea>`
3. Submit button：`isOtherSelected ? onSubmit(otherText.trim(), false) : onSubmit(selected, true)`
4. disabled：`!selected || (isOtherSelected && !otherText.trim())`

## TDD 流程
1. ✅ 先寫 `other-option.test.ts`（5 個測試案例覆蓋 body builder 邏輯）
2. ✅ 執行 → 確認 FAIL（util 尚未存在）
3. ✅ 實作 `other-option-utils.ts` → 測試通過
4. ✅ 修改元件使用 util

## 驗收條件
- 選擇「其他」後出現 Textarea
- Textarea 為空時 Submit 按鈕 disabled
- 送出時傳送 `textAnswer`（自訂文字）而非 `selectedValue: "其他"`
- 選其他選項時 Textarea 消失且 otherText 清空
