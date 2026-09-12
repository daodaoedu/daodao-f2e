# Spec: 「自己設定」未接到島島 (#707)

## 問題描述

使用者選擇「自己設定」建立實踐，完成步驟後沒有預覽畫面，也無法透過「立刻開始實踐」按鈕連接到島島阿學主題實踐詳情頁。

## 目前行為

1. 使用者在 `/practices/create/manual` 走完 5 個步驟
2. Step 5 已有預覽畫面，但「完成」後直接跳轉到 `/practices/create/success?practiceId=...`
3. Success page 顯示倒數計時並導向首頁，沒有提供「立刻開始實踐」連接島島阿學主題

## 期望行為

1. Step 5（預覽畫面）完成後，顯示完整預覽
2. 預覽畫面包含「立刻開始實踐」主要 CTA 按鈕
3. 點擊「立刻開始實踐」→ 跳轉至島島阿學主題實踐詳情頁（`/practices/<axue-practice-id>`）

## 設計需求

> ⚠️ 此 issue 含 `visual` label，以下視覺規格需人類設計師審核。

- 預覽畫面樣式：顯示實踐名稱、行動描述、頻率、時長
- 主要 CTA：「立刻開始實踐」（橙色按鈕）
- 次要 CTA：「返回主頁」

## 技術規格

### 1. 島島阿學主題實踐 ID

需確認「阿學」主題實踐的 external ID：
- 方案 A：使用 env var `NEXT_PUBLIC_AXUE_PRACTICE_ID`
- 方案 B：從 API `/api/v1/practices?template=axue` 查詢
- 方案 C：hard-code 已知的 practice external ID

### 2. Success page 修改

檔案：`apps/product/src/app/[locale]/practices/create/success/page.tsx`

- 新增「立刻開始實踐」按鈕
- 按鈕 onClick：`router.push('/practices/<axue-practice-id>')`
- 保留倒數計時導向首頁（次要行為）

### 3. Mobile success page

檔案：`apps/mobile/app/practices/create/success.tsx`

- 同步加入「立刻開始實踐」按鈕，導向阿學主題實踐

### 4. 傳遞 context

手動建立的實踐在 success page 需能區分來源（manual vs template），以決定是否顯示「立刻開始實踐」按鈕。可透過 URL query param `source=manual` 傳遞。

## 受影響檔案

- `apps/product/src/app/[locale]/practices/create/success/page.tsx`
- `apps/product/src/app/[locale]/practices/create/manual/page.tsx`
- `apps/mobile/app/practices/create/success.tsx`
- `.env.example`（新增 `NEXT_PUBLIC_AXUE_PRACTICE_ID`）

## 驗收標準

- [ ] 「自己設定」建立實踐後，success page 顯示「立刻開始實踐」按鈕
- [ ] 點擊「立刻開始實踐」正確導向島島阿學主題實踐詳情頁
- [ ] 視覺設計已審核
- [ ] Mobile 端同步更新
