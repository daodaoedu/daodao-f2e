---
name: codebase-map
description: daodao-f2e codebase 地圖——monorepo 結構、依賴方向、常見任務觸點、隱藏的 build 依賴。開工前先讀，省去盲目探索
---

# daodao-f2e Codebase 地圖

> 目錄結構有變動時（新增 app/package、搬移目錄、改 build 流程）必須同步更新本檔。
> 最後校準：2026-07-06。

## Monorepo 結構

pnpm workspace（`pnpm-workspace.yaml`）：`apps/*`、`packages/*`、`packages/features/*`。版本用 catalog 集中管控。Turbo 跑 pipeline（`turbo.json`）。

**apps/**
- `apps/website`（:3000）— 靜態官網，Next.js App Router，可 `NEXT_OUTPUT=export` 靜態匯出。
- `apps/product`（:3001）— 主產品站，**主要開發標的**。路由在 `src/app/[locale]/`，登入後頁面在 `(with-layout)` 群組。唯一內部 API route：`app/api/og-image/route.ts`。
- `apps/mobile` — Expo / React Native + Tamagui。

**packages/**（依賴方向：apps → features → api/i18n/shared → ui）
- `api`（`@daodao/api`）— 唯一對外 API 層。`src/client.ts`（openapi-fetch + 401 自動 refresh singleton）、`src/types.ts`（**生成物，禁手改**，來自 server）、`src/ai-types.ts`（生成物，來自 ai-backend）、`src/services/`（每 domain 兩檔：`<domain>.ts` 純函式 + `<domain>-hooks.ts` SWR hooks）。
- `shared` — hooks/utils/storage。**匯出清單以 `packages/shared/src/index.ts` 為準**（規範文件的清單可能落後）。
- `ui` — shadcn 元件庫。`config` — `getEnv`/`getRequiredEnv` + 共享 tsconfig（`base.json`/`nextjs.json`/`react.json`；根目錄沒有 tsconfig.base.json）。
- `auth`、`analytics`、`i18n`、`assets`、`design-tokens`；`features/`：`quiz`、`mention`、`action-maker`。

## 常見任務觸點

| 任務 | 動哪裡 |
|------|--------|
| 新增 product 頁面 | `apps/product/src/app/[locale]/<路由>/page.tsx`（要共用 layout 放 `(with-layout)`）；i18n key 在 `apps/product/src/i18n` |
| 新增 API service | `packages/api/src/services/<domain>.ts` + `<domain>-hooks.ts`，在 `services/index.ts` barrel 匯出。檔內順序：Imports → Types → Query Hooks → Mutation Hooks |
| 新增 storage key | `packages/shared/src/lib/storage.ts`：`StorageEnum` 加 key + `mapStorageKeyToStorageType` 定類型 |
| 新增 runtime constant | `apps/product/src/constants/`，`const object + as const + type` 模式 |
| 新增共用 hook/util | `packages/shared/src/hooks/` 或 `src/lib/`，並在 `src/index.ts` 匯出 |
| 新增環境變數 | `.env.example` 補範例 + 用 `@daodao/config` 讀取（見下方「env 是靜態生成」） |

## 隱藏的 build/typecheck 依賴（不知道會卡死）

- **typecheck 前置**：`turbo.json` 的 typecheck 依賴 `@daodao/assets#build` 與 `@daodao/shared#build`。單獨對某 package 跑 `tsc --noEmit` 會因缺 build 產物而失敗——一律用 `pnpm run typecheck`（turbo 會處理依賴）。
- **env 是 build 時靜態生成**：`@daodao/config` 優先讀 `packages/config/generated/env`（由 `pnpm generate:env` 產生），改 `.env` 後沒重新生成會讀到舊值。
- **Biome 排除生成物**：`packages/api/src/types.ts`、`packages/assets`、`generated/`、`out/` 不 lint、不格式化、不手改。
- **路徑 alias 只有 app 層有**：`@/* → ./src/*` 只在各 app tsconfig；packages 內用相對路徑，跨 package 用 `@daodao/*` 套件名。
- **`"use client"` 是壓倒性慣例**：hooks、service、含瀏覽器 API 的 util 預設加。
- **husky pre-commit** 跑完整 `pnpm lint` + `pnpm typecheck`（硬編碼 `/opt/homebrew/bin`，非 macOS 環境可能找不到 pnpm）。

## 行為層陷阱

- `openapi-fetch` 不 throw：錯誤在 `response.error`，處理完必須 `return`（詳見 project-rules）。
- `getStorage` SSR-safe 且靜默失敗：SSR 或例外時回 no-op，呼叫端不可假設寫入成功。`OAuthNonce` 刻意用 localStorage 繞過 iOS Safari ITP。
- 401 自動刷新是 `packages/api/src/client.ts` 的全域 singleton（併發去重、refresh endpoint 短路防死鎖）——動 auth 流程前先讀它，勿重複實作。
- app 端不 import 原始 `client`/`useQuery`（index.ts 沒匯出），只 import domain hooks 與 `useMutate`；`useQuery`/`client` 僅供 `packages/api/src/services/` 內部相對路徑使用。

## 測試與品質

- `pnpm test`（turbo → vitest）。vitest workspace 涵蓋 packages/{shared,api,auth,config}、features/*、apps/product；**website/mobile 不在內**。
- `pnpm run lint` / `pnpm run typecheck` / `pnpm run check:fix`。

## 跨 repo

呼叫 server（openapi-fetch）、ai-backend（fetch）、worker（fetch，手寫型別）。詳見 `.claude/skills/system-map/SKILL.md`。
types 同步：`.github/workflows/sync-openapi.yml`（每日 cron + repository_dispatch）。
