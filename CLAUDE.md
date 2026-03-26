# CLAUDE.md

## 專案規範

進行任何開發工作（規劃、實作、除錯、review）前，先讀 `.claude/skills/project-rules/SKILL.md` 了解專案規範。

## Commit 流程

commit 時必須依序執行：

1. 先執行 `.claude/skills/pre-commit-check/SKILL.md` skill 跑品質檢查（lint + typecheck）
2. 檢查通過後，執行 `.claude/skills/format-commit/SKILL.md` skill 產生 commit message
3. 使用者確認後才執行 git commit

## Push 流程

使用者說要 push 時，先詢問「要 review 嗎？」：
- Yes → 執行 `.claude/skills/code-review/SKILL.md` skill，review 完再 push
- No → 直接 push

## 品質檢查指令

- `pnpm run lint` — Biome lint 檢查（turbo 跑所有 packages）
- `pnpm run typecheck` — TypeScript 類型檢查（turbo 跑所有 packages）
- `pnpm run check:fix` — 自動修復 lint + format 問題
