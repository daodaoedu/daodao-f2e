# i18n Locale 檔案依 Namespace 拆分規劃

> Issue: [#847](https://github.com/daodaoedu/daodao-f2e/issues/847)
> 狀態: 規劃中

## 背景與問題

`packages/i18n/src/locales/zh-TW.json` 與 `en.json` 各 7300+ 行（各 6998 個 key、22 個 namespace），所有 namespace 集中在單一檔案,造成:

- 多個 feature 同時新增 key 時容易發生 merge conflict(#845 practice summary redesign 一次新增 120 個 key)
- Review 特定 namespace 的變更困難
- 編輯器處理大型 JSON 效能差

## 現況盤點

### 現有 namespace(22 個,兩語系 key set 完全一致)

`roadmap`, `common`, `terms`, `about`, `user_profile`, `account_settings`, `preferences_settings`, `time`, `cities`, `auth`, `onboarding`, `check_in`, `practice`, `dashboard`, `notification`, `learning_marathon`, `landing_page`, `persona`, `app_product`, `resource`, `mobile`, `social`

其中 `cities` 最大(zh-TW ~132KB / en ~166KB),`mobile`、`app_product` 次之。

### Locale 檔案的所有消費端

| 檔案 | 用法 | 拆分後需要的調整 |
|---|---|---|
| `packages/i18n/src/lib/get-messages.ts` | 靜態 import 兩語系 JSON,同步回傳 `messagesMap[locale]` | 改 import 各語系彙整模組 |
| `packages/i18n/src/i18n.d.ts` | `import type en from "./locales/en.json"` 供 next-intl `AppConfig.Messages` 型別 | 改指向彙整模組的型別 |
| `apps/website/src/i18n/request.ts` | `await import(\`.../locales/${locale}.json\`)` 動態載入 | 改用套件提供的 `loadMessages(locale)` |
| `apps/product/src/i18n/request.ts` | 同上 | 同上 |
| `apps/mobile/i18n/index.tsx` | 靜態 import 兩語系 JSON 建 `messagesByLocale` | 改 import 各語系彙整模組 |
| `packages/i18n/package.json` | exports `"./locales/*": "./src/locales/*.json"` | 調整 export pattern(目前 repo 內無人使用此 subpath,風險低) |

另外 `docs/i18n-pending-items.md`、`docs/newsletter-kit-integration.md` 有路徑引用,屬文件更新。

## 目標結構

```
packages/i18n/src/locales/
├── zh-TW/
│   ├── index.ts        # 彙整 22 個 namespace,export default merged object
│   ├── common.json
│   ├── practice.json
│   ├── auth.json
│   └── ...(每個 namespace 一個檔案,共 22 個)
└── en/
    ├── index.ts
    ├── common.json
    └── ...
```

## 設計決策

### 1. 以「各語系 index.ts 靜態彙整」取代 runtime 掃描

每個語系一個 `index.ts`,靜態 import 該語系全部 namespace JSON 後 export 合併物件:

```ts
// packages/i18n/src/locales/zh-TW/index.ts
import auth from "./auth.json";
import common from "./common.json";
// ...其餘 20 個

export default {
  auth,
  common,
  // ...
};
```

理由:

- **型別安全**:`i18n.d.ts` 改為 `Messages: typeof import("./locales/en").default`,新增/刪除 key 後型別立即反映,維持現有 `useTranslations` 的 key 自動補全與檢查
- **Bundler 友善**:靜態 specifier,不需要 template-literal dynamic import 的 context 魔法;各語系仍是獨立 chunk,保留現在「只載入當前 locale」的行為
- **不引入建置步驟**:不需要 merge script 或 codegen,`transpilePackages` 現有機制直接可用

代價是新增 namespace 時要在兩個 `index.ts` 各加一行 import——由 Phase 4 的 parity 檢查腳本把關遺漏。

### 2. 套件內提供 `loadMessages(locale)`,收斂 apps 的載入邏輯

```ts
// packages/i18n/src/lib/load-messages.ts
import type { Messages } from "../index";
import type { Locale } from "../routing";

export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === "en") {
    return (await import("../locales/en")).default;
  }
  return (await import("../locales/zh-TW")).default;
}
```

`apps/website`、`apps/product` 的 `request.ts` 從跨套件相對路徑 dynamic import(`../../../../packages/i18n/src/locales/${locale}.json`)改為:

```ts
messages: await loadMessages(finalLocale),
```

消除兩個 app 各自寫死的相對路徑,載入邏輯回歸 `@daodao/i18n` 套件本身。

### 3. `getMessagesFromPathname` 維持同步 API

`get-messages.ts` 現在就是靜態 import 兩語系(本來就會把兩語系都打進使用它的 bundle),改為 import 兩個 `index.ts` 即可,行為與 bundle 影響不變。

### 4. `apps/mobile` 維持靜態 import

改為 `import zhTWMessages from "../../../packages/i18n/src/locales/zh-TW"`(en 同理),其餘 `readMessage` / `interpolate` 邏輯不動。

### 5. 拆分時保留 key 順序

拆分腳本以原檔案內的 namespace 內容原樣寫出(2 空格縮排、結尾換行,與 Biome 格式一致),確保拆分 commit 是「純搬移」——diff 可驗證無內容變更,之後仍可用 `git log -S` 追 key 歷史。

## 實作階段

### Phase 1: 拆分檔案與套件內部改造(核心)

1. 寫一次性拆分腳本(Node,放 `scratchpad` 或執行後即刪),讀取 `zh-TW.json` / `en.json`,依 top-level key 寫出 `locales/{locale}/{namespace}.json`
2. 建立 `locales/zh-TW/index.ts`、`locales/en/index.ts` 彙整模組
3. 新增 `src/lib/load-messages.ts`,並在 `src/index.ts` re-export
4. 更新 `i18n.d.ts`:`Messages` 改為 `typeof import("./locales/en").default`
5. 更新 `lib/get-messages.ts` 的 import 來源
6. 更新 `package.json` exports:`"./locales/*": "./src/locales/*"`(涵蓋目錄與檔案)
7. 刪除舊的 `zh-TW.json`、`en.json`

### Phase 2: 更新消費端 apps

1. `apps/website/src/i18n/request.ts` → 改用 `loadMessages`
2. `apps/product/src/i18n/request.ts` → 改用 `loadMessages`
3. `apps/mobile/i18n/index.tsx` → 改 import 彙整模組

### Phase 3: 驗證

1. `pnpm run lint`、`pnpm run typecheck` 全綠
2. `pnpm run build`(website / product / mobile)成功
3. Dev server 手動驗證:zh-TW / en 切換、practice、check-in、landing page 等主要頁面文案正常
4. `grep -rn "locales/zh-TW.json\|locales/en.json"` 確認無殘留引用

### Phase 4(建議,可獨立 PR): parity 檢查腳本

新增 `scripts/check-i18n-parity.mjs` 並掛進 CI:

- 檢查 `zh-TW/` 與 `en/` 檔案清單一致
- 檢查每個 namespace 兩語系 key set 一致(現況已一致,守住這個 invariant)
- 檢查兩個 `index.ts` 涵蓋所有 JSON 檔(防止新增 namespace 忘了註冊)

## 風險與注意事項

| 風險 | 說明 | 對策 |
|---|---|---|
| 與 in-flight PR 衝突 | 任何動到 locale 檔的開發中 PR 會與拆分 commit 大面積衝突 | 拆分 PR 排在近期 i18n 相關 PR 合併後立即進行;通知團隊凍結期 |
| git blame 斷裂 | 檔案拆分後 `git blame` 不再直接追到舊歷史 | 拆分 commit 保持「純搬移、零內容修改」,必要時用 `git log -S` 追 key |
| Dynamic import 行為差異 | 從 JSON 動態載入改為 TS 模組動態載入 | `loadMessages` 用靜態 specifier,webpack/turbopack 均為標準 code-splitting 路徑;Phase 3 build + 手動驗證把關 |
| 型別推導成本 | `typeof import(...)` 對 22 個 JSON 的推導 | 與現況(單一 7300 行 JSON 的 typeof)成本相當,無明顯退化 |

### 順帶發現(不在本次範圍)

`.github/workflows/update-i18n.yml` 引用的 `pnpm i18n:fetch` script 與 `shared/config/locales` 路徑在 repo 中皆已不存在,此 workflow 已失效,建議另開 issue 處理(移除或修正)。

## 預估工作量

- Phase 1–3:單一 PR,約 0.5–1 天(大部分是機械性拆分與驗證)
- Phase 4:獨立小 PR,約 0.5 天
