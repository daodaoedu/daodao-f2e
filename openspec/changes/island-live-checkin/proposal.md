# 活動島即時 check-in（末班船）

> Change ID: `island-live-checkin`
> 建立日期：2026-07-29
> 影響 repo：daodao-f2e、daodao-server、daodao-storage、（daodao-ai-backend：後期選配—AI 出題）

## Why

真正要解的問題不是「做一個計時器」，而是**一起學習難以持續**。目前的 check-in 掛在 practice 底下（`practice_checkins`），純非同步：各自打卡、事後被動被看到。以第一性原理拆解，「持續」是一道每次都要成立的不等式：

```
被看見 + 被回應 + 感覺有進展  >  時間 + 力氣 + 落後的羞恥感
```

群體學習的三種死法，現有機制都沒有對治：

1. **沒人注意到我沒來**——缺席無聲，義務感蒸發。
2. **回饋密度衰減**（最常見）——非同步打卡攤平在 24 小時，人人感覺對空氣說話。
3. **羞恥螺旋**——缺席一次 → 落後 → 重返成本墊高 → 永遠離開。

本 change 在小島 3D 世界（island-engine）加入**限時共同 check-in 儀式**：把同樣的活動量濃縮進同一個 10 分鐘時窗（對治死法二），讓在場與缺席都被看見（死法一），並配套「重返機制」壓低回頭成本（死法三）。

## What Changes

### 儀式時間軸（產品面）

| 階段 | 島世界的說法 | 機制 |
|---|---|---|
| 活動開始 | 🚢 港口出現往活動島的船班 | 固定週期排程（預設週更），5~10 人小團 |
| 進行中 | 登島、看到別人的立牌、回答題目 | 貼便利貼上牆（蓋牌狀態，看得到有人貼、看不到內容） |
| 倒數 | 🔥 營火漸熄／天色漸暗 | client 以 `closes_at` 自算，純演出 |
| 截止 | ⛵ 末班船開走 | server 端不變式 `now < closes_at` 才准寫入；遲到者物理上到不了島 |
| 揭曉 | 🎆 倒數歸零，全部便利貼同時翻開 | 各 client 依共享時鐘同步翻牌，不需推播 |
| 散場後 | 🏛 活動島變**遺跡島** | 可回訪的共同記憶，便利貼牆永久保留 |

### 缺席重返機制（與末班船成對，缺一不可）

- 缺席者在營火圈留下一支**未點燃的火把**——事實陳述式的缺席可見，不需任何人動手，也不表演情感。
- 那場的題目裝進**瓶中信**留在火把旁；缺席者回訪遺跡島可**補答**，貼在牆邊的瓶中信區（明確標示事後，不混入正式牆——末班船守護的共時稀缺性毫髮無傷）。
- 對補答的回應走**既有 reaction/comment 機制**，自願發生。刻意不做「想你紙條」類的情感模板：被規定的溫暖是假的（零成本＋罐頭＋系統發起），還會讓真的想念無法被辨識。
- 補答旁直接放**下一班船票**（重返成本最低化）。

### 活動島（引擎面）

- 新島型：**無主公共島**，非任何使用者的個人島；seed 用 event id（維持引擎 deterministic 哲學——活動狀態是資料疊加層，不污染生成核心）。
- 在場者以**立牌/角色**呈現（check-in 後出現），polling 刷新；不做連續走動同步。
- 題型 MVP 先支援：開放題（便利貼短文）；投票題與溫度計題（可接既有 `CheckInMood`）列為第二批。

### API / 資料（後端面）

- 活動場次：`opens_at` / `closes_at` server 權威時間戳；建立、查詢、報名/搭船。
- **Snapshot endpoint**：回傳完整現況（誰在島上、牆上貼紙、closes_at、揭曉了沒）。這支同時是 polling 的資料源，也是未來任何 realtime 升級的斷線補償機制。
- Check-in 寫入：驗證 `now < closes_at`，逾時回明確錯誤（f2e 演「末班船開走」）。
- 火把與瓶中信：缺席名單推導（成員 − 出席者）；補答寫入（標記為事後，與正式 check-in 區分）；補答的回應沿用既有 reaction/comment。

## Design Decisions

### D1. Polling + snapshot 是正確形態，不是湊合方案
資訊量拆到底：一場 10 人 × 每人 2~3 張 ≈ 30 事件 / 10 分鐘，平均每秒幾 bytes。人類感知門檻：「貼紙冒出來」staleness ≤ 5s 即可、「他也在場」分鐘級即可；唯一需要 <300ms 的是「看別人連續走動」——那是可單獨購買的後期選配（屆時 socket.io + 既有 ioredis；PM2 cluster 需 Redis pub/sub、nginx 加 Upgrade header、藍綠部署需重連補償＝本 snapshot）。MVP **零新增基礎建設**。

### D2. 揭曉靠共享時鐘，不靠訊息
server 只給一次 `closes_at`，每支手機以 NTP 校準過的本地時鐘自行倒數與翻牌。全場最戲劇化的同步時刻，網路延遲與斷線都無關。

### D3. 末班船的不可協商性 × 重返機制，成對出貨
硬截止給準時者儀式感（BeReal 機制），但單獨存在會加速死法三（羞恥螺旋）。兩者必須同一版釋出——只做末班船不做火把，是把 churn 加速器當產品出。

### D4. 節奏預設週更、5~10 人
頻率越高單次出席率越低，小團 3 人缺席就「感覺冷清」；「每次都熱鬧」勝過「常常但冷清」。週期為可調參數，之後以出席數據校準。

### D5. 遺跡島保留而非沉沒
「感覺有進展」需要共同記憶的實體——遺跡島是群體版進度條。不採限動式消失。

## Cross-Repo Scope（依 system-map SOP，順序固定）

1. **daodao-storage**：`migrate/sql/{下一序號}_add_island_events.sql`——`island_events`（場次、opens_at/closes_at、題目、seed）、`island_event_checkins`（回答、蓋牌狀態不需欄位——由時間推導；含事後補答標記，如 `is_late` 或以時間戳推導）；同步回寫 `schema/`。
2. **daodao-server**：prisma schema → `prisma:generate` → `schema:drift`；新增 event CRUD、snapshot、check-in（含 `now < closes_at` 不變式；補答走同 endpoint 但標記事後）；Zod validators 註冊 openapi。
3. **daodao-ai-backend**：MVP 不動（無新 ORM 對映需求則免）；後期選配：依島上動態生成題目。
4. **daodao-f2e**：等 `sync-openapi` 或手動 `gen:types`；island-engine 新增活動島模式（無主島、立牌、營火倒數、便利貼牆、翻牌演出）；product app 新增場次入口（港口船班）與 check-in 表單。

## Out of Scope

- WebSocket／連續走動同步（D1 的後期選配，另開 change）。
- AI 出題（ai-backend 後期選配）。
- 投票題結果統計圖、排名題（第二批題型）。
- mobile（Expo）版活動島。
- 場次的自訂排程 UI（MVP 用固定週期設定值）。

## Risks / Notes

- **3D 多角色效能**：手機上同時渲染 10 個立牌/角色 + 個人島資產，需靠既有 quality tier 降級；立牌可用 billboard 而非全 3D 角色起步。
- **時鐘偏差**：極少數裝置時鐘不準會導致翻牌時刻不一致；server 的 snapshot 可回傳 `server_now` 供 client 校正偏移。
- **跨 repo 節奏**：f2e 的表單與引擎演出可先以 mock data 開發（island-engine 零 API 依賴的設計正好支持）；接線等 server 欄位上 dev 後進行。
- **社群設計風險**：火把的語氣必須是中性的事實陳述，不是「被追蹤」；補答的呈現不可帶補償/懲罰色彩。文案與視覺需與社群夥伴確認。刻意排除任何情感模板（如罐頭「想你」）——被規定的溫暖會讓自願的回饋貶值。
