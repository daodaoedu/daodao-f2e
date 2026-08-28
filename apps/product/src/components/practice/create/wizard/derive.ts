/**
 * 由精靈表單值推導的衍生資料（純函式，供 Step 2 / Step 4 / 送出共用）
 */
import { parse } from "date-fns";
import { ExecutionTiming } from "@/constants/practice-form";
import {
  allocateSegmentDays,
  calcEndDate,
  deriveNameFromAction,
  segmentDateRanges,
} from "@/lib/practice-create";
import { type SegmentOverride, TIMING_PRESETS, type WizardFormValues } from "./schema";

export interface EffectiveSegment {
  index: number;
  name: string;
  action: string;
  days: number;
  start: Date | null;
  end: Date | null;
  /** 正規化頻率字串（"2-5" / "7"），已套用繼承 */
  frequency: string;
  minutes: number | null;
  /** 預設時機 key 或自訂文字 */
  timing: string;
}

export const parseIsoDate = (iso: string): Date | null => {
  if (!iso) return null;
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return Number.isNaN(d.getTime()) ? null : d;
};

/** 顯示用名稱：手動覆寫 > 由行動推導 > fallback（「我的實踐」由呼叫端傳入 i18n 值） */
export const getBaseName = (values: Pick<WizardFormValues, "name" | "action">, fallback: string) =>
  values.name.trim() || deriveNameFromAction(values.action) || fallback;

export const isTimingPreset = (timing: string): timing is ExecutionTiming =>
  (TIMING_PRESETS as readonly string[]).includes(timing);

/** 依段數重算分配天數（保留天數以外的覆寫） */
export const resetSegmentDays = (segments: SegmentOverride[]): SegmentOverride[] =>
  segments.map((s) => ({ ...s, days: null }));

/**
 * 拆段時各段的有效值（含覆寫、繼承與日期接續）
 * 未拆段時回傳單一段（index 0），供預覽與送出走同一條路
 */
export const getEffectiveSegments = (
  values: WizardFormValues,
  nameFallback: string
): EffectiveSegment[] => {
  const total = values.durationDays ?? 0;
  const base = getBaseName(values, nameFallback);
  const start = parseIsoDate(values.startDate);

  if (!values.isSegmented || values.segments.length === 0) {
    return [
      {
        index: 0,
        name: base,
        action: values.action,
        days: total,
        start,
        end: start && total > 0 ? calcEndDate(start, total) : null,
        frequency: values.frequency,
        minutes: values.sessionMinutes,
        timing: "",
      },
    ];
  }

  const allocated = allocateSegmentDays(total, values.segments.length);
  const days = values.segments.map((seg, i) => seg.days ?? allocated[i] ?? 0);
  const ranges = start ? segmentDateRanges(start, days) : [];

  return values.segments.map((seg, i) => ({
    index: i,
    name: seg.name.trim() || `${base} (${i + 1})`,
    action: seg.action.trim() || values.action,
    days: days[i] ?? 0,
    start: ranges[i]?.start ?? null,
    end: ranges[i]?.end ?? null,
    frequency: seg.frequency || values.frequency,
    minutes: seg.minutes ?? values.sessionMinutes,
    timing: seg.timing,
  }));
};

export const getSegmentDaysSum = (values: WizardFormValues): number =>
  getEffectiveSegments(values, "").reduce((sum, s) => sum + s.days, 0);

/** 資源是否套用在第 index 段（未指派 = 全部） */
export const resourceAppliesToSegment = (
  resource: { segmentIndexes: number[] },
  index: number
): boolean => resource.segmentIndexes.length === 0 || resource.segmentIndexes.includes(index);

export { ExecutionTiming };
