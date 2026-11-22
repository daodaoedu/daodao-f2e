# 文章 PR 預覽

目標流程：完整中英文草稿 → 確認文字並送審 → 建立 `content/*` 文章 PR → Cloudflare 回報獨立預覽網址 → 修改同一 PR 並重建預覽 → 明確核准該版本 → 合併與既有正式發布流程。預覽不需要真人內容核准；正式發布仍需要。只要求寫草稿時不自行建立 PR。

## 建置與權限

沿用 `daodao-blog` 的 Cloudflare Pages Git integration。正式分支保持 `main` 且自動正式部署關閉；只允許 `content/*` 預覽分支。每次部署有不可變的八碼 deployment URL，供審稿與核准綁定；分支 alias 可能移動，不能單靠 alias 核准。

Pages 的 build command 由維護者設定，從官方 `daodao-f2e` 取得完整、已審查且合併到 dev 的 frontend SHA，執行該版本 `scripts/blog-cloudflare-preview.py`。不從文章分支讀取或執行建置程式。`SKIP_DEPENDENCY_INSTALL=true` 必須由 Pages 保護設定提供，避免平台自動執行文章 repo 的套件腳本。內容若含 Functions、worker 或 Wrangler 配置則拒絕。

必要的 Pages 預覽環境變數：

| 名稱 | 設定 |
|---|---|
| `NODE_VERSION` | `20.19.4` |
| `PNPM_VERSION` | `10.20.0` |
| `SKIP_DEPENDENCY_INSTALL` | `true` |
| `BLOG_PREVIEW_FRONTEND_SHA` | 已核准前端的完整 SHA |

不新增 Cloudflare API token、不把憑證交給文章作者；沿用 Pages 的既有 Git integration。建置 child process 只取得 allowlist 的公開 dev URLs 與 draft/export 設定，不繼承正式站核准紀錄、分析 key、token、NODE_OPTIONS 或任意 NEXT_PUBLIC_*。呼叫端必須提供明確 HOME 與絕對 PATH；HOME 必須是目前執行者擁有、非 symlink 且不可由其他使用者寫入的既有目錄，缺少時在載入 helper 或 clone 前停止，不回退到公用暫存目錄。

受控 bootstrap command 必須先驗證 frontend pin 為完整40碼 SHA，建立全新暫存 checkout，固定官方 repo 並 checkout 該 pin，再呼叫：

```sh
python3 "$frontend/scripts/blog-cloudflare-preview.py" --content-root "$content" --output "$content/out"
```

其中 `$content` 是 Pages 提供的官方內容 checkout；`$frontend` 是獨立固定版本 checkout。不要在內容 repo 寫一個同名腳本後直接執行，也不要把正式分支的自動部署重新開啟。

## 審稿與驗證

程式核對 Pages commit、分支、實際 checkout 與 GitHub 官方 PR 的 current head。必須是唯一 open PR、base main、官方來源；stale、fork、closed、模糊 PR 都拒絕。公開 GitHub API 讀取可能受 rate limit；錯誤應回報建置失敗，不繞過版本檢查。

只複製公開文章／作者／主題／圖片，呼叫既有 shared draft validator，並用 `BLOG_CONTENT_MODE=draft` 真正建置 Website。Next 的中文靜態輸出會補上 `/blog/*` 對應檔案；拒絕路由碰撞及 symlink。文章必須有草稿標示與 noindex，不能有正式 canonical 或 JSON-LD。保留根404避免 Pages 使用 SPA fallback。

`blog-preview.json` 記錄 article PR、content/frontend SHA、雙語摘要值、路由與輸出檔案雜湊。預覽建置結束前再次核對 PR head；舊建置不能宣稱新版本已可審。各篇 PR 的不可變網址互不覆蓋，不需要取代共用 dev Website 或執行工程故障／回復矩陣。

Pages 成功後，AI 從 PR 的 Cloudflare check 取得實際 deployment permalink，讀取 marker 並核對 PR/current head。由可信任呼叫端先設定 `BLOG_PREVIEW_EVIDENCE_ROOT` 為獨立、受控的證據目錄，再執行：

```sh
python3 scripts/blog-article-preview.py verify --origin https://DEPLOYMENT.daodao-blog.pages.dev --marker /private/expected-blog-preview.json
```

`DEPLOYMENT` 必須是該次部署的實際八碼 ID，不能照抄 placeholder 或改用可移動 alias。expected marker 來自此次可信任建置／版本核對，不由任意網址自授權。驗證包含逐檔 bytes/MIME、兩語正文及未知文章404。完成桌機與手機渲染檢查後才交付中英文預覽網址；報告列出實際 viewport。

CLI 的 `--validation`／`--marker` 僅能讀取上述受控目錄內的既有 regular JSON；不得由 CLI 檔案參數反推或擴大證據 root。沿用既有 bounded/no-follow 檔案讀取，拒絕 root 外路徑、檔案／父目錄 symlink 與超大輸入。`finalize --output` 預設只接受本 checkout 的 `apps/website/out` 範圍內既有目錄；獨立 artifact 存放方式須由可信任呼叫端另設 `BLOG_PREVIEW_ARTIFACT_ROOT`。`stage` 僅使用實際 frontend ROOT、受控 `RUNNER_TEMP`，若寫環境檔則必須完全匹配既有 `GITHUB_ENV`。這些 CLI 設定不改動受控建置程式直接呼叫 library 時的來源檢查。

修改後維持同一 PR，等待新部署並更新審稿網址。內容、圖片或其依賴資料改變後，舊核准不適用。核准綁定已驗證的雙語 digest；合併後 digest 相同可沿用該核准，不要求因 merge SHA 改變而重審。

## 部署狀態與失敗

新增程式與通過本機測試，不等於 Pages 設定已生效。維護者必須記錄舊設定、套用 reviewed bootstrap／預覽變數與分支範圍，再以實際文章 PR 跑完整建置、讀回及修訂旅程。未完成時明列尚未啟用，不給假網址。

建置失敗保留原正式部署與其他 PR 預覽；不回到舊 Notion command、不傳 Slack、不強制部署或重建 Product。設定回復使用預先保存的 Pages 設定，不能刪除別人的部署。既有正式發布仍走 `blog-prod-publish.yml`，本功能不改其來源、CI、核准或 rollback 條件。

官方依據：[Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)、[Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)、[Skip dependency install](https://developers.cloudflare.com/pages/configuration/build-image/#skip-dependency-install)。
