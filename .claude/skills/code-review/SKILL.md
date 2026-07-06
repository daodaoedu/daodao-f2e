---
name: code-review
description: Push 前 review 整個 branch 的變更，檢查邏輯錯誤、安全問題、效能問題、架構一致性。Use before pushing when the user agrees to review.
---

# code-review

Push 前 review 當前 branch 相對於 base branch 的所有變更。

## 步驟 1：確定 base branch（不要猜）

```bash
# 有 open PR 時用 PR 的 base；否則用 origin 預設 branch
BASE=$(gh pr view --json baseRefName --jq '.baseRefName' 2>/dev/null \
  || git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@.*/@@' \
  || jq -r '.defaultBranch' .claude/repo.json)
git fetch origin "$BASE"
git log --oneline "origin/${BASE}..HEAD"
git diff "origin/${BASE}...HEAD" --stat
```

## 步驟 2：逐檔 review

對每個變更檔案跑 `git diff origin/${BASE}...HEAD -- <file>`，用兩份清單檢查：

**通用清單（所有 repo）**
1. 邏輯錯誤：邊界條件、錯誤處理路徑、async 競態
2. 安全：注入、認證/授權缺口、敏感資料外洩
3. 測試：新邏輯有沒有對應測試；有沒有測試被刪除/弱化
4. 一致性：命名、API 回傳格式、與周邊程式碼風格一致

**Repo 專屬重點**：讀 `.claude/repo.json` 的 `reviewFocus`，逐條檢查。

## 步驟 3：外部引擎交叉檢查（可用才跑，缺了不算失敗）

```bash
DIFF_FILE=$(mktemp); git diff "origin/${BASE}...HEAD" > "$DIFF_FILE"
command -v codex  >/dev/null && codex review "$DIFF_FILE" 2>/dev/null || echo "（codex 不可用，跳過）"
command -v gemini >/dev/null && gemini -p "Review this diff for bugs, security, performance: $(cat "$DIFF_FILE" | head -c 30000)" 2>/dev/null || echo "（gemini 不可用，跳過）"
```

引擎失敗或不存在 → 記一行「已跳過」，**不要**中止 review、不要嘗試安裝。

## 步驟 4：輸出

```markdown
## Code Review（base: <BASE>，<N> files）

| # | 嚴重度 | 檔案 | 問題 | 建議 |
|---|--------|------|------|------|
| 1 | High/Medium/Low | path:line | ... | ... |

（沒有問題就寫：✅ 未發現問題）
```

- 有 **High** → 詢問使用者「修正後再 push，還是接受風險直接 push？」
- headless 模式：有 High 一律先修正，修不了 → abort 並回報，不 push
- Medium/Low → 列出，由使用者（或 headless 時的後續 PR review）決定
