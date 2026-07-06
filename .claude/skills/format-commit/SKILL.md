---
name: format-commit
description: Use when committing changes - asks user for commit type and Why, auto-generates How from git diff, generates a commit message with Why/How sections, confirms with user, then executes git commit.
---

# format-commit

產生標準格式 commit message 並執行 commit。前置：pre-commit-check 已通過。

## Commit 格式

```
<type>(<scope>): <描述（繁體中文，50 字內）>

## Why is this necessary?

<為什麼需要這個改動，1-3 句>

## How does it address the issue?

<怎麼解決的，3-5 個 bullet，從 diff 歸納>
```

type: `feat` / `fix` / `refactor` / `test` / `docs` / `chore` / `perf`

## 流程

```
1. git status --short 與 git diff --stat --staged 確認 staged 內容
   - 沒有 staged 變更 → 提醒使用者先 git add，停止
   - 注意：一律用 --staged。How 的內容只能來自 staged diff
2. 從 git diff --staged 歸納：
   - 推測 type 與 scope（scope = 主要模組/目錄名）
   - 起草 How 的 3-5 個 bullet（講「做了什麼改變」，不是逐檔流水帳）
3. 用一次 AskUserQuestion 確認：type/scope 推測 + 詢問 Why
   （選項附上你推測的預設值，讓使用者直接採用）
4. 組合完整 message，顯示給使用者確認
5. 確認後：git commit -m "<完整 message>"（用 heredoc 傳入，保留換行）
```

## headless（無人值守）模式

跳過第 3、4 步的詢問：type/scope/Why 全部由 diff 與工作脈絡推導，直接 commit。
Why 寫得出事實即可，不要編造需求背景。
