# 活動島即時 check-in — Tasks

> Change ID: `island-live-checkin`
> 順序依 system-map 跨 repo SOP：storage → server → f2e。
> f2e 引擎與 UI 可用 mock data 與後端並行（island-engine 零 API 依賴），僅「接線」任務需等 server 上 dev + sync-openapi。

## 1. daodao-storage

- [ ] 1.1 `migrate/sql/{下一序號}_add_island_events.sql`：`island_events`、`island_event_checkins`（含 UNIQUE (event_id, user_id)、CHECK (closes_at > opens_at)）
- [ ] 1.2 reaction/comment 多型 target 擴充 `island_event_checkin`（enum/CHECK 允許值）
- [ ] 1.3 同步回寫 `schema/` 對應檔；`make migrate-sql-dev` 套用

## 2. daodao-server

- [ ] 2.1 `prisma/schema.prisma` 加兩表 → `prisma:generate` → `schema:drift` 驗證
- [ ] 2.2 island-event service：場次 CRUD、snapshot 組裝（蓋牌裁切、serverNow、absentees 於截止後）、check-in 寫入（opens_at/closes_at 不變式、cohort 成員驗證）
- [ ] 2.3 routes + Zod validators + `registry.registerPath`（openapi 自動生成）
- [ ] 2.4 reaction/comment 允許值加 `island_event_checkin`（TS 常量同步，對應 1.2）
- [ ] 2.5 缺席補寄：BullMQ delayed job（建場次排入/刪場次撤銷）＋ email 模板（比照 cohort-weekly-digest；措辭紅線：邀請不催討）
- [ ] 2.6 cohort 排程設定（MVP 固定週期值）自動開場次
- [ ] 2.7 測試：不變式（早到/準時/補答三態）、蓋牌裁切、缺席名單推導

## 3. daodao-ai-backend

- [ ] 3.1 確認新表無 ORM 對映需求（無則跳過）；1.2 的 enum 值若涉及 Py 常量則同步（schema-sync-check 會抓）

## 4. daodao-f2e — 引擎（可先行，mock data）

- [ ] 4.1 island-engine 活動島 variant：無主島、seed=`event-${id}`、無個人植栽
- [ ] 4.2 entities：營火（燃燒度=剩餘時間函數）、便利貼牆（蓋牌/翻開）、立牌（billboard）、火把、瓶中信
- [ ] 4.3 `IIslandObjectClickPayload` 擴充 + `reveal()` 方法
- [ ] 4.4 dev harness（`dev/main.ts`）加活動島 mock 場景；quality tier 驗證低階裝置

## 5. daodao-f2e — 產品（接線需等 2.x 上 dev）

- [ ] 5.1 等 `sync-openapi`（或手動 `gen:types`）取得新 types
- [ ] 5.2 `packages/api` island-event service + polling hooks（open 期間 3–5s）
- [ ] 5.3 港口船班入口（cohort 頁 + harbor 點擊點）
- [ ] 5.4 check-in 表單（`use-form-draft`）、倒數 UI（serverNow 校正）、末班船已開走畫面
- [ ] 5.5 揭曉演出接線（closesAt 觸發 reveal）、遺跡島瀏覽、瓶中信補答流程
- [ ] 5.6 i18n（zh-TW / en）與 analytics 事件（依 analytics-tracking-guide）

## 6. 收尾

- [ ] 6.1 docs/product 功能狀態更新；system-map 若呼叫關係有變則六 repo 同步
- [ ] 6.2 驗證整場流程：開船 → 登島 → 蓋牌貼牆 → 末班船 → 揭曉 → 補寄 → 補答 → 下一班船票
