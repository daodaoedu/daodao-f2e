---
name: pre-commit-check
description: commit 前執行格式化檢查與靜態分析，自動修復可修的錯誤。Use before any git commit.
---

# pre-commit-check

commit 前的品質檢查。**指令一律來自 `.claude/repo.json` 的 `quality` 欄位**，
不要憑記憶或文件猜指令。

## 流程

```
1. 讀 .claude/repo.json → quality（fix / lint / typecheck / test 四個欄位）
   - 檔案不存在 → 停止並回報「repo.json 缺失，請先跑 monorepo 的 .claude/sync.sh」
2. 依序執行（欄位為 null 就跳過該步）：
   a. quality.fix        （自動修復格式/lint）
   b. quality.lint       （檢查是否還有殘留錯誤）
   c. quality.typecheck
3. 若 b 或 c 有錯誤：
   - 逐條手動修復 → 重跑該指令
   - 最多修 2 輪；第 2 輪後仍失敗 → 停止，完整回報錯誤，不 commit
4. 全部通過 → 回報「✅ pre-commit-check 通過」，繼續 commit 流程
```

## 規則

- 只修「檢查工具指出的錯誤」，不順手重構
- 不可用 skip / disable / ignore 註解讓檢查閉嘴（例外：工具誤報，需在回報中說明）
- 修復過程改到的檔案要包含在同一個 commit
- headless（無人值守）模式：流程相同；第 3 步失敗直接 abort，不嘗試更多輪
