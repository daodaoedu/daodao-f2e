# 我的小島 × 學習生活（LifeWarehouse 重構）設計文件

- 日期：2026-07-07
- 狀態：Draft（POC）
- 相關分支：`feat/community-challenge-poc`
- 前置：PR #861（LifeWarehouse POC 初版，本設計將重構之）
- 參考：`~/Downloads/D-LifeWarehouse.dc.html`（原始視覺概念稿）

## 1. 背景與問題

### 1.1 「我的小島」意義尚未顯現

目前個人頁（`/users/[identifier]`）的「島」只是裝飾：靜態 banner、persona Lottie、學習類型卡，
下方是資料類型的平鋪堆疊（UserInfoCard → LifeWarehouse 五 tab 儀表板 → PracticeSection 全列表）。
島不是一個「地方」，資訊全部攤開、沒有層次（與 `/users/Aaa` 現況問題一致）。

### 1.2 生態圈缺「理解期」

島島現有模塊回答了「學什麼（實踐）」「誰陪我學（挑戰、陪伴）」「我走了多遠（季度報告）」，
但沒有模塊回答「**我在什麼狀態下學得最好**」。LifeWarehouse 補的是這個回饋迴路：
從「持續做」到「越做越懂自己」。

### 1.3 PR #861 的落差

已合併的 LifeWarehouse 初版是視覺稿的直接移植，與討論結論有四個落差：

| 面向 | PR #861 現況 | 本設計 |
|---|---|---|
| 資訊架構 | 五平行 tab，總覽八區塊疊一頁 | 按提問深度三層揭露 |
| 資料中心 | 泛用生活指標（步數、咖啡、花費、心率、喝水） | 以學習為中心，打卡是主角 |
| 打卡整合 | 無 | mock 資料鏡射 `CheckInEntity`，可換真 API |
| 島頁呈現 | 整個儀表板 inline 塞島頁頂部 | 島頁只放摘要卡，完整頁獨立路由 |

## 2. 架構原則

### 原則一：島是容器，模塊是島上的「地方」

每個模塊對應島的一個部位，且各部位由真實資料驅動：

```
島的地貌 ＝ 累積的學習（實踐、作品；打卡是沉積、實踐是建築）
島的天氣 ＝ 當下的狀態（心情、精力、今日節奏 — 學習生活）
島的性格 ＝ 人物誌（L/C/A/D/O）
島的年輪 ＝ 歷史（季度報告）
島的港口 ＝ 與其他島的連結（挑戰＝群島遠征、陪伴＝航線）
```

島頁上每個模塊**只以一張摘要卡存在**，完整內容在自己的路由。
三層揭露對應空間隱喻：

```
遠景（看到整座島）＝ 島頁：全是摘要卡，一眼看完，零攤開
走近（走到某地方）＝ 點卡片 → 模塊完整頁
深入（探索細節）  ＝ 模塊內下鑽
```

### 原則二：公開／私有＝敘事分界

訪客「從海上看島」（展示），島主「住在島上」（生活）。`isOwnProfile` 決定敘事而不只是權限。

### 原則三：島必須是活的

島景 header 反映真實狀態（天氣系統），島才真正「代表」島主。

### 原則四：打卡零阻力

打卡表單**不新增任何欄位**。生活脈絡（DailyRecord）是獨立、可選、一鍵式的記錄流。

## 3. 導航架構

```
/mine                    工作台（doing）：今天要做的實踐。乾淨、行動導向
/users/[identifier]      我的島（being）：身分模塊的地圖（摘要卡集合）
/me/learning-life        學習生活完整頁（今天／洞察）
/me/challenges           我的挑戰（既有 POC）
/quarterly-report        季度報告＝島的年輪（既有 POC）
```

`/mine` 不再放身分性入口（PR #861 已移除季度報告卡，方向延續）。

## 4. 島頁資訊架構

```
[島景 Header]        活的：天氣系統反映今日狀態（見 §7）
[UserInfoCard]       島主名牌（既有，不動）

── 私有層（僅 isOwnProfile）──
[今日天氣卡]         今天打卡了嗎＋心情/精力摘要 → /me/learning-life（今天 tab）
[節奏洞察卡]         本週一句話發現＋7天迷你趨勢 → /me/learning-life（洞察 tab）
[年輪入口卡]         季度報告入口（從 /mine 移過來的歸宿）

── 公開層 ──
[島上建築]           PracticeSection（既有；後續可再摘要化，本期不動）
[島的性格]           人物誌 tab（既有 PracticeSection 子 tab，本期不動）
```

本期範圍：加入私有層兩張摘要卡（今日天氣、節奏洞察）＋移除 inline 的 LifeWarehouse。
年輪入口卡與 PracticeSection 摘要化為後續迭代。

## 5. 學習生活頁（`/me/learning-life`）

兩個主 tab＋下鑽，取代五平行 tab：

```
Tab「今天」＝ 記錄＋今日故事
  ├ 快速記錄：精力(1-5)、睡眠時數、環境標籤 — 一鍵式，30 秒完成
  ├ 今天的打卡：跨實踐的當日打卡卡片（視覺主角、品牌色）
  └ 未打卡時：導向實踐打卡的 CTA

Tab「洞察」＝ 三層漸進揭露
  ├ 第一層 Hero：本週一句話摘要＋7 天迷你趨勢（唯一焦點）
  ├ 第二層：精選洞察卡 × 最多 3 張（一句結論＋小圖，可下鑽）
  └ 第三層（下鑽 view，不在首屏）：
      ├ 趨勢全集（打卡頻率、心情、精力長期線）
      ├ 每日回顧（日期選擇器＋當日打卡與脈絡合併）
      └ 相關性全列表（r 值＋散點圖）
```

視覺主從：打卡卡片＝完整卡＋品牌色（logo-cyan）；生活脈絡＝中性色小 pills；
洞察＝漸層 banner（標示「系統發現」）。mock 資料區塊以「示意資料」輕標示（角落小字），
不破壞體驗完整感。

洞察文案全部使用學習語境，例：

- 「#圖書館 的日子，你的專注品質高 40%」
- 「睡滿 7 小時的隔天，打卡率高 1.8 倍」
- 「參加挑戰期間，你的打卡頻率是平常的 2.3 倍」

## 6. 資料模型

### 6.1 CheckIn（學習事件）— 主角

結構完全鏡射既有 `CheckInEntity`（`mood` / `tags` / `note` / `checkinDate` / `imageUrls`）＋ `practiceTitle`。

- 90 天歷史打卡：mock（因為「我的所有打卡（跨實踐、按日期）」API 不存在）
- 便宜的真實資料照用：`useMyPractices` 的 `lastCheckinAt`、`checkInCount`、`useMyPracticeStats`

### 6.2 DailyRecord（每日脈絡）— 配角，瘦身版

```ts
interface DailyRecord {
  date: string;              // 唯一 key
  energy: number;            // 1-5
  sleep: number;             // 小時
  focus: number;             // 專注品質 1-5
  exercise: number;          // 分鐘
  stress: number;            // 1-5
  contextTags: string[];     // #在家、#圖書館、#咖啡廳…
  note: string;
  source: Record<string, MetricSource>;  // manual | csv-import | integration | mock
}
```

自 PR #861 移除：`steps`、`coffee`、`spend`、`water`、`heartRate`、`intention`、`reflection`、
`mood`（心情歸打卡，避免兩處記錄）。移除的指標改為「自訂追蹤欄位」的示意選項
（追蹤設定 UI 保留概念展示，不實作儲存）。

儲存沿用 PR #861 的 mock-store 模式（`useSyncExternalStore` + sessionStorage）。

### 6.3 Insight（洞察）

POC：mock 寫死＋少量真計算（7 天打卡頻率、平均心情等能便宜算的）。
每張洞察卡：`{ conclusion, evidence(chart type + data), drillDownTarget }`。

## 7. 天氣系統（島的活性）

島景 header 依狀態疊加天氣效果，規則（POC 版）：

| 狀態 | 資料來源 | 天氣 |
|---|---|---|
| 今日已打卡 | `lastCheckinAt`（真）或 mock | 晴天 ☀️ |
| 連續 7 天以上 | streak | 彩虹／特效 🌈 |
| 1-2 天沒打卡 | | 多雲 ⛅ |
| 3 天以上沒動靜 | | 陰天 🌫 |
| 今日精力記錄 ≥ 4 | DailyRecord（mock store） | 小動物活力動畫加速 |

實作：header 疊加 CSS/SVG 效果層，不動既有 Lottie 與 banner 圖。規則引擎獨立成
`island-weather.ts`（純函式：狀態 → 天氣），供 header 與今日天氣卡共用。

## 8. 對 PR #861 的重構對照

| PR #861 資產 | 處置 |
|---|---|
| `mock-store.ts` 模式 | 保留模式，schema 換瘦身版 DailyRecord |
| `sparkline-card` / `mood-bar-chart` / `correlation-card` / `metric-pill` / `tag-*` | 重用於洞察下鑽層 |
| `period-selector` | 重用於下鑽層 |
| 五 tab（overview/correlations/trends/day/track） | 拆解：track→「今天」快速記錄；day→下鑽每日回顧；trends/correlations→下鑽；overview→解散（Hero＋精選卡取代） |
| `connected-services-grid` | 移到「今天」tab 底部（計畫中服務標示） |
| 島頁 inline `<LifeWarehouse />` | 移除，改為兩張摘要卡 |
| sidebar／mine 清理 | 保留 |

## 9. POC 要驗證的產品假設

1. 「理解自己的學習模式」是否被使用者需要（洞察 tab 的互動率）
2. 低阻力每日脈絡記錄是否可持續（快速記錄的完成率）
3. 活的島是否增強身分認同（島頁停留與回訪）
4. 論證新 API：`GET /api/v1/me/checkins?from=&to=`（跨實踐按日期查詢）

## 10. 非目標（本期不做）

- 打卡表單改動（零阻力原則）
- 真實資料匯入（CSV／OAuth 整合）；資料模型以 `source` 欄位預留
- 自訂追蹤欄位的實際儲存（僅 UI 概念）
- PracticeSection 摘要化、年輪入口卡、訪客可見的天氣
- 後端 API 開發
