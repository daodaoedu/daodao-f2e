# Spec: Onboarding Email 寄送 (#706)

## 問題描述

Onboarding 流程的 email 寄送邏輯不符合 FRD 規範，寄送順序與內容需對齊設計文件。

> 參考文件：
> - FRD: https://docs.google.com/document/d/1XfAZGNDR460cbv3pz5DtPuDai1rYmdR3skE0UnkDgQQ/edit?tab=t.bs3w6zmrowel
> - Email 內容: https://docs.google.com/document/d/1liAumCfY6DokMehuO_JtSBmEB-TqYqljnyPKPkLyNE4/edit?tab=t.0

## 現有 Email 基礎設施

後端已有以下 email 類型：
- `welcome` - 歡迎信（`/api/v1/email/welcome`）
- `verification` - Email 驗證（`/api/v1/email/verification`）
- `marathon` - 馬拉松活動（`/api/v1/email/marathon`）
- `custom` - 自訂郵件（`/api/v1/email/custom`）

## 技術規格

### 1. Onboarding Email 寄送時機

根據 FRD，以下事件應觸發 email：

| 事件 | Email 類型 | 時機 |
|------|-----------|------|
| 用戶完成 email 驗證 | 歡迎信 | 驗證成功後立即 |
| 用戶完成 onboarding 步驟 | Onboarding 完成信 | 完成所有設定後 |
| 用戶首次建立實踐 | 實踐提醒信 | 建立後 24h |

> ⚠️ 確切寄送邏輯需依照 FRD 文件確認，以下為推測，需 PM 確認。

### 2. 前端觸發點

#### 2a. 歡迎信

目前 `sendWelcomeEmail` 在哪裡呼叫？需確認：
- 是否在 `packages/api/src/services/auth-hooks.ts` 的 register flow 中呼叫？
- 或由後端自動在 register 時觸發？

若需前端觸發：在 `apps/product/src/app/[locale]/auth/callback/page.tsx` 的 `isNewUser` 分支中呼叫。

#### 2b. Onboarding 完成信

在 `apps/product/src/app/[locale]/auth/onboarding/page.tsx` 完成後呼叫。

#### 2c. Email 參數

```typescript
await sendWelcomeEmail({
  email: user.email,
  name: user.nickname ?? user.name,
  hasCompletedQuiz: !!quizResult,
  practiceUrl: `${APP_URL}/practices/${practiceId}`,
  quizUrl: `${WEBSITE_URL}/quiz`,
  illustrationUrl: undefined,
  unsubscribeUrl: undefined,
  userId: user.id,
});
```

### 3. 連結修正

根據 issue #709 和 #705，email 內連結應指向：
- 設定/連結頁：`https://app.daodao.so/en/settings/connections`
- 可在 `sendWelcomeEmail` / 其他 email 的 params 中傳入正確的 `actionUrl`

## 受影響檔案

- `apps/product/src/app/[locale]/auth/callback/page.tsx`
- `apps/product/src/app/[locale]/auth/onboarding/page.tsx`
- `packages/api/src/services/email.ts`（可能需新增 email type）

## 驗收標準

- [ ] 寄送順序符合 FRD 規範
- [ ] Email 內容符合設計文件
- [ ] 連結正確指向對應頁面
- [ ] PM 已確認 FRD 細節
- [ ] 前端觸發點與後端確認不重複觸發
