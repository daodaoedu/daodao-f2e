---
name: code-review
description: Push 前 review 整個 branch 的變更，檢查邏輯錯誤、安全問題、效能問題、架構一致性
---

# Code Review

Review 當前 branch 相對於 base branch 的所有變更。

## 步驟 1：取得變更範圍

1. 執行 `git log --oneline main...HEAD` 確認 commit 數量
2. 執行 `git diff main...HEAD --stat` 確認變更檔案範圍
3. 如果 base branch 不是 main（例如 dev），自行判斷正確的 base

## 步驟 2：逐檔 Review

對每個變更的檔案，執行 `git diff main...HEAD -- <file>` 讀取 diff，檢查：

- **邏輯錯誤**：edge case、off-by-one、null/undefined 未處理、async 錯誤處理
- **安全問題**：XSS、注入攻擊、硬編碼 secret、不安全的 API 呼叫
- **效能問題**：不必要的 re-render、N+1 query、大量 DOM 操作、缺少 memo/useMemo
- **架構一致性**：是否遵守 AGENTS.md 的規範（使用 @daodao/* packages、API 錯誤處理模式等）

## 步驟 3：回報結果

以表格格式列出發現的問題：

| 嚴重度 | 檔案 | 問題 | 建議 |
|--------|------|------|------|

嚴重度分三級：
- **High**：必須修，有 bug 或安全風險
- **Medium**：建議修，效能或可維護性問題
- **Low**：可選，風格或小優化

## 步驟 4：處理問題

- High 問題 → 詢問使用者是否要修復
- Medium / Low → 列出即可，由使用者決定
