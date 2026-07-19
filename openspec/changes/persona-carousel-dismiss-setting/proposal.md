# 人物誌共鳴輪播「不再顯示」

> Change ID: `persona-carousel-dismiss-setting`
> 建立日期：2026-07-19
> 影響 repo：daodao-f2e、daodao-server、daodao-storage、（daodao-ai-backend：僅 ORM 同步）

## Why

首頁的人物誌共鳴輪播（`ResonanceCarousel`）在大改版（commit `5f9f6eb8`）重寫時，
**移除了「今天不再顯示」dismiss 按鈕**（連同 `handleDismiss` 與 `dismissPersonaCarousel` import）。
結果：使用者目前**完全無法關掉這個輪播**，只能等答完所有題目它才消失（`shouldShow` 邏輯）。

需求兩部分：
1. **加回**被移除的「今天不再顯示」按鈕（回歸缺陷修復）。
2. **新增永久開關**：讓使用者能在設定裡選擇「不再顯示人物誌共鳴輪播」，且可反悔重新開啟。

## What Changes

### Part 1 — 加回「今天不再顯示」按鈕（純 f2e）
- `resonance-carousel.tsx` 的 `ResonanceCarousel` header 加回 dismiss 按鈕。
- 接**既有** API `dismissPersonaCarousel()`（`POST /api/v1/persona/carousel-dismiss`），語意＝當天 UTC 內 `shouldShow=false`。
- i18n key `persona.carousel.dismiss`（「今天不再顯示」）與 `persona.carousel.error` 都還在，可直接用。

### Part 2 — 永久開關（跨 repo）
持久化機制採 **後端 user 布林欄位**，比照現有 `isOpenProfile` / `isOpenLocation` / `isSubscribeEmail` 的 pattern（跨裝置同步、可反覆開關、與其他 Settings 開關一致）。

- 新增 user 欄位 `showPersonaCarousel: boolean`，預設 `true`（正向命名，與 `isOpenProfile` 一致）。
- Settings 頁（`settings/interaction`）新增一列開關，用 `useCurrentUser` + `updateCurrentUserWithFormData({ showPersonaCarousel })`（與 `InteractionSettings` 既有寫法相同）。
- `ResonanceCarousel` 讀此欄位：`showPersonaCarousel === false` → `return null`（放在既有 `shouldShow` / length 檢查旁）。

### 兩種 dismiss 的關係（都保留、互不衝突）
| 控制項 | 語意 | 儲存 |
|---|---|---|
| 輪播上的「今天不再顯示」按鈕 | 當下先不要，隔天回來 | 後端 `carousel-dismiss`（當天 UTC） |
| Settings 的「顯示人物誌共鳴輪播」開關 | 永久關掉，可再開 | 後端 user 欄位 `showPersonaCarousel` |

## Design Decisions

### D1. shouldShow 交互 — f2e 端 gate（推薦）
`ResonanceCarousel` 直接讀 `showPersonaCarousel` 決定是否 render，**不改** `carousel-state` 的 `shouldShow` 語意。
- 優點：server 端改動最小、`carousel-state` 職責單純（只管「有沒有未答題」）。
- 備選：讓後端 `carousel-state` 把 `showPersonaCarousel` fold 進 `shouldShow`（更權威，但多一處 server 改動）。→ 先不做，除非之後有 SSR / 其他 client 也要一致。

### D2. 未登入使用者
`useCurrentUser` 無資料時欄位為 `undefined` → 視為 `true`（照常顯示），與 `isOpenProfile ?? true` 的既有 fallback 一致。

### D3. 命名 — 用正向 `showPersonaCarousel`（true=顯示）
與 `isOpenProfile`（true=公開）同方向，避免 `hideXxx` 的雙重否定。

## Cross-Repo Scope（依 system-map SOP，順序固定）

1. **daodao-storage**（schema single source of truth）
   - `migrate/sql/{下一序號}_add_show_persona_carousel.sql`：`users` 表加 `show_persona_carousel BOOLEAN NOT NULL DEFAULT true`。
   - 同步回寫 `schema/` 對應檔（**不可改已存在的 migration**）。
2. **daodao-server**
   - `prisma/schema.prisma` 加欄位 → `pnpm run prisma:generate` → `pnpm run schema:drift` 驗證。
   - GET 使用者 response 帶出 `showPersonaCarousel`。
   - PATCH/update user validator 接受 `showPersonaCarousel`（openapi 會自動反映到 f2e types）。
3. **daodao-ai-backend**（僅在其 `src/models/` User ORM 有嚴格對映時）
   - 同步 SQLAlchemy 欄位避免 schema drift；此為 boolean 欄位（非 enum/CHECK），`schema-sync-check.yml` 一般不會抓，但建議一併補上。
4. **daodao-f2e**
   - 等每日 `sync-openapi` workflow 或手動 `gen:types` 取得新 `packages/api/src/types.ts`（**生成物禁手改**）。
   - Part 1 按鈕 + Part 2 Settings 開關 + carousel gate。

## Out of Scope
- 不改 `carousel-dismiss` 後端語意（維持「當天」）。
- 不做 localStorage 版本（已決策採後端欄位）。
- 個人頁人物誌 tab、`/persona` 頁 PersonaTab 不在本次範圍。

## Risks / Notes
- **跨 repo 節奏**：f2e 端的 Settings 開關與 carousel gate 需等 server 欄位上 dev 且 `sync-openapi` 跑過（或手動 gen）後才能編譯通過。可先做 Part 1（純 f2e、無依賴）先出。
- migration 一旦進 dev/prod 不可回改，序號與內容需 review 後再送。
