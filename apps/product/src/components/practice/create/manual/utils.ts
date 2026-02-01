import {
  type CreatePracticeRequestType,
  type UpdatePracticeRequestType,
} from "@daodao/api";
import {
  type ExecutionTiming,
  type Frequency,
  mapExecutionTimingToPracticeTimePeriods,
  parseFrequency,
} from "@/constants/practice-form";
import type { ManualPracticeFormValues } from "./schema";

/**
 * 將表單資料轉換成 API 請求格式
 * @param values 表單資料
 * @param isDraft 是否存為草稿，預設為 false
 * @returns API 請求資料
 */
export const convertFormValuesToApiRequest = (
  values: ManualPracticeFormValues,
  isDraft: boolean = false
): CreatePracticeRequestType | UpdatePracticeRequestType => {
  const practiceTimePeriods = values.executionTiming
    ? mapExecutionTimingToPracticeTimePeriods(values.executionTiming as ExecutionTiming[])
    : [];

  const request: Record<string, unknown> = {
    title: values.name,
    isDraft,
  };

  if (values.durationDays) {
    request.durationDays = parseInt(values.durationDays, 10);
  }

  if (values.frequency) {
    const frequency = parseFrequency(values.frequency as Frequency);
    request.frequencyMinDays = frequency.minDays;
    request.frequencyMaxDays = frequency.maxDays;
  }

  if (values.durationMinutes !== undefined) {
    request.sessionDurationMinutes = values.durationMinutes;
  }

  if (values.actionDescription) {
    request.practiceAction = values.actionDescription;
  }

  if (values.startDate) {
    request.startDate = values.startDate;
  }

  if (practiceTimePeriods.length > 0) {
    request.practiceTimePeriods = practiceTimePeriods;
  }

  if (values.tags && values.tags.length > 0) {
    request.tags = values.tags;
  }

  if (values.resources && values.resources.length > 0) {
    request.resources = values.resources.map((resource) => ({
      name: resource.name,
      url: resource.url || undefined,
    }));
  }

  if (values.customTiming) {
    request.otherContext = values.customTiming;
  }

  return request as CreatePracticeRequestType | UpdatePracticeRequestType;
};
