---
name: system-map
description: 島島 daodao 六個 repo 的系統全景圖——服務職責、呼叫關係、types 同步鏈、跨 repo 變更 SOP。任何變更可能影響其他 repo 時必讀
---

# daodao 系統全景圖

> 本檔在六個 repo 中各有一份**相同**的副本。更新時必須六份一起改（見「維護」）。
> 最後校準：2026-07-06（由全 repo 實地盤點產出）。

## 服務總表

| Repo | 技術 | 職責 | Prod 網域 | Dev 網域 |
|------|------|------|-----------|----------|
| daodao-f2e | Next.js 15 monorepo（pnpm + turbo） | 前台：官網（website, :3000）、產品站（product, :3001）、mobile（Expo） | app.daodao.so / daodao.so | app-dev.daodao.so |
| daodao-server | Express + Prisma（TypeScript，src/ 全 TS） | 主後端：REST API `/api/v1/*`、認證（Google OAuth + JWT 簽發）、BullMQ queues | api.daodao.so | （本地 :3000，Docker dev_app） |
| daodao-worker | Cloudflare Workers（Hono + zod-openapi） | AI action-maker：`/action-maker/generate`、`/refine` | worker.daodao.so | worker-dev.daodao.so |
| daodao-ai-backend | Python 3.12 FastAPI | AI 子後端：feed、recommendation、insight、admin AI 管理 `/api/v1/admin/*` | ai.daodao.so | ai-dev.daodao.so（:8002→8000） |
| daodao-storage | SQL schema + migration + ansible | 資料庫的 single source of truth（PostgreSQL + Qdrant 容器） | —（Linode 主機） | — |
| daodao-admin-ui | Vite + React SPA（shadcn） | 管理後台，base path `/admin/`，runtime 用 vite preview :3000 | admin.daodao.so | admin-dev.daodao.so |

Docker network：dev 用 `dev-daodao-network`、prod 用 `prod-daodao-network`（external，各 compose 掛同一網路互通）。

## 呼叫關係（誰打誰）

```
f2e ──openapi-fetch──────────▶ server    (NEXT_PUBLIC_API_URL)
f2e ──fetch──────────────────▶ ai-backend (NEXT_PUBLIC_AI_API_URL)
f2e ──fetch──────────────────▶ worker     (NEXT_PUBLIC_WORKER_URL，未列於 .env.example)
worker ──X-Internal-API-Key──▶ server    (POST /api/internal/ai-generations)
admin-ui ──/daodao-server/*──▶ server    (SERVER_BACKEND_URL / vite proxy :4000)
admin-ui ──/api/v1/admin/*───▶ ai-backend (BACKEND_URL / vite proxy :8002)
server ──Prisma──────────────▶ PostgreSQL（storage 定義 schema）
ai-backend ──SQLAlchemy──────▶ 同一個 PostgreSQL（不做 DDL，只讀寫）
```

認證邊界：
- JWT 由 **daodao-server 簽發**（HS256）；ai-backend 用共享 secret（`JWT_SECURITY`）驗證，並 fallback 讀共用 HttpOnly cookie `auth_token`。
- worker 的 JWT authMiddleware **已定義但從未掛載**（截至盤點日），入向只靠 CORS + IP rate limit。
- worker → server 用自訂 header `X-Internal-API-Key`（非 JWT）。
- admin-ui 用 localStorage `daodao_admin_token` Bearer + cookie，角色白名單 admin/superadmin。

## Types 同步鏈（改 API 時的連鎖反應）

1. **server → f2e**：server 的 Zod validators + `registry.registerPath` 自動生成 `openapi.json` 與 `generated/openapi-types.ts`（`pnpm run openapi:generate` + `openapi:generate-types`）。f2e 的 `.github/workflows/sync-openapi.yml`（每日 cron UTC 21:00 + `repository_dispatch: sync_openapi` + 手動）從 daodaoedu/daodao-server 的 **dev branch** 拉檔寫入 `packages/api/src/types.ts` 並自動 commit。
2. **ai-backend → f2e**：同一個 workflow 從 `https://ai-dev.daodao.so/openapi.json` 生成 `packages/api/src/ai-types.ts`。
3. **worker → f2e**：**無自動同步**，f2e 的 action-maker hooks 手寫型別。改 worker API 時必須手動同步 f2e。
4. **ai-backend / server → admin-ui**：**無自動同步**，admin-ui 的 `src/api/types.ts`（千行集中檔）手動維護。
5. **生成物禁手改**：f2e 的 `packages/api/src/types.ts`、`ai-types.ts`；server 的 `generated/`。

## DB Schema 變更 SOP（最容易出錯的跨 repo 流程）

storage 是 schema 的 single source of truth。順序固定：

1. **daodao-storage**：在 `migrate/sql/` 新增 `{下一序號}_{描述}.sql`（**不可改已存在的 migration**，hook 會擋）＋**同步回寫 `schema/` 對應檔**。
2. 套用：`make migrate-sql-dev`（CD 在 push main/dev 時自動跑 prod/dev）。
3. **daodao-server**：更新 `prisma/schema.prisma`（`prisma db pull` 或手改）→ `pnpm run prisma:generate` → `pnpm run schema:drift` 驗證（CI `schema-drift.yml` 也會 checkout storage 比對，漂移發 Discord 警報）。
4. **daodao-ai-backend**：同步 `src/models/` 的 SQLAlchemy ORM（無自動檢查欄位層級，靠人工；enum/CHECK 值層級由 storage 的 `schema-sync-check.yml` 每日 cron 比對三 repo）。

已知現況：storage 的 `schema/` 落後 `migrate/sql/`（`check_schema_sync.py` 的 `SKIP_TABLES` 白名單就是漂移清單）；migration runner 只認檔名不驗 checksum，「migration 不可變」實際靠 `.claude/hooks/pre-write-guard.sh` 在撰寫端阻擋。

## 跨 repo 變更檢查表

改動前先對照此表，凡命中就要開跨 repo 的後續工作（或明確告知使用者尚未同步）：

| 你改了什麼 | 需要跟進的 repo |
|------------|-----------------|
| server 的 API contract（validator/route/response） | f2e（等 sync-openapi 或手動 `gen:types`）；admin-ui（手動改 `src/api/types.ts`） |
| ai-backend 的 API contract | f2e（`gen:ai-types`）；admin-ui（手動） |
| worker 的 API contract | f2e action-maker（手動改型別） |
| DB schema | storage → server → ai-backend（上節 SOP） |
| DB 的 enum/CHECK 允許值 | server 的 TS 常量（如 `src/types/email/base.types.ts`）+ ai-backend 的 Py 常量（`schema-sync-check.yml` 會抓） |
| JWT payload / auth 流程 | server（簽發）+ ai-backend（驗證）+ f2e（refresh 邏輯）+ admin-ui（角色白名單） |
| `.claude/hooks/*`、`.claude/settings.json` | 六個 repo 全部（複製式共用，md5 必須一致） |
| 本檔（system-map） | 六個 repo 全部 |

## 已知不一致（盤點時發現，修正前先知道）

- f2e 內 `NEXT_PUBLIC_API_URL` 的 fallback 網域兩處不同：`packages/api/src/client.ts` 用 `api.daodao.so`，action-maker hooks 用 `server.daodao.so`。
- worker repo 只有 `package-lock.json`（npm），但 CI 與規範文件用 pnpm 指令。
- f2e 與 server 的 `.husky/pre-commit` 硬編碼 `/opt/homebrew/bin`（macOS 假設），Linux 環境可能失效。

## 維護

- 新增/移除服務、改呼叫關係、改 types 同步方式時：更新**六份** system-map（daodao-{f2e,server,worker,ai-backend,storage,admin-ui}/.claude/skills/system-map/SKILL.md），並更新「最後校準」日期。
- 不確定某條敘述是否仍成立時：以 codebase 現實為準，修正本檔並在 PR 說明中註記。
