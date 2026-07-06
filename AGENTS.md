# AI Agent Instructions — daodao-f2e

daodao 前端與 App（Next.js monorepo，共用邏輯必須使用 @daodao/* packages）。

## 單一事實來源

- 品質檢查指令、格式化指令、受保護路徑：`.claude/repo.json`
  （由 daodao monorepo 的 `.claude/sync.sh` 從 `bin/pipeline.config.json` 產生；**不要手改**）
- 開發規範：先讀 `.claude/skills/project-rules/SKILL.md`（如存在）
- 跨 repo 工作流程與自動化 pipeline：monorepo `docs/automation/OPERATOR.md`

## Commit 流程

1. 執行 `pre-commit-check` skill（指令來自 `.claude/repo.json`）
2. 通過後執行 `format-commit` skill 產生 commit message
3. 使用者確認後才執行 git commit

## Push 流程

使用者說要 push 時，先詢問「要 review 嗎？」：
- Yes → 執行 `code-review` skill，review 完再 push
- No → 直接 push

## PR Feedback 流程

Push 並開 PR 後，使用者說「收集 feedback」時執行 `collect-pr-feedback` skill。

## 測試規範

- 新功能必須附測試；修 bug 必須附 regression test（先紅後綠）
- UI 元件 / layout / CSS 不需要測試
- 測試指令：`.claude/repo.json` 的 `quality.test`
