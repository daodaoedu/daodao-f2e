# Blog 獲客與帶領者啟用

對應 daodaoedu/daodao#538、母卡#531 FR-06/FR-10、TP-10～TP-12。這份契約區分可觀測事件與尚未可取得的結果，不把文章點擊當成封測申請成功。

## 指標與資料責任

| 層級 | 可計量項目 | authoritative source | 不可推論 |
|---|---|---|---|
| 發現 | 文章索引、Web曝光/點擊、查詢、品牌/非品牌、語言 | GSC；Bing Webmaster Tools另列 | 排名/索引保證、獨立AI流量 |
| 網站 | 文章閱讀、封測CTA外連 | 手動Blog事件；PostHog主要漏斗、GA4整體來源對照 | Tally成功提交、開團、Demo |
| 申請 | 伺服器確認的表單提交ID | Tally合法授權API/webhook或後續人工確認 | 外連點擊數=提交數 |
| 產品 | 發布、邀請名單、加入身分、實際打卡 | backend durable audit + practice_checkins | 發布狀態快照=首次發布時間 |
| 營運 | 邀請、Demo已完成 | 經確認的營運紀錄 | 有邀請信排隊=送達、預約=完成 |

2026-11-13 實查 Tally metrics API 回401，未讀取問卷個資或提交表單。未取得Hosted PostHog/GSC/Bing/GA4帳號回讀證據。因此這些能力是「尚未驗證／不可取得」，不是0申請或0轉換。Tally欄位和表單設定未修改。

Google官方將AI Overviews/AI Mode的網站流量納入GSC Performance的Web整體，不能用此報表單獨拆出AEO轉換。[Google Search Central：AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)（Groundlane全文HTTP200查核2026-11-13）。

## 事件與隱私

`packages/analytics/src/lib/blog-events.ts` 是共用事件來源。文章ID/slug是公開內容契約ID，locale只有zh-TW/en，CTA只有beta-interest，來源僅回傳direct/search/social/internal/unknown；沒有referrer也維持unknown，不將被隱藏的來源冒稱直接造訪。URLquery、原始referrer、姓名、email、教學筆記、邀請token、組織/成員ID不進Browser Blog事件。

`createBlogTracker` 的queued僅表示交給SDK/測試transport，不表示Hosted ingest成功。相同interaction_id只排隊一次；transport未就緒或失敗不消耗該ID，可重試。閱讀與CTA為不同事件，不建立submitted事件。來源分類不保留任意UTM值，陌生/無法解析的來源維持unknown。

SDK `before_send` 使用相同經測試的self-contained hook：Blog自動事件不傳送，手動事件只保留限定欄位，移除query/fragment及profile setters；其他產品事件維持原流程。網站明確停用Clarity與PostHog Session Replay（產品App預設不變），GA4 Blog context只提供無query/fragment的URL與origin-only referrer。實際網站客戶端的SDK capture測試transport已回讀，但Hosted ingest與第三方遠端設定仍未驗證，不宣稱全平台隱私認證。

## 30天定義與分母

實際exporter拒絕未來asOf並記錄capturedAt；evaluator必須收到capturedAt及evidenceMode。asOf不能超過已擷取覆蓋時間；observed模式也拒絕未來擷取時間，只有明確fixture可使用已宣告覆蓋的合成時鐘，輸出會保留fixture標示。

`evaluateLeaderActivation` 使用註冊時間起算30×24小時的半開區間 [registeredAt, registeredAt+30days)，檢查至明確asOf。資格仍以註冊日起算，不改成取得組織身分的日期。

目前「新帶領者接手既有已發布活動是否計啟用」仍待產品確認。實際匯出保留原始publisher actor，但publicationCreditPolicyConfirmed=false且publication coverage維持未知；不得把actor-only模型冒稱已批准。完整正向交集證據在兩種候選定義下均可成立；缺正向證據暫不能推出not_activated。

同一帶領者、組織、場次須有真實發布證據；至少一位不同於該帶領者、在場次中是member且不是組織管理成員的人，有可配對enrollment的邀請與加入證據，並在發布後完成實際參與。現在的實際參與映射是practice_checkins.created_at透過practices.cohort_id，不讀note/mood/images。加入或信件排隊不能替代打卡。

- activated：已有完整正向證據，即使觀察窗未滿也可確認已發生。
- observing：來源完整但30天未滿，不能當失敗或進成熟分母。
- not_activated：窗已滿且必需來源完整，仍無完整正向證據。
- unknown：缺必需來源或政策未確認且無可證明的正向結果，列為成熟未知，不混成已確認未啟用。

結果分開去重leaderId、organizationId、cohortId；重送eventId不重算，衝突eventId直接拒絕。learner與unclassified另外計數。matureCohort.denominator保留所有已滿窗的可觀測帶領者，known與unknown分開列；只要存在成熟未知，point rate就是null，不能只拿已知正向者算100%。分母為0時也回null，不把尚未滿窗者放進成熟分母。

目前source exporter將「目前有active組織管理權限的人」標為observed platform leader，依現有assertProgram的organization_members管理權限判定；場次member另列learner，其餘unclassified。這不是老師身分辨識，也不是所有新註冊者的帶領者轉換率。身分為回讀時快照，無歷史角色變動時無法還原註冊當下意圖；不只挑已發布者當分母。若要量測所有教師/社群負責人，仍需可驗證且有授權的角色/來源資料。

## 後端證據來源

- `daodao-server/src/services/cohort-activation-evidence.service.ts`：同一業務交易內保存首次觀察到的發布/加入audit；advisory lock及NOT EXISTS使併發/重試不重複，不改先前時間。這不是對既有場次首次歷史發布時間的追溯。
- `cohort.service.ts`：成功建立published場次或狀態轉為published時記錄；單純published編輯不產新事件。
- `cohort-invitation.service.ts`：保留既有邀請聚合audit，另以同一SQLstatement/交易新增cohort_activation_invited的enrollmentIds證據。這代表target-created定向意圖，不代表整個API操作成功、queue已接收、已寄出、送達或開信；queue在交易後可能失敗，這些階段不可互相代替。沒有email/token；只有原本aggregate counts的舊audit不猜收件人。
- `cohort-join.service.ts`：成功加入後同交易保存enrollment/role及管理身分；v2以持久化joined_at作同次加入的穩定joinTransition，同enrollment退出/再邀請/再加入會保留新時間與角色，重試不多算。public link已加入的同帳號重試也不重寫joined_at。邀請token本身從不寫audit。
- `practice-checkin.service.ts`：實際建立checkin後，在同一交易記錄cohort/checkinId與當時角色/管理身分，沒有note/mood/token；無對應真實checkin資料或角色證據不算參與。
- `blog-activation-export.service.ts`：只讀IDs與時間，完整輸出指定註冊期間的使用者分類，回傳coverage與來源限制。參與以同交易audit保存的管理身分/場次角色判斷，不拿事後組織快照冒充歷史角色。未有角色證據的歷史打卡維持unknown。註冊受眾分類仍有現有角色快照限制。

`cohorts.updated_at`不能充當首次發布時間；公開加入也可能有`cohort_enrollments.invited_at`預設值，不能拿它證明曾收到邀請。現有聚合邀請audit無enrollmentIds、場次歷史早於instrumentedSince時coverage保守不完整，沒有正向證據就回unknown。新增量測不回填虛構歷史。

## 私有報表操作

從已部署版本/實際設定記下instrumentedSince。使用唯讀DSN，明確指定註冊起點、asOf和私有輸出，避免不受控報表範圍。

```sh
# daodao-server；BLOG_ACTIVATION_EXPORT_DATABASE_URL由私有環境提供，勿貼進文件/log
pnpm exec ts-node scripts/export-blog-activation.ts --registered-since "$REGISTERED_SINCE" --as-of "$OBSERVED_AS_OF" --instrumented-since "$INSTRUMENTED_SINCE" --output /private/blog-evidence.json
# daodao-f2e
pnpm --filter @daodao/analytics activation:report --input /private/blog-evidence.json --output /private/blog-report.json
```

先將三個日期變數設定為已查證的ISO時間；OBSERVED_AS_OF不得超過目前實際擷取時間，不能預先產生未來30天結果。輸出檔以0600且不覆蓋既有檔案建立，不可放public/articles/images。opaque IDs仍是內部分析資料，不混進公開文章。CLI不會自行查Tally、發布文章或送事件到Hosted analytics。

## 固定AEO樣本與每月人工紀錄

固定題庫在[aeo-questions.json](aeo-questions.json)：版本1共20個問題ID，各有zh-TW/en prompt。18題為非品牌情境，2題為明示品牌情境；分段讀取，不將品牌題和一般題合併成有利的提及率。題庫不是已取得的模型回答。

每月複製[aeo-monthly-observations.template.csv](aeo-monthly-observations.template.csv)為當月私有紀錄，20題×2語共40列。保留question_version/id/prompt，填實際period、observed_at、模型及可見版本、區域和登入條件；版本/區域不可取得就留unknown。條件改變另開序列，不覆寫舊基準。

模板全部status=not_measured、提及/引用/正確性=unknown，沒有預填回覆、引用或排名。真正量測時才填observed、保存實際回答artifact及引用URL，再逐項判讀是否提及島島、是否引用daodao.so、來源是否支持主張、產品描述是否符合當時核准事實。受阻寫blocked與原因；未測/受阻不算0。月度總表同時列eligible題數、observed、blocked、not_measured；只有實測回覆才進提及/引用率分母，分母0回unknown，不能拿缺測算沒有引用。

這是固定問題的人工抽樣，不代表所有使用者/模型結果；不得將chatbot referrer點擊直接當成模型引用證據。未知來源維持unknown。每週網站流量巡檢可另做，不能替代原FR-06要求的每月固定樣本/條件/結果紀錄。

GSC/Bing每週按實際文章canonical路徑、語言及品牌/非品牌查詢讀取，分開保留收錄狀態與流量。GA4看整站來源/頁面，PostHog看明確漏斗，不將兩者匿名ID強拼成跨裝置身分。表單提交/營運Demo/產品啟用的串接鍵需要另有授權證據，未建立就分表報告。

## 本機證據與尚未交付的驗收

工程目前已用disposable PostgreSQL執行durable writer/export；再把真SQL輸出餵給實際evaluator CLI，正向受控fixture結果：1觀測帶領者、1學員、1未分類、1啟用、成熟分母0(rate=null)。這是本機fixture，不是正式產品成效。

本機實際Next/React頁面的StrictMode單次閱讀、滑鼠/鍵盤CTA、來源、query/fragment排除及英文列表無虛構文章ID已回讀SDK測試transport。PR檢查、dev部署/Hosted ingest回讀、Tally授權、完整#539受控旅程須各自記錄。未完成這些，不以單元測試或本文件宣稱#538/#531 Done。
