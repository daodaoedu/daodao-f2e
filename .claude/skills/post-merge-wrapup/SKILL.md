---
name: post-merge-wrapup
description: PR merge 後的收尾流程：歸檔 openspec change、更新 docs/product 功能狀態、校準地圖文件。Use when a PR is merged, the user says 合併了/merged/上線了, or after confirming a PR's merge status.
---

# Post-Merge Wrap-up

PR merge 不是流程終點。少了收尾，openspec change 會堆積、docs/product 的狀態標示會腐爛（文件寫「規劃中」但功能早已上線）。本 skill 把收尾變成機械步驟。

## 步驟 1：確認 merge 事實

1. 確認 PR 已 merged（可用 GitHub MCP `pull_request_read` 或 `gh pr view`；使用者親口說 merged 也算）
2. 未 merged → 停止，告知使用者本 skill 只在 merge 後執行

## 步驟 2：歸檔 openspec change（若有）

1. 檢查本次變更是否對應一個 openspec change（`openspec/changes/` 下有進行中的 change）
2. 有 → 執行該 repo 的 `.claude/skills/openspec-archive-change/SKILL.md`
3. 本 repo 沒有 openspec → 詢問使用者 change 是否開在其他 repo（daodao / daodao-server / daodao-ai-backend），是的話提醒到該 repo 歸檔
4. 沒有對應 change → 跳過本步驟

## 步驟 3：更新 docs/product 功能狀態

docs/product 位於 daodao repo。這步是根治「文件說規劃中、程式碼已上線」的關鍵，不可跳過不提。

1. 判斷本次 merge 是否上線了 docs/product 有記載的功能（PRD / FRD / roadmap 條目）
2. 是 → 到 daodao repo 找到對應文件，把狀態標示更新為已上線並附上日期（例：`狀態：已上線（2026-07-18）`）
3. 無法存取 daodao repo（不在本 session 的 scope）→ 明確告知使用者：「docs/product 的 <文件> 狀態需要更新，請在 daodao repo 處理」，不要默默略過
4. 本次變更與 docs/product 無關（純技術債、內部重構）→ 註明「不涉及 product 文件」後跳過

## 步驟 4：校準地圖文件（若有結構性變更）

- 本次 merge 改了目錄結構、build 流程、入口檔 → 更新本 repo 的 `codebase-map`，並更新頂部「最後校準」日期
- 改了服務間呼叫、types 同步、schema 流程 → 更新六份 `system-map`（複製式共用，改一份要同步六份）
- 都沒有 → 跳過

## 步驟 5：回報收尾清單

以 checklist 回報每一步的實際結果，如實標注未執行的項目與原因：

```
## Merge 收尾報告
- [x] openspec change 已歸檔 / [ ] 無對應 change
- [x] docs/product 狀態已更新：<文件路徑> / [ ] 不涉及 product 文件 / [ ] ⚠️ 需在 daodao repo 手動更新：<文件>
- [x] 地圖已校準 / [ ] 無結構性變更
```
