# AI Agent Instructions

## 專案規範

進行任何開發工作（規劃、實作、除錯、review）前，先讀 `.claude/skills/project-rules/SKILL.md` 了解專案規範。

## Commit 流程

commit 時必須依序執行：

1. 先執行 `.claude/skills/pre-commit-check/SKILL.md` skill 跑品質檢查（lint + typecheck）
2. 檢查通過後，執行 `.claude/skills/format-commit/SKILL.md` skill 產生 commit message
3. 使用者確認後才執行 git commit

### 品質檢查指令

- `pnpm run lint` — Biome lint 檢查
- `pnpm run typecheck` — TypeScript 類型檢查
- `pnpm run check:fix` — 自動修復 lint + format 問題

## Push 流程

使用者說要 push 時，先詢問「要 review 嗎？」：
- Yes → 執行 `.claude/skills/code-review/SKILL.md` skill，review 完再 push
- No → 直接 push

## PR Feedback 流程

Push 並開 PR 後，使用者說「收集 feedback」或「看 PR review」時：
1. 執行 `.claude/skills/collect-pr-feedback/SKILL.md` skill
2. 收集 CI 狀態 + AI Code Review + Gemini Code Assist + 人類 reviewer 的 feedback
3. 整理成總覽表格，分類為「必須修 / 建議修 / 可忽略」
4. 詢問使用者要修正哪些
5. 修正後走正常 commit → push 流程
