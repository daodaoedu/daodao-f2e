# 季度日記報告 — POC 設計規格

## 概述

在 daodao-f2e 中新增「季度日記報告」功能的 POC，讓使用者回顧一個季度的學習歷程。POC 階段實作 **B — 分頁導覽 (App Style)**，使用 shadcn Tabs 元件，6 個 Tab 完整實作。

## 設計決策

| 決策 | 選擇 | 原因 |
|------|------|------|
| 呈現方式 | B — 分頁導覽 (App Style) | 適合平台內嵌、行動優先，符合現有 daodao Tab 模式 |
| Tab 實作 | shadcn Tabs primitive | 一致性高、內建 a11y、開發快 |
| 圖表庫 | Recharts（現有） | 已在專案中，有 shadcn chart wrapper |
| 資料來源 | 有 API 就接，沒有就 mock | 快速驗證 UI，不阻塞後端 |
| 路由位置 | 獨立全頁 `/quarterly-report` | 沉浸式體驗，不帶 sidebar |
| 動畫 | motion/react (Framer Motion) | 已在專案中 |

## 路由與檔案結構

```
apps/product/src/app/[locale]/quarterly-report/
  page.tsx                          ← 獨立全頁（不帶 sidebar）

apps/product/src/components/quarterly-report/
  index.ts                          ← barrel export
  types.ts                          ← QuarterlyReportData interface
  quarterly-report-page.tsx         ← 主頁面：header + Tabs 容器
  mock-data.ts                      ← 範例資料（小海的 2026 Q2）
  tabs/
    overview-tab.tsx                ← 總覽
    monthly-tab.tsx                 ← 月記
    milestone-tab.tsx               ← 里程碑
    friends-tab.tsx                 ← 島友
    growth-tab.tsx                  ← 成長
    action-tab.tsx                  ← 行動
  components/
    stat-card.tsx                   ← 數字統計卡片
    mood-trend.tsx                  ← 心情趨勢迷你元件
    learning-radar-chart.tsx        ← 雷達圖 (Recharts RadarChart)
    mood-curve-chart.tsx            ← 心情曲線 (Recharts LineChart)
    milestone-timeline.tsx          ← 里程碑時間軸
    island-map.tsx                  ← 群島地圖 SVG
    action-card.tsx                 ← 行動建議卡片
```

## 資料型別

```typescript
interface QuarterlyReportData {
  user: { name: string; age: number; transition: string }
  quarter: { year: number; quarter: number; totalDays: number }

  // 總覽
  stats: { activeDays: number; topics: number; interactions: number; friends: number }

  // 月記
  months: Array<{
    month: number
    activeDays: number
    topics: number
    highlights: string[]
  }>

  // 里程碑
  milestones: Array<{
    date: string        // "2026-04-12"
    title: string
    description: string
  }>

  // 島友
  friends: Array<{
    name: string
    isCore: boolean     // 核心學伴 vs 一般島友
  }>

  // 成長
  learningRadar: Array<{
    dimension: string   // "UX 研究", "視覺設計", ...
    score: number       // 0-100
  }>
  moodCurve: Array<{
    week: number
    mood: MoodType      // 複用現有 MoodType
    score: number       // 數值化用於折線圖
  }>

  // 行動
  actions: Array<{
    title: string
    description: string
  }>
}
```

## 資料來源策略

| 欄位 | 來源 | 備註 |
|------|------|------|
| stats (activeDays, topics, interactions) | `useMyPracticeStats({ timeRange })` | 現有 API |
| moodCurve | `usePracticeCheckIns` 聚合每週心情 | 前端聚合 |
| milestones | mock data | 等後端 API |
| friends | mock data | 等後端 API |
| learningRadar | mock data | 等後端 API |
| actions | mock data | 等後端 API |
| months | 部分接 API + mock | 視可用資料而定 |

## UI 元件設計

### Tab Bar
- shadcn `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`
- 6 個 Tab：總覽、月記、里程碑、島友、成長、行動
- 行動端 TabsList 橫向滾動（`overflow-x-auto`）
- 預設進入「總覽」Tab

### 各 Tab 內容

| Tab | 內容 |
|-----|------|
| 總覽 | 4 個 stat-card + 月活躍度橫條 + 最近里程碑 x3 + 心情趨勢迷你 + 學習領域 top 3 |
| 月記 | 按月份分區塊，每月顯示活躍天數、主題數、亮點列表 |
| 里程碑 | 垂直時間軸，按日期排序 |
| 島友 | 群島 SVG 地圖 + 核心學伴列表（5 位）+ 島友數量 |
| 成長 | 雷達圖（學習領域六軸）+ 心情曲線（週為單位的折線圖） |
| 行動 | 下季度建議卡片列表（3 項） |

### 圖表
- **雷達圖**：Recharts `RadarChart` + `PolarGrid` + `PolarAngleAxis`，六軸（UX 研究/視覺設計/原型製作/前端基礎/訪談/設計思考）
- **心情曲線**：Recharts `LineChart` + `Line`，X 軸週數，Y 軸心情分數，MoodType 對應顏色
- 透過 `packages/ui` 的 `ChartContainer` + `ChartConfig` 套主題色

### 視覺風格
- 品牌色：`#16B9B3`（主色）、`#FFA10B`（橘）、`#F9DA4C`（黃）
- stat-card：大數字 + 標籤
- island-map：純 SVG，中心使用者節點，周圍學伴/島友節點 + 連線
- milestone-timeline：垂直時間軸，圓點 + 日期 + 標題描述
- action-card：卡片列表，標題 + 描述

### 動畫
- `motion/react` fade-in 用於 Tab 切換過場
- stat-card 數字 count-up 動畫

## 頁面流程

1. 使用者進入 `/quarterly-report`
2. Header 顯示：返回按鈕 + 使用者頭像/名字 + 季度標題
3. 預設顯示「總覽」Tab
4. 點擊 Tab 切換內容（client-side state，無 URL 變化）
5. Tab 內容以 fade-in 動畫進場

## 不在 POC 範圍

- 分享/下載圖片功能
- 季度選擇器（固定顯示一個季度）
- 後端 API 新增
- A（滾動敘事）和 C（Dashboard）呈現方式
- 多語系翻譯（POC 先用中文硬編碼）
