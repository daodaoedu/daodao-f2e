# .claude 制度總覽

給未來在此 codebase 工作的 AI agent 與人類維護者。本檔說明制度的組成、設計原則與維護方式。
六個 daodao repo（f2e / server / worker / ai-backend / storage / admin-ui）各有一份相同的本檔。

## 制度的組成與載入順序

1. **CLAUDE.md / AGENTS.md**（repo 根目錄）— 薄入口：只放流程（commit/push）、品質指令、指向 skills 的路標。刻意精簡，因為每個 session 都會載入。
2. **`.claude/skills/`** — 按需載入的知識：
   - `project-rules` — 開發規範（怎麼寫才對）。hook 會在每個 session 首次寫檔時自動注入一次。
   - `codebase-map` — 本 repo 的地圖（東西在哪、常見任務動哪裡、隱藏的前置依賴）。
   - `system-map` — 六個 repo 的全景（誰呼叫誰、types 同步鏈、跨 repo SOP）。**六份內容相同**。
   - `pre-commit-check` / `format-commit` / `code-review` / `collect-pr-feedback` — 流程 skill。
3. **`.claude/hooks/`** — 機械強制層：`pre-write-guard.sh`（擋敏感檔與舊 migration、自動載入規範）、`post-write-format.sh`（寫檔後自動 format）。
4. **`.claude/settings.json`** — 權限白名單與 hook 註冊。

## 複製式共用檔案（改一份要同步六份）

以下檔案在六個 repo 間逐位元相同，任何修改必須同步全部：

- `.claude/hooks/pre-write-guard.sh`、`.claude/hooks/post-write-format.sh`
- `.claude/settings.json`
- `.claude/skills/system-map/SKILL.md`
- `.claude/README.md`（本檔）

驗證方式：`md5sum ../daodao-*/.claude/hooks/*.sh`，同名檔案 hash 必須一致。

## 設計原則（修改制度時必守）

1. **機械式步驟優於判斷**——寫「執行 X，若失敗執行 Y」，不寫「視情況處理」。制度的讀者是能力較小的模型，判斷空間就是出錯空間。
2. **清單指向權威、不窮舉**——規範裡的窮舉清單（enum keys、hooks 清單）必然腐爛。寫「權威清單在 <檔案路徑>」+ 兩三個例子。
3. **文件與現實衝突時，現實為準**——先驗證 codebase 現況，修文件而不是照舊文件做事，並在 PR 中註記。
4. **能用指令驗證就不用直覺**——每個 repo 的品質指令都列在 CLAUDE.md；改完必跑，跑不動先解決跑不動的原因（常見：忘了 prisma:generate、缺 venv）。
5. **讓現實配合制度**——如果統一指令（如 `pnpm run typecheck`）在某 repo 不存在，優先補上該 script，而不是為該 repo 寫例外規則。

## 地圖的維護時機

- 目錄結構、build 流程、入口檔變動 → 更新該 repo 的 `codebase-map`。
- 服務間呼叫關係、types 同步方式、schema 流程變動 → 更新**六份** `system-map`。
- 地圖檔頂部有「最後校準」日期——大幅重構後即使內容看似仍對，也應重新校準並更新日期。

## AI agent 作業守則

- 開工前：不熟結構先讀 `codebase-map`；變更可能影響其他 repo 先讀 `system-map`。
- 同一個錯誤連續修三次仍失敗 → 停下來，總結「已嘗試什麼、卡在哪」回報使用者，不要繼續盲試。
- 禁止：force push、修改已存在的 migration、把 secret 寫進任何檔案、手改生成物（`generated/`、openapi types）。
- 完成任務時如實回報：測試沒跑就說沒跑，環境不具備就說明缺什麼，不要含糊帶過。
