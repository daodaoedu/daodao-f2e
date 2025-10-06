# 專案總覽與共通規範

本專案技術棧：TypeScript、Next.js App Router、TailwindCSS、shadcn/ui、SWR、Zod、Orval。
架構：**Feature-Sliced Design (FSD) 混合架構**。

- 參考檔案：
  - [tsconfig.json](mdc:tsconfig.json)
  - [next.config.js](mdc:next.config.js)
  - [tailwind.config.ts](mdc:tailwind.config.ts)
  - [orval.config.ts](mdc:orval.config.ts)
  - [open-next.config.ts](mdc:open-next.config.ts)
  - [app](mdc:app)
  - [services/fetcher.ts](mdc:services/fetcher.ts)
  - [generated](mdc:generated)

通用原則：

- 一律使用 TypeScript，嚴禁使用 `any`（改用 `unknown` 或正確的具體型別）。
- 優先採用 Next.js App Router；既有 `pages/` 僅維護，不新增新頁於 `pages/`。
- 樣式使用 TailwindCSS，避免行內 `style`；複雜條件請使用 `utils/cn.ts`。
- UI 元件優先使用 `shared/ui`（shadcn/ui）。
- Client 端資料抓取使用 SWR，Server 端可用 `fetch` + `revalidate`。
- 對外資料邊界以 Zod 驗證，型別以 `z.infer` 推導。
- API 客戶端透過 Orval 產碼，禁止直接修改 `generated/`。
- 重視可近用性（a11y）：語義化標籤、鍵盤可操作、ARIA 正確。
- **遵循 FSD 混合架構**：新功能使用 FSD 層級，舊功能按需遷移。

提交品質：

- 匯出/公共 API 明確註記型別，避免隱式 any。
- 優先早返回、窄化條件、避免深層巢狀。
- 檔案分層清楚：`widgets/*` 組件集合、`features/*` 聚焦領域、`entities/*` 業務實體、`shared/*` 通用工具。

相關目錄：

- App Router 入口：[app/[language]/(guest)/(default-layout)/page.tsx](<mdc:app/[language]/(guest)/(default-layout)/page.tsx>)
- 全域樣式：[app/global.css](mdc:app/global.css)
- 中介層：[middleware.ts](mdc:middleware.ts)

## FSD 混合架構與資料流

標準呼叫鏈：

UI（`app`/`widgets`） → `features/<domain>/{components,hooks}` → `entities/<entity>` → `shared/{ui,lib}` → `services/<domain>` → `generated`（Orval） → API

- **App Router 層**：路由處理和頁面組件組合，直接使用 widgets。
- **Widgets 層**：大型 UI 組件集合，組合 features 和 entities。
- **Features 層**：業務功能模組，具體的用戶操作和業務邏輯。
- **Entities 層**：業務實體抽象，純展示組件和數據模型。
- **Shared 層**：通用工具、UI 組件、配置和常量。
- **Services 層**：Legacy API 服務層，逐步遷移至各 FSD 層級。
- **Generated 層**：Orval 產碼，請勿修改。

伺服器與客戶端的資料策略：

- Server Component：以 `fetch` 配置 `next: { revalidate }` 或 `cache: 'no-store'`，回傳前以 Zod 驗證。
- Client Component：以 SWR 封裝於 `features/*/hooks`，hook 內完成 Zod 解析後再回傳。

錯誤處理與使用者體驗：

- 使用 `app/global-error.tsx`、`app/global-not-found.tsx` 提供一致的錯誤/404 體驗。
- SWR 層提供 `isLoading`、`error`、空狀態與 Skeleton；重要操作支援樂觀更新與回滾。

可近用性（a11y）：

- 互動元素具鍵盤操作、正確 ARIA；對話框/抽屜具焦點圈管理；狀態變更具 `aria-live`。

程式風格：

- 嚴禁 `any`；以早返回、窄化條件、淺層邏輯為主。條件 class 使用 `utils/cn.ts`。
