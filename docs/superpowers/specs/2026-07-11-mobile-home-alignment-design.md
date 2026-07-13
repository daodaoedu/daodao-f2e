# Mobile 首頁對齊 product 設計文件

- 日期：2026-07-11
- 分支：`feat/mobile-icon-migration`
- 目標：把 `apps/mobile` 首頁（`app/(tabs)/index.tsx`）在視覺與結構上對齊 `apps/product` 首頁（`app/[locale]/(with-layout)/page.tsx`）

## 背景

使用者比對設計稿（product web，左）與現行 mobile app（右），指出首頁「不對齊」，具體涵蓋四個面向：

1. mobile 缺少頂部吉祥物 header（product 的 `Banner`）
2. 元素左右間距沒對齊到同一條垂直基準線
3. 「認識你」卡片（`ResonanceCarousel`）樣式與 product 差很多（mobile 是簡化橫向 scroll，product 是 flip 卡）
4. tab 數量不同（product 三個 靈感/我的/人物誌；mobile 只有兩個 Inspiration/Mine）

## 決策總覽

| 項目 | 決策 |
|------|------|
| Banner 忠實度 | 完整移植（SVG banner + 依 quiz 結果變化的 slogan + Lottie 吉祥物 + 滾動漸淡） |
| slogan 來源（子決策 A） | **A2**：共用 `@daodao/features-quiz` 的 `resultDetailMap`，但透過**新增 subpath export** 匯入純資料檔，避開 web-only barrel |
| Banner 滾動行為（子決策 B） | **B2**：banner 釘在頂端，前 167px 內用 Reanimated 把透明度 1 → 0.3 |
| 第三個 tab（人物誌） | 做成第三個頁內 tab，直接 render 既有 `<PersonaProfileMe />` |
| ResonanceCarousel | 完整移植 flip 卡 |

## 現況與參考

- Product 首頁結構：`<Banner />` → `<main>`（`max-w-[640px] px-4`）內含三 tab、`ShowcaseSearchBar`、`ResonanceCarousel`、feed。
- Mobile 首頁：`SafeAreaView` → `FlatList`，`ListHeaderComponent` = `renderShowcaseHeader`（`TabSwitcher` + `ShowcaseSearchBar` + `ResonanceCarousel`）→ feed。Mine tab 用 `ScrollView`。
- Mobile 已具備：`lottie-react-native`、`react-native-svg`、`react-native-reanimated`，以及 banner / quote-fill / arrow-circle / quiz 的 `.native.tsx` 資產變體。
- i18n：mobile 讀共用 `packages/i18n/src/locales/{en,zh-TW}.json`。`persona.carousel.*`、`persona.myProfile.*` 已含 flip 卡所需全部 key；`app_product.banner_default_slogan` 已存在；缺 `mobile.home.tab_persona`（可複製 `dashboard.tab_persona` = "人物誌"）。

## 元件設計

### 1. Banner（新檔 `apps/mobile/components/home/banner.tsx`）

職責：首頁頂部吉祥物 header。

- 版面：`MobileBannerSvg`（native 變體）滿版；slogan 以半透明白底 pill 疊在 banner 上；Lottie 吉祥物疊在 pill 附近。
- 資料流：
  - `getLatestQuizResult`（`@daodao/api`，已為 mobile 依賴）取得使用者人格類型（A/O/D/L/C）。
  - slogan：由 `resultDetailMap.get(type)?.slogan` 取得，抓不到時 fallback `app_product.banner_default_slogan`。
  - Lottie：依類型載入 `@daodao/assets/images/quiz/{type}-2.json`（RN 用 `LottieView source={json}`）。預設類型 A（動動島）。
- 滾動漸淡（B2）：Banner 為 overlay（absolute pinned），首頁 FlatList 加 `onScroll`（`useAnimatedScrollHandler`），把 scrollY 0→167 映射到 opacity 1→0.3；feed 內容頂部保留 banner 高度的 padding。
- 相依前置：新增 `@daodao/features-quiz/result-detail-map` subpath export（見「共用套件調整」）。

### 2. 共用套件調整：features-quiz subpath export

`packages/features/quiz/package.json` 目前只有 barrel export（`"." → ./src/index.ts`），該 barrel 會連帶匯入 web-only 程式（`recharts`、`react-dom`、觸碰 `window`/`document` 的模組），直接 import 會炸 Metro bundle。

作法：新增 subpath export 指向純資料檔：

```jsonc
"exports": {
  ".": "./src/index.ts",
  "./result-detail-map": "./src/utils/result-detail-map.ts"
}
```

`result-detail-map.ts` 相依鏈（`types`、`result-detail-constants`、`result-detail-factory`）已驗證 RN-safe：只有 `types/index.ts` 內一個 `import type { StaticImageData }`（型別，編譯期抹除）。

Mobile 端：`import { resultDetailMap } from "@daodao/features-quiz/result-detail-map"`，並在 `apps/mobile/package.json` 加 `"@daodao/features-quiz": "workspace:*"`。

### 3. TabSwitcher（`apps/mobile/components/home/tab-switcher.tsx`）

- `TabType` 由 `"inspire" | "mine"` 擴充為 `"inspire" | "mine" | "persona"`。
- 新增第三顆 persona 按鈕，樣式對齊 product：容器 `borderBottom`、每顆 `flex:1`、active 用 logo-cyan 底線、inactive 40% 透明度。
- 新增 i18n key `mobile.home.tab_persona`（zh-TW 與 en）。

### 4. 首頁 persona 分支（`apps/mobile/app/(tabs)/index.tsx`）

- 新增 `activeTab === "persona"` 分支：`SafeAreaView` → `ScrollView` 內 render `<PersonaProfileMe />`（複用既有元件，不含 persona 獨立頁的返回列）。
- Banner 只在 inspire tab 顯示（`activeTab === "inspire"` 時掛載）。mine / persona tab 不顯示 banner，沿用現況版面。理由：banner 的 slogan/吉祥物是「靈感頁」的迎賓元素，且 mine/persona 各自已有自己的頂部內容。

### 5. 間距對齊（`apps/mobile/app/(tabs)/index.tsx`）

- 統一所有區塊（tabs、search、carousel、feed）左緣到同一 `px-4`（16）基準。
- 移除 `ResonanceCarousel` 標題多餘的 `px="$1"` 內縮。
- 移除簡化版 `QuestionCard` 的固定 `width={280}`（flip 卡改為垂直填滿欄寬，與 product 一致）。

### 6. ResonanceCarousel 完整移植（`apps/mobile/components/persona/ResonanceCarousel.tsx`）

對照 product `resonance-carousel.tsx` 重寫：

- 容器 header：`Laugh` 圖示 + `title` + `dismiss` 按鈕。
- 垂直堆疊 flip 卡（顯示前 2 題，`switchQuestion` 換題）。
- 卡片正面：`QuoteFillSvg`（native）＋置中 prompt ＋ `communityLabel` ＋ 橫向 locked 預覽卡列 ＋ `frontLabel`(choicePrompt/openPrompt) + `ArrowCircleSvg` CTA。
- 卡片背面：prompt + 換一題 + 選項 grid / textarea + 橘色（`#F5A93E`）submit。
- 已回答狀態（submitted）：勾勾 badge + 答案 + 前往小島 CTA。
- 資料/行為沿用既有 hooks：`usePersonaCarouselState`、`submitPersonaAnswer`、`dismissPersonaCarousel`、`useMutate`。
- i18n 沿用 `persona.carousel.*` / `persona.myProfile.*`（已齊全）。

#### RN 特化調整（無 1:1 對應，採 RN 原生技法）

- **3D flip**：用 `react-native-reanimated` 的 `rotateY` + `perspective` 實作正反面翻轉。
- **locked 卡模糊**：product 用 CSS `blur-sm`；RN 不便對任意內容做便宜模糊，改用低透明度骨架 + `Lock` 圖示近似。
- **drag-scroll**：product 的滑鼠拖曳橫捲在 RN 用原生 `ScrollView horizontal` 觸控即可，不需移植。

## 影響範圍（檔案）

- 新增：`apps/mobile/components/home/banner.tsx`
- 改：`apps/mobile/components/home/tab-switcher.tsx`
- 改：`apps/mobile/components/home/index.ts`（export Banner）
- 改：`apps/mobile/app/(tabs)/index.tsx`（掛 Banner、persona 分支、間距、滾動 handler）
- 重寫：`apps/mobile/components/persona/ResonanceCarousel.tsx`
- 改：`packages/features/quiz/package.json`（subpath export）
- 改：`apps/mobile/package.json`（加 features-quiz 依賴）
- 改：`packages/i18n/src/locales/{zh-TW,en}.json`（加 `mobile.home.tab_persona`）

## 風險與待驗證

1. `@daodao/features-quiz/result-detail-map` 在 Metro/Expo 下能否解析 subpath export（TS 檔、workspace）；必要時比照其他 package 的 `.native`/`dist` 慣例調整。
2. Lottie JSON 在 RN 首次載入（此為 mobile 首個 Lottie 使用點），確認 Metro 對 `.json` 與 `@daodao/assets/images/quiz/*` 路徑解析正常。
3. B2 滾動漸淡與 FlatList `onScroll` 效能／邊界（快速捲動、下拉刷新並存）。
4. Banner overlay 與 SafeArea、feed top padding 對齊，避免內容被遮住。

## 成功標準

- inspire tab 頂部出現吉祥物 banner，slogan 依 quiz 結果變化，滾動時漸淡。
- 三顆 tab（靈感/我的/人物誌）樣式對齊 product，人物誌 tab 顯示 `PersonaProfileMe`。
- tabs/search/carousel/feed 左緣切齊同一基準線。
- 「認識你」卡片為 flip 卡，正/反面、選項、橘色 submit、已回答狀態均與 product 一致。
- `pnpm run lint`、`pnpm run typecheck` 通過；iOS 模擬器實跑首頁無 crash、無錯位。
