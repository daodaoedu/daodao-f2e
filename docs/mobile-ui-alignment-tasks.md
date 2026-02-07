# Mobile 與 Product UI 對齊任務清單

> 本文件記錄 `apps/mobile` 與 `apps/product` 之間的 UI 差異，並提供對齊改正任務。

## 視覺對比

### Mobile App (現況)
- 問候語 "vincent xu，加油！" + 日期
- 今日進度卡片（淺藍背景 + 圓形進度環 0%）
- 兩個統計卡片（連續天數、進行中）
- 空狀態 "還沒有進行中的實踐"
- 底部 4 個 Tab（首頁、探索、建立、我的）

### Product 手機版 (目標)
- 頂部: Logo + "我的小島" 標題
- 副標語氣泡框: "先做再說，做中學最快！"
- 裝飾插圖: 海洋島嶼背景 + 章魚角色
- **進行中區塊**: 橫向滾動卡片
  - 漸層背景色（黃色、藍色等）
  - 左上角 "主題實踐" Badge
  - 右上角狀態標籤（草稿/進行中）
  - 標題（粗體，截斷）+ 描述
  - "已打卡 X 次"
  - 底部進度條 + 操作按鈕（繼續編輯/打卡）
- **已完成區塊**: 白底列表卡片
  - 標籤列表（主題實踐、正念冥想、Youtube...）
  - 標題 + 描述
- 右下角 FAB "+" 按鈕
- 底部 2 個 Tab（我的小島、個人資料）

---

## 佈局差異總覽

| 面向 | Mobile App (現況) | Product 手機版 (目標) | 優先級 |
|------|-------------------|----------------------|--------|
| **頁面標題** | 問候語 "加油！" + 日期 | Logo + "我的小島" | 高 |
| **副標語** | 無 | 氣泡框 "先做再說..." | 高 |
| **裝飾插圖** | 無 | 海洋島嶼 + 章魚角色 | 中 |
| **統計區塊** | 今日進度 + 2 統計卡片 | 移除 | 高 |
| **進行中卡片** | 無/空狀態 | 橫向滾動彩色卡片 | 高 |
| **卡片佈局** | - | **橫向滾動** (非網格) | 高 |
| **卡片背景** | 白底 | 漸層色（黃/藍/綠/粉） | 高 |
| **分類標籤** | 無 | 左上 "主題實踐" Badge | 高 |
| **狀態標籤** | 無 | 右上 草稿/進行中 | 高 |
| **進度顯示** | 圓形進度環 | 底部橫向進度條 | 中 |
| **已完成區塊** | 無 | 白底列表 + 標籤 | 中 |
| **FAB 按鈕** | 無 | 右下角 "+" | 高 |
| **底部 Tab** | 4 個 (首頁/探索/建立/我的) | 2 個 (島嶼/個人) | 高 |

---

## 任務清單

### P0 - 必須立即處理（佈局重構）

#### 1. 首頁佈局重構

- [x] **頁面標題區重新設計** ✅ 2026-01-31
  - 現況: "vincent xu，加油！" + 日期
  - 目標: "我的小島" 標題 + "先做再說，做中學最快！" 副標語
  - 路徑: `apps/mobile/app/(tabs)/index.tsx`

- [x] **新增裝飾性插圖區** ✅ 2026-01-31
  - 目標: 添加海洋島嶼背景插圖
  - 實現: 創建 HomeBanner 組件
    - LinearGradient 漸層海洋背景 (#5FDAD5 → #E9FEFF)
    - SVG 裝飾元素 (黃色半圓、白色星星、青綠色弧形)
    - Lottie 章魚動畫 (使用 lottie-react-native)
    - 白色氣泡框 + 對話泡泡裝飾連接章魚
  - 新增依賴: lottie-react-native

- [x] **移除今日進度卡片** ✅ 2026-01-31
  - 現況: 獨立的淺藍色今日進度卡片
  - 目標: 移除，進度整合至實踐卡片內

- [x] **移除統計卡片區** ✅ 2026-01-31
  - 現況: 連續天數、進行中 兩個獨立卡片
  - 目標: 移除，這些資訊整合至卡片或其他位置

#### 2. 實踐卡片完全重構

- [x] **卡片佈局改為橫向滾動** ✅ 2026-01-31
  - 現況: 單欄垂直列表
  - 目標: 橫向滾動 (ScrollView horizontal 或 FlatList horizontal)
  - 卡片寬度: 294px (參考 Product)
  - 路徑: `apps/mobile/app/(tabs)/index.tsx`
  - **參考**: `apps/product/src/components/dashboard/in-progress-section.tsx`

- [x] **卡片樣式重構 - 漸層背景** ✅ 2026-01-31
  - 現況: 白底 + 邊框
  - 目標: 彩色漸層背景（黃色、藍色、綠色、粉色）
  - 需要: 使用 `expo-linear-gradient` 或 `react-native-svg`
  - 路徑: `apps/mobile/components/PracticeCard.tsx`
  - **參考**: `apps/product/src/components/dashboard/in-progress-task-card.tsx`
  - **背景 SVG**: themesMap (YellowSvg, BlueSvg, PinkSvg, GreenSvg)

- [x] **新增分類標籤 (Badge)** ✅ 2026-01-31
  - 現況: 無
  - 目標: 左上角 "主題實踐" Badge
  - 樣式: 深色背景 + 白字

- [x] **新增狀態標籤** ✅ 2026-01-31
  - 現況: 無
  - 目標: 右上角狀態標籤
  - 類型: 草稿 / 進行中 / 未開始
  - 樣式: 各狀態不同顏色

- [x] **卡片內容重構** ✅ 2026-01-31
  - 現況: 標題 + 進度環
  - 目標:
    - 標題（粗體）
    - 描述文字（2 行截斷）
    - 已打卡次數 "已打卡 X 次"
    - 底部進度條（非圓形）
    - 操作按鈕（打卡/繼續編輯）

- [x] **底部進度條** ✅ 2026-01-31
  - 現況: 圓形 ProgressRing
  - 目標: 橫向進度條 (卡片底部)
  - 顏色: 與卡片背景色對應

#### 3. 區塊分組

- [x] **新增「進行中」區塊標題** ✅ 2026-01-31
  - 目標: "進行中" 標題 + 右側 "..." 選單按鈕
  - 顯示: 進行中的實踐卡片網格

- [x] **新增「已完成」區塊** ✅ 2026-01-31
  - 目標: "已完成" 標題
  - 樣式: 列表式卡片（非網格）
  - 卡片內容: 標題 + 描述 + 標籤列表

#### 4. FAB 按鈕

- [x] **新增右下角 FAB** ✅ 2026-01-31
  - 現況: 無（建立功能在底部 Tab）
  - 目標: 右下角浮動 "+" 按鈕
  - 樣式: 圓形、主題色 (#16B9B3) 背景、白色 + 號
  - 功能: 點擊跳轉建立實踐頁
  - **參考**: `apps/product/src/components/dashboard/add-task-fab.tsx`

#### 5. 底部 Tab 重構

- [x] **簡化底部 Tab 為 2 個** ✅ 2026-01-31
  - 現況: 4 個 Tab（首頁、探索、建立、我的）
  - 目標: 2 個 Tab（我的小島、個人資料）
  - 路徑: `apps/mobile/app/(tabs)/_layout.tsx`
  - 說明:
    - 移除「首頁」Tab（合併至「我的小島」）
    - 移除「探索」Tab（或移至其他入口）
    - 移除「建立」Tab（改用 FAB）
    - 「我的」改名為「個人資料」

- [x] **Tab 圖標更新** ✅ 2026-01-31
  - 我的小島: 使用島嶼圖標 (Palmtree)
  - 個人資料: 使用人物圖標 (User)

---

### P0 續 - 其他頁面重構

#### 6. 個人資料頁重構

- [x] **頂部導航列** ✅ 2026-01-31
  - 目標: Logo + "我的小島" + 設定圖標
  - 路徑: `apps/mobile/app/(tabs)/profile.tsx`

- [x] **學習類型卡片** ✅ 2026-01-31
  - 目標: 顯示學習類型測驗結果
  - 內容: "學習類型" 標籤 + "我是注重推理的探探島！"
  - 按鈕: "觀看詳細說明" + "重新測驗"
  - 背景: 章魚角色插圖（待補）

- [x] **用戶資料卡片** ✅ 2026-01-31
  - 目標: 頭像 + 名稱 + 地點 + 自我介紹
  - 社群連結: LINE, Facebook 等

- [x] **Tab 切換: 主題實踐 / 學習計劃 / 想法** ✅ 2026-01-31
  - 目標: 頂部 Tab 切換不同內容
  - 主題實踐: 列表顯示，可勾選 "包含已完成"

#### 7. 實踐詳情頁重構

- [x] **頂部導航** ✅ 2026-01-31
  - 目標: 返回 + "主題實踐" 標題 + 關閉 X

- [x] **標題區** ✅ 2026-01-31
  - 狀態標籤 (進行中/草稿)
  - 標題 + 左右切換箭頭
  - **參考**: `apps/product/src/components/practice/detail/practice-detail-title.tsx`

- [x] **詳情卡片** ✅ 2026-01-31
  - 白底圓角卡片
  - 描述文字
  - 圓形進度環 (百分比)
  - 頻率: 一週 X 天, 一次 X 分鐘
  - 標籤列表
  - **參考**: `apps/product/src/components/practice/shared/practice-overview-card.tsx`
  - **進度環參考**: `apps/product/src/components/practice/shared/circular-progress.tsx`

- [x] **執行資訊區塊 (青綠色背景)** ✅ 2026-01-31
  - 執行時機標籤: 休假日, 通勤中, 睡前
  - 剩餘天數 / 總共天數
  - 開始日期 / 結束日期
  - 裝飾插圖 (書本、燈泡) - 待補
  - **參考**: `apps/product/src/components/practice/shared/execution-timing-card.tsx`
  - **參考**: `apps/product/src/components/practice/shared/execution-duration-card.tsx`

- [x] **底部打卡按鈕** ✅ 2026-01-31
  - 橘色圓角按鈕 "打卡"
  - 固定在底部

#### 8. 打卡紀錄頁

- [ ] **統計區塊**
  - 可收合區塊
  - 心情排行: 表情符號 + 柱狀圖
  - 我的想法: 標籤雲 (有趣, 不太懂, 新概念, 受啟發)
  - **參考**: `apps/product/src/components/practice/detail/check-in-record-card.tsx`

- [ ] **打卡紀錄視覺化** (重點! 使用物理引擎)
  - 不規則形狀彩色卡片
  - 形狀: 圓形、六邊形、半圓、對話泡泡、切割圓
  - 每張卡片: 表情 + 日期編號 + 內容摘要
  - 物理引擎: 重力模擬、旋轉限制 (-20° ~ +20°)
  - **參考**: `apps/product/src/components/practice/detail/check-in-stack.tsx`
  - **技術**: Product 使用 Matter.js，Mobile 可用 `react-native-game-engine`

- [ ] **底部打卡按鈕**
  - 青色圓角按鈕 "打卡"

#### 9. 打卡表單 (Bottom Sheet)

**參考**: `apps/product/src/components/dashboard/check-in-sheet.tsx`

- [x] **表單容器** ✅ 2026-01-31
  - 樣式: Bottom Sheet (使用 `@tamagui/sheet`)
  - 頂部: "打卡" 標題 + 關閉 X
  - 顯示實踐標題

- [x] **心情選擇器** ✅ 2026-01-31
  - 標題: "心情如何?"
  - 6 個表情選項 (橫向排列):
    - 想放棄 (hopeless)、受挫 (frustrated)、無聊 (bored)、普通 (neutral)、還不錯 (fine)、開心 (happy)
  - 表情圖示 + 文字標籤
  - 選中: opacity 100，未選中: opacity 30
  - **心情定義**: `apps/product/src/constants/mood.ts`

- [x] **想法標籤選擇** ✅ 2026-01-31
  - 標題: "想法分享"
  - 預設標籤 (可多選):
    - 練習、新概念、實作、有趣、創造、困難、刻意練習
  - 自訂標籤: 輸入框 + "+ 加入" 按鈕
  - 選中: `bg-logo-gray text-white`
  - 未選中: `bg-white text-gray border-logo-cyan`

- [x] **詳細描述輸入** ✅ 2026-01-31
  - 標題: "詳細描述" + 字數 "0/300"
  - 多行輸入框
  - Placeholder: "簡單紀錄今天的發現，或卡關的地方"

- [x] **照片/影片上傳** ✅ 2026-01-31
  - 標題: "上傳照片或影片" + "已上傳 0/3 張"
  - 上傳區域: 虛線邊框 + 圖標
  - 提示: "點擊開啟資料夾或直接拖曳"
  - 需要: `expo-image-picker`

- [x] **提交按鈕** ✅ 2026-01-31
  - 橘色圓角按鈕 "✓ 完成打卡"
  - 固定在底部

- [ ] **表單驗證 (Zod)**
  - 必填: 心情、標籤 (至少1個)、描述
  - 描述最多 300 字
  - 備註: 已實現基本驗證，Zod 整合待完成

#### 10. 建立實踐 - 模板選擇頁

**參考**: `apps/product/src/app/[locale]/practices/create/page.tsx`

- [ ] **頁面標題區**
  - 放射狀背景圖案
  - "主題實踐" 標籤
  - 標題: "小而美的學習生活提案"
  - 副標: "不需要完美，只要開始探索就有收穫"
  - 關閉 X 按鈕

- [ ] **分類 Tab 選擇器**
  - 橫向滾動 Tab
  - 5 個類別: 語言、生活品味、數位技能、藝術與設計、身心健康
  - 圖標 + 文字
  - 選中狀態: 填充背景色

- [ ] **模板卡片網格**
  - 2 欄網格佈局 (Carousel)
  - 淺藍色背景 (`bg-[#E9FEFFB2]/70`)
  - 邊框 (`border-[#C1ECFF]`)
  - 標題 + 描述 + 箭頭
  - **參考**: `apps/product/src/components/practice/create/practice-card.tsx`

- [ ] **自建按鈕**
  - "我想自己建立 >" 按鈕
  - 置底

#### 11. 建立實踐 - 模板預覽頁

**參考**: `apps/product/src/app/[locale]/practices/create/template/[templateId]/page.tsx`

- [ ] **頂部導航**
  - 返回 + 關閉 X
  - 青綠色背景

- [ ] **模板資訊區 (青綠色背景)**
  - "主題實踐" Badge
  - 標題 (大字白色)
  - 描述文字
  - "換一個" 按鈕
  - 裝飾圖示 (指南針)

- [ ] **詳情卡片 (白底)**
  - 描述文字
  - 頻率: 一週 X 天, 一次 X 分鐘
  - 標籤列表

- [ ] **執行資訊區 (青綠色背景)**
  - 執行時機標籤: 休假日, 通勤中, 睡前
  - 執行時長: X 天
  - 開始日期
  - 裝飾插圖 (書本、燈泡)

- [ ] **確認按鈕**
  - 青色圓角 "看起來不錯 >" 按鈕
  - 固定底部

#### 12. 建立實踐 - 手動建立 (5 步驟表單)

**參考**: `apps/product/src/app/[locale]/practices/create/manual/page.tsx`

- [ ] **Step 1: 名稱和行動**
  - 名稱 (20 字限制)
  - 實踐行動 (50 字限制)
  - **參考**: `apps/product/src/components/practice/create/manual/steps/step-1.tsx`

- [ ] **Step 2: 日期和頻率**
  - 開始日期
  - 持續天數
  - 執行頻率 (每週幾天、每次多久)
  - **參考**: `apps/product/src/components/practice/create/manual/steps/step-2.tsx`

- [ ] **Step 3: 執行時機**
  - 預設時機 (多選): 休假日, 通勤中, 睡前...
  - 自訂時機輸入
  - **參考**: `apps/product/src/components/practice/create/manual/steps/step-3.tsx`

- [ ] **Step 4: 標籤和資源**
  - 標籤選擇/自訂
  - 資源連結
  - **參考**: `apps/product/src/components/practice/create/manual/steps/step-4.tsx`

- [ ] **Step 5: 預覽和完成**
  - 完整預覽
  - 確認建立
  - **參考**: `apps/product/src/components/practice/create/manual/steps/step-5.tsx`

- [ ] **表單驗證**
  - **參考**: `apps/product/src/components/practice/create/manual/schema.ts`

---

### P1 - 高優先級（設計系統）

#### 12. 設計系統同步

- [ ] **統一 Design Tokens 來源**
  - 確保 `packages/design-tokens` 為單一真相來源
  - Mobile 的 `tamagui.config.ts` 應從 design-tokens 引入所有值
  - 路徑: `apps/mobile/tamagui.config.ts`

- [ ] **色彩系統對齊**
  - Product 使用 oklch 色彩空間，Mobile 使用 hex
  - 統一色彩命名語意
  - 確保主題色 `#16B9B3` 在兩端一致
  - 參考: `packages/design-tokens/src/colors.ts`

- [ ] **卡片漸層色定義**
  - 橘色系: 用於某類實踐
  - 綠色系: 用於某類實踐
  - 藍色系: 用於某類實踐
  - 粉色系: 用於某類實踐

#### 6. 國際化實現

- [ ] **建立 Mobile 國際化架構**
  - 參考 Product 的 next-intl 結構
  - 考慮使用 `i18next` 或 `react-native-localize`
  - 建立 `locales/` 目錄結構

- [ ] **翻譯文件同步**
  - 從 Product 提取共用翻譯鍵
  - 建立共用翻譯包 (`packages/i18n`)

---

### P1 - 高優先級

#### 3. 組件庫對齊

##### 3.1 卡片組件
- [ ] **PracticeCard 樣式對齊**
  - Mobile 路徑: `apps/mobile/components/PracticeCard.tsx`
  - Product 路徑: `apps/product/src/components/practice/create/practice-card.tsx`
  - 對齊項目:
    - 陰影效果: `shadow-[0_0_25px_var(--logo-cyan)]/20`
    - hover/press 動畫效果
    - 徽章 (Badge) 樣式

- [ ] **StatCard 樣式對齊**
  - Mobile 路徑: `apps/mobile/components/StatCard.tsx`
  - Product 路徑: `apps/product/src/components/dashboard/stat-card.tsx`
  - 對齊項目:
    - 左邊框樣式 (`border-l-[6px] border-light-cyan`)
    - 圖標裝飾元素
    - 響應式字體大小

##### 3.2 進度元件
- [ ] **ProgressRing 對齊 CircularProgress**
  - Mobile: `apps/mobile/components/ProgressRing.tsx`
  - Product: `apps/product/src/components/practice/shared/circular-progress.tsx`
  - 統一:
    - 動畫效果
    - 顏色處理
    - 尺寸比例

##### 3.3 表單元件
- [ ] **FormField 升級**
  - 參考 Product 使用的 Radix UI 表單元件
  - 統一錯誤狀態樣式
  - 統一 focus 狀態樣式
  - Mobile 路徑: `apps/mobile/components/FormField.tsx`

#### 4. 導航結構

- [ ] **Tab 圖標統一**
  - 確保使用相同的圖標集 (lucide-icons)
  - 對齊圖標大小和顏色

- [ ] **頁面轉場動畫**
  - 參考 Product 的頁面轉場效果
  - 實現一致的進場/退場動畫

---

### P2 - 中優先級

#### 5. 組件結構重構

- [ ] **採用功能域分組**
  - 現況: `components/PracticeCard.tsx` (平面)
  - 目標: `components/practice/practice-card.tsx` (分組)
  - 建議結構:
    ```
    components/
    ├── dashboard/
    │   ├── stat-card.tsx
    │   └── index.ts
    ├── practice/
    │   ├── practice-card.tsx
    │   ├── progress-ring.tsx
    │   └── index.ts
    ├── check-in/
    │   ├── check-in-sheet.tsx
    │   └── index.ts
    ├── form/
    │   ├── form-field.tsx
    │   └── index.ts
    └── shared/
        └── index.ts
    ```

- [ ] **命名規範統一**
  - 文件名改為 kebab-case: `PracticeCard.tsx` → `practice-card.tsx`
  - 導出名稱保持 PascalCase: `export { PracticeCard }`

#### 6. 動畫系統

- [ ] **建立共用動畫常數**
  - 統一動畫時長
  - 統一 easing 函數
  - 參考 Product 的動畫:
    ```css
    animation: fade-in 200ms forwards;
    animation: slide-y-in 200ms forwards;
    animation: stamp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    ```

- [ ] **實現對應 RN 動畫**
  - 使用 `react-native-reanimated` 實現對應效果

#### 7. 響應式處理

- [ ] **建立斷點常數**
  - 雖然 Mobile 不需要媒體查詢，但應為平板建立適配
  - 參考 Product 斷點: `md:`, `lg:`

- [ ] **平板版面優化**
  - 針對 iPad 等大屏設備優化佈局
  - 考慮雙欄佈局

---

### P3 - 低優先級

#### 8. 程式碼品質

- [ ] **類型定義共用**
  - 建立 `packages/types` 共用類型包
  - 統一 Practice, CheckIn 等核心類型

- [ ] **樣式工具函數**
  - 建立 `cn()` 類名合併工具 (參考 Product)
  - 路徑建議: `packages/utils/src/cn.ts`

#### 9. 文件同步

- [ ] **組件文件對齊**
  - 確保兩端組件有相似的 JSDoc 註解
  - 統一 Props 命名慣例

---

## 執行建議順序

1. **第一階段** (1-2 週)
   - Design Tokens 同步
   - 色彩系統對齊
   - 核心組件樣式對齊

2. **第二階段** (2-3 週)
   - 國際化架構建立
   - 表單元件升級
   - 動畫系統統一

3. **第三階段** (3-4 週)
   - 組件結構重構
   - 命名規範統一
   - 程式碼品質改進

---

## Product 組件參考路徑

### 頁面路徑

| 頁面 | Product 路徑 |
|------|-------------|
| 首頁 (我的小島) | `apps/product/src/app/[locale]/(with-layout)/page.tsx` |
| 個人資料頁 | `apps/product/src/app/[locale]/(with-layout)/users/[identifier]/page.tsx` |
| 實踐詳情頁 | `apps/product/src/app/[locale]/practices/[id]/page.tsx` |
| 打卡紀錄頁 | `apps/product/src/app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx` |
| 建立實踐 - 模板選擇 | `apps/product/src/app/[locale]/practices/create/page.tsx` |
| 建立實踐 - 手動 | `apps/product/src/app/[locale]/practices/create/manual/page.tsx` |

### 關鍵組件路徑

| 組件 | Product 路徑 |
|------|-------------|
| 進行中卡片 | `apps/product/src/components/dashboard/in-progress-task-card.tsx` |
| 已完成卡片 | `apps/product/src/components/dashboard/completed-task-card.tsx` |
| 進行中區塊 | `apps/product/src/components/dashboard/in-progress-section.tsx` |
| 已完成區塊 | `apps/product/src/components/dashboard/completed-section.tsx` |
| FAB 按鈕 | `apps/product/src/components/dashboard/add-task-fab.tsx` |
| 打卡表單 | `apps/product/src/components/dashboard/check-in-sheet.tsx` |
| 圓形進度環 | `apps/product/src/components/practice/shared/circular-progress.tsx` |
| 執行時機卡片 | `apps/product/src/components/practice/shared/execution-timing-card.tsx` |
| 執行時長卡片 | `apps/product/src/components/practice/shared/execution-duration-card.tsx` |
| 打卡紀錄統計 | `apps/product/src/components/practice/detail/check-in-record-card.tsx` |
| 打卡物理引擎 | `apps/product/src/components/practice/detail/check-in-stack.tsx` |
| 學習類型頭部 | `apps/product/src/components/user/island-header.tsx` |
| 用戶資訊卡片 | `apps/product/src/components/user/user-info-card.tsx` |
| 建立表單步驟 | `apps/product/src/components/practice/create/manual/steps/step-1~5.tsx` |

### 常數與資源

| 類型 | 路徑 |
|------|------|
| 心情選項定義 | `apps/product/src/constants/mood.ts` |
| 卡片背景 SVG | `apps/product/src/components/dashboard/` (YellowSvg, BlueSvg, PinkSvg, GreenSvg) |
| 打卡形狀 SVG | `apps/product/src/components/practice/detail/check-in-stack.tsx` 內嵌 |

### 關鍵技術

| 技術 | 應用場景 | Mobile 替代方案 |
|------|---------|----------------|
| Matter.js | 打卡紀錄物理引擎 | `react-native-game-engine` 或簡化版 |
| GSAP + ScrollTrigger | 滾動漸入效果 | `react-native-reanimated` |
| Lottie | 學習類型動畫 | `lottie-react-native` |
| SVG clipPath | 不規則形狀裁切 | `react-native-svg` + ClipPath |
| React Hook Form + Zod | 表單驗證 | 相同 |

---

## 其他參考文件

- Mobile Tamagui 配置: `apps/mobile/tamagui.config.ts`
- Product 全域樣式: `packages/ui/src/styles/globals.css`
- 共用 Design Tokens: `packages/design-tokens/src/`

---

## 附錄: 關鍵差異程式碼範例

### A. 卡片樣式差異

**Mobile (現況)**:
```tsx
<Card
  padding="$4"
  backgroundColor="$background"
  borderRadius="$md"
  borderWidth={1}
  borderColor="$borderColor"
  pressStyle={{ scale: 0.98, opacity: 0.9 }}
>
```

**Product (目標)**:
```tsx
<button
  className={cn(
    "relative w-full rounded-xl p-4 pt-5 text-white",
    "shadow-[0_0_25px_var(--logo-cyan)]/20",
    "bg-logo-cyan",
    "hover:brightness-110 hover:-translate-y-1 hover:scale-[1.02]",
    "active:scale-[0.98] active:translate-y-0"
  )}
>
```

### B. 統計卡片樣式差異

**Mobile (現況)**:
```tsx
<Card flex={1} padding="$4" backgroundColor="$background">
  <YStack gap="$2">
    <Text fontSize={12} color="$color" opacity={0.6}>{label}</Text>
    <Text fontSize={28} fontWeight="700" color={color}>{value}</Text>
  </YStack>
</Card>
```

**Product (目標)**:
```tsx
<div className={cn(
  "relative flex items-center gap-3 px-[18px] py-2 md:py-4",
  "bg-white border-l-[6px] border-light-cyan rounded-md"
)}>
  <span className="text-[1.75rem] font-semibold text-logo-cyan">{value}</span>
</div>
```

---

*最後更新: 2026-01-31*

---

## 執行進度摘要

### P0 - 必須立即處理（佈局重構）

| 任務 | 狀態 | 備註 |
|------|------|------|
| 首頁標題區重新設計 | ✅ 完成 | "我的小島" + 副標語 |
| 裝飾性插圖區 | ✅ 完成 | HomeBanner 組件 + Lottie 章魚動畫 |
| 移除今日進度卡片 | ✅ 完成 | |
| 移除統計卡片區 | ✅ 完成 | |
| 卡片佈局改為橫向滾動 | ✅ 完成 | 294px 寬度 |
| 卡片樣式 - 漸層背景 | ✅ 完成 | 黃/藍/粉/綠 |
| 分類標籤 (Badge) | ✅ 完成 | "主題實踐" |
| 狀態標籤 | ✅ 完成 | 草稿/進行中/未開始 |
| 卡片內容重構 | ✅ 完成 | |
| 底部進度條 | ✅ 完成 | |
| 進行中區塊標題 | ✅ 完成 | |
| 已完成區塊 | ✅ 完成 | |
| FAB 按鈕 | ✅ 完成 | #16B9B3 |
| Tab 簡化為 2 個 | ✅ 完成 | |
| Tab 圖標更新 | ✅ 完成 | Palmtree/User |

### P0 續 - 其他頁面重構

| 任務 | 狀態 | 備註 |
|------|------|------|
| 個人資料頁 - 頂部導航 | ✅ 完成 | |
| 個人資料頁 - 學習類型卡片 | ✅ 完成 | 章魚插圖待補 |
| 個人資料頁 - 用戶資料卡片 | ✅ 完成 | |
| 個人資料頁 - Tab 切換 | ✅ 完成 | |
| 實踐詳情頁 - 頂部導航 | ✅ 完成 | |
| 實踐詳情頁 - 標題區 | ✅ 完成 | |
| 實踐詳情頁 - 詳情卡片 | ✅ 完成 | |
| 實踐詳情頁 - 執行資訊區塊 | ✅ 完成 | 裝飾插圖待補 |
| 實踐詳情頁 - 底部打卡按鈕 | ✅ 完成 | 橘色 |
| 打卡紀錄頁 | ⏳ 待完成 | 物理引擎待實作 |
| 打卡表單 - 心情選擇器 | ✅ 完成 | 6 個表情 |
| 打卡表單 - 想法標籤 | ✅ 完成 | 可多選+自訂 |
| 打卡表單 - 詳細描述 | ✅ 完成 | 300 字限制 |
| 打卡表單 - 照片上傳 | ✅ 完成 | 最多 3 張 |
| 打卡表單 - 提交按鈕 | ✅ 完成 | 橘色 |
| 打卡表單 - Zod 驗證 | ⏳ 待完成 | 有基本驗證 |
| 建立實踐 - 模板選擇頁 | ⏳ 待完成 | |
| 建立實踐 - 模板預覽頁 | ⏳ 待完成 | |
| 建立實踐 - 手動建立 | ⏳ 待完成 | |

**完成率**: P0 100% | P0 續約 70%
