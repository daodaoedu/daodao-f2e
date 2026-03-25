# 社群連結生態漏斗（Community Connection Funnel）

**日期：** 2026-03-25
**目標：** 建立漸進式社群連結機制，降低學習孤獨感，從零成本的被動感知到長期人際關係

---

## 1. 背景與問題

### 核心問題

> 一個人學很孤單，容易放棄。

目前平台上的學習者彼此之間沒有自然的連結路徑。即使有 Follow、Buddy、Connection 等 API 端點，缺乏一個引導使用者從「陌生」走向「連結」的漸進式體驗。

### 設計原則

- **每一層的摩擦極低** — 永遠是零或一次點擊
- **漏斗頂部夠寬** — Level 0 自動、零成本，確保大量使用者進入
- **每一層本身就有價值** — 不是為了到下一層才存在。光是 Level 0 看到別人在學，就已經降低孤獨感
- **往下一層的轉換自然發生** — 不強迫，不推銷

---

## 2. 漏斗架構

```
     ┌─────────────────────────────────────┐
     │  Level 0: 看到學伴 (Companion)       │  ← 所有有實踐的人，自動進入
     │  預估 100% 有實踐的登入用戶           │
     └───────────────────┬─────────────────┘
                         ▼
        ┌────────────────────────────────┐
        │  Level 1: Reaction             │  ← 一次點擊
        │  預估 ~40%                      │
        └────────────────┬───────────────┘
                         ▼
           ┌─────────────────────────────┐
           │  Level 1.5: Follow          │  ← 一次點擊，單向
           │  預估 ~15%                   │
           └─────────────┬───────────────┘
                         ▼
              ┌──────────────────────────┐
              │  Level 2: Buddy          │  ← 一次點擊 + 對方接受
              │  預估 ~5%                 │
              └──────────┬───────────────┘
                         ▼
                ┌────────────────────────┐
                │  Level 3: Buddy 互動    │  ← 留言、鼓勵
                │  預估 ~2%               │
                └────────┬───────────────┘
                         ▼
                  ┌──────────────────────┐
                  │  Level 4: Connection │  ← 長期關係
                  │  預估 ~1%             │
                  └──────────────────────┘
```

---

## 3. 各層級定義

### Level 0: 學伴（Companion）— 自動、零成本

**是什麼：** 系統根據 tag 重疊自動配對，使用者不用做任何事就會看到的人。

**不是什麼：** 不是關係，不需要建立或維護。對方不知道你看到了他。

**比喻：** 圖書館裡坐在同一區的陌生人。

#### 配對機制

- **條件：** 雙方各自有至少一個「進行中」的實踐，且實踐的 tags 有交集（case-insensitive）
- **起算點：** 使用者建立實踐並加上 tag 的那一刻，即時生效
- **排序：**
  1. 重疊 tag 數量越多越前面
  2. 同樣重疊數，最近有打卡的排前面（活躍優先）
- **MVP 門檻：** 1 個 tag 重疊即算，不設最低要求

#### 生命週期

```
建立實踐 + tag
    │
    ▼
學伴自動出現（即時）
    │
    ▼
存續期間：雙方實踐都進行中
    │
    ├─ 對方完成實踐 → 顯示「✅ 已完成」保留 7 天 → 淡出消失
    ├─ 對方超過 30 天沒打卡 → 排序下沉（不移除）
    └─ tag 不再重疊（例如改了 tag）→ 直接消失
```

#### UI 呈現：companion-card

位置：靈感 tab 頂部，「和你一起學」區塊

```
┌── 和你一起學 ──────────────────────┐
│                                    │
│  小美 · JavaScript · Day 12  😊    │
│  阿凱 · 前端開發   · Day 8   😐    │
│  小華 · React      · Day 3   😊    │
│                                    │
│  查看更多 (12人)                    │
└────────────────────────────────────┘
```

- 每人一行：頭像、暱稱、重疊的 tag、第幾天、最近心情 emoji
- 預設顯示 3~5 人，「查看更多」展開
- 所有實踐的 tags 聯集作為篩選條件，結果合併為一個扁平列表，每人只出現一次
- 沒登入 / 沒有實踐 / 沒加 tag → 不顯示此區塊

---

### Level 1: Reaction — 一次點擊

**是什麼：** 對學伴的實踐給一個快速反應。

**複用現有機制：** `ReactionTypeType`（`apps/product/src/constants/reaction-type.ts`）

可用反應：
| Key | Emoji | Label |
|-----|-------|-------|
| `encourage` | 🥰 | 一起加油 |
| `touched` | 💓 | 共鳴 |
| `fire` | 🔥 | 啟發 |
| `useful` | 👍🏻 | 加油 |
| `sameHere` | 😳 | 我也是 |
| `curious` | 🧐 | 好奇 |

**現有 API：**
- `POST /api/v1/reactions` — 新增反應
- `DELETE /api/v1/reactions` — 移除反應
- 已在 `packages/api/src/services/showcase-hooks.ts` 的 `reactToPractice()` 實作

**入口：** companion-card 上直接提供 reaction 按鈕

---

### Level 1.5: Follow — 一次點擊，單向

**是什麼：** 「不管主題是否重疊，我都想看到你。」將某人釘選到你的動態裡。

**解決的問題：** Level 0 靠 tag 配對，tag 變了人就消失。Follow 讓你鎖住一個人，不受 tag 變動影響。

**現有 API：**
- `POST /api/v1/follows` — 關注（`FollowTargetBody`）
- `DELETE /api/v1/follows/{targetType}/{targetId}` — 取消關注

**入口：** companion-card 或個人頁面上的 Follow 按鈕

---

### Level 2: Buddy — 一次點擊 + 對方接受

**是什麼：** 約好一起學同一件事的人。綁定在一個實踐裡。

**現有 API：**
- `POST /api/v1/practices/{id}/buddy-requests` — 發送 Buddy 邀請
- `PATCH /api/v1/buddy-requests/{id}` — 接受 / 忽略邀請
- `GET /api/v1/buddy-requests` — 列出 Buddy 請求
- 已在 `packages/api/src/services/notification.ts` 實作 `acceptBuddyRequest()` / `ignoreBuddyRequest()`

| | Companion (Level 0) | Buddy (Level 2) |
|---|---|---|
| 怎麼產生 | 自動，tag 重疊 | 主動邀請 + 對方接受 |
| 關係 | 不算關係 | 雙向關係 |
| 對方知道嗎 | 不知道 | 知道 |
| 消失條件 | tag 不再重疊 | 主動解除 |
| 比喻 | 同一區的陌生人 | 約好一起讀書的同學 |

**入口：** companion-card 上的「邀請成為學伴」按鈕

---

### Level 3: Buddy 互動 — 留言、鼓勵

**是什麼：** Buddy 之間可以在對方打卡時留一句話、給鼓勵。

**UI：** buddy-card（比 companion-card 更豐富），包含：
- 對方最近的打卡內容摘要
- 留言輸入欄
- 心情趨勢（最近幾天的 emoji）

**觸發點：** 對方打卡時推送通知給你，引導你去看他的進度並留言

---

### Level 4: Connection — 長期關係

**是什麼：** 認識這個人，跨實踐的人對人關係。

| | Buddy | Connection |
|---|---|---|
| 範圍 | 綁定在一個實踐裡 | 跨實踐，人對人 |
| 生命週期 | 實踐結束就結束 | 長期存在 |
| 互動 | 看打卡、留言鼓勵 | 私訊、看對方所有動態 |
| 比喻 | 同一堂課的同學 | 交了朋友 |

**自然流動：** 一起學完一個實踐（Buddy），覺得這個人不錯，加 Connection，下次開新實踐還能再找他。

**現有 API：**
- `POST /api/v1/connections/request` — 發送連結請求
- `PATCH /api/v1/connections/request/{requestId}` — 接受 / 拒絕
- `GET /api/v1/connections` — 列出連結
- `GET /api/v1/connections/requests/incoming` — 收到的請求
- `GET /api/v1/connections/requests/outgoing` — 發出的請求
- `DELETE /api/v1/connections/{userId}` — 解除連結

---

## 4. 實作優先級

### Phase 1: Level 0 — 學伴感知（MVP）

**目標：** 讓使用者打開靈感頁就能看到「有人跟我在學類似的東西」

**前端工作：**
1. 新增 `companion-card` 元件
   - 顯示：頭像、暱稱、重疊 tag、Day N、心情 emoji
   - 完成狀態標記：`✅ 已完成 🎉`
2. 靈感頁頂部新增「和你一起學」區塊
   - 條件渲染：已登入 + 有進行中實踐 + 有 tag
   - 預設顯示 3~5 人，可展開
3. 呼叫 API 取得學伴列表（需後端支援或前端計算）

**後端需求：**
- 新增 API：`GET /api/v1/companions`（或在現有靈感 feed 中擴充）
  - 參數：自動讀取當前使用者所有進行中實踐的 tags
  - 回傳：符合條件的使用者列表，含頭像、暱稱、重疊 tag、實踐天數、最近心情
  - 排序：重疊 tag 數 desc → 最近打卡時間 desc
  - 過濾：排除已完成超過 7 天的、排除自己

### Phase 2: Level 1 + 1.5 — Reaction & Follow

**目標：** 讓使用者可以一鍵互動或鎖住某人

**前端工作：**
1. companion-card 加上 reaction 按鈕（複用 `PICKER_REACTIONS`）
2. companion-card 加上 Follow 按鈕
3. 被 Follow 的人在靈感頁保持顯示，即使 tag 不再重疊

**後端需求：**
- 複用現有 `POST /api/v1/reactions` 和 `POST /api/v1/follows`
- 靈感 feed 需合併 Follow 的人到學伴列表

### Phase 3: Level 2 + 3 — Buddy 邀請與互動

**目標：** 建立雙向關係，開始真正的互動

**前端工作：**
1. companion-card 加上「邀請成為 Buddy」按鈕
2. 新增 buddy-card 元件（更豐富的互動卡片）
3. 打卡通知引導留言

**後端需求：**
- 複用現有 `POST /api/v1/practices/{id}/buddy-requests`
- 打卡時觸發通知給 Buddy

### Phase 4: Level 4 — Connection

**目標：** 從學習夥伴升級為長期朋友

**前端工作：**
1. Buddy 互動頁加上「加為朋友」入口
2. Connection 管理頁面

**後端需求：**
- 複用現有 Connection API

---

## 5. 現有可複用的資源

### API 端點（已存在於 `packages/api/src/types.ts`）

| 機制 | 端點 | 狀態 |
|------|------|------|
| Reaction | `POST/DELETE /api/v1/reactions` | ✅ 已實作 |
| Follow | `POST /api/v1/follows` | ✅ 已有 API 型別 |
| Follow | `DELETE /api/v1/follows/{targetType}/{targetId}` | ✅ 已有 API 型別 |
| Buddy | `POST /api/v1/practices/{id}/buddy-requests` | ✅ 已有 API 型別 |
| Buddy | `PATCH /api/v1/buddy-requests/{id}` | ✅ 已實作 |
| Buddy | `GET /api/v1/buddy-requests` | ✅ 已有 API 型別 |
| Connection | `POST /api/v1/connections/request` | ✅ 已有 API 型別 |
| Connection | `PATCH /api/v1/connections/request/{requestId}` | ✅ 已有 API 型別 |
| Connection | `GET /api/v1/connections` | ✅ 已有 API 型別 |
| Companion | `GET /api/v1/companions` | ❌ 需新增 |

### 前端元件

| 元件 | 位置 | 狀態 |
|------|------|------|
| `ReactionType` 常數 | `apps/product/src/constants/reaction-type.ts` | ✅ 已存在 |
| `REACTION_CONFIG` | 同上 | ✅ 已存在（含 Lottie URL、emoji、label） |
| `reactToPractice()` | `packages/api/src/services/showcase-hooks.ts` | ✅ 已存在 |
| `useShowcaseFeed()` | 同上 | ✅ 已存在（靈感 feed） |
| `PracticeShowcaseCard` | `apps/product/src/components/showcase/` | ✅ 已存在 |
| `companion-card` | — | ❌ 需新增 |
| `buddy-card` | — | ❌ 需新增 |

---

## 6. 技術備註

- 學伴配對邏輯應在**後端**計算，避免前端拉取所有使用者的 tag 做比對
- 靈感頁的 AI 後端（`NEXT_PUBLIC_AI_API_URL`）已有 `/api/v1/users/practices` 端點支援 `tags[]` 篩選，可能可以擴充
- 學伴列表建議使用 SWR 快取，重新整理頻率不需要太高（每次開靈感頁時 revalidate 即可）
- companion-card 的「已完成」狀態（保留 7 天）可用後端回傳的 `completed_at` 欄位計算
