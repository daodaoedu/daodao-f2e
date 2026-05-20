# Plan: #557 補充 showcase 前端測試（12.9, 12.10）

## 範圍分析

Issue #557 要求補充以下測試：
- **12.9** BrewingCard 元件測試
- **12.10** reaction 推播 E2E 測試

### 基礎設施限制

`apps/product` vitest 設定使用 `environment: "node"`，**不支援 JSDOM 或 React render**，
因此無法直接對 BrewingCard（React 元件）做渲染測試，也無法在此執行 E2E 推播模擬。

### 可行方案

針對 showcase 工具函式（純邏輯、無 DOM 依賴）撰寫單元測試：
- `formatShowcaseDate(dateStr?)` — 日期格式化
- `buildCheerDisplay(reactions?)` — 反應統計顯示邏輯

這些函式涵蓋了 12.9 BrewingCard 顯示邏輯的核心部分，且可在 node 環境中完整測試。

## 實作計畫

1. 建立 `apps/product/src/components/showcase/__tests__/utils.test.ts`
2. 測試 `formatShowcaseDate`：null/undefined 輸入、正常 ISO 字串
3. 測試 `buildCheerDisplay`：空陣列、單一反應（有 actorName）、多反應（topTwo emojis）
4. commit: `test(s): #557 showcase utility unit tests`

## 檔案異動（≤3 檔，scope: XS）

- `apps/product/src/components/showcase/__tests__/utils.test.ts` (新增)
- `apps/product/docs/plan-557.md` (本檔)
