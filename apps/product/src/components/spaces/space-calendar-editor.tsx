"use client";

import type { SpaceBlockType, UpdateSpaceBlockRequestType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { X } from "lucide-react";

type EventInput = NonNullable<UpdateSpaceBlockRequestType["events"]>[number];

export type EditableEvent = EventInput;

export function toEditableEvents(block: SpaceBlockType): EditableEvent[] {
  return block.events.map((event) => ({
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    url: event.url,
  }));
}

function todayDateString(): string {
  // 以本地日期組字串；toISOString 是 UTC，會讓東八區早上八點前預填到昨天
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function newEditableEvent(): EditableEvent {
  return {
    title: "",
    startDate: todayDateString(),
    endDate: null,
    startTime: null,
    endTime: null,
    location: null,
    url: null,
  };
}

interface SpaceCalendarEditorProps {
  events: EditableEvent[];
  onChange: (events: EditableEvent[]) => void;
}

/** 日曆區塊編輯（FR-9.4–9.7）：每列展開為表單，選填欄位明確標示。 */
export const SpaceCalendarEditor = ({ events, onChange }: SpaceCalendarEditorProps) => {
  const t = useTranslations("space");

  const updateRow = (index: number, patch: Partial<EditableEvent>) => {
    onChange(events.map((event, i) => (i === index ? { ...event, ...patch } : event)));
  };

  const optionalLabel = (label: string) => (
    <span>
      {label}
      <span className="ml-1 text-[10px] text-text-dark/40">{t("optional")}</span>
    </span>
  );

  return (
    <div className="flex flex-col gap-3">
      {events.map((event, index) => (
        <div
          key={`event-${index}`}
          className="relative rounded-xl border border-[#E4EAE9] bg-[#FBFDFC] p-3"
        >
          <button
            type="button"
            aria-label={t("remove_row")}
            onClick={() => onChange(events.filter((_, i) => i !== index))}
            className="absolute right-2 top-2 rounded-full p-1 text-text-dark/40 transition-colors hover:bg-[#FBE9E7] hover:text-red"
          >
            <X className="size-4" />
          </button>
          <div className="grid grid-cols-2 gap-2.5 pr-6">
            <label className="col-span-2 flex flex-col gap-1 text-xs text-text-dark/60">
              {t("field_title")}
              <input
                value={event.title}
                placeholder={t("event_title_placeholder")}
                onChange={(e) => updateRow(index, { title: e.target.value })}
                className="rounded-lg border border-[#DCEBEA] px-2.5 py-1.5 text-sm text-text-dark focus:border-primary-base focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-dark/60">
              {t("field_date")}
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={event.startDate}
                  onChange={(e) => updateRow(index, { startDate: e.target.value })}
                  className="min-w-0 flex-1 rounded-lg border border-[#DCEBEA] px-2 py-1.5 text-sm text-text-dark focus:border-primary-base focus:outline-none"
                />
                <span className="text-text-dark/40">–</span>
                <input
                  type="date"
                  value={event.endDate ?? ""}
                  onChange={(e) => updateRow(index, { endDate: e.target.value || null })}
                  className="min-w-0 flex-1 rounded-lg border border-[#DCEBEA] px-2 py-1.5 text-sm text-text-dark focus:border-primary-base focus:outline-none"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-dark/60">
              {optionalLabel(t("field_time"))}
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={event.startTime ?? ""}
                  onChange={(e) => updateRow(index, { startTime: e.target.value || null })}
                  className="min-w-0 flex-1 rounded-lg border border-[#DCEBEA] px-2 py-1.5 text-sm text-text-dark focus:border-primary-base focus:outline-none"
                />
                <span className="text-text-dark/40">–</span>
                <input
                  type="time"
                  value={event.endTime ?? ""}
                  onChange={(e) => updateRow(index, { endTime: e.target.value || null })}
                  className="min-w-0 flex-1 rounded-lg border border-[#DCEBEA] px-2 py-1.5 text-sm text-text-dark focus:border-primary-base focus:outline-none"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-dark/60">
              {optionalLabel(t("field_location"))}
              <input
                value={event.location ?? ""}
                placeholder={t("location_example")}
                onChange={(e) => updateRow(index, { location: e.target.value || null })}
                className="rounded-lg border border-[#DCEBEA] px-2.5 py-1.5 text-sm text-text-dark focus:border-primary-base focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-dark/60">
              {optionalLabel(t("field_link"))}
              <input
                value={event.url ?? ""}
                placeholder={t("link_example")}
                onChange={(e) => updateRow(index, { url: e.target.value || null })}
                className="rounded-lg border border-[#DCEBEA] px-2.5 py-1.5 text-sm text-text-dark focus:border-primary-base focus:outline-none"
              />
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...events, newEditableEvent()])}
        className="self-start rounded-full px-2 py-1 text-xs text-primary-base transition-colors hover:bg-[#F0F9F8]"
      >
        {t("add_event")}
      </button>
    </div>
  );
};
