# Learning Harness 嵌入真實頁面設計

## 概要

在現有產品頁面中直接嵌入 Learning Harness 功能，用 `NEXT_PUBLIC_HARNESS_DEMO` env var 控制顯示。使用者打開真實頁面即可看到 harness 功能在正確位置的效果。

## 決策

- **嵌入方式**：方案 A — 直接修改現有元件，conditionally render harness UI
- **資料來源**：與現有 API 整合（`usePracticeById`、`usePracticeCheckIns` 等），Buddy 相關用 mock data
- **範圍**：全部 6 個頁面一次做完
- **開關**：`NEXT_PUBLIC_HARNESS_DEMO=1` 時顯示，不設定時完全不渲染

## 修改的檔案與嵌入位置

### 1. 打卡 Sheet（`components/check-in/form/check-in-sheet.tsx`）

**位置**：`CheckInSheetContent` 中，任務標題之後、心情選擇之前

**嵌入內容**：
- Pre-check-in ritual（Hooks）：引用上次筆記，自動帶入方法
- 方法確認（Tools）：「繼續文字閱讀？[開始]」

**資料來源**：
- 需要新增 prop 傳入最近的 check-in note（從 `usePracticeCheckIns` 取得）
- 從 practice 標題/tags 推斷學習方法

### 2. 打卡成功 Dialog（`hooks/use-check-in-success-dialog.tsx`）

**位置**：`Step2Animation`（鼓勵語）之後

**嵌入內容**：
- 火苗狀態更新（Multi-Agent）：mock buddy ember 狀態
- AI 連結（Observability）：比對最近兩筆 check-in notes 的主題

**資料來源**：
- Buddy ember：mock data
- 筆記比對：從 `usePracticeCheckIns` 取最近 5 筆 notes

### 3. 實踐詳情頁（`components/practice/detail/practice-detail-shell.tsx`）

**位置**：`PracticeOverviewCard` 之後、tabs（打卡紀錄/留言）之前

**嵌入內容**：
- Buddy 火苗狀態（Multi-Agent）：mock buddy + ember 等級
- Drift 提醒（Drift Detection）：從 checkInsData 計算打卡間距，間距拉大時顯示 buddy 關心訊息
- Skills 建議（Skills）：基於 practice tags 靜態策展

**資料來源**：
- `checkInsData` prop 已存在（用於計算 drift）
- `practiceData` prop 已存在（用於 tags → skills 映射）
- Buddy：mock data

### 4. 實踐總結頁（`components/practice/summary/practice-summary-page.tsx`）

**位置**：`PracticeSummaryCard` 之後、分享功能區之前

**嵌入內容**：
- 旅程回顧（Observability）：反覆出現的主題標籤、心情弧線
- 信拆封（Context Durability）：Day 1 note vs 最後一筆 note 對比
- AI 洞察（Observability）：mood 與 note 長度的相關性

**資料來源**：
- `summary` prop 的 `topMoods`、`topNotes`
- 需要額外用 `usePracticeCheckIns` 取完整 mood 序列和第一筆 note

### 5. 首頁（`app/[locale]/(with-layout)/mine/page.tsx`）

**位置**：`DashboardHeader` 之後、filter tabs 之前

**嵌入內容**：
- 每日聚合通知（Hooks）：Buddy 打卡了、火苗在等你、上次讀到哪

**資料來源**：
- `useMyPractices` 取最近的 practice
- Buddy：mock data

### 6. 建立實踐流程（`components/practice/create/manual/`）

**位置 A**：Step 1 之前 — Persona 快問（Memory）
**位置 B**：Step 5 之後、確認建立之前 — 寫信給未來的自己（Context Durability）

**嵌入內容**：
- Persona 3 題快問：答案存 `localStorage`
- 寫信給未來的自己：內容存 `localStorage`

**資料來源**：純前端 `localStorage`

## 共用 Harness 元件

建立 `components/learning-harness/embedded/` 目錄，存放嵌入用的子元件：

| 元件 | 用途 | 使用頁面 |
|---|---|---|
| `HarnessGate` | 檢查 `NEXT_PUBLIC_HARNESS_DEMO` env var，不開時 render null | 所有 |
| `PreCheckInRitual` | 打卡前引用上次筆記 + 方法帶入 | 打卡 Sheet |
| `PostCheckInFeedback` | 火苗更新 + AI 連結 | 成功 Dialog |
| `BuddyEmberStatus` | Buddy 火苗狀態展示 | 詳情頁、首頁 |
| `DriftAlert` | 偵測打卡間距 + buddy 關心 | 詳情頁 |
| `SkillSuggestion` | 按需載入策略建議 | 詳情頁 |
| `JourneyReview` | 旅程回顧 scrapbook | 總結頁 |
| `Day1LetterReveal` | Day 1 vs Day 30 對比 | 總結頁 |
| `DailyDigest` | 每日聚合通知 | 首頁 |
| `PersonaQuickInit` | 3 題快問 | 建立流程 |
| `LetterToFutureSelf` | 寫信給未來的自己 | 建立流程 |

## Drift Detection 演算法

從 `checkInsData` 計算：

```
recent_gaps = 最近 5 筆 check-in 的 checkin_date 間距
avg_recent = recent_gaps 平均值
threshold = practice 的 frequency_max_days（如 5 天）

if avg_recent > threshold:
  顯示 drift alert
```

同時偵測 note 長度衰退：
```
recent_notes = 最近 5 筆的 note 長度
older_notes = 之前 5 筆的 note 長度

if avg(recent_notes) < avg(older_notes) * 0.3:
  在 drift alert 中提及「反思變少了」
```

## 不做的事

- 不建新的 API endpoint
- 不改 DB schema
- 不做 Buddy 配對的後端邏輯（全部 mock）
- 不做 AI 生成（AI 洞察用規則比對，不呼叫 LLM）
- 不做 localStorage 以外的 Persona/Letter 持久化
