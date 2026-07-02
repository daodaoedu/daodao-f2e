"use client";

import { getStorage, StorageEnum } from "@daodao/shared";
import { useSyncExternalStore } from "react";
import { MOCK_MY_PROGRESS } from "./mock-data";
import type { SeasonCheckin } from "./types";

/**
 * POC 用的跨頁 mock 狀態（module-level store）。
 * 讓「加入挑戰 / 打卡 / 預先報名」在列表、主題頁、本期頁、我的挑戰間保持一致。
 * 正式版由後端 API 取代。
 */

export interface SeasonUserState {
  joined: boolean;
  registered: boolean;
  todayCheckedIn: boolean;
  myCheckinCount: number;
  myStreak: number;
  myRank: number | null;
  /** 本次 session 中自己新增的打卡（顯示於打卡牆頂部） */
  localCheckins: SeasonCheckin[];
}

interface PocChallengeState {
  seasons: Record<string, SeasonUserState>;
}

const DEFAULT_SEASON_STATE: SeasonUserState = {
  joined: false,
  registered: false,
  todayCheckedIn: false,
  myCheckinCount: 0,
  myStreak: 0,
  myRank: null,
  localCheckins: [],
};

const storage = getStorage<PocChallengeState>(StorageEnum.PocChallenge);

function initState(): PocChallengeState {
  const seasons: Record<string, SeasonUserState> = {};
  for (const progress of Object.values(MOCK_MY_PROGRESS)) {
    seasons[progress.seasonId] = {
      ...DEFAULT_SEASON_STATE,
      joined: progress.joined,
      todayCheckedIn: progress.todayCheckedIn,
      myCheckinCount: progress.myCheckinCount,
      myStreak: progress.myStreak,
      myRank: progress.myRank,
    };
  }
  return { seasons };
}

let state: PocChallengeState = initState();
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
    if (persisted?.seasons) {
      state = persisted;
      queueMicrotask(() => {
        for (const l of listeners) l();
      });
    }
  }
  return () => listeners.delete(listener);
}

function getSnapshot(): PocChallengeState {
  return state;
}

/** 訂閱 POC 挑戰狀態（任何頁面共用同一份） */
export function usePocChallengeStore(): PocChallengeState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getSeasonUserState(seasonId: string): SeasonUserState {
  return state.seasons[seasonId] ?? DEFAULT_SEASON_STATE;
}

function updateSeason(seasonId: string, patch: Partial<SeasonUserState>) {
  const current = state.seasons[seasonId] ?? DEFAULT_SEASON_STATE;
  state = {
    seasons: { ...state.seasons, [seasonId]: { ...current, ...patch } },
  };
  emit();
}

export const pocChallengeActions = {
  /** 加入某一期（模擬 POST /join：同時建立同名主題實踐） */
  joinSeason(seasonId: string) {
    updateSeason(seasonId, { joined: true });
  },
  /** 預先報名即將開始的期數 */
  registerSeason(seasonId: string) {
    updateSeason(seasonId, { registered: true });
  },
  /** 打卡完成（模擬寫入 practice_checkins） */
  checkIn(seasonId: string, content: string) {
    const current = state.seasons[seasonId] ?? DEFAULT_SEASON_STATE;
    const checkin: SeasonCheckin = {
      id: `local-${current.localCheckins.length + 1}`,
      userId: "me",
      displayName: "我",
      content: content || "完成今日打卡！",
      checkinDate: "今天",
      streak: current.myStreak + 1,
    };
    updateSeason(seasonId, {
      todayCheckedIn: true,
      myCheckinCount: current.myCheckinCount + 1,
      myStreak: current.myStreak + 1,
      localCheckins: [checkin, ...current.localCheckins],
    });
  },
};
