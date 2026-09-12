---
name: pre-commit-check
description: commit 前執行格式化檢查與靜態分析，自動修復可修的錯誤
---

# Pre-Commit Check

commit 前的品質檢查。發現錯誤時先嘗試自動修復，修不了的再報告給使用者。

## 步驟 0：判斷指令入口（依 repo 而異）

- 有 `Makefile`（daodao-ai-backend、daodao-admin-ui）→ 用 `make check` / `make format` / `make lint`
- pnpm/npm 專案（daodao-f2e、daodao-server、daodao-worker 等）→ 用 package.json scripts：
  `pnpm format:check` / `pnpm format` / `pnpm lint` / `pnpm typecheck`（以該 repo 實際存在的 script 為準，先 `grep '"scripts"' -A 15 package.json` 確認）
- monorepo root（無 Makefile）→ 只跑 `pnpm vitest run bin/`（如有變更 bin/）

## 步驟 1：執行格式化檢查

1. 執行格式檢查（`make check` 或 `pnpm format:check`）
2. 如果有錯誤，執行自動修復（`make format` 或 `pnpm format`）
3. 再次執行檢查確認
4. 仍有錯誤 → 讀取錯誤訊息，手動修復對應檔案

## 步驟 2：執行靜態分析

1. 執行 lint（`make lint` 或 `pnpm lint`；TS 專案加跑 `pnpm typecheck`）
2. 如果有錯誤 → 讀取錯誤訊息，逐一修復
3. 修復後重新執行確認

## 步驟 3：執行變更對應的驗證（依類型對照，沒跑過不准 commit）

format/lint 過了 ≠ 行為對了。依 staged 變更的類型跑對應驗證：

| 變更類型 | 必跑驗證 |
|---|---|
| 有對應測試的程式碼（`__tests__/`、`*.test.*` 存在或同 PR 新增） | 跑該測試套件（如 `pnpm vitest run <dir>`） |
| CI workflow（`.github/workflows/*.yml`） | YAML parse 驗證；有 `workflow_dispatch` + `dry_run` 的，註記「push 後需 dry-run 一次」 |
| shell script（`*.sh`） | `bash -n` 語法檢查；有對應 `test-*.sh` fixture 就跑 |
| DB migration / SQL | 本地 DB apply + 冪等重跑（見 dev-task 規範） |
| UI 元件 | 瀏覽器快篩（見 dev-task Phase 2；此處不重複） |
| skill / prompt / 純文件 | 檢查文內引用的檔案路徑、指令、label 名稱實際存在（`ls` / `gh label list` 抽查） |

找不到任何可執行驗證的變更 → 在 commit 訊息或回報中明說「本變更以 X 方式驗證」或「無可執行驗證」，不可默默略過。

## 步驟 4：回報結果

- 全部通過 → 告知使用者可以 commit，並附一行「已跑驗證：<清單>」
- 有無法自動修復的錯誤 → 列出錯誤，詢問使用者如何處理
