# 活動島即時 check-in — 技術設計

> Change ID: `island-live-checkin`
> 前置閱讀：`proposal.md`（why 與設計決策 D1–D5 不重複於此）

## 1. 領域模型：掛在 cohort 上

5~10 人小團**直接使用既有 `cohorts`**（成員 = `cohort_enrollments` where status=joined），不自建成員系統。

- 缺席名單 = joined 成員 − 該場出席者，現成可推導。
- 補寄 job 可比照 `cohort-weekly-digest.service.ts`（BullMQ + email 的現成前例）。
- 排程週期掛在 cohort 設定（MVP 用固定值，不做自訂 UI）。

## 2. 場次狀態機（全部由時間推導，無狀態欄位）

```
              now < opens_at        opens_at ≤ now < closes_at      now ≥ closes_at
              ─────────────         ──────────────────────────      ────────────────
  狀態         scheduled             open（登島、貼牆、蓋牌）          revealed（遺跡島）
  可 check-in     ✗                       ✓（正式）                    ✗（僅補答）
  牆面可見性      —                   只見張數不見內容                  全部翻開
```

**沒有 `status` 欄位**——狀態是 `(opens_at, closes_at, now)` 的純函數。這消滅了排程翻狀態的 job、也消滅了狀態與時間不一致的 bug 類型。翻牌時刻由各 client 依共享時鐘自行觸發（D2）。

## 3. 資料模型（daodao-storage）

```sql
-- island_events：場次
id            SERIAL PK
cohort_id     INT NOT NULL REFERENCES cohorts(id)
question      TEXT NOT NULL              -- MVP 單題開放題
opens_at      TIMESTAMPTZ NOT NULL
closes_at     TIMESTAMPTZ NOT NULL       -- CHECK (closes_at > opens_at)
created_by    INT REFERENCES users(id)   -- NULL = 系統排程產生
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()

-- island_event_checkins：貼紙（正式與補答同表）
id            SERIAL PK
event_id      INT NOT NULL REFERENCES island_events(id)
user_id       INT NOT NULL REFERENCES users(id)
content       TEXT NOT NULL
created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
UNIQUE (event_id, user_id)               -- 一人一場一張（MVP）
```

**補答不設欄位**：`created_at > closes_at` 即為補答（瓶中信區）。與狀態機同一原則——能由時間推導的都不落欄位。

- 缺席補寄的寄送記錄沿用既有 email log 機制（比照 weekly digest），不新增表。
- reaction/comment 沿用既有多型機制對 `island_event_checkins` 掛target type（依既有 `reaction.validators.ts` 的 pattern 擴充允許值——此為 enum/CHECK 類變更，需照 system-map 同步 server TS 常量與 ai-backend Py 常量）。

## 4. API（daodao-server）

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/v1/cohorts/:id/island-events` | 場次列表（含下一班船） |
| POST | `/api/v1/cohorts/:id/island-events` | 建立場次（cohort 幹部；MVP 可先只靠排程） |
| GET | `/api/v1/island-events/:id/snapshot` | **核心**：完整現況（見下） |
| POST | `/api/v1/island-events/:id/checkins` | 寫入；server 驗證身分為 cohort 成員 |

### Snapshot response（polling 資料源＝未來斷線補償，D1）

```jsonc
{
  "event": { "id", "question", "opensAt", "closesAt" },
  "serverNow": "…",            // client 校正時鐘偏移用（risk: 時鐘偏差）
  "participants": [            // 已出席者（立牌渲染用）
    { "userId", "name", "photoURL", "checkedInAt" }
  ],
  "wall": [                    // now < closes_at 時 content 一律為 null（蓋牌）
    { "checkinId", "userId", "content", "isLate" }
  ],
  "absentees": [ { "userId", "name" } ]   // 火把渲染用；closes_at 後才回傳
}
```

- **蓋牌在 server 端裁切**：截止前 snapshot 不出 content，client 想偷看也沒有資料。
- 寫入不變式：`now < closes_at` → 正式；`closes_at ≤ now` 且場次屬已結束→ 允許但即為補答；超前 `opens_at` → 拒絕。
- Polling 間隔：open 期間 3–5s，遺跡島靜態載入即可。

## 5. f2e

### island-engine（保持零 API 依賴，React 殼餵資料）

- `IIslandData` 新增活動島 variant（或新 entry：`IEventIslandData`）——無主島：無 profile 島主、seed = `event-${id}`、無個人 practices 植栽。
- 新增 entities：營火（倒數演出，燃燒程度 = 剩餘時間函數）、便利貼牆（蓋牌/翻開兩態）、立牌（billboard 起步，效能 risk 對策）、火把、瓶中信。
- 事件擴充 `IIslandObjectClickPayload`：`{ kind: "wall-note" }`、`{ kind: "bottle" }` 等。
- 翻牌演出由殼層依 `closesAt - (serverNow - localNow)` 觸發，engine 只提供 `reveal()` 方法。

### apps/product

- 港口船班入口（cohort 頁 + 個人島 harbor 既有點擊點）。
- check-in 表單（沿用 `use-form-draft` 草稿機制）、倒數 UI、揭曉後牆面瀏覽。
- polling hook 比照 `packages/api` 既有 service + hooks pattern；`snapshot` types 等 `sync-openapi` 生成。

## 6. 缺席補寄 job

- `closes_at` 到點：BullMQ delayed job（建場次時排入；場次刪除時撤銷）。
- 內容（全事實層，proposal 措辭紅線）：題目、參與概況、揭曉牆連結、補答入口、下一班船時間。
- 對象：joined 成員 − 出席者；走既有 email/通知管道，比照 weekly digest 的模板結構。

## 7. Edge cases

| 情境 | 處理 |
|---|---|
| client 時鐘偏差大 | 以 `serverNow` 校正偏移；寫入永遠 server 裁決，演出誤差無實害 |
| 貼完最後一秒才送達 | server 以收到時間裁決；差幾秒被判補答屬可接受行為（訊息文案要溫和） |
| 場次無人出席 | 補寄照發（內容改為「這場沒有人趕上船」）；遺跡島仍生成，空牆本身是資訊 |
| 同 cohort 場次重疊 | 建立時 server 驗證不重疊（MVP 排程制天然不重疊） |
| 手機低階裝置 | 立牌 billboard、既有 quality tier 降級；活動島無個人植栽負擔，物件數可控 |
