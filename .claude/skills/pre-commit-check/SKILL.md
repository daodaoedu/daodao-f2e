---
name: pre-commit-check
description: commit 前執行 lint、typecheck、測試，自動修復可修的錯誤
---

# Pre-Commit Check

commit 前的品質檢查。發現錯誤時先嘗試自動修復，修不了的再報告給使用者。

## 步驟 1：執行 lint 檢查

1. 執行 `pnpm run lint`
2. 如果有錯誤，執行 `pnpm run check:fix` 自動修復
3. 再次執行 `pnpm run lint` 確認
4. 仍有錯誤 → 讀取錯誤訊息，手動修復對應檔案

## 步驟 2：執行 typecheck

1. 執行 `pnpm run typecheck`
2. 如果有錯誤 → 讀取錯誤訊息，逐一修復
3. 修復後重新執行 `pnpm run typecheck` 確認

## 步驟 3：執行測試

1. 執行 `pnpm test`（turbo 跑所有 packages 的測試）
2. 有失敗 → 讀取失敗訊息，修復對應程式碼或測試
3. 修復後重新執行 `pnpm test` 確認
4. 環境不具備無法執行（缺依賴）→ 不要跳過不提，在回報中註明「測試未執行：<原因>」

## 步驟 4：回報結果

- 全部通過 → 告知使用者可以 commit
- 有無法自動修復的錯誤 → 列出錯誤，詢問使用者如何處理
