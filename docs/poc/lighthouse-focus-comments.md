# Lighthouse 焦點與打卡留言 POC

工程師檢視用，基於 `dev` 的 `22d30ef8`（2026-11-26）。不是正式驗收或可直接上線的聲明。

## 本次確認的體驗

- 今日焦點合併成「參與者／實踐／焦點／打卡&留言」單一表格；打卡間隔與近期進展使用同一入口。
- 只有一次打卡時，「首次打卡」只保留 72 小時；超過 72 小時以未打卡焦點為優先。完整紀錄仍可在抽屜查看。
- 點留言圖示開啟打卡與留言抽屜；指定打卡的留言縮排在該打卡內。實踐留言獨立呈現，帶領人從燈塔送出的留言使用淡綠背景。
- checkbox 最多選一筆打卡。選取時按鈕顯示「留言於 YYYY/MM/DD 的打卡」；取消選取時顯示「不指定打卡內容留言」。
- 未打卡焦點預設留言到實踐；近期進展預設選中觸發焦點的打卡。後端需回傳 `checkinId`；舊版本缺少此欄時不猜測留言目標。
- 撰寫視窗直接送出，不再二次確認；移除鼓勵／慶祝分類與範本選取、存成範本操作。
- 名單加入日期移到狀態標籤左側；儀表板原開始日欄改為「首次打卡日」；成果顯示「打卡進度」及 `6 / 16 次（38%）`。
- 模板編輯器保留標題列的 X，停用重複的預設關閉圖示。

## 如何檢視

1. 依 repo README 安裝依賴及啟動 product，連到具下述契約的測試 API，使用有組織權限的測試帳號。
2. 開啟 `/zh-TW/lighthouse/programs/<programId>/cohorts/<cohortId>/focus`，並比較 dashboard、roster、feed、outcome。
3. 比較同一人的不同實踐，確認抽屜只呈現所選實踐的留言；勾選、取消勾選及重新開啟抽屜，確認留言目標與按鈕一致。
4. 成果列印版獨立檢視。此次沒有增加成果表格欄位；兩種語系的進度文案同時更新。
5. 模板庫開啟建立／編輯視窗，確認只顯示一個關閉圖示。

本機用過的 organization 16、program 15、cohort 28 及人名內容都是合成示範資料，不是其他環境必定存在的識別碼。本分支不包含資料庫、登入捷徑、測試 token、連線密碼或本機啟動腳本，也不在真實留言紀錄中注入假留言。

## 後端依賴與待開發 FRD 要求

這些是本次討論確認的需求。後端修改仍在另一個本機 checkout，未隨此前端分支發布；工程師需另外移植及驗收。

- `/focus` 近期進展需提供可留言的 `checkinId`，首次打卡限 72 小時，並避免同一實踐同時被列為舊首次打卡與逾期未打卡。
- `GET .../participants/{userId}/messages` 要整合所有來源的留言，提供 `source: practice | checkin | lighthouse`、`practiceId`、可為 null 的 `sentAt` 及 `checkinId`，不能只查燈塔送出的留言。帶領人是否著色目前由 `source=lighthouse` 判斷；若管理員由其他入口留言也需同色，API 應另提供作者角色。
- `POST .../participants/{userId}/messages` 接受 `practiceId`、可選 `checkinId`、`body`，不需要 encourage/celebrate category。伺服器必須驗證打卡屬於指定實踐及參與者、權限、寫入位置與歷史關聯；不能忽略 `checkinId` 然後回傳成功。
- 目前 server 生成的前端 OpenAPI 型別仍是舊 category 契約。本 POC 在單一請求邊界以明確註解的型別轉接保留新 body，不偽造分類、不手改生成檔。整合時必須從 server 更新 OpenAPI、重新生成型別並移除轉接。
- 所有打卡統計區間依各自實踐的起訖日，不能以場次起訖日裁切。儀表板預設區間採實踐日期總覽，選取單一實踐則跟隨該實踐。明確的使用者日期篩選仍適用。
- 「首次打卡日」需來自真正第一筆打卡，不能用加入日或實踐開始日冒充。統計、焦點與動態需釐清 `checkin_date` 和 `created_at` 的回填日期語意，避免間隔和日期顯示互相矛盾；成果目標依實踐期間與頻率計算。
- Lighthouse 組織 AI 憑證應使用 `LIGHTHOUSE_AI_CREDENTIAL_ENCRYPTION_KEYS` 與 `LIGHTHOUSE_AI_CREDENTIAL_ACTIVE_KEY_VERSION`，移除對 `FUTURE_LETTER_ENCRYPTION_KEYS` 的 fallback。它是 AI 憑證加密設定，不是留言 API；須規劃既有密文的解密與重新加密，不能只換環境變數導致既有 key 無法讀取。

## 驗證紀錄

- `pnpm run typecheck --concurrency=2`：18/18 tasks 通過（15 個快取）。
- 本次 12 個 TypeScript／TSX／locale 檔案的 Biome check：通過。
- `pnpm exec vitest run packages/api/src/__tests__/cohort.test.ts packages/api/src/__tests__/lighthouse-comment-target.test.ts`：16/16 通過，驗證指定打卡 body、無選取時的實踐留言，以及歷史 source/checkinId 不被 schema 丟失。未對本機資料送出測試留言。
- `git diff --check`、兩語系 top-level keys 比對與確定範圍的 diff 審閱：已執行。
- `pnpm run lint`：失敗於未修改的 `packages/blog-content`，10 個檔案有既有 Biome 格式問題；本 POC 不混入無關修訂。
- 獨立 worktree 的 product 預覽已嘗試，API 代理健康檢查回應 200，但 Codex browser 開啟頁面／合成帳號登入時遇到 `ERR_TOO_MANY_REDIRECTS`。因此本分支的五頁瀏覽器快篩、抽屜互動、各尺寸與列印/PDF 目視確認尚未完成。此前對話的 3001 畫面屬於混合來源 checkout，不能視為此分支的完整驗證。

2026-11-26 使用者已確認 commit 並直接 push，保留上述 POC 限制，不另開 PR、合併或部署。已執行的檢查如上；此次提交不重跑會被既有 Blog 格式問題擋住的全量 pre-commit hook，不能宣稱完整 lint 或瀏覽器驗收通過。
