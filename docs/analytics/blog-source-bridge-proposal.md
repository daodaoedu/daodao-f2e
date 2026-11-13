# Blog 同瀏覽器來源接線提案（待產品確認，未實作）

## 現況與驗收狀態

這份文件不改原 FR-10，也不把兩套測試拼成同一條通過旅程。

| 原分支 | 實際狀態 | 證據與限制 |
|---|---|---|
| 文章閱讀／CTA、不重複、無私人 URL payload | PASS，本機 | production-minified website、實際設定的 SDK capture transport、64 個服務中 JS 回應 hash 對上 build；不是 Hosted ingest |
| 第一方匿名 cookie 跨子網域 | PASS，協定層 probe | 完整真實 PostHog SDK，兩個受控 .daodao.test origin、外部 origin placeholder；不是產品 UI、登入或帳號連結 |
| 同一具名旅程：文章 CTA → 登入身分 → 實際發布／邀請／參與 → 來源回讀 | BLOCKED | 缺少來源與已驗證帳號的接線及核准規則。現有產品沒有實際 identify caller；匿名 cookie 相同不等於 server leaderId 已有 Blog 來源 |
| Tally 真實申請 | UNKNOWN／權限受阻 | 先前 metrics 實測401；沒有送表、沒有改 Tally 欄位，外連點擊不是申請 |
| 跨裝置、拒絕或清除 cookie | UNKNOWN | 不以 email、姓名、裝置指紋猜測關聯 |

具名連續旅程仍缺核心 AC，#538 不標整卡 verified／Done。部署、Hosted、PM驗收亦未完成。

## 已查證 caller 與資料契約

- `packages/analytics/src/components/posthog.tsx` 匯出 `posthogIdentify`／`posthogReset`，但目前 auth／product／website 沒有實際呼叫。現有 SDK person_profiles 是 identified_only。
- `packages/auth/src/lib/auth-provider.tsx` 的 `checkAuth` 由 `/api/v1/auth/me` 取得 user，`setAuthState` 儲存認證狀態；沒有送入 PostHog。這是「已驗證會話已就緒」的可用前端邊界，不是已核准可以識別追蹤的依據。
- `apps/product/src/app/global-provider.tsx` 使用預設 `AnalyticsScripts`；組織邀請頁刻意不載 analytics。不得為了歸因偷偷取消這個例外。
- `packages/api/src/client.ts`／`next-api-client.ts` web request 使用 credentials include，但實際環境的 API hostname、Cookie Domain、CORS與同專案 key 仍需部署設定回讀，不能由本機 probe 推定。
- `apps/product/src/lib/tracking-ref.ts` 只在 app origin localStorage 保存 `?ref=`；onboarding 將它覆蓋到 referralSource。`user.service.ts` 把 referralSource 保存到 users.referral_source，還可能匹配 tracking_slug。它不是完整 first-touch／assist 契約，不應偷偷改成 Blog 自動來源或覆蓋使用者自述。
- `POST /api/v1/users/me`（user.routes.ts）是經 authenticate、表單驗證的實際正式註冊邊界；`user.service.ts` 的 createUser 交易建立 permanent user 與 created_at。這比 GET /auth/me 的讀取副作用更適合新增「註冊來源」private audit。OAuth callback 可能先產生 temp user，不應把 temp 或 admin/native source 誤當永久註冊。
- OAuth 的 source=website/app/admin 是 redirect/client 類型，不是行銷來源；不改成 blog、不改 state 安全契約。

## 真實 SDK probe 的結果與界線

公開 runtime SDK 版本1.448.0、完整檔案 SHA-256：c160a9bf6f5e0f7ba4d14fa177dce62b11189aece53b7c520e3e500887b01a99。Groundlane direct200但部署回傳截斷100000字元，未拿截斷內容執行；另直接下載完整公開 runtime dependency 作本機測試，沒有秘密、沒有 Hosted 收件。

`same-browser-sdk-probe.json` 記錄：persistence=localStorage+cookie、cross_subdomain_cookie=true、cookie_expiration=365、person_profiles=identified_only；受控 cookie Domain=.daodao.test、Path=/、SameSite=Lax，兩個 origin 的匿名 ID hash 相同，外部 placeholder origin 收不到第一方 cookie。

這是 HTTP 測試網域，secure_cookie=false；測試以 Chrome secure-context override 支援 fixture origin，不能據此宣稱正式 HTTPS Cookie 設定通過。Headless 會被 SDK bot filter 排除，最後的協定 probe 只在測試 HTML 明確設 opt_out_useragent_filter=true；未改產品設定或同意規則。所有網路請求攔在本機，Tally是明示的 placeholder，不是真實表單、提交或完整連續 AC。

重要：SDK 的 `$initial_person_info` 可保留 fixture URL query 的私人 marker，並在第一方間延續；identified_only 的匿名 capture 沒把該 marker送出。不能因此宣稱後續 identify 安全，也不能直接複製整包 SDK persistence 到server或analytics。新增身分連結前，必須驗證只使用允許欄位；本提案不呼叫 identify、不送 email/name，也不聲稱既有 cookie 全無私人資料。

## 建議的最小方案：第一方 public context → 私有註冊來源 audit

優先提案不啟用 PostHog 已識別個人檔案，亦不把 server userId、組織ID、邀請 token 放進瀏覽器 analytics。它仍建立「同瀏覽器來源與帳號」的私有關聯，必須先取得產品對目的、同意與保存的確認；不是已核准的程式變更。

1. 只有已由內容契約成功載入並渲染的文章可建立來源 context，不能從任意 pathname／UTM 推導文章或身分。第一觸及不可被稍後文章覆蓋，最後助攻另存，兩者分開。
2. 使用獨立、欄位白名單的第一方 context；不複製 SDK `$initial_person_info`、raw URL、referrer、任意 campaign params 或完整 persistence。
3. 註冊 request 仍走既有登入／表單驗證。server 僅由已驗證會話與本次新建 user 決定 actor；不能相信 client 傳的 userId／角色。來源 context 是 browser_reported evidence，不是權限憑證，也不冒稱已由 Hosted確認。
4. 在建立 permanent user 的同一交易寫 private registration-attribution audit，帶 source confidence 與 contextId；只在註冊成功後消耗 context，避免重送重記。先查現有 audit 索引與約束，不在未確認下承諾不用 schema 調整。
5. 私有 exporter 從這個 audit 讀 source=blog 及 evidenceType；沒有效 context、過期、不同裝置、拒絕追蹤或衝突就保持 unknown。公開文章事件仍只有文章與來源分類，不含帳號資料。
6. 既有帳號登入不是新註冊，不能回填或覆蓋註冊來源。若要記 assist，另用核准後的明確 POST／既有已驗證寫入邊界，不讓 GET /auth/me 默默寫追蹤，也不修改原 registration30-day window。

### 建議欄位（提案，不是新增的 Tally／API 欄位）

| 欄位 | 型別／來源 | 規則 |
|---|---|---|
| version | 固定1 | schema版本 |
| contextId | 隨機UUID | 同一首次來源context；可與已記錄的 view interactionId 關聯，不作帳號ID |
| firstArticleId | 已渲染內容的public id | 不接受 raw path、email、任意slug推定 |
| firstLocale | zh-TW/en | 已渲染 locale |
| firstSourceClass | 既有分類 enum | 只接受受控分類；來源缺失仍 unknown，非任意UTM字串 |
| firstSeenAt | ISO UTC | 來源觀察時間；server檢查格式、未來與核准lookback |
| lastAssistArticleId / lastAssistAt | public id／ISO UTC，可空 | 不覆寫 first-touch；不保存完整瀏覽歷史 |
| expiresAt | ISO UTC | 保存天數待確認；「30天」僅建議，不能偷用 vendor365天，也不等於啟用視窗已改 |
| evidenceType | 固定browser_reported_context | 不宣稱防偽、已送達Hosted或Tally已提交 |

private audit 才由server加上 newUserId、registeredAt、capturedAt、associationKind=registration或assist、sourceConfidence。瀏覽器不接收 internal member/org ID。Cookie建議正式HTTPS Secure、SameSite=Lax、Path=/、第一方scope；cookie名稱、Domain、保存與清除時機都要核准及實測。private audit保存期限沿用經確認的政策，不能拿cookie期限當已核准的資料保留政策。

## 可選方案與待決策

| 方案 | 影響 |
|---|---|
| 建議：只做第一方 context + server private association | 不新增 vendor identified profile；SQL報表可關聯新註冊，Hosted先保持匿名。仍需核准私有帳號關聯與保存；共享瀏覽器的同人假設有限 |
| 另行核准 PostHog identify | 需server提供專用pseudonymous analytics key、logout/reset及共享裝置規則、同意邊界，且先處理既有 initial person data；不直接把 public profile/internal user ID 交給 vendor |
| 維持匿名 | 不做帳號關聯；新帶領者的 Blog source 繼續 unknown，原FR10不能算完整達成 |

第一個待確認決策：是否允許為了註冊來源與助攻分析，把第一方匿名文章context與本次已驗證帳號作私有關聯？這份文件先提供可審閱方案，不在這裡向使用者追加問題，也不默認同意或選定保存期。啟用 credit／接手既有活動仍是另外的未確認產品規則。

## 核准後的具名連續旅程驗證

用同一瀏覽器、相同具名QA帳號，從真實文章 CTA 開始；Tally權限仍未取得時標明該支UNKNOWN，不能用placeholder算真提交。再沿實際產品登入／註冊到發布、邀請、學員加入及真實參與，回讀同context的私有來源audit與權威操作audit、SDK事件不重複。另驗清cookie／拒絕cookie／換裝置／共享瀏覽器／重送／非法或過期context，全部不可錯綁或變成Direct。驗證可用JWT fixture與Google OAuth證據分開，Hosted收件與本機transport分開；只有真的串過的分支才標PASS。
