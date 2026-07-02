# 季度日記報告 POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a POC quarterly diary report page (App Style with 6 tabs) at `/quarterly-report`, using mock data + existing API hooks where available.

**Architecture:** Standalone full-page route (no sidebar) following the Practice Summary pattern — route page handles data orchestration, delegates to `QuarterlyReportPage` component. Six tabs via shadcn `Tabs`. Charts via Recharts + existing `ChartContainer` wrapper. Animations via `motion/react`.

**Tech Stack:** Next.js App Router, shadcn/ui Tabs, Recharts (RadarChart + LineChart), motion/react, Tailwind CSS

## Global Constraints

- POC — no i18n (Chinese hardcoded), no image export, no quarter selector
- Use frontend `MoodType` from `@/constants/mood` (not API MoodType)
- Brand colors: `#16B9B3` (primary), `#FFA10B` (orange), `#F9DA4C` (yellow), `#AFD24B` (green)
- Follow existing patterns: `"use client"` components, `@daodao/ui` imports, `cn()` for classNames
- No new dependencies — Recharts, motion/react, radix Tabs all already installed

---

### Task 1: Foundation — Types, Mock Data, Route, Tab Shell

**Files:**
- Create: `apps/product/src/components/quarterly-report/types.ts`
- Create: `apps/product/src/components/quarterly-report/mock-data.ts`
- Create: `apps/product/src/app/[locale]/quarterly-report/page.tsx`
- Create: `apps/product/src/components/quarterly-report/quarterly-report-page.tsx`
- Create: `apps/product/src/components/quarterly-report/index.ts`

**Interfaces:**
- Consumes: `MoodType` from `@/constants/mood`
- Produces: `QuarterlyReportData` type (used by all subsequent tasks), `MOCK_REPORT_DATA` constant, `QuarterlyReportPage` component

- [ ] **Step 1: Create `types.ts`**

```typescript
// apps/product/src/components/quarterly-report/types.ts
import type { MoodType } from "@/constants/mood";

export interface QuarterlyReportUser {
  name: string;
  age: number;
  transition: string;
}

export interface QuarterlyReportQuarter {
  year: number;
  quarter: number;
  totalDays: number;
}

export interface QuarterlyReportStats {
  activeDays: number;
  topics: number;
  interactions: number;
  friends: number;
}

export interface QuarterlyReportMonth {
  month: number;
  activeDays: number;
  topics: number;
  highlights: string[];
}

export interface QuarterlyReportMilestone {
  date: string;
  title: string;
  description: string;
}

export interface QuarterlyReportFriend {
  name: string;
  isCore: boolean;
}

export interface QuarterlyReportLearningDimension {
  dimension: string;
  score: number;
}

export interface QuarterlyReportMoodPoint {
  week: number;
  mood: MoodType;
  score: number;
}

export interface QuarterlyReportAction {
  title: string;
  description: string;
}

export interface QuarterlyReportData {
  user: QuarterlyReportUser;
  quarter: QuarterlyReportQuarter;
  stats: QuarterlyReportStats;
  months: QuarterlyReportMonth[];
  milestones: QuarterlyReportMilestone[];
  friends: QuarterlyReportFriend[];
  learningRadar: QuarterlyReportLearningDimension[];
  moodCurve: QuarterlyReportMoodPoint[];
  actions: QuarterlyReportAction[];
}
```

- [ ] **Step 2: Create `mock-data.ts`**

```typescript
// apps/product/src/components/quarterly-report/mock-data.ts
import type { QuarterlyReportData } from "./types";

export const MOCK_REPORT_DATA: QuarterlyReportData = {
  user: { name: "小海", age: 28, transition: "行銷 → UX Design" },
  quarter: { year: 2026, quarter: 2, totalDays: 91 },
  stats: { activeDays: 45, topics: 12, interactions: 156, friends: 18 },
  months: [
    { month: 4, activeDays: 15, topics: 4, highlights: ["完成 UX Bootcamp 結業", "開始 Portfolio 規劃"] },
    { month: 5, activeDays: 18, topics: 5, highlights: ["首件 Portfolio 作品完成", "參加設計工作坊"] },
    { month: 6, activeDays: 12, topics: 3, highlights: ["加入 UX 設計讀書會", "完成訪談練習"] },
  ],
  milestones: [
    { date: "2026-04-12", title: "UX Bootcamp 結業", description: "歷時 6 週，完成所有課程模組與期末專案" },
    { date: "2026-05-20", title: "首件 Portfolio 完成", description: "食物外送 App 重新設計 case study 上線" },
    { date: "2026-06-08", title: "加入 UX 設計讀書會", description: "每週二固定共學，與 8 位設計師交流" },
  ],
  friends: [
    { name: "小立", isCore: true },
    { name: "佳佳", isCore: true },
    { name: "阿明", isCore: true },
    { name: "小琳", isCore: true },
    { name: "志偉", isCore: true },
    { name: "美華", isCore: false },
    { name: "大毛", isCore: false },
    { name: "阿芳", isCore: false },
    { name: "小豪", isCore: false },
    { name: "思穎", isCore: false },
    { name: "家維", isCore: false },
    { name: "品萱", isCore: false },
    { name: "宗翰", isCore: false },
    { name: "雅婷", isCore: false },
    { name: "柏宇", isCore: false },
    { name: "欣怡", isCore: false },
    { name: "建志", isCore: false },
    { name: "淑芬", isCore: false },
  ],
  learningRadar: [
    { dimension: "UX 研究", score: 80 },
    { dimension: "視覺設計", score: 65 },
    { dimension: "原型製作", score: 70 },
    { dimension: "前端基礎", score: 45 },
    { dimension: "訪談", score: 55 },
    { dimension: "設計思考", score: 75 },
  ],
  moodCurve: [
    { week: 1, mood: "frustrated", score: 25 },
    { week: 2, mood: "bored", score: 35 },
    { week: 3, mood: "neutral", score: 50 },
    { week: 4, mood: "neutral", score: 45 },
    { week: 5, mood: "fine", score: 60 },
    { week: 6, mood: "fine", score: 65 },
    { week: 7, mood: "fine", score: 60 },
    { week: 8, mood: "happy", score: 75 },
    { week: 9, mood: "fine", score: 70 },
    { week: 10, mood: "happy", score: 80 },
    { week: 11, mood: "happy", score: 85 },
    { week: 12, mood: "happy", score: 90 },
  ],
  actions: [
    { title: "完成 3 件 Portfolio 作品", description: "延續本季的動力，建立完整作品集" },
    { title: "持續參與 UX 讀書會", description: "深化社群連結，擴大你的群島網絡" },
    { title: "找到一位業界 Mentor", description: "從島友中尋找在職設計師，定期 1:1" },
  ],
};
```

- [ ] **Step 3: Create route page `page.tsx`**

```tsx
// apps/product/src/app/[locale]/quarterly-report/page.tsx
"use client";

import { PageHeader } from "@/components/layout";
import { QuarterlyReportPage } from "@/components/quarterly-report";
import { MOCK_REPORT_DATA } from "@/components/quarterly-report/mock-data";

export default function QuarterlyReportRoute() {
  const data = MOCK_REPORT_DATA;

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <PageHeader leftAction="back" leftLabel="" title={`${data.quarter.year} Q${data.quarter.quarter} 季度報告`} />
      <main className="max-w-[640px] mx-auto pb-10">
        <QuarterlyReportPage data={data} />
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create `quarterly-report-page.tsx` with Tab shell**

```tsx
// apps/product/src/components/quarterly-report/quarterly-report-page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { motion } from "motion/react";
import type { QuarterlyReportData } from "./types";

const TABS = [
  { value: "overview", label: "總覽" },
  { value: "monthly", label: "月記" },
  { value: "milestone", label: "里程碑" },
  { value: "friends", label: "島友" },
  { value: "growth", label: "成長" },
  { value: "action", label: "行動" },
] as const;

interface QuarterlyReportPageProps {
  data: QuarterlyReportData;
}

export function QuarterlyReportPage({ data }: QuarterlyReportPageProps) {
  return (
    <div>
      {/* User header */}
      <motion.div
        className="px-5 pt-4 pb-2 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-text-dark">{data.user.name}的季度報告</h1>
        <p className="text-sm text-text-secondary mt-1">
          {data.quarter.year} Q{data.quarter.quarter} · {data.user.transition}
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center text-text-secondary py-10">
                {tab.label} — 待實作
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 5: Create barrel `index.ts`**

```typescript
// apps/product/src/components/quarterly-report/index.ts
export { QuarterlyReportPage } from "./quarterly-report-page";
```

- [ ] **Step 6: Verify — run dev server and visit `/quarterly-report`**

Run: `pnpm --filter product dev`

Expected: Page loads with header "小海的季度報告", subtitle "2026 Q2 · 行銷 → UX Design", 6 tabs visible, each showing "待實作" placeholder. Tabs switch on click.

- [ ] **Step 7: Commit**

```bash
git add apps/product/src/components/quarterly-report/ apps/product/src/app/*/quarterly-report/
git commit -m "feat(quarterly-report): scaffold route, types, mock data, and tab shell"
```

---

### Task 2: Shared Components — StatCard, MilestoneTimeline, ActionCard, MoodTrend

**Files:**
- Create: `apps/product/src/components/quarterly-report/components/stat-card.tsx`
- Create: `apps/product/src/components/quarterly-report/components/milestone-timeline.tsx`
- Create: `apps/product/src/components/quarterly-report/components/action-card.tsx`
- Create: `apps/product/src/components/quarterly-report/components/mood-trend.tsx`

**Interfaces:**
- Consumes: `QuarterlyReportMilestone`, `QuarterlyReportAction` from `./types`; `MoodType`, `MOOD_OPTIONS` from `@/constants/mood`
- Produces: `ReportStatCard`, `MilestoneTimeline`, `ActionCard`, `MoodTrend` components (used by tab components in Tasks 3-8)

- [ ] **Step 1: Create `stat-card.tsx`**

A report-specific stat card with count-up animation, different from the dashboard's `StatCard`.

```tsx
// apps/product/src/components/quarterly-report/components/stat-card.tsx
"use client";

import { cn } from "@daodao/ui/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect } from "react";

interface ReportStatCardProps {
  label: string;
  value: number;
  color?: string;
}

function CountUp({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [count, target]);

  return <motion.span>{rounded}</motion.span>;
}

export function ReportStatCard({ label, value, color = "#16B9B3" }: ReportStatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl bg-white p-4",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      )}
    >
      <span className="text-3xl font-bold" style={{ color }}>
        <CountUp target={value} />
      </span>
      <span className="text-xs text-[#536166] mt-1">{label}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create `milestone-timeline.tsx`**

```tsx
// apps/product/src/components/quarterly-report/components/milestone-timeline.tsx
"use client";

import { motion } from "motion/react";
import type { QuarterlyReportMilestone } from "../types";

interface MilestoneTimelineProps {
  milestones: QuarterlyReportMilestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[#E0E4E8]" />

      {milestones.map((milestone, i) => (
        <motion.div
          key={milestone.date}
          className="relative pb-6 last:pb-0"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          {/* Dot */}
          <div className="absolute -left-6 top-1.5 size-[18px] rounded-full border-2 border-white bg-[#16B9B3] shadow-sm" />

          {/* Content */}
          <div>
            <span className="text-xs text-[#8A9BA0]">
              {formatDate(milestone.date)}
            </span>
            <h4 className="text-sm font-semibold text-[#2D3436] mt-0.5">
              {milestone.title}
            </h4>
            <p className="text-xs text-[#536166] mt-0.5">
              {milestone.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
```

- [ ] **Step 3: Create `action-card.tsx`**

```tsx
// apps/product/src/components/quarterly-report/components/action-card.tsx
"use client";

import { motion } from "motion/react";
import type { QuarterlyReportAction } from "../types";

interface ActionCardProps {
  action: QuarterlyReportAction;
  index: number;
}

export function ActionCard({ action, index }: ActionCardProps) {
  return (
    <motion.div
      className="flex gap-3 rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E8F8F7] text-sm font-bold text-[#16B9B3]">
        {index + 1}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-[#2D3436]">{action.title}</h4>
        <p className="text-xs text-[#536166] mt-0.5">{action.description}</p>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Create `mood-trend.tsx`**

A compact mood indicator showing start-of-quarter → end-of-quarter mood with emoji.

```tsx
// apps/product/src/components/quarterly-report/components/mood-trend.tsx
"use client";

import { MOOD_OPTIONS } from "@/constants/mood";
import type { QuarterlyReportMoodPoint } from "../types";

interface MoodTrendProps {
  moodCurve: QuarterlyReportMoodPoint[];
}

export function MoodTrend({ moodCurve }: MoodTrendProps) {
  if (moodCurve.length === 0) return null;

  const first = moodCurve[0];
  const last = moodCurve[moodCurve.length - 1];
  const FirstEmoji = MOOD_OPTIONS.find((m) => m.id === first.mood)?.emoji;
  const LastEmoji = MOOD_OPTIONS.find((m) => m.id === last.mood)?.emoji;

  return (
    <div className="flex items-center gap-2">
      {FirstEmoji && <FirstEmoji className="size-6" />}
      <div className="flex-1 h-px border-t border-dashed border-[#8A9BA0]" />
      <span className="text-xs text-[#8A9BA0]">→</span>
      <div className="flex-1 h-px border-t border-dashed border-[#8A9BA0]" />
      {LastEmoji && <LastEmoji className="size-6" />}
    </div>
  );
}
```

- [ ] **Step 5: Verify — typecheck**

Run: `pnpm run typecheck`

Expected: No errors related to quarterly-report components.

- [ ] **Step 6: Commit**

```bash
git add apps/product/src/components/quarterly-report/components/
git commit -m "feat(quarterly-report): add shared components — stat card, timeline, action card, mood trend"
```

---

### Task 3: Overview Tab

**Files:**
- Create: `apps/product/src/components/quarterly-report/tabs/overview-tab.tsx`
- Modify: `apps/product/src/components/quarterly-report/quarterly-report-page.tsx` — replace overview placeholder with `OverviewTab`

**Interfaces:**
- Consumes: `QuarterlyReportData` from `../types`; `ReportStatCard` from `../components/stat-card`; `MoodTrend` from `../components/mood-trend`
- Produces: `OverviewTab` component

- [ ] **Step 1: Create `overview-tab.tsx`**

Contains: 4 stat cards in a 2×2 grid, monthly activity bars, top 3 milestones preview, mood trend mini, learning top 3.

```tsx
// apps/product/src/components/quarterly-report/tabs/overview-tab.tsx
"use client";

import { cn } from "@daodao/ui/lib/utils";
import { motion } from "motion/react";
import { MoodTrend } from "../components/mood-trend";
import { ReportStatCard } from "../components/stat-card";
import type { QuarterlyReportData } from "../types";

interface OverviewTabProps {
  data: QuarterlyReportData;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const maxActiveDays = Math.max(...data.months.map((m) => m.activeDays));

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <ReportStatCard label="活躍天" value={data.stats.activeDays} />
        <ReportStatCard label="主題" value={data.stats.topics} color="#FFA10B" />
        <ReportStatCard label="互動" value={data.stats.interactions} color="#F9DA4C" />
        <ReportStatCard label="島友" value={data.stats.friends} color="#AFD24B" />
      </div>

      {/* Monthly activity bars */}
      <Section title="活躍度">
        <div className="space-y-3">
          {data.months.map((month) => (
            <div key={month.month} className="flex items-center gap-3">
              <span className="w-10 text-xs text-[#536166] text-right">{month.month}月</span>
              <div className="flex-1 h-6 rounded-full bg-[#F0F2F4] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#16B9B3]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(month.activeDays / maxActiveDays) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              <span className="w-8 text-xs text-[#536166]">{month.activeDays}天</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Recent milestones preview */}
      <Section title="最近里程碑">
        <div className="space-y-2">
          {data.milestones.slice(0, 3).map((m) => (
            <div key={m.date} className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-[#16B9B3] shrink-0" />
              <span className="text-sm text-[#2D3436] truncate">{m.title}</span>
              <span className="text-xs text-[#8A9BA0] ml-auto shrink-0">
                {new Date(m.date).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Mood trend */}
      <Section title="心情趨勢">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8A9BA0]">季初</span>
          <div className="flex-1">
            <MoodTrend moodCurve={data.moodCurve} />
          </div>
          <span className="text-xs text-[#8A9BA0]">季末</span>
        </div>
      </Section>

      {/* Learning top 3 */}
      <Section title="學習領域">
        <div className="space-y-2">
          {data.learningRadar
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((dim) => (
              <div key={dim.dimension} className="flex items-center gap-3">
                <span className="text-sm text-[#2D3436] w-20">{dim.dimension}</span>
                <div className="flex-1 h-2 rounded-full bg-[#F0F2F4] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#16B9B3]"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <span className="text-xs text-[#536166] w-8 text-right">{dim.score}%</span>
              </div>
            ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]")}>
      <h3 className="text-sm font-bold text-[#2D3436] mb-3">{title}</h3>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Wire into `quarterly-report-page.tsx`**

Replace the overview placeholder `TabsContent` with the actual component. In `quarterly-report-page.tsx`, add import and replace the generic placeholder rendering:

Replace the `{TABS.map((tab) => (` block with individual `TabsContent` entries. Overview uses `OverviewTab`, others keep placeholders for now:

```tsx
// Add import at top:
import { OverviewTab } from "./tabs/overview-tab";

// Replace the TABS.map block inside <Tabs>:
        <TabsContent value="overview">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <OverviewTab data={data} />
          </motion.div>
        </TabsContent>

        {TABS.filter((t) => t.value !== "overview").map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="text-center text-text-secondary py-10">{tab.label} — 待實作</div>
            </motion.div>
          </TabsContent>
        ))}
```

- [ ] **Step 3: Verify visually**

Visit `/quarterly-report` → Overview tab should show: 4 stat cards with count-up animation, monthly activity bars with animated fill, 3 milestone previews, mood trend with emoji, learning top 3 progress bars.

- [ ] **Step 4: Commit**

```bash
git add apps/product/src/components/quarterly-report/tabs/overview-tab.tsx apps/product/src/components/quarterly-report/quarterly-report-page.tsx
git commit -m "feat(quarterly-report): implement overview tab with stats, activity, milestones, mood trend"
```

---

### Task 4: Monthly Tab + Milestone Tab

**Files:**
- Create: `apps/product/src/components/quarterly-report/tabs/monthly-tab.tsx`
- Create: `apps/product/src/components/quarterly-report/tabs/milestone-tab.tsx`
- Modify: `apps/product/src/components/quarterly-report/quarterly-report-page.tsx` — wire both tabs

**Interfaces:**
- Consumes: `QuarterlyReportData` from `../types`; `MilestoneTimeline` from `../components/milestone-timeline`
- Produces: `MonthlyTab`, `MilestoneTab` components

- [ ] **Step 1: Create `monthly-tab.tsx`**

```tsx
// apps/product/src/components/quarterly-report/tabs/monthly-tab.tsx
"use client";

import { motion } from "motion/react";
import type { QuarterlyReportData } from "../types";

interface MonthlyTabProps {
  data: QuarterlyReportData;
}

export function MonthlyTab({ data }: MonthlyTabProps) {
  return (
    <div className="space-y-4">
      {data.months.map((month, i) => (
        <motion.div
          key={month.month}
          className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-bold text-[#2D3436]">{month.month} 月</h3>
            <div className="flex gap-3 text-xs text-[#536166]">
              <span>{month.activeDays} 天活躍</span>
              <span>·</span>
              <span>{month.topics} 個主題</span>
            </div>
          </div>
          <ul className="space-y-1.5">
            {month.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2">
                <div className="size-1.5 rounded-full bg-[#16B9B3] mt-1.5 shrink-0" />
                <span className="text-sm text-[#536166]">{highlight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `milestone-tab.tsx`**

```tsx
// apps/product/src/components/quarterly-report/tabs/milestone-tab.tsx
"use client";

import { MilestoneTimeline } from "../components/milestone-timeline";
import type { QuarterlyReportData } from "../types";

interface MilestoneTabProps {
  data: QuarterlyReportData;
}

export function MilestoneTab({ data }: MilestoneTabProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-bold text-[#2D3436] mb-4">成就里程碑</h3>
      <MilestoneTimeline milestones={data.milestones} />
    </div>
  );
}
```

- [ ] **Step 3: Wire both tabs into `quarterly-report-page.tsx`**

Add imports and replace the corresponding placeholders:

```tsx
// Add imports:
import { MonthlyTab } from "./tabs/monthly-tab";
import { MilestoneTab } from "./tabs/milestone-tab";

// Add TabsContent entries (after OverviewTab's TabsContent, before the remaining TABS.filter block):
        <TabsContent value="monthly">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <MonthlyTab data={data} />
          </motion.div>
        </TabsContent>

        <TabsContent value="milestone">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <MilestoneTab data={data} />
          </motion.div>
        </TabsContent>

// Update the TABS.filter to exclude these two as well:
        {TABS.filter((t) => !["overview", "monthly", "milestone"].includes(t.value)).map((tab) => (
```

- [ ] **Step 4: Verify visually**

Monthly tab: 3 month cards with activity stats and highlight bullets. Milestone tab: vertical timeline with 3 milestones, animated entry.

- [ ] **Step 5: Commit**

```bash
git add apps/product/src/components/quarterly-report/tabs/monthly-tab.tsx apps/product/src/components/quarterly-report/tabs/milestone-tab.tsx apps/product/src/components/quarterly-report/quarterly-report-page.tsx
git commit -m "feat(quarterly-report): implement monthly and milestone tabs"
```

---

### Task 5: Friends Tab — Island Map SVG

**Files:**
- Create: `apps/product/src/components/quarterly-report/components/island-map.tsx`
- Create: `apps/product/src/components/quarterly-report/tabs/friends-tab.tsx`
- Modify: `apps/product/src/components/quarterly-report/quarterly-report-page.tsx` — wire friends tab

**Interfaces:**
- Consumes: `QuarterlyReportData` from `../types`
- Produces: `IslandMap`, `FriendsTab` components

- [ ] **Step 1: Create `island-map.tsx`**

SVG-based network graph with the user at center, core friends in an inner ring, and other friends in an outer ring.

```tsx
// apps/product/src/components/quarterly-report/components/island-map.tsx
"use client";

import type { QuarterlyReportFriend } from "../types";

interface IslandMapProps {
  userName: string;
  friends: QuarterlyReportFriend[];
}

const CORE_COLORS = ["#FFA10B", "#F9DA4C", "#AFD24B", "#FFDACE", "#98E4F1"];
const OUTER_COLOR = "#DEDBFF";

export function IslandMap({ userName, friends }: IslandMapProps) {
  const coreFriends = friends.filter((f) => f.isCore);
  const outerFriends = friends.filter((f) => !f.isCore);
  const cx = 200;
  const cy = 130;

  return (
    <svg viewBox="0 0 400 260" className="w-full">
      <rect width="400" height="260" rx="8" fill="#E8F8F7" />

      {/* Connection lines */}
      {coreFriends.map((_, i) => {
        const pos = ringPosition(cx, cy, 80, i, coreFriends.length);
        return <line key={`cl-${i}`} x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke="#16B9B3" strokeWidth="1" opacity="0.2" />;
      })}

      {/* Outer friends */}
      {outerFriends.slice(0, 8).map((f, i) => {
        const pos = ringPosition(cx, cy, 115, i, Math.min(outerFriends.length, 8));
        return (
          <g key={`o-${i}`}>
            <circle cx={pos.x} cy={pos.y} r="8" fill={OUTER_COLOR} opacity="0.6" />
            <text x={pos.x} y={pos.y + 3} textAnchor="middle" fill="#536166" fontSize="6" fontWeight="500">
              {f.name.slice(0, 1)}
            </text>
          </g>
        );
      })}

      {/* Core friends */}
      {coreFriends.map((f, i) => {
        const pos = ringPosition(cx, cy, 80, i, coreFriends.length);
        const color = CORE_COLORS[i % CORE_COLORS.length];
        return (
          <g key={`c-${i}`}>
            <circle cx={pos.x} cy={pos.y} r="16" fill={color} />
            <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
              {f.name}
            </text>
          </g>
        );
      })}

      {/* Center user */}
      <circle cx={cx} cy={cy} r="24" fill="#16B9B3" stroke="#fff" strokeWidth="3" />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
        {userName}
      </text>
    </svg>
  );
}

function ringPosition(cx: number, cy: number, radius: number, index: number, total: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}
```

- [ ] **Step 2: Create `friends-tab.tsx`**

```tsx
// apps/product/src/components/quarterly-report/tabs/friends-tab.tsx
"use client";

import { motion } from "motion/react";
import { IslandMap } from "../components/island-map";
import type { QuarterlyReportData } from "../types";

interface FriendsTabProps {
  data: QuarterlyReportData;
}

export function FriendsTab({ data }: FriendsTabProps) {
  const coreFriends = data.friends.filter((f) => f.isCore);

  return (
    <div className="space-y-4">
      {/* Island map */}
      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-bold text-[#2D3436] mb-3">
          你的群島 · {coreFriends.length} 位核心學伴 + {data.friends.length - coreFriends.length} 位島友
        </h3>
        <IslandMap userName={data.user.name} friends={data.friends} />
      </div>

      {/* Core friends list */}
      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-bold text-[#2D3436] mb-3">核心學伴</h3>
        <div className="flex flex-wrap gap-2">
          {coreFriends.map((f, i) => (
            <motion.div
              key={f.name}
              className="flex items-center gap-2 rounded-full bg-[#E8F8F7] px-3 py-1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <div className="size-5 rounded-full bg-[#16B9B3] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{f.name.slice(0, 1)}</span>
              </div>
              <span className="text-sm text-[#2D3436]">{f.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into `quarterly-report-page.tsx`**

```tsx
// Add import:
import { FriendsTab } from "./tabs/friends-tab";

// Add TabsContent (after MilestoneTab):
        <TabsContent value="friends">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <FriendsTab data={data} />
          </motion.div>
        </TabsContent>

// Update filter: !["overview", "monthly", "milestone", "friends"].includes(t.value)
```

- [ ] **Step 4: Verify visually**

Friends tab: SVG island map with center "小海" node, 5 core friends in inner ring with colored circles, outer friends as smaller dots. Below: core friends as pill chips.

- [ ] **Step 5: Commit**

```bash
git add apps/product/src/components/quarterly-report/components/island-map.tsx apps/product/src/components/quarterly-report/tabs/friends-tab.tsx apps/product/src/components/quarterly-report/quarterly-report-page.tsx
git commit -m "feat(quarterly-report): implement friends tab with island map SVG"
```

---

### Task 6: Growth Tab — Radar Chart + Mood Curve

**Files:**
- Create: `apps/product/src/components/quarterly-report/components/learning-radar-chart.tsx`
- Create: `apps/product/src/components/quarterly-report/components/mood-curve-chart.tsx`
- Create: `apps/product/src/components/quarterly-report/tabs/growth-tab.tsx`
- Modify: `apps/product/src/components/quarterly-report/quarterly-report-page.tsx` — wire growth tab

**Interfaces:**
- Consumes: `QuarterlyReportData` from `../types`; `ChartContainer`, `ChartConfig`, `ChartTooltip`, `ChartTooltipContent` from `@daodao/ui/components/chart`
- Produces: `LearningRadarChart`, `MoodCurveChart`, `GrowthTab` components

- [ ] **Step 1: Create `learning-radar-chart.tsx`**

```tsx
// apps/product/src/components/quarterly-report/components/learning-radar-chart.tsx
"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@daodao/ui/components/chart";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import type { QuarterlyReportLearningDimension } from "../types";

interface LearningRadarChartProps {
  dimensions: QuarterlyReportLearningDimension[];
}

const chartConfig = {
  score: { label: "掌握度", color: "#16B9B3" },
} satisfies ChartConfig;

export function LearningRadarChart({ dimensions }: LearningRadarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
      <RadarChart data={dimensions}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <PolarGrid stroke="#E0E4E8" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#536166" }} />
        <Radar
          dataKey="score"
          fill="var(--color-score)"
          fillOpacity={0.2}
          stroke="var(--color-score)"
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  );
}
```

- [ ] **Step 2: Create `mood-curve-chart.tsx`**

```tsx
// apps/product/src/components/quarterly-report/components/mood-curve-chart.tsx
"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@daodao/ui/components/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { QuarterlyReportMoodPoint } from "../types";

interface MoodCurveChartProps {
  moodCurve: QuarterlyReportMoodPoint[];
}

const chartConfig = {
  score: { label: "心情", color: "#16B9B3" },
} satisfies ChartConfig;

export function MoodCurveChart({ moodCurve }: MoodCurveChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <LineChart data={moodCurve} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F4" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "#8A9BA0" }}
          tickFormatter={(w: number) => `W${w}`}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#8A9BA0" }}
          domain={[0, 100]}
          tickCount={5}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-score)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-score)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
```

- [ ] **Step 3: Create `growth-tab.tsx`**

```tsx
// apps/product/src/components/quarterly-report/tabs/growth-tab.tsx
"use client";

import { LearningRadarChart } from "../components/learning-radar-chart";
import { MoodCurveChart } from "../components/mood-curve-chart";
import type { QuarterlyReportData } from "../types";

interface GrowthTabProps {
  data: QuarterlyReportData;
}

export function GrowthTab({ data }: GrowthTabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-bold text-[#2D3436] mb-2">學習領域雷達圖</h3>
        <LearningRadarChart dimensions={data.learningRadar} />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-bold text-[#2D3436] mb-2">心情變化曲線</h3>
        <p className="text-xs text-[#8A9BA0] mb-3">從焦慮不安到自信滿滿的 12 週</p>
        <MoodCurveChart moodCurve={data.moodCurve} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire into `quarterly-report-page.tsx`**

```tsx
// Add import:
import { GrowthTab } from "./tabs/growth-tab";

// Add TabsContent (after FriendsTab):
        <TabsContent value="growth">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GrowthTab data={data} />
          </motion.div>
        </TabsContent>

// Update filter: !["overview", "monthly", "milestone", "friends", "growth"].includes(t.value)
```

- [ ] **Step 5: Verify visually**

Growth tab: Radar chart with 6 axes showing learning dimensions. Line chart below showing mood score over 12 weeks with smooth curve.

- [ ] **Step 6: Commit**

```bash
git add apps/product/src/components/quarterly-report/components/learning-radar-chart.tsx apps/product/src/components/quarterly-report/components/mood-curve-chart.tsx apps/product/src/components/quarterly-report/tabs/growth-tab.tsx apps/product/src/components/quarterly-report/quarterly-report-page.tsx
git commit -m "feat(quarterly-report): implement growth tab with radar chart and mood curve"
```

---

### Task 7: Action Tab + Final Cleanup

**Files:**
- Create: `apps/product/src/components/quarterly-report/tabs/action-tab.tsx`
- Modify: `apps/product/src/components/quarterly-report/quarterly-report-page.tsx` — wire action tab, remove placeholder fallback

**Interfaces:**
- Consumes: `QuarterlyReportData` from `../types`; `ActionCard` from `../components/action-card`
- Produces: `ActionTab` component; fully complete `QuarterlyReportPage` with all 6 tabs wired

- [ ] **Step 1: Create `action-tab.tsx`**

```tsx
// apps/product/src/components/quarterly-report/tabs/action-tab.tsx
"use client";

import { ActionCard } from "../components/action-card";
import type { QuarterlyReportData } from "../types";

interface ActionTabProps {
  data: QuarterlyReportData;
}

export function ActionTab({ data }: ActionTabProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[#2D3436]">下季度建議行動</h3>
      {data.actions.map((action, i) => (
        <ActionCard key={action.title} action={action} index={i} />
      ))}

      <div className="mt-6 rounded-xl bg-[#E8F8F7] p-4 text-center">
        <p className="text-sm text-[#16B9B3] font-medium">
          每個人都是一座擁有豐富資源的島
        </p>
        <p className="text-xs text-[#536166] mt-1">
          透過互助共學，成為一片獨立又連結的群島
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Final `quarterly-report-page.tsx` — wire action tab, remove placeholder fallback**

Replace the entire Tabs rendering section. Remove the `TABS.filter(...).map(...)` fallback block entirely. The final `<Tabs>` section should have all 6 explicit `TabsContent` entries:

```tsx
// Full imports at top of file:
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { motion } from "motion/react";
import { ActionTab } from "./tabs/action-tab";
import { FriendsTab } from "./tabs/friends-tab";
import { GrowthTab } from "./tabs/growth-tab";
import { MilestoneTab } from "./tabs/milestone-tab";
import { MonthlyTab } from "./tabs/monthly-tab";
import { OverviewTab } from "./tabs/overview-tab";
import type { QuarterlyReportData } from "./types";

// Inside the Tabs component, after TabsList:
        <TabsContent value="overview">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <OverviewTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="monthly">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <MonthlyTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="milestone">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <MilestoneTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="friends">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <FriendsTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="growth">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GrowthTab data={data} />
          </motion.div>
        </TabsContent>
        <TabsContent value="action">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ActionTab data={data} />
          </motion.div>
        </TabsContent>
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm run typecheck`

Expected: No type errors.

- [ ] **Step 4: Run lint**

Run: `pnpm run lint`

Expected: No lint errors. If any, fix with `pnpm run check:fix`.

- [ ] **Step 5: Full visual verification**

Visit `/quarterly-report` and verify all 6 tabs:
1. **總覽** — 4 stat cards (count-up), activity bars (animated), milestones, mood trend, learning top 3
2. **月記** — 3 month cards with highlights
3. **里程碑** — vertical timeline with 3 entries
4. **島友** — SVG island map + core friends chips
5. **成長** — radar chart (6 axes) + mood line chart (12 weeks)
6. **行動** — 3 action cards + footer quote

Tab switching should show fade-in animation. All tabs should be scrollable on mobile viewport.

- [ ] **Step 6: Commit**

```bash
git add apps/product/src/components/quarterly-report/
git commit -m "feat(quarterly-report): implement action tab, complete all 6 tabs"
```
