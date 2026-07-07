"use client";

import { getStorage, StorageEnum } from "@daodao/shared";
import { format } from "date-fns";
import { useSyncExternalStore } from "react";
import type { PeriodOption } from "./constants";
import { generateMockRecords } from "./mock-data";
import type { CustomField, DailyRecord, TabId } from "./types";

export interface LifeWarehouseState {
  records: Record<string, DailyRecord>;
  customFields: CustomField[];
  selectedDate: string;
  activePeriod: PeriodOption;
  activeTab: TabId;
}

function initState(): LifeWarehouseState {
  return {
    records: generateMockRecords(90),
    customFields: [],
    selectedDate: format(new Date(), "yyyy-MM-dd"),
    activePeriod: 30,
    activeTab: "overview",
  };
}

const storage = getStorage<LifeWarehouseState>(StorageEnum.PocLifeWarehouse);

let state: LifeWarehouseState = initState();
const listeners = new Set<() => void>();
let hydrated = false;

function emit() {
  storage.set(state);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    hydrated = true;
    const persisted = storage.get();
    if (persisted?.records) {
      state = persisted;
      queueMicrotask(() => {
        for (const l of listeners) l();
      });
    }
  }
  return () => listeners.delete(listener);
}

function getSnapshot(): LifeWarehouseState {
  return state;
}

export function useLifeWarehouseStore(): LifeWarehouseState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getRecord(date: string): DailyRecord | undefined {
  return state.records[date];
}

function updateRecord(date: string, patch: Partial<DailyRecord>) {
  const current = state.records[date];
  if (!current) return;
  state = {
    ...state,
    records: { ...state.records, [date]: { ...current, ...patch } },
  };
  emit();
}

export const lifeWarehouseActions = {
  setMood(date: string, mood: number) {
    updateRecord(date, {
      mood,
      source: { ...state.records[date]?.source, mood: "manual" },
    });
  },

  setEnergy(date: string, energy: number) {
    updateRecord(date, {
      energy,
      source: { ...state.records[date]?.source, energy: "manual" },
    });
  },

  addTag(date: string, tag: string) {
    const current = state.records[date];
    if (!current || current.tags.includes(tag)) return;
    updateRecord(date, { tags: [...current.tags, tag] });
  },

  removeTag(date: string, tag: string) {
    const current = state.records[date];
    if (!current) return;
    updateRecord(date, { tags: current.tags.filter((t) => t !== tag) });
  },

  setNote(date: string, note: string) {
    updateRecord(date, { note });
  },

  setIntention(date: string, intention: string) {
    updateRecord(date, { intention });
  },

  setReflection(date: string, reflection: string) {
    updateRecord(date, { reflection });
  },

  updateMetric(date: string, key: keyof DailyRecord, value: number) {
    updateRecord(date, {
      [key]: value,
      source: { ...state.records[date]?.source, [key]: "manual" },
    });
  },

  addCustomField(field: CustomField) {
    state = {
      ...state,
      customFields: [...state.customFields, field],
    };
    emit();
  },

  removeCustomField(fieldId: string) {
    state = {
      ...state,
      customFields: state.customFields.filter((f) => f.id !== fieldId),
    };
    emit();
  },

  setSelectedDate(date: string) {
    state = { ...state, selectedDate: date };
    emit();
  },

  setActivePeriod(period: PeriodOption) {
    state = { ...state, activePeriod: period };
    emit();
  },

  setActiveTab(tab: TabId) {
    state = { ...state, activeTab: tab };
    emit();
  },
};
