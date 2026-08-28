/**
 * 精靈表單值 → API 請求（純函式，附測試）
 */
import type {
  BatchCreatePracticeRequestType,
  BatchCreatePracticeTemplateRequestType,
  CreatePracticeRequestType,
  CreatePracticeTemplateRequestType,
} from "@daodao/api";
import { format } from "date-fns";
import { ExecutionTimingToPracticeTimePeriodMap } from "@/constants/practice-form";
import { frequencyToRange } from "@/lib/practice-create";
import {
  type EffectiveSegment,
  getEffectiveSegments,
  isTimingPreset,
  resourceAppliesToSegment,
} from "./derive";
import { CUSTOM_TIMING_SEPARATOR, type WizardFormValues, WizardMode } from "./schema";

export interface ToRequestOptions {
  /** i18n 的「我的實踐」 */
  nameFallback: string;
  privacyStatus?: "private" | "public" | "delayed";
  templateId?: string;
  creationMethod?: "self_created" | "copied" | "action_generator";
}

type TimePeriod = CreatePracticeRequestType["practiceTimePeriods"] extends (infer U)[] | undefined
  ? U
  : never;

const toPeriods = (values: WizardFormValues, segment: EffectiveSegment): TimePeriod[] => {
  if (segment.timing && isTimingPreset(segment.timing)) {
    return [ExecutionTimingToPracticeTimePeriodMap[segment.timing] as TimePeriod];
  }
  if (values.isSegmented && segment.timing) {
    // 逐段自訂文字時機：不對應 enum，走 otherContext
    return [];
  }
  return values.timings.map((t) => ExecutionTimingToPracticeTimePeriodMap[t] as TimePeriod);
};

const toOtherContext = (
  values: WizardFormValues,
  segment: EffectiveSegment
): string | undefined => {
  const parts = [...values.customTimings];
  if (values.isSegmented && segment.timing && !isTimingPreset(segment.timing)) {
    parts.push(segment.timing);
  }
  const joined = parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(CUSTOM_TIMING_SEPARATOR);
  return joined || undefined;
};

const segmentToPracticeRequest = (
  values: WizardFormValues,
  segment: EffectiveSegment,
  opts: ToRequestOptions
): CreatePracticeRequestType => {
  const range = frequencyToRange(segment.frequency);
  const request: CreatePracticeRequestType = {
    title: segment.name,
    practiceAction: segment.action,
    durationDays: segment.days,
    practiceTimePeriods: toPeriods(values, segment),
    tags: values.tags,
    isDraft: false,
  };

  if (segment.start) request.startDate = format(segment.start, "yyyy-MM-dd");
  if (range) {
    request.frequencyMinDays = range.min;
    request.frequencyMaxDays = range.max;
  }
  if (segment.minutes !== null) request.sessionDurationMinutes = segment.minutes;

  const otherContext = toOtherContext(values, segment);
  if (otherContext) request.otherContext = otherContext;

  // 未拆段：指派列不顯示也不生效，所有資源都帶上
  const resources = values.resources
    .filter((r) => !values.isSegmented || resourceAppliesToSegment(r, segment.index))
    .map((r) => ({ name: r.name, url: r.url || "" }));
  if (resources.length > 0) request.resources = resources;

  if (opts.privacyStatus) request.privacyStatus = opts.privacyStatus;
  if (opts.templateId) request.templateId = opts.templateId;
  if (opts.creationMethod) request.creationMethod = opts.creationMethod;

  return request;
};

/** 未拆段個人實踐 */
export const toCreatePracticeRequest = (
  values: WizardFormValues,
  opts: ToRequestOptions
): CreatePracticeRequestType => {
  const [segment] = getEffectiveSegments(values, opts.nameFallback);
  return segmentToPracticeRequest(values, segment as EffectiveSegment, opts);
};

/** 拆段個人實踐（2–3 段，單一 request） */
export const toBatchCreatePracticeRequest = (
  values: WizardFormValues,
  opts: ToRequestOptions
): BatchCreatePracticeRequestType => ({
  segments: getEffectiveSegments(values, opts.nameFallback).map((s) =>
    segmentToPracticeRequest(values, s, opts)
  ),
});

const segmentToTemplateRequest = (
  values: WizardFormValues,
  segment: EffectiveSegment
): CreatePracticeTemplateRequestType => {
  const range = frequencyToRange(segment.frequency);
  const request: CreatePracticeTemplateRequestType = {
    title: segment.name,
    practiceAction: segment.action,
    durationDays: segment.days,
    practiceTimePeriods: toPeriods(values, segment),
    suggestedTags: values.tags,
    categories: [],
  };
  if (range) {
    request.frequencyMinDays = range.min;
    request.frequencyMaxDays = range.max;
  }
  if (segment.minutes !== null) request.sessionDurationMinutes = segment.minutes;
  return request;
};

/** 未拆段模版 */
export const toCreateTemplateRequest = (
  values: WizardFormValues,
  opts: Pick<ToRequestOptions, "nameFallback">
): CreatePracticeTemplateRequestType => {
  const [segment] = getEffectiveSegments(values, opts.nameFallback);
  return segmentToTemplateRequest(values, segment as EffectiveSegment);
};

/** 拆段模版 */
export const toBatchCreateTemplateRequest = (
  values: WizardFormValues,
  opts: Pick<ToRequestOptions, "nameFallback">
): BatchCreatePracticeTemplateRequestType => ({
  segments: getEffectiveSegments(values, opts.nameFallback).map((s) =>
    segmentToTemplateRequest(values, s)
  ),
});

export const isTemplateMode = (values: Pick<WizardFormValues, "mode">) =>
  values.mode === WizardMode.template;
