# 我的小島 × 學習生活 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 PR #861 的泛用 LifeWarehouse 重構為以學習為中心的「學習生活」模塊：島頁只放摘要卡、完整頁走 `/me/learning-life` 兩主軸（今天／洞察）三層揭露，並讓島景 header 依打卡狀態顯示天氣。

**Architecture:** 沿用 PR #861 的 mock-store 模式（`useSyncExternalStore` + sessionStorage）與圖表元件；資料模型改為 CheckIn（鏡射 `CheckInEntity`，主角）＋瘦身版 DailyRecord（配角）；天氣規則獨立為純函式 `island-weather.ts` 供 header 與摘要卡共用。

**Tech Stack:** Next.js 15 App Router、React 19、Tailwind、recharts（既有 ChartContainer）、date-fns、vitest。

**Spec:** `docs/superpowers/specs/2026-07-07-island-learning-life-design.md`

## Global Constraints

- POC 文案直接硬編碼繁體中文（沿用挑戰 POC 慣例），不新增 i18n key。
- 打卡表單與相關 API 呼叫**零改動**（spec 原則四）。
- Storage 沿用 `StorageEnum.PocLifeWarehouse`（sessionStorage），不新增 enum。
- 色彩沿用 PR #861 palette：`#16B9B3`(logo-cyan)、`#2D3436`、`#636E72`、`#8A9BA0`、`#E0E4E8`、`#F5F7FA`。
- 每個 task 完成後執行 `pnpm run lint` 與 `pnpm run typecheck`，全綠才 commit。
- Commit message 使用專案格式 `type(scope): 描述`＋`## Why is this necessary?`／`## How does it address?` 區塊。
- POC 簡化備註（與 spec §7 的偏差）：精力 ≥4 的「小動物活力動畫加速」以 ✨ sparkle emoji 呈現，不改 Lottie 播放速度。
- 文案原則（學習體驗）：中斷不責備——陰天/多雲文案用歡迎語不用「沒動靜」類指責框架；週摘要下滑時給體諒句不給負向比較；心情是訊號不是分數——以分佈呈現、不做平均折線，`CHECKIN_MOOD_META` 不含 score 欄位。
- UI 風格慣例（對照 project-rules 與既有 POC 程式碼確認）：
  - 禁止嵌套三元（含 JSX）、日期一律 date-fns（`parseISO`/`subDays`，禁 `new Date(str)`＋`setDate`/`getDay`）——PR #861 舊碼有違規處，重寫時一併修正，不複製。
  - toggle/pill 類互動元件沿用 POC 慣例：原生 `<button type="button">`＋`cn()`；CTA 用 `@daodao/ui` 的 `Button`。
  - Props interface 不加 `I` 前綴（跟隨 life-warehouse/挑戰 POC 周邊程式碼，settings/ 的 I 前綴慣例不適用此區）。
  - Design tokens：`text-text-dark`、`text-logo-cyan`、`bg-logo-cyan` 存在（globals.css）；`text-text-secondary` **未定義**但 `/mine` 挑戰卡已在用（渲染為預設前景色）——摘要卡沿用以維持與同型卡片視覺一致，屬既有已知現象，不在本計畫修。
- Mock 打卡刻意設計：昨天起往回 6 天必有打卡（streak=6）、今天無打卡 → 使用者在「今天」tab 完成示意打卡後 streak 達 7，島景立即出現彩虹（展示「島是活的」核心體驗）。

## POC 量測（PostHog）

用既有 `@daodao/analytics` 的 `posthogCapture`（專案慣例：snake_case 事件名）。埋點收斂在 `learningLifeActions`（單一入口，UI 全自動涵蓋）＋兩張島頁摘要卡的 onClick。`/me/learning-life` pageview 由 PostHog `capture_pageview: true` 自動收，不用埋。

| 事件 | 埋點位置 | 回答的假設（spec §9） |
|---|---|---|
| `learning_life_tab_switched` `{tab}` | `setActiveTab` | 假設 1：洞察 tab 進入率 |
| `learning_life_insight_drilldown` `{view}` | `setInsightView`（僅 view ≠ cards） | 假設 1：第三層下鑽率 |
| `learning_life_quick_track_used` `{field}` | `setEnergy`/`setSleep`/`toggleContextTag` | 假設 2：快速記錄單次完成率 |
| `learning_life_mock_checkin_added` `{streak_after}` | `addMockCheckin` | 假設 3：彩虹動線觸發數 |
| `island_summary_card_clicked` `{card}` | 兩張摘要卡 onClick | 假設 3：島頁卡片點擊率 |

分析（PostHog 建兩個 funnel）：
1. 洞察漏斗：pageview → `tab_switched(insights)` → `insight_drilldown`
2. 記錄漏斗：`quick_track_used(energy)` → `(sleep)` → `(context_tag)`

質性補充：Clarity session replay 觀察打卡後回島頁的行為（假設 3）。已知限制：sessionStorage 跨 session 歸零，假設 2 的「跨天持續性」本版驗證不了，只測單次完成率。

## File Structure（重構後）

```
apps/product/src/app/[locale]/me/learning-life/page.tsx     新路由
apps/product/src/components/learning-life/                  由 life-warehouse/ 改名
├── index.ts                    barrel：LearningLifePage、島頁摘要卡、IslandWeatherLayer
├── learning-life-page.tsx      主頁殼（今天/洞察 tab 切換）
├── types.ts                    瘦身 DailyRecord + MockCheckin + Insight
├── constants.ts                TABS(2)、CONTEXT_TAGS、CHECKIN_MOOD_META、瘦身 METRIC_CONFIGS
├── mock-data.ts                mock 打卡 + 瘦身每日脈絡 + 學習語境洞察/相關性
├── mock-store.ts               state {records, checkins, activeTab, insightView, ...}
├── checkin-stats.ts            打卡統計純函式（streak、週摘要、心情分佈）
├── island-weather.ts           天氣規則純函式
├── island-weather-layer.tsx    島景 header 的天氣疊加層
├── today-weather-card.tsx      島頁摘要卡 1：今日天氣
├── rhythm-insight-card.tsx     島頁摘要卡 2：節奏洞察
├── utils.ts                    通用計算（period/average/tag frequency/sparkline）
├── __tests__/
│   ├── island-weather.test.ts
│   └── checkin-stats.test.ts
├── today/
│   ├── today-tab.tsx           今日打卡 + 快速記錄 + 規劃中區塊
│   ├── quick-track.tsx         精力/睡眠/環境標籤 一鍵記錄
│   └── today-checkins.tsx      今日打卡列表 + CTA
├── insights/
│   ├── insights-tab.tsx        Hero + 洞察卡 + 下鑽切換
│   ├── weekly-hero.tsx         第一層：本週一句話摘要
│   ├── insight-card.tsx        第二層：精選洞察卡
│   ├── trends-view.tsx         第三層：趨勢全集
│   ├── days-view.tsx           第三層：每日回顧（打卡+脈絡合併）
│   └── correlations-view.tsx   第三層：相關性全列表
└── components/                 重用 primitives
    ├── index.ts
    ├── checkin-card.tsx        新增：打卡卡片（今日/每日回顧共用）
    ├── trend-bars.tsx          新增：迷你長條圖（hero/趨勢共用）
    ├── connected-services-grid.tsx  保留
    ├── correlation-card.tsx    保留
    ├── metric-pill.tsx         保留
    ├── period-selector.tsx     保留（移除 180 天）
    ├── section-header.tsx      保留
    ├── sparkline-card.tsx      保留
    ├── tag-cloud.tsx           保留
    └── tag-toggle-group.tsx    保留（改用 CONTEXT_TAGS）

刪除：tabs/（全部 5 個 + index）、life-warehouse.tsx、
     components/{day-detail-card,insight-banner,mood-bar-chart,mood-picker}.tsx

修改：components/user/user-profile-tabs.tsx（inline 儀表板 → 兩張摘要卡）
     components/user/island-header.tsx（加天氣層）
```

---

### Task 1: 目錄改名 life-warehouse → learning-life

**Files:**
- Rename: `apps/product/src/components/life-warehouse/` → `apps/product/src/components/learning-life/`
- Modify: `apps/product/src/components/user/user-profile-tabs.tsx:3`

**Interfaces:**
- Produces: 目錄 `@/components/learning-life`，後續所有 task 的檔案路徑基準。

- [ ] **Step 1: git mv 目錄**

```bash
cd /Users/xiaoxu/Projects/daodao/daodao-f2e
git mv apps/product/src/components/life-warehouse apps/product/src/components/learning-life
```

- [ ] **Step 2: 更新唯一外部 import**

`user-profile-tabs.tsx` 第 3 行：

```tsx
// 修改前
import { LifeWarehouse } from "@/components/life-warehouse";
// 修改後
import { LifeWarehouse } from "@/components/learning-life";
```

- [ ] **Step 3: 驗證**

Run: `pnpm run typecheck`
Expected: 16 tasks successful

- [ ] **Step 4: Commit**

```
refactor(learning-life): 目錄改名 life-warehouse → learning-life

## Why is this necessary?

- 依設計文件，模塊定位從泛用生活追蹤轉為以學習為中心的「學習生活」，命名先對齊概念

## How does it address?

- git mv 目錄並更新 user-profile-tabs 的 import 路徑，無行為變更
```

---

### Task 2: 打卡統計與天氣純函式（TDD）

**Files:**
- Modify: `apps/product/src/components/learning-life/types.ts`（增量新增，不刪舊型別）
- Create: `apps/product/src/components/learning-life/checkin-stats.ts`
- Create: `apps/product/src/components/learning-life/island-weather.ts`
- Test: `apps/product/src/components/learning-life/__tests__/checkin-stats.test.ts`
- Test: `apps/product/src/components/learning-life/__tests__/island-weather.test.ts`

**Interfaces:**
- Produces:
  - `type CheckinMood = "give_up" | "frustrated" | "bored" | "neutral" | "good" | "happy"`
  - `interface MockCheckin { id: string; practiceId: string; practiceTitle: string; checkinDate: string; mood: CheckinMood; note: string; tags: string[] }`
  - `getCheckinStreak(checkins: MockCheckin[], today: string): number`
  - `getDaysSinceLastCheckin(checkins: MockCheckin[], today: string): number`
  - `getDailyCheckinCounts(checkins, today, days): Array<{ date: string; count: number }>`
  - `getWeeklySummary(checkins, today): { thisWeekDays; lastWeekDays; last7; sentence }`
  - `getMoodDistribution(checkins, today, days): Array<{ mood; emoji; label; count }>`
  - `getIslandWeather(input: IslandWeatherInput): IslandWeatherState`（`kind/lively/emoji/label`）
  - `CHECKIN_MOOD_META`（constants.ts，本 task 一併新增）

- [ ] **Step 1: types.ts 增量加入打卡型別**（放檔案最下方，舊型別暫不動）

```ts
/** 打卡心情（鏡射後端 CheckInEntity.mood） */
export type CheckinMood = "give_up" | "frustrated" | "bored" | "neutral" | "good" | "happy";

/** 打卡記錄（結構鏡射 CheckInEntity，未來可換真 API） */
export interface MockCheckin {
  id: string;
  practiceId: string;
  practiceTitle: string;
  /** yyyy-MM-dd */
  checkinDate: string;
  mood: CheckinMood;
  note: string;
  tags: string[];
}
```

- [ ] **Step 2: constants.ts 增量加入 CHECKIN_MOOD_META**（放檔案最下方）

```ts
import type { CheckinMood } from "./types"; // 併入既有 type import

/** 心情是認識自己的訊號，不是表現分數——刻意不含 score，避免暗示「挫折＝壞」 */
export const CHECKIN_MOOD_META: Record<CheckinMood, { emoji: string; label: string }> = {
  give_up: { emoji: "😩", label: "想放棄" },
  frustrated: { emoji: "😖", label: "挫折" },
  bored: { emoji: "😑", label: "無聊" },
  neutral: { emoji: "😐", label: "普通" },
  good: { emoji: "🙂", label: "不錯" },
  happy: { emoji: "😄", label: "開心" },
};
```

- [ ] **Step 3: 寫 failing tests — checkin-stats.test.ts**

```ts
import { describe, expect, it } from "vitest";
import {
  getCheckinStreak,
  getDailyCheckinCounts,
  getDaysSinceLastCheckin,
  getWeeklySummary,
} from "../checkin-stats";
import type { MockCheckin } from "../types";

function checkin(date: string): MockCheckin {
  return {
    id: date,
    practiceId: "p1",
    practiceTitle: "測試實踐",
    checkinDate: date,
    mood: "good",
    note: "",
    tags: [],
  };
}

describe("getCheckinStreak", () => {
  it("今天有打卡時從今天連續往回數", () => {
    const checkins = [checkin("2026-07-07"), checkin("2026-07-06"), checkin("2026-07-04")];
    expect(getCheckinStreak(checkins, "2026-07-07")).toBe(2);
  });

  it("今天沒打卡時從昨天起算", () => {
    const checkins = [checkin("2026-07-06"), checkin("2026-07-05")];
    expect(getCheckinStreak(checkins, "2026-07-07")).toBe(2);
  });

  it("沒有任何打卡回傳 0", () => {
    expect(getCheckinStreak([], "2026-07-07")).toBe(0);
  });
});

describe("getDaysSinceLastCheckin", () => {
  it("今天打卡回傳 0", () => {
    expect(getDaysSinceLastCheckin([checkin("2026-07-07")], "2026-07-07")).toBe(0);
  });

  it("最後打卡在 3 天前回傳 3", () => {
    expect(getDaysSinceLastCheckin([checkin("2026-07-04")], "2026-07-07")).toBe(3);
  });

  it("沒有任何打卡回傳 Infinity", () => {
    expect(getDaysSinceLastCheckin([], "2026-07-07")).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("getDailyCheckinCounts", () => {
  it("依日期由舊到新回傳每天打卡數", () => {
    const checkins = [checkin("2026-07-07"), checkin("2026-07-07"), checkin("2026-07-06")];
    expect(getDailyCheckinCounts(checkins, "2026-07-07", 3)).toEqual([
      { date: "2026-07-05", count: 0 },
      { date: "2026-07-06", count: 1 },
      { date: "2026-07-07", count: 2 },
    ]);
  });
});

describe("getWeeklySummary", () => {
  it("計算近 7 天與前 7 天的打卡天數差", () => {
    const checkins = [
      checkin("2026-07-07"),
      checkin("2026-07-06"),
      checkin("2026-07-05"),
      checkin("2026-06-29"),
    ];
    const summary = getWeeklySummary(checkins, "2026-07-07");
    expect(summary.thisWeekDays).toBe(3);
    expect(summary.lastWeekDays).toBe(1);
    expect(summary.sentence).toContain("打卡了 3 天");
    expect(summary.sentence).toContain("多 2 天");
  });
});
```

- [ ] **Step 4: 寫 failing tests — island-weather.test.ts**

```ts
import { describe, expect, it } from "vitest";
import { getIslandWeather } from "../island-weather";

describe("getIslandWeather", () => {
  it("今天已打卡且連續 7 天以上 → 彩虹", () => {
    expect(
      getIslandWeather({ todayCheckedIn: true, streak: 7, daysSinceLastCheckin: 0 }).kind
    ).toBe("rainbow");
  });

  it("今天已打卡但未達 7 天 → 晴天", () => {
    expect(
      getIslandWeather({ todayCheckedIn: true, streak: 3, daysSinceLastCheckin: 0 }).kind
    ).toBe("sunny");
  });

  it("1-2 天沒打卡 → 多雲", () => {
    expect(
      getIslandWeather({ todayCheckedIn: false, streak: 0, daysSinceLastCheckin: 1 }).kind
    ).toBe("cloudy");
    expect(
      getIslandWeather({ todayCheckedIn: false, streak: 0, daysSinceLastCheckin: 2 }).kind
    ).toBe("cloudy");
  });

  it("3 天以上沒打卡 → 陰天", () => {
    expect(
      getIslandWeather({ todayCheckedIn: false, streak: 0, daysSinceLastCheckin: 3 }).kind
    ).toBe("overcast");
  });

  it("今日精力 >= 4 → lively", () => {
    const base = { todayCheckedIn: true, streak: 1, daysSinceLastCheckin: 0 };
    expect(getIslandWeather({ ...base, todayEnergy: 4 }).lively).toBe(true);
    expect(getIslandWeather({ ...base, todayEnergy: 3 }).lively).toBe(false);
    expect(getIslandWeather(base).lively).toBe(false);
  });
});
```

- [ ] **Step 5: 執行測試，確認失敗**

Run: `pnpm --filter @daodao/product exec vitest run src/components/learning-life/__tests__`
Expected: FAIL — `Cannot find module '../checkin-stats'`、`'../island-weather'`

- [ ] **Step 6: 實作 checkin-stats.ts**

```ts
import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import { CHECKIN_MOOD_META } from "./constants";
import type { CheckinMood, MockCheckin } from "./types";

/** 有打卡的日期集合（yyyy-MM-dd） */
export function getCheckinDates(checkins: MockCheckin[]): Set<string> {
  return new Set(checkins.map((c) => c.checkinDate));
}

/** 連續打卡天數：從 today 往回連續計；today 未打卡則從昨天起算 */
export function getCheckinStreak(checkins: MockCheckin[], today: string): number {
  const dates = getCheckinDates(checkins);
  let cursor = parseISO(today);
  if (!dates.has(format(cursor, "yyyy-MM-dd"))) cursor = subDays(cursor, 1);
  let streak = 0;
  while (dates.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

/** 距最近一次打卡的天數；0=今天已打卡；沒有任何打卡回傳 Infinity */
export function getDaysSinceLastCheckin(checkins: MockCheckin[], today: string): number {
  let latest: string | null = null;
  for (const c of checkins) {
    if (!latest || c.checkinDate > latest) latest = c.checkinDate;
  }
  if (!latest) return Number.POSITIVE_INFINITY;
  return Math.max(0, differenceInCalendarDays(parseISO(today), parseISO(latest)));
}

export interface DailyCheckinCount {
  date: string;
  count: number;
}

/** 近 days 天（含 today，由舊到新）每天的打卡數 */
export function getDailyCheckinCounts(
  checkins: MockCheckin[],
  today: string,
  days: number
): DailyCheckinCount[] {
  const counts = new Map<string, number>();
  for (const c of checkins) counts.set(c.checkinDate, (counts.get(c.checkinDate) ?? 0) + 1);
  const result: DailyCheckinCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(parseISO(today), i), "yyyy-MM-dd");
    result.push({ date, count: counts.get(date) ?? 0 });
  }
  return result;
}

export interface WeeklySummary {
  thisWeekDays: number;
  lastWeekDays: number;
  last7: DailyCheckinCount[];
  sentence: string;
}

/** 本週摘要：近 7 天 vs 前 7 天的打卡天數比較，產生一句話結論 */
export function getWeeklySummary(checkins: MockCheckin[], today: string): WeeklySummary {
  const last14 = getDailyCheckinCounts(checkins, today, 14);
  const lastWeek = last14.slice(0, 7);
  const thisWeek = last14.slice(7);
  const thisWeekDays = thisWeek.filter((d) => d.count > 0).length;
  const lastWeekDays = lastWeek.filter((d) => d.count > 0).length;
  const diff = thisWeekDays - lastWeekDays;
  // 下滑不做負向比較（「比上週少 X 天」），改給體諒句——中斷後回來的人最需要被接住
  let comparison = "跟上週一樣";
  if (diff > 0) comparison = `比上週多 ${diff} 天`;
  if (diff < 0) comparison = "節奏放慢了些，也沒關係";
  return {
    thisWeekDays,
    lastWeekDays,
    last7: thisWeek,
    sentence: `這 7 天你打卡了 ${thisWeekDays} 天，${comparison}`,
  };
}

export interface MoodDistributionItem {
  mood: CheckinMood;
  emoji: string;
  label: string;
  count: number;
}

/**
 * 近 days 天各心情的出現次數（依 CHECKIN_MOOD_META 順序）。
 * 刻意用分佈而非平均折線：心情是認識自己的訊號，不是越高越好的分數，
 * 挫折常是突破的前奏，不應被呈現為「低谷」。
 */
export function getMoodDistribution(
  checkins: MockCheckin[],
  today: string,
  days: number
): MoodDistributionItem[] {
  const start = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");
  const counts = new Map<CheckinMood, number>();
  for (const c of checkins) {
    if (c.checkinDate >= start && c.checkinDate <= today) {
      counts.set(c.mood, (counts.get(c.mood) ?? 0) + 1);
    }
  }
  return (Object.keys(CHECKIN_MOOD_META) as CheckinMood[]).map((mood) => ({
    mood,
    emoji: CHECKIN_MOOD_META[mood].emoji,
    label: CHECKIN_MOOD_META[mood].label,
    count: counts.get(mood) ?? 0,
  }));
}
```

- [ ] **Step 7: 實作 island-weather.ts**

```ts
export type IslandWeatherKind = "sunny" | "rainbow" | "cloudy" | "overcast";

export interface IslandWeatherInput {
  /** 今天是否已打卡 */
  todayCheckedIn: boolean;
  /** 連續打卡天數（含今天） */
  streak: number;
  /** 距最近一次打卡的天數（0 = 今天） */
  daysSinceLastCheckin: number;
  /** 今日精力 1-5，未記錄則 undefined */
  todayEnergy?: number;
}

export interface IslandWeatherState {
  kind: IslandWeatherKind;
  /** 島上小動物是否有活力（今日精力 >= 4） */
  lively: boolean;
  emoji: string;
  label: string;
}

// 文案原則：中斷不責備。多雲/陰天是「島在等你」的歡迎語，
// 不是「你沒打卡」的指責——中斷後回來的那一刻是最脆弱的時刻，要接住不要推開
const WEATHER_META: Record<IslandWeatherKind, { emoji: string; label: string }> = {
  rainbow: { emoji: "🌈", label: "連續打卡中，島上出現彩虹！" },
  sunny: { emoji: "☀️", label: "今天已打卡，島上晴朗" },
  cloudy: { emoji: "⛅", label: "島上飄來幾朵雲，今天的故事還沒開始" },
  overcast: { emoji: "🌫️", label: "島上有點霧，等你回來就會散" },
};

/** 天氣規則（spec §7）：打卡狀態 → 島景天氣。純函式，header 與摘要卡共用 */
export function getIslandWeather(input: IslandWeatherInput): IslandWeatherState {
  const { todayCheckedIn, streak, daysSinceLastCheckin, todayEnergy } = input;
  let kind: IslandWeatherKind;
  if (todayCheckedIn && streak >= 7) kind = "rainbow";
  else if (todayCheckedIn) kind = "sunny";
  else if (daysSinceLastCheckin >= 3) kind = "overcast";
  else kind = "cloudy";
  return { kind, lively: (todayEnergy ?? 0) >= 4, ...WEATHER_META[kind] };
}
```

- [ ] **Step 8: 執行測試，確認通過**

Run: `pnpm --filter @daodao/product exec vitest run src/components/learning-life/__tests__`
Expected: 2 test files passed（12 tests）

- [ ] **Step 9: lint + typecheck + Commit**

```
feat(learning-life): 新增打卡統計與島景天氣純函式

## Why is this necessary?

- 島景天氣、島頁摘要卡、洞察 Hero 都需要相同的打卡統計（streak、週摘要）與天氣判定，先以純函式沉澱可測邏輯

## How does it address?

- checkin-stats.ts：streak／距上次打卡天數／每日打卡數／週摘要／心情分佈，均為純函式
- island-weather.ts：spec §7 天氣規則（彩虹/晴/多雲/陰）＋ lively 判定；中斷文案用歡迎語不用指責框架
- 新增 MockCheckin 型別（鏡射 CheckInEntity）與 CHECKIN_MOOD_META
- vitest 覆蓋 12 個案例
```

---

### Task 3: 資料層重置＋舊五 tab 移除

**Files:**
- Rewrite: `learning-life/types.ts`、`learning-life/constants.ts`、`learning-life/mock-data.ts`、`learning-life/mock-store.ts`、`learning-life/utils.ts`
- Modify: `learning-life/components/index.ts`、`learning-life/components/tag-toggle-group.tsx`、`learning-life/components/period-selector.tsx`
- Delete: `learning-life/tabs/`（整個目錄）、`learning-life/life-warehouse.tsx`、`learning-life/index.ts`、`learning-life/components/day-detail-card.tsx`、`learning-life/components/insight-banner.tsx`、`learning-life/components/mood-bar-chart.tsx`、`learning-life/components/mood-picker.tsx`
- Modify: `apps/product/src/components/user/user-profile-tabs.tsx`（暫時移除 LifeWarehouse，Task 7 再接摘要卡）

**Interfaces:**
- Consumes: Task 2 的 `MockCheckin`、`CheckinMood`、`CHECKIN_MOOD_META`
- Produces:
  - `interface DailyRecord { date; energy; sleep; focus; exercise; stress; contextTags: string[]; note; source }`（瘦身版）
  - `interface Insight { id; emoji; conclusion; detail; drillDown: "trends"|"days"|"correlations" }`
  - `type TabId = "today" | "insights"`、`type InsightView = "cards" | "trends" | "days" | "correlations"`
  - `useLearningLifeStore(): LearningLifeState`（`{ records, checkins, selectedDate, activeTab, insightView, activePeriod }`）
  - `learningLifeActions`：`setEnergy/setSleep/setFocus/toggleContextTag/setNote/addMockCheckin/setSelectedDate/setActiveTab/setInsightView/setActivePeriod`
  - `generateMockCheckins(days)`、`generateMockRecords(days)`、`MOCK_INSIGHTS`、`LEARNING_CORRELATIONS`、`MOCK_PRACTICES`
  - constants：`TABS`（今天/洞察）、`CONTEXT_TAGS`、`CHECKIN_TAGS`、`CUSTOM_FIELD_EXAMPLES`、瘦身 `METRIC_CONFIGS`（energy/sleep/focus/exercise/stress）、`PERIOD_OPTIONS = [7, 30, 90]`

- [ ] **Step 1: 重寫 types.ts**（完整取代）

```ts
export type TabId = "today" | "insights";

export type InsightView = "cards" | "trends" | "days" | "correlations";

export type MetricSource = "manual" | "csv-import" | "integration" | "mock";

export type CorrelationStrength = "strong" | "moderate" | "weak";

/** 打卡心情（鏡射後端 CheckInEntity.mood） */
export type CheckinMood = "give_up" | "frustrated" | "bored" | "neutral" | "good" | "happy";

/** 打卡記錄（結構鏡射 CheckInEntity，未來可換真 API） */
export interface MockCheckin {
  id: string;
  practiceId: string;
  practiceTitle: string;
  /** yyyy-MM-dd */
  checkinDate: string;
  mood: CheckinMood;
  note: string;
  tags: string[];
}

/** 每日脈絡（配角）：幫助理解學習模式的生活維度；0 = 未記錄 */
export interface DailyRecord {
  date: string;
  /** 精力 1-5 */
  energy: number;
  /** 睡眠小時數 */
  sleep: number;
  /** 專注品質 1-5 */
  focus: number;
  /** 運動分鐘數 */
  exercise: number;
  /** 壓力 1-5 */
  stress: number;
  /** 環境標籤：在家、圖書館… */
  contextTags: string[];
  note: string;
  source: Record<string, MetricSource>;
}

/** 系統洞察卡（第二層）：一句學習語境的結論＋下鑽目標 */
export interface Insight {
  id: string;
  emoji: string;
  conclusion: string;
  detail: string;
  drillDown: Exclude<InsightView, "cards">;
}

export interface CorrelationMetric {
  key: string;
  emoji: string;
  label: string;
}

export interface Correlation {
  id: string;
  metricA: CorrelationMetric;
  metricB: CorrelationMetric;
  rValue: number;
  strength: CorrelationStrength;
  direction: "positive" | "negative";
  description: string;
  scatterData?: Array<{ x: number; y: number }>;
}

export interface ConnectedService {
  id: string;
  name: string;
  emoji: string;
  connected: boolean;
}

export type MetricKey = "energy" | "sleep" | "focus" | "exercise" | "stress";

export interface MetricConfig {
  key: MetricKey;
  emoji: string;
  label: string;
  unit: string;
  color: string;
  bgColor: string;
}

export interface TabConfig {
  value: TabId;
  label: string;
}
```

- [ ] **Step 2: 重寫 constants.ts**（完整取代）

```ts
import type {
  CheckinMood,
  ConnectedService,
  CorrelationStrength,
  MetricConfig,
  TabConfig,
} from "./types";

export const TABS: TabConfig[] = [
  { value: "today", label: "今天" },
  { value: "insights", label: "洞察" },
];

/** 心情是認識自己的訊號，不是表現分數——刻意不含 score，避免暗示「挫折＝壞」 */
export const CHECKIN_MOOD_META: Record<CheckinMood, { emoji: string; label: string }> = {
  give_up: { emoji: "😩", label: "想放棄" },
  frustrated: { emoji: "😖", label: "挫折" },
  bored: { emoji: "😑", label: "無聊" },
  neutral: { emoji: "😐", label: "普通" },
  good: { emoji: "🙂", label: "不錯" },
  happy: { emoji: "😄", label: "開心" },
};

export const METRIC_CONFIGS: MetricConfig[] = [
  { key: "energy", emoji: "🔋", label: "精力", unit: "/5", color: "#FBBF24", bgColor: "rgba(251,191,36,0.05)" },
  { key: "sleep", emoji: "😴", label: "睡眠", unit: "h", color: "#6366F1", bgColor: "rgba(99,102,241,0.05)" },
  { key: "focus", emoji: "🎯", label: "專注品質", unit: "/5", color: "#0EA5E9", bgColor: "rgba(14,165,233,0.05)" },
  { key: "exercise", emoji: "💪", label: "運動", unit: "min", color: "#14B8A6", bgColor: "rgba(20,184,166,0.05)" },
  { key: "stress", emoji: "😤", label: "壓力", unit: "/5", color: "#EF4444", bgColor: "rgba(239,68,68,0.05)" },
];

/** 環境標籤（每日脈絡） */
export const CONTEXT_TAGS = ["在家", "圖書館", "咖啡廳", "辦公室", "通勤", "早起", "晚睡", "社交"] as const;

/** 打卡標籤 pool（mock 打卡用，對齊真實打卡的 tags 欄位語意） */
export const CHECKIN_TAGS = ["專注", "有收穫", "卡關", "突破", "複習", "實作", "討論", "看影片"] as const;

/** 自訂追蹤欄位示意（原泛用指標移到這裡作概念展示，不實作儲存） */
export const CUSTOM_FIELD_EXAMPLES = [
  { emoji: "☕", label: "咖啡杯數" },
  { emoji: "👟", label: "步數" },
  { emoji: "💰", label: "花費" },
  { emoji: "💧", label: "喝水" },
  { emoji: "📖", label: "閱讀頁數" },
  { emoji: "🧘", label: "冥想時間" },
] as const;

export const CONNECTED_SERVICES: ConnectedService[] = [
  { id: "apple-health", name: "Apple Health", emoji: "🍎", connected: false },
  { id: "strava", name: "Strava", emoji: "🏃", connected: false },
  { id: "google-cal", name: "Google Cal", emoji: "📅", connected: false },
  { id: "github", name: "GitHub", emoji: "💻", connected: false },
  { id: "notion", name: "Notion", emoji: "📝", connected: false },
  { id: "bank-csv", name: "Bank CSV", emoji: "🏦", connected: false },
];

export const STRENGTH_LABELS: Record<CorrelationStrength, string> = {
  strong: "強相關",
  moderate: "中等相關",
  weak: "弱相關",
};

export const STRENGTH_COLORS: Record<CorrelationStrength, { text: string; bg: string }> = {
  strong: { text: "#16A34A", bg: "rgba(22,163,106,0.1)" },
  moderate: { text: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  weak: { text: "#8A9BA0", bg: "rgba(148,163,184,0.1)" },
};

export const PERIOD_OPTIONS = [7, 30, 90] as const;
export type PeriodOption = (typeof PERIOD_OPTIONS)[number];
```

- [ ] **Step 3: 重寫 mock-data.ts**（完整取代）

```ts
import { format, subDays } from "date-fns";
import { CHECKIN_TAGS, CONTEXT_TAGS } from "./constants";
import type { CheckinMood, Correlation, DailyRecord, Insight, MockCheckin } from "./types";

function seedRandom(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededValue(seed: number, min: number, max: number): number {
  const normalized = ((seed * 9301 + 49297) % 233280) / 233280;
  return min + normalized * (max - min);
}

export const MOCK_PRACTICES = [
  { id: "jlpt-n3", title: "日檢 N3 備考衝刺" },
  { id: "neuro-book", title: "《神經可塑性》共讀" },
  { id: "half-marathon", title: "半馬完賽訓練" },
] as const;

const CHECKIN_NOTES = [
  "聽力練了 3 回，語速終於跟上一點了",
  "讀完第 4 章，神經元用進廢退真的有感",
  "今天只有 20 分鐘，做了一回單字題。少但沒斷",
  "跑了 8K，配速 6:10，比上週穩",
  "文法藍寶書第 12 章，「〜わけではない」搞懂了",
  "在圖書館待了一下午，效率超高",
  "有點累，但還是完成了今天的進度",
  "跟讀書會討論完，觀點被打開",
];

const MOOD_POOL: CheckinMood[] = [
  "happy", "good", "good", "neutral", "happy", "frustrated", "good", "neutral", "bored", "happy",
];

/**
 * 產生過去 days 天的 mock 打卡。
 * 今天刻意不產生（保留給使用者體驗打卡動線）；昨天起往回 6 天必有打卡，
 * 讓使用者今天打卡後 streak 達 7 → 島景出現彩虹。
 */
export function generateMockCheckins(days = 90): MockCheckin[] {
  const checkins: MockCheckin[] = [];
  const today = new Date();
  for (let i = 1; i < days; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    const seed = seedRandom(dateStr);
    const hasCheckin = i <= 6 || seededValue(seed, 0, 1) < 0.72;
    if (!hasCheckin) continue;
    const count = seededValue(seed + 1, 0, 1) < 0.25 ? 2 : 1;
    for (let j = 0; j < count; j++) {
      const practiceIdx = Math.floor(seededValue(seed + j * 3, 0, MOCK_PRACTICES.length)) % MOCK_PRACTICES.length;
      const practice = MOCK_PRACTICES[practiceIdx] ?? MOCK_PRACTICES[0];
      const mood = MOOD_POOL[Math.floor(seededValue(seed + j * 7 + 2, 0, MOOD_POOL.length)) % MOOD_POOL.length] ?? "good";
      const note = CHECKIN_NOTES[Math.floor(seededValue(seed + j * 11 + 5, 0, CHECKIN_NOTES.length)) % CHECKIN_NOTES.length] ?? "";
      const tagCount = Math.round(seededValue(seed + j * 13 + 8, 1, 3));
      const shuffled = [...CHECKIN_TAGS].sort((a, b) => seedRandom(a + dateStr) - seedRandom(b + dateStr));
      checkins.push({
        id: `mock-${dateStr}-${j}`,
        practiceId: practice.id,
        practiceTitle: practice.title,
        checkinDate: dateStr,
        mood,
        note,
        tags: shuffled.slice(0, tagCount),
      });
    }
  }
  return checkins;
}

function generateDailyRecord(dateStr: string): DailyRecord {
  const seed = seedRandom(dateStr);
  const sleep = Number(seededValue(seed + 2, 5, 8.5).toFixed(1));
  let sleepBoost = 0;
  if (sleep >= 7) sleepBoost = 1;
  if (sleep < 6) sleepBoost = -1;
  const energy = Math.max(1, Math.min(5, Math.round(3 + sleepBoost + seededValue(seed + 5, -1, 1))));
  const tagCount = Math.round(seededValue(seed + 12, 1, 3));
  const shuffled = [...CONTEXT_TAGS].sort((a, b) => seedRandom(a + dateStr) - seedRandom(b + dateStr));
  const contextTags = shuffled.slice(0, tagCount);
  const focusBoost = contextTags.includes("圖書館") || contextTags.includes("早起") ? 1 : 0;
  const focus = Math.max(1, Math.min(5, Math.round(3 + focusBoost + seededValue(seed + 7, -1, 1))));
  const exercise = Math.round(seededValue(seed + 1, 0, 90));
  const stress = Math.max(1, Math.min(5, Math.round(seededValue(seed + 9, 1, 5))));
  return {
    date: dateStr,
    energy,
    sleep,
    focus,
    exercise,
    stress,
    contextTags,
    note: "",
    source: { energy: "mock", sleep: "mock", focus: "mock", exercise: "mock", stress: "mock" },
  };
}

/** 過去 days 天（不含今天）的每日脈絡；今天由使用者在「今天」tab 記錄 */
export function generateMockRecords(days = 90): Record<string, DailyRecord> {
  const records: Record<string, DailyRecord> = {};
  const today = new Date();
  for (let i = 1; i < days; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    records[dateStr] = generateDailyRecord(dateStr);
  }
  return records;
}

/** 精選洞察卡（第二層）— POC 寫死，文案全為學習語境 */
export const MOCK_INSIGHTS: Insight[] = [
  {
    id: "library-focus",
    emoji: "📚",
    conclusion: "在 #圖書館 的日子，你的專注品質平均高 40%",
    detail: "過去 30 天有 8 天在圖書館，專注品質平均 4.2/5；其他日子平均 3.0/5。",
    drillDown: "correlations",
  },
  {
    id: "sleep-checkin",
    emoji: "😴",
    conclusion: "睡滿 7 小時的隔天，你的打卡率高 1.8 倍",
    detail: "睡眠充足的隔日打卡率 86%，不足時只有 48%。休息也是學習的一部分。",
    drillDown: "trends",
  },
  {
    id: "morning-mood",
    emoji: "🌅",
    conclusion: "#早起 的日子，打卡心情明顯更好",
    detail: "早起日的打卡心情多為「開心」「不錯」，出現頻率比其他日子明顯更高。",
    drillDown: "days",
  },
];

function generateScatterData(
  seed: number,
  count: number,
  correlation: number
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const x = seededValue(seed + i * 7, 20, 160);
    const noise = seededValue(seed + i * 13 + 99, -30, 30) * (1 - Math.abs(correlation));
    const y =
      correlation > 0
        ? 70 - (x - 20) * 0.35 * correlation + noise
        : 20 + (x - 20) * 0.35 * Math.abs(correlation) + noise;
    points.push({ x: Math.round(x), y: Math.max(10, Math.min(70, Math.round(y))) });
  }
  return points;
}

/** 學習語境的相關性（第三層下鑽） */
export const LEARNING_CORRELATIONS: Correlation[] = [
  {
    id: "library-focus",
    metricA: { key: "tag:圖書館", emoji: "📚", label: "#圖書館" },
    metricB: { key: "focus", emoji: "🎯", label: "專注品質" },
    rValue: 0.44,
    strength: "strong",
    direction: "positive",
    description: "📚 #圖書館 的日子，🎯 專注品質傾向較高",
    scatterData: generateScatterData(42, 24, 0.44),
  },
  {
    id: "exercise-mood",
    metricA: { key: "exercise", emoji: "💪", label: "運動" },
    metricB: { key: "checkinMood", emoji: "😄", label: "打卡心情" },
    rValue: 0.52,
    strength: "strong",
    direction: "positive",
    description: "💪 有運動的日子，😄 打卡心情傾向較好",
    scatterData: generateScatterData(77, 24, 0.52),
  },
  {
    id: "energy-focus",
    metricA: { key: "energy", emoji: "🔋", label: "精力" },
    metricB: { key: "focus", emoji: "🎯", label: "專注品質" },
    rValue: 0.41,
    strength: "strong",
    direction: "positive",
    description: "🔋 精力較高時，🎯 專注品質傾向較高",
  },
  {
    id: "sleep-checkin",
    metricA: { key: "sleep", emoji: "😴", label: "睡眠" },
    metricB: { key: "checkinRate", emoji: "✅", label: "打卡率" },
    rValue: 0.38,
    strength: "moderate",
    direction: "positive",
    description: "😴 睡眠較充足的隔天，✅ 打卡率傾向較高",
  },
  {
    id: "earlyrise-focus",
    metricA: { key: "tag:早起", emoji: "🌅", label: "#早起" },
    metricB: { key: "focus", emoji: "🎯", label: "專注品質" },
    rValue: 0.29,
    strength: "moderate",
    direction: "positive",
    description: "🌅 #早起 的日子，🎯 專注品質傾向較高",
  },
  {
    id: "stress-focus",
    metricA: { key: "stress", emoji: "😤", label: "壓力" },
    metricB: { key: "focus", emoji: "🎯", label: "專注品質" },
    rValue: -0.31,
    strength: "moderate",
    direction: "negative",
    description: "😤 壓力較高時，🎯 專注品質傾向較低",
  },
];
```

- [ ] **Step 4: 重寫 mock-store.ts**（完整取代）

```ts
"use client";

import { posthogCapture } from "@daodao/analytics";
import { getStorage, StorageEnum } from "@daodao/shared";
import { format } from "date-fns";
import { useSyncExternalStore } from "react";
import { getCheckinStreak } from "./checkin-stats";
import type { PeriodOption } from "./constants";
import { generateMockCheckins, generateMockRecords, MOCK_PRACTICES } from "./mock-data";
import type { DailyRecord, InsightView, MockCheckin, TabId } from "./types";

/**
 * 學習生活 POC 的跨頁 mock 狀態（module-level store）。
 * 打卡歷史（checkins）鏡射 CheckInEntity 結構，未來由 GET /me/checkins 取代；
 * 每日脈絡（records）為新資料模型，未來由 daily-records API 取代。
 */
export interface LearningLifeState {
  records: Record<string, DailyRecord>;
  checkins: MockCheckin[];
  selectedDate: string;
  activeTab: TabId;
  insightView: InsightView;
  activePeriod: PeriodOption;
}

function initState(): LearningLifeState {
  return {
    records: generateMockRecords(90),
    checkins: generateMockCheckins(90),
    selectedDate: format(new Date(), "yyyy-MM-dd"),
    activeTab: "today",
    insightView: "cards",
    activePeriod: 30,
  };
}

const storage = getStorage<LearningLifeState>(StorageEnum.PocLifeWarehouse);

let state: LearningLifeState = initState();
const listeners = new Set<() => void>();
let hydrated = false;

function emit() {
  storage.set(state);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 首次訂閱（hydration 後）才還原 sessionStorage，避免 SSR 與初次 render 不一致
  if (!hydrated) {
    hydrated = true;
    const persisted = storage.get();
    if (persisted?.checkins) {
      state = persisted;
      queueMicrotask(() => {
        for (const l of listeners) l();
      });
    }
  }
  return () => listeners.delete(listener);
}

function getSnapshot(): LearningLifeState {
  return state;
}

/** 訂閱學習生活狀態（島頁摘要卡、天氣層、完整頁共用同一份） */
export function useLearningLifeStore(): LearningLifeState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function emptyRecord(date: string): DailyRecord {
  return { date, energy: 0, sleep: 0, focus: 0, exercise: 0, stress: 0, contextTags: [], note: "", source: {} };
}

function updateRecord(date: string, patch: Partial<DailyRecord>) {
  const current = state.records[date] ?? emptyRecord(date);
  state = {
    ...state,
    records: { ...state.records, [date]: { ...current, ...patch } },
  };
  emit();
}

export const learningLifeActions = {
  setEnergy(date: string, energy: number) {
    updateRecord(date, { energy, source: { ...state.records[date]?.source, energy: "manual" } });
    posthogCapture("learning_life_quick_track_used", { field: "energy" });
  },

  setSleep(date: string, sleep: number) {
    updateRecord(date, { sleep, source: { ...state.records[date]?.source, sleep: "manual" } });
    posthogCapture("learning_life_quick_track_used", { field: "sleep" });
  },

  setFocus(date: string, focus: number) {
    updateRecord(date, { focus, source: { ...state.records[date]?.source, focus: "manual" } });
    posthogCapture("learning_life_quick_track_used", { field: "focus" });
  },

  toggleContextTag(date: string, tag: string) {
    const current = state.records[date] ?? emptyRecord(date);
    const contextTags = current.contextTags.includes(tag)
      ? current.contextTags.filter((t) => t !== tag)
      : [...current.contextTags, tag];
    updateRecord(date, { contextTags });
    posthogCapture("learning_life_quick_track_used", { field: "context_tag" });
  },

  setNote(date: string, note: string) {
    updateRecord(date, { note });
  },

  /** POC 示意打卡：新增一筆今天的 mock 打卡（正式版走實踐打卡流程） */
  addMockCheckin(today: string) {
    const practice = MOCK_PRACTICES[0];
    const checkin: MockCheckin = {
      id: `local-${state.checkins.length + 1}`,
      practiceId: practice.id,
      practiceTitle: practice.title,
      checkinDate: today,
      mood: "happy",
      note: "完成今日進度！（示意打卡）",
      tags: ["有收穫"],
    };
    state = { ...state, checkins: [checkin, ...state.checkins] };
    emit();
    posthogCapture("learning_life_mock_checkin_added", {
      streak_after: getCheckinStreak(state.checkins, today),
    });
  },

  setSelectedDate(date: string) {
    state = { ...state, selectedDate: date };
    emit();
  },

  setActiveTab(tab: TabId) {
    state = { ...state, activeTab: tab };
    emit();
    posthogCapture("learning_life_tab_switched", { tab });
  },

  setInsightView(view: InsightView) {
    state = { ...state, insightView: view };
    emit();
    if (view !== "cards") posthogCapture("learning_life_insight_drilldown", { view });
  },

  setActivePeriod(period: PeriodOption) {
    state = { ...state, activePeriod: period };
    emit();
  },
};
```

- [ ] **Step 5: 重寫 utils.ts**（完整取代；移除 mood 1-9 相關與泛用單位）

```ts
import { format, getDay, parseISO, subDays } from "date-fns";
import { METRIC_CONFIGS } from "./constants";
import type { DailyRecord, MetricKey } from "./types";

export function getRecordsForPeriod(
  records: Record<string, DailyRecord>,
  days: number,
  referenceDate: string
): DailyRecord[] {
  const ref = parseISO(referenceDate);
  const result: DailyRecord[] = [];
  for (let i = 0; i < days; i++) {
    const key = format(subDays(ref, i), "yyyy-MM-dd");
    const record = records[key];
    if (record) result.push(record);
  }
  return result;
}

/** 平均值（略過 0 = 未記錄） */
export function calculateAverage(records: DailyRecord[], key: MetricKey): number {
  const values = records.map((r) => r[key]).filter((v) => v > 0);
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function calculateTagFrequency(
  records: DailyRecord[]
): Array<{ tag: string; count: number; percentage: number }> {
  const counts: Record<string, number> = {};
  for (const record of records) {
    for (const tag of record.contextTags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  const total = records.length || 1;
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

export function getSparklineData(
  records: DailyRecord[],
  key: MetricKey
): Array<{ date: string; value: number }> {
  return [...records]
    .filter((r) => r[key] > 0)
    .reverse()
    .map((r) => ({ date: r.date, value: r[key] }));
}

export function formatMetricValue(value: number, key: MetricKey): string {
  const config = METRIC_CONFIGS.find((m) => m.key === key);
  if (config?.unit === "h") return value.toFixed(1);
  return String(Math.round(value));
}

export function getDayOfWeek(dateStr: string): string {
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  return dayNames[getDay(parseISO(dateStr))] ?? "";
}

export function getDateLabel(dateStr: string): string {
  return format(parseISO(dateStr), "M/d");
}

export function getTrendDirection(records: DailyRecord[], key: MetricKey): "up" | "down" | "flat" {
  const values = records.filter((r) => r[key] > 0).map((r) => r[key]);
  if (values.length < 4) return "flat";

  const half = Math.floor(values.length / 2);
  const recentAvg = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const olderAvg = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);

  const diff = recentAvg - olderAvg;
  const threshold = olderAvg * 0.05;
  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "flat";
}
```

- [ ] **Step 6: 刪除舊 UI 檔案**

```bash
cd /Users/xiaoxu/Projects/daodao/daodao-f2e/apps/product/src/components/learning-life
git rm -r tabs
git rm life-warehouse.tsx index.ts
git rm components/day-detail-card.tsx components/insight-banner.tsx components/mood-bar-chart.tsx components/mood-picker.tsx
```

- [ ] **Step 7: 更新 components/index.ts**（完整取代）

```ts
export { ConnectedServicesGrid } from "./connected-services-grid";
export { CorrelationCard } from "./correlation-card";
export { MetricPill } from "./metric-pill";
export { PeriodSelector } from "./period-selector";
export { SectionHeader } from "./section-header";
export { SparklineCard } from "./sparkline-card";
export { TagCloud } from "./tag-cloud";
export { TagToggleGroup } from "./tag-toggle-group";
```

- [ ] **Step 8: 更新 tag-toggle-group.tsx 的 import 與來源**

```tsx
// 修改前
import { PRESET_TAGS } from "../constants";
// 修改後
import { CONTEXT_TAGS } from "../constants";
```

並將 JSX 中 `PRESET_TAGS.map` 改為 `CONTEXT_TAGS.map`。

- [ ] **Step 9: 更新 period-selector.tsx 的標籤表**（移除 180）

```tsx
const PERIOD_LABELS: Record<PeriodOption, string> = {
  7: "7天",
  30: "30天",
  90: "90天",
};
```

- [ ] **Step 10: user-profile-tabs.tsx 暫時移除 LifeWarehouse**（完整取代；Task 7 再接摘要卡）

```tsx
"use client";

import { PracticeSection } from "@/components/practice";

interface UserProfileTabsProps {
  targetUserId: string;
  isOwnProfile: boolean;
}

export function UserProfileTabs({ targetUserId }: UserProfileTabsProps) {
  return (
    <div className="mt-4">
      <PracticeSection userId={targetUserId} />
    </div>
  );
}
```

- [ ] **Step 11: 驗證**

Run: `pnpm --filter @daodao/product exec vitest run src/components/learning-life/__tests__ && pnpm run lint && pnpm run typecheck`
Expected: 測試 12 passed、lint / typecheck 全綠

- [ ] **Step 12: Commit**

```
refactor(learning-life): 資料層轉向學習中心並移除五平行 tab

## Why is this necessary?

- PR #861 的資料模型是泛用生活指標（步數、咖啡、花費等），與「以學習為中心」的設計不符
- 五平行 tab 是攤開式資訊架構的根源，需拆除後改建三層揭露

## How does it address?

- DailyRecord 瘦身為學習脈絡維度（精力/睡眠/專注/運動/壓力/環境標籤），mood 歸打卡
- 新增 mock 打卡資料（鏡射 CheckInEntity）與學習語境的洞察卡、相關性
- store 重寫為 {records, checkins, activeTab(今天/洞察), insightView}
- learningLifeActions 埋 PostHog 事件（tab 切換/下鑽/快速記錄/示意打卡），供 POC 假設驗證
- 刪除五 tab 與 mood-picker 等舊元件，島頁暫時只剩 PracticeSection
```

---

### Task 4: 路由頁＋頁殼＋「今天」tab

**Files:**
- Create: `apps/product/src/app/[locale]/me/learning-life/page.tsx`
- Create: `learning-life/learning-life-page.tsx`
- Create: `learning-life/index.ts`
- Create: `learning-life/today/today-tab.tsx`、`learning-life/today/quick-track.tsx`、`learning-life/today/today-checkins.tsx`
- Create: `learning-life/components/checkin-card.tsx`
- Modify: `learning-life/components/index.ts`（加 CheckinCard export）

**Interfaces:**
- Consumes: Task 2 `getCheckinStreak`；Task 3 store/actions、`CHECKIN_MOOD_META`、`CUSTOM_FIELD_EXAMPLES`
- Produces:
  - `LearningLifePage`（index.ts 匯出，路由頁使用）
  - `CheckinCard({ checkin: MockCheckin })`（Task 6 的 days-view 重用）
  - `InsightsTab` 尚未存在 → 本 task 的頁殼先以 `null` 佔位？**不**：頁殼直接寫死洞察分支為「Task 5 實作」的暫時空狀態元件，見 Step 3。

- [ ] **Step 1: 建立 components/checkin-card.tsx**

```tsx
import { Card } from "@daodao/ui/components/card";
import { CheckCircle2 } from "lucide-react";
import { CHECKIN_MOOD_META } from "../constants";
import type { MockCheckin } from "../types";

/** 打卡卡片：學習事件的視覺主角（今日/每日回顧共用） */
export function CheckinCard({ checkin }: { checkin: MockCheckin }) {
  const mood = CHECKIN_MOOD_META[checkin.mood];
  return (
    <Card className="border-[#E0E4E8] border-l-4 border-l-logo-cyan p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#2D3436]">
          <CheckCircle2 className="size-4 text-logo-cyan" />
          {checkin.practiceTitle}
        </span>
        <span className="text-lg" title={mood.label}>
          {mood.emoji}
        </span>
      </div>
      {checkin.note && <p className="text-sm leading-relaxed text-[#636E72]">{checkin.note}</p>}
      {checkin.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {checkin.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[rgba(22,185,179,0.08)] px-2 py-0.5 text-xs text-[#0E8E89]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
```

components/index.ts 加入：

```ts
export { CheckinCard } from "./checkin-card";
```

- [ ] **Step 2: 建立 today/today-checkins.tsx**

```tsx
"use client";

import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Card } from "@daodao/ui/components/card";
import { Flame } from "lucide-react";
import { CheckinCard, SectionHeader } from "../components";
import { learningLifeActions } from "../mock-store";
import type { MockCheckin } from "../types";

interface TodayCheckinsProps {
  today: string;
  checkins: MockCheckin[];
  streak: number;
}

/** 今天的打卡（視覺主角）；未打卡時顯示 CTA */
export function TodayCheckins({ today, checkins, streak }: TodayCheckinsProps) {
  return (
    <section>
      <SectionHeader
        title="今天的學習"
        action={
          streak > 0 ? (
            <span className="flex items-center gap-1 text-xs text-[#FFA10B]">
              <Flame className="size-3.5" />
              連續 {streak} 天
            </span>
          ) : undefined
        }
      />
      <div className="mt-3 flex flex-col gap-3">
        {checkins.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed border-[#E0E4E8] p-6 text-center">
            <span className="text-3xl">🌱</span>
            <p className="text-sm text-[#636E72]">今天還沒打卡，島上在等你</p>
            <Link href="/mine">
              <Button className="rounded-full">去實踐打卡</Button>
            </Link>
            <button
              type="button"
              onClick={() => learningLifeActions.addMockCheckin(today)}
              className="text-xs text-[#8A9BA0] underline"
            >
              或先用示意打卡體驗看看
            </button>
          </Card>
        ) : (
          checkins.map((checkin) => <CheckinCard key={checkin.id} checkin={checkin} />)
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: 建立 today/quick-track.tsx**

```tsx
"use client";

import { Card } from "@daodao/ui/components/card";
import { cn } from "@daodao/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import { SectionHeader, TagToggleGroup } from "../components";
import { learningLifeActions } from "../mock-store";
import type { DailyRecord } from "../types";

const ENERGY_LEVELS = [
  { value: 1, emoji: "🪫", label: "沒電" },
  { value: 2, emoji: "😮‍💨", label: "偏低" },
  { value: 3, emoji: "🙂", label: "普通" },
  { value: 4, emoji: "💪", label: "不錯" },
  { value: 5, emoji: "⚡", label: "滿電" },
] as const;

interface QuickTrackProps {
  today: string;
  record?: DailyRecord;
}

/** 快速記錄：一鍵式、30 秒完成（spec 原則四：獨立於打卡的低阻力記錄流） */
export function QuickTrack({ today, record }: QuickTrackProps) {
  const energy = record?.energy ?? 0;
  const sleep = record?.sleep ?? 0;

  return (
    <section>
      <SectionHeader
        title="今天的狀態"
        action={<span className="text-xs text-[#8A9BA0]">示意資料</span>}
      />
      <Card className="mt-3 flex flex-col gap-5 border-[#E0E4E8] p-4">
        <div>
          <p className="mb-2 text-sm text-[#636E72]">精力如何？</p>
          <div className="flex gap-2">
            {ENERGY_LEVELS.map((level) => (
              <button
                type="button"
                key={level.value}
                onClick={() => learningLifeActions.setEnergy(today, level.value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors",
                  energy === level.value
                    ? "border-[#16B9B3] bg-[rgba(22,185,179,0.1)]"
                    : "border-[#E0E4E8] bg-white hover:border-[#16B9B3]"
                )}
              >
                <span className="text-lg">{level.emoji}</span>
                <span className="text-[10px] text-[#636E72]">{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-[#636E72]">昨晚睡了多久？</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="減少睡眠時數"
              onClick={() => learningLifeActions.setSleep(today, Math.max(0, sleep - 0.5))}
              className="flex size-8 items-center justify-center rounded-full border border-[#E0E4E8] text-[#636E72] hover:border-[#16B9B3]"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-16 text-center text-lg font-semibold text-[#2D3436]">
              {sleep > 0 ? `${sleep.toFixed(1)}h` : "未記錄"}
            </span>
            <button
              type="button"
              aria-label="增加睡眠時數"
              onClick={() => learningLifeActions.setSleep(today, Math.min(14, sleep + 0.5))}
              className="flex size-8 items-center justify-center rounded-full border border-[#E0E4E8] text-[#636E72] hover:border-[#16B9B3]"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-[#636E72]">今天在哪裡、什麼狀態？</p>
          <TagToggleGroup
            selected={record?.contextTags ?? []}
            onToggle={(tag) => learningLifeActions.toggleContextTag(today, tag)}
          />
        </div>
      </Card>
    </section>
  );
}
```

- [ ] **Step 4: 建立 today/today-tab.tsx**

```tsx
"use client";

import { Card } from "@daodao/ui/components/card";
import { getCheckinStreak } from "../checkin-stats";
import { ConnectedServicesGrid, SectionHeader } from "../components";
import { CUSTOM_FIELD_EXAMPLES } from "../constants";
import type { DailyRecord, MockCheckin } from "../types";
import { QuickTrack } from "./quick-track";
import { TodayCheckins } from "./today-checkins";

interface TodayTabProps {
  today: string;
  todayRecord?: DailyRecord;
  checkins: MockCheckin[];
}

export function TodayTab({ today, todayRecord, checkins }: TodayTabProps) {
  const todayCheckins = checkins.filter((c) => c.checkinDate === today);
  const streak = getCheckinStreak(checkins, today);

  return (
    <div className="flex flex-col gap-6">
      <TodayCheckins today={today} checkins={todayCheckins} streak={streak} />
      <QuickTrack today={today} record={todayRecord} />

      <section>
        <SectionHeader
          title="自訂追蹤"
          action={<span className="text-xs text-[#8A9BA0]">規劃中</span>}
        />
        <div className="mt-3 grid grid-cols-3 gap-2 opacity-60">
          {CUSTOM_FIELD_EXAMPLES.map((field) => (
            <Card key={field.label} className="flex flex-col items-center gap-1 border-[#E0E4E8] p-3">
              <span className="text-xl">{field.emoji}</span>
              <span className="text-xs text-[#636E72]">{field.label}</span>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="連結外部服務"
          action={<span className="text-xs text-[#8A9BA0]">規劃中</span>}
        />
        <div className="mt-3">
          <ConnectedServicesGrid />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: 建立 learning-life-page.tsx**（洞察分支先放暫時空狀態，Task 5 替換）

```tsx
"use client";

import { cn } from "@daodao/ui/lib/utils";
import { format } from "date-fns";
import { TABS } from "./constants";
import { learningLifeActions, useLearningLifeStore } from "./mock-store";
import { TodayTab } from "./today/today-tab";

export function LearningLifePage() {
  const { activeTab, records, checkins } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.value}
            onClick={() => learningLifeActions.setActiveTab(tab.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-logo-cyan text-white"
                : "bg-[#F5F7FA] text-[#636E72] hover:bg-[#E0E4E8]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "today" ? (
        <TodayTab today={today} todayRecord={records[today]} checkins={checkins} />
      ) : (
        <p className="py-12 text-center text-sm text-[#8A9BA0]">洞察功能即將登場</p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: 建立 index.ts 與路由頁**

`learning-life/index.ts`：

```ts
export { LearningLifePage } from "./learning-life-page";
```

`apps/product/src/app/[locale]/me/learning-life/page.tsx`（比照 `me/challenges/page.tsx` 模式）：

```tsx
"use client";

import { LearningLifePage } from "@/components/learning-life";
import { PageHeader } from "@/components/layout";

export default function LearningLifeRoute() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-[#F2F7F6]">
      <PageHeader leftAction="back" leftLabel="" title="學習生活" />
      <main className="max-w-[640px] mx-auto pb-10">
        <LearningLifePage />
      </main>
    </div>
  );
}
```

- [ ] **Step 7: 驗證**

Run: `pnpm run lint && pnpm run typecheck`
Expected: 全綠。

手動：`pnpm --filter @daodao/product dev` 開 `http://localhost:3001/me/learning-life` →
「今天」tab 顯示 CTA（今天無打卡）＋連續 6 天 flame；點「示意打卡」後出現打卡卡片、flame 變 7 天；快速記錄可點選精力/睡眠/標籤且重整（同 session）保留。

- [ ] **Step 8: Commit**

```
feat(learning-life): 新增 /me/learning-life 路由與「今天」tab

## Why is this necessary?

- 完整頁需要獨立路由承載（島頁只放摘要卡），「今天」是記錄與今日故事的主入口

## How does it address?

- 新路由頁 + 頁殼（今天/洞察 pill 切換）
- 今日打卡列表（CheckinCard 主角視覺）＋未打卡 CTA（導實踐 + 示意打卡）
- QuickTrack 一鍵記錄：精力 1-5、睡眠 stepper、環境標籤
- 自訂追蹤與外部服務以「規劃中」示意呈現
```

---

### Task 5: 「洞察」tab — Hero＋精選洞察卡

**Files:**
- Create: `learning-life/components/trend-bars.tsx`
- Create: `learning-life/insights/weekly-hero.tsx`、`learning-life/insights/insight-card.tsx`、`learning-life/insights/insights-tab.tsx`
- Modify: `learning-life/components/index.ts`（加 TrendBars）
- Modify: `learning-life/learning-life-page.tsx`（洞察分支替換佔位）

**Interfaces:**
- Consumes: Task 2 `getWeeklySummary`；Task 3 `MOCK_INSIGHTS`、`learningLifeActions.setInsightView`、`Insight`
- Produces:
  - `TrendBars({ data: Array<{date; value: number|null}>, max, color?, className? })`（Task 6 趨勢頁重用）
  - `InsightsTab({ today: string })`
  - insights-tab 內的下鑽分支先以佔位呈現，Task 6 替換（見 Step 3 註記）

- [ ] **Step 1: 建立 components/trend-bars.tsx**

```tsx
import { cn } from "@daodao/ui/lib/utils";

interface TrendBarsProps {
  data: Array<{ date: string; value: number | null }>;
  max: number;
  color?: string;
  className?: string;
}

/** 迷你長條圖：null（未記錄）顯示為淡色矮格 */
export function TrendBars({ data, max, color = "#16B9B3", className }: TrendBarsProps) {
  return (
    <div className={cn("flex h-10 items-end gap-1", className)}>
      {data.map((d) => (
        <div
          key={d.date}
          className="flex-1 rounded-sm"
          style={{
            height: d.value ? `${Math.max(15, (d.value / max) * 100)}%` : "8%",
            backgroundColor: d.value ? color : "rgba(0,0,0,0.08)",
          }}
        />
      ))}
    </div>
  );
}
```

components/index.ts 加入 `export { TrendBars } from "./trend-bars";`

- [ ] **Step 2: 建立 insights/weekly-hero.tsx**

```tsx
import { getWeeklySummary } from "../checkin-stats";
import { TrendBars } from "../components";
import type { MockCheckin } from "../types";

interface WeeklyHeroProps {
  checkins: MockCheckin[];
  today: string;
}

/** 第一層 Hero：本週一句話摘要（唯一焦點）＋ 7 天迷你趨勢 */
export function WeeklyHero({ checkins, today }: WeeklyHeroProps) {
  const summary = getWeeklySummary(checkins, today);
  const max = Math.max(...summary.last7.map((d) => d.count), 1);

  return (
    <div
      className="rounded-2xl px-5 py-4 text-white"
      style={{ background: "linear-gradient(135deg, #16B9B3, #0E8E89)" }}
    >
      <p className="text-xs opacity-80">本週摘要</p>
      <p className="mt-1 text-base font-semibold leading-relaxed">{summary.sentence}</p>
      <TrendBars
        className="mt-3"
        data={summary.last7.map((d) => ({ date: d.date, value: d.count || null }))}
        max={max}
        color="rgba(255,255,255,0.9)"
      />
    </div>
  );
}
```

- [ ] **Step 3: 建立 insights/insight-card.tsx**

```tsx
import { Card } from "@daodao/ui/components/card";
import { ChevronRight } from "lucide-react";
import type { Insight } from "../types";

interface InsightCardProps {
  insight: Insight;
  onDrillDown: (view: Insight["drillDown"]) => void;
}

/** 第二層：一句結論＋補充說明，可下鑽 */
export function InsightCard({ insight, onDrillDown }: InsightCardProps) {
  return (
    <Card className="border-[#E0E4E8] p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{insight.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-relaxed text-[#2D3436]">
            {insight.conclusion}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#8A9BA0]">{insight.detail}</p>
          <button
            type="button"
            onClick={() => onDrillDown(insight.drillDown)}
            className="mt-2 flex items-center gap-0.5 text-xs font-medium text-logo-cyan"
          >
            看完整分析
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: 建立 insights/insights-tab.tsx**（下鑽分支先佔位，Task 6 替換）

```tsx
"use client";

import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "../components";
import { MOCK_INSIGHTS } from "../mock-data";
import { learningLifeActions, useLearningLifeStore } from "../mock-store";
import type { InsightView } from "../types";
import { InsightCard } from "./insight-card";
import { WeeklyHero } from "./weekly-hero";

const EXPLORE_ENTRIES: Array<{ view: Exclude<InsightView, "cards">; emoji: string; label: string }> = [
  { view: "trends", emoji: "📈", label: "趨勢" },
  { view: "days", emoji: "📅", label: "每日回顧" },
  { view: "correlations", emoji: "🔗", label: "相關性" },
];

interface InsightsTabProps {
  today: string;
}

export function InsightsTab({ today }: InsightsTabProps) {
  const { checkins, insightView } = useLearningLifeStore();

  if (insightView !== "cards") {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => learningLifeActions.setInsightView("cards")}
          className="flex w-fit items-center gap-1 text-sm text-[#636E72]"
        >
          <ArrowLeft className="size-4" />
          回洞察
        </button>
        {/* Task 6 將以 TrendsView / DaysView / CorrelationsView 取代此佔位 */}
        <p className="py-12 text-center text-sm text-[#8A9BA0]">完整分析即將登場</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <WeeklyHero checkins={checkins} today={today} />

      <section>
        <SectionHeader
          title="系統發現"
          action={<span className="text-xs text-[#8A9BA0]">功能預覽</span>}
        />
        {/* 誠實框架：mock 洞察是個人化因果宣稱，須明示為預覽而非已發生的真實發現 */}
        <p className="mt-1 text-xs leading-relaxed text-[#8A9BA0]">
          正式版會從你的真實紀錄產生這些發現，以下先用示意內容感受。
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {MOCK_INSIGHTS.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDrillDown={learningLifeActions.setInsightView}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="深入探索" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {EXPLORE_ENTRIES.map((entry) => (
            <button
              type="button"
              key={entry.view}
              onClick={() => learningLifeActions.setInsightView(entry.view)}
              className="flex flex-col items-center gap-1 rounded-xl border border-[#E0E4E8] bg-white p-3 transition-colors hover:border-[#16B9B3]"
            >
              <span className="text-xl">{entry.emoji}</span>
              <span className="text-xs text-[#636E72]">{entry.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: learning-life-page.tsx 接上 InsightsTab**

```tsx
import { InsightsTab } from "./insights/insights-tab"; // 新增 import

// 佔位段落改為：
{activeTab === "today" ? (
  <TodayTab today={today} todayRecord={records[today]} checkins={checkins} />
) : (
  <InsightsTab today={today} />
)}
```

- [ ] **Step 6: 驗證＋Commit**

Run: `pnpm run lint && pnpm run typecheck`
手動：洞察 tab → Hero 一句話＋7 天長條；三張洞察卡；點「看完整分析」→ 佔位＋回洞察可返回。

```
feat(learning-life): 洞察 tab 第一二層 — 本週 Hero 與精選洞察卡

## Why is this necessary?

- 三層揭露的前兩層：打開洞察先看一句話結論，再掃 3 張精選發現，避免資訊攤開

## How does it address?

- WeeklyHero 由真計算（getWeeklySummary）產生本週打卡摘要＋迷你長條
- InsightCard × 3（學習語境 mock），各自可下鑽
- 深入探索入口（趨勢/每日回顧/相關性），下鑽視圖由 Task 6 補上
```

---

### Task 6: 下鑽 views — 趨勢／每日回顧／相關性

**Files:**
- Create: `learning-life/insights/trends-view.tsx`、`learning-life/insights/days-view.tsx`、`learning-life/insights/correlations-view.tsx`
- Modify: `learning-life/insights/insights-tab.tsx`（佔位替換為三個 view）

**Interfaces:**
- Consumes: Task 2 `getDailyCheckinCounts`、`getMoodDistribution`；Task 3 utils、`LEARNING_CORRELATIONS`；Task 4 `CheckinCard`；Task 5 `TrendBars`
- Produces: `TrendsView`、`DaysView`、`CorrelationsView`（僅 insights-tab 使用）

- [ ] **Step 1: 建立 insights/trends-view.tsx**

```tsx
"use client";

import { Card } from "@daodao/ui/components/card";
import { useMemo } from "react";
import { getDailyCheckinCounts, getMoodDistribution } from "../checkin-stats";
import { PeriodSelector, SectionHeader, SparklineCard, TagCloud, TrendBars } from "../components";
import { METRIC_CONFIGS } from "../constants";
import { learningLifeActions, useLearningLifeStore } from "../mock-store";
import type { MetricKey } from "../types";
import {
  calculateAverage,
  calculateTagFrequency,
  formatMetricValue,
  getRecordsForPeriod,
  getSparklineData,
  getTrendDirection,
} from "../utils";

const SPARKLINE_KEYS: MetricKey[] = ["energy", "sleep", "focus"];

interface TrendsViewProps {
  today: string;
}

export function TrendsView({ today }: TrendsViewProps) {
  const { records, checkins, activePeriod } = useLearningLifeStore();

  const periodRecords = useMemo(
    () => getRecordsForPeriod(records, activePeriod, today),
    [records, activePeriod, today]
  );
  const frequency = useMemo(
    () => getDailyCheckinCounts(checkins, today, activePeriod),
    [checkins, today, activePeriod]
  );
  const moodDist = useMemo(
    () => getMoodDistribution(checkins, today, activePeriod),
    [checkins, today, activePeriod]
  );
  const tagFrequency = useMemo(() => calculateTagFrequency(periodRecords), [periodRecords]);
  const maxCount = Math.max(...frequency.map((d) => d.count), 1);
  const maxMoodCount = Math.max(...moodDist.map((m) => m.count), 1);

  return (
    <div className="flex flex-col gap-6">
      <PeriodSelector value={activePeriod} onChange={learningLifeActions.setActivePeriod} />

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="✅ 打卡頻率" />
        <TrendBars
          className="mt-3 h-16"
          data={frequency.map((d) => ({ date: d.date, value: d.count || null }))}
          max={maxCount}
        />
      </Card>

      {/* 心情用分佈不用平均折線：折線暗示「越高越好」，會教使用者避開有挫折的難題 */}
      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="😄 打卡心情分佈" />
        <p className="mt-1 text-xs text-[#8A9BA0]">
          心情是認識自己的訊號，不是分數——挫折常是突破的前奏
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {moodDist.map((m) => (
            <div key={m.mood} className="flex items-center gap-2">
              <span className="w-6 text-base">{m.emoji}</span>
              <span className="w-12 shrink-0 text-xs text-[#636E72]">{m.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#F5F7FA]">
                <div
                  className="h-full rounded-full bg-[#F472B6]"
                  style={{ width: `${(m.count / maxMoodCount) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-[#8A9BA0]">{m.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SPARKLINE_KEYS.map((key) => {
          const config = METRIC_CONFIGS.find((m) => m.key === key);
          if (!config) return null;
          return (
            <SparklineCard
              key={key}
              config={config}
              value={formatMetricValue(calculateAverage(periodRecords, key), key)}
              data={getSparklineData(periodRecords, key)}
              trend={getTrendDirection(periodRecords, key)}
            />
          );
        })}
      </div>

      {tagFrequency.length > 0 && (
        <section>
          <SectionHeader title="🏷️ 環境標籤分佈" />
          <div className="mt-3">
            <TagCloud tags={tagFrequency} />
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 建立 insights/days-view.tsx**

```tsx
"use client";

import { cn } from "@daodao/ui/lib/utils";
import { format, parseISO, subDays } from "date-fns";
import { useMemo } from "react";
import { CheckinCard, MetricPill } from "../components";
import { METRIC_CONFIGS } from "../constants";
import { learningLifeActions, useLearningLifeStore } from "../mock-store";
import { formatMetricValue, getDayOfWeek } from "../utils";

/** 每日回顧：一天的橫切面 — 打卡（主角）＋當日脈絡（配角） */
export function DaysView() {
  const { records, checkins, selectedDate } = useLearningLifeStore();

  const weekDates = useMemo(() => {
    const ref = parseISO(selectedDate);
    const dates: string[] = [];
    for (let i = 3; i >= -3; i--) {
      dates.push(format(subDays(ref, i), "yyyy-MM-dd"));
    }
    return dates;
  }, [selectedDate]);

  const dayCheckins = checkins.filter((c) => c.checkinDate === selectedDate);
  const record = records[selectedDate];
  const hasContext = record && (record.energy > 0 || record.sleep > 0 || record.contextTags.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between gap-1">
        {weekDates.map((dateStr) => {
          const count = checkins.filter((c) => c.checkinDate === dateStr).length;
          const isSelected = dateStr === selectedDate;
          const day = Number(dateStr.split("-")[2]);
          let checkinMark = "·";
          if (count === 1) checkinMark = "✓";
          if (count > 1) checkinMark = `✓${count}`;
          return (
            <button
              type="button"
              key={dateStr}
              onClick={() => learningLifeActions.setSelectedDate(dateStr)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors",
                isSelected
                  ? "bg-logo-cyan text-white"
                  : "bg-[#F5F7FA] text-[#636E72] hover:bg-[#E0E4E8]"
              )}
            >
              <span className="text-[10px]">週{getDayOfWeek(dateStr)}</span>
              <span className="text-sm font-semibold">{day}</span>
              <span className={cn("text-[10px]", isSelected ? "text-white" : "text-logo-cyan")}>
                {checkinMark}
              </span>
            </button>
          );
        })}
      </div>

      {dayCheckins.length > 0 ? (
        <div className="flex flex-col gap-3">
          {dayCheckins.map((checkin) => (
            <CheckinCard key={checkin.id} checkin={checkin} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-[#8A9BA0]">
          <span className="text-3xl">🌊</span>
          <p className="text-sm">這天島上很安靜，沒有打卡</p>
        </div>
      )}

      {hasContext && (
        <section>
          <p className="mb-2 text-xs text-[#8A9BA0]">當日狀態</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {METRIC_CONFIGS.map((config) => {
              const value = record[config.key];
              if (!value) return null;
              return (
                <MetricPill
                  key={config.key}
                  emoji={config.emoji}
                  label={config.label}
                  value={formatMetricValue(value, config.key)}
                  unit={config.unit}
                />
              );
            })}
          </div>
          {record.contextTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {record.contextTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F5F7FA] px-2 py-0.5 text-xs text-[#636E72]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {record.note && (
            <p className="mt-2 text-sm leading-relaxed text-[#636E72]">{record.note}</p>
          )}
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 建立 insights/correlations-view.tsx**

```tsx
"use client";

import { CorrelationCard, SectionHeader } from "../components";
import { LEARNING_CORRELATIONS } from "../mock-data";

/** 相關性全列表（第三層下鑽）— 全為學習語境 */
export function CorrelationsView() {
  const strong = LEARNING_CORRELATIONS.filter((c) => c.strength === "strong");
  const moderate = LEARNING_CORRELATIONS.filter((c) => c.strength === "moderate");

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-[#636E72]">
        系統分析你的打卡與每日狀態，找出「怎樣的日子你學得最好」。統計關聯不代表因果，但能幫你認識自己的模式。
        <span className="ml-1 text-xs text-[#8A9BA0]">示意資料</span>
      </p>

      {strong.length > 0 && (
        <section>
          <SectionHeader title="強相關" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {strong.map((c) => (
              <CorrelationCard key={c.id} correlation={c} showScatter />
            ))}
          </div>
        </section>
      )}

      {moderate.length > 0 && (
        <section>
          <SectionHeader title="中等相關" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {moderate.map((c) => (
              <CorrelationCard key={c.id} correlation={c} showScatter />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: insights-tab.tsx 佔位替換**

```tsx
import { CorrelationsView } from "./correlations-view";
import { DaysView } from "./days-view";
import { TrendsView } from "./trends-view";

// 佔位 <p>完整分析即將登場</p> 替換為：
{insightView === "trends" && <TrendsView today={today} />}
{insightView === "days" && <DaysView />}
{insightView === "correlations" && <CorrelationsView />}
```

- [ ] **Step 5: 驗證＋Commit**

Run: `pnpm run lint && pnpm run typecheck`
手動：三張洞察卡分別下鑽到對應 view；趨勢頁切換 7/30/90 天；每日回顧點日期切換，有打卡日顯示 CheckinCard、當日狀態 pills。

```
feat(learning-life): 洞察第三層下鑽 — 趨勢/每日回顧/相關性

## Why is this necessary?

- 三層揭露的最後一層：完整資料只在使用者主動下鑽時出現，不佔首屏

## How does it address?

- TrendsView：打卡頻率（真計算）＋打卡心情分佈（不做平均折線，心情是訊號不是分數）＋精力/睡眠/專注 sparkline＋環境標籤雲
- DaysView：一天的橫切面，打卡卡片為主角、當日狀態 pills 為配角
- CorrelationsView：學習語境相關性全列表（示意標示）
```

---

### Task 7: 島頁摘要卡

**Files:**
- Create: `learning-life/today-weather-card.tsx`、`learning-life/rhythm-insight-card.tsx`
- Modify: `learning-life/index.ts`
- Modify: `apps/product/src/components/user/user-profile-tabs.tsx`

**Interfaces:**
- Consumes: Task 2 `getIslandWeather`、`getCheckinStreak`、`getDaysSinceLastCheckin`、`getWeeklySummary`；Task 3 store；Task 5 `TrendBars`
- Produces: `TodayWeatherCard`、`RhythmInsightCard`（index.ts 匯出，島頁使用）

- [ ] **Step 1: 建立 today-weather-card.tsx**

```tsx
"use client";

import { posthogCapture } from "@daodao/analytics";
import { Link } from "@daodao/i18n/navigation";
import { format } from "date-fns";
import { ChevronRight, Flame } from "lucide-react";
import { getCheckinStreak, getDaysSinceLastCheckin } from "./checkin-stats";
import { getIslandWeather } from "./island-weather";
import { learningLifeActions, useLearningLifeStore } from "./mock-store";

/** 島頁私有摘要卡 1：今日天氣（打卡狀態）→ 學習生活「今天」 */
export function TodayWeatherCard() {
  const { checkins, records } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayCheckedIn = checkins.some((c) => c.checkinDate === today);
  const streak = getCheckinStreak(checkins, today);
  const weather = getIslandWeather({
    todayCheckedIn,
    streak,
    daysSinceLastCheckin: getDaysSinceLastCheckin(checkins, today),
    todayEnergy: records[today]?.energy,
  });

  return (
    <Link
      href="/me/learning-life"
      onClick={() => {
        posthogCapture("island_summary_card_clicked", { card: "weather" });
        learningLifeActions.setActiveTab("today");
      }}
      className="flex items-center gap-3 rounded-2xl border border-[#E4EAE9] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="text-3xl">{weather.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text-dark">島上天氣</p>
        <p className="truncate text-xs text-text-secondary">{weather.label}</p>
      </div>
      {streak > 0 && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-[#FFA10B]">
          <Flame className="size-3.5" />
          {streak} 天
        </span>
      )}
      <ChevronRight className="size-4 shrink-0 text-text-secondary" />
    </Link>
  );
}
```

- [ ] **Step 2: 建立 rhythm-insight-card.tsx**

```tsx
"use client";

import { posthogCapture } from "@daodao/analytics";
import { Link } from "@daodao/i18n/navigation";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { getWeeklySummary } from "./checkin-stats";
import { TrendBars } from "./components";
import { learningLifeActions, useLearningLifeStore } from "./mock-store";

/** 島頁私有摘要卡 2：節奏洞察（本週一句話）→ 學習生活「洞察」 */
export function RhythmInsightCard() {
  const { checkins } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const summary = getWeeklySummary(checkins, today);
  const max = Math.max(...summary.last7.map((d) => d.count), 1);

  return (
    <Link
      href="/me/learning-life"
      onClick={() => {
        posthogCapture("island_summary_card_clicked", { card: "rhythm" });
        learningLifeActions.setActiveTab("insights");
        learningLifeActions.setInsightView("cards");
      }}
      className="flex items-center gap-3 rounded-2xl border border-[#E4EAE9] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text-dark">我的節奏</p>
        <p className="truncate text-xs text-text-secondary">{summary.sentence}</p>
        <TrendBars
          className="mt-2 h-6 max-w-40"
          data={summary.last7.map((d) => ({ date: d.date, value: d.count || null }))}
          max={max}
        />
      </div>
      <ChevronRight className="size-4 shrink-0 text-text-secondary" />
    </Link>
  );
}
```

- [ ] **Step 3: index.ts 補匯出**

```ts
export { LearningLifePage } from "./learning-life-page";
export { RhythmInsightCard } from "./rhythm-insight-card";
export { TodayWeatherCard } from "./today-weather-card";
```

- [ ] **Step 4: user-profile-tabs.tsx 接上摘要卡**（完整取代）

```tsx
"use client";

import { RhythmInsightCard, TodayWeatherCard } from "@/components/learning-life";
import { PracticeSection } from "@/components/practice";

interface UserProfileTabsProps {
  targetUserId: string;
  isOwnProfile: boolean;
}

export function UserProfileTabs({ targetUserId, isOwnProfile }: UserProfileTabsProps) {
  return (
    <div className="mt-4">
      {isOwnProfile && (
        <div className="mb-4 flex flex-col gap-3">
          <TodayWeatherCard />
          <RhythmInsightCard />
        </div>
      )}
      <PracticeSection userId={targetUserId} />
    </div>
  );
}
```

- [ ] **Step 5: 驗證＋Commit**

Run: `pnpm run lint && pnpm run typecheck`
手動：登入後開自己的島（sidebar「我的小島」）→ 兩張摘要卡在 PracticeSection 上方；點卡進入學習生活對應 tab；看別人的島不出現摘要卡。

```
feat(island): 島頁改放學習生活摘要卡取代 inline 儀表板

## Why is this necessary?

- 島頁是「遠景」層，只能放摘要卡；完整儀表板 inline 造成資訊攤開（spec 原則一）

## How does it address?

- TodayWeatherCard：天氣 emoji＋一句狀態＋streak，點入「今天」
- RhythmInsightCard：本週一句話＋7 天迷你長條，點入「洞察」
- 僅 isOwnProfile 顯示（公開/私有＝敘事分界）
- 兩卡 onClick 埋 island_summary_card_clicked（POC 假設 3 量測）
```

---

### Task 8: 島景天氣層

**Files:**
- Create: `learning-life/island-weather-layer.tsx`
- Modify: `learning-life/index.ts`
- Modify: `apps/product/src/components/user/island-header.tsx`

**Interfaces:**
- Consumes: Task 2 `getIslandWeather` 等；Task 3 store
- Produces: `IslandWeatherLayer`（island-header 內使用，僅 isOwnProfile 渲染）

- [ ] **Step 1: 建立 island-weather-layer.tsx**

```tsx
"use client";

import { format } from "date-fns";
import { getCheckinStreak, getDaysSinceLastCheckin } from "./checkin-stats";
import { getIslandWeather } from "./island-weather";
import { useLearningLifeStore } from "./mock-store";

/**
 * 島景天氣層：疊加在島景 Lottie 上，依打卡狀態顯示天氣（僅島主可見）。
 * 讓島「活起來」— 島的樣貌反映學習生活（spec 原則三）。
 */
export function IslandWeatherLayer() {
  const { checkins, records } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayCheckedIn = checkins.some((c) => c.checkinDate === today);
  const weather = getIslandWeather({
    todayCheckedIn,
    streak: getCheckinStreak(checkins, today),
    daysSinceLastCheckin: getDaysSinceLastCheckin(checkins, today),
    todayEnergy: records[today]?.energy,
  });

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <span className="absolute -top-2 -right-6 text-3xl drop-shadow-sm">{weather.emoji}</span>
      {weather.lively && (
        <span className="absolute -bottom-1 -left-4 animate-pulse text-xl">✨</span>
      )}
    </div>
  );
}
```

index.ts 加入 `export { IslandWeatherLayer } from "./island-weather-layer";`

- [ ] **Step 2: island-header.tsx 掛上天氣層**

import 區加入：

```tsx
import { IslandWeatherLayer } from "@/components/learning-life";
```

找到 Lottie 容器（`island-header.tsx:205` 附近的 `<div className="absolute left-1/2 top-[92px] ...">`），在 `{lottieJson && <Lottie ... />}` 的下一行加入：

```tsx
{isOwnProfile && <IslandWeatherLayer />}
```

- [ ] **Step 3: 驗證＋Commit**

Run: `pnpm run lint && pnpm run typecheck`
手動核心體驗（「島是活的」demo 動線）：
1. 開自己的島 → 島上 ⛅（今天未打卡、streak 6）
2. 進學習生活「今天」→ 示意打卡 → 回島頁 → 島上 🌈（streak 7）
3. 快速記錄精力選 ⚡ → 島上出現 ✨
4. 看別人的島 → 無天氣層

```
feat(island): 島景 header 加入天氣層，島隨打卡狀態變化

## Why is this necessary?

- 島的意義要顯現，島景必須反映真實狀態而非靜態裝飾（spec 原則三）

## How does it address?

- IslandWeatherLayer 疊加於 Lottie 容器：晴/彩虹/多雲/陰 emoji＋精力 lively ✨
- 與摘要卡共用 island-weather 純函式，狀態單一來源
- 僅 isOwnProfile 渲染（訪客可見天氣為非目標）
```

---

### Task 9: 最終驗證

**Files:** 無新檔案。

- [ ] **Step 1: 全量檢查**

```bash
pnpm run lint && pnpm run typecheck && pnpm --filter @daodao/product test
```

Expected: 全綠（vitest 含既有測試與新增 12 案例）。

- [ ] **Step 2: 手動流程檢查清單**（`pnpm --filter @daodao/product dev`，port 3001）

- [ ] `/mine`：無學習生活入口（工作台保持乾淨），既有挑戰/陪伴卡不受影響
- [ ] 自己的島：島景天氣 ⛅ → 摘要卡兩張 → PracticeSection；無 inline 儀表板
- [ ] 別人的島：無天氣層、無摘要卡
- [ ] `/me/learning-life` 今天 tab：CTA → 示意打卡 → 卡片出現、streak 7；快速記錄三項可操作
- [ ] 打卡後回島頁：🌈 出現、天氣卡文案更新（跨頁狀態一致）
- [ ] 洞察 tab：Hero 句子與打卡資料一致；三卡下鑽/返回正常；趨勢切 7/30/90；每日回顧切日期
- [ ] 同 session 重整：狀態保留（sessionStorage）
- [ ] 量測事件：操作 tab 切換/下鑽/快速記錄/示意打卡/摘要卡點擊，於 Network（`posthog` 請求）或 PostHog Activity 確認 5 種事件送出，屬性正確（`tab`/`view`/`field`/`streak_after`/`card`）

- [ ] **Step 3: 若有問題修復後，依專案流程 commit 收尾**

---

## Self-Review 記錄

- Spec coverage：§4 島頁 IA（Task 7）、§5 兩主軸三層（Task 4-6）、§6 資料模型（Task 2-3）、§7 天氣系統（Task 2、8）、§8 重構對照（Task 1、3）、§10 非目標未越界 — 覆蓋完整。年輪入口卡與 PracticeSection 摘要化為 spec 明定的後續迭代，不在本計畫。
- 已知偏差（記錄於 Global Constraints）：lively 用 ✨ 不改 Lottie 速度；真實 API 僅保留既有呼叫不新增（`useMyPractices` 的資料未直接進 mock store，today 打卡以示意打卡呈現 — spec §6.1「便宜的真實資料照用」在島頁 PracticeSection 既有行為中維持）。
- 型別一致性：`MetricKey`、`MockCheckin`、`learningLifeActions` 各 task 簽名一致。
- 學習體驗 review 後調整（2026-07-07）：(1) 陰天/多雲文案改歡迎框架，不責備中斷；(2) 週摘要下滑改體諒句；(3) mock 洞察改「功能預覽」誠實框架＋說明句；(4) 心情由 1-6 平均折線改為分佈長條（`getMoodDistribution` 取代 `getDailyMoodScores`，`CHECKIN_MOOD_META` 移除 score）；(5) 全互動埋 PostHog 事件（見「POC 量測」章節）。
