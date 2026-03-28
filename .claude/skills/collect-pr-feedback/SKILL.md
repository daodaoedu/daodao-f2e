---
name: collect-pr-feedback
description: Push 後收集 PR 上的所有 review feedback（CI、AI Code Review、Gemini Code Assist、人類 reviewer），分析並詢問使用者要修正哪些
---

# Collect PR Feedback

Push 並開 PR 後，收集所有自動化和人類的 review feedback，整理後讓使用者決定要修什麼。

## 步驟 1：找到 PR

1. 執行 `gh pr list --head $(git branch --show-current) --json number,title,url,state` 找到當前 branch 的 PR
2. 如果找不到 PR，詢問使用者 PR 號碼或 URL
3. 記下 PR number

## 步驟 2：檢查 CI 狀態

1. 執行 `gh pr checks <PR_NUMBER>` 查看所有 CI checks
2. 整理結果：
   - ✅ Passed checks
   - ❌ Failed checks（記錄失敗原因）
   - ⏳ Pending checks

如果有 pending checks，詢問使用者：「有 checks 還在跑，要等嗎？」
- 等 → 執行 `gh pr checks <PR_NUMBER> --watch`，完成後繼續
- 不等 → 先處理已有的 feedback

## 步驟 3：收集所有 Review Comments

1. 執行 `gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments` 收集 inline review comments
2. 執行 `gh api repos/{owner}/{repo}/issues/<PR_NUMBER>/comments` 收集 PR 一般 comments
3. 執行 `gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/reviews` 收集 review decisions

分類整理：

| 來源 | 識別方式 |
|------|---------|
| **AI Code Review** | comment body 以 `## Code Review` 開頭 |
| **Gemini Code Assist** | author 為 `gemini-code-assist[bot]` 或類似 |
| **Auto PR Description** | 不算 feedback，跳過 |
| **人類 Reviewer** | 其他所有 comments |

## 步驟 4：整理 Feedback 總覽

以表格呈現所有 feedback：

```
## PR Feedback 總覽

### CI Status
| Check | Status | Detail |
|-------|--------|--------|

### AI Code Review
| 嚴重度 | 檔案 | 問題 | 建議 |
|--------|------|------|------|

### Gemini Code Assist
（整理 Gemini 的 review 重點）

### 人類 Reviewer
| Reviewer | Comment | 檔案/行數 |
|----------|---------|-----------|
```

## 步驟 5：分析需要修正的項目

根據收集到的 feedback，分為三類：

1. **必須修** — CI 失敗、High 嚴重度問題、人類 reviewer 明確要求修改
2. **建議修** — Medium 嚴重度、Gemini 建議、可改善的點
3. **可忽略** — Low 嚴重度、風格偏好、不影響功能

## 步驟 6：詢問使用者

使用 AskUserQuestion 工具：

- 展示分類後的 feedback 清單
- 問：「要修正哪些？」（multiSelect）
- 選項包含所有「必須修」和「建議修」的項目
- 預設勾選所有「必須修」的項目

## 步驟 7：執行修正

1. 根據使用者選擇的項目，逐一修正
2. 每修完一個項目，跑 `pnpm run lint` + `pnpm run typecheck` 確認沒有新問題
3. 全部修完後，執行 `.claude/skills/pre-commit-check/SKILL.md` 跑品質檢查
4. 通過後，執行 `.claude/skills/format-commit/SKILL.md` 產生 commit message
5. commit 後 push

## 步驟 8：回覆 Review（可選）

詢問使用者：「要在 PR 上回覆 reviewer 嗎？」
- Yes → 對每個 review comment 回覆修正內容或說明理由
- No → 跳過
