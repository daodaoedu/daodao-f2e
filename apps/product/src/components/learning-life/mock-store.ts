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

const SERVER_SNAPSHOT: LearningLifeState = {
  records: {},
  checkins: [],
  selectedDate: "",
  activeTab: "today",
  insightView: "cards",
  activePeriod: 30,
};

const storage = getStorage<LearningLifeState>(StorageEnum.PocLifeWarehouse);

let state: LearningLifeState | null = null;
const listeners = new Set<() => void>();
let hydrated = false;

function getState(): LearningLifeState {
  if (!state) state = initState();
  return state;
}

function emit() {
  storage.set(getState());
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
  return getState();
}

function getServerSnapshot(): LearningLifeState {
  return SERVER_SNAPSHOT;
}

/** 訂閱學習生活狀態（島頁摘要卡、天氣層、完整頁共用同一份） */
export function useLearningLifeStore(): LearningLifeState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function emptyRecord(date: string): DailyRecord {
  return {
    date,
    energy: 0,
    sleep: 0,
    focus: 0,
    exercise: 0,
    stress: 0,
    contextTags: [],
    note: "",
    source: {},
  };
}

function updateRecord(date: string, patch: Partial<DailyRecord>) {
  const current = getState().records[date] ?? emptyRecord(date);
  state = {
    ...getState(),
    records: { ...getState().records, [date]: { ...current, ...patch } },
  };
  emit();
}

export const learningLifeActions = {
  setEnergy(date: string, energy: number) {
    updateRecord(date, {
      energy,
      source: { ...getState().records[date]?.source, energy: "manual" },
    });
    posthogCapture("learning_life_quick_track_used", { field: "energy" });
  },

  setSleep(date: string, sleep: number) {
    updateRecord(date, { sleep, source: { ...getState().records[date]?.source, sleep: "manual" } });
    posthogCapture("learning_life_quick_track_used", { field: "sleep" });
  },

  setFocus(date: string, focus: number) {
    updateRecord(date, { focus, source: { ...getState().records[date]?.source, focus: "manual" } });
    posthogCapture("learning_life_quick_track_used", { field: "focus" });
  },

  toggleContextTag(date: string, tag: string) {
    const current = getState().records[date] ?? emptyRecord(date);
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
      id: `local-${getState().checkins.length + 1}`,
      practiceId: practice.id,
      practiceTitle: practice.title,
      checkinDate: today,
      mood: "happy",
      note: "完成今日進度！（示意打卡）",
      tags: ["有收穫"],
    };
    state = { ...getState(), checkins: [checkin, ...getState().checkins] };
    emit();
    posthogCapture("learning_life_mock_checkin_added", {
      streak_after: getCheckinStreak(getState().checkins, today),
    });
  },

  setSelectedDate(date: string) {
    state = { ...getState(), selectedDate: date };
    emit();
  },

  setActiveTab(tab: TabId) {
    state = { ...getState(), activeTab: tab };
    emit();
    posthogCapture("learning_life_tab_switched", { tab });
  },

  setInsightView(view: InsightView) {
    state = { ...getState(), insightView: view };
    emit();
    if (view !== "cards") posthogCapture("learning_life_insight_drilldown", { view });
  },

  setActivePeriod(period: PeriodOption) {
    state = { ...getState(), activePeriod: period };
    emit();
  },
};
