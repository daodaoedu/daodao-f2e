---
name: collect-pr-feedback
description: Push 後收集 PR 上的所有 review feedback（CI、AI Code Review、Gemini Code Assist、人類 reviewer），分析並詢問使用者要修正哪些。
---

# collect-pr-feedback

收集當前 branch 對應 PR 的所有 feedback，分類後詢問使用者要修哪些。

## 步驟 1：定位 PR（不要手打 owner/repo）

```bash
NWO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
PR=$(gh pr view --json number --jq '.number') || { echo "此 branch 沒有 open PR"; exit 0; }
```

## 步驟 2：收集四類 feedback

```bash
# 1. CI 狀態
gh pr checks "$PR" 2>/dev/null || gh pr view "$PR" --json statusCheckRollup

# 2. Review comments（含行內）
gh api "repos/${NWO}/pulls/${PR}/comments" --paginate
# 3. Issue comments（AI Code Review bot 的 comment body 以「## Code Review」開頭；
#    Gemini 的 author login 是 gemini-code-assist[bot]，比對要用完整字串）
gh api "repos/${NWO}/issues/${PR}/comments" --paginate
# 4. Reviews（人類 approve / request changes）
gh api "repos/${NWO}/pulls/${PR}/reviews" --paginate
```

失敗的 CI check：用 `gh run view <run-id> --log-failed` 取失敗 log 的最後 50 行。

## 步驟 3：整理總覽表

| # | 來源 | 類型 | 內容摘要 | 分類 |
|---|------|------|----------|------|
| 1 | CI / AI Review / Gemini / 人類 | bug/style/question | ... | 必須修 / 建議修 / 可忽略 |

分類標準：
- **必須修**：CI 紅燈、正確性 bug、安全問題、人類 reviewer 的 request changes
- **建議修**：風格、效能建議、重構建議
- **可忽略**：誤報、與本 PR 無關、重複意見（說明理由）

## 步驟 4：詢問與執行

- 用 AskUserQuestion 問要修哪些（multiSelect）
- 修正後走正常 commit 流程（pre-commit-check → format-commit）再 push
- headless 模式：自動修「必須修」全部項目，「建議修 / 可忽略」列入回報不處理
