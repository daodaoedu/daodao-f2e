# Spec: 測驗未寫入 (#689)

## 問題描述

使用者從 landing page 點選做測驗、完成後看詳細說明並註冊，此時測驗結果未寫入使用者帳號，導致「我的小島」和「主頁」無法顯示測驗結果。

## 現有架構

### 測驗流程

1. 使用者在 `apps/website` 的 landing page 做測驗（`/quiz`）
2. 測驗結果存在 sessionStorage（`StorageEnum.QuizResult`）或類似
3. 使用者點擊「看詳細說明」→ 觸發登入/註冊
4. OAuth 回調 → `apps/product/src/app/[locale]/auth/callback/page.tsx`
5. 目前：測驗結果未被持久化到使用者帳號

### 相關檔案

- `packages/features/quiz/src/components/quiz-result.tsx` - 測驗結果頁
- `packages/features/quiz/src/components/quiz-result-detail.tsx` - 詳細結果
- `packages/shared/src/constants/index.ts` - `LEARNING_INSPIRATION` 等常數
- `apps/product/src/app/[locale]/auth/callback/page.tsx` - OAuth 回調

## 技術規格

### 1. 測驗結果持久化

#### 1a. 儲存測驗結果到後端

在使用者完成登入/註冊後（`callback/page.tsx` 中的 `isNewUser` 分支），讀取 sessionStorage 中的測驗結果並呼叫 API 寫入：

```typescript
// 在 auth callback 處理新用戶時
const quizResult = sessionStorage.getItem(StorageEnum.QuizResult);
if (quizResult && isNewUser) {
  await saveQuizResultToAccount(JSON.parse(quizResult));
}
```

後端 API：需確認是否已有 `PATCH /api/v1/users/quiz-result` 或類似 endpoint，否則需後端新增。

#### 1b. 已登入使用者的測驗結果

若使用者已有帳號但無測驗結果，登入後同樣觸發寫入。

### 2. 「我的小島」顯示測驗結果

檔案：`apps/product/src/app/[locale]/(with-layout)/users/[identifier]/page.tsx`

- 從使用者資料中讀取 `quizResult` / `learningPersona` 欄位
- 顯示測驗結果摘要卡片

### 3. 「主頁」顯示測驗結果

檔案：`apps/product/src/app/[locale]/(with-layout)/page.tsx`

- 若使用者有測驗結果且尚未建立實踐，在主頁顯示測驗結果引導卡
- 使用現有 `ResonanceCarousel` 或新增對應 UI

### 4. Cross-app 資料傳遞

`apps/website`（測驗）→ `apps/product`（帳號）的資料傳遞方式：
- 方案 A：sessionStorage（目前可行，但跨域可能有問題）
- 方案 B：URL query param 在 OAuth redirect_url 中夾帶 quiz token
- 方案 C：後端 OAuth flow 中整合測驗結果寫入

> 建議方案 B：在 quiz 完成後觸發登入，將 quiz result token 夾帶在 state 參數中，callback 時讀取並寫入。

## 受影響檔案

- `apps/product/src/app/[locale]/auth/callback/page.tsx`
- `apps/product/src/app/[locale]/(with-layout)/users/[identifier]/page.tsx`
- `apps/product/src/app/[locale]/(with-layout)/page.tsx`
- `packages/auth/src/lib/auth-client.ts`（可能需修改 state encoding）
- `packages/api/src/services/` （新增 quiz result API）

## 驗收標準

- [ ] 從 landing page 做測驗後註冊，測驗結果正確寫入帳號
- [ ] 「我的小島」頁面顯示測驗結果
- [ ] 「主頁」顯示測驗結果引導
- [ ] 已有帳號的使用者完成測驗後也能寫入
- [ ] 後端確認 quiz result API endpoint
